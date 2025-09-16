// src/handlers/invoiceHandler.js
import { ipcMain } from 'electron';
import generateInvoice from '../services/invoiceService.js';
import paymentService from '../services/paymentService.js';

function registerInvoiceHandler() {
    // Use handle so caller can await the result
    ipcMain.handle('generate-invoice-for-user', async (event, userId, workId, type) => {
        console.log(userId)
        console.log(workId)
        console.log(type)
        try {
            // Fetch all customer info + payments from DB
            const customer = await paymentService.getPaymentsByUserId(userId, workId, type);
            if (!customer || !customer.payments || customer.payments.length === 0) {
                throw new Error('No payments found for this user');
            }

            let runningRemaining = 0;
            if (customer.payments.length > 0) {
                runningRemaining = parseFloat(customer.payments[0].charged_amount);
            }

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

            function formatDate(date) {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
            }

            // Build invoice data
            const invoiceData = {
                customer: customer.name,
                admissionNo: userId,
                date: formatDate(new Date()),
                items,
                total: items.reduce((sum, i) => sum + i.paid, 0),
                type: customer.type
            };

            console.log(invoiceData)


            // Call service to generate PDF
            const filePath = await generateInvoice(invoiceData);

            return { success: true, filePath };
        } catch (err) {
            console.error('Invoice generation error:', err);
            return { success: false, error: err.message };
        }
    });
}

export default registerInvoiceHandler;
