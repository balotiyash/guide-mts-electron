/** 
 * File: src/scripts/preload.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Preload script for Electron application. This script bridges the main process and renderer process, allowing secure communication.
 * Created on: 13/07/2025
 * Last Modified: 07/12/2025
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

    // API to backup the database
    backupDatabase: () => ipcRenderer.invoke('backup-database'),

    // API to change database
    changeDatabase: () => ipcRenderer.invoke('change-database'),

    // Listen for change database requests from menu
    onChangeDatabaseRequest: (callback) => ipcRenderer.on('change-database-request', callback)
});

// Exposing dialog box APIs
contextBridge.exposeInMainWorld('dialogBoxAPI', {
    // API to show a dialog box
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
    updateCustomer: (userId, jobId, formValues) => ipcRenderer.invoke('update-customer', { userId, jobId, formValues }),

    // API to delete user
    deleteUser: (userId) => ipcRenderer.invoke('delete-user', userId),

    // API to delete job
    deleteJob: (jobId) => ipcRenderer.invoke('delete-job', jobId),
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

// Exposing master entry APIs
contextBridge.exposeInMainWorld('masterEntryAPI', {
    // API to fetch all instructors
    getAllInstructors: () => ipcRenderer.invoke('get-all-instructors'),

    // API to add a new instructor
    addInstructor: (data) => ipcRenderer.invoke('add-instructor', data),
    
    // API to delete an instructor
    deleteInstructor: (instructorId) => ipcRenderer.invoke('delete-instructor', instructorId),
    
    // API to update an instructor
    updateInstructor: (data) => ipcRenderer.invoke('update-instructor', data),
});

// Exposing vehicle entry APIs
contextBridge.exposeInMainWorld('vehicleEntryAPI', {
    // API to fetch all vehicles
    getAllVehicles: () => ipcRenderer.invoke('get-all-vehicles'),
    
    // API to add a new vehicle
    addVehicle: (vehicleData) => ipcRenderer.invoke('add-vehicle', vehicleData),
    
    // API to delete a vehicle
    deleteVehicle: (vehicleId) => ipcRenderer.invoke('delete-vehicle', vehicleId),
    
    // API to update a vehicle
    updateVehicle: (vehicleId, vehicleData) => ipcRenderer.invoke('update-vehicle', { vehicleId, vehicleData }),
});
    
// Exposing invoice APIs
contextBridge.exposeInMainWorld('invoiceAPI', {
    // Called from payment_entry.js to ask main to generate an invoice (returns a promise)
    generateInvoice: (invoiceData, type) => ipcRenderer.invoke('generate-invoice', invoiceData, type),

    // Called from the invoice renderer (reciept.html)
    // - tells main "I'm ready to receive the invoice data" (passes token)
    requestInvoiceData: (token) => ipcRenderer.send('invoice-ready', token),

    // - renderer registers a callback to receive the actual invoice data
    onInvoiceData: (callback) => ipcRenderer.on('invoice-data', (event, data) => callback(data)),

    // - once renderer has put data into the DOM and it's visually ready, call this
    notifyInvoiceRendered: (token) => ipcRenderer.send('invoice-rendered', token),

    // API to generate the invoice for a user (returns a promise) PDF
    generateInvoiceForUser: (userId, workId, type) => ipcRenderer.invoke('generate-invoice-for-user', userId, workId, type),

    // API to print the invoice directly
    printInvoiceForUser: (userId, workId, type) => ipcRenderer.invoke('print-invoice-for-user', userId, workId, type),
    
    // API to open invoice in default browser for printing
    openInvoiceInBrowser: (userId, workId, type) => ipcRenderer.invoke('open-invoice-in-browser', userId, workId, type),
});

// Exposing fuel entry APIs
contextBridge.exposeInMainWorld('fuelEntryAPI', {
    // API to load fuel data
    loadFuelData: (month) => ipcRenderer.invoke('load-fuel-data', month),

    // API to load kilometer ran by a vehicle
    loadKmRan: (vehicleId, date) => ipcRenderer.invoke('load-km-ran', vehicleId, date),

    // API to get existing fuel entry for a specific vehicle and date
    getFuelEntry: (vehicleId, refuelDate) => ipcRenderer.invoke('get-fuel-entry', { vehicleId, refuelDate }),
    
    // API to save fuel entry (add new or update existing)
    saveFuelEntry: (vehicleId, refuelDate, fuelAmount) => ipcRenderer.invoke('save-fuel-entry', { vehicleId, refuelDate, fuelAmount }),

    // API to save kilometers entry
    saveKilometersEntry: (vehicleId, refuelDate, kilometers) => ipcRenderer.invoke('save-kilometers-entry', { vehicleId, refuelDate, kilometers })
});

// Exposing Form 14 APIs
contextBridge.exposeInMainWorld('form14API', {
    // API to get Form 14 data by date range
    getForm14Data: (startDate, endDate, searchType, searchName) => ipcRenderer.invoke('get-form14-data', startDate, endDate, searchType, searchName)
});

// Exposing Search Page APIs
contextBridge.exposeInMainWorld('searchPageAPI', {
    // API to search customers based on criteria
    getAllCustomers: () => ipcRenderer.invoke('get-all-customers'),

    // API to get all balance reports
    getAllBalanceReports: () => ipcRenderer.invoke('get-all-balance-reports'),

    // API to show save dialog
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

    // API to write file
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
});

// Exposing Balance Report APIs
contextBridge.exposeInMainWorld('balanceReportAPI', {
    // API to get all balance data
    getAllBalances: () => ipcRenderer.invoke('get-all-balances'),

    // API to show save dialog
    showSaveDialog: (options) => ipcRenderer.invoke('balance-show-save-dialog', options),

    // API to write file
    writeFile: (filePath, content) => ipcRenderer.invoke('balance-write-file', filePath, content),
});

// Exposing Collection Report APIs
contextBridge.exposeInMainWorld('collectionReportAPI', {
    // API to get all collection data
    getAllCollections: () => ipcRenderer.invoke('get-all-collections'),

    // API to show save dialog
    showSaveDialog: (options) => ipcRenderer.invoke('collection-show-save-dialog', options),

    // API to write file
    writeFile: (filePath, content) => ipcRenderer.invoke('collection-write-file', filePath, content),
});

// Exposing Reminder APIs
contextBridge.exposeInMainWorld('reminderAPI', {
    // API to get birthday reminders
    getBirthdayReminders: () => ipcRenderer.invoke('get-birthday-reminders'),

    // API to get LL reminders
    getLLReminders: () => ipcRenderer.invoke('get-ll-reminders'),

    // API to get payment reminders
    getPaymentReminders: () => ipcRenderer.invoke('get-payment-reminders'),

    // API to get Licence Expiry reminders
    getLicenceExpiryReminders: () => ipcRenderer.invoke('get-licence-expiry-reminders')
});