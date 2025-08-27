/** 
 * File: src/scripts/preload.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Preload script for Electron application. This script bridges the main process and renderer process, allowing secure communication.
 * Created on: 13/07/2025
 * Last Modified: 27/08/2025
*/

// Importing required modules from Electron
const { contextBridge, ipcRenderer } = require('electron');

// Exposing secure APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // API to get the database path
    getDbPath: () => ipcRenderer.invoke("get-db-path"),

    // API to login
    login: (credentials) => ipcRenderer.invoke('login', credentials),

    // API to navigate to a specific page
    navigateTo: (page) => ipcRenderer.send('navigate-to', page),

    // API to show the application menu
    showMenu: () => ipcRenderer.send('show-menu'),
});

// Exposing dialog box APIs
contextBridge.exposeInMainWorld('dialogBoxAPI', {
    // API to show an message box
    showErrorBox: (title, message) => ipcRenderer.send('show-error-box', { title, message }),
    showSuccessBox: (title, message) => ipcRenderer.send('show-success-box', { title, message })
});

contextBridge.exposeInMainWorld('dashboardAPI', {
    // Dashboard Charts
    getChart1Data: (selectedYear) => ipcRenderer.invoke('get-chart-1-data', selectedYear),
    getChart2Data: (selectedYear) => ipcRenderer.invoke('get-chart-2-data', selectedYear),
    getChart3Data: (selectedYear) => ipcRenderer.invoke('get-chart-3-data', selectedYear),

    // Dashboard Business Stats
    getAllTimeCount: () => ipcRenderer.invoke('get-all-time-count'),
    getCurrentYearCount: () => ipcRenderer.invoke('get-current-year-count'),
    getRepeatStudentsCount: () => ipcRenderer.invoke('get-repeat-students-count'),
    getPendingPaymentsCount: () => ipcRenderer.invoke('get-pending-payments-count')
});