import * as proxmoxApi from '@openprox/proxmox-api';

type ShutdownArgs = { nodeName: string, vmId?: number, vmName?: string, timeout?: number | undefined };

export async function shutdown(proxmox: ReturnType<typeof proxmoxApi.proxmoxApi>, inputs: object & ShutdownArgs): Promise<number | undefined> {
  let { nodeName, vmId, vmName, timeout } = inputs;

  if (vmId === undefined) {
    if (vmName === undefined) {
      throw new Error("Either vmId or vmName must be provided to shutdown");
    }

    const vms = await proxmox.nodes.$(nodeName).qemu.$get();
    const matchingVms = vms.filter((vm: any) => vm.name === vmName);

    if (matchingVms.length === 0) {
      console.warn(`No VM found with name ${vmName} on node ${nodeName}, skipping shutdown`);
      return undefined;
    }

    if (matchingVms.length > 1) {
      console.warn(`Multiple VMs found with name ${vmName} on node ${nodeName}, skipping shutdown due to ambiguity`);
      return undefined;
    }

    vmId = matchingVms[0].vmid;
  }

  try {
    const status = await proxmox.nodes.$(nodeName).qemu.$(vmId!).status.current.$get();
    if (status.status !== 'stopped') {
      await proxmox.nodes.$(nodeName).qemu.$(vmId!).status.shutdown.$post();
      await waitForStatus(proxmox, nodeName, vmId!, 'stopped', timeout);
    }
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return vmId;
    }
    console.warn(`Shutdown failed for VM ${vmId}, forcing poweroff`);
    try {
      await proxmox.nodes.$(nodeName).qemu.$(vmId!).status.stop.$post();
      await waitForStatus(proxmox, nodeName, vmId!, 'stopped', timeout);
    } catch (e: any) {
      if (e.message?.includes('does not exist')) {
        return vmId;
      }
      console.error(`Force-stop failed for VM ${vmId}`);
      throw e;
    }
  }
  return vmId;
}

export async function waitForStatus(
  proxmox: ReturnType<typeof proxmoxApi.proxmoxApi>,
  nodeName: string,
  vmId: number,
  target: string,
  timeoutSeconds: number = 120,
) {
  const delay = 2000;
  const attempts = Math.ceil((timeoutSeconds * 1000) / delay);
  for (let i = 0; i < attempts; i++) {
    const status = await proxmox.nodes.$(nodeName).qemu.$(vmId).status.current.$get();
    if (status.status === target) return;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error(`Timeout waiting for VM ${vmId} to reach status ${target}`);
}
