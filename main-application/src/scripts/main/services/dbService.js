/** 
 * File: src/scripts/main/services/dbService.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to manage the database.
 * Created on: 26/08/2025
 * Last Modified: 11/10/2025
*/

// Importing required modules & libraries
import fs from "fs";
import Store from "electron-store";
import { dialog, app, BrowserWindow } from "electron";
import Database from "better-sqlite3";

// Initializing the database store
const store = new Store();

// Getting the database path
const getDbPath = () => {
    // Check if the database path is already set
    let dbPath = store.get("dbPath");

    // If the database path is not set or doesn't exist, prompt the user to select it
    if (!dbPath || !fs.existsSync(dbPath)) {
        // Show an open dialog to select the database file
        const result = dialog.showOpenDialogSync({
            title: "Select your SQLite database",
            filters: [{ name: "guide-mts-database", extensions: ["sqlite3", "db"] }],
            properties: ["openFile"]
        });

        // If the user selected a file, update the database path
        if (result && result.length > 0) {
            dbPath = result[0];
            store.set("dbPath", dbPath);
        } else {
            app.quit();
        }
    }

    return dbPath;
};

// Connecting to the database
const connectDb = () => {
    const dbPath = getDbPath();
    return new Database(dbPath);
}

// Running a database query
const runQuery = ({ sql, params = [], type = 'all' }) => {
    // Validate the SQL query
    if (!sql || typeof sql !== 'string') {
        throw new Error('SQL query must be a valid string');
    }

    // Connecting to the database
    const db = connectDb();

    // Prepare the SQL statement
    const stmt = db.prepare(sql);

    let result = null;

    // Execute the query
    switch (type) {
        case 'get':
            result = stmt.get(...params);
            break;
        case 'all':
            result = stmt.all(...params);
            break;
        case 'run':
            result = stmt.run(...params);
            break;
        default:
            throw new Error(`Unsupported query type: ${type}`);
    }

    // Closing the database connection
    db.close();

    // Returning the result
    return result;
}

// Backup database function
const backupDatabase = async () => {
    try {
        // Get current database path
        const currentDbPath = getDbPath();
        
        if (!currentDbPath || !fs.existsSync(currentDbPath)) {
            return {
                success: false,
                message: 'Database file not found. Please ensure the database is properly configured.'
            };
        }

        // Generate filename with current date (DD-MM-YYYY format)
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const defaultFileName = `GMTS ${day}-${month}-${year}.sqlite3`;

        // Show save dialog
        const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
            title: 'Backup Database',
            defaultPath: defaultFileName,
            filters: [
                { name: 'SQLite Database', extensions: ['sqlite3'] },
                { name: 'Database Files', extensions: ['db'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (result.canceled) {
            return {
                success: false,
                message: 'Backup canceled by user.'
            };
        }

        // Copy the database file to the selected location
        fs.copyFileSync(currentDbPath, result.filePath);

        return {
            success: true,
            message: `Database backed up successfully to: ${result.filePath}`,
            backupPath: result.filePath
        };
    } catch (error) {
        console.error('Backup failed:', error);
        return {
            success: false,
            message: `Backup failed: ${error.message}`
        };
    }
};

// Change database function
const changeDatabase = async () => {
    try {
        // Show open dialog to select new database
        const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
            title: 'Select Database File',
            filters: [
                { name: 'SQLite Database', extensions: ['sqlite3'] },
                { name: 'Database Files', extensions: ['db'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });

        if (result.canceled) {
            return {
                success: false,
                message: 'Database selection canceled.'
            };
        }

        const newDbPath = result.filePaths[0];
        
        // Verify the selected file exists
        if (!fs.existsSync(newDbPath)) {
            return {
                success: false,
                message: 'Selected database file does not exist.'
            };
        }

        // Update the database path in storage
        store.set('dbPath', newDbPath);

        return {
            success: true,
            message: `Database changed successfully to: ${newDbPath}`,
            newDbPath: newDbPath
        };
    } catch (error) {
        console.error('Change database failed:', error);
        return {
            success: false,
            message: `Failed to change database: ${error.message}`
        };
    }
};

// Exporting the functions
export { getDbPath, connectDb, runQuery, backupDatabase, changeDatabase };