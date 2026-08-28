// app.js — Browser DOOM bootstrapper.
// Loads the doomgeneric WASM engine (GPL-2.0, https://github.com/ozkl/doomgeneric),
// wires it to an HTML canvas, bundles Freedoom Phase 1 by default, and lets the
// user load a custom legally-owned IWAD at runtime.

import { ENGINE_PATH, DEFAULT_WAD } from './config.js';

const ENGINE_BASE = ENGINE_PATH; // e.g. 'engine/'

const $ = (id) => document.getElementById(id);

const screens = {
  boot: $('boot'),
  game: $('game'),
  help: $('helpPanel'),
};

const hudFps = $('hudFps');
const hudWad = $('hudWad');
const statusLine = $('statusLine');
const overlay = $('overlay');
const overlayTitle = $('overlayTitle');
const overlayBody = $('overlayBody');
const canvas = $('canvas');

let currentWad = null;              // { name, data: Uint8Array }
let engineRunning = false;
let engineScriptLoaded = false;
let fps = 0, frames = 0, lastT = 0, lastFpsTick = 0;

// ---------------------------------------------------------------------------
// WAD persistence (IndexedDB) — so a user-loaded WAD survives a reload / WAD
// switch, and can be applied before the engine boots.
// ---------------------------------------------------------------------------

const IDB_NAME = 'browser-doom';
const IDB_STORE = 'wads';
const WAD_KEY = 'current';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, val) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  let db;
  try { db = await openDb(); } catch { return null; }
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function idbDel(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// A user WAD stored in IndexedDB is a { name, data: Blob|ArrayBuffer } — rather
// than index a 28MB Blob in the store, store name + bytes as an ArrayBuffer.
async function persistUserWad(wad) {
  // Convert Uint8Array to ArrayBuffer for structured-clone friendly storage.
  const buf = wad.data.buffer.slice(wad.data.byteOffset, wad.data.byteOffset + wad.data.byteLength);
  await idbSet(WAD_KEY, { name: wad.name, buf });
}

async function loadStoredUserWad() {
  const rec = await idbGet(WAD_KEY);
  if (!rec || typeof rec !== 'object' || !rec.name) return null;
  const data = new Uint8Array(rec.buf || rec.data || []);
  try { validateWad(data, rec.name); } catch { return null; }
  return { name: rec.name, data };
}

async function clearStoredUserWad() {
  try { await idbDel(WAD_KEY); } catch (_e) { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Boot / UI helpers
// ---------------------------------------------------------------------------

function setStatus(text, ok = true) {
  if (!statusLine) return;
  statusLine.textContent = text;
  statusLine.classList.toggle('error', !ok);
}

function showScreen(name) {
  for (const [k, el] of Object.entries(screens)) el.classList.toggle('hidden', k !== name);
}

function showOverlay(title, body) {
  overlayTitle.textContent = title;
  overlayBody.textContent = body || '';
  overlay.classList.remove('hidden');
}

function hideOverlay() { overlay.classList.add('hidden'); }

// ---------------------------------------------------------------------------
// WAD handling
// ---------------------------------------------------------------------------

function validateWad(data, name) {
  const head = String.fromCharCode(...data.slice(0, 4));
  if (head !== 'IWAD') {
    if (head === 'PWAD') {
      throw new Error(`"${name}" is a PWAD (a DOOM mod/patch) — load a full IWAD game file instead, then apply the mod from within the game.`);
    }
    throw new Error(`"${name}" is not a DOOM IWAD (missing IWAD header).`);
  }
}

async function loadDefaultWad() {
  const resp = await fetch(DEFAULT_WAD);
  if (!resp.ok) throw new Error(`Failed to fetch ${DEFAULT_WAD} (HTTP ${resp.status})`);
  const buf = await resp.arrayBuffer();
  return new Uint8Array(buf);
}

async function readUserWad(file) {
  const name = file.name;
  const data = new Uint8Array(await file.arrayBuffer());
  validateWad(data, name);
  return { name, data };
}

// Map typical IWAD filenames (case-agnostic) to a canonical lowercased name the
// engine's IWAD table recognises.
const KNOWN_IWADS = new Set([
  'doom2.wad', 'plutonia.wad', 'tnt.wad', 'doom.wad', 'doom1.wad',
  'chex.wad', 'hacx.wad', 'freedm.wad', 'freedoom2.wad', 'freedoom1.wad',
  'heretic.wad', 'heretic1.wad', 'hexen.wad', 'strife1.wad'
]);

function iwadTargetName(name) {
  const lower = String(name || '').toLowerCase();
  // Only pass through names the engine's IWAD table knows. Anything else is
  // installed under DOOM II's commercial name (the most common user IWAD),
  // otherwise Doom cannot auto-detect the file at all.
  return KNOWN_IWADS.has(lower) ? lower : 'doom2.wad';
}

// ---------------------------------------------------------------------------
// Engine bootstrap
// ---------------------------------------------------------------------------
//
// This glue is an older Emscripten build: it reads Module overrides at script
// eval time and auto-calls run()+main() when the script finishes loading. So we
// must fully configure window.Module (including a preRun hook that installs our
// WAD, and a locateFile override) *before* injecting the <script> tag.

function installWadInFs(M, wad) {
  const FS_unlink = M['FS_unlink'];
  const FS_create = M['FS_createDataFile'];
  if (!FS_unlink || !FS_create) {
    throw new Error('Engine file-system hooks unavailable');
  }
  const target = iwadTargetName(wad.name);
  // Defensively clear any other IWAD the engine's data package might provide, so
  // Doom's fixed-order search picks only our WAD.
  const otherIwads = ['doom2.wad', 'plutonia.wad', 'tnt.wad', 'doom.wad',
                      'doom1.wad', 'chex.wad', 'hacx.wad', 'freedm.wad',
                      'freedoom2.wad', 'heretic.wad', 'heretic1.wad',
                      'hexen.wad', 'strife1.wad'];
  for (const n of otherIwads) {
    if (n === target) continue;
    try { FS_unlink('/' + n); } catch (_e) { /* absent */ }
  }
  // Write our WAD under the name Doom's IWAD table recognises.
  const installPath = '/' + target;
  try { FS_unlink(installPath); } catch (_e) { /* absent */ }
  FS_create('/', target, wad.data, true, true, true);
  return target;
}

// Load the engine <script>, which self-runs once window.Module is seeded.
function loadEngineScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${ENGINE_BASE}doomgeneric.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Drop our seed so a subsequent attempt can re-seed and re-inject.
      delete window.Module;
      engineScriptLoaded = false;
      reject(new Error('Failed to load engine script'));
    };
    document.head.appendChild(script);
  });
}

