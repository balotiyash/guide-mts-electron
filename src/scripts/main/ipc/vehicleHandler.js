/**
 * File: src/scripts/main/ipc/vehicleHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for vehicle management
 * Created on: 23/09/2025
 * Last Modified: 23/09/2025
 */

import { ipcMain } from 'electron';
import { getAllVehicles, addVehicle, updateVehicle, deleteVehicle } from '../services/vehicleService.js';

function registerVehicleHandlers() {
    ipcMain.handle('get-all-vehicles', async () => {
        return await getAllVehicles();
    });

    ipcMain.handle('add-vehicle', async (event, data) => {
        return await addVehicle(data);
    });

    ipcMain.handle('update-vehicle', async (event, { vehicleId, vehicleData }) => {
        return await updateVehicle(vehicleId, vehicleData);
    });

    ipcMain.handle('delete-vehicle', async (event, vehicleId) => {
        return await deleteVehicle(vehicleId);
    });
}

export default registerVehicleHandlers;