{ lib, ... }:
let
  inherit (lib)
    mod
  ;
in
rec {
  /**
    Converts a numeric device number to its block device name (e.g. "sd" 0 becomes sda)

    # Inputs

    `prefix`

    : The prefix for the block device name (e.g. "sd" or "nvme0n1")

    `num`

    : The numeric ID of the drive

    # Type

    ```
    find :: String -> Number -> String
    ```
   */
  driveNumToName = prefix: num:
    let
      driveNumToName' = num:
        let
          letters = [ "a" "b" "c" "d" "e" "f" "g" "h" "i" "j" "k" "l" "m" "n" "o" "p" "q" "r" "s" "t" "u" "v" "w" "x" "y" "z" ];
          div = num / 26;
          rem = mod num 26;
        in
        (if div > 0 then driveNumToName' (div - 1) else "") + (builtins.elemAt letters rem);
    in
    "${prefix}${driveNumToName' num}";
}
