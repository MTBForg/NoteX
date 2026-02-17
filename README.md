# NoteX

A secure, encrypted desktop note-taking app built with Electron.

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

NoteX is a desktop notes app where every note is encrypted with AES-256-GCM before being written to disk. There is no cloud, no account, no server — your notes exist only on your machine, protected by a master password that is never stored anywhere.

---

## Features

- **AES-256-GCM encryption** — notes are encrypted at rest using a key derived from your master password via PBKDF2
- **Master password login** — password is never stored; used only to derive the encryption key at runtime
- **Reminders** — set date/time reminders on any note with in-app notifications
- **Pin notes** — keep important notes at the top
- **Icons & colors** — 32 icons and 8 color themes to organize notes visually
- **Search** — live search across titles and content
- **Export / Import** — backup notes to JSON and restore on any device
- **Duplicate notes** — clone any note instantly
- **Fully offline** — no network requests, no telemetry

---

## Screenshots

> Add your screenshots here

---

## Installation

### Download

Grab the latest release from the [Releases](../../releases) page:

- **Windows** — `NoteX Setup.exe` (installer) or `NoteX-Portable.exe`
- **macOS** — `NoteX.dmg`
- **Linux** — `NoteX.AppImage` or `NoteX.deb`

### Run from source

```bash
git clone https://github.com/yourusername/notex.git
cd notex
npm install
npm start
```

---

## Build

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Output is in the `dist/` folder.

> Requires Node.js 18+ and the icon file at `assets/icon.ico` (Windows).

---

## How encryption works

1. On first login you choose a master password
2. The app derives a 256-bit key using PBKDF2 (100,000 iterations + random salt)
3. Notes are encrypted with AES-256-GCM and written to `~/.notex_notes.enc`
4. The password is **never stored** — only held in memory during the session
5. On sign out, memory is wiped and the session is destroyed

**If you forget your password, your notes cannot be recovered.** There is no reset, no recovery email, no backdoor. This is intentional.

---

## Data location

| Platform | Path |
|----------|------|
| Windows  | `C:\Users\YourName\.notex_notes.enc` |
| macOS    | `/Users/YourName/.notex_notes.enc` | You will need to build
| Linux    | `/home/yourname/.notex_notes.enc` | You will need to build

Back up this file regularly. It is only readable with your password.

---

## Tech stack

- [Electron](https://www.electronjs.org/)
- [Node.js crypto](https://nodejs.org/api/crypto.html) — AES-256-GCM, PBKDF2
- [Font Awesome](https://fontawesome.com/) — icons
- [uuid](https://github.com/uuidjs/uuid) — note IDs
- Vanilla JS / HTML / CSS — no frontend framework

---

## Project structure

```
notex/
├── main.js          # Electron main process
├── preload.js       # Context bridge — exposes API to renderer
├── renderer.js      # UI logic
├── storage.js       # Encryption and file I/O
├── index.html       # App shell
├── style.css        # Styles
├── assets/
│   └── icon.ico     # App icon
└── package.json
```

---

## License

MIT

---

