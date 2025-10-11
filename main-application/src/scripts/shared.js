/* File: src/scripts/shared.js
   Author: Yash Balotiya
   Description: Common shared utilities for both main and renderer processes.
   Created on: 21/09/2025
   Last Modified: 11/10/2025
*/

// Utility: convert ISO (yyyy-mm-dd) → dd-mm-yyyy or dd/mm/yyyy
const isoToDDMMYYYY = (iso, separator = '-') => {
    if (!iso || typeof iso !== 'string') return "";
    
    // Handle various date formats
    let parts;
    
    // Check if it's already in DD-MM-YYYY or DD/MM/YYYY format
    if (iso.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
        // If separators match, return as is; otherwise convert separator
        const currentSeparator = iso.includes('/') ? '/' : '-';
        if (currentSeparator === separator) {
            return iso;
        }
        // Convert separator
        return iso.replace(/[-/]/g, separator);
    }
    
    // Handle ISO format (YYYY-MM-DD) or datetime (YYYY-MM-DD HH:MM:SS)
    if (iso.includes('-')) {
        const dateOnly = iso.split(' ')[0]; // Remove time if present
        parts = dateOnly.split('-');
        
        // Check if we have 3 parts
        if (parts.length === 3) {
            let [y, m, d] = parts;
            
            // Validate and fix malformed dates
            y = parseInt(y) || new Date().getFullYear();
            m = parseInt(m) || 1;
            d = parseInt(d) || 1;
            
            // Ensure month and day are in valid range
            if (m < 1 || m > 12) m = 1;
            if (d < 1 || d > 31) d = 1;
            
            // Pad with zeros
            const dd = String(d).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const yyyy = String(y).padStart(4, '0');
            
            return `${dd}${separator}${mm}${separator}${yyyy}`;
        }
    }
    
    // If all else fails, return empty string
    console.warn(`Invalid date format received: ${iso}`);
    return "";
};

// Function to get current date and time in 'YYYY-MM-DD HH:MM:SS' format
const getFormattedDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Utility: convert DD-MM-YYYY → YYYY-MM-DD for backend
const ddmmyyyyToISO = (ddmmyyyy) => {
    if (!ddmmyyyy || typeof ddmmyyyy !== 'string') return "";
    
    const parts = ddmmyyyy.split('-');
    if (parts.length === 3) {
        const [d, m, y] = parts;
        
        // Validate parts
        const day = parseInt(d) || 1;
        const month = parseInt(m) || 1;
        const year = parseInt(y) || new Date().getFullYear();
        
        // Ensure valid ranges
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
            const dd = String(day).padStart(2, '0');
            const mm = String(month).padStart(2, '0');
            const yyyy = String(year).padStart(4, '0');
            
            return `${yyyy}-${mm}-${dd}`;
        }
    }
    
    console.warn(`Invalid DD-MM-YYYY format: ${ddmmyyyy}`);
    return "";
};

// Utility: validate and sanitize date input
const sanitizeDate = (dateInput) => {
    if (!dateInput) return null;
    
    // Try to create a valid date
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateInput}`);
        return null;
    }
    
    // Convert to ISO string (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

// Export utilities
export {
    isoToDDMMYYYY,
    getFormattedDateTime,
    ddmmyyyyToISO,
    sanitizeDate
};