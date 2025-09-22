// File system management module for Browser DOOM
console.log('Initializing file system manager...');

/**
 * Initialize and synchronize the IDBFS file system
 */
export async function initFileSystem() {
    try {
        // Create persistent directory if it doesn't exist
        if (!FS.lookupPath('/persist', {}).node) {
            FS.mkdir('/persist');
        }
        
        // Mount IDBFS if not already mounted
        const idbfsMount = FS.mount(IDBFS, {}, '/persist');
        if (!idbfsMount) {
            throw new Error('Failed to mount IDBFS');
        }
        
        // Synchronize with IndexedDB
        await new Promise((resolve, reject) => {
            FS.syncfs(true, (err) => {
                if (err) {
                    reject(new Error(`IDBFS sync failed: ${err.message}`));
                } else {
                    console.log('File system synchronized with IDBFS');
                    resolve();
                }
            });
        });
        
        return true;
    } catch (error) {
        console.error('Failed to initialize file system:', error);
        throw new Error(`File system initialization failed: ${error.message}`);
    }
}

/**
 * Save a file to the persistent storage
 * @param {string} filename - Name of the file to save
 * @param {Uint8Array} data - File data as Uint8Array
 */
export async function saveFile(filename, data) {
    try {
        // Write file to persistent storage
        FS.writeFile(`/persist/${filename}`, data);
        
        // Sync with IndexedDB
        await new Promise((resolve, reject) => {
            FS.syncfs(false, (err) => {
                if (err) {
                    reject(new Error(`Failed to sync file ${filename}: ${err.message}`));
                } else {
                    console.log(`File ${filename} saved to persistent storage`);
                    resolve();
                }
            });
        });
        
        return true;
    } catch (error) {
        console.error(`Failed to save file ${filename}:`, error);
        throw new Error(`Save failed: ${error.message}`);
    }
}

/**
 * Load a file from persistent storage
 * @param {string} filename - Name of the file to load
 * @returns {Uint8Array|null} File data or null if not found
 */
export function loadFile(filename) {
    try {
        // Check if file exists
        const path = `/persist/${filename}`;
        if (!FS.analyzePath(path).exists) {
            console.log(`File ${filename} not found in persistent storage`);
            return null;
        }
        
        // Read file data
        const data = FS.readFile(path);
        console.log(`File ${filename} loaded from persistent storage`);
        
        return data;
    } catch (error) {
        console.error(`Failed to load file ${filename}:`, error);
        return null;
    }
}

/**
 * List all files in persistent storage
 * @returns {string[]} Array of filenames
 */
export function listFiles() {
    try {
        const files = [];
        
        // Walk the persistent directory
        FS.readdir('/persist').forEach(entry => {
            if (entry !== '.' && entry !== '..') {
                files.push(entry);
            }
        });
        
        console.log('Files in persistent storage:', files);
        return files;
    } catch (error) {
        console.error('Failed to list files:', error);
        return [];
    }
}

/**
 * Delete a file from persistent storage
 * @param {string} filename - Name of the file to delete
 */
export async function deleteFile(filename) {
    try {
        const path = `/persist/${filename}`;
        
        // Check if file exists
        if (!FS.analyzePath(path).exists) {
            console.log(`File ${filename} not found for deletion`);
            return false;
        }
        
        // Remove file
        FS.unlink(path);
        
        // Sync with IndexedDB
        await new Promise((resolve, reject) => {
            FS.syncfs(false, (err) => {
                if (err) {
                    reject(new Error(`Failed to sync deletion of ${filename}: ${err.message}`));
                } else {
                    console.log(`File ${filename} deleted from persistent storage`);
                    resolve();
                }
            });
        });
        
        return true;
    } catch (error) {
        console.error(`Failed to delete file ${filename}:`, error);
        throw new Error(`Delete failed: ${error.message}`);
    }
}

/**
 * Check if a file exists in persistent storage
 * @param {string} filename - Name of the file to check
 * @returns {boolean} True if file exists, false otherwise
 */
export function fileExists(filename) {
    try {
        const path = `/persist/${filename}`;
        return FS.analyzePath(path).exists;
    } catch (error) {
        console.error(`Error checking file existence for ${filename}:`, error);
        return false;
    }
}

/**
 * Import a WAD file to persistent storage
 * @param {string} filename - Name for the imported file
 * @param {Uint8Array} data - WAD file data
 */
export async function importWad(filename, data) {
    try {
        // Save the WAD file
        await saveFile(filename, data);
        
        console.log(`WAD file ${filename} imported successfully`);
        return true;
    } catch (error) {
        console.error(`Failed to import WAD file ${filename}:`, error);
        throw new Error(`WAD import failed: ${error.message}`);
    }
}

/**
 * Get the path to a persistent file
 * @param {string} filename - Name of the file
 * @returns {string} Full path to the file in persistent storage
 */
export function getPersistentPath(filename) {
    return `/persist/${filename}`;
}

/**
 * Get the path to a bundled asset
 * @param {string} filename - Name of the bundled file
 * @returns {string} Full path to the bundled asset
 */
export function getBundledPath(filename) {
    return `/assets/${filename}`;
}

/**
 * Initialize the file system and check for default assets
 */
export async function initializeFileSystem() {
    try {
        // Initialize IDBFS
        await initFileSystem();
        
        // Check for default assets (like Freedoom)
        const bundledAssets = ['freedoom1.wad'];
        for (const asset of bundledAssets) {
            if (!fileExists(asset)) {
                console.log(`Bundled asset ${asset} not found in persistent storage`);
            } else {
                console.log(`Found bundled asset: ${asset}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Failed to initialize file system:', error);
        throw new Error(`File system initialization failed: ${error.message}`);
    }
}