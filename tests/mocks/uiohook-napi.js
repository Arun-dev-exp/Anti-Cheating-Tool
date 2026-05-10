// ─────────────────────────────────────────────────────────────────────────────
// Mock uiohook-napi — Replaces the native uiohook-napi module for testing
//
// Provides the same API surface as uiohook-napi but with controllable behaviour.
// Use `uIOhook.simulateKeydown()` to fire synthetic keydown events in tests.
// ─────────────────────────────────────────────────────────────────────────────

const handlers = {};

const uIOhook = {
  on(event, handler) {
    if (!handlers[event]) handlers[event] = [];
    handlers[event].push(handler);
  },

  start() {
    // No-op in test mode
  },

  stop() {
    // No-op in test mode
  },

  // ── Test Helpers ────────────────────────────────────────────────────────
  simulateKeydown(keycode = 65) {
    const event = { keycode, type: 'keydown' };
    if (handlers['keydown']) {
      handlers['keydown'].forEach(fn => fn(event));
    }
  },

  getHandlerCount(event) {
    return (handlers[event] || []).length;
  },

  reset() {
    Object.keys(handlers).forEach(key => delete handlers[key]);
  },
};

module.exports = { uIOhook };
