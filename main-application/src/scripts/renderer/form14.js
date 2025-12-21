/**
 * File: src/scripts/renderer/form14.js
 * Author: Yash Balotiya
 * Description: Form 14 renderer script - ES6 function-based
 * Created on: 01/10/2025
 * Last Modified: 21/12/2025
 */

// Import utilities
import { initializeDateRangePickers, clearDatePickers, isValidDateFormat, parseDateString } from '../utilities/form14/datePickerUtility.js';
import createInitFunction from '../utilities/form14/form14Utility.js';

// Host address variable
let hostAddress = 'localhost';

// Get host address on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    // Get the host address
    hostAddress = await window.electronAPI.getHost();

    try {
        init();
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        await window.dialogBoxAPI.showDialogBox(
            'error',
            'Error',
            `An error occurred while loading the page: ${error.message}`,
            ['OK']
        );
    }
});

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
    pageCount: document.getElementById('pageCount'),
    searchType: document.getElementById('searchType'),
    searchName: document.getElementById('searchName')
};

elements.searchType.addEventListener('change', () => {
    const selectedType = elements.searchType.value;

    if (selectedType === 'dateRange') {
        document.getElementById('startDateDiv').style.display = 'flex';
        document.getElementById('endDateDiv').style.display = 'flex';
        document.getElementById('nameInputDiv').style.display = 'none';
    } else if (selectedType === 'name') {
        document.getElementById('startDateDiv').style.display = 'none';
        document.getElementById('endDateDiv').style.display = 'none';
        document.getElementById('nameInputDiv').style.display = 'flex';
    }
});

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return '';

    const parts = dateString.split(/[-\/]/).map(Number);
    const date = parts.length === 3 && parts[2] > 1000
        ? new Date(parts[2], parts[1] - 1, parts[0])
        : new Date(dateString);

    return isNaN(date.getTime()) ? '' :
        `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
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

// Clear content - simplified (no longer used for clear button)
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
    const searchTypeValue = elements.searchType?.value;
    const searchNameValue = elements.searchName?.value?.trim();

    if (searchTypeValue === 'dateRange') {
        if (!startDateValue || !endDateValue) {
            await window.dialogBoxAPI.showDialogBox(
                'warning',
                'Incomplete Dates',
                'Please select both start and end dates.',
                ['OK']
            );
            return;
        }

        if (!isValidDateFormat(startDateValue, 'd-m-Y') || !isValidDateFormat(endDateValue, 'd-m-Y')) {
            await window.dialogBoxAPI.showDialogBox(
                'warning',
                'Invalid Date Format',
                'Please enter dates in DD-MM-YYYY format.',
                ['OK']
            );
            return;
        }

        if (parseDateString(startDateValue) > parseDateString(endDateValue)) {
            await window.dialogBoxAPI.showDialogBox(
                'warning',
                'Invalid Date Range',
                'Start date cannot be later than end date.',
                ['OK']
            );
            return;
        }
    } else if (searchTypeValue === 'name') {
        if (!searchNameValue) {
            await window.dialogBoxAPI.showDialogBox(
                'warning',
                'No Name Entered',
                'Please enter a name to search.',
                ['OK']
            );
            return;
        }
    }

    try {
        showLoading();

        // if (!window.form14API) {
        //     throw new Error('Form14 API not available. Please restart the application.');
        // }

        // const form14Data = await window.form14API.getForm14Data(startDateValue, endDateValue, searchTypeValue, searchNameValue);
        const response = await fetch(`http://${hostAddress}:3000/api/v1/form14/data?startDate=${encodeURIComponent(startDateValue)}&endDate=${encodeURIComponent(endDateValue)}&searchType=${encodeURIComponent(searchTypeValue)}&searchName=${encodeURIComponent(searchNameValue)}`);
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const form14Data = await response.json();

        if (!form14Data?.length) {
            await window.dialogBoxAPI.showDialogBox(
                'info',
                'No Records',
                'No records found for the selected criteria.',
                ['OK']
            );
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
        await window.dialogBoxAPI.showDialogBox(
            'error',
            'Error',
            `An error occurred while generating Form 14: ${error.message}`,
            ['OK']
        );
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