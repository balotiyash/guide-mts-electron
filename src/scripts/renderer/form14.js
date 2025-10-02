/**
 * File: src/scripts/renderer/form14.js
 * Author: Yash Balotiya
 * Description: Form 14 renderer script for date range selection and form generation
 * Created on: 01/10/2025
 * Last Modified: 02/10/2025
 */

// src/scripts/renderer/form14.js

// DOM Elements (conditionally initialized to avoid errors)
const dateRangeModal = document.getElementById('dateRangeModal') || null;
const startDateInput = document.getElementById('startDate') || null;
const endDateInput = document.getElementById('endDate') || null;
const generateForm14Btn = document.getElementById('generateForm14') || null;
const cancelModalBtn = document.getElementById('cancelModal') || null;
const loadingDiv = document.getElementById('loadingDiv');
const printControls = document.getElementById('printControls');
const form14Content = document.getElementById('form14Content');
const printFormBtn = document.getElementById('printForm');
const backToDashboardBtn = document.getElementById('backToDashboard');
const pageInfo = document.getElementById('pageInfo');

// Global Date Pickers
let startDatePicker, endDatePicker;

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

// --- Initialization and Event Handlers ---

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Form14 page DOM loaded');

        // Validate essential DOM elements exist
        if (!loadingDiv || !form14Content || !printControls) {
            console.error('Essential DOM elements missing:', {
                loadingDiv: !!loadingDiv,
                form14Content: !!form14Content,
                printControls: !!printControls
            });
            alert('Page not loaded correctly. Please refresh.');
            return;
        }

        // Check if dates were selected from dashboard
        const storedStartDate = localStorage.getItem('form14StartDate');
        const storedEndDate = localStorage.getItem('form14EndDate');

        console.log('Stored dates from localStorage:', { storedStartDate, storedEndDate });

        if (storedStartDate && storedEndDate) {
            // Clear stored dates
            localStorage.removeItem('form14StartDate');
            localStorage.removeItem('form14EndDate');

            // Set up event listeners for buttons before generating form
            setupEventListeners();

            // Automatically generate form with stored dates
            console.log('Auto-generating form with stored dates');
            generateForm14WithDates(storedStartDate, storedEndDate);
        } else {
            // Fallback: show modal if no dates were provided
            console.log('No stored dates, showing date selection modal');
            initializeDatePickers();
            setupEventListeners();
            showDateRangeModal();
        }
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        alert('An error occurred while loading the page: ' + error.message);
    }
});

function initializeDatePickers() {
    // Only initialize if date input elements exist
    if (!startDateInput || !endDateInput) {
        console.log('Date input elements not found, skipping date picker initialization');
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
        }
    });

    endDatePicker = flatpickr(endDateInput, {
        ...dateConfig,
        onChange: (selectedDates) => {
            if (startDatePicker) {
                startDatePicker.set('maxDate', selectedDates[0]);
            }
        }
    });

    // Apply input mask for DD-MM-YYYY format
    Inputmask('99-99-9999', {
        placeholder: 'DD-MM-YYYY',
        clearMaskOnLostFocus: false
    }).mask([startDateInput, endDateInput]);
}

function setupEventListeners() {
    console.log('=== Setting up event listeners ===');

    // Only set up modal-related event listeners if elements exist
    if (generateForm14Btn) {
        generateForm14Btn.addEventListener('click', handleGenerateForm14);
        console.log('Generate Form14 button listener attached');
    } else {
        console.log('Generate Form14 button not found (expected when auto-generating)');
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', handleCancel);
        console.log('Cancel modal button listener attached');
    } else {
        console.log('Cancel modal button not found (expected when auto-generating)');
    }

    // Always set up print and navigation listeners (these elements should exist)
    if (printFormBtn) {
        console.log('Setting up print button event listener');
        printFormBtn.addEventListener('click', () => {
            console.log('Print button clicked');
            window.print();
        });
        console.log('Print button listener attached successfully');
    } else {
        console.error('Print button element not found');
    }

    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', handleBackToDashboard);
        console.log('Back to dashboard button listener attached');
    } else {
        console.error('Back to dashboard button element not found');
    }

    // ESC key to close modal (only if modal exists)
    if (dateRangeModal) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dateRangeModal.style.display !== 'none') {
                handleCancel();
            }
        });
        console.log('ESC key listener attached');
    } else {
        console.log('Date range modal not found (expected when auto-generating)');
    }

    console.log('=== Event listeners setup completed ===');
}

// --- Modal and State Management ---

function showDateRangeModal() {
    if (dateRangeModal && startDateInput) {
        dateRangeModal.style.display = 'block';
        startDateInput.focus();
    } else {
        console.log('Modal elements not found, cannot show date range modal');
    }
}

function hideDateRangeModal() {
    dateRangeModal.style.display = 'none';
}

