/**
 * File: src/scripts/main/ipc/balanceReportHandler.js
 * Author: Yash Balotiya
 * Description: IPC handlers for balance report functionality
 * Created on: 12/10/2025
 * Last Modified: 20/12/2025
 */

// Importing required modules & libraries
import { ipcMain, BrowserWindow, dialog } from 'electron';
import { getAllBalances } from '../services/balanceReportService.js';

// Register IPC handlers for balance report functionality
const registerBalanceReportHandlers = () => {
    // Handler to get all balance data
    ipcMain.handle('get-all-balances', async () => {
        return await getAllBalances();
    });

    // Show save dialog
    ipcMain.handle('balance-show-save-dialog', async (event, options) => {
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
    ipcMain.handle('balance-write-file', async (event, filePath, content) => {
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

// Exporting the register function
export default registerBalanceReportHandlers;