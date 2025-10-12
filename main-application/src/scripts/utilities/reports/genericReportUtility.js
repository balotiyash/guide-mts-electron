/**
 * File: src/scripts/utilities/reports/genericReportUtility.js
 * Author: Yash Balotiya
 * Description: Generic utility for all report pages (Balance, Collection, etc.)
 * Created on: 12/10/2025
 * Last Modified: 12/10/2025
 */

import { isoToDDMMYYYY } from "../../shared.js";

class GenericReportUtility {
    constructor(config) {
        this.config = config;
        this.allData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.limit = 100;
        this.isInitialized = false;
    }

    // Initialize the report system
    async initialize() {
        if (this.isInitialized) return;

        try {
            this.setupEventListeners();
            await this.loadInitialData();
            this.isInitialized = true;
        } catch (error) {
            console.error(`Error initializing ${this.config.reportType} report:`, error);
            this.showError("Failed to initialize report system.");
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        const { 
            searchBtn, exportBtn, clearBtn,
            prevPageBtn, nextPageBtn,
            searchSelect, searchText 
        } = this.config.elements;

        // Search button
        searchBtn?.addEventListener("click", () => this.performSearch());
        
        // Export button  
        exportBtn?.addEventListener("click", () => this.exportToCSV());
        
        // Clear button
        clearBtn?.addEventListener("click", () => this.clearSearch());
        
        // Pagination
        prevPageBtn?.addEventListener("click", () => this.previousPage());
        nextPageBtn?.addEventListener("click", () => this.nextPage());
        
        // Search type change
        searchSelect?.addEventListener("change", () => this.onSearchTypeChange());
        
        // Input validation
        searchText?.addEventListener("input", () => this.onSearchInput());
    }

    // Load initial data
    async loadInitialData() {
        const { tableBody, exportBtn } = this.config.elements;
        
        this.showLoading();
        
        try {
            const response = await this.config.api.getData();
            
            if (!response || !response.success) {
                this.showError("Failed to fetch data.");
                exportBtn.disabled = true;
                return;
            }

            this.allData = response.data || [];
            this.filteredData = [...this.allData];
            exportBtn.disabled = this.filteredData.length === 0;
            
            this.renderCurrentPage();
            
        } catch (error) {
            console.error("Error loading data:", error);
            this.showError("Error loading data.");
            exportBtn.disabled = true;
        } finally {
            this.hideLoading();
        }
    }

    // Render current page data
    renderCurrentPage() {
        const { tableBody, pageInfo, prevPageBtn, nextPageBtn, paginationControls, exportBtn } = this.config.elements;
        
        // Calculate pagination
        const totalPages = Math.ceil(this.filteredData.length / this.limit);
        const startIndex = (this.currentPage - 1) * this.limit;
        const endIndex = Math.min(startIndex + this.limit, this.filteredData.length);
        const pageData = this.filteredData.slice(startIndex, endIndex);

        // Handle empty state
        if (pageData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${this.config.columns.length}">No data found.</td></tr>`;
            paginationControls.style.display = "none";
            exportBtn.disabled = true;
            return;
        }

        // Enable export button when there's data
        exportBtn.disabled = false;

        // Render rows
        tableBody.innerHTML = "";
        pageData.forEach((item, index) => {
            const row = document.createElement("tr");
            const globalIndex = startIndex + index + 1;
            
            // Build row HTML using column configuration
            const cellsHtml = this.config.columns.map(column => {
                if (column.key === 'serial') {
                    return `<td class="${column.class || ''}">${globalIndex}</td>`;
                }
                
                let value = this.getNestedValue(item, column.key) || '';
                
                // Apply formatting if specified
                if (column.format) {
                    value = this.formatValue(value, column.format);
                }
                
                return `<td class="${column.class || ''}">${value}</td>`;
            }).join('');
            
            row.innerHTML = cellsHtml;
            tableBody.appendChild(row);
        });

        // Update pagination
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        prevPageBtn.disabled = this.currentPage === 1;
        nextPageBtn.disabled = this.currentPage === totalPages;
        paginationControls.style.display = totalPages > 1 ? "flex" : "none";
    }

    // Perform search based on criteria
    performSearch() {
        const { searchSelect, searchText, startingDate, endingDate } = this.config.elements;
        
        const searchType = searchSelect?.value?.trim();
        const searchValue = searchText?.value?.trim();
        const startDate = startingDate?.value;
        const endDate = endingDate?.value;

        // Check if any search parameter is provided
        const hasSearchCriteria = searchType || searchValue || startDate || endDate;
        
        if (!hasSearchCriteria) {
            window.dialogBoxAPI.showDialogBox(
                "info", 
                "Search Required", 
                "Please select at least one search parameter:\n• Search Type with Search Text\n• Starting Date\n• Ending Date\n• Date Range", 
                ["OK"]
            );
            return;
        }

        // If search type is selected, search text is required
        if (searchType && !searchValue) {
            window.dialogBoxAPI.showDialogBox(
                "info", 
                "Search Text Required", 
                "Please enter search text for the selected search type.", 
                ["OK"]
            );
            return;
        }

        // If search text is provided but no search type selected
        if (searchValue && !searchType) {
            window.dialogBoxAPI.showDialogBox(
                "info", 
                "Search Type Required", 
                "Please select a search type for the entered search text.", 
                ["OK"]
            );
            return;
        }

        // Date validation
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start > end) {
                window.dialogBoxAPI.showDialogBox(
                    "info", 
                    "Invalid Date Range", 
                    "Starting date cannot be after ending date.", 
                    ["OK"]
                );
                return;
            }
        }

