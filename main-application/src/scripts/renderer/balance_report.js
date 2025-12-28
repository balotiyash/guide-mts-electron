/**
 * File: src/scripts/renderer/balance_report.js
 * Author: Yash Balotiya
 * Description: Balance Report page using generic report system
 * Created on: 12/10/2025
 * Last Modified: 28/12/2025
 */

// Import necessary modules & libraries
import dateUtility from "../utilities/dataEntry/dateUtility.js";
import GenericReportUtility from "../utilities/reports/genericReportUtility.js";
import { balanceReportConfig } from "../utilities/reports/balanceReportConfig.js";
import { setupBackupDatabaseListener, setupChangeDatabaseListener, setupChangeArchitectureListener } from "../shared.js";

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    // Setup backup database listener for menu bar
    setupBackupDatabaseListener();
    
    // Setup change database listener for menu bar
    setupChangeDatabaseListener();
    
    // Setup change architecture listener for menu bar
    setupChangeArchitectureListener();
    
    // Initialize date utility
    dateUtility();
    
    // Get all required elements
    const elements = {
        searchSelect: document.getElementById("searchSelect"),
        searchText: document.getElementById("searchText"),
        startingDate: document.getElementById("starting-date"),
        endingDate: document.getElementById("ending-date"),
        startingDateText: document.getElementById("starting-date-text"),
        endingDateText: document.getElementById("ending-date-text"),
        searchBtn: document.getElementById("search-btn"),
        exportBtn: document.getElementById("export-btn"),
        clearBtn: document.getElementById("clear-btn"),
        tableBody: document.getElementById("data-table-body"),
        pageInfo: document.getElementById("pageInfo"),
        prevPageBtn: document.getElementById("prevPageBtn"),
        nextPageBtn: document.getElementById("nextPageBtn"),
        paginationControls: document.getElementById("paginationControls")
    };
    
    // Add elements to config
    const config = {
        ...balanceReportConfig,
        elements
    };
    
    // Initialize the generic report utility
    const reportUtility = new GenericReportUtility(config);
    await reportUtility.initialize();

    // Exit button functionality
    document.getElementById("exitBtn").addEventListener("click", () => {
        window.electronAPI.navigateTo("dashboard.html");
    });
});