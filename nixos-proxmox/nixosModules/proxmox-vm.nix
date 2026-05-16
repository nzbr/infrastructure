{ config, lib, meta, pkgs, ... }:
let
  inherit (lib)
    driveNumToName
    flatten
    mkDefault
    mkForce
    mkMerge
    mkOption
    mkIf
    mkImageMediaOverride
    types
    ;
in
{
  options.proxmox-vm = {
    enable = mkOption {
      description = "Enable building an ISO image that can be used to run a VM with this configuration on a proxmox cluster";
      type = types.bool;
      default = meta ? deployment && meta.deployment ? proxmox && meta.deployment.proxmox.enable;
    };
  };

  config =
    let
      cfg = config.proxmox-vm;
    in
    mkIf cfg.enable (
      mkMerge (flatten [
        {
          image.baseName = mkForce "nixos-pve-${config.networking.hostName}";

          isoImage = {
            enable = true;
            compressImage = false;
            squashfsCompression = mkDefault "lz4";
          };

          boot.loader.timeout = mkImageMediaOverride 1;

          nix.settings.experimental-features = [ "nix-command" "flakes" ];

          boot.initrd = {
            kernelModules = [ "virtio" "virtio_scsi" "virtio_pci" ];
            systemd = {
              enable = true;
              emergencyAccess = true;
              extraBin = {
                mkfs-ext4 = "${pkgs.e2fsprogs}/bin/mkfs.ext4";
                blkid = "${pkgs.util-linux}/bin/blkid";
              };
            };
          };

          systemd.enableEmergencyMode = true;

          users.users.root.password = "root";

          system.stateVersion = mkDefault config.system.nixos.release;
        }
        (map
          (disk:
            let
              match = builtins.match "([a-z]+)([0-9]+)" disk.interface;
              interfaceType = builtins.elemAt match 0;
              num = lib.strings.toInt (builtins.elemAt match 1);
              prefix = if interfaceType == "virtio" then "vd" else "sd";
              device = "/dev/${driveNumToName prefix num}";
              fsType = disk.fsType or "ext4";
              escapedDevice = lib.replaceStrings [ "/" ] [ "-" ] (lib.removePrefix "/" device);
              unitName = "format-${escapedDevice}";

              formatUnitScript = pkgs.writeShellScript "format-${escapedDevice}.sh" ''
                if ! blkid ${device} >/dev/null 2>&1; then
                  echo "Formatting ${device} with ${fsType}..."
                  mkfs.${fsType} ${device}
                else
                  echo "${device} is already formatted"
                fi
              '';
            in
            {
              boot.initrd.systemd = {
                storePaths = [
                  formatUnitScript
                ];

                services.${unitName} = {
                  description = "Format ${device} if unformatted";
                  wantedBy = [ "initrd-fs.target" ];
                  requiredBy = [ "initrd-fs.target" ];
                  before = [ "${escapedDevice}.mount" ];
                  after = [ "${escapedDevice}.device" ];
                  path = [ pkgs.e2fsprogs pkgs.util-linux ];
                  serviceConfig = {
                    Type = "oneshot";
                    RemainAfterExit = true;
                    ExecStart = formatUnitScript;
                  };
                };
              };

              fileSystems.${disk.mountPath} = {
                inherit device fsType;
                options = [ "defaults" ];
              };
            }
          )
          (meta.deployment.proxmox.disks or [ ])
        )
      ])
    );
}
