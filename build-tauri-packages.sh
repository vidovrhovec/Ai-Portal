#!/usr/bin/env bash
set -euo pipefail

# 1) Ensure frontend packages are installed
npm install --legacy-peer-deps

# 2) Build Next app
npm run build

# 3) Build Tauri Linux package
npm run build:tauri:linux

# 4) Ensure Windows cross-build support available (Linux host)
rustup target add x86_64-pc-windows-gnu || true
if ! command -v x86_64-w64-mingw32-gcc >/dev/null 2>&1; then
  echo "Installing mingw-w64 toolchain for cross-compilation..."
  sudo apt-get update
  sudo apt-get install -y mingw-w64
fi

# 5) Build Tauri Windows package
npm run build:tauri:windows

# 6) Report artifacts
echo "Linux deb bundle: ./src-tauri/target/release/bundle/deb"
echo "Windows exe/bundle: ./src-tauri/target/x86_64-pc-windows-gnu/release"
