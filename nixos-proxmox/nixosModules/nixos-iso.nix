{ lib, modulesPath, ... }:
let
  inherit (lib)
    mkEnableableModule
    ;
in
{
  imports = [
    (mkEnableableModule
      ["isoImage" "enable"]
      "Set up building a live ISO from this configuration"
      [
        "${modulesPath}/image/file-options.nix"
        "${modulesPath}/installer/cd-dvd/iso-image.nix"
      ]
    )
  ];
}
