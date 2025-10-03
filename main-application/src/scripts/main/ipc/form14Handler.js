/**
 * File: src/scripts/main/ipc/form14Handler.js
 * Author: Yash Balotiya
 * Description: IPC handlers for Form 14 operations
 * Created on: 01/10/2025
 * Last Modified: 01/10/2025
 */

import { ipcMain } from 'electron';
import Form14Service from '../services/form14Service.js';

const form14Service = new Form14Service();

/**
 * Register all Form 14 IPC handlers
 */
const registerForm14Handlers = () => {
    console.log('Registering Form 14 IPC handlers...');

    // Get Form 14 data by date range
    ipcMain.handle('get-form14-data', async (event, startDate, endDate) => {
        try {
            console.log('Getting Form 14 data for date range:', startDate, 'to', endDate);
            const data = await form14Service.getForm14Data(startDate, endDate);
            console.log(`Retrieved ${data.length} records for Form 14`);
            return data;
        } catch (error) {
            console.error('Error getting Form 14 data:', error);
            throw error;
        }
    });

    console.log('Form 14 IPC handlers registered successfully');
};

export default registerForm14Handlers;