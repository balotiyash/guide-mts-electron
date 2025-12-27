/**
 * File: src/scripts/main/services/vehicleService.js
 * Author: Yash Balotiya
 * Description: This file contains the service functions for vehicle management
 * Created on: 23/09/2025
 * Last Modified: 27/12/2025
 */

// Importing required modules & libraries
import { runQuery } from './dbService.js';
import { getFormattedDateTime } from '../../shared.js';

// Function to get all vehicles
const getAllVehicles = () => {
    try {
        const result = runQuery({
            sql: `SELECT id, vehicle_name, vehicle_model, vehicle_number, vehicle_fuel_type, is_active, created_on, updated_on
                  FROM vehicles 
                  ORDER BY vehicle_name ASC;`,
            params: [],
            type: "all" // fetch all matching rows
        });

        return result || [];
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
    }
};

// Function to add a new vehicle
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

// Function to update vehicle details
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

// Function to delete (soft delete) a vehicle
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

// Exporting the functions
export { getAllVehicles, addVehicle, updateVehicle, deleteVehicle };