// index.js (ESM version)
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// simulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the browser window
function createWindow() {
  const win = new BrowserWindow({
    show: false, // Hide until fully ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.maximize();  // Maximize to fill screen
  win.show();

  // Load your HTML file
  win.loadFile(path.join(__dirname, '../views/index.html'));
}

// Create window when Electron app is ready
app.whenReady().then(createWindow);

// Handle login logic
ipcMain.handle('login', async (event, { username, password }) => {
  if (username === 'ADMIN' && password === 'ADMIN') {
    return { success: true };
  } else {
    return { success: false };
  }
});
