import {
  type CustomResourceOptions,
  type Input,
} from '@pulumi/pulumi';
import * as proxmoxApi from '@openprox/proxmox-api';
import { ProxmoxHttpClient } from './api-client.ts';
import { ProxmoxApiAction, ProxmoxVmActionProvider, type UnwrapAll, type ProxmoxApiActionResourceInputs } from './api-action.ts';
import { shutdown, waitForStatus } from './helpers.ts';

export type ProxmoxVmRebootResourceInputs = ProxmoxApiActionResourceInputs & {
  vmId: Input<number>,
  nodeName: Input<string>,
  triggers: Input<any[]>,
};

export type ProxmoxVmRebootInputs = UnwrapAll<ProxmoxVmRebootResourceInputs>;

export class ProxmoxVmRebootProvider extends ProxmoxVmActionProvider<ProxmoxVmRebootInputs, {}> {
  async create(
    inputs: ProxmoxVmRebootInputs,
  ) {
    const proxmox = proxmoxApi.proxmoxApi(new ProxmoxHttpClient(inputs));
    const { nodeName, vmId, timeout } = inputs;

    // Shutdown (if not powered off already)
    await shutdown(proxmox, inputs);

    // Start
    await proxmox.nodes.$(nodeName).qemu.$(vmId).status.start.$post();
    await waitForStatus(proxmox, nodeName, vmId, 'running', timeout);

    return {
      id: `${nodeName}/${vmId}/reboot`,
      outs: {}
    };
  }
}

export class ProxmoxVmReboot extends ProxmoxApiAction<ProxmoxVmRebootResourceInputs, {}> {
  constructor(
    name: string,
    args: ProxmoxVmRebootResourceInputs,
    opts?: CustomResourceOptions,
  ) {
    super(new ProxmoxVmRebootProvider(), 'reboot-vm', name, args, opts);
  }
}
