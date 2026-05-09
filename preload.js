const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sentinelBridge', {
  // UI to Main (Send signals)
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = [
      'session:start',
      'session:end',
      'signal:gaze',
      'signal:liveness'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // Main to UI (Receive signals)
  on: (channel, callback) => {
    const validChannels = [
      'session:start',      // Relayed from main to trigger MediaPipe locally
      'signal:keystroke',
      'signal:score-update',
      'signal:breach',
      'signal:process'
    ];
    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // Remove listener (useful for React component cleanup)
  removeListener: (channel, callback) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
