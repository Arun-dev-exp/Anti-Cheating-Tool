# DEV3 — OS Process Scanner PRD
**Owner:** Developer 3  
**Module:** `src/process/`  
**Branch:** `dev3/process`

---

## Your Job in One Sentence
Every 30 seconds, scan the running OS processes, send the list to Gemini, and flag any AI overlay tools (Cluely, ChatGPT desktop, etc.) that a candidate is trying to hide.

---

## Files You Own

```
src/process/
├── scanner.js      ← OS process list collector (cross-platform)
├── gemini.js       ← Gemini API client + categorisation
└── index.js        ← Entry point — exports startScanner()
```

**Do not create files outside this folder.**  
**Do not import from `src/detection/` or `src/gaze/`.**

---

## Dependencies

```bash
npm install ps-list        # Cross-platform process list (Windows, macOS, Linux)
npm install node-fetch     # HTTP client for Gemini API calls
```

Also read (never edit):
- `shared/constants.js`
- `shared/types.js`

---

## What to Build

### 1. `scanner.js` — Process List Collector

**Goal:** Get a list of all running process names every 30 seconds and pass them to the Gemini categoriser.

**How it works:**
1. Use `ps-list` to get all running processes
2. Extract just the process names (not PIDs, memory, etc. — only what Gemini needs)
3. Pass the name list to `gemini.js` for categorisation
4. Emit `signal:process` with the result

```js
// scanner.js

const psList = require('ps-list');
const { categoriseProcesses } = require('./gemini');
const { PROCESS_SCAN_INTERVAL_MS, EVENTS } = require('../../shared/constants');
const { ipcMain } = require('electron');

let mainWindow = null;

function setWindow(win) {
  mainWindow = win;
}

async function runScan() {
  try {
    const processes = await psList();
    const names = processes.map(p => p.name).filter(Boolean);

    const result = await categoriseProcesses(names);

    if (result) {
      mainWindow.webContents.send(EVENTS.PROCESS, {
        flagged: result.flagged,
        processName: result.processName || '',
        category: result.category || 'unknown',
        ts: Date.now()
      });
    }
  } catch (err) {
    // Scan failure = silent fail. Don't crash the session.
    console.warn('[DEV3] Process scan failed silently:', err.message);
  }
}

function startScanner() {
  // Run once immediately on session start, then every 30s
  runScan();
  setInterval(runScan, PROCESS_SCAN_INTERVAL_MS);
  console.log('[DEV3] Process scanner started');
}

module.exports = { startScanner, setWindow };
```

---

### 2. `gemini.js` — Gemini API Client

**Goal:** Send the list of process names to Gemini and get back a categorisation — specifically whether any of them look like AI overlay tools.

**Gemini model to use:** `gemini-1.5-flash` (fast, cheap, good enough for this task)

**API key:** Store in an `.env` file as `GEMINI_API_KEY`. Do NOT hardcode it.

```bash
# .env (create this, add to .gitignore immediately)
GEMINI_API_KEY=your_key_here
```

**The prompt to Gemini:**

```
You are a process security analyser. Given a list of running process names from a candidate's computer during a coding interview, identify if any process is an AI assistance tool, overlay app, or cheating aid (e.g. Cluely, ChatGPT desktop, Claude desktop, Copilot overlay, screen OCR tools, invisible AI assistants).

Respond ONLY in valid JSON. No explanation. No markdown.

Format:
{
  "flagged": true or false,
  "processName": "name of flagged process or empty string",
  "category": "ai_overlay | screen_reader | clipboard_ai | unknown"
}

Process list:
[PROCESS_LIST_HERE]
```

