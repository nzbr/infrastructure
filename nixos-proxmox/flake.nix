{

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    basement = {
      url = "/home/nzbr/Projekte/nix-prefab/basement";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    story-nixos = {
      url = "/home/nzbr/Projekte/nix-prefab/story-nixos";
      inputs.basement.follows = "basement";
    };
  };

  outputs = inputs: inputs.basement.lib.constructFlake
    { inherit inputs; root = ./.; }
    ({ lib, ... }: {

      systems = [ "x86_64-linux" ];

      prefab.proxmox = {
        defaultNode = "maelstrom";
        defaultDatastore = "hoard";
      };

    });

}
