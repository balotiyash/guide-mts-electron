/**
 * File: src/scripts/main/renderer/reminders.js
 * Author: Yash Balotiya
 * Description: This file contains main entry point JS code for reminders page.
 * Created on: 24/10/2025
 * Last Modified: 24/10/2025
 */

// Importing required modules & libraries
import birthdayReminderUtility from "../utilities/reminders/birthdayReminderUtility.js";
import llReminderUtility from "../utilities/reminders/llReminderUtility.js";

// Main DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Birthday Reminder Section
    birthdayReminderUtility();

    // Initialize LL Reminder Section
    llReminderUtility();
});