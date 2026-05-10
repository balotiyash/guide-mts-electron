/**
 * File: src/scripts/main/services/dataEntryService.js
 * Author: Yash Balotiya
 * Description: Service layer for data entry operations. This file interactes with the database.
 * Created on: 31/08/2025
 * Last Modified: 10/05/2026
 */

// Importing required modules & libraries
import { runQuery, runTransaction } from "./dbService.js";
import { getFormattedDateTime } from "../../shared.js";
import { insertIntoWorkDescriptions, updateCustomer, deleteUser } from "./dataEntryService2.js";

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
            SELECT id, work, charged_amount, created_on
            FROM work_descriptions
            WHERE customer_id = ?
            ORDER BY created_on;`,
        params: [userId],
        type: "all"
    });

    return result;
};

// Creating a new customer
const createCustomer = async (formValues) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        // ROBUSTNESS FIX: Combine customer and work description in a SINGLE transaction
        // This ensures atomicity - both succeed or both fail, preventing orphaned customers
        const queries = [
            {
                sql: `
                INSERT INTO customers (
                    mobile_number, customer_image, customer_signature, customer_name, customer_dob,
                    relation_name, vehicle_id, instructor_id, address, ll_no_1, ll_class_1,
                    ll_no_2, ll_class_2, ll_issued_date, ll_validity_date,
                    mdl_no, mdl_class, mdl_issued_date, mdl_validity_date,
                    endorsement, endorsement_date, endorsement_validity_date,
                    customer_vehicle_no, created_on, updated_on
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `,
                params: [
                    formValues.phoneInput,
                    formValues.customerImageInput ? Buffer.from(formValues.customerImageInput, "base64") : null,
                    formValues.customerSignatureInput ? Buffer.from(formValues.customerSignatureInput, "base64") : null,
                    formValues.customerNameInput,
                    formValues.dobInput,
                    formValues.relationInput,
                    formValues.carSelect,
                    formValues.instructorSelect,
                    formValues.addressInput,
                    formValues.licenseInput,
                    formValues.classInput,
                    formValues.licenseInput2,
                    formValues.classInput2,
                    formValues.issuedOnInput,
                    formValues.validUntilInput,
                    formValues.mdlNoInput,
                    formValues.mdlClassInput,
                    formValues.mdlIssuedInput,
                    formValues.mdlValidUntilInput,
                    formValues.endorsementInput,
                    formValues.endorsementDatedInput,
                    formValues.endorsementValidityInput,
                    formValues.vehicleNoInput,
                    now,
                    now
                ],
                type: "run"
            }
        ];

        // Execute customer insertion
        const [result1] = await runTransaction(queries);

        // Add work description in the SAME transaction context if provided
        if (formValues.workDescriptionInput && formValues.amountInput) {
            const workQueries = [
                {
                    sql: `
                    INSERT INTO work_descriptions (customer_id, work, charged_amount, created_on, updated_on)
                    VALUES (?, ?, ?, ?, ?);
                    `,
                    params: [
                        result1.lastInsertRowid,
                        formValues.workDescriptionInput,
                        formValues.amountInput,
                        now,
                        now
                    ],
                    type: "run"
                }
            ];

            // Execute work description in transaction - MUST succeed for operation to be valid
            // If work description fails, customer creation fails too (atomic operation)
            try {
                await runTransaction(workQueries);
            } catch (workError) {
                console.error("Error creating work description:", workError);
                // ROBUSTNESS FIX: Rollback customer creation if work description fails
                // This prevents orphaned customers without work descriptions
                try {
                    await runQuery({
                        sql: "DELETE FROM customers WHERE id = ? LIMIT 1;",
                        params: [result1.lastInsertRowid],
                        type: "run"
                    });
                } catch (deleteError) {
                    console.error("Failed to rollback customer creation:", deleteError);
                }
                return {
                    status: "error",
                    statusCode: 500,
                    message: "Failed to create work description. Transaction rolled back."
                };
            }
        }

        // Returning the status of the operation
        return {
            status: "success",
            statusCode: 200,
            message: "Customer and work description created successfully."
        };
    } catch (error) {
        console.error("Error creating customer:", error);
        return {
            status: "error",
            statusCode: 500,
            message: "Failed to create customer."
        };
    }
};

// Function to delete a job
const deleteJob = async (jobId) => {
    try {
        // Use transaction to ensure both deletions succeed or both fail
        const queries = [
            {
                sql: "DELETE FROM payments WHERE work_desc_id = ?;",
                params: [jobId],
                type: "run"
            },
            {
                sql: "DELETE FROM work_descriptions WHERE id = ?;",
                params: [jobId],
                type: "run"
            }
        ];

        await runTransaction(queries);

        return {
            status: "success",
            statusCode: 200,
            message: "Job deleted successfully."
        };
    } catch (error) {
        console.error("Error deleting job:", error);
        return {
            status: "error",
            statusCode: 500,
            message: "Failed to delete job."
        };
    }
};

// Exporting all data entry service functions
const allDataEntryService = {
    getDropDownNames,
    searchByPhoneNumber,
    createCustomer,
    insertIntoWorkDescriptions,
    updateCustomer,
    getWorkDescriptions,
    deleteUser,
    deleteJob
};

// Exporting all data entry service functions
export default allDataEntryService;