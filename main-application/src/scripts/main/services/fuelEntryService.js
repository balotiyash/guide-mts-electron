/** * File: src/scripts/main/services/fuelEntryService.js
 * Author: Yash Balotiya
 * Description: Service functions for daily fuel entries management, combined and corrected.
 * Created on: 28/09/2025
 * Last Modified: 28/09/2025
 */

// importing required modules & libraries
import { runQuery } from './dbService.js';
import { getFormattedDateTime } from '../../shared.js';

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

// Get the last recorded kilometers for a vehicle before a specific month
const getLastKm = async (vehicleId, month) => {
    try {
        const result = await runQuery({
            sql: `
                SELECT km_ran, entry_date 
                FROM vehicle_kilometers 
                WHERE vehicle_id = ? 
                  AND entry_date < date(?, 'start of month')
                ORDER BY entry_date DESC
                LIMIT 1;
            `,
            params: [vehicleId, month + '-01'],
            type: 'get'
        });

        return result ? result.km_ran : 0;
    } catch (error) {
        console.error('Error fetching last km:', error);
        return 0;
    }
};

// Function to save fuel entry (simplified - no kilometers)
const saveKilometersEntry = async (vehicleId, entryDate, kmRan) => {
    try {
        // Check if entry exists for this vehicle and month
        const existingEntry = await runQuery({
            sql: `
                SELECT id 
                FROM vehicle_kilometers 
                WHERE vehicle_id = ? AND entry_date = ?;
            `,
            params: [vehicleId, entryDate],
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
            // Insert new monthly km entry
            await runQuery({
                sql: `
                    INSERT INTO vehicle_kilometers (vehicle_id, entry_date, km_ran, created_on, updated_on)
                    VALUES (?, ?, ?, ?, ?);
                `,
                params: [vehicleId, entryDate, kmRan, now, now],
                type: 'run'
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving kilometers entry:', error);
        return { success: false, error: error.message };
    }
};

const getDisplayedKm = async (vehicleId, entryDate) => {
    const month = entryDate.slice(0, 7);

    // Get last km before this month
    const lastKmResult = await runQuery({
        sql: `
            SELECT km_ran
            FROM vehicle_kilometers
            WHERE vehicle_id = ? AND entry_date < date(?, 'start of month')
            ORDER BY entry_date DESC
            LIMIT 1;
        `,
        params: [vehicleId, month + '-01'],
        type: 'get'
    });
    const lastKm = lastKmResult ? lastKmResult.km_ran : 0;

    // Get current month km entry
    const currentEntry = await runQuery({
        sql: `
            SELECT km_ran
            FROM vehicle_kilometers
            WHERE vehicle_id = ? AND entry_date = ?;
        `,
        params: [vehicleId, entryDate],
        type: 'get'
    });
    const currentKm = currentEntry ? currentEntry.km_ran : 0;

    // Return difference
    return currentKm - lastKm;
};

// Load total fuel amount for all vehicles in a specific month
const loadData = async (month) => {
    try {
        const result = await runQuery({
            sql: `
                SELECT 
                    v.id AS vehicle_id,
                    v.vehicle_name AS car_name,
                    v.vehicle_fuel_type AS fuel_type,
                    COALESCE(SUM(CAST(d.fuel_amount AS REAL)), 0) AS fuel_amount,
                    (IFNULL(k.km_ran, 0) - 
                        IFNULL((
                            SELECT km_ran 
                            FROM vehicle_kilometers 
                            WHERE vehicle_id = v.id AND entry_date < date(?, 'start of month')
                            ORDER BY entry_date DESC LIMIT 1
                        ), 0)
                    ) AS km_diff,
                    IFNULL(k.km_ran, 0) AS km_total
                FROM vehicles v
                LEFT JOIN daily_fuel_entries d 
                    ON v.id = d.vehicle_id 
                    AND strftime('%Y-%m', d.refuel_date) = ?
                LEFT JOIN vehicle_kilometers k
                    ON v.id = k.vehicle_id 
                    AND strftime('%Y-%m', k.entry_date) = ?
                GROUP BY v.id, v.vehicle_name, v.vehicle_fuel_type, k.km_ran
                HAVING COALESCE(SUM(CAST(d.fuel_amount AS REAL)), 0) > 0
                ORDER BY v.vehicle_name;
            `,
            params: [month + '-01', month, month],
            type: "all"
        });

        return { status: "success", data: result };
    } catch (error) {
        console.error("Error loading fuel data:", error);
        return { status: "error", message: "Failed to load fuel data." };
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