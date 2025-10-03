/**
 * File: src/scripts/renderer/form14.js
 * Author: Yash Balotiya
 * Description: Form 14 renderer script for the new design with preview and controls
 * Created on: 01/10/2025
 * Last Modified: 03/10/2025
 */

// DOM Elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const generatePreviewBtn = document.getElementById('generatePreview');
const printFormBtn = document.getElementById('printForm');
const clearFormBtn = document.getElementById('clearForm');
const backToDashboardBtn = document.getElementById('backToDashboard');
const loadingDiv = document.getElementById('loadingDiv');
const previewArea = document.getElementById('previewArea');
const form14Content = document.getElementById('form14Content');
const formInfo = document.getElementById('formInfo');
const recordCount = document.getElementById('recordCount');
const pageCount = document.getElementById('pageCount');

// Global variables
let startDatePicker, endDatePicker;
let currentForm14Data = null;

// --- Utility Functions ---

/**
 * Format date for display from various string formats to DD/MM/YYYY.
 */
function formatDate(dateString) {
    if (!dateString) return '';

    // Attempt to parse various formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    let date;
    const parts = dateString.split(/[-\/]/).map(Number);

    if (parts.length === 3) {
        // Assume DD-MM-YYYY or DD/MM/YYYY first
        if (parts[2] > 1000) { // Check if the third part looks like a year
            date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            // Might be YYYY-MM-DD if parts[0] is the year, but the source uses DD/MM/YYYY
            date = new Date(dateString); // Let Date object try to figure it out
        }
    } else {
        date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
        return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Parse DD-MM-YYYY date string to Date object for comparison.
 */
function parseDate(dateString) {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Validate date format DD-MM-YYYY.
 */
function isValidDate(dateString) {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateString.match(regex);
    if (!match) return false;

    const [day, month, year] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Form14 page DOM loaded - New Design');
        
        // Initialize date pickers
        initializeDatePickers();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start with empty form - no auto-generation
        console.log('Form 14 page loaded empty, ready for user input');
        
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        alert('An error occurred while loading the page: ' + error.message);
    }
});

function initializeDatePickers() {
    if (!startDateInput || !endDateInput) {
        console.error('Date input elements not found');
        return;
    }

    const dateConfig = {
        dateFormat: 'd-m-Y',
        allowInput: true,
        maxDate: 'today'
    };

    startDatePicker = flatpickr(startDateInput, {
        ...dateConfig,
        onChange: (selectedDates) => {
            if (endDatePicker) {
                endDatePicker.set('minDate', selectedDates[0]);
            }
            clearPreview();
        }
    });

    endDatePicker = flatpickr(endDateInput, {
        ...dateConfig,
        onChange: (selectedDates) => {
            if (startDatePicker) {
                startDatePicker.set('maxDate', selectedDates[0]);
            }
            clearPreview();
        }
    });

    // Apply input mask for DD-MM-YYYY format
    Inputmask('99-99-9999', {
        placeholder: 'DD-MM-YYYY',
        clearMaskOnLostFocus: false
    }).mask([startDateInput, endDateInput]);
}

function setupEventListeners() {
    console.log('Setting up event listeners for new design');

    // Generate Preview button
    if (generatePreviewBtn) {
        generatePreviewBtn.addEventListener('click', handleGeneratePreview);
    }

    // Print Form button
    if (printFormBtn) {
        printFormBtn.addEventListener('click', handlePrintForm);
    }

    // Clear Form button
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', handleClearForm);
    }

    // Back to Dashboard button
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', handleBackToDashboard);
    }

    // Date input changes to clear preview
    if (startDateInput) {
        startDateInput.addEventListener('input', clearPreview);
    }
    if (endDateInput) {
        endDateInput.addEventListener('input', clearPreview);
    }
}

// --- Event Handlers ---