        this.currentPage = 1;
        this.filteredData = [...this.allData];

        // Apply text search
        if (searchType && searchValue) {
            this.filteredData = this.filteredData.filter(item => {
                const searchConfig = this.config.searchFields[searchType];
                if (!searchConfig) return false;
                
                const fieldValue = this.getNestedValue(item, searchConfig.field);
                if (!fieldValue) return false;
                
                const normalizedValue = fieldValue.toString().toLowerCase();
                const normalizedSearch = searchValue.toLowerCase();
                
                return normalizedValue.includes(normalizedSearch);
            });
        }

        // Apply date filter with proper range handling
        if (startDate || endDate) {
            this.filteredData = this.filteredData.filter(item => {
                const dateField = this.config.dateFilterField;
                if (!dateField) return true;
                
                const itemDate = this.getNestedValue(item, dateField);
                if (!itemDate) return false;
                
                const date = new Date(itemDate);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                // Set time to handle date comparison properly
                if (start) start.setHours(0, 0, 0, 0);
                if (end) end.setHours(23, 59, 59, 999);
                date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

                if (start && end) {
                    return date >= start && date <= end;
                } else if (start) {
                    return date >= start;
                } else if (end) {
                    return date <= end;
                }
                return true;
            });
        }

        this.config.elements.exportBtn.disabled = this.filteredData.length === 0;
        this.renderCurrentPage();

        // Show search results summary
        const totalRecords = this.allData.length;
        const filteredRecords = this.filteredData.length;
        
