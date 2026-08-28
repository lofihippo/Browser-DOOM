# Third-Party Notices & Credits

Browser DOOM is a **thin web shell around other people's work.** Almost everything
that makes this fun to play — the engine, the game data, the music instruments, the
original game design — was built by other people over the last three decades. This
file credits them and records their licenses.

The repository was assembled by **[lofihippo](https://github.com/lofihippo)**, who
wrote only the browser wrapper (`index.html`, `style.css`, `app.js`, `config.js` and
the docs). Everything else listed below is redistributed, unmodified, under its own
license, and remains the work and property of its original authors.

---

## The original game — DOOM, by id Software

DOOM (1993) was created by **id Software** — John Carmack, John Romero, Tom Hall,
Adrian Carmack, Kevin Cloud, Sandy Petersen, Dave Taylor, Bobby Prince and
colleagues. Every source port in existence, including the one bundled here, descends
from the engine id Software wrote and later released as free software in 1997.

**DOOM, its game data, and the DOOM trademark remain the property of id Software /
ZeniMax / Microsoft. This project is not affiliated with, endorsed by, or sponsored
by them.**

### ⚠️ id Software shareware game data IS present in this repository

The prebuilt engine data package `engine/doomgeneric.data` **contains id Software's
DOOM shareware IWAD** (`/doom1.wad`, 4,196,020 bytes — *"DOOM: Knee-Deep in the Dead"*,
episode 1, maps E1M1–E1M9). It arrives baked into the upstream doomgeneric
WebAssembly build and is redistributed here verbatim as part of that build.

- This data is **proprietary to id Software.** It is *not* free or open-source software.
- id distributed it as **shareware** and its own in-game notice states that
  *"DOOM, Knee-Deep in the Dead can be freely distributed"*, with disk vendors
  directed to the accompanying `vendor.doc`. Those original shareware license and
  vendor documents are **not** included in the upstream data package, so this is not
  the complete shareware distribution as id packaged it.
- **It is unused at runtime.** `app.js` deletes `/doom1.wad` from the engine's virtual
  file system before the game starts, so play always uses Freedoom Phase 1 or a WAD
  you supply yourself.

If you fork, redistribute, or host this project, be aware you are also redistributing
that shareware data. To avoid it, strip `/doom1.wad` from `engine/doomgeneric.data`
and update the file-offset manifest in `engine/doomgeneric.js`; nothing in the app
depends on it.

---

## Engine — doomgeneric

- **Project:** [doomgeneric](https://github.com/ozkl/doomgeneric) by **ozkl**
  and contributors.
- **Lineage:** a fork of **LinuxDOOM 1.10**, the original id Software DOOM engine
  source released by id in 1997 under the GPL.
- **License:** **GNU General Public License, version 2 (GPL-2.0)** — full text in
  [`engine/LICENSE`](engine/LICENSE).
- **Form distributed here:** prebuilt WebAssembly/Emscripten binaries obtained from
  the project's published build host (`ozkl.github.io/doomgeneric`), redistributed
  unmodified:

  | File | SHA-256 |
  |---|---|
  | `engine/doomgeneric.js` | `73b56ebd355411d1c05ed29191b7af31e8e4e8d4cf77569180c0eaf18c322ead` |
  | `engine/doomgeneric.wasm` | `2668cef41eff14dfcc308921a5d625193f5b55cb27ff6a0b15d9ac41b8e78db3` |
  | `engine/doomgeneric.data` | `6da402d851c320e8849da0e464635942256283ce4d34b207619f31c31f448a3d` |

### Written offer of source (GPL-2.0 §3)

The engine is distributed here in **binary form only**. The complete corresponding
source code for doomgeneric is available from the upstream project at
**https://github.com/ozkl/doomgeneric**, under GPL-2.0.

These binaries were downloaded prebuilt rather than compiled from a pinned revision,
so this repository cannot identify the exact upstream commit they were produced from.
If you need the corresponding source for *these specific binaries* and upstream does
not suffice, please open an issue on this repository and it will be obtained or the
binaries will be replaced with ones built from an identified revision.

The engine has **not** been modified by this project. It is loaded as an unmodified
third-party binary by `app.js`.

---

## Default game data — Freedoom Phase 1

- **Project:** [Freedoom](https://freedoom.github.io/) — free, libre replacement
  game data for DOOM, built by the **Freedoom contributors** (artists, level
  designers, and musicians who rebuilt an entire DOOM-compatible game from scratch
  so that engines like this one have something legal to play).
- **File:** `public/freedoom1.wad` (Freedoom Phase 1)
  — SHA-256 `7323bcc168c5a45ff10749b339960e98314740a734c30d4b9f3337001f9e703d`
- **License:** modified BSD (3-clause):

```
Copyright (C) 2001-2024
Contributors to the Freedoom project.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.
  * Neither the name of the Freedoom project nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

---

## Music instruments — Gravis Ultrasound patch set

`engine/doomgeneric.data` also bundles the **GUS patch set** (210 `.pat` instrument
files under `/dgguspat/`, plus Timidity configuration files) used to render Doom's
MIDI music.

- **Packaged by:** **Simon Howard (fraggle)** as `dgguspat.zip` (2013), with
  additional configurations credited to **Tom Klok**, **Sebastien Bacquet** and
  **Jaydee**. In the package's own readme fraggle writes: *"I claim no copyright on
  any of this. Anything I have contributed here, I release to the public domain."*
  That dedication covers **his** contributions — the configuration files and scripts.
- **The `.pat` instrument files themselves** carry the notice
  **"Copyright 1992-94 EYE & I Productions, Advanced Gravis"**. They were originally
  distributed with the Gravis Ultrasound sound-card drivers.
- **Status:** these files have been widely redistributed for three decades, but the
  package does **not** include an explicit redistribution grant from Advanced Gravis
  or EYE & I Productions. Their license status should therefore be treated as
  **unclear**, not as free/open. They are included here only because they arrive
  inside the upstream doomgeneric build.

---

## Toolchain

- **[Emscripten](https://emscripten.org/)** — the LLVM-to-WebAssembly toolchain used
  upstream to compile doomgeneric for the browser. MIT / University of Illinois
  NCSA licensed.

---

## Summary of what is whose

| Component | Author | License |
|---|---|---|
| Browser wrapper (`app.js`, `index.html`, `style.css`, `config.js`, docs) | lofihippo | MIT |
| DOOM engine (doomgeneric, LinuxDOOM 1.10 lineage) | ozkl; originally id Software | GPL-2.0 |
| Original DOOM design & the bundled shareware IWAD | id Software | Proprietary (shareware) |
| Freedoom Phase 1 game data | Freedoom contributors | BSD-3-Clause |
| GUS instrument patches | Advanced Gravis / EYE & I Productions; packaged by fraggle | Unclear / public-domain configs |
| Emscripten toolchain | Emscripten contributors | MIT / NCSA |

## User-supplied WADs

Any `.wad` you load through the in-page loader or by drag-and-drop stays **on your
own machine** — it is read locally by the browser and stored in your browser's
IndexedDB. Nothing is uploaded anywhere. Please only load WADs you legally own.
