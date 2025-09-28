/**
 * File: src/scripts/utilities/paymentEntry/printInvoiceUtility.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to handle invoice printing and generation for payment entry page.
 * Created on: 22/09/2025
 * Last Modified: 23/09/2025
 */

// Function to print invoice for a selected user (legacy Electron print dialog)
const printInvoiceForSelectedUser = async (userId, workId, type) => {
    // Validation
    if (!userId) {
        window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a customer first.', ['OK']);
        return;
    }
    
    try {
        // Call print API
        const res = await window.invoiceAPI.printInvoiceForUser(userId, workId, type);

        // Handle response
        if (res.success) {
            // console.log('Invoice printed successfully');
            // No need to show success dialog since print dialog handles user interaction
        } else {
            // console.error('Print failed:', res.error);
            window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to print invoice.', ['OK']);
        }
    } catch (error) {
        // Catch any unexpected errors
        console.error('Print error:', error);
        window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to print invoice.', ['OK']);
    }
}

// Function to open invoice in browser for printing (new preferred method)
const openInvoiceInBrowserForSelectedUser = async (userId, workId, type) => {
    // Validation
    if (!userId) {
        window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a customer first.', ['OK']);
        return;
    }
    
    try {
        // Call browser API
        const res = await window.invoiceAPI.openInvoiceInBrowser(userId, workId, type);

        // Handle response
        if (res.success) {
            console.log('Invoice opened in browser successfully:', res.filePath);
            // Show success message
            window.dialogBoxAPI.showDialogBox(
                'info', 
                'Invoice Opened', 
                'Invoice has been opened in your default browser. You can print it from there.', 
                ['OK']
            );
        } else {
            console.error('Failed to open invoice in browser:', res.error);
            window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to open invoice in browser.', ['OK']);
        }
    } catch (error) {
        // Catch any unexpected errors
        console.error('Browser open error:', error);
        window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to open invoice in browser.', ['OK']);
    }
}

// Function to generate invoice for a selected user and save as file PDF
const generateInvoiceForSelectedUser = async (userId, workId, type) => {
    // Validation
    if (!userId) {
        window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a customer first.', ['OK']);
        return;
    }

    // Call generate API
    const res = await window.invoiceAPI.generateInvoiceForUser(userId, workId, type);

    // Handle response
    if (res.success) {
        console.log('Invoice saved at:', res.filePath);
        window.dialogBoxAPI.showDialogBox('info', 'Success', `Invoice saved at:\n${res.filePath}`, ['OK']);
    } else {
        // Show error dialog
        console.error(res.error);
        window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to generate invoice.', ['OK']);
    }
};

// Exporting functions
export {
    printInvoiceForSelectedUser,
    openInvoiceInBrowserForSelectedUser,
    generateInvoiceForSelectedUser
}