async function handleGeneratePreview() {
    const startDate = startDateInput?.value?.trim();
    const endDate = endDateInput?.value?.trim();

    // Validation
    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert('Please enter dates in DD-MM-YYYY format.');
        return;
    }

    const startDateObj = parseDate(startDate);
    const endDateObj = parseDate(endDate);

    if (startDateObj > endDateObj) {
        alert('Start date cannot be later than end date.');
        return;
    }

    try {
        // Show loading
        showLoading();
        
        // Check if API exists
        if (!window.form14API) {
            throw new Error('Form14 API not available. Please restart the application.');
        }

        // Get form data
        console.log('Fetching Form 14 data...');
        const form14Data = await window.form14API.getForm14Data(startDate, endDate);
        
        if (!form14Data || form14Data.length === 0) {
            alert('No records found for the selected date range.');
            hideLoading();
            return;
        }

        // Store the data
        currentForm14Data = form14Data;
        
        // Generate and show preview
        generateForm14Content(form14Data);
        showPreview();
        
        // Update form info
        updateFormInfo(form14Data.length);
        
        // Enable print button
        printFormBtn.disabled = false;
        
        hideLoading();
        
    } catch (error) {
        console.error('Error generating Form 14 preview:', error);
        alert('Error generating Form 14: ' + error.message);
        hideLoading();
    }
}

function handlePrintForm() {
    if (!currentForm14Data) {
        alert('No form data to print. Please generate a preview first.');
        return;
    }
    
    // Ensure form content is visible before printing
    if (form14Content && form14Content.style.display === 'none') {
        alert('Preview is not visible. Please generate the preview first.');
        return;
    }
    
    console.log('Printing Form 14...');
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        window.print();
    }, 100);
}

function handleClearForm() {
    // Clear date inputs
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    
    // Clear date pickers
    if (startDatePicker) startDatePicker.clear();
    if (endDatePicker) endDatePicker.clear();
    
    // Clear preview
    clearPreview();
    
    // Disable print button
    printFormBtn.disabled = true;
    
    // Clear stored data
    currentForm14Data = null;
}

function handleBackToDashboard() {
    window.electronAPI.loadPage('dashboard');
}

// --- UI State Management ---

