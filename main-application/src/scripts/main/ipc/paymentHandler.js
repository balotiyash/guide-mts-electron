/** 
 * File: src/scripts/main/ipc/paymentHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for payment management
 * Created on: 30/09/2025
 * Last Modified: 02/12/2025
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
        const { userId, workId, amount, mode, paymentDate } = paymentDetails;
        // Basic validation
        if (!userId || !workId || !amount || !mode || !paymentDate) {
            return {
                status: 400,
                success: false,
                message: 'Invalid payment details'
            };
        }
        // Insert payment into the database
        const result = await allPaymentService.submitPayment(userId, workId, amount, mode, paymentDate);
        return result;
    });

    // Handler to update a payment
    ipcMain.handle('update-payment', async (event, paymentDetails) => {
        const { paymentId, newAmount, newMode, newPaymentDate } = paymentDetails;
        // Basic validation
        if (!paymentId || !newAmount || !newMode || !newPaymentDate) {
            return {
                status: 400,
                success: false,
                message: 'Invalid payment update details'
            };
        }

        // Update payment in the database
        const result = await allPaymentService.updatePayment(paymentId, newAmount, newMode, newPaymentDate);
        return result;
    });
};

// Exporting the function to be used in main.js
export default registerPaymentHandlers;
