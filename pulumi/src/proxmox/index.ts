import { ComponentResource } from '@pulumi/pulumi';
import { FileLegacy } from '@muhlba91/pulumi-proxmoxve';
import { NixFlake } from './nix-vm.ts';

const pveComponent = new ComponentResource('pve', 'homelab');

export const flakeComponent = NixFlake.parseNixFlake('../nixos-proxmox', {parent: pveComponent})

// const isoFile = new FileLegacy(
//     'nixos-iso',
//     {
//         contentType: 'iso',
//         datastoreId: 'hoard',
//         nodeName: 'maelstrom',
//         sourceFile: {
//             path: '/nix/store/xppjad5vm3x3nwgnks389wyiz0j7vz2b-nixos-pve-test.iso/iso/nixos-pve-test.iso',
//         },
//     },
//     {
//         parent: component,
//     },
// );