function showLoading() {
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    } else {
        console.error('loadingDiv element not found');
    }
}

function hideLoading() {
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    } else {
        console.error('loadingDiv element not found');
    }
}

function showForm14Content() {
    console.log('=== showForm14Content called ===');
    if (form14Content) {
        form14Content.style.display = 'block';
        console.log('form14Content displayed');
    } else {
        console.error('form14Content element not found');
    }
    if (printControls) {
        printControls.style.display = 'flex';
        console.log('printControls displayed');
    } else {
        console.error('printControls element not found');
    }

    // Double-check if print button is visible
    if (printFormBtn) {
        console.log('Print button exists and should be visible');
        console.log('Print button display style:', getComputedStyle(printFormBtn).display);
        console.log('Print button visibility:', getComputedStyle(printFormBtn).visibility);
    }
}

function handleCancel() {
    // Navigate back to dashboard
    window.electronAPI.loadPage('dashboard');
}

function handleBackToDashboard() {
    window.electronAPI.loadPage('dashboard');
}

// --- Form Generation Logic ---

async function generateForm14WithDates(startDate, endDate) {
    try {
        console.log('=== Starting generateForm14WithDates ===');
        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);

        // Show loading
        console.log('Showing loading...');
        showLoading();

        // Validate dates
        console.log('Validating dates...');
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            console.error('Invalid date format detected');
            alert('Invalid date format. Please use DD-MM-YYYY.');
            hideLoading();
            return;
        }

        const start = parseDate(startDate);
        const end = parseDate(endDate);

        if (start > end) {
            console.error('Start date is after end date');
            alert('Start date cannot be later than end date.');
            hideLoading();
            return;
        }

        // Check if API exists
        if (!window.form14API) {
            console.error('form14API not available on window object');
            alert('Form14 API not available. Please restart the application.');
            hideLoading();
            return;
        }

        // Get form data
        console.log('Calling form14API.getForm14Data...');
        const form14Data = await window.form14API.getForm14Data(startDate, endDate);
        console.log('Received form14Data:', form14Data);

        if (!form14Data || form14Data.length === 0) {
            console.log('No records found for date range');
            alert('No records found for the selected date range.');
            hideLoading();
            return;
        }

        // Generate and display the form
        console.log('Generating form display...');
        generateForm14Content(form14Data);
        console.log('Hiding loading...');
        hideLoading();
        console.log('Showing form content...');
        showForm14Content();
        console.log('=== Form generation completed successfully ===');

    } catch (error) {
        console.error('=== ERROR in generateForm14WithDates ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        alert('An error occurred while generating Form 14. Check console for details.');
        hideLoading();
    }
}

async function handleGenerateForm14() {
    const startDate = startDateInput.value.trim();
    const endDate = endDateInput.value.trim();

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

    hideDateRangeModal();
    showLoading();

    try {
        // Assuming window.form14API.getForm14Data is available and returns an array of student objects
        const form14Data = await window.form14API.getForm14Data(startDate, endDate);

        if (!form14Data || form14Data.length === 0) {
            alert('No records found for the selected date range.');
            showDateRangeModal();
            hideLoading();
            return;
        }

        generateForm14Content(form14Data);

        hideLoading();
        showForm14Content();

    } catch (error) {
        console.error('Error generating Form 14:', error);
        alert('Error generating Form 14. Please try again.');
        showDateRangeModal();
        hideLoading();
    }
}

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
    pageInfo.textContent = `Page 1 of ${totalPages}`;
}

/**
 * Generate HTML for a single page with header and student records.
 */
function generatePageHTML(students, pageNumber, totalPages) {
    // Note: The page number in the header is NOT part of the printed form template
    // as per the source PDF (e.g., Page 1 of 2 is not in the header).
    // It's part of the print view controls.

    let pageHTML = `
        <div class="page">
            <header class="print-header">
                <img src="../assets/images/guide-logo.png" alt="Guide MTS Logo" id="logo">
                <p class="school-address">178, Sion (W), Mumbai - 400 022</p>
                <h3 class="form-title">FORM 14</h3>
            </header>
            <main>
    `;

    students.forEach((student, index) => {
        pageHTML += generateStudentHTML(student);
        // Add a horizontal rule separator between students, but not after the last one on the page
        if (index < students.length - 1) {
            pageHTML += '<hr class="record-separator">';
        }
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
                            ${photoSrc ? `<img src="${photoSrc}" alt="Student Photo" class="student-photo">` : '<div class="student-photo" style="border: 1px solid black;"></div>'}
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

/*<tr>
    <th colspan='4' class="signature-label">Signature of Student:</th>
    <td colspan='2' class="signature-cell">
        ${signatureSrc ?
            `<img src="${signatureSrc}" alt="Student Signature" class="signature-img">` :
            ''
        }
    </td>
</tr>*/