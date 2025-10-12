/**
 * File: src/scripts/main/services/balanceReportService.js
 * Author: Yash Balotiya
 * Description: Service functions for balance report data
 * Created on: 12/10/2025
 * Last Modified: 12/10/2025
 */

import { runQuery } from './dbService.js';

// Function to get all balance data
export const getAllBalances = async () => {
    try {
        const query = `
            SELECT
                c.id AS customer_id,
                c.customer_name,
                c.mobile_number,
                c.created_on as registration_date,

                -- Total charged
                COALESCE((
                    SELECT SUM(CAST(wd1.charged_amount AS REAL))
                    FROM work_descriptions wd1
                    WHERE wd1.customer_id = c.id
                ), 0) AS total_charged_amount,

                -- Total paid (sum of installments)
                COALESCE((
                    SELECT SUM(CAST(p1.amount_paid AS REAL))
                    FROM payments p1
                    WHERE p1.customer_id = c.id
                ), 0) AS total_paid_amount,

                -- Balance = charged - paid
                (
                    COALESCE((
                    SELECT SUM(CAST(wd2.charged_amount AS REAL))
                    FROM work_descriptions wd2
                    WHERE wd2.customer_id = c.id
                    ), 0)
                    -
                    COALESCE((
                    SELECT SUM(CAST(p2.amount_paid AS REAL))
                    FROM payments p2
                    WHERE p2.customer_id = c.id
                    ), 0)
                ) AS balance_amount,

                -- Last payment date
                (
                    SELECT MAX(p3.created_on)
                    FROM payments p3
                    WHERE p3.customer_id = c.id
                ) AS last_payment_date,

                -- Work descriptions (combine all distinct works)
                (
                    SELECT GROUP_CONCAT(work, ', ')
                    FROM (
                    SELECT DISTINCT work
                    FROM work_descriptions
                    WHERE customer_id = c.id
                    )
                ) AS work_description

                FROM customers c
                WHERE (
                COALESCE((
                    SELECT SUM(CAST(wd4.charged_amount AS REAL))
                    FROM work_descriptions wd4
                    WHERE wd4.customer_id = c.id
                ), 0)
                -
                COALESCE((
                    SELECT SUM(CAST(p4.amount_paid AS REAL))
                    FROM payments p4
                    WHERE p4.customer_id = c.id
                ), 0)
                ) > 0
                ORDER BY c.id DESC
        `;

        const balances = runQuery({ sql: query, params: [], type: 'all' });

        return {
            success: true,
            data: balances,
            message: 'Balance data retrieved successfully'
        };
    } catch (error) {
        console.error('Error fetching balance data:', error);
        return {
            success: false,
            data: [],
            message: 'Failed to fetch balance data',
            error: error.message
        };
    }
};