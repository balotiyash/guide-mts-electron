/**
 * File: src/scripts/utilities/paymentEntry/printInvoiceUtility.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to handle invoice printing and generation for payment entry page.
 * Created on: 22/09/2025
 * Last Modified: 21/12/2025
 */

// Function to print invoice for a selected user
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
            // No need to show success dialog since print dialog handles user interaction
        } else {
            window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to print invoice.', ['OK']);
        }
    } catch (error) {
        // Catch any unexpected errors
        console.error('Print error:', error);
        window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to print invoice.', ['OK']);
    }
};

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
    generateInvoiceForSelectedUser
};