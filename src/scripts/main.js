/** 
 * File: src/scripts/main.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Main script for Electron application. This script initializes the application and creates the main window.
 * Created on: 13/07/2025
 * Last Modified: 01/09/2025
*/

// Importing required modules & libraries
import { app, BrowserWindow, ipcMain, Menu, screen, dialog } from "electron";
import path from "path";
import createMenuTemplate from "./menu.js";
import { fileURLToPath } from 'url';
import updater from "electron-updater";
const { autoUpdater } = updater;
import log from "electron-log";

// Register IPC handlers
import { registerDbHandler } from "./main/ipc/dbHandler.js";
import  { registerDashboardHandlers } from "./main/ipc/dashboardHandler.js";
import { registerDataEntryHandlers } from "./main/ipc/dataEntryHandler.js";

// Logging the meta information
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

// Getting the current file and directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Window variable to hold the main application window
let win;

// Disable hardware acceleration for better compatibility. This is useful for applications that do not require GPU acceleration.
app.disableHardwareAcceleration();

// Function to create the main application window
const createWindow = () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    win = new BrowserWindow({
        show: false, 
        minWidth: Math.floor(width * 1),
        minHeight: Math.floor(height * 1),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Loading the main application view
    // win.loadFile(path.join(__dirname, '../views/index.html'));
    win.loadFile(path.join(__dirname, '../views/data_entry.html'));
    win.maximize();
    win.show();

    // ❌ No menu on startup (login screen)
    // Menu.setApplicationMenu(null);

    // Check for updates after window is ready
    win.once("ready-to-show", () => {
        console.log("Checking for updates...");
        autoUpdater.checkForUpdatesAndNotify();
    });
}

// Event listener for when the application is ready
app.whenReady().then(() => {
    try {
        registerDbHandler(); // register all db IPC
        registerDashboardHandlers(); // register all dashboard IPC
        registerDataEntryHandlers(); // register all data entry IPC
        createWindow();
    } catch (err) {
        console.error('Failed to create window:', err);
    }
});

// Auto-updater events
autoUpdater.on("update-downloaded", () => {
  // Ask user if they want to install now
  console.log("Update downloaded. Prompting user to install.");
  autoUpdater.quitAndInstall();
});

// After login show the menu
ipcMain.on('show-menu', () => {
    const customMenu = Menu.buildFromTemplate(createMenuTemplate(win));
    Menu.setApplicationMenu(customMenu);
});

// Handle login validation
ipcMain.handle('login', async (event, { username, password }) => {
    return username === 'ADMIN' && password === 'ADMIN'
        ? { success: true }
        : { success: false };
});

// Secure page navigation
ipcMain.on('navigate-to', (event, targetPage) => {
    if (win) {
        // win.loadFile(path.join(__dirname, 'src/views', targetPage));
        win.loadFile(path.join(__dirname, '../views', targetPage));
    }
});

// Show dialog box
ipcMain.handle('show-dialog-box', async (event, { type, title, message, buttons = ['OK'] }) => {
    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow) {
        const result = await dialog.showMessageBox(currentWindow, {
            type, // 'info', 'warning', 'error', 'question', 'none'
            title,
            message,
            buttons,
            defaultId: 0,
            cancelId: 1
        });

        return result.response; // 👈 This gets sent back to renderer
    } else {
        console.error('No focused window to show dialog box.');
        return -1;
    }
});