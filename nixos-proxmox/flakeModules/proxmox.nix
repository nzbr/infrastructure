{ config, lib, ... }:
let
  inherit (lib)
    hasPrefix
    mkEnableOption
    mkOption
    ;

  inherit (lib.types)
    anything
    attrsOf
    bool
    listOf
    number
    submodule
    str
    strMatching
    ;
in
{
  options.prefab = {
    proxmox = {
      defaultNode = mkOption {
        description = "Name of the default node in the PVE cluster the nixos configurations are deployed to";
        type = str;
        default = "pve";
      };
      defaultDatastore = mkOption {
        description = "ID of the datastore the ISO images are stored in by default";
        type = str;
        default = "local";
      };
    };
    hosts.entries = mkOption {
      type = attrsOf (submodule ({ ... }: {
        options.deployment.proxmox = mkOption {
          type = submodule ({ ... }: {
            freeformType = attrsOf anything;

            options = {
              enable = mkEnableOption "deploying this configuration to PVE bundles as an ISO";
              nodeName = mkOption {
                description = "Name of the node in the PVE cluster this config should be deployed to";
                type = str;
                default = config.prefab.proxmox.defaultNode;
              };
              datastoreId = mkOption {
                description = "ID of the datastore the NixOS ISO is uploaded to";
                type = str;
                default = config.prefab.proxmox.defaultDatastore;
              };
              operatingSystem.type = mkOption {
                description = "Operating system type ID";
                type = str;
                default = "l26";
              };
              cpu = {
                sockets = mkOption {
                  type = number;
                  default = 1;
                };
                cores = mkOption {
                  type = number;
                  default = 1;
                };
                type = mkOption {
                  type = str;
                  default = "host";
                };
                numa = mkOption {
                  type = bool;
                  default = false;
                };
              };
              vga = {
                type = mkOption {
                  type = str;
                  default = "virtio";
                };
              };
              networkDevices = mkOption {
                type = listOf (submodule ({ ... }: {
                  freeformType = attrsOf anything;
                  options = {
                    bridge = mkOption {
                      type = str;
                      default = "vmbr0";
                    };
                  };
                }));
                default = [{}]; # Add a default network interface
              };
              tags = mkOption {
                type = listOf str;
                default = [ "nix" "pulumi" ];
              };
              disks = mkOption {
                type = listOf (submodule ({ config, ... }: {
                  freeformType = attrsOf anything;

                  options = {
                    interface = mkOption {
                      type = strMatching "(sata|scsi|virtio)[[:digit:]]+";
                    };
                    mountPath = mkOption {
                      type = str;
                    };
                    fsType = mkOption {
                      type = str;
                      default = "ext4";
                    };
                    size = mkOption {
                      type = number;
                    };
                  };
                }));
                default = [];
              };
            };
          });
        };
      }));
    };
  };
}
