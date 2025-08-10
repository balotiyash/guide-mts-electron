/** 
 * File: src/scripts/dashboard.js
 * Author: Yash Balotiya
 * Description: Handles user dashboard functionality for the Guide Motor Training School application.
 * Created on: 08/08/2025
 * Last Modified: 10/08/2025
*/

// Function to handle navigation to the user registration page
document.getElementById('registrationButton').addEventListener('click', () => {
    window.electronAPI.navigateTo('data_entry.html');
});

// Function to handle navigation to the fees entry page
document.getElementById('feesButton').addEventListener('click', () => {
    window.electronAPI.navigateTo('payment_entry.html');
});

// Function to handle navigation to the fuel entry page
document.getElementById('fuelEntryButton').addEventListener('click', () => {
    window.electronAPI.navigateTo('fuel_entry.html');
});