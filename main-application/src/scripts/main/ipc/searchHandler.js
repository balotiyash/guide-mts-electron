/**
 * File: src/scripts/main/ipc/searchHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for search functionality
 * Created on: 11/10/2025
 * Last Modified: 12/10/2025
 */

// Importing required modules & libraries
import { ipcMain, BrowserWindow, dialog } from 'electron';
import { getAllCustomers } from '../services/searchService.js';

// Function to register search handlers
const registerSearchHandlers = () => {
    // Handler to get all customers
    ipcMain.handle('get-all-customers', async () => {
        return await getAllCustomers();
    });

    // Show save dialog
    ipcMain.handle('show-save-dialog', async (event, options) => {
        try {
            const currentWindow = BrowserWindow.getFocusedWindow();
            const result = await dialog.showSaveDialog(currentWindow, options);
            return result.canceled ? null : result.filePath;
        } catch (error) {
            console.error('Error showing save dialog:', error);
            return null;
        }
    });

    // Write file
    ipcMain.handle('write-file', async (event, filePath, content) => {
        try {
            const fs = await import('fs');
            await fs.promises.writeFile(filePath, content, 'utf8');
            return { success: true };
        } catch (error) {
            console.error('Error writing file:', error);
            return { success: false, error: error.message };
        }
    });
};

// Registering the search handlers
export default registerSearchHandlers;