/*
 * File: src/scripts/renderer/payment_entry.js
 * Author: Yash Balotiya
 * Description: This file contains JS code for payment entry page. This is the main page for it.
 * Created on: 16/09/2025
 * Last Modified: 21/10/2025
 */

// Importing required 
import { renderRows, renderCurrentPage, submitPayment } from "../utilities/paymentEntry/paymentUtility.js";
import { printInvoiceForSelectedUser } from "../utilities/paymentEntry/printInvoiceUtility.js";
import { paymentState } from "../utilities/paymentEntry/paymentUtility.js";

// On window load
document.addEventListener('DOMContentLoaded', async () => {
    // State
    let userId = null;
    let workId = null;
    let paymentId = null;

    // Pagination state (for paid)
    let currentPage = 1;
    const limit = 100;
    let totalPages = 1;

    // DOM Elements
    const tableBody = document.getElementById("pendingPaymentsTableBody");
    const searchInput = document.getElementById("payment-date");
    const filterSelect = document.getElementById("paymentStatusSelect");

    // Datasets
    const pendingPaymentData = await window.paymentEntryAPI.getAllPendingPayments();

    // Hide loading after data fetch
    document.getElementById("loadingDiv").style.display = "none";

    // All payments data
    const allPayments = pendingPaymentData?.data || [];
    let paidPayments = [];

    // ------------------------------
    // Event Listeners
    // ------------------------------

    // Search (works for both pending & paid)
    searchInput.addEventListener("input", e => {
        // Get the search query and filter type
        const query = e.target.value.trim().toLowerCase();
        const filter = filterSelect.value;

        if (filter === "pending") {
            const filtered = allPayments.filter(item =>
                (item.customer_name || "").toLowerCase().includes(query)
            );
            renderRows(tableBody, filtered, "pending", (u, w, p) => {
                userId = u;
                workId = w;
                paymentId = p;
            });
        } else if (filter === "paid") {
            currentPage = 1;
            const res = renderCurrentPage(currentPage, limit, paidPayments, query, tableBody, (u, w, p) => {
                userId = u;
                workId = w;
                paymentId = p;
            });
            if (res && res.totalPages) totalPages = res.totalPages;
        }
    });

    // Pagination
    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            const res = renderCurrentPage(currentPage, limit, paidPayments, searchInput.value, tableBody, (u, w, p) => {
                userId = u;
                workId = w;
                paymentId = p;
            });
            if (res && res.totalPages) totalPages = res.totalPages;
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            const res = renderCurrentPage(currentPage, limit, paidPayments, searchInput.value, tableBody, (u, w, p) => {
                userId = u;
                workId = w;
                paymentId = p;
            });
            if (res && res.totalPages) totalPages = res.totalPages;
        }
    });

    // Filter dropdown
    filterSelect.addEventListener("change", async e => {
        // Get the selected filter
        const filter = e.target.value;

        // Show loading indicator
        document.getElementById("loadingDiv").style.display = "flex";

        if (filter === "pending") {
            // Show pending payment controls
            document.getElementById("submitPaymentBtn").style.display = "block";
            document.getElementById("editBtn").style.display = "none";
            document.getElementById("paginationControls").style.display = "none";
            document.getElementById("printBtnsDiv").style.display = "none";
            document.getElementById("tablePendingAmountLabel").innerHTML = "Pending Amount";
            document.getElementById("formPendingAmountLabel").innerHTML = "Pending Amount";
            tableBody.innerHTML = "";
            renderRows(tableBody, allPayments, "pending", (u, w, p) => {
                userId = u;
                workId = w;
                paymentId = p;
            });
        } else if (filter === "paid") {
            // Show paid payment controls
            document.getElementById("submitPaymentBtn").style.display = "none";
            document.getElementById("editBtn").style.display = "block";
            document.getElementById("paginationControls").style.display = "flex";
            document.getElementById("printBtnsDiv").style.display = "flex";
            document.getElementById("tablePendingAmountLabel").innerHTML = "Paid Amount";
            document.getElementById("formPendingAmountLabel").innerHTML = "Paid Amount";
            tableBody.innerHTML = "";

            // Fetch paid payments only once
            if (paidPayments.length === 0) {
                const paidData = await window.paymentEntryAPI.getAllPaidPayments();
                paidPayments = paidData?.data || [];
            }
            currentPage = 1;
            const res = renderCurrentPage(currentPage, limit, paidPayments, "", tableBody, (u, w, p) => {
                userId = u;
                workId = w;
                paymentId = p;
            });
            if (res && res.totalPages) totalPages = res.totalPages;
        }

        // Hide loading indicator
        document.getElementById("loadingDiv").style.display = "none";
    });

    // ------------------------------
    // Submit (Pending Payments)
    // ------------------------------
    document.getElementById("submitPaymentBtn").addEventListener("click", async () => {
        await submitPayment(userId, workId);
    });

    // ------------------------------
    // Edit (Paid Payments)
    // ------------------------------
    document.getElementById("editBtn").addEventListener("click", async () => {
        // Get new values
        const newAmount = parseFloat(document.getElementById("amountInput").value);
        const newMode = document.getElementById("paymentMode").value.trim().toLowerCase();

        // Validation
        if (!paymentId) {
            window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a record to edit.', ['OK']);
            return;
        }

        if (!newAmount || newAmount <= 0) {
            window.dialogBoxAPI.showDialogBox('error', 'Invalid Input', 'Please enter a valid amount.', ['OK']);
            return;
        }

        // Call update API
        const response = await window.paymentEntryAPI.updatePayment({ paymentId, newAmount, newMode });

        // Handle response
        if (response.success) {
            // Confirm Dialog
            window.dialogBoxAPI.showDialogBox('info', 'Updated', 'Payment updated successfully.', ['OK']);

            // SMS Notification
            const { mobile_number, customerName } = paymentState;
            console.log(mobile_number, customerName);

            if (!mobile_number || !customerName) {
                window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a record to edit.', ['OK']);
                return;
            }

            await sendPaymentSMSWithChoice(mobile_number, customerName);

            // Reload page to reflect changes
            window.location.reload();
        }
    });

    // ------------------------------
    // Clear & Exit
    // ------------------------------
    document.getElementById("clearBtn").addEventListener("click", () => {
        // Confirm before clearing
        window.dialogBoxAPI.showDialogBox('question', 'Confirm Clear', 'Clear the form?', ['Yes', 'No'])
            .then(result => {
                if (result === 0) {
                    userId = null;
                    workId = null;
                    paymentId = null;
                    document.getElementById("formCustomerName").textContent = "-";
                    document.getElementById("formChargedAmount").textContent = "-";
                    document.getElementById("formPendingAmount").textContent = "-";
                    document.getElementById("amountInput").value = "";
                    document.getElementById("paymentMode").selectedIndex = 0;
                }
            });
    });

    // Exit button
    document.getElementById("exitBtn").addEventListener("click", () => {
        window.location.href = "./dashboard.html";
    });

    // ✅ Initial render (pending by default)
    renderRows(tableBody, allPayments, "pending", (u, w, p) => {
        userId = u;
        workId = w;
        paymentId = p;
    });

    // Handling invoice print buttons
    document.getElementById('downloadOriginalInvoiceBtn').addEventListener('click', async () => {
        await printInvoiceForSelectedUser(userId, workId, 'ORIGINAL');
    });

    document.getElementById('downloadDuplicateInvoiceBtn').addEventListener('click', async () => {
        await printInvoiceForSelectedUser(userId, workId, 'DUPLICATE');
    });
});