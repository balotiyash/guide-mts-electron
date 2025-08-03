/** 
 * File: index.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Main script for Electron application. This script initializes the application and creates the main window.
 * Created on: 13/07/2025
 * Last Modified: 03/08/2025
*/

// Importing required modules from Electron
const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const path = require('path');
const createMenuTemplate = require('./menu.js');
require('dotenv').config();

// Window variable to hold the main application window
let win;

// Disable hardware acceleration for better compatibility. This is useful for applications that do not require GPU acceleration.
app.disableHardwareAcceleration();

// Function to create the main application window
const createWindow = () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    win = new BrowserWindow({
        // show: false, 
        minWidth: Math.floor(width * 1),
        minHeight: Math.floor(height * 1),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true,
        },
    });

    win.loadFile(path.join(__dirname, 'src/views/index.html'));
    win.maximize();
    win.show();

    // ❌ No menu on startup (login screen)
    // Menu.setApplicationMenu(null);
}

// Event listener for when the application is ready
app.whenReady().then(() => {
    try {
        createWindow();
    } catch (err) {
        console.error('Failed to create window:', err);
    }
});

// After login show the menu
ipcMain.on('show-menu', () => {
    const customMenu = Menu.buildFromTemplate(createMenuTemplate(win));
    Menu.setApplicationMenu(customMenu);
});

// Handle login validation
ipcMain.handle('login', async (event, { username, password }) => {
    return username === process.env.UNAME && password === process.env.PASSWORD
        ? { success: true }
        : { success: false };
});

// Secure page navigation
ipcMain.on('navigate-to', (event, targetPage) => {
    if (win) {
        win.loadFile(path.join(__dirname, 'src/views', targetPage));
    }
});
