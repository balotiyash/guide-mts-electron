/**
 * File: src/scripts/main/ipc/masterHandler.js
 * Author: Yash Balotiya
 * Description: This file contains the main IPC handlers for master registration page.
 * Created on: 22/09/2025
 * Last Modified: 23/09/2025
 */

// Importing required modules & libraries
import { ipcMain } from 'electron';
import { getAllInstructors, addInstructor, updateInstructor, deleteInstructor } from '../services/masterService.js';

// Register IPC handlers for master entry operations
const registerMasterHandlers = () => {
    // Fetch all instructors
    ipcMain.handle('get-all-instructors', async () => {
        return await getAllInstructors();
    });

    // Add new instructor
    ipcMain.handle('add-instructor', async (event, data) => {
        return await addInstructor(data);
    });

    // Update existing instructor
    ipcMain.handle('update-instructor', async (event, data) => {
        return await updateInstructor(data);
    });

    // Delete instructor
    ipcMain.handle('delete-instructor', async (event, instructorId) => {
        return await deleteInstructor(instructorId);
    });
};

// Exporting the registerMasterHandlers function
export default registerMasterHandlers;