/**
 * File: src/scripts/main/services/reminderService.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for reminder functionality.
 * Created on: 24/10/2025
 * Last Modified: 24/10/2025
 */

// Importing required modules & libraries
import { runQuery } from "./dbService.js";

// Birthday Reminder Service
const getBirthdayReminders = async () => {
    const result = await runQuery({
        sql: `SELECT customer_name, customer_dob, mobile_number FROM customers WHERE strftime('%m-%d', customer_dob) = strftime('%m-%d', 'now', 'localtime');`,
        params: [],
        type: "all"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Fetched birthday reminders successfully'
    };
};

// LL Reminder Service
const getLLReminders = async () => {
    const result = await runQuery({
        sql: `SELECT customer_name, ll_no_1, ll_no_2, ll_class_1, ll_class_2, ll_issued_date, mobile_number FROM customers WHERE date(ll_issued_date) = date('now', '-15 days', 'localtime');`,
        params: [],
        type: "all"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Fetched LL reminders successfully'
    };
};

// License Expiration Reminder Service
const getLicenseExpirationReminders = async () => {
    const result = await runQuery({
        sql: `SELECT id, customer_name, license_expiry_date, mobile_number FROM customers WHERE license_expiry_date IS NOT NULL AND license_expiry_date <= CURRENT_DATE + INTERVAL '30 days'`,
        params: [],
        type: "all"
    });
    return result;
};

// Payment Reminder Service
const getPaymentReminders = async () => {
    const result = await runQuery({
        sql: `SELECT id, customer_name, due_date, mobile_number FROM payments WHERE due_date IS NOT NULL AND due_date <= CURRENT_DATE + INTERVAL '7 days'`,
        params: [],
        type: "all"
    });
    return result;
};

// Exporting all reminder services
export {
    getBirthdayReminders,
    getLicenseExpirationReminders,
    getPaymentReminders,
    getLLReminders
};