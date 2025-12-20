/**
 * File: src/scripts/utilities/masterEntry/masterUtility.js
 * Author: Yash Balotiya
 * Description: This file contains the utility functions for master entry page
 * Created on: 22/09/2025
 * Last Modified: 20/12/2025
 */

// Import utility functions
import { isoToDDMMYYYY } from '../../shared.js';

// Global variable to track selected instructor ID
let selectedInstructorId = null;

// Function to render instructors in the table
const renderInstructors = async () => {
    // Fetch instructor data from the API
    const response = await window.masterEntryAPI.getAllInstructors();

    // Get the table body element
    const tbody = document.querySelector('.scrollDiv table tbody');
    tbody.innerHTML = ""; // clear old rows

    // Check if the response is successful and contains data
    if (response.status === "success" && response.data.length > 0) {
        // Map the data to table rows
        response.data.forEach(instr => {
            const tr = document.createElement('tr');
            // add a data-id attribute to store the instructor id
            tr.setAttribute('id', instr.id);
            tr.style.cursor = 'pointer';
            tr.title = 'Click to load details';

            // Populate the row with instructor details
            tr.innerHTML = `
                <td class="instructor-name">${instr.instructor_name.toUpperCase()}</td>
                <td class="instructor-license">${instr.instructor_license_no.toUpperCase()}</td>
                <td class="license-expiration">${(instr.license_expiration_date && instr.license_expiration_date !== 'null') ? isoToDDMMYYYY(instr.license_expiration_date) : 'NULL'}</td>
            `;
            
            // Add click event listener to load data into form
            tr.addEventListener('click', () => {
                // Store the selected instructor ID
                selectedInstructorId = instr.id;
                
                // Fill form fields with instructor data
                document.getElementById("name").value = instr.instructor_name;
                document.getElementById("license").value = instr.instructor_license_no;
                document.getElementById("license-expiration").value = instr.license_expiration_date || '';
                
                // Set the display date field if there's a date
                if (instr.license_expiration_date) {
                    try {
                        const displayDate = isoToDDMMYYYY(instr.license_expiration_date);
                        document.getElementById("license-expiration-text").value = displayDate;
                    } catch (error) {
                        document.getElementById("license-expiration-text").value = instr.license_expiration_date;
                    }
                } else {
                    document.getElementById("license-expiration-text").value = '';
                }
                
                // Add visual feedback for selected row
                document.querySelectorAll('.scrollDiv table tbody tr').forEach(row => {
                    row.style.backgroundColor = '';
                });
                tr.style.backgroundColor = '#e3f2fd';
            });
            
            tbody.appendChild(tr);
        });
    } else {
        // Show a message if no instructors are found
        tbody.innerHTML = `<tr><td colspan="3">No active instructors found</td></tr>`;
    }
};

// Function to handle form submission for adding a new instructor
const handleSubmit = async () => {
    // Fetching values from the form
    const name = document.getElementById("name").value.trim().toLowerCase();
    const licenseNo = document.getElementById("license").value.trim().toLowerCase();
    const expirationDate = document.getElementById("license-expiration").value.trim(); // This gets the ISO date from hidden input

    // Basic validation
    if (!name || !licenseNo || !expirationDate) {
        await window.dialogBoxAPI.showDialogBox('error', 'Validation Error', 'Please fill in all fields.', ['OK']);
        return;
    }

    // Call the API to add the instructor
    const response = await window.masterEntryAPI.addInstructor({ name, licenseNo, expirationDate });

    // Handle the response
    if (response.status === "success") {
        await window.dialogBoxAPI.showDialogBox('info', 'Success', 'Instructor added successfully.', ['OK']);
        
        // Clear the form
        document.getElementById("name").value = "";
        document.getElementById("license").value = "";
        document.getElementById("license-expiration-text").value = "";
        document.getElementById("license-expiration").value = "";
        
        renderInstructors(); // Refresh the list
    } else {
        await window.dialogBoxAPI.showDialogBox('error', 'Error', response.message || 'Failed to add instructor.', ['OK']);
    }
};

// Function to handle form submission for updating an existing instructor
const handleUpdate = async () => {
    // Fetching values from the form
    const name = document.getElementById("name").value.trim().toLowerCase();
    const licenseNo = document.getElementById("license").value.trim().toLowerCase();
    const expirationDate = document.getElementById("license-expiration").value.trim(); // This gets the ISO date from hidden input

    // Basic validation
    if (!selectedInstructorId || !name || !licenseNo || !expirationDate) {
        await window.dialogBoxAPI.showDialogBox('error', 'Validation Error', 'Please select an instructor and fill in all fields.', ['OK']);
        return;
    }

    // Call the API to update the instructor
    const response = await window.masterEntryAPI.updateInstructor({ id: selectedInstructorId, name, licenseNo, expirationDate });

    // Handle the response
    if (response.status === "success") {
        await window.dialogBoxAPI.showDialogBox('info', 'Success', 'Instructor updated successfully.', ['OK']);
        
        // Clear selection
        selectedInstructorId = null;
        
        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("license").value = "";
        document.getElementById("license-expiration-text").value = "";
        document.getElementById("license-expiration").value = "";
        
        renderInstructors(); // Refresh the list
    } else {
        await window.dialogBoxAPI.showDialogBox('error', 'Error', response.message || 'Failed to update instructor.', ['OK']);
    }
};

// Function to get the currently selected instructor ID
const getSelectedInstructorId = () => {
    return selectedInstructorId;
};

// Exporting the functions
export {
    renderInstructors,
    handleSubmit,
    handleUpdate,
    getSelectedInstructorId
}