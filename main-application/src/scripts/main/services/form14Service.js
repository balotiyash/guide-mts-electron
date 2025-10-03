/**
 * File: src/scripts/main/services/form14Service.js
 * Author: Yash Balotiya
 * Description: Service for Form 14 data operations
 * Created on: 01/10/2025
 * Last Modified: 01/10/2025
 */

import { runQuery } from './dbService.js';

class Form14Service {
    constructor() {
        // No need for dbService instance, using runQuery directly
    }

    /**
     * Get Form 14 data for a date range
     * @param {string} startDate - Start date in DD-MM-YYYY format
     * @param {string} endDate - End date in DD-MM-YYYY format
     * @returns {Promise<Array>} Array of student records
     */
    async getForm14Data(startDate, endDate) {
        try {
            // Convert DD-MM-YYYY to YYYY-MM-DD for database query
            const startDateSQL = this.convertDateFormat(startDate);
            const endDateSQL = this.convertDateFormat(endDate);

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
                AND c.vehicle_id IS NOT NULL 
                AND c.instructor_id IS NOT NULL
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
                customer_image: this.processBlobData(student.customer_image),
                customer_signature: this.processBlobData(student.customer_signature)
            }));

        } catch (error) {
            console.error('Error in Form14Service.getForm14Data:', error);
            throw error;
        }
    }

    /**
     * Convert DD-MM-YYYY to YYYY-MM-DD format
     * @param {string} dateString - Date in DD-MM-YYYY format
     * @returns {string} Date in YYYY-MM-DD format
     */
    convertDateFormat(dateString) {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    /**
     * Process BLOB data to base64 string
     * @param {Buffer} blobData - BLOB data from database
     * @returns {string|null} Base64 string or null
     */
    processBlobData(blobData) {
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
    }

    /**
     * Get student count for a date range
     * @param {string} startDate - Start date in DD-MM-YYYY format
     * @param {string} endDate - End date in DD-MM-YYYY format
     * @returns {Promise<number>} Number of students
     */
    async getStudentCount(startDate, endDate) {
        try {
            const startDateSQL = this.convertDateFormat(startDate);
            const endDateSQL = this.convertDateFormat(endDate);

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
            console.error('Error in Form14Service.getStudentCount:', error);
            throw error;
        }
    }

    /**
     * Get student data by ID
     * @param {number} studentId - Student ID
     * @returns {Promise<Object>} Student record
     */
    async getStudentById(studentId) {
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
                customer_image: this.processBlobData(student.customer_image),
                customer_signature: this.processBlobData(student.customer_signature)
            };

        } catch (error) {
            console.error('Error in Form14Service.getStudentById:', error);
            throw error;
        }
    }
}

export default Form14Service;