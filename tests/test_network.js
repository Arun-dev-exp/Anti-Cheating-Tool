// ─────────────────────────────────────────────────────────────────────────────
// test_network.js — Unit Tests for DEV5 Network Monitor Module
//
// Tests the OS-level network scanner logic WITHOUT requiring Electron.
// Validates DNS resolution, netstat parsing, platform command selection,
// and silent failure behavior.
//
// Run: node tests/test_network.js
// ─────────────────────────────────────────────────────────────────────────────

// ── Mock iohook & electron before any requires ─────────────────────────────
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
const mockIohookPath = require.resolve('./mocks/iohook');
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'iohook') return mockIohookPath;
  if (request === 'electron') return require.resolve('./mocks/electron');
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { EVENTS, NETWORK_BLOCKLIST, NETWORK_SCAN_INTERVAL_MS } = require('../shared/constants');
const { NetworkScanner } = require('../src/network/scanner');

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

// ─── TEST: NetworkScanner exists and has correct API ────────────────────────
section('NetworkScanner — API');

const scanner = new NetworkScanner();

assert(typeof scanner.start === 'function', 'start() is a function');
assert(typeof scanner.stop === 'function', 'stop() is a function');
assert(typeof scanner.on === 'function', 'on() is a function (EventEmitter)');
assert(typeof scanner.emit === 'function', 'emit() is a function (EventEmitter)');

// ─── TEST: Platform command selection ───────────────────────────────────────
section('Platform Command Selection');

// Access the private method via prototype (for testing)
const cmd = scanner._getNetstatCommand();
if (process.platform === 'win32') {
  assert(cmd === 'netstat -n', `Windows command = "netstat -n" (got "${cmd}")`);
} else {
  assert(cmd === 'netstat -tn', `Unix command = "netstat -tn" (got "${cmd}")`);
}

// ─── TEST: EventEmitter emits ai-request-detected ───────────────────────────
section('EventEmitter — ai-request-detected');

let emittedEvent = null;
const testScanner = new NetworkScanner();

testScanner.on('ai-request-detected', (data) => {
  emittedEvent = data;
});

// Manually emit to verify the event flow
testScanner.emit('ai-request-detected', {
  domain: 'api.openai.com',
  ip: '104.18.7.46',
  ts: Date.now(),
});

assert(emittedEvent !== null, 'ai-request-detected event was emitted');
assert(emittedEvent.domain === 'api.openai.com', 'Event contains correct domain');
assert(emittedEvent.ip === '104.18.7.46', 'Event contains correct IP');
assert(typeof emittedEvent.ts === 'number', 'Event contains numeric timestamp');

// ─── TEST: Scanner start/stop lifecycle ─────────────────────────────────────
section('Start/Stop Lifecycle');

const lifecycleScanner = new NetworkScanner();

// Override _scan to prevent actual network calls
lifecycleScanner._scan = async () => {};

lifecycleScanner.start();
assert(lifecycleScanner._interval !== null, 'start() sets interval');

lifecycleScanner.stop();
assert(lifecycleScanner._interval === null, 'stop() clears interval');
assert(lifecycleScanner._resolvedIPs.size === 0, 'stop() clears resolved IPs');

// ─── TEST: Mock netstat parsing — match found ──────────────────────────────
section('Netstat Parsing — AI IP Match');

// Create a scanner and manually inject resolved IPs
const matchScanner = new NetworkScanner();
matchScanner._resolvedIPs.set('api.openai.com', new Set(['104.18.7.46']));

// Mock _getActiveConnections to return a set containing the known IP
const originalGetActive = matchScanner._getActiveConnections.bind(matchScanner);
matchScanner._getActiveConnections = async () => {
  return new Set(['192.168.1.1', '104.18.7.46', '8.8.8.8']);
};

// Mock _resolveDomains to no-op (already have IPs)
matchScanner._resolveDomains = async () => {};

