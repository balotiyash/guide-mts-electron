/**
 * File: src/scripts/utilities/form14/form14Utility.js
 * Author: Yash Balotiya
 * Description: Form 14 utility functions - ES6 function-based
 * Created on: 11/10/2025
 * Last Modified: 07/12/2025
 */

// Import shared date utilities
import { sanitizeDate } from '../../shared.js';

// Export functions that need access to form14.js variables
export const createForm14Handlers = (elements, currentData, STUDENTS_PER_PAGE, formatDate, clearPreview, showLoading, hideLoading, updateFormInfo, showPreview, initializeDatePickers, handleGeneratePreview) => {
    
    // Print form handler
    const handlePrintForm = () => {
        console.log('Print button clicked, currentData:', currentData.currentData);
        
        // Check if there's data to print
        if (!currentData.currentData) {
            alert('No form data to print. Please generate a preview first.');
            return;
        }
        
        // Check if preview is visible
        if (elements.content?.style.display === 'none') {
            alert('Preview is not visible. Please generate the preview first.');
            return;
        }
        
        // Trigger print
        console.log('Printing Form 14...');
        setTimeout(() => window.print(), 100);
    };

    // Clear form handler - simply refresh the page
    const handleClearForm = () => {
        window.location.reload();
    };

    // Event listeners setup
    const setupEventListeners = () => {
        const { generateBtn, printBtn, clearBtn, backBtn } = elements;
        
        generateBtn?.addEventListener('click', handleGeneratePreview);
        printBtn?.addEventListener('click', handlePrintForm);
        clearBtn?.addEventListener('click', handleClearForm);
        backBtn?.addEventListener('click', () => window.electronAPI.navigateTo('dashboard.html'));
    };

    // Form generation
    const generateStudentHTML = (student) => {
        const {
            customer_image, customer_signature, customer_dob, created_on, completion_date,
            mdl_issued_date, mdl_validity_date, ll_class_1, ll_class_2, ll_no_1, ll_no_2,
            id, customer_name, relation_name, address, mdl_no, endorsement, endorsement_date
        } = student;

        // Convert BLOBs to base64 strings for image display
        const photoSrc = customer_image ? `data:image/jpeg;base64,${customer_image}` : null;
        const signatureSrc = customer_signature ? `data:image/jpeg;base64,${customer_signature}` : null;
        
        // Calculate completion and passing dates (issue date - 1 day)
        let calculatedCompletionDate = '';
        let calculatedPassingDate = '';
        
        if (mdl_issued_date) {
            try {
                // Use shared utility to sanitize the date
                const sanitizedIssueDate = sanitizeDate(mdl_issued_date);
                
                if (sanitizedIssueDate) {
                    // Parse the sanitized date (YYYY-MM-DD format)
                    const issueDate = new Date(sanitizedIssueDate);
                    
                    if (!isNaN(issueDate.getTime())) {
                        // Create a new date object and subtract 1 day
                        const oneDayBefore = new Date(issueDate);
                        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
                        
                        // Use sanitizeDate again to get proper YYYY-MM-DD format
                        const oneDayBeforeFormatted = sanitizeDate(oneDayBefore);
                        
                        if (oneDayBeforeFormatted) {
                            calculatedCompletionDate = formatDate(oneDayBeforeFormatted);
                            calculatedPassingDate = formatDate(oneDayBeforeFormatted);
                        }
                    }
                }
            } catch (error) {
                console.error('Error calculating completion/passing dates:', error);
                // Fallback to empty strings if calculation fails
                calculatedCompletionDate = '';
                calculatedPassingDate = '';
            }
        }
        
        // Format dates
        const dates = {
            dob: formatDate(customer_dob),
            enrollment: formatDate(created_on),
            completion: calculatedCompletionDate, // Using calculated date (issue - 1 day)
            passing: calculatedPassingDate,       // Using calculated date (issue - 1 day)
            issue: formatDate(mdl_issued_date),   // Original issue date
            validity: formatDate(mdl_validity_date)
        };

        // Combine vehicle classes and LL numbers
        const vehicleClass = [ll_class_1, ll_class_2].filter(Boolean).join(' & ') || '';
        const llNumbers = [ll_no_1, ll_no_2].filter(Boolean).join(' & ') || '';
        // const formattedAddress = (address || '').replace(/,/g, ',\n').trim().toUpperCase();
        const formattedAddress = (address || '-').trim().toUpperCase();

        return `
            <div class="form-entry">
                <table>
                    <tbody>
                        <tr>
                            <th class="col-1">Enrollment No.:</th>
                            <td class="col-2"><span class="data-field">${id || ''}</span></td>
                            <th class="col-3" >Name:</th>
                            <td class="col-4" colspan="3"><span class="data-field">${(customer_name || '').toUpperCase()}</span></td>
                            <td class="photo-cell" rowspan="7">
                                ${photoSrc ? `<img src="${photoSrc}" alt="Student Photo" class="student-photo">` : '<div class="student-photo" style="border: 1px solid black; background-color: #f5f5f5;"></div>'}
                                <div class="signature-container">
                                    ${signatureSrc ? `<img src="${signatureSrc}" alt="Student Signature" class="signature-img">` : ''}
                                    <div class="signature-text">Signature</div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Date of Birth:</th>
                            <td><span class="data-field">${dates.dob}</span></td>
                            <th>Son / Wife / Daughter of:</th>
                            <td colspan="3"><span class="data-field">${(relation_name || '').toUpperCase()}</span></td>
                        </tr>
                        <tr>
                            <th>Address:</th>
                            <td colspan="5"><span class="address-field">${formattedAddress}</span></td>
                        </tr>
                        <tr>
                            <th>L. L. R. No.:</th>
                            <td colspan="2"><span class="data-field">${llNumbers}</span></td>
                            <th>Class of Vehicle:</th>
                            <td colspan="2"><span class="data-field">${vehicleClass}</span></td>
                        </tr>
                        <tr>
                            <th>Date of Enrollment:</th>
                            <td colspan="2"><span class="data-field">${dates.enrollment}</span></td>
                            <th>Date of Completion:</th>
                            <td colspan="2"><span class="data-field">${dates.completion}</span></td>
                        </tr>
                        <tr>
                            <th>M. D. L. No.:</th>
                            <td colspan="2"><span class="data-field">${mdl_no || ''}</span></td>
                            <th>Date of Issue:</th>
                            <td colspan="2"><span class="data-field">${dates.issue}</span></td>
                        </tr>
                        <tr>
                            <th>Endorsement (If Any):</th>
                            <td><span class="data-field">${endorsement || ''}</span></td>
                            <th>Endorsement Dated:</th>
                            <td><span class="data-field">${endorsement_date || ''}</span></td>
                            <th>Valid Up to:</th>
                            <td><span class="data-field">${dates.validity}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    };

    // Generate full page HTML
    const generatePageHTML = (students) => {
        const studentsHTML = students.map(generateStudentHTML).join('');
        
        return `
            <div class="page">
                <header class="print-header">
                    <img src="../assets/images/guide-logo.png" alt="Guide MTS Logo" id="logo">
                    <p class="school-address">178, Chandreshwar Bhavan, Opp. Union Bank of India, Sion (W), Mumbai - 400 022</p>
                    <h3 class="form-title">FORM 14</h3>
                </header>
                <main>${studentsHTML}</main>
            </div>
        `;
    };

    // Generate complete Form 14 content
    const generateForm14Content = (students) => {
        const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);
        const html = Array.from({ length: totalPages }, (_, page) => {
            const startIndex = page * STUDENTS_PER_PAGE;
            const endIndex = Math.min(startIndex + STUDENTS_PER_PAGE, students.length);
            return generatePageHTML(students.slice(startIndex, endIndex));
        }).join('');

        elements.content.innerHTML = html;
    };

    // Return all handlers
    return {
        handlePrintForm,
        handleClearForm,
        setupEventListeners,
        generateStudentHTML,
        generatePageHTML,
        generateForm14Content
    };
};

// Main initialization function
const createInitFunction = (elements, currentData, formatDate, clearPreview, showLoading, hideLoading, updateFormInfo, showPreview, initializeDatePickers, handleGeneratePreview) => {
    return () => {
        console.log('Form14 page DOM loaded - ES6 Function-based');
        hideLoading();
        initializeDatePickers();
        
        const STUDENTS_PER_PAGE = 3;
        const handlers = createForm14Handlers(elements, currentData, STUDENTS_PER_PAGE, formatDate, clearPreview, showLoading, hideLoading, updateFormInfo, showPreview, initializeDatePickers, handleGeneratePreview);
        handlers.setupEventListeners();
        
        // Export generateForm14Content globally so it can be used by handleGeneratePreview
        window.generateForm14Content = handlers.generateForm14Content;
        
        console.log('Form 14 page loaded empty, ready for user input');
    };
};

// Exporting the main init function
export default createInitFunction;