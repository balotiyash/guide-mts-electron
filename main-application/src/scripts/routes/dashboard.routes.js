/** 
 * File: src/scripts/routes/dashboard.routes.js
 * Author: Yash Balotiya
 * Description: Routes for dashboard-related data retrieval.
 * Created on: 07/12/2025
 * Last Modified: 08/12/2025
*/

// Import necessary modules and services
import { Router } from 'express';
import allDashboardServices from '../main/services/dashboardService.js';

// Initialize the router
const router = Router();

// GET chart 1, 2, 3 data dynamically
router.get('/chart-data', async (req, res) => {
    try {
        const { year, chartNo } = req.query;

        // Validate chartNo to ensure it's a number between 1 and 3
        if (!chartNo || isNaN(chartNo) || chartNo < 1 || chartNo > 3) {
            return res.status(400).json({ message: 'Invalid chart number. Only 1, 2, or 3 are allowed.' });
        }

        // Dynamically build the method name
        const chartFunctionName = `getChart${chartNo}Data`;

        // Check if the function exists in the allDashboardServices object
        if (typeof allDashboardServices[chartFunctionName] === 'function') {
            // Call the dynamically selected function
            const chartData = await allDashboardServices[chartFunctionName](year);
            return res.json(chartData);
        } else {
            return res.status(404).json({ message: 'Chart data function not found' });
        }

    } catch (err) {
        console.error('GET /api/v1/chart-data error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET total registrations count
router.get('/all-time-count', async (req, res) => {
    try {
        const count = await allDashboardServices.getAllTimeRegistrations();
        res.json({ count });
    } catch (err) {
        console.error('GET /api/v1/all-time-count error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET current year registrations count
router.get('/current-year-count', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const count = await allDashboardServices.getRegistrationsFromYear(currentYear);
        res.json({ count });
    } catch (err) {
        console.error('GET /api/v1/current-year-count error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET repeat students count
router.get('/repeat-students-count', async (req, res) => {
    try {
        const count = await allDashboardServices.getRepeatStudentsCount();
        res.json({ count });
    } catch (err) {
        console.error('GET /api/v1/repeat-students-count error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET pending payments count
router.get('/pending-payments-count', async (req, res) => {
    try {
        const count = await allDashboardServices.getPendingPaymentsCount();
        res.json({ count });
    } catch (err) {
        console.error('GET /api/v1/pending-payments-count error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Export the router
export default router;