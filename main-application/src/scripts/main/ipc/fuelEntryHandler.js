// /** 
//  * File: src/scripts/main/ipc/fuelEntryHandler.js
//  * Author: Yash Balotiya
//  * Description: This file contains the IPC handlers for fuel entry management
//  * Created on: 24/09/2025
//  * Last Modified: 28/09/2025
// */

import { ipcMain } from "electron";
import {
    loadData,
    getFuelEntry, 
    saveFuelEntry,
    saveKilometersEntry
} from "../services/fuelEntryService.js";

// Registering IPC handlers for fuel entries
const registerFuelEntryHandlers = () => {
    // Handler to load fuel data for a specific month
    ipcMain.handle('load-fuel-data', async (event, month) => {
        return loadData(month);
    });
    
    // Get existing fuel entry for a specific vehicle and date
    ipcMain.handle("get-fuel-entry", async (event, { vehicleId, refuelDate }) => {
        return getFuelEntry(vehicleId, refuelDate);
    });

    // Save fuel entry (add new or update existing)
    ipcMain.handle("save-fuel-entry", async (event, { vehicleId, refuelDate, fuelAmount }) => {
        return saveFuelEntry(vehicleId, refuelDate, fuelAmount);
    });

    // Save kilometers entry (add new or update existing)
    ipcMain.handle("save-kilometers-entry", async (event, { vehicleId, refuelDate, kilometers }) => {
        return saveKilometersEntry(vehicleId, refuelDate, kilometers);
    });
};

// Exporting the register function
export default registerFuelEntryHandlers;