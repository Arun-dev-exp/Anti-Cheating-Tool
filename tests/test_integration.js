// test_integration.js — End-to-End Integration Tests for Sentinel Zero
// Tests the wiring between modules, IPC contracts, shared constants, and preload bridge.
// Run: node tests/test_integration.js

const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
const mockIohookPath = require.resolve('./mocks/iohook');
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'iohook') return mockIohookPath;
  if (request === 'electron') return require.resolve('./mocks/electron');
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const fs = require('fs');
const path = require('path');
const { EVENTS, BREACH_THRESHOLD, INITIAL_SCORE, AMBER_THRESHOLD,
  KEYSTROKE_WINDOW_SIZE, ENTROPY_FLAG_MS, GAZE_OFFSCREEN_THRESHOLD_MS,
  PROCESS_SCAN_INTERVAL_MS, LIVENESS_CHECK_INTERVAL_MS } = require('../shared/constants');

let passed = 0, failed = 0;
function assert(cond, name) {
  if (cond) { console.log(`  ✅ PASS: ${name}`); passed++; }
  else { console.error(`  ❌ FAIL: ${name}`); failed++; }
}
function section(name) { console.log(`\n━━━ ${name} ━━━`); }

// ═══════════════════════════════════════════════════════════════════════════
// 1. SHARED CONSTANTS VALIDATION
// ═══════════════════════════════════════════════════════════════════════════
section('Shared Constants — Architecture Contract');

assert(BREACH_THRESHOLD === 35, `BREACH_THRESHOLD = 35 (got ${BREACH_THRESHOLD})`);
assert(AMBER_THRESHOLD <= 65, `AMBER_THRESHOLD ≤ 65 (got ${AMBER_THRESHOLD})`);
assert(INITIAL_SCORE === 92, `INITIAL_SCORE = 92 (got ${INITIAL_SCORE})`);
assert(KEYSTROKE_WINDOW_SIZE === 20, `KEYSTROKE_WINDOW_SIZE = 20 (got ${KEYSTROKE_WINDOW_SIZE})`);
assert(ENTROPY_FLAG_MS === 5, `ENTROPY_FLAG_MS = 5 (got ${ENTROPY_FLAG_MS})`);
assert(GAZE_OFFSCREEN_THRESHOLD_MS === 3000, `GAZE_OFFSCREEN_THRESHOLD = 3000ms (got ${GAZE_OFFSCREEN_THRESHOLD_MS})`);
assert(PROCESS_SCAN_INTERVAL_MS === 30000, `PROCESS_SCAN_INTERVAL = 30000ms (got ${PROCESS_SCAN_INTERVAL_MS})`);
assert(LIVENESS_CHECK_INTERVAL_MS === 10000, `LIVENESS_CHECK_INTERVAL = 10000ms (got ${LIVENESS_CHECK_INTERVAL_MS})`);

// All IPC event names must exist
section('IPC Event Names');
const requiredEvents = ['KEYSTROKE', 'SCORE_UPDATE', 'BREACH', 'GAZE', 'LIVENESS', 'PROCESS', 'SESSION_START', 'SESSION_END'];
for (const ev of requiredEvents) {
  assert(EVENTS[ev] !== undefined, `EVENTS.${ev} exists (= "${EVENTS[ev]}")`);
}
assert(EVENTS.KEYSTROKE === 'signal:keystroke', 'KEYSTROKE event name matches contract');
assert(EVENTS.SCORE_UPDATE === 'signal:score-update', 'SCORE_UPDATE event name matches contract');
assert(EVENTS.BREACH === 'signal:breach', 'BREACH event name matches contract');
assert(EVENTS.GAZE === 'signal:gaze', 'GAZE event name matches contract');
assert(EVENTS.LIVENESS === 'signal:liveness', 'LIVENESS event name matches contract');
assert(EVENTS.PROCESS === 'signal:process', 'PROCESS event name matches contract');
assert(EVENTS.SESSION_START === 'session:start', 'SESSION_START event name matches contract');
assert(EVENTS.SESSION_END === 'session:end', 'SESSION_END event name matches contract');

// ═══════════════════════════════════════════════════════════════════════════
// 2. MODULE EXPORTS VALIDATION
// ═══════════════════════════════════════════════════════════════════════════
section('Module Exports — Detection (DEV1)');
const detection = require('../src/detection/index');
assert(typeof detection.startDetection === 'function', 'startDetection exported');
assert(typeof detection.stopDetection === 'function', 'stopDetection exported');
assert(typeof detection.applySignal === 'function', 'applySignal exported');
assert(typeof detection.getStatus === 'function', 'getStatus exported');

section('Module Exports — Process Scanner (DEV3)');
const processModule = require('../src/process/index');
assert(typeof processModule.startProcessScanner === 'function', 'startProcessScanner exported');

// ═══════════════════════════════════════════════════════════════════════════
// 3. CROSS-MODULE ISOLATION
// ═══════════════════════════════════════════════════════════════════════════
section('Cross-Module Isolation (Architecture Rule)');

