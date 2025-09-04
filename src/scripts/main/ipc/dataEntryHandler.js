/** 
 * File: src/scripts/main/ipc/dataEntryHandler.js
 * Author: Yash Balotiya
 * Description: IPC Handlers for Data Entry related operations.
 * Created on: 31/08/2025
 * Last Modified: 02/09/2025
*/

// Importing required modules & libraries
import { ipcMain } from "electron";
import allDataEntryService from "../services/dataEntryService.js";

// Registering IPC handlers for data entry
const registerDataEntryHandlers = () => {
    
    // Fetching Dropdown Names for vehicles & instructors
    ipcMain.handle("get-drop-down-names", (event, value) => {
        return allDataEntryService.getDropDownNames(value);
    });

    // Searching for customer by phone number
    ipcMain.handle("search-by-phone-number", (event, phoneNumber) => {
        return allDataEntryService.searchByPhoneNumber(phoneNumber);
    });

    // Fetching work descriptions for a user
    ipcMain.handle("get-work-descriptions", (event, userId) => {
        return allDataEntryService.getWorkDescriptions(userId);
    });

    // Creating a new customer
    ipcMain.handle("create-customer", async (event, formElements) => {
        return allDataEntryService.createCustomer(formElements);
    });
};

// Exporting the register function
export { registerDataEntryHandlers };
