# Browser DOOM

A browser-based replica of the classic 1993 PC game DOOM, compiled to WebAssembly using PrBoom+ engine. Run the full DOOM experience directly in your browser with keyboard/mouse controls, audio support, and user-provided WAD loading.

## Features

- ✅ Runs entirely client-side with no server requirements
- ✅ Full keyboard and mouse controls (WASD, arrows, mouse look)
- ✅ Audio support with music and SFX
- ✅ Save/load functionality using IndexedDB persistence
- ✅ Drag-and-drop WAD file loading
- ✅ Default Freedoom Phase 1 support
- ✅ 60 FPS performance on mid-range hardware
- ✅ Fullscreen mode and pixel-perfect scaling
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)

## Quick Start

### Prerequisites
- Node.js and npm installed
- Emscripten SDK (emsdk) for building (optional)

### Running Without Building

For users who want to run Browser DOOM without installing Emscripten:

1. **Download a pre-built version** from the releases page
2. **Extract to a folder**
3. **Install Node.js dependencies**:
```bash
npm install
```
4. **Start the development server**:
```bash
npm run dev
```
5. **Open your browser** to `http://localhost:8080`

### Building from Source (macOS)

If you want to build from source:

1. **Install Xcode Command Line Tools** (if not already installed):
```bash
xcode-select --install
```

2. **Install Emscripten SDK**:
```bash
# Download and install emsdk
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

3. **Clone the repository**:
```bash
git clone https://github.com/yourusername/browser-doom.git
cd browser-doom
```

4. **Install Node.js dependencies**:
```bash
npm install
```

5. **Build the project** (requires Emscripten):
```bash
./build.sh
```

6. **Start the development server**:
```bash
npm run dev
```

7. **Open your browser** to `http://localhost:8080`

### Other Platforms

#### Linux
```bash
# Ubuntu/Debian:
sudo apt install nodejs npm git
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && ./emsdk install latest && ./emsdk activate latest && source ./emsdk_env.sh

# CentOS/RHEL/Fedora:
sudo yum install nodejs npm git
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && ./emsdk install latest && ./emsdk activate latest && source ./emsdk_env.sh
```

#### Windows
1. Install Node.js from nodejs.org
2. Install Git for Windows 
3. Download and install Emscripten SDK from emscripten.org
4. Use Git Bash or PowerShell to run the commands above

## Running Without Building (Pre-compiled)

If you prefer not to compile from source, you can:
1. Download a pre-built version from the releases page
2. Extract to a folder
3. Run `npm install` and `npm run dev`
4. Open your browser to `http://localhost:8080`

## Troubleshooting

### Emscripten Not Found
If you get "command not found" for emcc:
- Make sure to run `source ./emsdk_env.sh` after installing emsdk
- Add this line to your ~/.bashrc or ~/.zshrc: `source /path/to/emsdk_env.sh`

### Permission Denied
If build.sh fails with permission denied:
```bash
chmod +x build.sh
```

### Port Already in Use
If port 8080 is busy:
```bash
npm run dev -- -p 8081
```

## Controls

| Action        | Control         |
|---------------|-----------------|
| Move Forward  | W or Up Arrow   |
| Move Backward | S or Down Arrow |
| Strafe Left   | A or Left Arrow |
| Strafe Right  | D or Right Arrow |
| Turn Left     | Mouse Move      |
| Turn Right    | Mouse Move      |
| Fire          | Left Click      |
| Use           | E or Space      |
| Run           | Shift Key       |
| Jump          | Space           |
| Weapon 1      | 1               |
| Weapon 2      | 2               |
| Weapon 3      | 3               |
| Weapon 4      | 4               |
| Weapon 5      | 5               |
| Menu          | Escape Key      |

## WAD Support

### Default Assets
- **Freedoom Phase 1** is bundled by default (GNU GPL v3.0 license)

### Loading Custom WADs
1. Click the "Load WAD" button or drag-and-drop a `.wad` or `.pk3` file
2. The WAD will be saved to persistent storage and used for the next game session

## Technical Details

### Architecture
- **Engine**: PrBoom+ (advanced DOOM port with modern WAD support)
- **Compilation**: Emscripten with SDL2 and SDL_mixer
- **Runtime**: WebAssembly in browser environment
- **Persistence**: IndexedDB via IDBFS for saves and user WADs

### Build Configuration
- `-O3` optimization level for maximum performance  
- `-flto` (link-time optimization)
- `-sUSE_SDL=2` and `-sUSE_SDL_MIXER=2` for multimedia support
- `-sALLOW_MEMORY_GROWTH=1` for dynamic memory allocation

### Performance Optimizations
- 60 FPS target on mid-range laptops at 720p canvas
- Single-threaded approach to avoid COOP/COEP complexity
- Efficient rendering pipeline with requestAnimationFrame

## File Structure

```
/ (root)
  index.html
  /public
    /assets
      freedoom1.wad (bundled default)
    style.css
    icon.png
  /src
    main.js          # Main application logic
    ui.js            # User interface components  
    fs.js            # File system management (IDBFS)
    controls.js      # Input handling and controls
    audio.js         # Audio system integration
  /engine
    prboom/          # PrBoom+ source code (cloned during build)
  /build
    doom.wasm        # Compiled WebAssembly module
    doom.js          # Emscripten-generated JS glue code
  package.json
  build.sh         # Build script for Emscripten compilation
  README.md
  LICENSE
```

## Browser Compatibility

- **Chrome**: Latest version (recommended)
- **Firefox**: Latest version  
- **Safari**: Latest version

## Troubleshooting

### Audio Issues
If audio isn't working:
1. Check browser permissions for microphone/audio access
2. Ensure the page is not muted in your browser settings
3. Try clicking on the game canvas to resume audio context

### WAD Loading Problems  
If custom WADs aren't loading:
1. Ensure the file is a valid DOOM format (.wad or .pk3)
2. Check browser console for error messages
3. Verify the WAD file isn't corrupted

### Performance Issues
If experiencing low FPS:
1. Try lowering resolution or disabling effects in browser settings
2. Close other tabs to free up system resources
3. Ensure you're using a modern browser

## Legal Notice

This project uses **Freedoom Phase 1** by default, which is licensed under the GNU General Public License v3.0.

Users may load their own legally owned WAD files at runtime, but no proprietary assets are bundled or distributed with this project.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on GitHub.

## License

MIT License - see LICENSE file for details.