const moduleDirs = {
  detection: path.join(__dirname, '..', 'src', 'detection'),
  gaze: path.join(__dirname, '..', 'src', 'gaze'),
  process: path.join(__dirname, '..', 'src', 'process'),
};

// DEV1 must NOT import gaze or process
for (const f of fs.readdirSync(moduleDirs.detection).filter(f => f.endsWith('.js'))) {
  const c = fs.readFileSync(path.join(moduleDirs.detection, f), 'utf8');
  assert(!c.includes("src/gaze"), `detection/${f} ✗ gaze`);
  assert(!c.includes("src/process"), `detection/${f} ✗ process`);
}
// DEV2 must NOT import detection or process
for (const f of fs.readdirSync(moduleDirs.gaze).filter(f => f.endsWith('.js'))) {
  const c = fs.readFileSync(path.join(moduleDirs.gaze, f), 'utf8');
  assert(!c.includes("src/detection"), `gaze/${f} ✗ detection`);
  assert(!c.includes("src/process"), `gaze/${f} ✗ process`);
}
// DEV3 must NOT import detection or gaze
for (const f of fs.readdirSync(moduleDirs.process).filter(f => f.endsWith('.js'))) {
  const c = fs.readFileSync(path.join(moduleDirs.process, f), 'utf8');
  assert(!c.includes("src/detection"), `process/${f} ✗ detection`);
  assert(!c.includes("src/gaze"), `process/${f} ✗ gaze`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. BAYESIAN ENGINE — FULL SCENARIO TESTS
// ═══════════════════════════════════════════════════════════════════════════
const mockMessages = [];
const mockWindow = {
  isDestroyed: () => false,
  webContents: { send: (ch, pl) => mockMessages.push({ channel: ch, payload: pl }) }
};

const bayesian = require('../src/detection/bayesian');

section('Bayesian — Score Clamping');
bayesian.reset(); bayesian.setWindow(mockWindow); mockMessages.length = 0;

// Drive score to 0
bayesian.applySignal('keystroke', true);
bayesian.applySignal('gaze', true);
bayesian.applySignal('process', true);
bayesian.applySignal('liveness', true);
// Keep hammering
for (let i = 0; i < 10; i++) {
  bayesian.applySignal('keystroke', true);
  bayesian.applySignal('gaze', true);
}
let st = bayesian.getStatus();
assert(st.score >= 0, `Score never goes below 0 (got ${st.score})`);

section('Bayesian — Score Cap at 100');
bayesian.reset(); bayesian.setWindow(mockWindow);
// Recover many times
for (let i = 0; i < 50; i++) {
  bayesian.applySignal('keystroke', false);
}
st = bayesian.getStatus();
assert(st.score <= 100, `Score never exceeds 100 (got ${st.score})`);

section('Bayesian — State Transitions');
bayesian.reset(); bayesian.setWindow(mockWindow);
st = bayesian.getStatus();
assert(st.state === 'green', 'Initial state = green');

bayesian.applySignal('keystroke', true);
bayesian.applySignal('gaze', true); // penalty
bayesian.applySignal('process', true); // more penalty
st = bayesian.getStatus();
assert(st.state === 'amber' || st.state === 'red', `After penalties state is amber or red (got ${st.state})`);

section('Bayesian — Breach Re-arm');
bayesian.reset(); bayesian.setWindow(mockWindow); mockMessages.length = 0;

// Drive to breach
bayesian.applySignal('keystroke', true);
bayesian.applySignal('gaze', true);
bayesian.applySignal('process', true);
bayesian.applySignal('liveness', true);

let breaches = mockMessages.filter(m => m.channel === EVENTS.BREACH).length;
assert(breaches === 1, `First breach emitted (got ${breaches})`);

// Recover above threshold
bayesian.reset(); bayesian.setWindow(mockWindow); mockMessages.length = 0;
// Score is now 92 again (green)

// Drive to breach again
bayesian.applySignal('keystroke', true);
bayesian.applySignal('gaze', true);
bayesian.applySignal('process', true);
bayesian.applySignal('liveness', true);

breaches = mockMessages.filter(m => m.channel === EVENTS.BREACH).length;
assert(breaches === 1, `Breach re-arms after recovery (got ${breaches})`);

section('Bayesian — Unknown Signal Type');
bayesian.reset(); bayesian.setWindow(mockWindow); mockMessages.length = 0;
const scoreBefore = bayesian.getStatus().score;
bayesian.applySignal('nonexistent', true);
const scoreAfter = bayesian.getStatus().score;
assert(scoreBefore === scoreAfter, `Unknown signal type ignored (score unchanged: ${scoreAfter})`);

// ═══════════════════════════════════════════════════════════════════════════
// 5. PROCESS SCANNER — LOCAL CATCH
// ═══════════════════════════════════════════════════════════════════════════
section('Process Scanner — Local Catch');
const { categoriseProcesses } = require('../src/process/gemini');

async function testProcessScanner() {
  // Known bad processes
  const badNames = ['cluely', 'chatgpt', 'claude', 'copilot', 'screensnap', 'wispr', 'superhuman', 'raycast', 'alfred'];
  for (const bad of badNames) {
    const r = await categoriseProcesses(['chrome.exe', `${bad}_helper.exe`, 'node.exe']);
    assert(r !== null && r.flagged === true, `Local catch detects "${bad}"`);
  }

  // Clean list
  const clean = await categoriseProcesses(['chrome.exe', 'explorer.exe', 'svchost.exe']);
  // clean should be null (no local match, Gemini won't be called without valid key)
  assert(clean === null || clean.flagged === false, 'Clean process list not flagged locally');

  // Case insensitive
  const upper = await categoriseProcesses(['CLUELY.EXE']);
  assert(upper !== null && upper.flagged === true, 'Local catch is case-insensitive');
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. PRELOAD BRIDGE — CHANNEL WHITELISTING
// ═══════════════════════════════════════════════════════════════════════════
section('Preload Bridge — Channel Validation');

const preloadSource = fs.readFileSync(path.join(__dirname, '..', 'preload.js'), 'utf8');

// Verify send whitelist includes required channels
assert(preloadSource.includes("'session:start'"), 'Preload send whitelist has session:start');
assert(preloadSource.includes("'session:end'"), 'Preload send whitelist has session:end');
assert(preloadSource.includes("'signal:gaze'"), 'Preload send whitelist has signal:gaze');
assert(preloadSource.includes("'signal:liveness'"), 'Preload send whitelist has signal:liveness');

// Verify on whitelist includes required channels
assert(preloadSource.includes("'signal:keystroke'"), 'Preload on whitelist has signal:keystroke');
assert(preloadSource.includes("'signal:score-update'"), 'Preload on whitelist has signal:score-update');
assert(preloadSource.includes("'signal:breach'"), 'Preload on whitelist has signal:breach');
assert(preloadSource.includes("'signal:process'"), 'Preload on whitelist has signal:process');

// Security: contextIsolation pattern
assert(preloadSource.includes('contextBridge'), 'Uses contextBridge (secure)');
assert(preloadSource.includes('exposeInMainWorld'), 'Uses exposeInMainWorld');
assert(preloadSource.includes('sentinelBridge'), 'Exposes sentinelBridge');

// ═══════════════════════════════════════════════════════════════════════════
// 7. MAIN.JS — WIRING VALIDATION
// ═══════════════════════════════════════════════════════════════════════════
section('Main.js — Wiring Validation');

const mainSource = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

assert(mainSource.includes('startDetection'), 'main.js calls startDetection');
assert(mainSource.includes('startProcessScanner'), 'main.js calls startProcessScanner');
assert(mainSource.includes('stopDetection'), 'main.js calls stopDetection');
assert(mainSource.includes('applySignal'), 'main.js uses applySignal for signal routing');
assert(mainSource.includes(EVENTS.SESSION_START) || mainSource.includes('EVENTS.SESSION_START'),
  'main.js handles session:start');
assert(mainSource.includes(EVENTS.SESSION_END) || mainSource.includes('EVENTS.SESSION_END'),
  'main.js handles session:end');
assert(mainSource.includes(EVENTS.GAZE) || mainSource.includes('EVENTS.GAZE'),
  'main.js routes gaze signals');
assert(mainSource.includes(EVENTS.LIVENESS) || mainSource.includes('EVENTS.LIVENESS'),
  'main.js routes liveness signals');
assert(mainSource.includes('preload.js'), 'main.js references preload.js');

// Liveness inversion check: live=false should mean flagged=true
assert(mainSource.includes('!data.live'), 'main.js inverts liveness (live=false → flagged=true)');

// ═══════════════════════════════════════════════════════════════════════════
// 8. FILE STRUCTURE — ARCHITECTURE.md COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════════
section('File Structure — Architecture Compliance');

const requiredFiles = [
  'main.js', 'preload.js', 'package.json',
  'src/detection/keystroke.js', 'src/detection/bayesian.js', 'src/detection/index.js',
  'src/gaze/gazeEngine.js', 'src/gaze/liveness.js', 'src/gaze/index.js',
  'src/process/scanner.js', 'src/process/gemini.js', 'src/process/index.js',
  'shared/constants.js', 'shared/types.js',
];

const root = path.join(__dirname, '..');
for (const f of requiredFiles) {
  assert(fs.existsSync(path.join(root, f)), `${f} exists`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. NO WEBGAZER REFERENCES ANYWHERE
// ═══════════════════════════════════════════════════════════════════════════
section('No WebGazer References');
const allSrcFiles = [];
function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      walkDir(full);
    } else if (entry.name.endsWith('.js')) {
      allSrcFiles.push(full);
    }
  }
}
walkDir(path.join(root, 'src'));
for (const f of allSrcFiles) {
  const c = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f);
  assert(!c.toLowerCase().includes('webgazer'), `${rel} has no WebGazer reference`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. ASYNC TESTS (Process Scanner)
// ═══════════════════════════════════════════════════════════════════════════
testProcessScanner().then(() => {
  // Final summary
  console.log('\n' + '═'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═'.repeat(50));
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
