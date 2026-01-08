/** * File: src/scripts/utilities/fuelEntry/fuelEntryUtility.js
 * Author: Yash Balotiya
 * Description: Utility functions for fuel entry management (Updated)
 * Created on: 24/09/2025
 * Last Modified: 08/01/2026
 */

// Function to load and display fuel data for a specific month
const loadData = async (month) => {
    try {
        // API call to fetch fuel data for the month
        const response = await window.fuelEntryAPI.loadFuelData(month);
        const tbody = document.querySelector('.scrollDiv table tbody');
        tbody.innerHTML = ''; // Clear existing rows

        // Check if the response is successful
        if (response.status === "success") {
            //  Handle case with no data
            if (!response.data || response.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: #666; padding: 20px;">
                            No fuel records found for the selected month.
                        </td>
                    </tr>
                `;
            } else {
                // Create rows for each fuel record
                response.data.forEach(record => {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td class="carName">${record.car_name.toUpperCase()}</td>
                        <td class="fuelAmount">${Math.round(record.fuel_amount) || 0}</td>
                        <td class="fuelType">${record.fuel_type.toUpperCase()}</td>
                        <td class="kmTotal">${Math.round(record.km_diff) || 0}</td>
                        <td class="kmTotal">${Math.round(record.km_total) || 0}</td>
                    `;
                });
            }
        } else {
            // Handle API errors
            console.error("Error loading fuel data:", response.message);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ff0000; padding: 20px;">
                        Error loading fuel data: ${response.message}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        // Handle unexpected errors
        console.error("Error in loadData:", error);
        const tbody = document.querySelector('.scrollDiv table tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ff0000; padding: 20px;">
                    Error loading fuel data. Please try again.
                </td>
            </tr>
        `;
    }
};

// Function to populate vehicle dropdown (kept as is, assuming vehicleEntryAPI works)
const populateVehicleDropdown = async () => {
    try {
        // Fetch all vehicles
        const allVehicles = await window.vehicleEntryAPI.getAllVehicles();
        const activeVehicles = allVehicles.filter(vehicle => vehicle.is_active === 'true');
        const selectElement = document.getElementById('car_name');

        // If no select element found, exit
        if (!selectElement) return;

        // Populate dropdown with active vehicles
        const defaultOption = '<option value="" disabled selected>Select Vehicle Name</option>';
        const options = activeVehicles.map(vehicle => {
            return `<option value="${vehicle.id}">${vehicle.vehicle_name}</option>`;
        }).join('');

        // Set the inner HTML of the select element
        selectElement.innerHTML = defaultOption + options;

    } catch (error) {
        // Handle errors
        console.error('Error loading vehicle dropdown:', error);
        const selectElement = document.getElementById('car_name');
        if (selectElement) {
            selectElement.innerHTML = '<option value="" disabled selected>Error loading vehicles</option>';
        }
    }
};

// Function to save fuel entry (modified to always use saveFuelAndKmEntry)
const saveFuelEntry = async () => {
    const vehicleSelect = document.getElementById('car_name');
    const dateHiddenInput = document.getElementById('entrydate');
    const amountInput = document.getElementById('amountInput');
    const kmRanInput = document.getElementById('kmRunnedInput');

    // Validation
    if (!vehicleSelect.value) {
        await window.dialogBoxAPI.showDialogBox('warning', 'Validation Error', 'Please select a vehicle');
        return;
    }

    if (!dateHiddenInput.value) {
        await window.dialogBoxAPI.showDialogBox('warning', 'Validation Error', 'Please select a date');
        return;
    }

    if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
        await window.dialogBoxAPI.showDialogBox('warning', 'Validation Error', 'Please enter a valid fuel amount');
        return;
    }

    // New validation for kilometers input
    if (kmRanInput.value && isNaN(parseFloat(kmRanInput.value))) {
        await window.dialogBoxAPI.showDialogBox('warning', 'Validation Error', 'Please enter a valid kilometers value');
        return;
    }

    // Confirmation prompt
    const confirmResult = await window.dialogBoxAPI.showDialogBox('question', 'Confirm Entry', "Are you sure you want to save this fuel entry?", ['Yes', 'No']);

    if (confirmResult !== 0) { // User clicked 'No' or closed dialog
        return;
    }

    try {
        // Save fuel first
        const fuelResult = await window.fuelEntryAPI.saveFuelEntry(vehicleSelect.value, dateHiddenInput.value, amountInput.value);

        // Save kilometers if available
        let kmResult = null;
        if (kmRanInput.value) {
            kmResult = await window.fuelEntryAPI.saveKilometersEntry(vehicleSelect.value, dateHiddenInput.value, kmRanInput.value);
        }

        // Handle result
        if (fuelResult.success && (kmResult ? kmResult.success : true)) {
            // Show success message
            const action = fuelResult.action === 'created' ? 'saved' : 'updated';
            const successMessage = `Fuel entry ${action} successfully!`;

            // Show success message
            await window.dialogBoxAPI.showDialogBox('info', 'Success', successMessage);

            // Clear form after successful entry
            window.location.reload();
        } else {
            // Show error message
            console.error('Error saving fuel entry:', fuelResult.error);
            await window.dialogBoxAPI.showDialogBox('error', 'Error', `Error saving fuel entry: ${fuelResult.error}`);
        }
    } catch (error) {
        // Show error message
        console.error('Error saving fuel entry:', error);
        await window.dialogBoxAPI.showDialogBox('error', 'Error', 'Error saving fuel entry. Please try again.');
    }
};

// Exporting functions
export {
    loadData,
    populateVehicleDropdown,
    saveFuelEntry
};