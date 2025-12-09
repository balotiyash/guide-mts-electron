/** 
 * File: src/scripts/routes/payment.routes.js
 * Author: Yash Balotiya
 * Description: Routes for payment-related data retrieval.
 * Created on: 09/12/2025
 * Last Modified: 09/12/2025
*/

// Import necessary modules and services
import { Router } from 'express';
import allPaymentServices from '../main/services/paymentService.js';

// Initialize the router
const router = Router();

// Route to get all pending payments
router.get('/pending-payments', async (req, res) => {
    try {
        const response = await allPaymentServices.getAllPendingPayments();
        res.status(response.status).json(response);
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Error fetching pending payments',
            error: error.message
        });
    }
});

// Route to get all paid payments
router.get('/paid-payments', async (req, res) => {
    try {
        const response = await allPaymentServices.getAllPaidPayments();
        res.status(response.status).json(response);
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Error fetching paid payments',
            error: error.message
        });
    }
});

// Export the router to be used in the main application
export default router;