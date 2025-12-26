/**
 * File: src/scripts/main/ipc/vehicleHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for vehicle management
 * Created on: 23/09/2025
 * Last Modified: 26/12/2025
 */

// Importing required modules & libraries
import { ipcMain } from 'electron';
import { getAllVehicles, addVehicle, updateVehicle, deleteVehicle } from '../services/vehicleService.js';

const registerVehicleHandlers = () => {
    // Handler to get all vehicles
    ipcMain.handle('get-all-vehicles', async () => {
        return await getAllVehicles();
    });

    // Handler to add, update, and delete vehicles
    ipcMain.handle('add-vehicle', async (event, data) => {
        return await addVehicle(data);
    });

    // Handler to update vehicle
    ipcMain.handle('update-vehicle', async (event, { vehicleId, vehicleData }) => {
        return await updateVehicle(vehicleId, vehicleData);
    });

    // Handler to delete vehicle
    ipcMain.handle('delete-vehicle', async (event, vehicleId) => {
        return await deleteVehicle(vehicleId);
    });
};

// Exporting the function to be used in main.js
export default registerVehicleHandlers;