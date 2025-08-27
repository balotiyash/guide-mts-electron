/** 
 * File: src/scripts/main/ipc/dbHandler.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to handle database-related IPC calls.
 * Created on: 26/08/2025
 * Last Modified: 26/08/2025
*/

// Importing required modules & libraries
import { ipcMain } from "electron";
import { getDbPath } from "../services/dbService.js";

// Registering IPC handlers for database-related calls
const registerDbHandler = () => {
    // Get database path
    ipcMain.handle("get-db-path", () => {
        return getDbPath();
    });
}

// Exporting the registerDbHandler function
export { registerDbHandler };
