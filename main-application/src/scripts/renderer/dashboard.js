/** 
 * File: src/scripts/renderer/dashboard.js
 * Author: Yash Balotiya
 * Description: This file contains the JS code to manage user dashboard functionality for the Guide Motor Training School application.
 * Created on: 08/08/2025
 * Last Modified: 22/10/2025
*/

// Importing required modules & libraries
import initCharts from "./dashboard_charts.js";
import { initFloatingBubbles } from "../utilities/dashboard/dashboardUtility.js";
// import log from "../logger.js";

// Log the loading of the dashboard script
// log.info("Dashboard script loaded.");

// DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async () => {
    // Get the database path
    const dbPath = await window.electronAPI.getDbPath();

    // Navigation buttons
    document.getElementById('registrationButton').addEventListener('click', () => {
        window.electronAPI.navigateTo('data_entry.html');
    });
    document.getElementById('feesButton').addEventListener('click', () => {
        window.electronAPI.navigateTo('payment_entry.html');
    });
    document.getElementById('fuelEntryButton').addEventListener('click', () => {
        window.electronAPI.navigateTo('fuel_entry.html');
    });
    document.getElementById('form14Button').addEventListener('click', () => {
        window.electronAPI.navigateTo('form14.html');
    });
    document.getElementById('searchButton').addEventListener('click', () => {
        window.electronAPI.navigateTo('search_page.html');
    });

    // Backup button functionality
    const backupButton = document.getElementById('backupButton');
    
    if (backupButton) {
        backupButton.addEventListener('click', async () => {
            try {
                // Show loading state
                const originalText = backupButton.querySelector('p').textContent;
                backupButton.querySelector('p').textContent = 'Backing up...';
                backupButton.style.pointerEvents = 'none';
                
                // Call backup API
                const result = await window.electronAPI.backupDatabase();
                
                // Restore button state
                backupButton.querySelector('p').textContent = originalText;
                backupButton.style.pointerEvents = 'auto';
                
                // Show result dialog
                if (result.success) {
                    await window.dialogBoxAPI.showDialogBox(
                        'info',
                        'Backup Successful',
                        result.message,
                        ['OK']
                    );
                } else {
                    await window.dialogBoxAPI.showDialogBox(
                        'error',
                        'Backup Failed',
                        result.message,
                        ['OK']
                    );
                }
            } catch (error) {
                // Restore button state on error
                backupButton.querySelector('p').textContent = 'Backup';
                backupButton.style.pointerEvents = 'auto';
                
                console.error('Backup error:', error);
                await window.dialogBoxAPI.showDialogBox(
                    'error',
                    'Backup Error',
                    'An unexpected error occurred while backing up the database.',
                    ['OK']
                );
            }
        });
    }

    // Set initial month input value
    let now = new Date();
    const monthInput = document.getElementById("monthInput");
    monthInput.value = now.toISOString().slice(0, 7);

    // Helper: fetch + process + render charts
    const loadAndRenderCharts = async (year) => {
        let [
            chart1Raw,
            chart2Raw,
            chart3Raw
        ] = await Promise.all([
            window.dashboardAPI.getChart1Data(year).catch(() => []),
            window.dashboardAPI.getChart2Data(year).catch(() => []),
            window.dashboardAPI.getChart3Data(year).catch(() => [])
        ]);

        document.getElementById("loadingDiv").style.display = "none";

        // ---------- Chart 1 ----------
        const chart1Data = Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0");
            const item = chart1Raw.find(x => x.month === m);
            return item ? item.count : 0;
        });

        // ---------- Chart 2 ----------
        const chart2RevenueData = Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0");
            const item = chart2Raw.revenue.find(x => x.month === m);
            return item ? item.total_amount : 0;
        });

        const chart2FuelData = Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0");
            const item = chart2Raw.fuel.find(x => x.month === m);
            return item ? item.total_amount : 0;
        });

        // ---------- Chart 3 ----------
        const filteredChart3 = chart3Raw.filter(item => item.vehicle_name !== "dummy");
        const chart3Names = filteredChart3.map(item => item.vehicle_name.toUpperCase());
        const chart3Counts = filteredChart3.map(item => item.usage_count);

        // Update/init charts
        initCharts(chart1Data, chart2RevenueData, chart2FuelData, chart3Names, chart3Counts);
    };

    // Initial load Charts
    loadAndRenderCharts(now.getFullYear().toString());

    // Reload charts when year changes Charts
    monthInput.addEventListener("change", (event) => {
        const selectedYear = event.target.value.split("-")[0];
        loadAndRenderCharts(selectedYear);
    });

    // Date & time updater
    const formatDateToDDMMYYYY = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    document.getElementById("currentDate").innerText = formatDateToDDMMYYYY(now);
    setInterval(() => {
        now = new Date();
        document.getElementById("currentTime").innerText = now.toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        }).toUpperCase();
    }, 1000);

    // Dashboard stats
    const [repeatStudentsCount, currentYearCount, allTimeCount, pendingPaymentsCount] = await Promise.all([
        window.dashboardAPI.getRepeatStudentsCount(),
        window.dashboardAPI.getCurrentYearCount(),
        window.dashboardAPI.getAllTimeCount(),
        window.dashboardAPI.getPendingPaymentsCount()
    ]);

    // Update DOM elements with the fetched counts
    document.getElementById("repeatStudentsCountTxt").innerText = repeatStudentsCount;
    document.getElementById("currentYearCountTxt").innerText = currentYearCount;
    document.getElementById("allTimeCountTxt").innerText = allTimeCount;
    document.getElementById("pendingPaymentsCountTxt").innerText = pendingPaymentsCount;

    // Listen for change database requests from menu
    window.electronAPI.onChangeDatabaseRequest(async () => {
        try {
            // Show confirmation dialog
            const confirmResult = await window.dialogBoxAPI.showDialogBox(
                'question',
                'Change Database',
                'Are you sure you want to change the database? This will close the current database connection.',
                ['Yes', 'No']
            );

            if (confirmResult === 0) { // User clicked 'Yes'
                // Call change database API
                const result = await window.electronAPI.changeDatabase();
                
                if (result.success) {
                    // Show success message and reload the dashboard
                    await window.dialogBoxAPI.showDialogBox(
                        'info',
                        'Database Changed',
                        result.message + '\n\nThe application will now reload with the new database.',
                        ['OK']
                    );
                    
                    // Reload the current page to refresh with new database
                    location.reload();
                } else {
                    // Show error message
                    await window.dialogBoxAPI.showDialogBox(
                        'error',
                        'Database Change Failed',
                        result.message,
                        ['OK']
                    );
                }
            }
        } catch (error) {
            console.error('Database change error:', error);
            await window.dialogBoxAPI.showDialogBox(
                'error',
                'Database Change Error',
                'An unexpected error occurred while changing the database.',
                ['OK']
            );
        }
    });

    // Initialize floating bubbles
    initFloatingBubbles();
});