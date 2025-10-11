/**
 * File: src/scripts/main/services/dataEntryService2.js
 * Author: Yash Balotiya
 * Description: Additional service layer functions for data entry operations (work descriptions and updates).
 * Created on: 11/10/2025
 * Last Modified: 11/10/2025
 */

// Importing required modules & libraries
import { runQuery } from "./dbService.js";
import { getFormattedDateTime } from "../../shared.js";

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

// Exporting functions
export { insertIntoWorkDescriptions, updateCustomer };