let matchEmitted = false;
matchScanner.on('ai-request-detected', (data) => {
  matchEmitted = true;
  assert(data.domain === 'api.openai.com', `Matched domain = "api.openai.com" (got "${data.domain}")`);
  assert(data.ip === '104.18.7.46', `Matched IP = "104.18.7.46" (got "${data.ip}")`);
});

// Run scan
matchScanner._scan().then(() => {
  assert(matchEmitted === true, 'ai-request-detected emitted when AI IP found in active connections');

  // ─── TEST: Mock netstat parsing — no match ───────────────────────────────
  section('Netstat Parsing — No AI IP Match');

  const cleanScanner = new NetworkScanner();
  cleanScanner._resolvedIPs.set('api.openai.com', new Set(['104.18.7.46']));
  cleanScanner._getActiveConnections = async () => {
    return new Set(['192.168.1.1', '8.8.8.8', '10.0.0.1']);
  };
  cleanScanner._resolveDomains = async () => {};

  let cleanEmitted = false;
  cleanScanner.on('ai-request-detected', () => {
    cleanEmitted = true;
  });

  return cleanScanner._scan().then(() => {
    assert(cleanEmitted === false, 'No event emitted when no AI IP in active connections');
  });

}).then(() => {
  // ─── TEST: Silent failure on netstat error ─────────────────────────────────
  section('Silent Failure');

  const failScanner = new NetworkScanner();
  failScanner._resolveDomains = async () => {};
  failScanner._getActiveConnections = async () => {
    throw new Error('netstat not found');
  };

  let failEmitted = false;
  failScanner.on('ai-request-detected', () => {
    failEmitted = true;
  });

  return failScanner._scan().then(() => {
    assert(failEmitted === false, 'No crash and no event on netstat failure');
  });

}).then(() => {
  // ─── TEST: Module Exports ─────────────────────────────────────────────────
  section('Module Exports');

  const networkIndex = require('../src/network/index');
  assert(typeof networkIndex.startNetworkScanner === 'function', 'startNetworkScanner exported from index.js');
  assert(typeof networkIndex.stopNetworkScanner === 'function', 'stopNetworkScanner exported from index.js');

  // ─── TEST: Module Isolation ───────────────────────────────────────────────
  section('Module Isolation');
  const fs = require('fs');
  const path = require('path');
  const networkDir = path.join(__dirname, '..', 'src', 'network');
  const files = fs.readdirSync(networkDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(networkDir, file), 'utf8');
    assert(!content.includes('src/detection/'), `${file} does not import from src/detection/`);
    assert(!content.includes('src/gaze/'), `${file} does not import from src/gaze/`);
    assert(!content.includes('src/process/'), `${file} does not import from src/process/`);
  }

  // ─── TEST: Constants ──────────────────────────────────────────────────────
  section('Constants');

  assert(EVENTS.NETWORK === 'signal:network', `EVENTS.NETWORK = "signal:network" (got "${EVENTS.NETWORK}")`);
  assert(Array.isArray(NETWORK_BLOCKLIST), 'NETWORK_BLOCKLIST is an array');
  assert(NETWORK_BLOCKLIST.length > 5, `NETWORK_BLOCKLIST has ${NETWORK_BLOCKLIST.length} entries (>5)`);
  assert(NETWORK_BLOCKLIST.includes('api.openai.com'), 'Blocklist includes api.openai.com');
  assert(NETWORK_BLOCKLIST.includes('api.anthropic.com'), 'Blocklist includes api.anthropic.com');
  assert(NETWORK_BLOCKLIST.includes('claude.ai'), 'Blocklist includes claude.ai');
  assert(NETWORK_SCAN_INTERVAL_MS === 15000, `NETWORK_SCAN_INTERVAL_MS = 15000 (got ${NETWORK_SCAN_INTERVAL_MS})`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═'.repeat(50));
  process.exit(failed > 0 ? 1 : 0);

}).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
