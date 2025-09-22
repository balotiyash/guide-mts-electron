/**
 * File: src/scripts/main/services/dataEntryService.js
 * Author: Yash Balotiya
 * Description: Service layer for data entry operations. This file interactes with the database.
 * Created on: 31/08/2025
 * Last Modified: 14/09/2025
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
            SELECT id, work, charged_amount, created_on
            FROM work_descriptions
            WHERE customer_id = ?
            ORDER BY created_on;`,
        params: [userId],
        type: "all"
    });

    return result;
};

// Function to get current date and time in 'YYYY-MM-DD HH:MM:SS' format
const getFormattedDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Creating a new customer
const createCustomer = async (formValues) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        // Inserting into Customers Table
        const result1 = await runQuery({
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
                formValues.carSelect, // <-- Corrected
                formValues.instructorSelect, // <-- Corrected
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
        });

        // Inserting into Work Descriptions Table
        // Only insert if work description or amount is present
        if (formValues.workDescriptionInput || formValues.amountInput) {
            // await runQuery({
            //     sql: `
            //         INSERT INTO work_descriptions (customer_id, work, charged_amount, created_on, updated_on)
            //         VALUES (?, ?, ?, ?, ?);
            //     `,
            //     params: [
            //         result1.lastInsertRowid,
            //         formValues.workDescriptionInput,
            //         formValues.amountInput,
            //         now,
            //         now
            //     ],
            //     type: "run"
            // });

            const workResult = await insertIntoWorkDescriptions(result1.lastInsertRowid, formValues.workDescriptionInput, formValues.amountInput);
            if (workResult.status === "error") {
                return workResult; // Return the error if insertion into work_descriptions fails
            }
        }

        // Returning the status of the operation
        return {
            status: "success",
            statusCode: 200,
            message: "Customer created successfully."
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

// Creating a new job for an existing or new customer
const insertIntoWorkDescriptions = async (userId, workDescriptionInput, amountInput) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        await runQuery({
            sql: `
                INSERT INTO work_descriptions (customer_id, work, charged_amount, created_on, updated_on)
                VALUES (?, ?, ?, ?, ?);
            `,
            params: [
                userId,
                workDescriptionInput,
                amountInput,
                now,
                now
            ],
            type: "run"
        });

        return {
            status: "success",
            statusCode: 200,
            message: "Work description added successfully."
        };
    } catch (error) {
        console.error("Error adding work description:", error);
        return {
            status: "error",
            statusCode: 500,
            message: "Failed to add work description."
        };
    }
};

// Updating an existing customer
const updateCustomer = async (userId, jobId, formValues) => {
    // Getting the current timestamp
    const now = getFormattedDateTime();

    try {
        // Updating Customers Table
        await runQuery({
            sql: `
            UPDATE customers
            SET
                mobile_number = ?,
                customer_image = COALESCE(?, customer_image),
                customer_signature = COALESCE(?, customer_signature),
                customer_name = ?,
                customer_dob = ?,
                relation_name = ?,
                vehicle_id = ?,
                instructor_id = ?,
                address = ?,
                ll_no_1 = ?,
                ll_class_1 = ?,
                ll_no_2 = ?,
                ll_class_2 = ?,
                ll_issued_date = ?,
                ll_validity_date = ?,
                mdl_no = ?,
                mdl_class = ?,
                mdl_issued_date = ?,
                mdl_validity_date = ?,
                endorsement = ?,
                endorsement_date = ?,
                endorsement_validity_date = ?,
                customer_vehicle_no = ?,
                updated_on = ?
            WHERE id = ?;
            `,

            // update both image only if new image is provided else keep old image
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
                userId
            ],
            type: "run"
        });

        // Updating Work Descriptions Table
        // Only update if jobId, work description and amount are present
        if (jobId && formValues.workDescriptionInput && formValues.amountInput) {
            await runQuery({
                sql: `
                UPDATE work_descriptions
                SET
                    work = ?,
                    charged_amount = ?,
                    updated_on = ?
                WHERE id = ?;
            `,
                params: [
                    formValues.workDescriptionInput,
                    formValues.amountInput,
                    now,
                    jobId
                ],
                type: "run"
            });
        }

        return {
            status: "success",
            statusCode: 200,
            message: "Customer updated successfully."
        };
    } catch (error) {
        console.error("Error updating customer:", error);
        return {
            status: "error",
            statusCode: 500,
            message: "Failed to update customer."
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
    getWorkDescriptions
};

export default allDataEntryService;