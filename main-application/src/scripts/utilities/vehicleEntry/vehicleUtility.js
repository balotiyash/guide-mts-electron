/**
 * File: src/scripts/utilities/vehicleEntry/vehicleUtility.js
 * Author: Yash Balotiya
 * Description: This file contains the utility functions for vehicle entry page
 * Created on: 23/09/2025
 * Last Modified: 24/12/2025
 */

// Global variable to track selected vehicle ID
let selectedVehicleId = null;

// Function to render vehicles in the table
const renderVehicles = async () => {
    try {
        // Fetch vehicle data from the API
        const vehicles = await window.vehicleEntryAPI.getAllVehicles();

        // Get the table body element
        const tbody = document.querySelector('.scrollDiv table tbody');
        tbody.innerHTML = ""; // clear old rows

        // Check if the vehicles data exists and is an array
        if (Array.isArray(vehicles) && vehicles.length > 0) {
            // Filter only active vehicles for display
            const activeVehicles = vehicles.filter(vehicle => vehicle.is_active === 'true');
            
            if (activeVehicles.length > 0) {
                // Map the data to table rows
                activeVehicles.forEach(vehicle => {
                    const tr = document.createElement('tr');
                    // add a data-id attribute to store the vehicle id
                    tr.setAttribute('id', vehicle.id);
                    tr.style.cursor = 'pointer';
                    tr.title = 'Click to load vehicle details';

                    // Populate the row with vehicle details
                    tr.innerHTML = `
                        <td class="vehicle-name">${vehicle.vehicle_name.toUpperCase()}</td>
                        <td class="vehicle-model">${vehicle.vehicle_model.toUpperCase()}</td>
                        <td class="vehicle-number">${vehicle.vehicle_number.toUpperCase()}</td>
                        <td class="fuel-type">${vehicle.vehicle_fuel_type.toUpperCase()}</td>
                    `;
                    
                    // Add click event listener to load data into form
                    tr.addEventListener('click', () => {
                        // Store the selected vehicle ID
                        selectedVehicleId = vehicle.id;
                        
                        // Fill form fields with vehicle data
                        document.getElementById("vehicle-name").value = vehicle.vehicle_name;
                        document.getElementById("vehicle-model").value = vehicle.vehicle_model;
                        document.getElementById("vehicle-number").value = vehicle.vehicle_number;
                        
                        // Handle fuel type - convert database value to select option value
                        const fuelTypeSelect = document.getElementById("fuel-type");
                        const dbFuelType = vehicle.vehicle_fuel_type.toLowerCase();
                        
                        // Find matching option (case-insensitive)
                        let matchFound = false;
                        for (let option of fuelTypeSelect.options) {
                            if (option.value.toLowerCase() === dbFuelType) {
                                fuelTypeSelect.value = option.value;
                                matchFound = true;
                                break;
                            }
                        }
                        
                        // If no match found, set to empty
                        if (!matchFound) {
                            fuelTypeSelect.value = "";
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
                // Show a message if no active vehicles are found
                tbody.innerHTML = `<tr><td colspan="4">No active vehicles found</td></tr>`;
            }
        } else {
            // Show a message if no vehicles are found
            tbody.innerHTML = `<tr><td colspan="4">No vehicles found</td></tr>`;
        }
    } catch (error) {
        console.error('Error rendering vehicles:', error);
        const tbody = document.querySelector('.scrollDiv table tbody');
        tbody.innerHTML = `<tr><td colspan="4">Error loading vehicles</td></tr>`;
    }
};

// Function to handle form submission for adding a vehicle
const handleSubmit = async () => {
    // Fetching values from the form
    const vehicleName = document.getElementById("vehicle-name").value.trim();
    const vehicleModel = document.getElementById("vehicle-model").value.trim();
    const vehicleNumber = document.getElementById("vehicle-number").value.trim();
    const fuelType = document.getElementById("fuel-type").value;

    // Basic validation
    if (!vehicleName || !vehicleModel || !vehicleNumber || !fuelType) {
        await window.dialogBoxAPI.showDialogBox('error', 'Validation Error', 'Please fill in all fields.', ['OK']);
        return;
    }

    // Prepare data object - store everything in lowercase
    const vehicleData = {
        vehicle_name: vehicleName.toLowerCase(),
        vehicle_model: vehicleModel.toLowerCase(),
        vehicle_number: vehicleNumber.toLowerCase(),
        vehicle_fuel_type: fuelType.toLowerCase()
    };

    try {
        // Call the API to add the vehicle
        await window.vehicleEntryAPI.addVehicle(vehicleData);
        await window.dialogBoxAPI.showDialogBox('info', 'Success', 'Vehicle added successfully.', ['OK']);
        
        // Clear the form
        clearForm();
        
        renderVehicles(); // Refresh the list
    } catch (error) {
        console.error('Add vehicle error:', error);
        await window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to add vehicle.', ['OK']);
    }
};

// Function to handle form submission for updating a vehicle
const handleUpdate = async () => {
    // Fetching values from the form
    const vehicleName = document.getElementById("vehicle-name").value.trim();
    const vehicleModel = document.getElementById("vehicle-model").value.trim();
    const vehicleNumber = document.getElementById("vehicle-number").value.trim();
    const fuelType = document.getElementById("fuel-type").value;

    // Basic validation
    if (!selectedVehicleId || !vehicleName || !vehicleModel || !vehicleNumber || !fuelType) {
        await window.dialogBoxAPI.showDialogBox('error', 'Validation Error', 'Please select a vehicle and fill in all fields.', ['OK']);
        return;
    }

    // Prepare data object - store everything in lowercase
    const vehicleData = {
        vehicle_name: vehicleName.toLowerCase(),
        vehicle_model: vehicleModel.toLowerCase(),
        vehicle_number: vehicleNumber.toLowerCase(),
        vehicle_fuel_type: fuelType.toLowerCase()
    };

    try {
        // Call the API to update the vehicle
        await window.vehicleEntryAPI.updateVehicle(selectedVehicleId, vehicleData);
        await window.dialogBoxAPI.showDialogBox('info', 'Success', 'Vehicle updated successfully.', ['OK']);
        
        // Clear selection and form
        selectedVehicleId = null;
        clearForm();
        
        renderVehicles(); // Refresh the list
    } catch (error) {
        console.error('Update vehicle error:', error);
        await window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to update vehicle.', ['OK']);
    }
};

// Helper function to clear the form
const clearForm = () => {
    document.getElementById("vehicle-name").value = "";
    document.getElementById("vehicle-model").value = "";
    document.getElementById("vehicle-number").value = "";
    document.getElementById("fuel-type").value = "";
    
    // Clear visual feedback for selected row
    document.querySelectorAll('.scrollDiv table tbody tr').forEach(row => {
        row.style.backgroundColor = '';
    });
    
    selectedVehicleId = null;
};

// Function to get the currently selected vehicle ID
const getSelectedVehicleId = () => {
    return selectedVehicleId;
};

// Exporting the functions
export {
    renderVehicles,
    handleSubmit,
    handleUpdate,
    getSelectedVehicleId
};