{
  description = "A development environment for ocamlbyexample";

  inputs = {
    nixpkgs.url = "github:nix-ocaml/nix-overlays";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages."${system}".extend (self: super: {
          ocamlPackages = super.ocaml-ng.ocamlPackages_5_1;
        });
        ocamlPackages = pkgs.ocamlPackages;
        packages = [
          ocamlPackages.brr
          ocamlPackages.utop
          ocamlPackages.ocamlformat
          ocamlPackages.ocaml
          ocamlPackages.dune
        ];
      in
      {
        formatter = nixpkgs.legacyPackages.x86_64-linux.nixpkgs-fmt;
        defaultPackage = pkgs.stdenv.mkDerivation {
          name = "ocamlbyexample";
          src = ./.;
        };

        devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs.ocamlPackages; [ cppo findlib ];
          buildInputs = with pkgs; [
            packages
            caddy # Local http server
          ];
        };
      }
    );
}
