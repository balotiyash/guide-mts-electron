/** 
 * File: src/scripts/routes/reminder.routes.js
 * Author: Yash Balotiya
 * Description: Routes for reminder-related data retrieval.
 * Created on: 09/12/2025
 * Last Modified: 09/12/2025
*/

// Import necessary modules and services
import { Router } from 'express';
import { getBirthdayReminders, getLLReminders, getPaymentReminders, getLicenseExpirationReminders } from '../main/services/reminderService.js';

// Initialize the router
const router = Router();

// Route to get birthday reminders
router.get('/birthdays', async (req, res) => {
    const response = await getBirthdayReminders();
    res.status(response.status).json(response);
});

// Route to get LL reminders
router.get('/ll-reminders', async (req, res) => {
    const response = await getLLReminders();
    res.status(response.status).json(response);
});

// Route to get payment reminders
router.get('/payment-reminders', async (req, res) => {
    const response = await getPaymentReminders();
    res.status(response.status).json(response);
});

// Route to get licence expiration reminders
router.get('/licence-expiry-reminders', async (req, res) => {
    const response = await getLicenseExpirationReminders();
    res.status(response.status).json(response);
});

// Export the router
export default router;