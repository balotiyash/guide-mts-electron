/**
 * File: src/scripts/main/services/fuelEntryService2.js
 * Author: Yash Balotiya
 * Description: Service functions for daily fuel entries management - helper functions.
 * Created on: 28/09/2025
 * Last Modified: 11/10/2025
 */

// importing required modules & libraries
import { runQuery } from './dbService.js';

// Get displayed kilometers for a vehicle on a specific date
const getDisplayedKm = async (vehicleId, entryDate) => {
    // Convert to first day of month for consistency
    const date = new Date(entryDate);
    const firstDayOfMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

    // Get last km before this month
    const lastKmResult = await runQuery({
        sql: `
            SELECT km_ran
            FROM vehicle_kilometers
            WHERE vehicle_id = ? AND entry_date < ?
            ORDER BY entry_date DESC
            LIMIT 1;
        `,
        params: [vehicleId, firstDayOfMonth],
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
        params: [vehicleId, firstDayOfMonth],
        type: 'get'
    });
    const currentKm = currentEntry ? currentEntry.km_ran : 0;

    // Return difference (km ran in current month)
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
                    (COALESCE(k.km_ran, 0) - 
                        COALESCE((
                            SELECT km_ran 
                            FROM vehicle_kilometers 
                            WHERE vehicle_id = v.id AND entry_date < ?
                            ORDER BY entry_date DESC LIMIT 1
                        ), 0)
                    ) AS km_diff,
                    COALESCE(k.km_ran, 0) AS km_total
                FROM vehicles v
                LEFT JOIN daily_fuel_entries d 
                    ON v.id = d.vehicle_id 
                    AND strftime('%Y-%m', d.refuel_date) = ?
                LEFT JOIN vehicle_kilometers k
                    ON v.id = k.vehicle_id 
                    AND k.entry_date = ?
                GROUP BY v.id, v.vehicle_name, v.vehicle_fuel_type, k.km_ran
                HAVING COALESCE(SUM(CAST(d.fuel_amount AS REAL)), 0) > 0
                ORDER BY v.vehicle_name;
            `,
            params: [month + '-01', month, month + '-01'],
            type: "all"
        });

        return { status: "success", data: result };
    } catch (error) {
        console.error("Error loading fuel data:", error);
        return { status: "error", message: "Failed to load fuel data." };
    }
};

// Exporting functions
export { getDisplayedKm, loadData };