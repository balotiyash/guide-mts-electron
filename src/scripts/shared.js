/* File: src/scripts/shared.js
   Author: Yash Balotiya
   Description: Common shared utilities for both main and renderer processes.
   Created on: 21/09/2025
   Last Modified: 23/09/2025
*/

// Utility: convert ISO (yyyy-mm-dd) → dd-mm-yyyy
const isoToDDMMYYYY = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
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

// Export utilities
export {
    isoToDDMMYYYY,
    getFormattedDateTime
};