function showLoading() {
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

function showPreview() {
    const tableContainer = document.querySelector('.table-container');
    if (form14Content && tableContainer) {
        form14Content.style.display = 'block';
        tableContainer.classList.add('has-content');
        console.log('Preview displayed successfully');
    }
}

function clearPreview() {
    const tableContainer = document.querySelector('.table-container');
    if (form14Content && tableContainer) {
        form14Content.style.display = 'none';
        form14Content.innerHTML = '';
        tableContainer.classList.remove('has-content');
        console.log('Preview cleared successfully');
    }
    
    // Disable print button
    if (printFormBtn) {
        printFormBtn.disabled = true;
    }
    
    // Keep form info visible but reset counts to 0
    if (recordCount) recordCount.textContent = '0';
    if (pageCount) pageCount.textContent = '0';
    
    // Clear stored data
    currentForm14Data = null;
}

function updateFormInfo(recordsFound) {
    const totalPages = Math.ceil(recordsFound / 3);
    
    if (recordCount) recordCount.textContent = recordsFound;
    if (pageCount) pageCount.textContent = totalPages;
    if (formInfo) formInfo.style.display = 'block';
}

// --- Form Generation Logic ---

/**
 * Generate Form 14 content HTML, splitting into pages.
 */
function generateForm14Content(students) {
    const studentsPerPage = 3;
    const totalPages = Math.ceil(students.length / studentsPerPage);
    let html = '';

    for (let page = 0; page < totalPages; page++) {
        const startIndex = page * studentsPerPage;
        const endIndex = Math.min(startIndex + studentsPerPage, students.length);
        const pageStudents = students.slice(startIndex, endIndex);

        html += generatePageHTML(pageStudents, page + 1, totalPages);
    }

    form14Content.innerHTML = html;
}

/**
 * Generate HTML for a single page with header and student records.
 */
function generatePageHTML(students, pageNumber, totalPages) {
    let pageHTML = `
        <div class="page">
            <header class="print-header">
                <img src="../assets/images/guide-logo.png" alt="Guide MTS Logo" id="logo">
                <p class="school-address">178, Chandreshwar Bhavan, Opp. Union Bank of India, Sion (W), Mumbai - 400 022</p>
                <h3 class="form-title">FORM 14</h3>
            </header>
            <main>
    `;

    students.forEach((student, index) => {
        pageHTML += generateStudentHTML(student);
        // No separator between students for cleaner appearance
    });

    pageHTML += `
            </main>
        </div>
    `;

    return pageHTML;
}

/**
 * Generate HTML for a single student record using a clean table structure.
 */
function generateStudentHTML(student) {
    const photoSrc = student.customer_image ?
        `data:image/jpeg;base64,${student.customer_image}` : null;

    const signatureSrc = student.customer_signature ?
        `data:image/jpeg;base64,${student.customer_signature}` : null;

    // Format fields
    const dobFormatted = formatDate(student.customer_dob);
    const enrollmentDate = formatDate(student.created_on);
    const completionDate = formatDate(student.completion_date);
    const passingDate = formatDate(student.mdl_issued_date);
    const validityDate = formatDate(student.mdl_validity_date);

    // Combine vehicle class and LL numbers
    const vehicleClass = [student.ll_class_1, student.ll_class_2].filter(Boolean).join(' & ') || '';
    const llNumbers = [student.ll_no_1, student.ll_no_2].filter(Boolean).join(' & ') || '';

    // Format address for multiline
    const formattedAddress = (student.address || '').replace(/,/g, ',\n').trim().toUpperCase();

    return `
        <div class="form-entry">
            <table>
                <tbody>
                    <tr>
                        <th class="col-1">Enrollment No.:</th>
                        <td class="col-2"><span class="data-field">${student.id || ''}</span></td>
                        <th class="col-3">Name:</th>
                        <td class="col-4" colspan="3"><span class="data-field">${(student.customer_name || '').toUpperCase()}</span></td>
                        <td class="photo-cell" rowspan="7">
                            ${photoSrc ? `<img src="${photoSrc}" alt="Student Photo" class="student-photo">` : '<div class="student-photo" style="border: 1px solid black; background-color: #f5f5f5;"></div>'}
                            <div class="signature-container">
                                ${signatureSrc ? `<img src="${signatureSrc}" alt="Student Signature" class="signature-img">` : ''}
                                <div class="signature-text">Signature</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>Son / Wife / Daughter of:</th>
                        <td colspan="5"><span class="data-field">${(student.relation_name || '').toUpperCase()}</span></td>
                    </tr>
                    <tr>
                        <th>Address:</th>
                        <td colspan="5"><span class="address-field">${formattedAddress}</span></td>
                    </tr>
                    <tr>
                        <th>Date of Birth:</th>
                        <td><span class="data-field">${dobFormatted}</span></td>
                        <th>Class of Vehicle:</th>
                        <td colspan="3"><span class="data-field">${vehicleClass}</span></td>
                    </tr>
                    <tr>
                        <th>Date of Enrollment:</th>
                        <td><span class="data-field">${enrollmentDate}</span></td>
                        <th>L. L. R. No.:</th>
                        <td colspan="3"><span class="data-field">${llNumbers}</span></td>
                    </tr>
                    <tr>
                        <th>Date of Completion:</th>
                        <td><span class="data-field">${completionDate}</span></td>
                        <th>Date of Passing Test:</th>
                        <td colspan="3"><span class="data-field">${passingDate}</span></td>
                    </tr>
                    <tr>
                        <th>M. D. L. No.:</th>
                        <td><span class="data-field">${student.mdl_no || ''}</span></td>
                        <th>Date of Issue:</th>
                        <td><span class="data-field">${passingDate}</span></td>
                        <th>Valid Up to:</th>
                        <td><span class="data-field">${validityDate}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}