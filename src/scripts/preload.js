/** 
 * File: src/scripts/preload.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Preload script for Electron application. This script bridges the main process and renderer process, allowing secure communication.
 * Created on: 13/07/2025
 * Last Modified: 02/09/2025
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
    showDialogBox: (type, title, message, buttons) => ipcRenderer.invoke('show-dialog-box', { type, title, message, buttons })
});


// Exposing dashboard APIs
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

// Exposing data entry APIs
contextBridge.exposeInMainWorld('dataEntryAPI', {
    // API to fetch Dropdown Names of vehicles & instructors
    getDropDownNames: (value) => ipcRenderer.invoke('get-drop-down-names', value),

    // API to fetch customer data by phone number
    searchByPhoneNumber: (phoneNumber) => ipcRenderer.invoke('search-by-phone-number', phoneNumber),

    // API to fetch work description
    getWorkDescriptions: (userId) => ipcRenderer.invoke('get-work-descriptions', userId),

    // API to create a new customer
    createCustomer: (formElements) => ipcRenderer.invoke('create-customer', formElements),

    // API to update an existing customer
    // updateCustomer: (formElements) => ipcRenderer.invoke('update-customer', formElements)
});