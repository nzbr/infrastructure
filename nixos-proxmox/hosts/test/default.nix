{ ... }: {
  system = "x86_64-linux";

  deployment.proxmox = {
    enable = true;
    cpu.cores = 16;
    memory.dedicated = "32768";
  };

  modules = [({ config, lib, pkgs, ...}: {
    services.getty.autologinUser = "root";

    # services.displayManager.cosmic-greeter.enable = true;
    # services.desktopManager.cosmic.enable = true;
    # services.displayManager.autoLogin = {
    #   enable = true;
    #   user = "root";
    # };
  })];
}
