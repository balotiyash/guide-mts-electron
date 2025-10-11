/**
 * File: src/scripts/main/ipc/form14Handler.js
 * Author: Yash Balotiya
 * Description: IPC handlers for Form 14 operations
 * Created on: 01/10/2025
 * Last Modified: 11/10/2025
 */

// Importing required modules & libraries
import { ipcMain } from 'electron';
import { getForm14Data } from '../services/form14Service.js';

// Register all Form 14 IPC handlers
const registerForm14Handlers = () => {

    // Get Form 14 data by date range
    ipcMain.handle('get-form14-data', async (event, startDate, endDate) => {
        try {
            const data = await getForm14Data(startDate, endDate);
            return data;
        } catch (error) {
            console.error('Error getting Form 14 data:', error);
            throw error;
        }
    });
};

// Exporting the registerForm14Handlers function
export default registerForm14Handlers;