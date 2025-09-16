/** 
 * File: src/scripts/preload.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Preload script for Electron application. This script bridges the main process and renderer process, allowing secure communication.
 * Created on: 13/07/2025
 * Last Modified: 16/09/2025
*/

// Importing required modules from Electron
const { contextBridge, ipcRenderer } = require('electron');
// const {log} = require("electron-log");

// Configure log
// log.transports.file.level = "info";

// Expose safe logger API to the renderer
// contextBridge.exposeInMainWorld("logger", {
//     info: (...args) => log.info(...args),
//     error: (...args) => log.error(...args),
//     warn: (...args) => log.warn(...args),
// });

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

    // ✅ Trigger PDF generation from renderer
    // generateInvoice: (invoiceData) =>
    //     ipcRenderer.send('generate-invoice', invoiceData),

    // // ✅ Listen for invoice data inside invoice.html
    // onInvoiceData: (callback) =>
    //     ipcRenderer.on('invoice-data', (event, data) => callback(data))

    // Called from payment_entry.js to ask main to generate an invoice (returns a promise)
    generateInvoice: (invoiceData, type) => ipcRenderer.invoke('generate-invoice', invoiceData, type),

    // Called from the invoice renderer (reciept.html)
    // - tells main "I'm ready to receive the invoice data" (passes token)
    requestInvoiceData: (token) => ipcRenderer.send('invoice-ready', token),

    // - renderer registers a callback to receive the actual invoice data
    onInvoiceData: (callback) => ipcRenderer.on('invoice-data', (event, data) => callback(data)),

    // - once renderer has put data into the DOM and it's visually ready, call this
    notifyInvoiceRendered: (token) => ipcRenderer.send('invoice-rendered', token),

    generateInvoiceForUser: (userId, workId, type) => ipcRenderer.invoke('generate-invoice-for-user', userId, workId, type),
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

    // API to create a new job for an existing customer
    createJob: (userId, workDescriptionInput, amountInput) => ipcRenderer.invoke('create-job', { userId, workDescriptionInput, amountInput }),

    // API to update an existing customer
    updateCustomer: (userId, jobId, formValues) => ipcRenderer.invoke('update-customer', { userId, jobId, formValues })
});

// Exposing payment entry APIs
contextBridge.exposeInMainWorld('paymentEntryAPI', {
    // API to fetch all pending payments
    getAllPendingPayments: () => ipcRenderer.invoke('get-all-pending-payments'),

    // API to fetch all paid payments
    getAllPaidPayments: () => ipcRenderer.invoke('get-all-paid-payments'),

    // API to submit a payment
    submitPayment: (paymentDetails) => ipcRenderer.invoke('submit-payment', paymentDetails),

    // API to update a payment
    updatePayment: (paymentDetails) => ipcRenderer.invoke('update-payment', paymentDetails)
});