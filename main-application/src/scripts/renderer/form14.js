/**
 * File: src/scripts/renderer/form14.js
 * Author: Yash Balotiya
 * Description: Form 14 renderer script - ES6 function-based
 * Created on: 01/10/2025
 * Last Modified: 11/10/2025
 */

// Import utilities
import { initializeDateRangePickers, clearDatePickers, isValidDateFormat, parseDateString } from '../utilities/form14/datePickerUtility.js';
import createInitFunction from '../utilities/form14/form14Utility.js';

// State variables - using object to allow mutation in utility
const state = {
    currentData: null
};
const STUDENTS_PER_PAGE = 3;

// DOM elements cache
const elements = {
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    generateBtn: document.getElementById('generatePreview'),
    printBtn: document.getElementById('printForm'),
    clearBtn: document.getElementById('clearForm'),
    backBtn: document.getElementById('backToDashboard'),
    loading: document.getElementById('loadingDiv'),
    content: document.getElementById('form14Content'),
    formInfo: document.getElementById('formInfo'),
    recordCount: document.getElementById('recordCount'),
    pageCount: document.getElementById('pageCount')
};

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const parts = dateString.split(/[-\/]/).map(Number);
    const date = parts.length === 3 && parts[2] > 1000 
        ? new Date(parts[2], parts[1] - 1, parts[0]) 
        : new Date(dateString);
    
    return isNaN(date.getTime()) ? '' : 
        `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

// UI state management
const showLoading = () => elements.loading && (elements.loading.style.display = 'flex');
const hideLoading = () => elements.loading && (elements.loading.style.display = 'none');

// Content rendering
const showPreview = () => {
    const tableContainer = document.querySelector('.table-container');
    if (elements.content && tableContainer) {
        elements.content.style.display = 'block';
        tableContainer.classList.add('has-content');
        console.log('Preview displayed successfully');
    }
};

// Clear content
const clearPreview = () => {
    const tableContainer = document.querySelector('.table-container');
    const { content, printBtn, recordCount, pageCount } = elements;
    
    if (content && tableContainer) {
        content.style.display = 'none';
        content.innerHTML = '';
        tableContainer.classList.remove('has-content');
    }
    
    if (printBtn) printBtn.disabled = true;
    if (recordCount) recordCount.textContent = '0';
    if (pageCount) pageCount.textContent = '0';
    state.currentData = null;
};

// Update form info
const updateFormInfo = (recordsFound) => {
    const totalPages = Math.ceil(recordsFound / STUDENTS_PER_PAGE);
    const { recordCount, pageCount, formInfo } = elements;
    
    if (recordCount) recordCount.textContent = recordsFound;
    if (pageCount) pageCount.textContent = totalPages;
    if (formInfo) formInfo.style.display = 'block';
};

// Date picker initialization
const initializeDatePickers = () => {
    const { startDate, endDate } = elements;
    if (!startDate || !endDate) {
        console.error('Date input elements not found');
        return;
    }

    // Configuration for the date range
    const dateRangeConfig = {
        startElement: 'startDate',
        endElement: 'endDate',
        options: {
            maxDate: 'today'
        },
        onStartChange: () => {
            clearPreview();
        },
        onEndChange: () => {
            clearPreview();
        }
    };

    // Initialize the date range picker using the utility
    initializeDateRangePickers(dateRangeConfig);
};

// Event handlers
const handleGeneratePreview = async () => {
    const { startDate, endDate } = elements;
    const startDateValue = startDate?.value?.trim();
    const endDateValue = endDate?.value?.trim();

    if (!startDateValue || !endDateValue) {
        alert('Please select both start and end dates.');
        return;
    }

    if (!isValidDateFormat(startDateValue, 'd-m-Y') || !isValidDateFormat(endDateValue, 'd-m-Y')) {
        alert('Please enter dates in DD-MM-YYYY format.');
        return;
    }

    if (parseDateString(startDateValue) > parseDateString(endDateValue)) {
        alert('Start date cannot be later than end date.');
        return;
    }

    try {
        showLoading();
        
        if (!window.form14API) {
            throw new Error('Form14 API not available. Please restart the application.');
        }

        const form14Data = await window.form14API.getForm14Data(startDateValue, endDateValue);
        
        if (!form14Data?.length) {
            alert('No records found for the selected date range.');
            hideLoading();
            return;
        }

        state.currentData = form14Data;
        console.log('Form data loaded, state.currentData:', state.currentData?.length, 'records');
        
        // Use the globally exported function from the utility
        if (window.generateForm14Content) {
            window.generateForm14Content(form14Data);
        } else {
            console.error('generateForm14Content function not available');
            hideLoading();
            return;
        }
        
        showPreview();
        updateFormInfo(form14Data.length);
        elements.printBtn.disabled = false;
        hideLoading();
        
    } catch (error) {
        console.error('Error generating Form 14 preview:', error);
        alert('Error generating Form 14: ' + error.message);
        hideLoading();
    }
};

// Create the init function with all dependencies
const init = createInitFunction(
    elements, 
    state, 
    formatDate, 
    clearPreview, 
    showLoading, 
    hideLoading, 
    updateFormInfo, 
    showPreview, 
    initializeDatePickers, 
    handleGeneratePreview
);

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    try {
        init();
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        alert('An error occurred while loading the page: ' + error.message);
    }
});