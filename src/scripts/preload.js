/** 
 * File: src/scripts/preload.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Preload script for Electron application. This script bridges the main process and renderer process, allowing secure communication.
 * Created on: 13/07/2025
 * Last Modified: 25/08/2025
*/

// Common JS
// Importing required modules from Electron
const { contextBridge, ipcRenderer } = require('electron');

// Importing required modules from Electron
// import { contextBridge, ipcRenderer } from "electron";

// Exposing secure APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    login: (credentials) => ipcRenderer.invoke('login', credentials),
    navigateTo: (page) => ipcRenderer.send('navigate-to', page),
    showMenu: () => ipcRenderer.send('show-menu'),
    showErrorBox: (title, message) => ipcRenderer.send('show-error-box', { title, message }),
    showSuccessBox: (title, message) => ipcRenderer.send('show-success-box', { title, message })
});
