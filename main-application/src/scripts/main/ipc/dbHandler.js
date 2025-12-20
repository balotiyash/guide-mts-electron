/** 
 * File: src/scripts/main/ipc/dbHandler.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to handle database-related IPC calls.
 * Created on: 26/08/2025
 * Last Modified: 20/12/2025
*/

// Importing required modules & libraries
import { ipcMain } from "electron";
import { getDbPath, backupDatabase, changeDatabase } from "../services/dbService.js";

// Registering IPC handlers for database-related calls
const registerDbHandler = () => {
    // Get database path
    ipcMain.handle("get-db-path", () => {
        return getDbPath();
    });

    // Handle database backup
    ipcMain.handle('backup-database', async (event) => {
        return await backupDatabase();
    });

    // Handle database change
    ipcMain.handle('change-database', async (event) => {
        return await changeDatabase();
    });
};

// Exporting the registerDbHandler function
export default registerDbHandler;
