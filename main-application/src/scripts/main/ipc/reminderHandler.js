/**
 * File: src/scripts/main/ipc/reminderHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the IPC handlers for reminder functionality
 * Created on: 24/10/2025
 * Last Modified: 24/10/2025
 */

// Importing required modules & libraries
import { ipcMain } from "electron";
import { getBirthdayReminders, getLLReminders, getPaymentReminders, getLicenseExpirationReminders } from "../services/reminderService.js";

// Function to register reminder handlers
const registerReminderHandlers = () => {
    // Handler to get birthday reminders
    ipcMain.handle('get-birthday-reminders', async () => {
        return await getBirthdayReminders();
    });

    // Handler to get LL reminders
    ipcMain.handle('get-ll-reminders', async () => {
        return await getLLReminders();
    });

    // Handler to get Licence Expiry reminders
    ipcMain.handle('get-licence-expiry-reminders', async () => {
        return await getLicenseExpirationReminders();
    });
};

// Exporting the registerReminderHandlers function
export default registerReminderHandlers;