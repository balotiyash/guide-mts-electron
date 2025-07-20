const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    show: false, // hide until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Maximize to simulate 100vw / 100vh
  win.maximize();
  win.show();

  // Load your HTML file
  win.loadFile(path.join(__dirname, '../views/data_entry.html'));
}

// Create the window when Electron is ready
app.whenReady().then(createWindow);

// Handle login request from renderer process
ipcMain.handle('login', async (event, { username, password }) => {
  if (username === 'ADMIN' && password === 'ADMIN') {
    return { success: true };
  } else {
    return { success: false };
  }
});