        if (filteredRecords === 0) {
            window.dialogBoxAPI.showDialogBox(
                "info", 
                "No Results Found", 
                "No records match your search criteria. Please try different search parameters.", 
                ["OK"]
            );
        } else if (filteredRecords < totalRecords) {
            // Optional: Show search success message
            // window.dialogBoxAPI.showDialogBox(
            //     "info", 
            //     "Search Complete", 
            //     `Found ${filteredRecords} records out of ${totalRecords} total records.`, 
            //     ["OK"]
            // );
        }
    }

    // Export data to CSV
    async exportToCSV() {
        try {
            if (this.filteredData.length === 0) {
                window.dialogBoxAPI.showDialogBox(
                    "info", 
                    "No Data to Export", 
                    "No data available to export. Please perform a search to filter data or ensure there are records available.", 
                    ["OK"]
                );
                return;
            }

            // Show file save dialog
            const filePath = await this.config.api.showSaveDialog({
                title: `Export ${this.config.reportName} Data`,
                defaultPath: `${this.config.reportType}_data_${new Date().toISOString().split('T')[0]}.csv`,
                filters: [
                    { name: 'CSV Files', extensions: ['csv'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (!filePath) return;

            // Prepare CSV headers
            const headers = this.config.csvHeaders;
            const csvData = [headers.join(',')];

            // Add data rows
            this.filteredData.forEach((item, index) => {
                const row = this.config.csvMapping.map(mapping => {
                    if (mapping.key === 'serial') {
                        return index + 1;
                    }
                    
                    let value = this.getNestedValue(item, mapping.key) || '';
                    
                    if (mapping.format) {
                        value = this.formatValue(value, mapping.format);
                    }
                    
                    // Wrap strings in quotes and escape
                    if (typeof value === 'string' && value.includes(',')) {
                        value = `"${value}"`;
                    }
                    
                    return value;
                });
                csvData.push(row.join(','));
            });

            // Write file
            const csvContent = csvData.join('\n');
            const writeResult = await this.config.api.writeFile(filePath, csvContent);

            if (writeResult.success) {
                window.dialogBoxAPI.showDialogBox(
                    "info",
                    "Export Successful",
                    `${this.config.reportName} data exported successfully!\nLocation: ${filePath}\nRecords exported: ${this.filteredData.length}`,
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

    // Clear all search criteria
    clearSearch() {
        const { 
            searchSelect, searchText, startingDate, endingDate, 
            startingDateText, endingDateText, exportBtn 
        } = this.config.elements;
        
        if (searchSelect) searchSelect.value = "";
        if (searchText) {
            searchText.value = "";
            searchText.placeholder = "Search Text";
            searchText.type = "text";
            searchText.removeAttribute("maxlength");
        }
        
        // Clear date fields
        if (startingDate) startingDate.value = "";
        if (endingDate) endingDate.value = "";
        
        // Clear flatpickr text fields
        if (startingDateText) startingDateText.value = "";
        if (endingDateText) endingDateText.value = "";

        this.filteredData = [...this.allData];
        this.currentPage = 1;
        exportBtn.disabled = this.filteredData.length === 0;
        this.renderCurrentPage();

        // Show success message
        window.dialogBoxAPI.showDialogBox(
            "info", 
            "Search Cleared", 
            "All search criteria have been cleared. Showing all records.", 
            ["OK"]
        );
    }

    // Navigation methods
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderCurrentPage();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.limit);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderCurrentPage();
        }
    }

    // Handle search type change
    onSearchTypeChange() {
        const { searchSelect, searchText } = this.config.elements;
        if (!searchSelect || !searchText) return;
        
        const selectedType = searchSelect.value;
        const searchConfig = this.config.searchFields[selectedType];
        
        searchText.value = "";
        
        if (searchConfig) {
            searchText.placeholder = searchConfig.placeholder || "Enter search text";
            searchText.type = searchConfig.type || "text";
            
            if (searchConfig.maxLength) {
                searchText.maxLength = searchConfig.maxLength;
            } else {
                searchText.removeAttribute("maxlength");
            }
        } else {
            searchText.placeholder = "Search Text";
            searchText.type = "text";
            searchText.removeAttribute("maxlength");
        }
    }

    // Handle search input validation
    onSearchInput() {
        const { searchSelect, searchText } = this.config.elements;
        if (!searchSelect || !searchText) return;
        
        const selectedType = searchSelect.value;
        const searchConfig = this.config.searchFields[selectedType];
        
        if (searchConfig?.validation === 'numeric') {
            searchText.value = searchText.value.replace(/[^0-9]/g, "");
        }
    }

    // Utility methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    formatValue(value, format) {
        switch (format) {
            case 'uppercase':
                return value.toString().toUpperCase();
            case 'date':
                return isoToDDMMYYYY(value);
            case 'currency':
                return `₹${Number(value).toFixed(2)}`;
            case 'number':
                return Number(value).toFixed(2);
            default:
                return value;
        }
    }

    showLoading() {
        const { tableBody } = this.config.elements;
        tableBody.innerHTML = `<tr><td colspan="${this.config.columns.length}">Loading...</td></tr>`;
        
        const loadingDiv = document.getElementById("loadingDiv");
        if (loadingDiv) loadingDiv.style.display = "flex";
    }

    showError(message) {
        const { tableBody } = this.config.elements;
        tableBody.innerHTML = `<tr><td colspan="${this.config.columns.length}">${message}</td></tr>`;
    }

    hideLoading() {
        const loadingDiv = document.getElementById("loadingDiv");
        if (loadingDiv) loadingDiv.style.display = "none";
    }
}

export default GenericReportUtility;