/**
 * File: src/scripts/main/renderer/reminders.js
 * Author: Yash Balotiya
 * Description: This file contains main entry point JS code for reminders page.
 * Created on: 24/10/2025
 * Last Modified: 28/12/2025
 */

// Importing required modules & libraries
import birthdayReminderUtility from "../utilities/reminders/birthdayReminderUtility.js";
import llReminderUtility from "../utilities/reminders/llReminderUtility.js";
import dlExpiryUtility from "../utilities/reminders/dlExpiryUtility.js";
import paymentReminderUtility from "../utilities/reminders/paymentReminderUtility.js";
import { setupBackupDatabaseListener, setupChangeDatabaseListener, setupChangeArchitectureListener } from "../shared.js";

// Main DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Setup backup database listener for menu bar
    setupBackupDatabaseListener();
    
    // Setup change database listener for menu bar
    setupChangeDatabaseListener();
    
    // Setup change architecture listener for menu bar
    setupChangeArchitectureListener();
    // Initialize Birthday Reminder Section
    birthdayReminderUtility();

    // Initialize LL Reminder Section
    llReminderUtility();

    // Initialize Payment Reminder Section
    paymentReminderUtility();

    // Initialize Licence Expiry Reminder Section
    dlExpiryUtility();

    // Exit Button Functionality
    document.getElementById('exitBtn').addEventListener('click', () => {
        window.electronAPI.navigateTo("dashboard.html");
    });
});