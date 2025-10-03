/** 
 * File: src/scripts/renderer/fuel_entry.js
 * Author: Yash Balotiya
 * Description: This file contains the renderer process script for the Fuel Entry page.
 * Created on: 24/09/2025
 * Last Modified: 28/09/2025
 */

// Importing required modules & libraries
import { loadData, populateVehicleDropdown, saveFuelEntry } from "../utilities/fuelEntry/fuelEntryUtility.js";
import dateUtility from "../utilities/dataEntry/dateUtility.js";

// Global variables to track current state
let currentVehicleId = null;
let currentDate = null;

/**
 * Function to load existing fuel entry when vehicle and date are selected
 */
const loadExistingFuelEntry = async () => {
    // Loading HTML elements
    const vehicleSelect = document.getElementById('car_name');
    const dateHiddenInput = document.getElementById('entrydate');

    // Collecting values from elements
    const vehicleId = vehicleSelect.value ? parseInt(vehicleSelect.value) : null;
    const date = dateHiddenInput.value || null; // already in YYYY-MM-DD format from flatpickr

    // Only proceed if both values exist
    if (!vehicleId || !date) {
        return;
    }

    // Check if this combination was already processed
    if (vehicleId === currentVehicleId && date === currentDate) {
        return;
    }

    // Assigning values
    currentVehicleId = vehicleId;
    currentDate = date;

    try {
        // Fetching Fuel Entries
        const existingEntry = await window.fuelEntryAPI.getFuelEntry(currentVehicleId, currentDate);

        const amountInput = document.getElementById('amountInput');
        amountInput.value = existingEntry ? existingEntry.fuel_amount : '';
    } catch (error) {
        console.error('Error loading existing fuel entry:', error);
    }
};

// Exposing function to global scope for event listeners
window.loadExistingFuelEntry = loadExistingFuelEntry;

// On page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize date fields with Flatpickr and inputmask
    dateUtility();

    // ✅ Ensure #entrydate has today's date if empty
    const dateHiddenInput = document.getElementById('entrydate');
    if (dateHiddenInput && !dateHiddenInput.value) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        dateHiddenInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // Populate vehicle dropdown
    await populateVehicleDropdown();

    // Set current month in the date input
    const monthInput = document.getElementById('fuel-date');
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Set current month in the input
    monthInput.value = currentMonth;

    // Add event listener for month change
    monthInput.addEventListener('change', async (event) => {
        const selectedMonth = event.target.value;
        await loadData(selectedMonth);
    });

    // Load data for current month
    await loadData(currentMonth);

    // Add event listeners for form elements
    setupFormEventListeners();
});

// Function to setup event listeners
const setupFormEventListeners = () => {
    // Loading HTML elements
    const vehicleSelect = document.getElementById('car_name');
    const dateTextInput = document.getElementById('entrydate_text');
    const saveButton = document.querySelector('.btn.green');
    const clearButton = document.querySelector('.btn.orange');
    const exitButton = document.querySelector('.btn.red');

    // Vehicle selection change
    vehicleSelect.addEventListener('change', () => loadExistingFuelEntry());

    // Date change - trigger once when user picks a new date
    dateTextInput.addEventListener('change', loadExistingFuelEntry);

    // Button event listeners
    saveButton.addEventListener('click', saveFuelEntry);

    // Clear form
    clearButton.addEventListener('click', (e) => window.location.reload());

    // Exit to dashboard
    exitButton.addEventListener('click', () => window.electronAPI.navigateTo('dashboard.html'));
};
