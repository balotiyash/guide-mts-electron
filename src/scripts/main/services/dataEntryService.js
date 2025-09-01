/** 
 * File: src/scripts/main/services/dataEntryService.js
 * Author: Yash Balotiya
 * Description: Service layer for data entry operations. This file interactes with the database.
 * Created on: 31/08/2025
 * Last Modified: 01/09/2025
*/

// Importing required modules & libraries
import { runQuery } from "./dbService.js";

// Fetching Dropdown Names for vehicles & instructors
const getDropDownNames = async (value) => {
    // Get the singular form of the value. Turns 'vehicles' → 'vehicle'
    const singular = value.slice(0, -1);

    // Fetching data from the database
    const result = await runQuery({
        sql: `
            SELECT id, ${singular}_name FROM ${value}
            WHERE is_active = 'true' AND ${singular}_name != 'dummy';
        `,
        params: [],
        type: "all"
    });

    return result;
};

// Searching for customer by phone number
const searchByPhoneNumber = async (phoneNumber) => {
    const result = await runQuery({
        sql: "SELECT * FROM customers WHERE mobile_number = ?;",
        params: [phoneNumber],
        type: "get"
    });

    return result;
}

// Fetching work descriptions for a user
const getWorkDescriptions = async (userId) => {
    const result = await runQuery({
        sql: `
            SELECT work, charged_amount, created_on
            FROM work_descriptions
            WHERE customer_id = ?
            ORDER BY created_on DESC;`,
        params: [userId],
        type: "all"
    });

    return result;
};

// Exporting all data entry service functions
const allDataEntryService = {
    getDropDownNames,
    searchByPhoneNumber,
    getWorkDescriptions
};

export default allDataEntryService;