function seedModule(wad) {
  if (window.Module) {
    throw new Error('Engine already loaded; reload the page to switch WADs');
  }
  const base = ENGINE_BASE;
  window.Module = {
    canvas,
    locateFile: (name) => name === 'doomgeneric.data'
      ? `${base}doomgeneric.data`
      : `${base}${name}`,
    print: (t) => console.log('[doom]', t),
    printErr: (t) => console.warn('[doom]', t),
    // onRuntimeInitialized fires after the .data package is loaded and just
    // before main() auto-runs — the right moment to swap in our WAD so Doom's
    // IWAD search finds only it.
    onRuntimeInitialized: () => {
      try { installWadInFs(window.Module, wad); }
      catch (e) { console.error('WAD install failed:', e); }
    },
  };
}

async function ensureEngine() {
  if (engineScriptLoaded) return window.Module;
  await loadEngineScript();
  engineScriptLoaded = true;
  return window.Module;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

async function play() {
  if (engineRunning) return;
  showScreen('game');
  setStatus('');

  try {
    let wad = currentWad;
    if (!wad) {
      // Prefer a user-persisted WAD, else default to bundled Freedoom Phase 1.
      wad = await loadStoredUserWad();
      if (wad) {
        currentWad = wad;
      } else {
        const data = await loadDefaultWad();
        wad = { name: 'freedoom1.wad', data };
        currentWad = wad;
      }
    }
    hudWad.textContent = iwadTargetName(wad.name);
    seedModule(wad);
    await ensureEngine();
    engineRunning = true;
    if (!lastFpsTick) requestAnimationFrame(fpsTick);
  } catch (err) {
    console.error(err);
    setStatus(`Could not start: ${err.message}`, false);
    showScreen('boot');
  }
}

async function loadAndPlay(file) {
  try {
    const wad = await readUserWad(file);
    currentWad = wad;
    setStatus(`Loaded ${wad.name}`);
    // Persist so the engine can apply it before main() on the next boot.
    await persistUserWad(wad);
    if (engineRunning || window.Module) {
      // Engine already booted with a fixed WAD; reload to apply the new one.
      location.reload();
      return;
    }
    await play();
  } catch (err) {
    setStatus(err.message, false);
  }
}

async function toggleFullscreenAction() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((e) => console.error(e));
  } else {
    document.exitFullscreen();
  }
}

async function resetToFreeDoom() {
  if (window.Module) {
    // Engine already booted; clear + reload so Freedoom is used next cold start.
    await clearStoredUserWad();
    location.reload();
    return;
  }
  await clearStoredUserWad();
  currentWad = null;
  setStatus('Will use bundled Freedoom: Phase 1');
  showActiveWad();
}

// FPS counter (reads the canvas periodically; cheap enough via RAF gating).
function fpsTick(t) {
  if (lastFpsTick) {
    const dt = t - lastFpsTick;
    frames++;
    if (dt >= 1000) {
      fps = Math.round((frames * 1000) / dt);
      frames = 0;
      lastFpsTick = t;
      hudFps.textContent = fps;
    }
  } else {
    lastFpsTick = t;
  }
  if (engineRunning) requestAnimationFrame(fpsTick);
}

// ---------------------------------------------------------------------------
// Wire up
// ---------------------------------------------------------------------------

function showActiveWad() {
  const line = $('activeWadLine');
  if (!line) return;
  loadStoredUserWad().then((w) => {
    line.textContent = w
      ? `Loaded game: ${w.name}`
      : 'Game: Freedoom: Phase 1 (bundled)';
  }).catch(() => {});
}

$('startBtn').addEventListener('click', play);
$('loadWadBtn').addEventListener('click', () => $('wadInput').click());
$('resetWadBtn').addEventListener('click', resetToFreeDoom);
$('wadInput').addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) loadAndPlay(f);
  e.target.value = '';
});
$('fullscreenBtn').addEventListener('click', toggleFullscreenAction);
$('reloadBtn').addEventListener('click', () => location.reload());
$('controlsBtn').addEventListener('click', () => showScreen('help'));
$('helpClose').addEventListener('click', () => showScreen(engineRunning ? 'game' : 'boot'));
$('overlayOk').addEventListener('click', hideOverlay);

// The doomgeneric engine has no mouse input (its porting API is DG_GetKey only),
// so there is nothing to capture the pointer for. Just take keyboard focus.
canvas.addEventListener('click', () => canvas.focus());

// Drag-and-drop a WAD anywhere on the page.
for (const ev of ['dragover', 'drop']) window.addEventListener(ev, (e) => e.preventDefault());
window.addEventListener('drop', (e) => {
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) loadAndPlay(file);
  else setStatus('No file dropped', false);
});

showScreen('boot');
showActiveWad();
