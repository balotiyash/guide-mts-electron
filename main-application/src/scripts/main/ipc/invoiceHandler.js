/** 
 * File: src/scripts/main/ipc/invoiceHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for invoice management
 * Created on: 30/09/2025
 * Last Modified: 11/10/2025
*/

// src/handlers/invoiceHandler.js
import { ipcMain } from 'electron';
import paymentService from '../services/paymentService.js';
import { generateInvoice, printInvoice } from '../services/invoiceService.js';
import { isoToDDMMYYYY, sanitizeDate } from '../../shared.js';

// Registering IPC handlers for invoice operations
const registerInvoiceHandler = () => {
    // Generate or Print Invoice for a User
    ipcMain.handle('generate-invoice-for-user', async (event, userId, workId, type) => {
        try {
            // Fetch customer payments
            const customer = await paymentService.getPaymentsByUserId(userId, workId, type);

            // Validate customer and payments
            if (!customer || !customer.payments || customer.payments.length === 0) {
                throw new Error('No payments found for this user');
            }

            // Prepare invoice data
            let runningRemaining = parseFloat(customer.payments[0].charged_amount) || 0;

            // Map payments to invoice items
            const items = customer.payments.map((p) => {
                const paid = parseFloat(p.paid_amount) || 0;
                runningRemaining -= paid;

                return {
                    desc: p.work,
                    date: p.date,
                    mode: p.payment_mode,
                    paid,
                    remaining: runningRemaining
                };
            });

            // Final invoice data structure
            const invoiceData = {
                customer: customer.name,
                admissionNo: userId,
                date: isoToDDMMYYYY(sanitizeDate(new Date()), '/'),
                items,
                total: items.reduce((sum, i) => sum + i.paid, 0),
                type: customer.type
            };

            // ✅ Use one or the other depending on your flow
            if (type === 'PRINT') {
                await printInvoice(invoiceData);
                return { success: true, printed: true };
            } else {
                const filePath = await generateInvoice(invoiceData);
                return { success: !!filePath, filePath };
            }
        } catch (err) {
            console.error('Invoice generation error:', err);
            return { success: false, error: err.message };
        }
    });

    // Print invoice directly without saving
    ipcMain.handle('print-invoice-for-user', async (event, userId, workId, type) => {
        try {
            // Fetch customer payments
            const customer = await paymentService.getPaymentsByUserId(userId, workId, type);

            // Validate customer and payments
            if (!customer || !customer.payments || customer.payments.length === 0) {
                throw new Error('No payments found for this user');
            }

            // Prepare invoice data
            let runningRemaining = parseFloat(customer.payments[0].charged_amount) || 0;

            // Map payments to invoice items
            const items = customer.payments.map((p) => {
                const paid = parseFloat(p.paid_amount) || 0;
                runningRemaining -= paid;

                return {
                    desc: p.work,
                    date: p.date,
                    mode: p.payment_mode,
                    paid,
                    remaining: runningRemaining
                };
            });

            // Final invoice data structure
            const invoiceData = {
                customer: customer.name,
                admissionNo: userId,
                date: isoToDDMMYYYY(sanitizeDate(new Date()), '/'),
                items,
                total: items.reduce((sum, i) => sum + i.paid, 0),
                type: type // Use the passed type ('ORIGINAL' or 'DUPLICATE')
            };

            await printInvoice(invoiceData);
            return { success: true };
        } catch (err) {
            console.error('Print invoice error:', err);
            return { success: false, error: err.message };
        }
    });
}

// Exporting the function to be used in main.js
export default registerInvoiceHandler;
