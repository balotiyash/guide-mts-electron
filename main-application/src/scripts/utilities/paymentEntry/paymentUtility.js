/*
 * File: src/scripts/utilities/paymentEntry/paymentUtility.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: This file contains JS code to handle payment entry page utilities
 * Created on: 22/09/2025
 * Last Modified: 08/01/2026
 */

// Import reusable SMS function
import { sendPaymentSMSWithChoice } from "../sms/smsUtility.js";
import dateUtility from "../dataEntry/dateUtility.js";
import { isoToDDMMYYYY } from "../../shared.js";

dateUtility(); // Initialize date utility for payment date fields
const paymentDateText = document.getElementById("payment-date-text");
paymentDateText.value = isoToDDMMYYYY(new Date().toISOString());

// Mobile number & customer name of selected user (for SMS)
export const paymentState = {
    mobile_number: null,
    customerName: null
};

// Function to render rows in the table
const renderRows = (tableBody, data, type = "pending", onRowSelect = null) => {
    // Clear existing rows
    if (!tableBody) return;
    tableBody.innerHTML = "";

    // Handle no data case
    if (!data || data.length === 0) {
        tableBody.innerHTML = `
              <tr><td colspan="4" style="text-align:center; padding:10px; color:#777;">
                No records found
              </td></tr>`;
        return;
    }

    // Populate rows
    data.forEach(item => {
        // Create row
        const row = document.createElement("tr");
        row.title = "Click to select";

        if (type === "pending") {
            row.innerHTML = `
                  <td>${(item.customer_name || "").toUpperCase()}</td>
                  <td>${(item.work || "").toUpperCase()}</td>
                  <td>${item.charged_amount ?? "-"}</td>
                  <td>${item.pending_amount ?? "-"}</td>
                `;
        } else {
            row.innerHTML = `
                  <td>${(item.customer_name || "").toUpperCase()}</td>
                  <td>${(item.work || "").toUpperCase()}</td>
                  <td>${item.charged_amount ?? "-"}</td>
                  <td>${item.paid_amount ?? "-"}</td>
                `;
        }

        // On row click → fill form
        row.addEventListener("click", () => {

            // Selected values
            const selectedUserId = item.customer_id;
            const selectedWorkId = item.work_id;
            const selectedPaymentId = item.payment_id || null;
            paymentState.mobile_number = item.mobile_number || null;
            paymentState.customerName = item.customer_name || '-';

            // Fill form fields
            const customerNameEl = document.getElementById("formCustomerName");
            const chargedAmountEl = document.getElementById("formChargedAmount");
            const pendingAmountEl = document.getElementById("formPendingAmount");
            if (customerNameEl) customerNameEl.textContent = (item.customer_name || "-").toUpperCase();
            if (chargedAmountEl) chargedAmountEl.textContent = item.charged_amount ?? "-";
            if (pendingAmountEl) pendingAmountEl.textContent = (type === "pending" ? item.pending_amount : item.paid_amount) ?? "-";

            const amountInputEl = document.getElementById("amountInput");
            if (amountInputEl) amountInputEl.value = "";

            // ✅ Auto-select previous payment mode
            const paymentModeSelect = document.getElementById("paymentMode");
            if (paymentModeSelect) {
                if (item.payment_mode) {
                    paymentModeSelect.value = item.payment_mode.toLowerCase();
                } else {
                    paymentModeSelect.selectedIndex = 0;
                }
            }

            // Set payment date
            if (paymentDateText) {
                try {
                    paymentDateText.value = isoToDDMMYYYY(item.created_on.split(" ")[0]);
                    document.getElementById("payment-date").value = item.created_on.split(" ")[0];
                } catch (error) {
                    console.warn("Expected error for pending payment date:", error);
                }
            }

            // Set amount input for paid payments (for editing)
            if (type === "paid" && item.paid_amount) {
                document.getElementById("amountInput").value = parseFloat(item.paid_amount);
            }

            // Notify caller about selection so it can update its local state
            if (typeof onRowSelect === "function") {
                onRowSelect(selectedUserId, selectedWorkId, selectedPaymentId);
            }
        });

        // Append to table body
        tableBody.appendChild(row);
    });

    // no return — selection is communicated via the onRowSelect callback
};

