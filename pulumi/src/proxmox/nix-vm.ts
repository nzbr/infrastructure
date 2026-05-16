import { FileLegacy, VmLegacy } from '@muhlba91/pulumi-proxmoxve';
import { run, Command } from '@pulumi/command/local/index.js';
import {
    ComponentResource,
    type ComponentResourceOptions,
} from '@pulumi/pulumi';
import { basename } from 'node:path';
import { ProxmoxVmReboot } from './reboot.ts'
import { ProxmoxVmShutdown } from './shutdown.ts';
import { type VmLegacyDisk } from '@muhlba91/pulumi-proxmoxve/types/output.js';

export type NixHost = {
    deployment: {
        proxmox: {
            nodeName: string;
            datastoreId: string;
            disks: (VmLegacyDisk & {mountPath?: string, fsType?: string})[];
        };
    };
    drv: string;
    out: string;
    isoFileName: string;
    isoPath: string;
};

export type NixHosts = {
    [name: string]: NixHost;
};

export class NixVM extends ComponentResource {
  public isoNixBuild: Command;
  public isoUpload: FileLegacy;
  public shutdown: ProxmoxVmShutdown;
  public vm: VmLegacy;
  public reboot: ProxmoxVmReboot;

  constructor(name: string, host: NixHost, opts: ComponentResourceOptions) {
    super('pve:nix:vm', name, {}, opts);

    this.isoNixBuild = new Command(
      host.isoFileName,
      {
        create: `nix-build --log-format bar-with-logs --no-link ${host.drv}`,
      },
      { parent: this },
    );
    const isoSourceValidated = this.isoNixBuild.stdout.apply((it) => {
      if (it.trim() !== host.out) {
        throw new Error(
          `Build result does not match expected out path. Expected ${host.out
          } but got ${it.trim()}`,
        );
      }
      return {
        path: host.isoPath,
        fileName: basename(host.out), // has the form <hash>-<name>.iso. Should prevent conflicts
      };
    });

    this.isoUpload = new FileLegacy(
      basename(host.out),
      {
        contentType: 'iso',
        datastoreId: host.deployment.proxmox.datastoreId,
        nodeName: host.deployment.proxmox.nodeName,
        sourceFile: isoSourceValidated,
      },
      { parent: this },
    );

    this.shutdown = new ProxmoxVmShutdown(name, {
      nodeName: host.deployment.proxmox.nodeName,
      vmName: name,
      triggers: [this.isoNixBuild.stdout]
    }, {
      parent: this,
      dependsOn: [
        this.isoUpload // Shutdown _after_ the ISO has been uploaded to reduce downtime
      ]
    })

    const configFromNix = host.deployment.proxmox as Partial<typeof host.deployment.proxmox>;
    delete configFromNix.datastoreId;
    configFromNix.disks = configFromNix.disks?.map(it => {
      delete it.mountPath;
      delete it.fsType;
      return it;
    }) as VmLegacyDisk[];

    this.vm = new VmLegacy(
      name,
      {
        name,
        agent: {}, // todo: install on guest
        bios: "seabios", // todo: ovmf
        tags: [
          "pulumi",
          "nix"
        ],
        ...host.deployment.proxmox,
        cdrom: {
          fileId: this.isoUpload.id
        },
        bootOrders: [
          "ide3" // cdrom
        ],
        started: false,
      },
      {
        parent: this,
        dependsOn: [
          this.isoUpload,
          this.shutdown,
        ],
      }
    )

    this.reboot = new ProxmoxVmReboot(name, {
      nodeName: host.deployment.proxmox.nodeName,
      vmId: this.vm.id.apply(it => parseInt(it)),
      triggers: [this.isoNixBuild.stdout, this.vm]
    }, {
      parent: this,
      dependsOn: [
        this.vm
      ],
    })
  }
}

export class NixFlake extends ComponentResource {
    vms: { [name: string]: NixVM };

    protected constructor(name: string, opts: ComponentResourceOptions) {
        super('pve:nix', name, {}, opts);

        this.vms = {};
    }

    static async parseNixFlake(path: string, opts: ComponentResourceOptions) {
        const resource = new NixFlake(path, opts);

        const nixExpression = `
        let
          flake = builtins.getFlake (toString ${path});
          lib = flake.inputs.nixpkgs.lib;
          hosts = lib.filterAttrs (n: v: v ? deployment && v.deployment ? proxmox && v.deployment.proxmox ? enable && v.deployment.proxmox.enable) flake.nixosConfigurations;
        in
        lib.mapAttrs
          (n: v: {
            inherit (v) deployment;
            drv = v.config.system.build.isoImage.drvPath;
            out = v.config.system.build.isoImage.outPath;
            isoFileName = v.config.image.fileName;
            isoPath = "\${v.config.system.build.isoImage.outPath}/\${v.config.image.filePath}";
          })
          hosts
      `;
        const runResult = run(
            {
                command: `nix eval --impure --json --expr '${nixExpression}'`,
            },
            { parent: resource },
        );
        const hosts = JSON.parse((await runResult).stdout) as NixHosts;

        for (let key in hosts) {
            resource.vms[key] = new NixVM(key, hosts[key]!, {
                parent: resource,
            });
        }

        return resource;
    }
}
