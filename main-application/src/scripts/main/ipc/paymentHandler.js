/** 
 * File: src/scripts/main/ipc/paymentHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for payment management
 * Created on: 30/09/2025
 * Last Modified: 11/10/2025
*/

// Importing required modules & libraries
import { ipcMain } from "electron";
import allPaymentService from "../services/paymentService.js";

// Registering IPC handlers for payment entry
const registerPaymentHandlers = () => {
    // Handler to get all payments
    ipcMain.handle('get-all-pending-payments', allPaymentService.getAllPendingPayments);

    // Handler to get all paid payments
    ipcMain.handle('get-all-paid-payments', allPaymentService.getAllPaidPayments);

    // Handler to submit a payment
    ipcMain.handle('submit-payment', async (event, paymentDetails) => {
        const { userId, workId, amount, mode } = paymentDetails;
        // Basic validation
        if (!userId || !workId || !amount || !mode) {
            return {
                status: 400,
                success: false,
                message: 'Invalid payment details'
            };
        }
        // Insert payment into the database
        const result = await allPaymentService.submitPayment(userId, workId, amount, mode);
        return result;
    });

    // Handler to update a payment
    ipcMain.handle('update-payment', async (event, paymentDetails) => {
        const { paymentId, newAmount, newMode } = paymentDetails;
        // Basic validation
        if (!paymentId || !newAmount || !newMode) {
            return {
                status: 400,
                success: false,
                message: 'Invalid payment update details'
            };
        }

        // Update payment in the database
        const result = await allPaymentService.updatePayment(paymentId, newAmount, newMode);
        return result;
    });
};

// Exporting the function to be used in main.js
export default registerPaymentHandlers;
