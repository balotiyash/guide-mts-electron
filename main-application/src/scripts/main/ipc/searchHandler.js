/**
 * File: src/scripts/main/ipc/searchHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for search functionality
 * Created on: 11/10/2025
 * Last Modified: 11/10/2025
 */

// Importing required modules & libraries
import { ipcMain } from 'electron';
import { getAllCustomers } from '../services/searchService.js';

// Function to register search handlers
const registerSearchHandlers = () => {
    // Handler to get all customers
    ipcMain.handle('get-all-customers', async () => {
        return await getAllCustomers();
    });
};

// Registering the search handlers
export default registerSearchHandlers;