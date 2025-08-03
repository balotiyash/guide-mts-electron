/** 
 * File: src/scripts/login.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Handles user login functionality for the Guide Motor Training School application.
 * Created on: 20/07/2025
 * Last Modified: 03/08/2025
*/

// Only runs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const message = document.getElementById('message');

    // Click event listener for the login button
    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim().toUpperCase();
        const password = document.getElementById('password').value.trim();

        const response = await window.electronAPI.login({ username, password });

        if (response.success) {
            message.innerText = 'Login Successful';
            message.style.color = 'green';
            // Enables Menu
            window.electronAPI.showMenu();

            // Navigating to Data Entry page
            window.electronAPI.navigateTo('data_entry.html');
        } else {
            message.innerText = 'Invalid Username or Password';
            message.style.color = 'red';
        }
    });
});
