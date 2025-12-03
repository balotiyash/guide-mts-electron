/**
 * File: src/scripts/main/services/form14Service.js
 * Author: Yash Balotiya
 * Description: Service for Form 14 data operations
 * Created on: 01/10/2025
 * Last Modified: 03/12/2025
 */

// Importing required modules & libraries
import { runQuery } from './dbService.js';
import { ddmmyyyyToISO } from '../../shared.js';

// Convert BLOB data to base64 string
const processBlobData = (blobData) => {
    if (!blobData) return null;
    
    try {
        // Convert Buffer to base64 string
        if (Buffer.isBuffer(blobData)) {
            return blobData.toString('base64');
        }
        
        // If it's already a string, return as-is
        if (typeof blobData === 'string') {
            return blobData;
        }
        
        return null;
    } catch (error) {
        console.error('Error processing BLOB data:', error);
        return null;
    }
};

// Get Form 14 data for a date range
const getForm14Data = async (startDate, endDate) => {
    try {
        // Convert DD-MM-YYYY to YYYY-MM-DD for database query
        const startDateSQL = ddmmyyyyToISO(startDate);
        const endDateSQL = ddmmyyyyToISO(endDate);

        const query = `
            SELECT 
                c.id,
                c.mobile_number,
                c.customer_image,
                c.customer_signature,
                c.customer_name,
                c.customer_dob,
                c.relation_name,
                c.address,
                c.ll_no_1,
                c.ll_class_1,
                c.ll_no_2,
                c.ll_class_2,
                c.ll_issued_date,
                c.ll_validity_date,
                c.mdl_no,
                c.mdl_class,
                c.mdl_issued_date,
                c.mdl_validity_date,
                c.endorsement,
                c.endorsement_date,
                c.endorsement_validity_date,
                c.customer_vehicle_no,
                c.created_on,
                c.updated_on,
                MAX(p.created_on) as completion_date
            FROM customers c
            LEFT JOIN payments p ON c.id = p.customer_id
            WHERE DATE(c.created_on) BETWEEN ? AND ?
            AND c.ll_no_1 IS NOT NULL
            AND c.ll_class_1 IS NOT NULL
            GROUP BY c.id
            ORDER BY c.created_on ASC
            `;

        const result = await runQuery({
            sql: query,
            params: [startDateSQL, endDateSQL],
            type: 'all'
        });
        
        // Process the results to handle BLOB data
        return result.map(student => ({
            ...student,
            customer_image: processBlobData(student.customer_image),
            customer_signature: processBlobData(student.customer_signature)
        }));

    } catch (error) {
        console.error('Error in getForm14Data:', error);
        throw error;
    }
};

// Get student count for a date range
const getStudentCount = async (startDate, endDate) => {
    try {
        const startDateSQL = ddmmyyyyToISO(startDate);
        const endDateSQL = ddmmyyyyToISO(endDate);

        const query = `
            SELECT COUNT(*) as count
            FROM customers
            WHERE DATE(created_on) BETWEEN ? AND ?
            AND vehicle_id IS NOT NULL 
            AND instructor_id IS NOT NULL
        `;

        const result = await runQuery({
            sql: query,
            params: [startDateSQL, endDateSQL],
            type: 'all'
        });
        return result[0]?.count || 0;

    } catch (error) {
        console.error('Error in getStudentCount:', error);
        throw error;
    }
};

// Get student data by ID
const getStudentById = async (studentId) => {
    try {
        const query = `
            SELECT 
                c.*,
                MAX(p.created_on) as completion_date
            FROM customers c
            LEFT JOIN payments p ON c.id = p.customer_id
            WHERE c.id = ?
            GROUP BY c.id
        `;

        const result = await runQuery({
            sql: query,
            params: [studentId],
            type: 'all'
        });
        
        if (result.length === 0) {
            throw new Error('Student not found');
        }

        const student = result[0];
        return {
            ...student,
            customer_image: processBlobData(student.customer_image),
            customer_signature: processBlobData(student.customer_signature)
        };

    } catch (error) {
        console.error('Error in getStudentById:', error);
        throw error;
    }
};

// Exporting the Form14Service functions
export {
    getForm14Data,
    getStudentCount,
    getStudentById,
    processBlobData
};

// Default export for backward compatibility
export default {
    getForm14Data,
    getStudentCount,
    getStudentById,
    processBlobData
};