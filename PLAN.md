# Browser DOOM (WASM) Replica - Architecture Plan

## Project Overview
This project will create a browser-based replica of the classic 1993 PC game DOOM using PrBoom+ engine compiled to WebAssembly with Emscripten. The implementation will run fully client-side with keyboard/mouse controls, audio support, save/load functionality, and user-provided WAD loading.

## Technical Approach
- **Engine**: PrBoom+ (chosen for advanced features and better WAD compatibility)
- **Compilation**: Emscripten with SDL2 support
- **Runtime Environment**: WebAssembly in browser with IndexedDB for persistence
- **Controls**: WASD movement, mouse look, keyboard buttons (E/Space = use, Shift = run, number keys = weapon swap)
- **Audio**: SDL_mixer for music and SFX with volume controls
- **File System**: IDBFS for persistent saves and user WADs

## Project Structure
```
/ (root)
  index.html
  /public
    /assets
      freedoom1.wad (or fetch-at-build documented)
    style.css
    icon.png
  /src
    main.js
    ui.js
    fs.js
    controls.js
    audio.js
  /engine
    (PrBoom+ source or submodule)
  /build
    doom.wasm
    doom.js
    doom.data (if needed)
  package.json
  emscripten.config.mjs
  build.sh (or Makefile)
  README.md
  LICENSE
```

## Engine Selection Justification

### Why PrBoom+:
1. **Advanced Features**: Supports modern WAD formats and has better compatibility with community-created content
2. **Active Development**: Regular updates and bug fixes
3. **Performance**: Optimized for modern systems while maintaining compatibility with classic DOOM behavior
4. **Extensibility**: Easier to customize and extend for web-specific features

### Engine Switching Strategy:
The architecture is designed to allow easy switching between engines by:
- Using a consistent interface for engine initialization
- Keeping engine-specific code isolated in separate modules
- Maintaining the same build configuration patterns

## Core Components Architecture

### 1. HTML Structure (index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser DOOM</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    
    <!-- UI Overlay -->
    <div id="uiOverlay">
        <div id="statusBar">FPS: <span id="fpsCounter">0</span></div>
        <div id="controlsPanel">
            <button id="fullscreenBtn">Fullscreen</button>
            <button id="loadWadBtn">Load WAD</button>
            <button id="settingsBtn">Settings</button>
        </div>
        <div id="errorPanel" class="hidden"></div>
        <div id="fileDropOverlay" class="hidden">Drop WAD file here</div>
    </div>

    <!-- File Input for WAD loading -->
    <input type="file" id="wadFileInput" accept=".wad,.pk3" class="hidden">
    
    <!-- Settings Panel -->
    <div id="settingsPanel" class="hidden">
        <h3>Settings</h3>
        <div>
            <label for="musicVolume">Music Volume:</label>
            <input type="range" id="musicVolume" min="0" max="1" step="0.01" value="0.7">
        </div>
        <div>
            <label for="sfxVolume">SFX Volume:</label>
            <input type="range" id="sfxVolume" min="0" max="1" step="0.01" value="0.8">
        </div>
        <button id="closeSettings">Close</button>
    </div>

    <script src="src/main.js"></script>
