# Browser DOOM

A playable, fully client-side **DOOM** that runs entirely in your web browser.

It bundles the [doomgeneric](https://github.com/ozkl/doomgeneric) engine compiled
to WebAssembly (a fork of the original LinuxDOOM 1.10 engine) together with
[Freedoom: Phase 1](https://freedoom.github.io/) — a free, libre replacement for
the classic DOOM — so it plays out of the box. You can also load your own
legally-owned `.wad` IWAD at runtime via drag-and-drop or the file picker.

![Screenshot](/docs/screenshot.png)

## Quick Start

This is a static website — no compilation required.

```bash
npm install        # installs the tiny http-server dev dependency (or use any static server)
npm run dev        # serves on http://localhost:8080
```

Then open **http://localhost:8080** in a modern browser (Chrome, Firefox, Edge, Safari).

> Note: the engine and WAD are fetched over HTTP, so serve the folder from a web
> server rather than opening `index.html` directly with `file://`.

## Features

- ✅ **Runs fully client-side** — no backend, no accounts, what you load stays local.
- ✅ **Ready to play** — bundled **Freedoom: Phase 1** (free replacement game data).
- ✅ **Keyboard + mouse controls** — move with WASD/arrows, turn with the mouse.
- ✅ **Runtime WAD loading** — drag-and-drop or pick a `.wad` to play any
  legally-owned IWAD (DOOM, DOOM II, Heretic, Hexen, …).
- ✅ **Persistent game selection** — your chosen WAD is remembered in IndexedDB
  across reloads; "Use Freedoom" restores the bundled default.
- ✅ **Fullscreen toggle** and a lightweight HUD (FPS + current game).
- ✅ **Save / load** via Doom's in-game save menu (persisted in the browser FS).

## Controls

| Action              | Control |
|---------------------|---------|
| Move forward        | `W` / `↑` |
| Move backward       | `S` / `↓` |
| Strafe left / right | `A` / `D`, or `←` / `→` |
| Turn                | Mouse (click canvas to capture) |
| Fire                | Mouse button / `Ctrl` |
| Open / use          | `Space` |
| Run                 | `Shift` |
| Strafe              | `Alt` |
| Map                 | `Tab` |
| Game options        | `F1` |
| Save / load game    | `F2` / `F3` |
| In-game menu        | `Esc` |

> This source port is based on the classic DOOM engine, which turns horizontally:
> there is no vertical mouse-look. It plays the full mission content of whichever
> IWAD you load (Freedoom Phase 1 by default, or your own DOOM/DOOM II etc.).

## Playing a custom WAD

1. Click **Load WAD…** on the start screen, **or** drag any `.wad` file onto
   the window.
2. The game restarts with your WAD. Your selection is saved so it's used next time.
3. Click **Use Freedoom** to return to the bundled default.

- Files are never uploaded — everything runs locally in your browser.
- Full game IWADs (`.wad` with an `IWAD` header) are supported. **PWAD** files
  (mods/patches) and **PK3/ZIP** archives aren't supported by this engine and are
  rejected with a clear message.
- For best results use a retail IWAD named like `doom.wad` / `doom2.wad`; the
  engine auto-detects DOOM, DOOM II, Final Doom, Heretic, Hexen, FreeDM,
  Freedoom, Hacx, Chex Quest, and Strife. Any other filename is treated as DOOM II.

## Project Layout

```
/ 
  index.html          # UI shell (boot / game / help screens)
  style.css           # styling
  app.js              # WAD handling, engine bootstrap, persistence, controls UI
  config.js           # paths to the engine + default WAD
  engine/             # doomgeneric WASM engine (GPL-2.0 prebuilt)
    doomgeneric.js
    doomgeneric.wasm
    doomgeneric.data   # bundled soundfont/audio + shareware base
    LICENSE
  public/
    freedoom1.wad      # default game data (Freedoom Phase 1)
  LICENSE             # MIT license for this wrapper project
  THIRD_PARTY_NOTICES.md
```

## How it works

`app.js` loads `engine/doomgeneric.js` (an Emscripten WebAssembly module) and
wires it to the `<canvas>`. Just before the engine's `main()` auto-runs, the
current game WAD (bundled Freedoom or a user-loaded IWAD persisted in IndexedDB)
is written into the engine's virtual filesystem; the baked-in shareware base is
removed so Doom picks the intended game. Freedoom and any user WADs are never
re-encoded — they're streamed straight into the WASM FS.

## Licensing

- **This wrapper** (HTML/CSS/JS, `app.js`, `config.js`): **MIT** — see `LICENSE`.
- **Engine** (doomgeneric WASM): **GPL-2.0** — see `engine/LICENSE` and the
  [doomgeneric repository](https://github.com/ozkl/doomgeneric).
- **Default game data** (Freedoom Phase 1): permissive BSD-style license.

See **THIRD_PARTY_NOTICES.md** for full details and the Freedom/legal notes.
No proprietary Id Software assets are distributed here; only user-supplied, legally
owned WAD files are ever loaded, and only on the user's own machine.

## Browser compatibility

Tested on modern Chrome, Firefox, Edge and Safari (iOS/Safari run the engine but
internal mouse-capture may differ). A WebGL-capable browser is required for the
SDL2 renderer.
