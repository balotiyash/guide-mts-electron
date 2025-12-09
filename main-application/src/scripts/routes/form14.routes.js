/** 
 * File: src/scripts/routes/form14.routes.js
 * Author: Yash Balotiya
 * Description: Routes for form14-related data retrieval.
 * Created on: 09/12/2025
 * Last Modified: 09/12/2025
*/

// Import necessary modules and services
import { Router } from 'express';
import allForm14Services from '../main/services/form14Service.js';

// Initialize the router
const router = Router();

// Route to get Form 14 data
router.get('/data', async (req, res) => {
    try {
        const { startDate, endDate, searchType, searchName } = req.query;
        const data = await allForm14Services.getForm14Data(startDate, endDate, searchType, searchName);
        res.json(data);
    } catch (error) {
        console.error('Error fetching Form 14 data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export the router
export default router;