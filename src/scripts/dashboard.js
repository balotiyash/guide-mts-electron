/** 
 * File: src/scripts/dashboard.js
 * Author: Yash Balotiya
 * Description: Handles user dashboard functionality for the Guide Motor Training School application.
 * Created on: 08/08/2025
 * Last Modified: 08/08/2025
*/

// Function to handle navigation to the dashboard
document.getElementById('registrationButton').addEventListener('click', () => {
    window.electronAPI.navigateTo('data_entry.html');
});