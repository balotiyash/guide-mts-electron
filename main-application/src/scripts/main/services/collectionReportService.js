/**
 * File: src/scripts/main/services/collectionReportService.js
 * Author: Yash Balotiya
 * Description: Service functions for collection report data
 * Created on: 12/10/2025
 * Last Modified: 22/12/2025
 */

// Import required modules & libraries
import { runQuery } from './dbService.js';

// Function to get all collection data
export const getAllCollections = async () => {
    try {
        // SQL query to fetch collection data
        const query = `
            SELECT 
                p.id as payment_id,
                c.customer_name,
                c.mobile_number,
                CAST(p.amount_paid AS REAL) as amount_paid,
                p.payment_mode,
                p.created_on as payment_date,
                wd.work as work_description,
                '' as remarks,
                c.id as customer_id
            FROM 
                payments p
            JOIN 
                work_descriptions wd ON p.work_desc_id = wd.id
            JOIN 
                customers c ON wd.customer_id = c.id
            ORDER BY 
                p.created_on DESC, p.id DESC
        `;

        // Execute the query
        const collections = runQuery({ sql: query, params: [], type: 'all' });

        // Return the fetched data
        return {
            success: true,
            data: collections,
            message: 'Collection data retrieved successfully'
        };
    } catch (error) {
        // Handle any errors
        console.error('Error fetching collection data:', error);
        
        // Return error response
        return {
            success: false,
            data: [],
            message: 'Failed to fetch collection data',
            error: error.message
        };
    }
};