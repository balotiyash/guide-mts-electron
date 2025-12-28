/**
 * File: src/scripts/renderer/car_entry.js
 * Author: Yash Balotiya
 * Description: This file contains the main Js code for car registration page
 * Created on: 23/09/2025
 * Last Modified: 28/12/2025
 */

// Importing required modules & libraries
import { handleSubmit, handleUpdate, renderVehicles, getSelectedVehicleId } from "../utilities/vehicleEntry/vehicleUtility.js";
import { setupBackupDatabaseListener, setupChangeDatabaseListener, setupChangeArchitectureListener } from "../shared.js";

// On window load
document.addEventListener('DOMContentLoaded', () => {
    // Setup backup database listener for menu bar
    setupBackupDatabaseListener();
    
    // Setup change database listener for menu bar
    setupChangeDatabaseListener();
    
    // Setup change architecture listener for menu bar
    setupChangeArchitectureListener();
    // Call on page load
    renderVehicles();

    // Handle form submission for new vehicle entry
    document.getElementById("save-btn").addEventListener("click", handleSubmit);

    // Handle form update for existing vehicle
    document.getElementById("edit-btn").addEventListener("click", handleUpdate);

    // Reset form and state on clear
    document.getElementById("clear-btn").addEventListener("click", () => {
        window.location.reload();
    });

    // Delete functionality for existing vehicle
    document.getElementById("delete-btn").addEventListener("click", async () => {
        const vehicleId = getSelectedVehicleId();
        
        if (!vehicleId) {
            await window.dialogBoxAPI.showDialogBox('error', 'Selection Error', 'Please select a vehicle to delete.', ['OK']);
            return;
        }

        // Confirm deletion
        const confirmResult = await window.dialogBoxAPI.showDialogBox('question', 'Confirm Deletion', 'Are you sure you want to delete this vehicle? This action cannot be undone.', ['Yes', 'No']);
        
        if (confirmResult === 0) {
            try {
                await window.vehicleEntryAPI.deleteVehicle(vehicleId);
                await window.dialogBoxAPI.showDialogBox('info', 'Success', 'Vehicle deleted successfully.', ['OK']);
                
                // Clear form and refresh list
                window.location.reload();
            } catch (error) {
                console.error('Delete error:', error);
                await window.dialogBoxAPI.showDialogBox('error', 'Error', 'An error occurred while deleting the vehicle.', ['OK']);
            }
        }
    });
    
    // Exit button
    document.getElementById("exit-btn").addEventListener("click", () => {
        window.electronAPI.navigateTo("dashboard.html");
    });
});