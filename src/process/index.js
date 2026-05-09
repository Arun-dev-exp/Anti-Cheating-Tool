// src/process/index.js — Module Entry Point

const { startScanner, setWindow } = require('./scanner');

function startProcessScanner(mainWindow) {
  setWindow(mainWindow);
  startScanner();
}

module.exports = { startProcessScanner };
