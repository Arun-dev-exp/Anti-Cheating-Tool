// ─────────────────────────────────────────────────────────────────────────────
// scanner.js — OS-Level Network Monitor
// Module: src/network/
// Owner:  DEV5
//
// Detects if the candidate is making HTTP requests to AI API services during
// an exam session. Resolves blocklisted domains to IPs via DNS, then
// cross-checks against active ESTABLISHED TCP connections via netstat.
// ─────────────────────────────────────────────────────────────────────────────

const dns = require('dns');
const { exec } = require('child_process');
const { EventEmitter } = require('events');
const { NETWORK_SCAN_INTERVAL_MS, NETWORK_BLOCKLIST } = require('../../shared/constants');

class NetworkScanner extends EventEmitter {
  constructor() {
    super();
    this._interval = null;
    this._resolvedIPs = new Map(); // domain → Set<ip>
  }

  // ─── DNS Resolution ──────────────────────────────────────────────────────

  /**
   * Resolve all blocklisted domains to their current IP addresses.
   * Updates the internal _resolvedIPs map.
   * @returns {Promise<void>}
   */
  async _resolveDomains() {
    const promises = NETWORK_BLOCKLIST.map((domain) =>
      new Promise((resolve) => {
        dns.resolve4(domain, (err, addresses) => {
          if (!err && addresses && addresses.length > 0) {
            this._resolvedIPs.set(domain, new Set(addresses));
          }
          resolve(); // Always resolve — silent fail on DNS errors
        });
      })
    );
    await Promise.all(promises);
  }

  // ─── Netstat Parsing ─────────────────────────────────────────────────────

  /**
   * Get the platform-appropriate netstat command.
   * @returns {string}
   */
  _getNetstatCommand() {
    return process.platform === 'win32' ? 'netstat -n' : 'netstat -tn';
  }

  /**
   * Run netstat and return active ESTABLISHED connection IPs.
   * @returns {Promise<Set<string>>} Set of remote IPs with ESTABLISHED connections.
   */
  _getActiveConnections() {
    return new Promise((resolve) => {
      exec(this._getNetstatCommand(), { timeout: 10000 }, (err, stdout) => {
        if (err || !stdout) {
          resolve(new Set()); // Silent fail — never crash the session
          return;
        }

        const activeIPs = new Set();
        const lines = stdout.split('\n');

        for (const line of lines) {
          // Only look at ESTABLISHED connections
          if (!line.includes('ESTABLISHED') && !line.includes('ESTAB')) continue;

          // Extract remote IP from netstat output
          // Windows format: TCP  192.168.1.1:12345  104.18.7.46:443  ESTABLISHED
          // Unix format:    tcp  0  0  192.168.1.1:12345  104.18.7.46:443  ESTABLISHED
          const parts = line.trim().split(/\s+/);

          for (const part of parts) {
            // Match IP:port patterns (IPv4)
            const match = part.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/);
            if (match) {
              activeIPs.add(match[1]);
            }
          }
        }

        resolve(activeIPs);
      });
    });
  }

  // ─── Scan Logic ──────────────────────────────────────────────────────────

  /**
   * Perform a single scan cycle:
   * 1. Resolve blocklisted domains to IPs
   * 2. Get active TCP connections
   * 3. Cross-check for matches
   * 4. Emit 'ai-request-detected' for any matches
   */
  async _scan() {
    try {
      await this._resolveDomains();
      const activeIPs = await this._getActiveConnections();

      if (activeIPs.size === 0) return;

      // 1. IP Check via Netstat
      for (const [domain, ips] of this._resolvedIPs.entries()) {
        for (const ip of ips) {
          if (activeIPs.has(ip)) {
            this.emit('ai-request-detected', {
              domain,
              ip,
              ts: Date.now(),
            });
            return; // One match per scan cycle is enough
          }
        }
      }

      // 2. Window Title Check via PowerShell (Catches CDN-backed AI sites in browser tabs)
      if (process.platform === 'win32') {
        const psCmd = 'powershell "Get-Process | Where-Object MainWindowTitle | Select-Object Name, MainWindowTitle"';
        exec(psCmd, { timeout: 10000 }, (err, stdout) => {
          if (!err && stdout) {
            for (const domain of NETWORK_BLOCKLIST) {
              // Extract the base name (e.g., "claude.ai" -> "claude", "chatgpt.com" -> "chatgpt")
              let baseName = domain.split('.')[0];
              if (baseName === 'api' || baseName === 'chat') {
                baseName = domain.split('.')[1]; // fallback for api.openai.com
              }
              
              if (stdout.toLowerCase().includes(baseName.toLowerCase())) {
                this.emit('ai-request-detected', {
                  domain: `Browser tab: ${domain}`,
                  ip: 'local',
                  ts: Date.now(),
                });
                return;
              }
            }
          }
        });
      }
    } catch (err) {
      // Silent fail — never crash the session
      console.warn('[DEV5:scanner] Scan error (silent):', err.message);
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Start the network scanner. Runs a scan immediately, then every
   * NETWORK_SCAN_INTERVAL_MS (15 seconds).
   */
  start() {
    this._scan(); // Run immediately
    this._interval = setInterval(() => this._scan(), NETWORK_SCAN_INTERVAL_MS);
    console.log('[DEV5:scanner] Network scanner started');
  }

  /**
   * Stop the network scanner and clear resolved IPs.
   */
  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._resolvedIPs.clear();
    console.log('[DEV5:scanner] Network scanner stopped');
  }
}

module.exports = { NetworkScanner };
