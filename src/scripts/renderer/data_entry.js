/** 
 * File: src/scripts/renderer/data_entry.js
 * Author: Yash Balotiya
 * Description: Handles the data entry form interactions and validations. Main Logic goes here.
 * Created on: 31/08/2025
 * Last Modified: 01/09/2025
*/

// Import required modules & libraries
import { fillForm, resetImageInputs } from "./data_entry_load_data.js";

// On load
document.addEventListener("DOMContentLoaded", () => {
    // Selecting all Elements
    const formElements = {
        phoneInput: document.getElementById("phoneInput"),
        customerIdInput: document.getElementById("customerIdInput"),
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

    // Set vehicle & instructor names in the dropdown
    setDropDownNames("vehicles");
    setDropDownNames("instructors");

    // Phone number input validation: Allow only digits and limit to 10 characters
    phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    });

    // Auto-search by phone number
    phoneInput.addEventListener("input", async () => {
        // Check if the phone number is valid
        if (phoneInput.value.length === 10) {
            // Search for customer by phone number
            const result = await window.dataEntryAPI.searchByPhoneNumber(phoneInput.value);

            // If a customer is found, then update the UI with the customer details
            if (result) {
                fillForm(result, formElements);
                fetchWorkDescriptions(result.id);
            }
        }
    });

    // Handling click event on Clear Button
    document.getElementById("clearBtn").addEventListener("click", async () => {
        const response = await window.dialogBoxAPI.showDialogBox("warning", "Reset Form", "Do you want to clear the form?");

        if (response !== 0) return; // 0 = "Yes", 1 = "No"
        window.location.reload();
    });

    // Handling click event on Exit button
    document.getElementById("exitBtn").addEventListener("click", async () => window.location.href = "dashboard.html");
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
            amountInput.value = item.charged_amount;
            workDescriptionInput.value = item.work;
        });

        tbody.appendChild(tr);
    });
};