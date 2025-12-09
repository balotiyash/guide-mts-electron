/** 
 * File: src/scripts/routes/report.routes.js
 * Author: Yash Balotiya
 * Description: Routes for report-related data retrieval.
 * Created on: 09/12/2025
 * Last Modified: 09/12/2025
*/

// Import necessary modules and services
import { Router } from 'express';
import { getAllBalances } from '../main/services/balanceReportService.js';
import { getAllCollections } from '../main/services/collectionReportService.js';
import { getAllCustomers } from '../main/services/searchService.js';

// Initialize the router
const router = Router();

// Route to get all balance data
router.get('/balances', async (req, res) => {
    try {
        const balanceData = await getAllBalances();
        res.status(200).json(balanceData);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching balance data', error: error.message });
    }
});

// Route to get all collection data
router.get('/collections', async (req, res) => {
    try {
        const collectionData = await getAllCollections();
        res.status(200).json(collectionData);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching collection data', error: error.message });
    }
});

// Route to get all customers
router.get('/customers', async (req, res) => {
    try {
        const customerData = await getAllCustomers();
        res.status(200).json(customerData);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching customer data', error: error.message });
    }
});

// Export the router
export default router;