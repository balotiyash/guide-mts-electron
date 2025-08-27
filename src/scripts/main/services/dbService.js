/** 
 * File: src/scripts/main/services/dbService.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to manage the database.
 * Created on: 26/08/2025
 * Last Modified: 26/08/2025
*/

// Importing required modules & libraries
import fs from "fs";
import Store from "electron-store";
import { dialog, app } from "electron";
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

// Exporting the functions
export { getDbPath, connectDb, runQuery };