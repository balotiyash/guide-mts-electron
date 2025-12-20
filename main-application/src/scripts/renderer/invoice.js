/** 
 * File: src/scripts/renderer/invoice.js
 * Author: Yash Balotiya
 * Description: This file handles the rendering of invoice data in the invoice window.
 * Created on: 16/09/2025
 * Last Modified: 20/12/2025
*/

// Date formatting function to handle multiple date formats
const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';

    try {
        // If already in DD/MM/YYYY or DD-MM-YYYY format, return as is (just normalize separators)
        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            if (day && month && year) {
                return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
            }
        }

        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            // Already in DD-MM-YYYY format
            return dateString;
        }

        // Handle YYYY-MM-DD HH:MM:SS and YYYY-MM-DD formats
        const datePart = dateString.split(' ')[0]; // Extract date part before space
        const [year, month, day] = datePart.split('-');

        // Validate the date components
        if (!year || !month || !day) return '';

        // Return formatted date as DD-MM-YYYY
        return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

// Fetch token from URL
const params = new URL(location.href).searchParams;
const token = params.get('token');

// Request invoice data from main process
window.invoiceAPI.requestInvoiceData(token);

// Listen for invoice data from main process
window.invoiceAPI.onInvoiceData((data) => {
    // Populate invoice fields
    document.getElementById('receiptType').textContent = data.type.toUpperCase() || 'ORIGINAL';
    document.getElementById('customerName').textContent = data.customer.toUpperCase() || '—';
    document.getElementById('dateId').textContent = formatDateToDDMMYYYY(data.date);
    document.getElementById('userId').textContent = data.admissionNo || '—';

    // Populate items table
    const tbody = document.querySelector('#itemsTable tbody');
    tbody.innerHTML = '';
    
    // Group items by description to calculate rowspan
    const descGroups = {};
    data.items.forEach((item, idx) => {
        const desc = item.desc.toUpperCase();
        if (!descGroups[desc]) {
            descGroups[desc] = [];
        }
        descGroups[desc].push(idx);
    });
    
    // Track which descriptions have been rendered
    const renderedDescs = new Set();
    
    data.items.forEach((item, idx) => {
        const row = document.createElement('tr');
        const desc = item.desc.toUpperCase();
        const isFirstInGroup = descGroups[desc][0] === idx;
        const rowSpan = descGroups[desc].length;
        
        // Build row HTML
        let rowHTML = `
                    <td>${idx + 1}</td>
                    <td>${formatDateToDDMMYYYY(item.date)}</td>`;
        
        // Add description cell only for the first occurrence of each description
        if (isFirstInGroup) {
            if (rowSpan > 1) {
                rowHTML += `<td rowspan="${rowSpan}">${desc}</td>`;
            } else {
                rowHTML += `<td>${desc}</td>`;
            }
        }
        
        rowHTML += `
                    <td>${item.mode.toUpperCase() || ''}</td>
                    <td>${item.paid}</td>
                    <td>${item.remaining}</td>
                `;
        
        row.innerHTML = rowHTML;
        tbody.appendChild(row);
    });

    // Populate total amount
    document.getElementById('totalAmount').textContent = data.total;

    // notify main that rendering is done
    window.invoiceAPI.notifyInvoiceRendered(token);
});