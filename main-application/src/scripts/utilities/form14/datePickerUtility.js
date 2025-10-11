/* File: src/scripts/utilities/datePickerUtility.js
   Author: Yash Balotiya
   Description: Reusable utility functions for initializing date pickers (single and range)
   Created on: 11/10/2025
   Last Modified: 11/10/2025
*/

// Functions to initialize date pickers using Flatpickr and Inputmask
const initializeSingleDatePicker = (element, options = {}) => {
    const elementRef = typeof element === 'string' ? document.getElementById(element) : element;
    
    if (!elementRef) {
        console.error(`Date picker element not found: ${element}`);
        return null;
    }

    // Default configuration
    const defaultConfig = {
        dateFormat: 'd-m-Y',
        allowInput: true,
        maxDate: 'today'
    };

    // Merge user options with defaults
    const config = { ...defaultConfig, ...options };

    // Apply Flatpickr
    const picker = flatpickr(elementRef, config);

    // Apply input mask if not disabled
    if (!options.disableInputMask) {
        Inputmask('99-99-9999', {
            placeholder: 'DD-MM-YYYY',
            clearMaskOnLostFocus: false
        }).mask(elementRef);
    }

    return picker;
};

// Function to initialize a date range picker
const initializeDateRangePickers = (config) => {
    const {
        startElement,
        endElement,
        onStartChange,
        onEndChange,
        options = {}
    } = config;

    // Get DOM elements
    const startRef = typeof startElement === 'string' ? document.getElementById(startElement) : startElement;
    const endRef = typeof endElement === 'string' ? document.getElementById(endElement) : endElement;

    if (!startRef || !endRef) {
        console.error('Date range picker elements not found:', { startElement, endElement });
        return { start: null, end: null };
    }

    // Default configuration
    const defaultConfig = {
        dateFormat: 'd-m-Y',
        allowInput: true,
        maxDate: 'today'
    };

    // Merge user options with defaults
    const baseConfig = { ...defaultConfig, ...options };

    // Storage for picker instances
    const pickers = {};

    // Initialize start date picker
    pickers.start = flatpickr(startRef, {
        ...baseConfig,
        onChange: (selectedDates) => {
            // Set minimum date for end picker
            if (selectedDates.length && pickers.end) {
                pickers.end.set('minDate', selectedDates[0]);
            }
            // Call custom callback if provided
            if (onStartChange) {
                onStartChange(selectedDates, pickers);
            }
        }
    });

    // Initialize end date picker
    pickers.end = flatpickr(endRef, {
        ...baseConfig,
        onChange: (selectedDates) => {
            // Set maximum date for start picker
            if (selectedDates.length && pickers.start) {
                pickers.start.set('maxDate', selectedDates[0]);
            }
            // Call custom callback if provided
            if (onEndChange) {
                onEndChange(selectedDates, pickers);
            }
        }
    });

    // Apply input masks if not disabled
    if (!options.disableInputMask) {
        const maskConfig = {
            placeholder: 'DD-MM-YYYY',
            clearMaskOnLostFocus: false
        };
        
        Inputmask('99-99-9999', maskConfig).mask([startRef, endRef]);
    }

    return pickers;
};

// Function to clear date pickers
const clearDatePickers = (pickers) => {
    if (!pickers) return;

    if (Array.isArray(pickers)) {
        pickers.forEach(picker => picker?.clear?.());
    } else if (typeof pickers === 'object') {
        if (pickers.clear) {
            // Single picker
            pickers.clear();
        } else {
            // Object of pickers
            Object.values(pickers).forEach(picker => picker?.clear?.());
        }
    }
};

// Utility: validate date format (DD-MM-YYYY)
const isValidDateFormat = (dateString) => {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateString.match(regex);
    if (!match) return false;

    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

// Utility: parse date string (DD-MM-YYYY) to Date object
const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Export utilities
export {
    initializeSingleDatePicker,
    initializeDateRangePickers,
    clearDatePickers,
    isValidDateFormat,
    parseDateString
};