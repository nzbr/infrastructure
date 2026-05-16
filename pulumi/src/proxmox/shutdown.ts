import { type CustomResourceOptions, type Input } from "@pulumi/pulumi";
import * as proxmoxApi from '@openprox/proxmox-api';
import { ProxmoxHttpClient } from './api-client.ts';
import { ProxmoxApiAction, type ProxmoxApiActionResourceInputs, ProxmoxVmActionProvider, type UnwrapAll } from "./api-action.ts";
import { shutdown } from './helpers.ts';

export type ProxmoxVmShutdownResourceInputs = ProxmoxApiActionResourceInputs & {
  vmId?: Input<number>,
  vmName?: Input<string>,
  nodeName: Input<string>,
  triggers: Input<any[]>,
};

export type ProxmoxVmShutdownInputs = UnwrapAll<ProxmoxVmShutdownResourceInputs>;

export class ProxmoxVmShutdownProvider extends ProxmoxVmActionProvider<ProxmoxVmShutdownInputs, {}> {
  async create(inputs: ProxmoxVmShutdownInputs) {
    const proxmox = proxmoxApi.proxmoxApi(new ProxmoxHttpClient(inputs));

    const vmId = await shutdown(proxmox, inputs);

    return {
      id: `${inputs.nodeName}/${vmId ?? inputs.vmName}/shutdown`,
      outs: {}
    }
  }
}

export class ProxmoxVmShutdown extends ProxmoxApiAction<ProxmoxVmShutdownResourceInputs, {}> {
  constructor(
    name: string,
    args: ProxmoxVmShutdownResourceInputs,
    opts?: CustomResourceOptions,
  ) {
    super(new ProxmoxVmShutdownProvider(), 'shutdown-vm', name, args, opts);
  }
}
