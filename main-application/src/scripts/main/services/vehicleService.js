/**
 * File: src/scripts/main/services/vehicleService.js
 * Author: Yash Balotiya
 * Description: This file contains the service functions for vehicle management
 * Created on: 23/09/2025
 * Last Modified: 28/09/2025
 */

import { runQuery } from './dbService.js';

const getAllVehicles = () => {
    try {
        const result = runQuery({
            sql: `SELECT id, vehicle_name, vehicle_model, vehicle_number, vehicle_fuel_type, is_active, created_on, updated_on
                  FROM vehicles 
                  ORDER BY created_on DESC;`,
            params: [],
            type: "all" // fetch all matching rows
        });

        return result || [];
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
    }
};

// Function to get current date and time in 'YYYY-MM-DD HH:MM:SS' format
const getFormattedDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const addVehicle = async (data) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        const params = [data.vehicle_name, data.vehicle_model, data.vehicle_number, data.vehicle_fuel_type, "true", now, now];
        
        const result = await runQuery({
            sql: `INSERT INTO vehicles (vehicle_name, vehicle_model, vehicle_number, vehicle_fuel_type, is_active, created_on, updated_on)
                  VALUES (?, ?, ?, ?, ?, ?, ?);`,
            params: params,
            type: "run"
        });

        return result;
    } catch (error) {
        console.error("Error adding vehicle:", error);
        throw error;
    }
};

const updateVehicle = async (vehicleId, data) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        const params = [data.vehicle_name, data.vehicle_model, data.vehicle_number, data.vehicle_fuel_type, now, vehicleId];
        
        const result = await runQuery({
            sql: `UPDATE vehicles 
                  SET vehicle_name = ?, vehicle_model = ?, vehicle_number = ?, vehicle_fuel_type = ?, updated_on = ?
                  WHERE id = ?;`,
            params: params,
            type: "run"
        });

        return result;
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw error;
    }
};

const deleteVehicle = async (vehicleId) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        const params = ["false", now, vehicleId];
        
        const result = await runQuery({
            sql: `UPDATE vehicles 
                  SET is_active = ?, updated_on = ?
                  WHERE id = ?;`,
            params: params,
            type: "run"
        });

        return result;
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        throw error;
    }
};

export { getAllVehicles, addVehicle, updateVehicle, deleteVehicle };