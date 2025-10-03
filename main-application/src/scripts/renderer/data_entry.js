/**
 * File: src/scripts/renderer/data_entry.js
 * Author: Yash Balotiya
 * Description: Handles the data entry form interactions and validations. Main Logic goes here.
 * Created on: 31/08/2025
 * Last Modified: 22/09/2025
 */

// Import required modules & libraries
import { fillForm, setupImageInputListeners } from "./data_entry_load_data.js";
import { setDropDownNames, fetchWorkDescriptions } from "../utilities/dataEntry/dataEntryUtility.js";
import dateUtility from "../utilities/dataEntry/dateUtility.js";
import { insertDataUtility, collectFormValues } from "../utilities/dataEntry/dataInsertUtility.js";
// import log from "../logger.js";

// Log the loading of the data entry script
// log.info("Data entry script loaded.");

// On load
document.addEventListener("DOMContentLoaded", () => {
    // Flag to check if the form is being filled with existing data
    let is_repeat = false;
    let userId = null;
    let jobId = null;

    dateUtility(); // Initialize date fields

    // Selecting all Elements
    const formElements = {
        phoneInput: document.getElementById("phoneInput"),
        customerIdInput: document.getElementById("customerIdInput"),
        customerImageInput: document.getElementById("photoInput"),
        customerSignatureInput: document.getElementById("signatureInput"),
        customerNameInput: document.getElementById("nameInput"),
        dobInput: document.getElementById("dobInput"),
        relationInput: document.getElementById("relationInput"),
        carSelect: document.getElementById("carSelect"),
        instructorSelect: document.getElementById("instructorSelect"),
        addressInput: document.getElementById("addressInput"),
        licenseInput: document.getElementById("licenseInput"),
        classInput: document.getElementById("classInput"),
        licenseInput2: document.getElementById("licenseInput2"),
        classInput2: document.getElementById("classInput2"),
        issuedOnInput: document.getElementById("issuedOnInput"),
        validUntilInput: document.getElementById("validUntilInput"),
        mdlNoInput: document.getElementById("mdlNoInput"),
        mdlClassInput: document.getElementById("mdlClassInput"),
        mdlIssuedInput: document.getElementById("mdlIssuedInput"),
        mdlValidUntilInput: document.getElementById("mdlValidUntilInput"),
        endorsementInput: document.getElementById("endorsementInput"),
        endorsementDatedInput: document.getElementById("endorsementDatedInput"),
        endorsementValidityInput: document.getElementById("endorsementValidityInput"),
        vehicleNoInput: document.getElementById("vehicleNoInput"),
        amountInput: document.getElementById("amountInput"),
        workDescriptionInput: document.getElementById("workDescriptionInput"),
    };

    // Object to store image blobs
    const imageBlobs = {
        customerImageInput: null,
        customerSignatureInput: null,
    };

    // Set vehicle & instructor names in the dropdown
    setDropDownNames("vehicles");
    setDropDownNames("instructors");

    // >>> NEW: Call setupImageInputListeners immediately on DOMContentLoaded <<<
    setupImageInputListeners(imageBlobs);

    // Phone number input validation: Allow only digits and limit to 10 characters
    formElements.phoneInput.addEventListener("input", () => {
        formElements.phoneInput.value = formElements.phoneInput.value.replace(/\D/g, "").slice(0, 10);
    });

    // Auto-search by phone number
    formElements.phoneInput.addEventListener("input", async () => {
        // Check if the phone number is valid
        if (formElements.phoneInput.value.length === 10) {
            // Search for customer by phone number
            const result = await window.dataEntryAPI.searchByPhoneNumber(formElements.phoneInput.value);

            // If a customer is found, then update the UI with the customer details
            if (result) {
                is_repeat = true;
                userId = result.id;
                fillForm(result, formElements, imageBlobs); // Pass imageBlobs to fillForm
                
                // Callback function to handle job selection
                const onJobSelected = (selectedJobId) => {
                    jobId = selectedJobId;
                };
                
                // Fetch work descriptions and get default jobId
                const defaultJobId = await fetchWorkDescriptions(result.id, onJobSelected);
                jobId = defaultJobId; // Set to first job or null if no jobs
            } else {
                is_repeat = false;
                // >>> NEW: If no customer found, reset image inputs and blobs <<<
                // resetImageInputs(imageBlobs);
            }
        } else {
            // >>> NEW: If phone number is incomplete, reset image inputs and blobs <<<
            // resetImageInputs(imageBlobs);
        }
    });

    // Handling click event on Save Button
    document.getElementById("saveBtn").addEventListener("click", async () => {
        insertDataUtility(formElements, imageBlobs, is_repeat, userId); // Initialize insert data utility
    });

    // Handle click event on Update Button
    document.getElementById("updateBtn").addEventListener("click", async () => {
        if (!is_repeat) {
            await window.dialogBoxAPI.showDialogBox("warning", "No Existing Customer", "Please search and load an existing customer to update.");
            return;
        }

        // Show confirmation dialog
        const response = await window.dialogBoxAPI.showDialogBox("question", "Update Entry", "Do you want to update this entry?", ["OK", "Cancel"]);

        // User confirmed, proceed with updating
        if (response !== 0) return; // 0 = "OK", 1 = "Cancel"

        // Collect form values
        let formValues = await collectFormValues(formElements, imageBlobs);

        // API call
        const updateResponse = await window.dataEntryAPI.updateCustomer(userId, jobId, formValues);

        if (updateResponse?.status === "success") {
            // Show success message
            await window.dialogBoxAPI.showDialogBox("info", "Customer Updated", "The customer has been updated successfully.");
            window.location.reload();
        } else {
            // Show error message
            await window.dialogBoxAPI.showDialogBox("error", "Update Failed", `Failed to update the customer.`);
        }
    });

    // Handling click event on Clear Button
    document.getElementById("clearBtn").addEventListener("click", async () => {
        const response = await window.dialogBoxAPI.showDialogBox("warning", "Reset Form", "Do you want to clear the form?", ["OK", "Cancel"]);

        if (response !== 0) return; // 0 = "Yes", 1 = "No"
        window.location.reload();
    });

    // Handling click event on Exit button
    document.getElementById("exitBtn").addEventListener("click", async () => window.location.href = "dashboard.html");

    // Update validUntilInput based on issuedOnInput (6 months validity)
    document.getElementById("issuedOnInput").addEventListener("change", (e) => {
        const issuedDate = new Date(e.target.value);
        const validUntilDate = new Date(issuedDate.setDate(issuedDate.getDate() + 180));
        document.getElementById("validUntilInput").value = validUntilDate.toISOString().split("T")[0];
    });
});