</body>
</html>
```

### 2. Main Application (main.js)
- Emscripten module initialization
- IDBFS setup and synchronization  
- Game loop integration with browser RAF
- Engine startup sequence with fallback logic:
  1. Check for user WAD in persistent storage
  2. Fall back to bundled freedoom1.wad
  3. Show error UI if neither available

### 3. File System Management (fs.js)
- IDBFS mounting and synchronization
- WAD file import handling with drag-and-drop support
- Save game persistence using IDBFS
- Virtual filesystem operations for engine access

### 4. Controls System (controls.js)
- Default keyboard bindings (WASD, arrows, mouse look, etc.)
- Remappable controls UI with persistence
- Pointer lock management for mouse input
- Mouse input handling with raw mouse support

### 5. Audio System (audio.js)
- SDL_mixer integration for music and SFX
- Music/SFX volume controls with persistence
- Audio context management with Web Audio API
- Support for Audio Worklet when available

### 6. User Interface (ui.js)
- Menu system with game states
- File picker and drag-and-drop handlers for WAD loading
- Status indicators and error messages with user feedback
- FPS counter and performance monitoring
</search>

## Build System Design

### Emscripten Compilation Flags:
- `-sUSE_SDL=2` - Enable SDL2 support
- `-sALLOW_MEMORY_GROWTH=1` - Allow dynamic memory allocation
- `-sINITIAL_MEMORY=256MB` - Set initial heap size
- `-sMODULARIZE=1` - Create modularized output
- `-sEXPORT_ES6=1` - Export as ES6 module
- `-sASYNCIFY=0` - Disable asyncify for performance (unless needed)
- `-sUSE_SDL_MIXER=2` - Enable SDL mixer for audio
- `-sAUDIO_WORKLET=1` - Use Audio Worklet API
- `-O3` - Maximum optimization level
- `-flto` - Link-time optimization

### Build Process:
1. Fetch PrBoom+ source code
2. Configure with Emscripten flags
3. Compile to WASM module
4. Package assets and generate build artifacts

### Build Script (build.sh):
```bash
#!/bin/bash
# Fetch PrBoom+ source if not present
if [ ! -d "engine/prboom" ]; then
  git clone https://github.com/coelckers/prboom-plus.git engine/prboom
fi

