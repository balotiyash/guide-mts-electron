/* File: src/scripts/utilities/dataEntry/dataInsertUtility.js
   Author: Yash Balotiya
   Description: Utility functions for inserting data from the data entry form into the database.
   Created on: 21/09/2025
   Last Modified: 22/09/2025
*/

// Importing required modules & libraries
import { blobToBase64 } from "../../utilities/dataEntry/dataEntryUtility.js";

// Function to handle data insertion logic
const insertDataUtility = async (formElements, imageBlobs, is_repeat, userId) => {
    // Show confirmation dialog
    const response = await window.dialogBoxAPI.showDialogBox("question", "Save New Entry", "Do you want to save new entry?", ["OK", "Cancel"]);

    // User confirmed, proceed with saving
    if (response !== 0) return; // 0 = "OK", 1 = "Cancel"

    // Collect form values
    let formValues = await collectFormValues(formElements, imageBlobs);

    if (!formValues.amountInput || !formValues.workDescriptionInput) {
        await window.dialogBoxAPI.showDialogBox("error", "Missing Fields", "Please fill in all required fields.");
    }

    // API call
    if (is_repeat) {
        // If form is being filled with existing data, update the record
        const response = await window.dataEntryAPI.createJob(userId, formValues.workDescriptionInput, formValues.amountInput);

        if (response?.status === "success") {
            // Show success message
            await window.dialogBoxAPI.showDialogBox("info", "Job Created", "A new job has been created for the existing customer.");
            window.location.href = "./payment_entry.html";
        } else {
            // Show error message
            await window.dialogBoxAPI.showDialogBox("error", "Creation Failed", `Failed to create a new job for the existing customer.`);
        }
    } else {
        // If new form, create a new record
        const response = await window.dataEntryAPI.createCustomer(formValues);

        if (response?.status === "success") {
            // Show success message
            await window.dialogBoxAPI.showDialogBox("info", "Customer Created", "The customer has been created successfully.");
            window.location.href = "./payment_entry.html";
        } else {
            // Show error message
            await window.dialogBoxAPI.showDialogBox("error", "Creation Failed", `Failed to create the customer.`);
        }
    }
};

// Function to collect form values and validate
const collectFormValues = async (formElements, imageBlobs) => {
    // Collect form values
    let formValues = {};

    for (const key in formElements) {
        const value = formElements[key].value?.trim();
        formValues[key] = value === "" ? null : value.toLowerCase();
    }

    // Clean license-related inputs if they are placeholders
    // const placeholder1 = "mh01 /"; // normalized placeholder
    // const placeholder2 = "mh02 /"; // another normalized placeholder

    let placeholder = [];
    for (let i = 1; i <= 100; i++) {
        placeholder.push(`mh${i.toString().padStart(2, '0')} /`);
        placeholder.push(`mh${i.toString().padStart(2, '0')}/`);
    }

    // Check and nullify if any license fields match the placeholder
    ["licenseInput", "licenseInput2", "mdlNoInput"].forEach((field) => {
        if (
            formValues[field] &&
            placeholder.some(ph => ph.toLowerCase() === formValues[field].toLowerCase())
        ) {
            formValues[field] = null;
        }
    });

    // Phone number validation
    const digitsOnly = formValues.phoneInput?.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length !== 10) {
        await window.dialogBoxAPI.showDialogBox("error", "Invalid Phone Number", "Please enter a valid 10-digit phone number.");
        return;
    }

    // Customer name and DOB validation
    if (!formValues.customerNameInput || !formValues.dobInput || !formValues.relationInput || !formValues.addressInput) {
        await window.dialogBoxAPI.showDialogBox("error", "Missing Fields", "Please fill in all required fields.");
        return;
    }

    // Validate 18+
    if (new Date().getFullYear() - new Date(formValues.dobInput).getFullYear() < 18) {
        await window.dialogBoxAPI.showDialogBox("error", "Invalid Age", "Customer must be at least 18 years old.");
        return;
    }

    // Attach images (convert to Base64 if blobs exist)
    if (imageBlobs.customerImageInput) {
        formValues.customerImageInput = await blobToBase64(imageBlobs.customerImageInput);
    } else {
        formValues.customerImageInput = null; // Ensure null if no image selected
    }

    if (imageBlobs.customerSignatureInput) {
        formValues.customerSignatureInput = await blobToBase64(imageBlobs.customerSignatureInput);
    } else {
        formValues.customerSignatureInput = null; // Ensure null if no signature selected
    }

    return formValues;
};

// Export functions
export {
    insertDataUtility,
    collectFormValues
};