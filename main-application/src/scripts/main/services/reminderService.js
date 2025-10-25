/**
 * File: src/scripts/main/services/reminderService.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for reminder functionality.
 * Created on: 24/10/2025
 * Last Modified: 25/10/2025
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
        sql: `SELECT customer_name, ll_no_1, ll_no_2, ll_class_1, ll_class_2, ll_issued_date, mobile_number FROM customers WHERE date(ll_issued_date) = date('now', '-29 days', 'localtime');`,
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

// Payment Reminder Service
const getPaymentReminders = async () => {
    const result = await runQuery({
        sql: `
            SELECT 
                c.customer_name,
                c.mobile_number,
                w.work AS work_description,
                CAST(w.charged_amount AS REAL) AS charged_amount,
                (CAST(w.charged_amount AS REAL) - IFNULL(SUM(CAST(p.amount_paid AS REAL)), 0)) AS pending_amount
            FROM customers c
            JOIN work_descriptions w 
                ON w.customer_id = c.id
            LEFT JOIN payments p 
                ON p.customer_id = c.id
            WHERE 
                date(c.ll_issued_date) <= date('now', '-11 days', 'localtime')
            GROUP BY 
                c.id, w.id
            HAVING 
                pending_amount > 0;
        `,
        params: [],
        type: "all"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Fetched payment reminders successfully'
    };
};

// License Expiration Reminder Service
const getLicenseExpirationReminders = async () => {
    const result = await runQuery({
        sql: `SELECT customer_name, mdl_no, mdl_class, mdl_validity_date, mobile_number FROM customers WHERE DATE(mdl_validity_date) = DATE('now', 'localtime');`,
        params: [],
        type: "all"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Fetched Licence Expiry reminders successfully'
    };
};

// Exporting all reminder services
export {
    getBirthdayReminders,
    getLicenseExpirationReminders,
    getPaymentReminders,
    getLLReminders
};