# Build with Emscripten
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
  -Iengine/prboom/src \
  engine/prboom/src/*.c \
  -o build/doom.js
```

## Key Technical Implementation Details

### 1. WASM Integration
- Use Emscripten's modularize feature to create ES6 module
- Integrate SDL event loop with browser RAF for consistent timing
- Handle engine initialization and cleanup properly
- Synchronize game timing with browser's animation frame for 60 FPS target
- Implement proper error handling and graceful degradation

### 2. File System Handling (IDBFS)
```javascript
// IDBFS initialization pattern:
FS.mkdir('/persist');
FS.mount(IDBFS, {}, '/persist');
FS.syncfs(true, () => {/* ready */});
```

### 3. WAD Loading
```javascript
// On file input or drop:
const data = new Uint8Array(await file.arrayBuffer());
FS.writeFile('/persist/custom.wad', data);
FS.syncfs(false, () => startWith('/persist/custom.wad'));
```

### 4. Start Sequence
1. Check for user WAD in persistent storage
2. Fall back to bundled freedoom1.wad  
3. Show error UI if neither available

### 2. File System Handling (IDBFS)
```javascript
// IDBFS initialization pattern:
FS.mkdir('/persist');
FS.mount(IDBFS, {}, '/persist');
FS.syncfs(true, () => {/* ready */});
```

### 3. WAD Loading
```javascript
// On file input or drop:
const data = new Uint8Array(await file.arrayBuffer());
FS.writeFile('/persist/custom.wad', data);
FS.syncfs(false, () => startWith('/persist/custom.wad'));
```

### 4. Start Sequence
1. Check for user WAD in persistent storage
2. Fall back to bundled freedoom1.wad
3. Show error UI if neither available

### 5. Performance Optimizations
- `-O3` optimization level for maximum performance
- `-flto` (link-time optimization) 
- Disable asyncify unless absolutely necessary
- Lazy loading of assets where possible

## Browser Compatibility & Features

### Supported Browsers:
- Chrome (latest)
- Firefox (latest) 
- Safari (latest)

### Key Features:
- Fullscreen mode toggle
- Pointer lock for mouse look with fallback
- Pixel-perfect scaling at 16:9 aspect ratio
- FPS counter for performance monitoring

## Legal & Licensing Considerations

### Default Assets:
- **Freedoom Phase 1** - Bundled by default with proper attribution
- License: GNU General Public License v3.0

### User WADs:
- Users may load their own legally owned WAD files at runtime
- No proprietary assets are bundled or distributed

## Testing Strategy

### Smoke Tests:
1. Launch with default Freedoom
2. New game creation 
3. Audio functionality (music/SFX)
4. Save/load cycle with page reload
5. Performance verification at 60 FPS
6. Pointer lock functionality and fallback behavior
7. Drag-and-drop WAD loading

### Browser Testing:
- Chrome (latest) - Primary target
- Firefox (latest) - Secondary target  
- Safari (latest) - Tertiary target
- Cross-origin isolation considerations for SharedArrayBuffer if threads are used

### Performance Metrics:
- Target: 60 FPS on mid-range laptops at 720p canvas
- Memory usage ceiling monitoring
- Frame time consistency checks

### Error Handling:
- Missing or incompatible WADs show clear error messages
- Network errors (if any) handled gracefully
- File system access failures properly reported

## Deployment Options

### GitHub Pages:
- Static build deployment with no external dependencies
- Configure proper headers for SharedArrayBuffer if threads are used (optional)
- Use GitHub Actions workflow to automate builds and deployments

### Itch.io:
- Upload static build as a complete package
- Set "run in browser" option for web builds  
- Enable SharedArrayBuffer headers if needed for multithreading support

### Development Server:
- Simple static file server for local development
- npm run dev command to start local server

## Documentation Requirements (README.md)

### Quick Start Guide:
1. Clone repository
2. Run build script: `./build.sh` or `npm run build`
3. Start local server with `npm run dev`
4. Open browser to http://localhost:8080

### Controls Reference:
- Movement: WASD or Arrow Keys
- Mouse Look: Move mouse to look around  
- Action: E/Space = Use, Left Click = Fire
- Run: Shift key
- Weapon Switch: Number keys 1-5
- Menu: Esc key

### Troubleshooting:
- Audio not working: Check browser permissions and audio context state
- WAD loading issues: Ensure file is valid DOOM format
- Performance problems: Try lowering resolution or disabling effects

### Legal Notice:
This project uses Freedoom Phase 1 by default. Users may load their own legally owned WAD files at runtime, but no proprietary assets are bundled.

## Future Enhancements (Non-blocking)

1. **Multithreading**: Add worker threads for better performance (if needed)
2. **Controller Support**: Gamepad API integration for console-style controls
3. **Mobile Optimization**: Touch controls and responsive UI for mobile devices  
4. **Network Play**: Multiplayer support (if desired)
5. **Advanced UI**: Enhanced HUD and menus with better visual design
6. **Save State Management**: More sophisticated save management system

## Tradeoffs and Design Decisions

### Engine Choice: PrBoom+ vs Chocolate Doom
- **PrBoom+** was chosen for its advanced features and better WAD compatibility, which provides a more complete DOOM experience
- **Chocolate Doom** would offer simpler implementation and closer adherence to original behavior, but with less modern feature support
- The architecture is designed to make switching between engines straightforward

### Performance vs Features Balance  
- Prioritized 60 FPS performance on mid-range hardware
- Disabled asyncify to avoid potential performance overhead  
- Used single-threaded approach to avoid COOP/COEP complexity
- Implemented lazy loading where appropriate for asset management

### Browser Compatibility vs Modern Features
- Focused on latest Chrome, Firefox, Safari for best performance
- Used standard Web APIs to avoid dependency bloat
- Included fallback mechanisms where appropriate (pointer lock, etc.)

## Summary

This architecture provides a solid foundation for a browser-based DOOM experience that:
- Runs entirely client-side with no server requirements
- Supports user-provided WAD files through drag-and-drop or file picker  
- Maintains 60 FPS performance on mid-range hardware
- Uses IndexedDB for persistent saves and settings
- Is fully auditable with local code and assets
- Follows modern web development practices while maintaining classic DOOM gameplay

The modular design allows for easy extension and maintenance, with clear separation between engine integration, UI components, file handling, and system services.