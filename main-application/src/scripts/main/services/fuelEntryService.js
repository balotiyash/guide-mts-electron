/**
 * File: src/scripts/main/services/fuelEntryService.js
 * Author: Yash Balotiya
 * Description: Service functions for daily fuel entries management, combined and corrected.
 * Created on: 28/09/2025
 * Last Modified: 11/10/2025
 */

// importing required modules & libraries
import { runQuery } from './dbService.js';
import { getFormattedDateTime } from '../../shared.js';
import { getDisplayedKm, loadData } from './fuelEntryService2.js';

// Get existing fuel entry for a specific vehicle and date
const getFuelEntry = (vehicleId, refuelDate) => {
    try {
        const result = runQuery({
            sql: `SELECT id, vehicle_id, refuel_date, fuel_amount, created_on, updated_on
                  FROM daily_fuel_entries 
                  WHERE vehicle_id = ? AND refuel_date = ?;`,
            params: [vehicleId, refuelDate],
            type: "get" // fetch single row
        });

        return result || null;
    } catch (error) {
        console.error("Error fetching fuel entry:", error);
        throw error;
    }
};

// Add new fuel entry
const addFuelEntry = (vehicleId, refuelDate, fuelAmount) => {
    const now = getFormattedDateTime();
    
    try {
        const params = [vehicleId, refuelDate, fuelAmount.toString(), now, now];
        
        const result = runQuery({
            sql: `INSERT INTO daily_fuel_entries (vehicle_id, refuel_date, fuel_amount, created_on, updated_on)
                  VALUES (?, ?, ?, ?, ?);`,
            params: params,
            type: "run"
        });

        return result;
    } catch (error) {
        console.error("Error adding fuel entry:", error);
        throw error;
    }
};

// Update existing fuel entry
const updateFuelEntry = (entryId, fuelAmount) => {
    const now = getFormattedDateTime();
    
    try {
        const params = [fuelAmount.toString(), now, entryId];
        
        const result = runQuery({
            sql: `UPDATE daily_fuel_entries 
                  SET fuel_amount = ?, updated_on = ?
                  WHERE id = ?;`,
            params: params,
            type: "run"
        });

        return result;
    } catch (error) {
        console.error("Error updating fuel entry:", error);
        throw error;
    }
};

// Save fuel entry (add new or update existing)
const saveFuelEntry = (vehicleId, refuelDate, fuelAmount) => {
    try {
        const existingEntry = getFuelEntry(vehicleId, refuelDate);

        if (existingEntry) {
            const result = updateFuelEntry(existingEntry.id, fuelAmount);
            return { success: true, action: 'updated', entryId: existingEntry.id, result: result };
        } else {
            const result = addFuelEntry(vehicleId, refuelDate, fuelAmount);
            return { success: true, action: 'created', entryId: result.lastID, result: result };
        }
    } catch (error) {
        console.error("Error saving fuel entry:", error);
        return { success: false, error: error.message };
    }
};

// Function to save kilometers entry (modified to store on first day of month)
const saveKilometersEntry = async (vehicleId, entryDate, kmRan) => {
    try {
        // Convert the entry date to the first day of the month for consistency
        const date = new Date(entryDate);
        const firstDayOfMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        
        // Check if entry exists for this vehicle and month (using first day of month)
        const existingEntry = await runQuery({
            sql: `
                SELECT id 
                FROM vehicle_kilometers 
                WHERE vehicle_id = ? AND entry_date = ?;
            `,
            params: [vehicleId, firstDayOfMonth],
            type: 'get'
        });

        const now = getFormattedDateTime();

        if (existingEntry) {
            // Update existing km value
            await runQuery({
                sql: `
                    UPDATE vehicle_kilometers
                    SET km_ran = ?, updated_on = ?
                    WHERE id = ?;
                `,
                params: [kmRan, now, existingEntry.id],
                type: 'run'
            });
        } else {
            // Insert new monthly km entry (using first day of month)
            await runQuery({
                sql: `
                    INSERT INTO vehicle_kilometers (vehicle_id, entry_date, km_ran, created_on, updated_on)
                    VALUES (?, ?, ?, ?, ?);
                `,
                params: [vehicleId, firstDayOfMonth, kmRan, now, now],
                type: 'run'
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving kilometers entry:', error);
        return { success: false, error: error.message };
    }
};

// Exporting functions
export { 
    getFuelEntry, 
    saveFuelEntry,
    saveKilometersEntry,
    getDisplayedKm,
    loadData
};