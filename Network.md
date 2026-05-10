You are implementing a new "Network Monitor" signal module for Sentinel Zero, 
an Electron + Next.js anti-cheating system. Read the existing codebase 
structure carefully before writing any code.

---

## CONTEXT

Sentinel Zero already has 4 detection signals:
- DEV1: Keystroke biometrics → src/detection/
- DEV2: Gaze + liveness → src/gaze/
- DEV3: Process scanner → src/process/
- DEV4: UI + Electron shell → src/app/, main.js, preload.js

All modules communicate ONLY via Electron IPC. Zero direct imports between modules.
The Bayesian risk engine lives in src/detection/bayesian.js and handles scoring.

---

## YOUR TASK

Add a 5th signal: Network Monitor (DEV5)
It detects if the candidate is making HTTP requests to AI APIs 
(ChatGPT, Claude, Gemini, etc.) during an exam session.

---

## FILES TO CREATE

### 1. src/network/scanner.js
OS-level network monitor using Node.js `dns` + `child_process`.

Logic:
- Every 15 seconds, resolve these domains to IPs:
    api.openai.com
    api.anthropic.com
    generativelanguage.googleapis.com
    openrouter.ai
    api.groq.com
    api.mistral.ai
    api.cohere.com
    chat.openai.com
    claude.ai
    copilot.microsoft.com
- Run platform-specific netstat command:
    Windows: netstat -n
    macOS/Linux: netstat -tn
- Cross-check resolved IPs against active ESTABLISHED connections
- If a match is found, emit event: ai-request-detected with { domain, ip, ts }
- Export start(mainWindow) and stop() methods
- Use EventEmitter pattern (same style as existing modules)

### 2. src/network/index.js
- Export startNetworkScanner(mainWindow)
- Internally calls scanner.start()
- On ai-request-detected, send IPC event signal:network to renderer:
    { flagged: true, domain, ip, ts }

---

## FILES TO MODIFY

### 3. main.js
- Import startNetworkScanner from src/network/index.js
- Add Electron session-level request interceptor using:
    session.defaultSession.webRequest.onBeforeRequest()
- Intercept any request whose hostname matches the AI domain list
- On match: cancel the request AND send signal:network to renderer
- Call startNetworkScanner(mainWindow) inside session:start IPC handler
- Call stopNetworkScanner() inside session:end IPC handler

### 4. preload.js
- Add signal:network to the allowed IPC channel whitelist
  (same place signal:process, signal:gaze etc. are listed)

### 5. shared/constants.js
- Add network signal weights:
    SIGNAL_WEIGHTS.network = { penalty: 22, recovery: 1 }
- Add signal:network to IPC_EVENTS object

### 6. src/detection/bayesian.js
- Register a handler for signal:network IPC event
- When flagged: true → call engine.flag('network')
- When flagged: false → call engine.unflag('network')
- Follow exact same pattern as existing signal handlers for 
  signal:process and signal:gaze

---

## FILES TO MODIFY (Frontend/UI)

### 7. src/components/ui/SignalCard (or equivalent)
- Add a new SignalCard for "Network Monitor"
- Icon: 🌐 or a network/wifi icon
- Label: "Network Monitor"
- Description: "Detects API calls to AI services (ChatGPT, Claude, Gemini)"
- Status: driven by signal:network IPC events (same pattern as other cards)

### 8. src/app/(candidate)/consent/page.tsx (or .jsx)
- Add Network Monitor to the list of monitoring modules shown on consent screen
- Label: "Network Activity"
- Description: "Detects requests to AI APIs. No browsing history is recorded."
- Badge: "LOCAL ONLY"

### 9. Zustand store (src/stores/)
- Add networkSignal state: { flagged: false, domain: null, ts: null }
- Add setNetworkSignal(payload) action
- Subscribe to signal:network IPC event and call setNetworkSignal

---

## STRICT RULES — DO NOT VIOLATE

1. NO direct imports between src/network/ and src/detection/ or src/gaze/ or src/process/
   All communication must go through IPC events only.

2. Follow the exact IPC payload shape for signal:network:
   { flagged: boolean, domain: string | null, ts: number }

3. The OS-level scanner must handle all three platforms gracefully:
   - Windows: use netstat -n
   - macOS: use netstat -tn  
   - Linux: use netstat -tn
   Never crash if netstat is unavailable — catch errors silently.

4. The Electron session interceptor (Layer 1) must:
   - Cancel the request (callback({ cancel: true }))
   - AND emit signal:network — both, not just one.

5. Do not modify src/detection/bayesian.js scoring logic or thresholds.
   Only ADD a new ipcMain.on('signal:network', ...) handler following
   the exact same pattern as the existing ones.

6. Add the domain blocklist to shared/constants.js as:
   NETWORK_BLOCKLIST = [ ...domains ]
   Import it in both main.js and src/network/scanner.js.
   Do not hardcode the list in two places.

---

## TESTING

After implementation, add test cases to tests/test_integration.js:

- signal:network exists in IPC_EVENTS constant
- NETWORK_BLOCKLIST exists in shared/constants.js and has > 5 entries
- SIGNAL_WEIGHTS.network has penalty and recovery keys
- src/network/scanner.js exports start and stop functions
- src/network/index.js exports startNetworkScanner
- No cross-module imports in src/network/

Also create tests/test_network.js with:
- Mock netstat output containing a known AI IP → should emit ai-request-detected
- Mock netstat output with no AI IPs → should not emit
- Platform command selection (win32 vs others)
- Silent failure when netstat errors

Expected output: all tests pass with 0 failed.

---

## REFERENCE — Existing IPC signal shape (follow this pattern exactly)

signal:process  →  { flagged: boolean, processName: string, category: string, ts: number }
signal:gaze     →  { offScreen: boolean, durationMs: number, ts: number }
signal:network  →  { flagged: boolean, domain: string | null, ip: string | null, ts: number }

---

## DELIVERABLE CHECKLIST

- [ ] src/network/scanner.js created
- [ ] src/network/index.js created  
- [ ] main.js updated (session interceptor + network scanner wired)
- [ ] preload.js updated (signal:network whitelisted)
- [ ] shared/constants.js updated (NETWORK_BLOCKLIST + SIGNAL_WEIGHTS.network + IPC_EVENTS)
- [ ] src/detection/bayesian.js updated (signal:network handler added)
- [ ] SignalCard updated (Network Monitor card added)
- [ ] Consent page updated (Network Activity module listed)
- [ ] Zustand store updated (networkSignal state added)
- [ ] tests/test_network.js created
- [ ] tests/test_integration.js updated (network assertions added)
- [ ] node tests/test_network.js → 0 failed
- [ ] node tests/test_integration.js → 0 failed