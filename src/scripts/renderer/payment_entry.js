document.addEventListener('DOMContentLoaded', async () => {
    let userId = null;
    let workId = null;
    let paymentId = null;

    // Pagination state (for paid)
    let currentPage = 1;
    const limit = 100;
    let totalPages = 0;

    const tableBody = document.getElementById("pendingPaymentsTableBody");
    const searchInput = document.getElementById("payment-date");
    const filterSelect = document.querySelector("select");

    // Datasets
    const pendingPaymentData = await window.paymentEntryAPI.getAllPendingPayments();

    document.getElementById("loadingDiv").style.display = "none";

    const allPayments = pendingPaymentData?.data || [];
    let paidPayments = [];

    // ------------------------------
    // Render Rows
    // ------------------------------
    function renderRows(data, type = "pending") {
        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
              <tr><td colspan="4" style="text-align:center; padding:10px; color:#777;">
                No records found
              </td></tr>`;
            return;
        }

        data.forEach(item => {
            const row = document.createElement("tr");

            if (type === "pending") {
                row.innerHTML = `
                  <td>${item.customer_name.toUpperCase()}</td>
                  <td>${item.work.toUpperCase()}</td>
                  <td>${item.charged_amount}</td>
                  <td>${item.pending_amount}</td>
                `;
            } else {
                row.innerHTML = `
                  <td>${item.customer_name.toUpperCase()}</td>
                  <td>${item.work.toUpperCase()}</td>
                  <td>${item.charged_amount}</td>
                  <td>${item.paid_amount}</td>
                `;
            }

            // On row click → fill form
            row.addEventListener("click", () => {
                userId = item.customer_id;
                workId = item.work_id;
                paymentId = item.payment_id || null;

                document.getElementById("formCustomerName").textContent = item.customer_name.toUpperCase();
                document.getElementById("formChargedAmount").textContent = item.charged_amount;
                document.getElementById("formPendingAmount").textContent =
                    type === "pending" ? item.pending_amount : item.paid_amount;

                document.getElementById("amountInput").value = "";

                // ✅ Auto-select previous payment mode
                const paymentModeSelect = document.getElementById("paymentMode");
                if (item.payment_mode) {
                    paymentModeSelect.value = item.payment_mode.toLowerCase();
                } else {
                    paymentModeSelect.selectedIndex = 0;
                }
            });

            tableBody.appendChild(row);
        });
    }

    // ------------------------------
    // Paid: Client-Side Pagination + Search
    // ------------------------------
    function renderCurrentPage(searchQuery = "") {
        const start = (currentPage - 1) * limit;
        const end = start + limit;

        let filtered = paidPayments;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = paidPayments.filter(item =>
                item.customer_name.toLowerCase().includes(q) ||
                item.work.toLowerCase().includes(q)
            );
        }

        totalPages = Math.ceil(filtered.length / limit) || 1;
        const pagedData = filtered.slice(start, end);

        renderRows(pagedData, "paid");
        updatePaginationControls(filtered.length);

        // ✅ Scroll the table container to top
        const scrollDiv = document.querySelector(".scrollDiv");
        if (scrollDiv) {
            scrollDiv.scrollTop = 0;
        }
    }

    function updatePaginationControls(totalRecords = paidPayments.length) {
        document.getElementById("pageInfo").textContent =
            `Page ${currentPage} of ${totalPages} (${totalRecords} records)`;
        document.getElementById("prevPageBtn").disabled = currentPage <= 1;
        document.getElementById("nextPageBtn").disabled = currentPage >= totalPages;
    }

    // ------------------------------
    // Event Listeners
    // ------------------------------

    // Search (works for both pending & paid)
    searchInput.addEventListener("input", e => {
        const query = e.target.value.trim().toLowerCase();
        const filter = filterSelect.value;

        if (filter === "pending") {
            const filtered = allPayments.filter(item =>
                item.customer_name.toLowerCase().includes(query)
            );
            renderRows(filtered, "pending");
        } else if (filter === "paid") {
            currentPage = 1;
            renderCurrentPage(query);
        }
    });

    // Pagination
    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage(searchInput.value);
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage(searchInput.value);
        }
    });

    // Filter dropdown
    filterSelect.addEventListener("change", async e => {
        const filter = e.target.value;
        document.getElementById("loadingDiv").style.display = "flex";
        if (filter === "pending") {
            document.getElementById("submitPaymentBtn").style.display = "block";
            document.getElementById("editBtn").style.display = "none";
            document.getElementById("paginationControls").style.display = "none";
            document.getElementById("paginationControls").style.display = "none";
            document.getElementById("printBtnsDiv").style.display = "none";
            document.getElementById("tablePendingAmountLabel").innerHTML = "Pending Amount";
            document.getElementById("formPendingAmountLabel").innerHTML = "Pending Amount";
            tableBody.innerHTML = "";
            renderRows(allPayments, "pending");
        } else if (filter === "paid") {
            document.getElementById("submitPaymentBtn").style.display = "none";
            document.getElementById("editBtn").style.display = "block";
            document.getElementById("paginationControls").style.display = "flex";
            document.getElementById("paginationControls").style.display = "flex";
            document.getElementById("printBtnsDiv").style.display = "flex";
            document.getElementById("tablePendingAmountLabel").innerHTML = "Paid Amount";
            document.getElementById("formPendingAmountLabel").innerHTML = "Paid Amount";
            tableBody.innerHTML = "";

            if (paidPayments.length === 0) {
                const paidData = await window.paymentEntryAPI.getAllPaidPayments();
                paidPayments = paidData?.data || [];
            }
            currentPage = 1;
            renderCurrentPage();
        }
        document.getElementById("loadingDiv").style.display = "none";
    });

    // ------------------------------
    // Submit (Pending Payments)
    // ------------------------------
    document.getElementById("submitPaymentBtn").addEventListener("click", async () => {
        const amountInput = parseFloat(document.getElementById("amountInput").value);
        const paymentMode = document.getElementById("paymentMode").value.trim().toLowerCase();
        const pendingAmount = parseFloat(document.getElementById("formPendingAmount").textContent);

        if (!userId || !workId) {
            window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a pending payment.', ['OK']);
            return;
        }

        if (!amountInput || !paymentMode) {
            window.dialogBoxAPI.showDialogBox('error', 'Invalid Input', 'Enter amount & select mode.', ['OK']);
            return;
        }

        if (amountInput <= 0 || amountInput > pendingAmount) {
            window.dialogBoxAPI.showDialogBox('error', 'Invalid Amount', 'Please enter a valid amount.', ['OK']);
            return;
        }

        const response = await window.paymentEntryAPI.submitPayment({
            userId,
            workId,
            amount: amountInput,
            mode: paymentMode
        });

        if (response.success) {
            window.dialogBoxAPI.showDialogBox('info', 'Success', 'Payment submitted successfully.', ['OK']);
            window.location.reload();
        } else {
            window.dialogBoxAPI.showDialogBox('error', 'Submission Failed', 'Failed to submit payment.', ['OK']);
        }
    });

    // ------------------------------
    // Edit (Paid Payments)
    // ------------------------------
    document.getElementById("editBtn").addEventListener("click", async () => {
        const newAmount = parseFloat(document.getElementById("amountInput").value);
        const newMode = document.getElementById("paymentMode").value.trim().toLowerCase();

        if (!paymentId) {
            window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a record to edit.', ['OK']);
            return;
        }

        if (!newAmount || newAmount <= 0) {
            window.dialogBoxAPI.showDialogBox('error', 'Invalid Input', 'Please enter a valid amount.', ['OK']);
            return;
        }

        const response = await window.paymentEntryAPI.updatePayment({
            paymentId,
            newAmount,
            newMode
        });

        if (response.success) {
            window.dialogBoxAPI.showDialogBox('info', 'Updated', 'Payment updated successfully.', ['OK']);
            window.location.reload();
        }
    });

    // ------------------------------
    // Clear & Exit
    // ------------------------------
    document.getElementById("clearBtn").addEventListener("click", () => {
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

    document.getElementById("exitBtn").addEventListener("click", () => {
        window.location.href = "./dashboard.html";
    });

    // ✅ Initial render (pending by default)
    renderRows(allPayments, "pending");

    document.getElementById('downloadOriginalInvoiceBtn').addEventListener('click', async () => {
        await generateInvoiceForSelectedUser('ORIGINAL');
    });

    document.getElementById('downloadDuplicateInvoiceBtn').addEventListener('click', async () => {
        await generateInvoiceForSelectedUser('DUPLICATE');
    });

    async function generateInvoiceForSelectedUser(type) {
        if (!userId) {
            window.dialogBoxAPI.showDialogBox('error', 'No Selection', 'Please select a customer first.', ['OK']);
            return;
        }
        const res = await window.electronAPI.generateInvoiceForUser(userId, workId, type);
        if (res.success) {
            console.log('Invoice saved at:', res.filePath);
            window.dialogBoxAPI.showDialogBox('info', 'Success', `Invoice saved at:\n${res.filePath}`, ['OK']);
        } else {
            console.error(res.error);
            window.dialogBoxAPI.showDialogBox('error', 'Error', 'Failed to generate invoice.', ['OK']);
        }
    }

});
