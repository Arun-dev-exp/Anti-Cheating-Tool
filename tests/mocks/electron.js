// Mock electron module for testing outside Electron
module.exports = {
  app: { whenReady: () => Promise.resolve(), on: () => {}, quit: () => {} },
  BrowserWindow: class BrowserWindow {
    constructor() { this.webContents = { send: () => {} }; }
    static getAllWindows() { return []; }
    loadURL() {}
    on() {}
    isDestroyed() { return false; }
  },
  ipcMain: { on: () => {}, handle: () => {} },
  ipcRenderer: { on: () => {}, send: () => {}, removeAllListeners: () => {} },
  contextBridge: { exposeInMainWorld: () => {} },
};
