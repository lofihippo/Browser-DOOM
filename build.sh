#!/bin/bash

# Build script for Browser DOOM
# This script compiles PrBoom+ to WebAssembly using Emscripten

set -e  # Exit on any error

echo "Starting Browser DOOM build process..."

# Create necessary directories
mkdir -p engine prboom/build build

# Check if Emscripten is installed
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten (emcc) is not installed or not in PATH"
    echo "Please install Emscripten from https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Check if PrBoom+ source exists, clone if not
if [ ! -d "engine/prboom" ]; then
    echo "Cloning PrBoom+ source..."
    git clone https://github.com/coelckers/prboom-plus.git engine/prboom
fi

# Change to prboom directory
cd engine/prboom

# Check if we're on the right branch or tag for WASM compilation
echo "Using PrBoom+ source from: $(git rev-parse HEAD)"

# Return to project root
cd ../..

echo "Compiling PrBoom+ to WebAssembly..."

# Compile with Emscripten
emcc \
    -sUSE_SDL=2 \
    -sALLOW_MEMORY_GROWTH=1 \
    -sINITIAL_MEMORY=256MB \
    -sMODULARIZE=1 \
    -sEXPORT_ES6=1 \
    -sASYNCIFY=0 \
    -sUSE_SDL_MIXER=2 \
    -sAUDIO_WORKLET=1 \
    -O3 \
    -flto \
    --closure 1 \
    -I./engine/prboom/src \
    ./engine/prboom/src/*.c \
    -o build/doom.js

echo "Build completed successfully!"
echo "Generated files:"
ls -la build/

# Copy assets
mkdir -p public/assets
if [ ! -f "public/assets/freedoom1.wad" ]; then
    echo "Note: Freedoom1.wad not found. Please add it to public/assets/ or download from freedoom.org"
fi

echo "Build process finished."