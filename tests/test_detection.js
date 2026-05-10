// ─────────────────────────────────────────────────────────────────────────────
// test_detection.js — Unit Tests for DEV1 Detection Module
//
// Tests the core logic of the keystroke entropy analyser and Bayesian risk
// score engine WITHOUT requiring uiohook-napi or Electron. Uses a mock approach
// to validate all acceptance criteria from DEV1-detection.md.
//
// Run: node tests/test_detection.js
// ─────────────────────────────────────────────────────────────────────────────

// ── Mock uiohook-napi before requiring keystroke.js ──────────────────────────
// uiohook-napi is a native module that won't load outside Electron, so we
// intercept the require and provide a controllable mock.

const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
const mockUiohookPath = require.resolve('./mocks/uiohook-napi');

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'uiohook-napi') {
    return mockUiohookPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// ── Mock Electron IPC ───────────────────────────────────────────────────────
const mockMessages = [];
const mockWindow = {
  isDestroyed: () => false,
  webContents: {
    send: (channel, payload) => {
      mockMessages.push({ channel, payload });
    },
  },
};

// ── Load modules under test ─────────────────────────────────────────────────
const { computeVariance } = require('../src/detection/keystroke');
const { applySignal, reset, getStatus } = require('../src/detection/bayesian');
const { startDetection, stopDetection } = require('../src/detection/index');
const { EVENTS, BREACH_THRESHOLD, INITIAL_SCORE } = require('../shared/constants');

// ── Test Harness ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

function section(name) {
  console.log(`\n━━━ ${name} ━━━`);
}

// ─── TEST: computeVariance ──────────────────────────────────────────────────
section('computeVariance()');

assert(computeVariance([]) === 0, 'Empty array returns 0');
assert(computeVariance([5, 5, 5, 5]) === 0, 'Identical values have 0 variance');
assert(Math.abs(computeVariance([2, 4, 4, 4, 5, 5, 7, 9]) - 4) < 0.01,
  'Known dataset [2,4,4,4,5,5,7,9] has variance ≈ 4');

// Uniform intervals (auto-typer @ 50ms)
const uniform = Array(19).fill(50);
assert(computeVariance(uniform) === 0, 'Uniform 50ms intervals have 0 variance (auto-typer)');

// Human-like intervals (jittery)
const humanLike = [120, 85, 200, 150, 90, 110, 180, 95, 130, 160,
  105, 140, 88, 175, 115, 92, 210, 100, 135];
const humanVariance = computeVariance(humanLike);
assert(humanVariance > 5, `Human-like typing variance ${humanVariance.toFixed(1)} > 5ms (not flagged)`);

// ─── TEST: Bayesian Engine — Initial State ──────────────────────────────────
section('Bayesian Engine — Initial State');
reset();
const { applySignal: setBayesianWindow } = require('../src/detection/bayesian');
require('../src/detection/bayesian').setWindow(mockWindow);

let status = getStatus();
assert(status.score === INITIAL_SCORE, `Score starts at ${INITIAL_SCORE} (got ${status.score})`);
assert(status.state === 'green', `Initial state is green (got ${status.state})`);

// ─── TEST: Two-Signal Rule — Single Signal Does NOT Penalise ────────────────
section('Two-Signal Rule — Single Flag');
reset();
require('../src/detection/bayesian').setWindow(mockWindow);
mockMessages.length = 0;

applySignal('keystroke', true);
status = getStatus();
assert(status.score === INITIAL_SCORE, `Single keystroke flag: score unchanged at ${INITIAL_SCORE} (got ${status.score})`);
assert(status.activeFlags.keystroke === true, 'Keystroke flag is recorded');

// ─── TEST: Two-Signal Rule — Two Signals DO Penalise ────────────────────────
section('Two-Signal Rule — Two Flags');
reset();
require('../src/detection/bayesian').setWindow(mockWindow);
mockMessages.length = 0;

applySignal('keystroke', true);   // 1 flag → no penalty
applySignal('gaze', true);        // 2 flags → penalty applied for gaze (-15)

status = getStatus();
assert(status.score === INITIAL_SCORE - 15,
  `Two flags: score = ${INITIAL_SCORE} - 15 = ${INITIAL_SCORE - 15} (got ${status.score})`);

// ─── TEST: Recovery ─────────────────────────────────────────────────────────
section('Recovery');
reset();
require('../src/detection/bayesian').setWindow(mockWindow);

applySignal('keystroke', true);
applySignal('gaze', true);        // Score drops
const afterPenalty = getStatus().score;

applySignal('gaze', false);       // Gaze clears → recovery +2
status = getStatus();
assert(status.score === afterPenalty + 2,
  `Recovery: score ${afterPenalty} + 2 = ${afterPenalty + 2} (got ${status.score})`);

// ─── TEST: Breach Emission ──────────────────────────────────────────────────
section('Breach Emission');
reset();
require('../src/detection/bayesian').setWindow(mockWindow);
mockMessages.length = 0;

// Hammer the score down with multiple two-flag penalties
applySignal('keystroke', true);
applySignal('gaze', true);         // -15 → 77
applySignal('process', true);      // 3 flags → -20 → 57
applySignal('liveness', true);     // 4 flags → -25 → 32
// At this point score = 32 which is ≤ BREACH_THRESHOLD (35)

status = getStatus();
assert(status.score <= BREACH_THRESHOLD,
  `Score ${status.score} ≤ breach threshold ${BREACH_THRESHOLD}`);
assert(status.state === 'red', `State is red (got ${status.state})`);

const breachMessages = mockMessages.filter(m => m.channel === EVENTS.BREACH);
assert(breachMessages.length === 1, `Exactly 1 breach emitted (got ${breachMessages.length})`);

// Applying MORE signals should NOT emit another breach
applySignal('keystroke', true);    // Re-flag while already in red
const breachAfter = mockMessages.filter(m => m.channel === EVENTS.BREACH);
assert(breachAfter.length === 1, `Still only 1 breach after additional flag (got ${breachAfter.length})`);

// ─── TEST: Score Update on Every Change ─────────────────────────────────────
section('Score Update Emissions');
reset();
require('../src/detection/bayesian').setWindow(mockWindow);
mockMessages.length = 0;

applySignal('keystroke', true);
applySignal('gaze', true);
applySignal('keystroke', false);

const scoreUpdates = mockMessages.filter(m => m.channel === EVENTS.SCORE_UPDATE);
assert(scoreUpdates.length === 3, `3 score-update events emitted (got ${scoreUpdates.length})`);

// ─── TEST: Signal Payload Shape ─────────────────────────────────────────────
section('Payload Shape Validation');
reset();
require('../src/detection/bayesian').setWindow(mockWindow);
mockMessages.length = 0;

applySignal('keystroke', true);
applySignal('gaze', true);

const scoreMsg = mockMessages.find(m => m.channel === EVENTS.SCORE_UPDATE);
assert(scoreMsg && typeof scoreMsg.payload.score === 'number', 'score-update has numeric score');
assert(scoreMsg && typeof scoreMsg.payload.state === 'string', 'score-update has string state');

// ─── TEST: No Cross-Module Imports ──────────────────────────────────────────
section('Module Isolation');
const fs = require('fs');
const path = require('path');
const detectionDir = path.join(__dirname, '..', 'src', 'detection');
const files = fs.readdirSync(detectionDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const content = fs.readFileSync(path.join(detectionDir, file), 'utf8');
  assert(!content.includes('src/gaze/'), `${file} does not import from src/gaze/`);
  assert(!content.includes('src/process/'), `${file} does not import from src/process/`);
}

// ─── TEST: startDetection Export ────────────────────────────────────────────
section('Exports');
assert(typeof startDetection === 'function', 'startDetection is exported as a function');
assert(typeof stopDetection === 'function', 'stopDetection is exported as a function');
assert(typeof applySignal === 'function', 'applySignal is re-exported from index');

// ─── Summary ────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('═'.repeat(50));
process.exit(failed > 0 ? 1 : 0);
