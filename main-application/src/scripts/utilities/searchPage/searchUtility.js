/**
 * File: src/scripts/utilities/searchPage/searchUtility.js
 * Author: Yash Balotiya
 * Description: Contains utility functions for the search page.
 * Created on: 11/10/2025
 * Last Modified: 12/10/2025
 */

// Import required utilities
import { isoToDDMMYYYY } from "../../shared.js";

// Global variables (shared with search_page.js)
let allCustomers, filteredCustomers, currentPage, exportBtn, renderCurrentPage;
let searchSelect, searchText, startingDate, endingDate;

// Initialize function to set global references
const initializeSearchUtility = (globals) => {
    ({ allCustomers, filteredCustomers, currentPage, exportBtn, renderCurrentPage, 
       searchSelect, searchText, startingDate, endingDate } = globals);
};

// Search function
const performSearch = () => {
    // Get search criteria
    const searchType = searchSelect.value.trim();
    const searchValue = searchText.value.trim().toLowerCase();
    const startDate = startingDate.value;
    const endDate = endingDate.value;

    currentPage = 1;
    filteredCustomers.length = 0;
    filteredCustomers.push(...allCustomers);

    // Text search
    if (searchType && searchValue) {
        const filtered = filteredCustomers.filter(customer => {
            switch (searchType) {
                case 'customerName':
                    return customer.customer_name && customer.customer_name.toLowerCase().includes(searchValue);
                case 'customerPhoneNo':
                    return customer.mobile_number && customer.mobile_number.toString().includes(searchValue);
                case 'customerDOB':
                    // Handle DOB search with flexible date format matching
                    if (customer.customer_dob) {
                        const dobFormatted = isoToDDMMYYYY(customer.customer_dob);
                        const dobWithSlash = isoToDDMMYYYY(customer.customer_dob, '/');
                        
                        // Try to convert user input to different formats for comparison
                        let userInputISO = '';
                        
                        // If user input is in DD-MM-YYYY or DD/MM/YYYY format, convert to YYYY-MM-DD
                        const userDateMatch = searchValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
                        if (userDateMatch) {
                            const [, day, month, year] = userDateMatch;
                            userInputISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        }
                        
                        // Check multiple format matches
                        return dobFormatted.includes(searchValue) || 
                               dobWithSlash.includes(searchValue) ||
                               // Check if the original database format matches (YYYY-MM-DD)
                               customer.customer_dob.includes(searchValue) ||
                               // Check if converted user input matches database format
                               (userInputISO && customer.customer_dob.includes(userInputISO)) ||
                               // Remove separators and do numeric comparison
                               dobFormatted.replace(/[-/]/g, '').includes(searchValue.replace(/[-/]/g, ''));
                    }
                    return false;
                default:
                    return false;
            }
        });
        filteredCustomers.length = 0;
        filteredCustomers.push(...filtered);
    }

    // Date filter
    if (startDate || endDate) {
        const filtered = filteredCustomers.filter(customer => {
            if (!customer.created_on) return false;
            const customerDate = new Date(customer.created_on);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && end) return customerDate >= start && customerDate <= end;
            if (start) return customerDate >= start;
            if (end) return customerDate <= end;
            return true;
        });
        filteredCustomers.length = 0;
        filteredCustomers.push(...filtered);
    }

    exportBtn.disabled = filteredCustomers.length === 0;
    renderCurrentPage();
};

// Export to CSV function
const exportToCSV = async () => {
    try {
        // Check if there's data to export
        if (filteredCustomers.length === 0) {
            window.dialogBoxAPI.showDialogBox("info", "Info", "No data to export. Please perform a search first.", ["OK"]);
            return;
        }

        // Show file save dialog
        const filePath = await window.searchPageAPI.showSaveDialog({
            title: 'Export Customer Data',
            defaultPath: `customer_data_${new Date().toISOString().split('T')[0]}.csv`,
            filters: [
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!filePath) {
            // User cancelled the dialog
            return;
        }

        // Prepare CSV headers (in CAPS as requested)
        const headers = [
            'SR_NO',
            'CUSTOMER_ID',
            'CUSTOMER_NAME',
            'MOBILE_NUMBER',
            'DATE_OF_BIRTH',
            'RELATION_NAME',
            'ADDRESS',
            'REGISTRATION_DATE'
        ];

        // Prepare CSV data
        const csvData = [];
        csvData.push(headers.join(','));

        // Add customer data (all in CAPS)
        filteredCustomers.forEach((customer, index) => {
            const row = [
                index + 1,
                customer.id || '',
                `"${(customer.customer_name || '').toUpperCase()}"`,
                customer.mobile_number || '',
                customer.customer_dob ? isoToDDMMYYYY(customer.customer_dob) : '',
                `"${(customer.relation_name || '').toUpperCase()}"`,
                `"${(customer.address || '').toUpperCase()}"`,
                customer.created_on ? isoToDDMMYYYY(customer.created_on) : ''
            ];
            csvData.push(row.join(','));
        });

        // Convert to CSV string
        const csvContent = csvData.join('\n');

        // Write file using electron API
        const writeResult = await window.searchPageAPI.writeFile(filePath, csvContent);

        if (writeResult.success) {
            window.dialogBoxAPI.showDialogBox(
                "info",
                "Export Successful",
                `Customer data exported successfully!\nLocation: ${filePath}\nRecords exported: ${filteredCustomers.length}`,
                ["OK"]
            );
        } else {
            window.dialogBoxAPI.showDialogBox("error", "Export Failed", `Failed to export data: ${writeResult.error}`, ["OK"]);
        }

    } catch (error) {
        console.error("Export error:", error);
        window.dialogBoxAPI.showDialogBox("error", "Export Error", `An error occurred while exporting: ${error.message}`, ["OK"]);
    }
}

// Clear function
const clearSearch = () => {
    searchSelect.value = "";
    searchText.value = "";
    document.getElementById("starting-date-text").value = "";
    document.getElementById("ending-date-text").value = "";
    startingDate.value = "";
    endingDate.value = "";
    searchText.placeholder = "Search Text";
    searchText.type = "text";
    searchText.removeAttribute("maxlength");

    filteredCustomers.length = 0;
    filteredCustomers.push(...allCustomers);
    currentPage = 1;
    exportBtn.disabled = filteredCustomers.length === 0;
    renderCurrentPage();
};

// Export functions
export { initializeSearchUtility, performSearch, exportToCSV, clearSearch };