// ------------------------------
// Paid: Client-Side Pagination + Search
// ------------------------------
const renderCurrentPage = (currentPage, limit, paidPayments, searchQuery = "", tableBody, onRowSelect = null) => {
    // Defensive defaults
    if (!Array.isArray(paidPayments)) paidPayments = [];
    if (!tableBody) return { totalPages: 1, totalRecords: 0 };

    // Calculate start & end indices
    const start = (currentPage - 1) * limit;
    const end = start + limit;

    // Filter the paid payments based on the search query
    let filtered = paidPayments;
    if (searchQuery) {
        const q = String(searchQuery).toLowerCase();
        filtered = paidPayments.filter(item =>
            (item.customer_name || "").toLowerCase().includes(q) ||
            (item.work || "").toLowerCase().includes(q)
        );
    }

    // Calculate total pages after filtering
    const totalRecords = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const pagedData = filtered.slice(start, end);

    // Render the rows for the current page
    renderRows(tableBody, pagedData, "paid", onRowSelect);
    updatePaginationControls(currentPage, totalPages, totalRecords);

    // ✅ Scroll the table container to top
    const scrollDiv = document.querySelector(".scrollDiv");
    if (scrollDiv) {
        scrollDiv.scrollTop = 0;
    }

    return { totalPages, totalRecords };
};

// Update pagination controls
const updatePaginationControls = (currentPage, totalPages, totalRecords = 0) => {
    // Update page info and button states
    const pageInfoEl = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    // Update text and button states
    if (pageInfoEl) pageInfoEl.textContent = `Page ${currentPage} of ${totalPages} (${totalRecords} records)`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
};

// Function to handle payment submission
const submitPayment = async (userIdParam, workIdParam) => {
    // Fetch form values
    const amountInputValue = document.getElementById("amountInput")?.value;
    const amountInput = parseFloat(amountInputValue);
    const paymentMode = document.getElementById("paymentMode")?.value.trim().toLowerCase();
    const paymentDateValue = document.getElementById("payment-date")?.value;
    const paymentDate = paymentDateValue + " " + new Date().toLocaleTimeString();
    const pendingAmount = parseFloat(document.getElementById("formPendingAmount")?.textContent) || 0;

    // Validations
    if (!userIdParam || !workIdParam) {
        window.dialogBoxAPI.showDialogBox('warning', 'No Selection', 'Please select a pending payment.');
        return;
    }

    if (!paymentDateValue || paymentDateValue.trim() === '') {
        window.dialogBoxAPI.showDialogBox('warning', 'Invalid Input', 'Please select a payment date.');
        return;
    }

    if (!amountInput || !paymentMode) {
        window.dialogBoxAPI.showDialogBox('warning', 'Invalid Input', 'Enter amount & select mode.');
        return;
    }

    if (amountInput <= 0 || amountInput > pendingAmount) {
        window.dialogBoxAPI.showDialogBox('warning', 'Invalid Amount', 'Please enter a valid amount.');
        return;
    }

    // Submit payment via API
    const response = await window.paymentEntryAPI.submitPayment({
        userId: userIdParam,
        workId: workIdParam,
        amount: amountInput,
        mode: paymentMode,
        paymentDate: paymentDate
    });

    // Handle response
    if (response && response.success) {
        window.dialogBoxAPI.showDialogBox('info', 'Success', 'Payment submitted successfully.')
            .then(async () => {
                // Send payment SMS if mobile number is available
                if (paymentState.mobile_number) {
                    await sendPaymentSMSWithChoice(paymentState.mobile_number, paymentState.customerName);
                }

                const choice = await window.dialogBoxAPI.showDialogBox(
                    'question',
                    'Print Receipt?',
                    'Do you want to print the receipt?',
                    ['Yes', 'No']
                );

                // Handle both string and index responses
                if (choice === 'Yes' || choice === 0) {
                    try {
                        await window.invoiceAPI.printInvoiceForUser(userIdParam, workIdParam, 'ORIGINAL');
                    } catch (error) {
                        console.error('Print error:', error);
                        window.dialogBoxAPI.showDialogBox('error', 'Print Error', 'Failed to print receipt.');
                    }
                }

                // finally reload after handling print
                window.location.reload();
            });
    } else {
        window.dialogBoxAPI.showDialogBox('error', 'Submission Failed', 'Failed to submit payment.');
    }
};

// Export functions
export {
    renderRows,
    renderCurrentPage,
    submitPayment
};
