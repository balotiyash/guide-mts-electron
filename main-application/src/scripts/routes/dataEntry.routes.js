/** 
 * File: src/scripts/routes/dataEntry.routes.js
 * Author: Yash Balotiya
 * Description: Routes for data entry-related operations.
 * Created on: 09/12/2025
 * Last Modified: 09/12/2025
*/

// Import necessary modules and services
import { Router } from 'express';
import allDataEntryServices from '../main/services/dataEntryService.js';

// Initialize the router
const router = Router();

// Route to fetch dropdown names for vehicles & instructors
router.get('/dropdown-names/:value', async (req, res) => {
    const { value } = req.params;
    const result = await allDataEntryServices.getDropDownNames(value);
    res.json(result);
});

// Route to search for customer by phone number
router.get('/search-customer/:phoneNumber', async (req, res) => {
    const { phoneNumber } = req.params;
    const result = await allDataEntryServices.searchByPhoneNumber(phoneNumber);
    res.json(result);
});

// Route to fetch work descriptions for a user
router.get('/work-descriptions/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await allDataEntryServices.getWorkDescriptions(userId);
    res.json(result);
});

// Route to create a new customer
router.post('/create-customer', async (req, res) => {
    const formElements = req.body;
    const result = await allDataEntryServices.createCustomer(formElements);
    res.json(result);
});

// Route to create a new job for an existing customer
router.post('/create-job', async (req, res) => {
    const { userId, workDescriptionInput, amountInput } = req.body;
    const result = await allDataEntryServices.insertIntoWorkDescriptions(userId, workDescriptionInput, amountInput);
    res.json(result);
});

// Route to update an existing customer
router.put('/update-customer', async (req, res) => {
    const { userId, jobId, formValues } = req.body;
    const result = await allDataEntryServices.updateCustomer(userId, jobId, formValues);
    res.json(result);
});

// Route to delete a user
router.delete('/delete-user/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await allDataEntryServices.deleteUser(userId);
    res.json(result);
});

// Route to delete a job
router.delete('/delete-job/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const result = await allDataEntryServices.deleteJob(jobId);
    res.json(result);
});

// Export the router
export default router;