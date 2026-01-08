/**
 * File: src/scripts/utilities/paymentEntry/printInvoiceUtility.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to handle invoice printing and generation for payment entry page.
 * Created on: 22/09/2025
 * Last Modified: 08/01/2026
 */

// Function to print invoice for a selected user
const printInvoiceForSelectedUser = async (userId, workId, type) => {
    // Validation
    if (!userId) {
        window.dialogBoxAPI.showDialogBox('warning', 'No Selection', 'Please select a customer first.');
        return;
    }
    
    try {
        // Call print API
        const res = await window.invoiceAPI.printInvoiceForUser(userId, workId, type);

        // Handle response
        if (res.success) {
            // No need to show success dialog since print dialog handles user interaction
        } else {
            window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to print invoice.');
        }
    } catch (error) {
        // Catch any unexpected errors
        console.error('Print error:', error);
        window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to print invoice.');
    }
};

// Function to generate invoice for a selected user and save as file PDF
const generateInvoiceForSelectedUser = async (userId, workId, type) => {
    // Validation
    if (!userId) {
        window.dialogBoxAPI.showDialogBox('warning', 'No Selection', 'Please select a customer first.');
        return;
    }

    // Call generate API
    const res = await window.invoiceAPI.generateInvoiceForUser(userId, workId, type);

    // Handle response
    if (res.success) {
        console.log('Invoice saved at:', res.filePath);
        window.dialogBoxAPI.showDialogBox('info', 'Success', `Invoice saved at:\n${res.filePath}`);
    } else {
        // Show error dialog
        console.error(res.error);
        window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to generate invoice.');
    }
};

// Exporting functions
export {
    printInvoiceForSelectedUser,
    generateInvoiceForSelectedUser
};