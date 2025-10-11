/** 
 * File: src/scripts/main/services/dashboardService.js
 * Author: Yash Balotiya
 * Description: This file contains the JS code to interact with the database for the dashboard page.
 * Created on: 26/08/2025
 * Last Modified: 11/10/2025
*/

// Importing required modules & libraries
import { runQuery } from "./dbService.js";

// Function to get data for Chart 1
const getChart1Data = (selectedYear) => {
    const result = runQuery({
        sql: `
            SELECT strftime('%m', created_on) AS month,
            COUNT(*) AS count
            FROM customers
            WHERE strftime('%Y', created_on) = ?
            GROUP BY month
            ORDER BY month;
        `,
        params: [selectedYear],
        type: "all"
    });

    return result;
};

// Function to get data for Chart 2
const getChart2Data = (selectedYear) => {
    // Get revenue data
    const result1 = runQuery({
        sql: `
            SELECT strftime('%m', created_on) AS month,
            SUM(CAST(charged_amount AS REAL)) AS total_amount
            FROM work_descriptions
            WHERE strftime('%Y', created_on) = ?
            GROUP BY month
            ORDER BY month;
        `,
        params: [selectedYear],
        type: "all"
    });

    // Get fuel data
    const result2 = runQuery({
        sql: `
            SELECT strftime('%m', created_on) AS month,
            SUM(CAST(fuel_amount AS REAL)) AS total_amount
            FROM daily_fuel_entries
            WHERE strftime('%Y', created_on) = ?
            GROUP BY month
            ORDER BY month;
        `,
        params: [selectedYear],
        type: "all"
    });

    return {
        revenue: result1,
        fuel: result2
    };
};

// Function to get data for Chart 3
const getChart3Data = (selectedYear) => {
    const result = runQuery({
        sql: `
            SELECT 
                v.vehicle_name,
                COUNT(*) AS usage_count
            FROM customers c
            JOIN vehicles v ON c.vehicle_id = v.id
            WHERE strftime('%Y', c.created_on) = ?
            GROUP BY v.vehicle_name
            ORDER BY usage_count DESC;
        `,
        params: [selectedYear],
        type: "all"
    });

    return result;
};

// Function to get all time registrations count
const getAllTimeRegistrations = () => {
    const result = runQuery({
        sql: "SELECT COUNT(*) FROM customers;",
        params: [],
        type: "get"
    });

    return result["COUNT(*)"];
};

// Function to get registrations count from a specific year
const getRegistrationsFromYear = (year) => {
    const result = runQuery({
        sql: `
            SELECT COUNT(*) FROM customers
            WHERE CAST(STRFTIME('%Y', created_on) AS INTEGER) >= ?;
        `,
        params: [year],
        type: "get"
    });

    return result["COUNT(*)"];
};

// Function to get repeat students count
const getRepeatStudentsCount = () => {
    const result = runQuery({
        sql: `
            SELECT COUNT(*)
            FROM (
                SELECT customer_id
                FROM work_descriptions
                GROUP BY customer_id
                HAVING COUNT(*) > 1
            );
        `,
        params: [],
        type: "get"
    });

    return result["COUNT(*)"];
};

// Function to get pending payments count
const getPendingPaymentsCount = () => {
    const result = runQuery({
        sql: `
        SELECT COUNT(*) FROM (
            SELECT wd.id
            FROM work_descriptions wd
            JOIN customers c ON c.id = wd.customer_id
            LEFT JOIN payments p ON wd.id = p.work_desc_id
            GROUP BY wd.id
            HAVING (CAST(wd.charged_amount AS REAL) - IFNULL(SUM(CAST(p.amount_paid AS REAL)), 0)) > 0
        );`,
        params: [],
        type: "get"
    });

    return result["COUNT(*)"];
};

// Exporting all dashboard services
const allDashboardServices = {
    getAllTimeRegistrations,
    getRegistrationsFromYear,
    getRepeatStudentsCount,
    getPendingPaymentsCount,
    getChart1Data,
    getChart2Data,
    getChart3Data
};

// Exporting all dashboard services
export default allDashboardServices;