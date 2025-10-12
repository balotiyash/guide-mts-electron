/**
 * File: src/scripts/renderer/search_page.js
 * Author: Yash Balotiya
 * Description: Handles the search page form interactions and date field functionality.
 * Created on: 11/10/2025
 * Last Modified: 12/10/2025
 */

// Import required modules & libraries
import dateUtility from "../utilities/dataEntry/dateUtility.js";
import { isoToDDMMYYYY } from "../shared.js";
import { initializeSearchUtility, performSearch, exportToCSV, clearSearch } from '../utilities/searchPage/searchUtility.js';

// Global variables
let allCustomers = [];
let filteredCustomers = [];
let currentPage = 1;
const limit = 100;

// On load
document.addEventListener("DOMContentLoaded", async () => {
    dateUtility();

    // Get elements
    const searchSelect = document.getElementById("searchSelect");
    const searchText = document.getElementById("searchText");
    const startingDate = document.getElementById("starting-date");
    const endingDate = document.getElementById("ending-date");
    const searchBtn = document.getElementById("search-btn");
    const exportBtn = document.getElementById("export-btn");
    const clearBtn = document.getElementById("clear-btn");
    const tableBody = document.getElementById("data-table-body");

    // Render current page
    const renderCurrentPage = () => {
        // Calculate pagination
        const totalPages = Math.ceil(filteredCustomers.length / limit);
        const startIndex = (currentPage - 1) * limit;
        const endIndex = Math.min(startIndex + limit, filteredCustomers.length);
        const pageData = filteredCustomers.slice(startIndex, endIndex);

        // Handle empty state
        if (pageData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8">No customers found.</td></tr>`;
            document.getElementById("paginationControls").style.display = "none";
            exportBtn.disabled = true;
            return;
        }

        // Enable export button when there's data
        exportBtn.disabled = false;

        // Render rows
        tableBody.innerHTML = "";
        pageData.forEach((customer, index) => {
            const row = document.createElement("tr");
            const globalIndex = startIndex + index + 1;
            
            row.innerHTML = `
                <td class="w5">${globalIndex}</td>
                <td class="w5">${customer.id || ''}</td>
                <td class="w15">${customer.customer_name.toUpperCase() || ''}</td>
                <td class="w10">${customer.mobile_number || ''}</td>
                <td class="w10">${customer.customer_dob ? isoToDDMMYYYY(customer.customer_dob) : ''}</td>
                <td class="w15">${customer.relation_name.toUpperCase() || ''}</td>
                <td class="w30">${customer.address.toUpperCase() || ''}</td>
                <td class="w10">${customer.created_on ? isoToDDMMYYYY(customer.created_on) : ''}</td>
            `;
            tableBody.appendChild(row);
        });

        // Update pagination
        document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById("prevPageBtn").disabled = currentPage === 1;
        document.getElementById("nextPageBtn").disabled = currentPage === totalPages;
        document.getElementById("paginationControls").style.display = totalPages > 1 ? "flex" : "none";
    }

    // Show loading
    tableBody.innerHTML = `<tr><td colspan="8">Loading...</td></tr>`;

    try {
        // Fetch data
        const response = await window.searchPageAPI.getAllCustomers();
        
        if (!response || !response.success) {
            tableBody.innerHTML = `<tr><td colspan="8">Failed to fetch customer data.</td></tr>`;
            exportBtn.disabled = true;
            return;
        }

        allCustomers = response.data || [];
        filteredCustomers = [...allCustomers];
        
        // Initialize utility functions with global references
        initializeSearchUtility({
            allCustomers, 
            filteredCustomers, 
            currentPage, 
            exportBtn, 
            renderCurrentPage,
            searchSelect, 
            searchText, 
            startingDate, 
            endingDate
        });
        
        // Set initial export button state
        exportBtn.disabled = filteredCustomers.length === 0;
        
        renderCurrentPage();

    } catch (error) {
        console.error("Error:", error);
        tableBody.innerHTML = `<tr><td colspan="8">Error loading data.</td></tr>`;
        exportBtn.disabled = true;
    } finally {
        // Hide loading screen
        const loadingDiv = document.getElementById("loadingDiv");
        if (loadingDiv) loadingDiv.style.display = "none";
    }

    // Event listeners
    searchBtn.addEventListener("click", () => {
        const searchType = searchSelect.value.trim();
        const searchValue = searchText.value.trim();
        const startDate = startingDate.value;
        const endDate = endingDate.value;

        if (!searchType && !searchValue && !startDate && !endDate) {
            window.dialogBoxAPI.showDialogBox("info", "Info", "Please enter search criteria.", ["OK"]);
            return;
        }

        if (searchType && !searchValue) {
            window.dialogBoxAPI.showDialogBox("info", "Info", "Please enter search text.", ["OK"]);
            return;
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            window.dialogBoxAPI.showDialogBox("info", "Info", "Starting date cannot be after ending date.", ["OK"]);
            return;
        }

        performSearch();
    });

    clearBtn.addEventListener("click", clearSearch);

    exportBtn.addEventListener("click", exportToCSV);

    // Pagination
    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        const totalPages = Math.ceil(filteredCustomers.length / limit);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
        }
    });

    // Search type change
    searchSelect.addEventListener("change", () => {
        const selectedType = searchSelect.value;
        searchText.value = "";
        
        switch(selectedType) {
            case "customerId":
                searchText.placeholder = "Enter Customer ID";
                searchText.type = "text";
                searchText.removeAttribute("maxlength");
                break;
            case "customerName":
                searchText.placeholder = "Enter Customer Name";
                searchText.type = "text";
                searchText.removeAttribute("maxlength");
                break;
            case "customerPhoneNo":
                searchText.placeholder = "Enter Phone Number";
                searchText.type = "tel";
                searchText.maxLength = 10;
                break;
            default:
                searchText.placeholder = "Search Text";
                searchText.type = "text";
                searchText.removeAttribute("maxlength");
        }
    });

    // Phone number validation
    searchText.addEventListener("input", () => {
        if (searchSelect.value === "customerPhoneNo") {
            searchText.value = searchText.value.replace(/[^0-9]/g, "");
        }
    });
});