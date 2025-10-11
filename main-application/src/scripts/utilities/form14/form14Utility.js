/**
 * File: src/scripts/utilities/form14/form14Utility.js
 * Author: Yash Balotiya
 * Description: Form 14 utility functions - ES6 function-based
 * Created on: 11/10/2025
 * Last Modified: 11/10/2025
 */

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

    // Clear form handler
    const handleClearForm = () => {
        const { startDate, endDate, printBtn } = elements;
        
        // Clear date inputs manually since we don't have access to picker instances
        if (startDate) startDate.value = '';
        if (endDate) endDate.value = '';
        clearPreview();
        
        if (printBtn) printBtn.disabled = true;
        currentData.currentData = null;
    };

    // Event listeners setup
    const setupEventListeners = () => {
        const { generateBtn, printBtn, clearBtn, backBtn, startDate, endDate } = elements;
        
        generateBtn?.addEventListener('click', handleGeneratePreview);
        printBtn?.addEventListener('click', handlePrintForm);
        clearBtn?.addEventListener('click', handleClearForm);
        backBtn?.addEventListener('click', () => window.electronAPI.navigateTo('dashboard.html'));
        startDate?.addEventListener('input', clearPreview);
        endDate?.addEventListener('input', clearPreview);
    };

    // Form generation
    const generateStudentHTML = (student) => {
        const {
            customer_image, customer_signature, customer_dob, created_on, completion_date,
            mdl_issued_date, mdl_validity_date, ll_class_1, ll_class_2, ll_no_1, ll_no_2,
            id, customer_name, relation_name, address, mdl_no
        } = student;

        // Convert BLOBs to base64 strings for image display
        const photoSrc = customer_image ? `data:image/jpeg;base64,${customer_image}` : null;
        const signatureSrc = customer_signature ? `data:image/jpeg;base64,${customer_signature}` : null;
        
        // Format dates
        const dates = {
            dob: formatDate(customer_dob),
            enrollment: formatDate(created_on),
            completion: formatDate(completion_date),
            passing: formatDate(mdl_issued_date),
            validity: formatDate(mdl_validity_date)
        };

        // Combine vehicle classes and LL numbers
        const vehicleClass = [ll_class_1, ll_class_2].filter(Boolean).join(' & ') || '';
        const llNumbers = [ll_no_1, ll_no_2].filter(Boolean).join(' & ') || '';
        const formattedAddress = (address || '').replace(/,/g, ',\n').trim().toUpperCase();

        return `
            <div class="form-entry">
                <table>
                    <tbody>
                        <tr>
                            <th class="col-1">Enrollment No.:</th>
                            <td class="col-2"><span class="data-field">${id || ''}</span></td>
                            <th class="col-3">Name:</th>
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
                            <th>Son / Wife / Daughter of:</th>
                            <td colspan="5"><span class="data-field">${(relation_name || '').toUpperCase()}</span></td>
                        </tr>
                        <tr>
                            <th>Address:</th>
                            <td colspan="5"><span class="address-field">${formattedAddress}</span></td>
                        </tr>
                        <tr>
                            <th>Date of Birth:</th>
                            <td><span class="data-field">${dates.dob}</span></td>
                            <th>Class of Vehicle:</th>
                            <td colspan="3"><span class="data-field">${vehicleClass}</span></td>
                        </tr>
                        <tr>
                            <th>Date of Enrollment:</th>
                            <td><span class="data-field">${dates.enrollment}</span></td>
                            <th>L. L. R. No.:</th>
                            <td colspan="3"><span class="data-field">${llNumbers}</span></td>
                        </tr>
                        <tr>
                            <th>Date of Completion:</th>
                            <td><span class="data-field">${dates.completion}</span></td>
                            <th>Date of Passing Test:</th>
                            <td colspan="3"><span class="data-field">${dates.passing}</span></td>
                        </tr>
                        <tr>
                            <th>M. D. L. No.:</th>
                            <td><span class="data-field">${mdl_no || ''}</span></td>
                            <th>Date of Issue:</th>
                            <td><span class="data-field">${dates.passing}</span></td>
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