```js
// gemini.js

require('dotenv').config();
const fetch = require('node-fetch');

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

const KNOWN_BAD_PROCESSES = [
  'cluely', 'chatgpt', 'claude', 'copilot', 'screensnap',
  'wispr', 'superhuman', 'raycast', 'alfred', 'keystroke pro'
];

function quickLocalCheck(names) {
  // Fast local check before hitting Gemini (saves API calls + works offline)
  const lower = names.map(n => n.toLowerCase());
  for (const bad of KNOWN_BAD_PROCESSES) {
    const match = lower.find(n => n.includes(bad));
    if (match) {
      return {
        flagged: true,
        processName: match,
        category: 'ai_overlay'
      };
    }
  }
  return null;
}

async function categoriseProcesses(processNames) {
  // 1. Quick local check first (no network call needed)
  const localResult = quickLocalCheck(processNames);
  if (localResult) return localResult;

  // 2. If local check passes, sample up to 80 processes for Gemini
  // (don't send 500+ processes — expensive and slow)
  const sample = processNames.slice(0, 80).join('\n');

  const prompt = `You are a process security analyser. Given a list of running process names from a candidate's computer during a coding interview, identify if any process is an AI assistance tool, overlay app, or cheating aid (e.g. Cluely, ChatGPT desktop, Claude desktop, Copilot overlay, screen OCR tools, invisible AI assistants).

Respond ONLY in valid JSON. No explanation. No markdown.

Format:
{"flagged": true or false, "processName": "name of flagged process or empty string", "category": "ai_overlay | screen_reader | clipboard_ai | unknown"}

Process list:
${sample}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 150 }
      }),
      timeout: 8000  // 8 second timeout — don't block the session
    });

    if (!response.ok) {
      console.warn('[DEV3] Gemini API error:', response.status);
      return null; // Silent fail
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return null;

    // Strip markdown fences if Gemini adds them
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (err) {
    console.warn('[DEV3] Gemini call failed silently:', err.message);
    return null; // Always silent fail — never crash the session
  }
}

module.exports = { categoriseProcesses };
```

---

### 3. `index.js` — Module Entry Point

```js
// src/process/index.js

const { startScanner, setWindow } = require('./scanner');

function startProcessScanner(mainWindow) {
  setWindow(mainWindow);
  startScanner();
}

module.exports = { startProcessScanner };
```

---

## Critical: Error Handling Philosophy

Your module is the **most likely to fail** at demo time (network drop, Gemini rate limit, OS permission issue). Build for this:

1. **Every function must have a try/catch**
2. **All failures are silent** — log a warning, return null, never throw
3. **The session MUST continue even if your scanner crashes**
4. **The quick local check is your backup** — it works fully offline

If Gemini is down during the demo, the local `KNOWN_BAD_PROCESSES` list still catches Cluely. That's your safety net.

---

## How DEV4 Wires You In

DEV4 calls your entry point from `main.js` when the session starts:

```js
// main.js (DEV4 writes this — you don't touch it)
ipcMain.on(EVENTS.SESSION_START, (e, data) => {
  startProcessScanner(mainWindow);
});
```

---

## Acceptance Criteria

Before you hand off, these must all be true:

- [ ] `startProcessScanner(mainWindow)` exported from `index.js`
- [ ] Quick local check catches `cluely`, `chatgpt`, `claude` process names without API call
- [ ] `signal:process` emitted with correct payload (see `shared/types.js`)
- [ ] Gemini API key loaded from `.env`, NOT hardcoded
- [ ] `.env` added to `.gitignore` (confirm this personally — do not leak the key)
- [ ] All network failures handled silently — session never crashes
- [ ] Scan runs immediately on session start, then every 30 seconds
- [ ] No imports from `src/detection/` or `src/gaze/`

---

## Test It Yourself

**Test 1 — Local catch:**
Rename any `.exe` or process on your machine temporarily to `cluely` and run the scanner. `flagged: true` should fire without a Gemini call.

**Test 2 — Gemini catch:**
Add a harmless process with an ambiguous name (e.g. `aioverlayhelper`) that your local list wouldn't catch. Check if Gemini correctly identifies it.

**Test 3 — Network down:**
Disconnect WiFi and run the scanner. The session should continue; only a console.warn should appear.

---

## Demo Day Notes

For the live demo, pre-run a script that launches a process named `cluely_helper` in the background. The local check will catch it instantly (no API call = no latency = cleaner demo).

```bash
# demo_setup.sh — run before going on stage
node -e "setInterval(() => {}, 60000)" &  # dummy process
# Rename it or use a tool that spawns a process named "cluely"
```

---

## What NOT to Build

- ❌ Any score calculation — that's DEV1's Bayesian engine
- ❌ Keystroke or gaze detection — that's DEV1 and DEV2
- ❌ Any UI — that's DEV4
- ❌ Electron window or IPC setup — that's DEV4
- ❌ ML model training — out of scope entirely
