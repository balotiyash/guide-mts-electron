/**
 * File: src/scripts/main/services/searchService.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for search functionality.
 * Created on: 11/10/2025
 * Last Modified: 24/12/2025
 */

// Importing required modules & libraries
import { runQuery } from "./dbService.js";

// Function to get all customers => Search Customer Page
const getAllCustomers = async () => {
    const result = await runQuery({
        sql: `
            SELECT id, customer_name, mobile_number, customer_dob, relation_name, address, created_on
            FROM customers
            ORDER BY id DESC;
        `,
        params: [],
        type: "all"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Fetched all customers successfully'
    };
};

// Exporting the functions
export { getAllCustomers };