/**
 * File: src/scripts/renderer/data_entry.js
 * Author: Yash Balotiya
 * Description: Handles the data entry form interactions and validations. Main Logic goes here.
 * Created on: 31/08/2025
 * Last Modified: 16/09/2025
 */

// Import required modules & libraries
import { fillForm, blobToBase64, setupImageInputListeners } from "./data_entry_load_data.js"; // Import setupImageInputListeners
// import log from "../logger.js";

// Log the loading of the data entry script
// log.info("Data entry script loaded.");

// Flag to check if the form is being filled with existing data
let is_repeat = false;
let userId = null;
let jobId = null;

// On load
document.addEventListener("DOMContentLoaded", () => {
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
                fetchWorkDescriptions(result.id);
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
        // Show confirmation dialog
        const response = await window.dialogBoxAPI.showDialogBox("question", "Save New Entry", "Do you want to save new entry?", ["OK", "Cancel"]);

        // User confirmed, proceed with saving
        if (response !== 0) return; // 0 = "OK", 1 = "Cancel"

        // Collect form values
        let formValues = await collectFormValues();

        if (!formValues.amountInput || !formValues.workDescriptionInput) {
            await window.dialogBoxAPI.showDialogBox("error", "Missing Fields", "Please fill in all required fields.");
        }

        // API call
        if (is_repeat) {
            // If form is being filled with existing data, update the record
            // await window.dataEntryAPI.updateCustomer(formValues);
            // await window.dialogBoxAPI.showDialogBox("info", "Update Functionality", "Update functionality is not yet implemented.");

            const response = await window.dataEntryAPI.createJob(userId, formValues.workDescriptionInput, formValues.amountInput);

            if (response?.status === "success") {
                // Show success message
                await window.dialogBoxAPI.showDialogBox("info", "Job Created", "A new job has been created for the existing customer.");
                // >>> NEW: Clear form and reset images after successful creation <<<
                // window.location.reload();
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
                // >>> NEW: Clear form and reset images after successful creation <<<
                // window.location.reload();
                window.location.href = "./payment_entry.html";
            } else {
                // Show error message
                await window.dialogBoxAPI.showDialogBox("error", "Creation Failed", `Failed to create the customer.`);
            }
        }
    });

    const collectFormValues = async () => {   
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

        // ["licenseInput", "licenseInput2", "mdlNoInput"].forEach((field) => {
        //     if (formValues[field] && formValues[field].toLowerCase() === placeholder.includes(formValues[field])) {
        //         formValues[field] = null;
        //     }
        // });

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
        // !formValues.customerImageInput || !formValues.customerSignatureInput || 
        // if (!formValues.customerNameInput || !formValues.dobInput || !formValues.relationInput || !formValues.addressInput || !formValues.amountInput || !formValues.workDescriptionInput) {
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

    // Handle click event on Update Button
    document.getElementById("updateBtn").addEventListener("click", async () => {
        if  (!is_repeat) {
            await window.dialogBoxAPI.showDialogBox("warning", "No Existing Customer", "Please search and load an existing customer to update.");
            return;
        }

        // Show confirmation dialog
        const response = await window.dialogBoxAPI.showDialogBox("question", "Update Entry", "Do you want to update this entry?", ["OK", "Cancel"]);

        // User confirmed, proceed with updating
        if (response !== 0) return; // 0 = "OK", 1 = "Cancel"

        // Collect form values
        let formValues = await collectFormValues();

        // API call
        const updateResponse = await window.dataEntryAPI.updateCustomer(userId, jobId, formValues);

        if (updateResponse?.status === "success") {
            // Show success message
            await window.dialogBoxAPI.showDialogBox("info", "Customer Updated", "The customer has been updated successfully.");
            // >>> NEW: Clear form and reset images after successful update <<<
         //ss   window.location.reload();
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

// Function to set vehicle names in the select dropdown
const setDropDownNames = async (value) => {
    let selectElement = null;
    let labelKey = "";
    let placeholder = "";

    // Fetch data based on the type (vehicles or instructors)
    const data = await window.dataEntryAPI.getDropDownNames(value);

    // Set the select element and its properties based on the type
    if (value === "vehicles") {
        selectElement = document.getElementById("carSelect");
        labelKey = "vehicle_name";
        placeholder = "Select Vehicle";
    } else if (value === "instructors") {
        selectElement = document.getElementById("instructorSelect");
        labelKey = "instructor_name";
        placeholder = "Select Instructor";
    }

    // If no select element is found, exit the function
    if (!selectElement) return;

    // Default placeholder option
    const defaultOption = `<option value="" selected>${placeholder}</option>`;

    // Generate options from data
    const options = data.map(item => {
        return `<option value="${item.id}">${item[labelKey]}</option>`;
    }).join("");

    // Set the inner HTML of the select element
    selectElement.innerHTML = defaultOption + options;
};

// Fetching work descriptions for a user
const fetchWorkDescriptions = async (userId) => {
    // Fetch work descriptions from the API
    const workDescriptions = await window.dataEntryAPI.getWorkDescriptions(userId);

    // Populate the table with work descriptions
    const tbody = document.querySelector(".scrollDiv table tbody");

    // Clear existing rows
    tbody.innerHTML = "";

    if (workDescriptions.length === 0) {
        // Show single row for no records
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td colspan="4" class="tableCol" style="text-align: center; font-style: italic;">
                No past records found.
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    // References to inputs to fill
    const amountInput = document.getElementById("amountInput");
    const workDescriptionInput = document.getElementById("workDescriptionInput");

    // Loop through the data and insert rows
    workDescriptions.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="tableCol">${index + 1}</td>
            <td class="tableCol">${new Date(item.created_on).toLocaleDateString('en-GB')}</td>
            <td class="workCol">${item.work.toUpperCase()}</td>
            <td class="tableCol">₹${item.charged_amount}</td>
        `;

        // Add click event to fill inputs
        tr.addEventListener("click", () => {
            jobId = item.id; // <-- this is the clicked job's ID
            amountInput.value = item.charged_amount;
            workDescriptionInput.value = item.work;
        });

        tbody.appendChild(tr);
    });
};