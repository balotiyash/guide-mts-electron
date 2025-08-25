/** 
 * File: src/scripts/renderer/login.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Handles user login functionality for the Guide Motor Training School application.
 * Created on: 20/07/2025
 * Last Modified: 25/08/2025
*/

// Only runs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // const message = document.getElementById('message');
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    // Focus on the username input field when the page loads
    usernameInput.focus();

    // Click event listener for the login button
    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim().toUpperCase();
        const password = passwordInput.value.trim();

        const response = await window.electronAPI.login({ username, password });

        if (response.success) {
            // Enables Menu
            window.electronAPI.showMenu();

            // Navigating to Dashboard page
            window.electronAPI.navigateTo('dashboard.html');
        } else {
            // Show error message
            window.electronAPI.showErrorBox('Login Failed', 'Invalid Username or Password');

            // Clear the input fields
            usernameInput.value = '';
            passwordInput.value = '';
            usernameInput.focus();
        }
    });
});

// Handle Enter key press for login
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.click(); // Trigger the click event on the login button
    }
});