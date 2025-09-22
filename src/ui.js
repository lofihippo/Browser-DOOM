// User interface module for Browser DOOM
console.log('Initializing UI manager...');

/**
 * Initialize the user interface
 */
export function initUI() {
    console.log('Initializing UI...');
    
    // Set up UI event listeners
    setupUIEventListeners();
    
    // Initialize UI components
    initStatusDisplay();
    
    return true;
}

/**
 * Set up event listeners for UI elements
 */
function setupUIEventListeners() {
    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Load WAD button
    const loadWadBtn = document.getElementById('loadWadBtn');
    if (loadWadBtn) {
        loadWadBtn.addEventListener('click', () => {
            document.getElementById('wadFileInput').click();
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsPanel);
    }
    
    // Close settings button
    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) {
        closeSettings.addEventListener('click', hideSettingsPanel);
    }
    
    // File input
    const wadFileInput = document.getElementById('wadFileInput');
    if (wadFileInput) {
        wadFileInput.addEventListener('change', handleWadFileSelect);
    }
}

/**
 * Initialize status display elements
 */
function initStatusDisplay() {
    // Set up FPS counter
    const fpsCounter = document.getElementById('fpsCounter');
    if (fpsCounter) {
        // FPS counter will be updated in the main game loop
    }
    
    // Set up error panel
    const errorPanel = document.getElementById('errorPanel');
    if (errorPanel) {
        // Error panel will be shown when needed
    }
}

/**
 * Show an error message to the user
 */
export function showError(title, message) {
    const errorPanel = document.getElementById('errorPanel');
    
    if (errorPanel) {
        errorPanel.innerHTML = `
            <div class="error-title">${title}</div>
            <div class="error-message">${message}</div>
        `;
        errorPanel.classList.remove('hidden');
    }
    
    console.error(`${title}: ${message}`);
}

/**
 * Hide the error panel
 */
export function hideError() {
    const errorPanel = document.getElementById('errorPanel');
    
    if (errorPanel) {
        errorPanel.classList.add('hidden');
    }
}

/**
 * Show a status message
 */
export function showStatusMessage(message) {
    console.log('Status:', message);
    
    // In a real implementation, this would update the UI with status
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
        // This would update the status bar with a temporary message
    }
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
            showError('Fullscreen Error', 'Could not enter fullscreen mode');
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * Show the settings panel
 */
function showSettingsPanel() {
    const settingsPanel = document.getElementById('settingsPanel');
    
    if (settingsPanel) {
        settingsPanel.classList.remove('hidden');
        
        // Load current audio settings
        loadAudioSettings();
    }
}

/**
 * Hide the settings panel
 */
function hideSettingsPanel() {
    const settingsPanel = document.getElementById('settingsPanel');
    
    if (settingsPanel) {
        settingsPanel.classList.add('hidden');
    }
}

/**
 * Load audio settings from persistent storage
 */
function loadAudioSettings() {
    // In a real implementation, this would read from IDBFS
    const musicVolume = document.getElementById('musicVolume');
    const sfxVolume = document.getElementById('sfxVolume');
    
    if (musicVolume) {
        // Set to default value for now
        musicVolume.value = 0.7;
    }
    
    if (sfxVolume) {
        // Set to default value for now
        sfxVolume.value = 0.8;
    }
}

/**
 * Handle WAD file selection from input
 */
function handleWadFileSelect(event) {
    const files = event.target.files;
    
    if (files.length > 0) {
        // Process the selected files
        processWadFiles(files);
    }
    
    // Reset input so same file can be selected again
    event.target.value = '';
}

/**
 * Process WAD files (this would be called from main.js)
 */
export function processWadFiles(files) {
    // This is a placeholder - the actual implementation would be in main.js
    console.log('Processing WAD files:', files.length);
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing ${file.name} (${file.size} bytes)`);
        
        // In a real implementation, this would:
        // 1. Validate the file type
        // 2. Read the file data
        // 3. Save to persistent storage via fs.js
        // 4. Restart the game with new WAD
        
        showStatusMessage(`Loaded ${file.name}`);
    }
}

/**
 * Show file drop overlay
 */
export function showFileDropOverlay() {
    const fileDropOverlay = document.getElementById('fileDropOverlay');
    
    if (fileDropOverlay) {
        fileDropOverlay.classList.remove('hidden');
    }
}

/**
 * Hide file drop overlay
 */
export function hideFileDropOverlay() {
    const fileDropOverlay = document.getElementById('fileDropOverlay');
    
    if (fileDropOverlay) {
        fileDropOverlay.classList.add('hidden');
    }
}

/**
 * Update FPS counter display
 */
export function updateFpsCounter(fps) {
    const fpsCounter = document.getElementById('fpsCounter');
    
    if (fpsCounter) {
        fpsCounter.textContent = Math.round(fps);
    }
}

/**
 * Initialize drag and drop functionality
 */
export function initDragAndDrop() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Handle dropped files
    document.body.addEventListener('drop', handleDrop, false);
    
    // Show overlay when dragging over
    document.body.addEventListener('dragenter', showFileDropOverlay);
    
    document.body.addEventListener('dragleave', hideFileDropOverlay);
    
    document.body.addEventListener('drop', hideFileDropOverlay);
}

/**
 * Prevent default drag behaviors
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Handle dropped files
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        processWadFiles(files);
    }
}

/**
 * Show loading indicator
 */
export function showLoadingIndicator(message = 'Loading...') {
    // In a real implementation, this would show a loading spinner or progress bar
    console.log('Loading:', message);
}

/**
 * Hide loading indicator
 */
export function hideLoadingIndicator() {
    // In a real implementation, this would hide the loading spinner
    console.log('Loading complete');
}

/**
 * Update progress indicator
 */
export function updateProgress(percent) {
    // In a real implementation, this would update a progress bar
    console.log(`Progress: ${percent}%`);
}