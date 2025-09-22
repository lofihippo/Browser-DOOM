// Controls management module for Browser DOOM
console.log('Initializing controls manager...');

/**
 * Default keyboard bindings for DOOM controls
 */
export const DEFAULT_BINDINGS = {
    // Movement
    forward: 'w',
    backward: 's', 
    strafeLeft: 'a',
    strafeRight: 'd',
    
    // Actions
    fire: 'mouse1',
    use: 'e',
    run: 'shift',
    jump: 'space',
    
    // Weapons
    weapon1: '1',
    weapon2: '2',
    weapon3: '3',
    weapon4: '4',
    weapon5: '5',
    
    // Menu
    menu: 'escape',
    
    // Movement speed
    speedUp: 'ctrl'
};

/**
 * Current control bindings
 */
let currentBindings = { ...DEFAULT_BINDINGS };

/**
 * Pointer lock state
 */
let pointerLockEnabled = false;

/**
 * Mouse movement data
 */
let mouseDeltaX = 0;
let mouseDeltaY = 0;

/**
 * Initialize controls system
 */
export function initControls() {
    console.log('Initializing controls system...');
    
    // Load saved bindings if available
    loadSavedBindings();
    
    // Set up event listeners
    setupEventListeners();
    
    return true;
}

/**
 * Set up DOM event listeners for controls
 */
function setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Mouse events
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Pointer lock change events
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mozpointerlockchange', handlePointerLockChange);
    
    // Window blur/focus events
    window.addEventListener('blur', () => {
        // Reset all keys when window loses focus to prevent stuck keys
        resetAllKeys();
    });
}

/**
 * Handle key down events
 */
function handleKeyDown(event) {
    // Prevent default for navigation keys to avoid page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].includes(event.key)) {
        event.preventDefault();
    }
    
    // Process key bindings
    processKeyBinding(event.key.toLowerCase(), true);
}

/**
 * Handle key up events
 */
function handleKeyUp(event) {
    // Process key bindings
    processKeyBinding(event.key.toLowerCase(), false);
}

/**
 * Handle mouse movement events
 */
function handleMouseMove(event) {
    if (pointerLockEnabled) {
        // Only process mouse movement when pointer is locked
        mouseDeltaX = event.movementX || 0;
        mouseDeltaY = event.movementY || 0;
    }
}

/**
 * Handle mouse down events
 */
function handleMouseDown(event) {
    if (event.button === 0) { // Left mouse button
        processKeyBinding('mouse1', true);
    }
}

/**
 * Handle mouse up events
 */
function handleMouseUp(event) {
    if (event.button === 0) { // Left mouse button
        processKeyBinding('mouse1', false);
    }
}

/**
 * Handle pointer lock change events
 */
function handlePointerLockChange() {
    const canvas = document.getElementById('gameCanvas');
    
    if (document.pointerLockElement === canvas || 
        document.mozPointerLockElement === canvas) {
        pointerLockEnabled = true;
        console.log('Pointer lock enabled');
    } else {
        pointerLockEnabled = false;
        console.log('Pointer lock disabled');
    }
}

/**
 * Process a key binding
 */
function processKeyBinding(key, isPressed) {
    // In a real implementation, this would send the input to the game engine
    console.log(`Key ${key} ${isPressed ? 'pressed' : 'released'}`);
    
    // Handle special cases
    if (key === 'f') {
        // Toggle pointer lock on F key press
        togglePointerLock();
    }
}

/**
 * Reset all keys (called when window loses focus)
 */
function resetAllKeys() {
    // In a real implementation, this would reset all key states
    console.log('Resetting all keys');
}

/**
 * Toggle pointer lock for mouse look
 */
export function togglePointerLock() {
    const canvas = document.getElementById('gameCanvas');
    
    if (!pointerLockEnabled) {
        // Request pointer lock
        canvas.requestPointerLock = 
            canvas.requestPointerLock || 
            canvas.mozRequestPointerLock;
            
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    } else {
        // Exit pointer lock
        document.exitPointerLock = 
            document.exitPointerLock || 
            document.mozExitPointerLock;
            
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
}

/**
 * Get current mouse delta for look direction
 */
export function getMouseDelta() {
    return { x: mouseDeltaX, y: mouseDeltaY };
}

/**
 * Reset mouse delta after processing
 */
export function resetMouseDelta() {
    mouseDeltaX = 0;
    mouseDeltaY = 0;
}

/**
 * Get current control binding for a specific action
 */
export function getBinding(action) {
    return currentBindings[action] || null;
}

/**
 * Set a control binding
 */
export function setBinding(action, key) {
    currentBindings[action] = key;
    
    // Save to persistent storage
    saveBindings();
}

/**
 * Load saved bindings from persistent storage
 */
function loadSavedBindings() {
    try {
        // In a real implementation, this would read from IDBFS
        console.log('Loading saved bindings...');
        
        // For now, just use defaults
        return true;
    } catch (error) {
        console.error('Failed to load saved bindings:', error);
        return false;
    }
}

/**
 * Save current bindings to persistent storage
 */
function saveBindings() {
    try {
        // In a real implementation, this would write to IDBFS
        console.log('Saving current bindings...');
        
        return true;
    } catch (error) {
        console.error('Failed to save bindings:', error);
        return false;
    }
}

/**
 * Reset controls to default bindings
 */
export function resetToDefaults() {
    currentBindings = { ...DEFAULT_BINDINGS };
    
    // Save to persistent storage
    saveBindings();
    
    console.log('Controls reset to defaults');
}

/**
 * Get all current bindings
 */
export function getAllBindings() {
    return { ...currentBindings };
}

/**
 * Check if a key is currently pressed
 */
export function isKeyPressed(key) {
    // In a real implementation, this would track key states
    return false;
}

/**
 * Get the current pointer lock state
 */
export function isPointerLocked() {
    return pointerLockEnabled;
}