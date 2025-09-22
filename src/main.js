// Main application file for Browser DOOM
console.log('Initializing Browser DOOM...');

// Global variables
let gameModule = null;
let canvas = null;
let fpsCounter = null;
let lastTime = 0;
let frameCount = 0;
let fps = 0;

// DOM elements
const wadFileInput = document.getElementById('wadFileInput');
const fileDropOverlay = document.getElementById('fileDropOverlay');
const errorPanel = document.getElementById('errorPanel');

// Initialize the application
async function init() {
    try {
        console.log('Starting DOOM initialization...');
        
        // Get DOM elements
        canvas = document.getElementById('gameCanvas');
        fpsCounter = document.getElementById('fpsCounter');
        
        // Set up canvas
        setupCanvas();
        
        // Initialize file system and load assets
        await initFileSystem();
        
        // Load the WASM module
        await loadWasmModule();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start the game loop
        requestAnimationFrame(gameLoop);
        
    } catch (error) {
        console.error('Failed to initialize DOOM:', error);
        showError('Failed to initialize DOOM', error.message);
    }
}

// Set up canvas properties
function setupCanvas() {
    // Set initial canvas size to 1280x720 (16:9 aspect ratio)
    canvas.width = 1280;
    canvas.height = 720;
    
    // Apply CSS scaling for pixel-perfect rendering
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Set up fullscreen functionality
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
}

// Initialize file system with IDBFS
async function initFileSystem() {
    console.log('Initializing file system...');
    
    try {
        // Create persistent directory
        FS.mkdir('/persist');
        
        // Mount IDBFS
        FS.mount(IDBFS, {}, '/persist');
        
        // Synchronize with IndexedDB
        await new Promise((resolve, reject) => {
            FS.syncfs(true, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('File system synchronized with IDBFS');
                    resolve();
                }
            });
        });
        
    } catch (error) {
        console.error('Failed to initialize file system:', error);
        throw new Error(`File system initialization failed: ${error.message}`);
    }
}

// Load the WASM module
async function loadWasmModule() {
    console.log('Loading WASM module...');
    
    try {
        // Dynamically load the Emscripten module
        const doomModule = await import('./doom.js');
        
        // Initialize the module with proper configuration
        gameModule = await doomModule.default({
            canvas: canvas,
            print: (text) => console.log('STDOUT:', text),
            printErr: (text) => console.error('STDERR:', text)
        });
        
        // Wait for module to be ready
        await new Promise((resolve) => {
            if (gameModule.calledMain) {
                resolve();
            } else {
                gameModule.onRuntimeInitialized = () => resolve();
            }
        });
        
        console.log('WASM module loaded successfully');
        
    } catch (error) {
        console.error('Failed to load WASM module:', error);
        throw new Error(`WASM module loading failed: ${error.message}`);
    }
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // File input handling
    const loadWadBtn = document.getElementById('loadWadBtn');
    if (loadWadBtn) {
        loadWadBtn.addEventListener('click', () => wadFileInput.click());
    }
    
    // File input change event
    wadFileInput.addEventListener('change', handleWadFileSelect);
    
    // Drag and drop events
    setupDragAndDrop();
    
    // Settings panel
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    if (closeSettings) {
        closeSettings.addEventListener('click', hideSettings);
    }
    
    // Volume controls
    const musicVolume = document.getElementById('musicVolume');
    const sfxVolume = document.getElementById('sfxVolume');
    
    if (musicVolume) {
        musicVolume.addEventListener('input', updateAudioSettings);
    }
    
    if (sfxVolume) {
        sfxVolume.addEventListener('input', updateAudioSettings);
    }
}

// Set up drag and drop functionality
function setupDragAndDrop() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Handle dropped files
    document.body.addEventListener('drop', handleDrop, false);
    
    // Show overlay when dragging over
    document.body.addEventListener('dragenter', () => {
        fileDropOverlay.classList.remove('hidden');
    });
    
    document.body.addEventListener('dragleave', () => {
        fileDropOverlay.classList.add('hidden');
    });
    
    document.body.addEventListener('drop', () => {
        fileDropOverlay.classList.add('hidden');
    });
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleWadFiles(files);
    }
}

// Handle WAD file selection
function handleWadFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        handleWadFiles(files);
    }
    
    // Reset input so same file can be selected again
    event.target.value = '';
}

// Process WAD files
function handleWadFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Only process WAD or PK3 files
        if (file.name.toLowerCase().endsWith('.wad') || 
            file.name.toLowerCase().endsWith('.pk3')) {
            
            processWadFile(file);
        } else {
            console.warn('Skipping non-WAD file:', file.name);
        }
    }
}

// Process individual WAD file
async function processWadFile(file) {
    try {
        console.log('Processing WAD file:', file.name);
        
        // Read the file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        // Write to persistent file system
        FS.writeFile(`/persist/${file.name}`, data);
        
        // Sync with IndexedDB
        await new Promise((resolve, reject) => {
            FS.syncfs(false, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('WAD file saved to persistent storage');
                    resolve();
                }
            });
        });
        
        // Restart game with new WAD
        restartGameWithWad(file.name);
        
    } catch (error) {
        console.error('Failed to process WAD file:', error);
        showError('WAD Processing Error', `Could not load ${file.name}: ${error.message}`);
    }
}

// Restart game with specified WAD
function restartGameWithWad(wadName) {
    // In a real implementation, this would restart the game with the new WAD
    console.log('Restarting game with WAD:', wadName);
    
    // Show success message
    showStatusMessage(`Loaded ${wadName}`);
}

// Update audio settings from UI
function updateAudioSettings() {
    const musicVolume = document.getElementById('musicVolume');
    const sfxVolume = document.getElementById('sfxVolume');
    
    if (gameModule && musicVolume && sfxVolume) {
        // In a real implementation, this would pass settings to the engine
        console.log('Audio settings updated - Music:', musicVolume.value, 'SFX:', sfxVolume.value);
    }
}

// Show settings panel
function showSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        settingsPanel.classList.remove('hidden');
    }
}

// Hide settings panel
function hideSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        settingsPanel.classList.add('hidden');
    }
}

// Show status message
function showStatusMessage(message) {
    // In a real implementation, this would update the UI with status
    console.log('Status:', message);
}

// Show error message
function showError(title, message) {
    if (errorPanel) {
        errorPanel.innerHTML = `
            <div class="error-title">${title}</div>
            <div class="error-message">${message}</div>
        `;
        errorPanel.classList.remove('hidden');
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate FPS
    frameCount++;
    if (timestamp >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (timestamp - lastTime));
        frameCount = 0;
        lastTime = timestamp;
        
        // Update FPS counter
        if (fpsCounter) {
            fpsCounter.textContent = fps;
        }
    }
    
    // In a real implementation, this would call the engine's update/render functions
    // For now we just continue the loop
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);

// Handle window resize
window.addEventListener('resize', () => {
    // In a real implementation, this would adjust canvas size
    console.log('Window resized');
});