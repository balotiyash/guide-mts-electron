/** 
 * File: src/scripts/main/ipc/dashboardHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the JS code to manage dashboard-related IPC events.
 * Created on: 26/08/2025
 * Last Modified: 27/08/2025
*/

// Importing required modules & libraries
import { ipcMain } from "electron";
import allDashboardServices from "../services/dashboardService.js";

// Registering dashboard-related IPC handlers
const registerDashboardHandlers = () => {

    // Getting chart 1 data
    ipcMain.handle("get-chart-1-data", (event, selectedYear) => {
        return allDashboardServices.getChart1Data(selectedYear);
    });

    // Getting chart 2 data
    ipcMain.handle("get-chart-2-data", (event, selectedYear) => {
        return allDashboardServices.getChart2Data(selectedYear);
    });

    // Getting chart 3 data
    ipcMain.handle("get-chart-3-data", (event, selectedYear) => {
        return allDashboardServices.getChart3Data(selectedYear);
    });

    // Getting all time registrations count
    ipcMain.handle("get-all-time-count", (event) => {
        return allDashboardServices.getAllTimeRegistrations();
    });

    // Getting current year registrations count
    ipcMain.handle("get-current-year-count", (event) => {
        const currentYear = new Date().getFullYear();
        return allDashboardServices.getRegistrationsFromYear(currentYear);
    });

    // Getting repeat students count
    ipcMain.handle("get-repeat-students-count", (event) => {
        return allDashboardServices.getRepeatStudentsCount();
    });

    // Getting pending payments count
    ipcMain.handle("get-pending-payments-count", (event) => {
        return allDashboardServices.getPendingPaymentsCount();
    });
};

// Exporting the registerDashboardHandlers function
export { registerDashboardHandlers };