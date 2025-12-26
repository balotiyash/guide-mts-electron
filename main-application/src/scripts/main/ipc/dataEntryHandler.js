/** 
 * File: src/scripts/main/ipc/dataEntryHandler.js
 * Author: Yash Balotiya
 * Description: IPC Handlers for Data Entry related operations.
 * Created on: 31/08/2025
 * Last Modified: 26/12/2025
*/

// Importing required modules & libraries
import { ipcMain } from "electron";
import allDataEntryService from "../services/dataEntryService.js";

// Registering IPC handlers for data entry
const registerDataEntryHandlers = () => {
    
    // Fetching Dropdown Names for vehicles & instructors
    ipcMain.handle("get-drop-down-names", async (event, value) => {
        return await allDataEntryService.getDropDownNames(value);
    });

    // Searching for customer by phone number
    ipcMain.handle("search-by-phone-number", async (event, phoneNumber) => {
        return await allDataEntryService.searchByPhoneNumber(phoneNumber);
    });

    // Fetching work descriptions for a user
    ipcMain.handle("get-work-descriptions", async (event, userId) => {
        return await allDataEntryService.getWorkDescriptions(userId);
    });

    // Creating a new customer
    ipcMain.handle("create-customer", async (event, formElements) => {
        return allDataEntryService.createCustomer(formElements);
    });

    // Creating a new job for an existing customer
    ipcMain.handle("create-job", async (event, { userId, workDescriptionInput, amountInput }) => {
        return allDataEntryService.insertIntoWorkDescriptions(userId, workDescriptionInput, amountInput);
    });

    // Updating an existing customer
    ipcMain.handle("update-customer", async (event, { userId, jobId, formValues }) => {
        return allDataEntryService.updateCustomer(userId, jobId, formValues);
    });

    // Deleting a user
    ipcMain.handle("delete-user", async (event, userId) => {
        return allDataEntryService.deleteUser(userId);
    });

    // Deleting a job
    ipcMain.handle("delete-job", async (event, jobId) => {
        return allDataEntryService.deleteJob(jobId);
    });
};

// Exporting the register function
export default registerDataEntryHandlers;
