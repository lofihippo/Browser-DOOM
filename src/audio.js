// Audio management module for Browser DOOM
console.log('Initializing audio manager...');

/**
 * Audio context for Web Audio API
 */
let audioContext = null;

/**
 * Master volume control
 */
let masterVolume = 1.0;

/**
 * Music and SFX volume controls
 */
let musicVolume = 0.7;
let sfxVolume = 0.8;

/**
 * Audio state
 */
let isAudioInitialized = false;
let audioEnabled = true;

/**
 * Initialize the audio system
 */
export async function initAudio() {
    try {
        console.log('Initializing audio system...');
        
        // Create audio context
        if (typeof window.AudioContext !== 'undefined') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } else if (typeof window.audioContext !== 'undefined') {
            // Fallback for older browsers
            audioContext = new window.audioContext();
        } else {
            throw new Error('Web Audio API not supported');
        }
        
        // Initialize audio settings
        loadAudioSettings();
        
        isAudioInitialized = true;
        console.log('Audio system initialized successfully');
        
        return true;
    } catch (error) {
        console.error('Failed to initialize audio system:', error);
        showError('Audio Error', 'Could not initialize audio: ' + error.message);
        return false;
    }
}

/**
 * Load saved audio settings
 */
function loadAudioSettings() {
    // In a real implementation, this would read from IDBFS
    console.log('Loading audio settings...');
    
    // For now, use default values
    musicVolume = 0.7;
    sfxVolume = 0.8;
}

/**
 * Save current audio settings
 */
function saveAudioSettings() {
    // In a real implementation, this would write to IDBFS
    console.log('Saving audio settings...');
}

/**
 * Play music (placeholder)
 */
export function playMusic(musicFile) {
    if (!isAudioInitialized || !audioEnabled) return;
    
    console.log(`Playing music: ${musicFile}`);
    
    // In a real implementation, this would:
    // 1. Load the music file
    // 2. Create audio source
    // 3. Set volume and play
}

/**
 * Play sound effect (placeholder)
 */
export function playSfx(sfxFile) {
    if (!isAudioInitialized || !audioEnabled) return;
    
    console.log(`Playing SFX: ${sfxFile}`);
    
    // In a real implementation, this would:
    // 1. Load the SFX file
    // 2. Create audio source
    // 3. Set volume and play
}

/**
 * Stop all audio playback
 */
export function stopAllAudio() {
    if (!isAudioInitialized) return;
    
    console.log('Stopping all audio');
    
    // In a real implementation, this would stop all active audio sources
}

/**
 * Set master volume
 */
export function setMasterVolume(volume) {
    if (volume < 0 || volume > 1) {
        console.warn('Volume must be between 0 and 1');
        return;
    }
    
    masterVolume = volume;
    saveAudioSettings();
    
    console.log(`Master volume set to ${volume}`);
}

/**
 * Set music volume
 */
export function setMusicVolume(volume) {
    if (volume < 0 || volume > 1) {
        console.warn('Volume must be between 0 and 1');
        return;
    }
    
    musicVolume = volume;
    saveAudioSettings();
    
    console.log(`Music volume set to ${volume}`);
}

/**
 * Set SFX volume
 */
export function setSfxVolume(volume) {
    if (volume < 0 || volume > 1) {
        console.warn('Volume must be between 0 and 1');
        return;
    }
    
    sfxVolume = volume;
    saveAudioSettings();
    
    console.log(`SFX volume set to ${volume}`);
}

/**
 * Get current music volume
 */
export function getMusicVolume() {
    return musicVolume;
}

/**
 * Get current SFX volume
 */
export function getSfxVolume() {
    return sfxVolume;
}

/**
 * Enable/disable audio
 */
export function setAudioEnabled(enabled) {
    audioEnabled = enabled;
    
    if (!enabled) {
        stopAllAudio();
    }
    
    console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Check if audio is enabled
 */
export function isAudioEnabled() {
    return audioEnabled;
}

/**
 * Check if audio system is initialized
 */
export function isAudioInitialized() {
    return isAudioInitialized;
}

/**
 * Handle audio context state changes
 */
function handleAudioContextStateChange() {
    if (audioContext) {
        console.log(`Audio context state: ${audioContext.state}`);
        
        // Handle different states
        switch (audioContext.state) {
            case 'suspended':
                console.log('Audio context suspended');
                break;
            case 'running':
                console.log('Audio context running');
                break;
            case 'closed':
                console.log('Audio context closed');
                break;
        }
    }
}

/**
 * Resume audio context if suspended
 */
export async function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        try {
            await audioContext.resume();
            console.log('Audio context resumed');
        } catch (error) {
            console.error('Failed to resume audio context:', error);
        }
    }
}

/**
 * Create a simple tone for testing (placeholder)
 */
export function createTestTone(frequency = 440, duration = 0.1) {
    if (!isAudioInitialized || !audioEnabled) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.error('Failed to create test tone:', error);
    }
}

/**
 * Show audio-related error
 */
function showError(title, message) {
    // This would call the UI module to show an error
    console.error(`${title}: ${message}`);
}