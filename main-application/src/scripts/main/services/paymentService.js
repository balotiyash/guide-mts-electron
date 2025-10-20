/**
 * File: src/scripts/main/services/paymentService.js
 * Author: Yash Balotiya
 * Description: Service functions for payment processing and management.
 * Created on: 30/09/2025
 * Last Modified: 20/10/2025
 */

// Importing required modules & libraries
import { runQuery } from "./dbService.js";
import { getFormattedDateTime } from "../../shared.js";

// Payment Service Object
// Function to get all pending payments
const getAllPendingPayments = async () => {
    const result = await runQuery({
        sql: `
                SELECT 
                    c.id AS customer_id,
                    wd.id AS work_id,
                    c.customer_name,
                    wd.work,
                    c.mobile_number,
                    CAST(wd.charged_amount AS REAL) AS charged_amount,
                    (CAST(wd.charged_amount AS REAL) - IFNULL(SUM(CAST(p.amount_paid AS REAL)), 0)) AS pending_amount
                FROM work_descriptions wd
                JOIN customers c 
                    ON c.id = wd.customer_id
                LEFT JOIN payments p 
                    ON wd.id = p.work_desc_id
                GROUP BY wd.id, c.id, c.customer_name, wd.work, wd.charged_amount
                HAVING pending_amount > 0
                ORDER BY wd.id DESC;
            `,
        params: [],
        type: "all"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Fetched all pending payments successfully'
    };
}

// Function to get paid payments with pagination
const getAllPaidPayments = async () => {
    const result = await runQuery({
        sql: `
            SELECT 
                p.id AS payment_id,
                c.id AS customer_id,
                c.customer_name,
                wd.id AS work_id,
                wd.work,
                p.payment_mode,
                CAST(wd.charged_amount AS REAL) AS charged_amount,
                CAST(p.amount_paid AS REAL) AS paid_amount,
                p.created_on
            FROM payments p
            JOIN customers c ON c.id = p.customer_id
            JOIN work_descriptions wd ON wd.id = p.work_desc_id
            ORDER BY p.created_on DESC;
        `,
        params: [],
        type: "all"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Fetched all paid payments successfully'
    };
};

// Function to submit a payment
const submitPayment = async (userId, workId, amount, mode) => {
    const now = getFormattedDateTime();
    const result = await runQuery({
        sql: `
            INSERT INTO payments (customer_id, work_desc_id, payment_mode, amount_paid, created_on, updated_on)
            VALUES (?, ?, ?, ?, ?, ?);
        `,
        params: [userId, workId, mode, amount, now, now],
        type: "run"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Payment submitted successfully'
    };
};

// Function to update a payment
const updatePayment = async (paymentId, amount, mode) => {
    const now = getFormattedDateTime();
    const result = await runQuery({
        sql: `
            UPDATE payments 
    SET amount_paid = ?, payment_mode = ?, updated_on = datetime('now')
    WHERE id = ?
        `,
        params: [amount, mode, paymentId],
        type: "run"
    });

    return {
        status: 200,
        success: true,
        data: result,
        message: 'Payment updated successfully'
    };
};

const getPaymentsByUserId = async (userId, workId, type) => {
    if (!userId) throw new Error('User ID is required');

    // Fetch customer info
    const customerResult = await runQuery({
        sql: `SELECT id, customer_name FROM customers WHERE id = ?`,
        params: [userId],
        type: 'get'
    });

    if (!customerResult) throw new Error('Customer not found');

    let sql = `
        SELECT 
            p.id AS payment_id,
            wd.id AS work_id,
            wd.work AS work,
            p.payment_mode,
            CAST(p.amount_paid AS REAL) AS paid_amount,
            CAST(wd.charged_amount AS REAL) AS charged_amount,
            p.created_on AS date
        FROM payments p
        JOIN work_descriptions wd ON wd.id = p.work_desc_id
        WHERE p.customer_id = ? AND p.work_desc_id = ?
        ORDER BY p.created_on ASC
    `;

    // If type is 'pending', fetch only pending payments
    const params = [userId, workId];

    // If type is 'pending', modify the query to fetch only pending payments
    const payments = await runQuery({
        sql,
        params,
        type: 'all'
    });

    return {
        name: customerResult.customer_name,
        payments,
        type
    };
};

// Exporting the payment service functions
export default {
    getAllPendingPayments,
    getAllPaidPayments,
    submitPayment,
    updatePayment,
    getPaymentsByUserId
};
