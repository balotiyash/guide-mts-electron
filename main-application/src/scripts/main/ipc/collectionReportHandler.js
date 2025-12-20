/**
 * File: src/scripts/main/ipc/collectionReportHandler.js
 * Author: Yash Balotiya
 * Description: IPC handlers for collection report functionality
 * Created on: 12/10/2025
 * Last Modified: 20/12/2025
 */

// Import required modules & libraries
import { ipcMain, BrowserWindow, dialog } from 'electron';
import { getAllCollections } from '../services/collectionReportService.js';

// Register IPC handlers for collection report functionality
const registerCollectionReportHandlers = () => {
    // Handler to get all collection data
    ipcMain.handle('get-all-collections', async () => {
        return await getAllCollections();
    });

    // Show save dialog
    ipcMain.handle('collection-show-save-dialog', async (event, options) => {
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
    ipcMain.handle('collection-write-file', async (event, filePath, content) => {
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

// Export the registration function
export default registerCollectionReportHandlers;