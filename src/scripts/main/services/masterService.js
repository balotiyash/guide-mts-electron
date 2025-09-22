/**
 * File: src/scripts/main/services/masterService.js
 * Author: Yash Balotiya
 * Description: This file contains the main service functions for master registration page
 * Created on: 21/09/2025
 * Last Modified: 23/09/2025
 */

// Importing required modules & libraries
import { runQuery } from './dbService.js';
import { getFormattedDateTime } from '../../shared.js';

// Function to get all active instructors
const getAllInstructors = async () => {
    try {
        const result = await runQuery({
            sql: `SELECT id, instructor_name, instructor_license_no, license_expiration_date
                  FROM instructors 
                  WHERE is_active = 'true';`,
            params: [],
            type: "all" // fetch all matching rows
        });

        return {
            status: "success",
            data: result
        };
    } catch (error) {
        console.error("Error fetching active instructors:", error);
        return {
            status: "error",
            message: "Failed to fetch active instructors."
        };
    }
};

// Function to add a new instructor
const addInstructor = async (data) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        const params = [data.name, data.licenseNo, data.expirationDate, "true", now, now];

        const result = await runQuery({
            sql: `INSERT INTO instructors (instructor_name, instructor_license_no, license_expiration_date, is_active, created_on, updated_on)
                  VALUES (?, ?, ?, ?, ?, ?);`,
            params: params,
            type: "run"
        });

        return {
            status: "success"
        };
    } catch (error) {
        console.error("Error adding instructor:", error);
        return {
            status: "error",
            message: "Failed to add instructor."
        };
    }
};

// Function to update an existing instructor
const updateInstructor = async (data) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        const params = [data.name, data.licenseNo, data.expirationDate, now, data.id];

        const result = await runQuery({
            sql: `UPDATE instructors 
                  SET instructor_name = ?, instructor_license_no = ?, license_expiration_date = ?, updated_on = ?
                  WHERE id = ?;`,
            params: params,
            type: "run"
        });

        return {
            status: "success"
        };
    } catch (error) {
        console.error("Error updating instructor:", error);
        return {
            status: "error",
            message: "Failed to update instructor."
        };
    }
};

// Function to delete (soft delete) an instructor
const deleteInstructor = async (instructorId) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        const params = ["false", now, instructorId];

        const result = await runQuery({
            sql: `UPDATE instructors 
                  SET is_active = ?, updated_on = ?
                  WHERE id = ?;`,
            params: params,
            type: "run"
        });

        return {
            status: "success"
        };
    } catch (error) {
        console.error("Error deleting instructor:", error);
        return {
            status: "error",
            message: "Failed to delete instructor."
        };
    }
};

// Exporting the functions
export {
    getAllInstructors,
    addInstructor,
    updateInstructor,
    deleteInstructor
};