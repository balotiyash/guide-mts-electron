/**
 * File: src/scripts/renderer/master_entry.js
 * Author: Yash Balotiya
 * Description: This file contains the main Js code for master registration page
 * Created on: 21/09/2025
 * Last Modified: 24/12/2025
 */

// Importing required modules & libraries
import { handleSubmit, handleUpdate, renderInstructors, getSelectedInstructorId } from "../utilities/masterEntry/masterUtility.js";
import dateUtility from "../utilities/dataEntry/dateUtility.js"; // Reuse existing date utility

// On window load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize date fields with Flatpickr and inputmask (reused from data entry)
    dateUtility();
    
    // Verify Flatpickr was applied
    const dateInput = document.getElementById("license-expiration-text");

    // Call on page load
    renderInstructors();

    // Handle form submission for new instructor entry
    document.getElementById("save-btn").addEventListener("click", handleSubmit);

    // Handle form update for existing instructor
    document.getElementById("edit-btn").addEventListener("click", handleUpdate);

    // Reset form and state on clear
    document.getElementById("clear-btn").addEventListener("click", () => {
        window.location.reload();
    });

    // Delete functionality for existing instructor
    document.getElementById("delete-btn").addEventListener("click", async () => {
        const instructorId = getSelectedInstructorId();
        
        if (!instructorId) {
            await window.dialogBoxAPI.showDialogBox('error', 'Selection Error', 'Please select an instructor to delete.', ['OK']);
            return;
        }

        // Confirm deletion
        const confirmResult = await window.dialogBoxAPI.showDialogBox('question', 'Confirm Deletion', 'Are you sure you want to delete this instructor? This action cannot be undone.', ['Yes', 'No']);
        
        if (confirmResult === 0) {
            try {
                const response = await window.masterEntryAPI.deleteInstructor(instructorId);
                
                if (response.status === "success") {
                    await window.dialogBoxAPI.showDialogBox('info', 'Success', 'Instructor deleted successfully.', ['OK']);
                    
                    // Clear form and refresh list
                    window.location.reload();
                } else {
                    await window.dialogBoxAPI.showDialogBox('error', 'Error', response.message || 'Failed to delete instructor.', ['OK']);
                }
            } catch (error) {
                console.error('Delete error:', error);
                await window.dialogBoxAPI.showDialogBox('error', 'Error', 'An error occurred while deleting the instructor.', ['OK']);
            }
        }
    });
    
    // Exit button
    document.getElementById("exit-btn").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
});