// src/handlers/invoiceHandler.js
import { ipcMain } from 'electron';
// import generateInvoice from '../services/invoiceService.js';
import paymentService from '../services/paymentService.js';
import { generateInvoice, printInvoice } from '../services/invoiceService.js';

function registerInvoiceHandler() {
    ipcMain.handle('generate-invoice-for-user', async (event, userId, workId, type) => {
        try {
            const customer = await paymentService.getPaymentsByUserId(userId, workId, type);
            if (!customer || !customer.payments || customer.payments.length === 0) {
                throw new Error('No payments found for this user');
            }

            let runningRemaining = parseFloat(customer.payments[0].charged_amount) || 0;

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

            const invoiceData = {
                customer: customer.name,
                admissionNo: userId,
                date: formatDate(new Date()),
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

    ipcMain.handle('print-invoice-for-user', async (event, userId, workId, type) => {
        try {
            console.log('print-invoice-for-user called with:', { userId, workId, type }); // Debug log
            const customer = await paymentService.getPaymentsByUserId(userId, workId, type);
            if (!customer || !customer.payments || customer.payments.length === 0) {
                throw new Error('No payments found for this user');
            }

            let runningRemaining = parseFloat(customer.payments[0].charged_amount) || 0;

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

            const invoiceData = {
                customer: customer.name,
                admissionNo: userId,
                date: formatDate(new Date()),
                items,
                total: items.reduce((sum, i) => sum + i.paid, 0),
                type: type // Use the passed type ('ORIGINAL' or 'DUPLICATE')
            };

            console.log('Calling printInvoice with data:', invoiceData); // Debug log
            await printInvoice(invoiceData);
            console.log('printInvoice completed successfully'); // Debug log
            return { success: true };
        } catch (err) {
            console.error('Print invoice error:', err);
            return { success: false, error: err.message };
        }
    });

}


export default registerInvoiceHandler;
