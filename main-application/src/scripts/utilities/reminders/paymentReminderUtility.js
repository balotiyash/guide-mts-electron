/**
 * File: src/scripts/main/utilities/reminders/paymentReminderUtility.js
 * Author: Yash Balotiya
 * Description: This file contains utility functions for payment reminders.
 * Created on: 25/10/2025
 * Last Modified: 26/10/2025
 */

// Importing required modules & libraries
import { sendSMS } from "../sms/smsUtility.js";
import { isoToDDMMYYYY } from "../../shared.js";

// Payment Reminder Utility Function
const paymentReminderUtility = () => {
    // Select-all checkbox
    const selectAllCheckbox = document.getElementById("selectAllPaymentCheckbox");

    // Elements
    const sendBtn = document.getElementById("sendPaymentReminderBtn");
    const table = document.querySelector("#paymentDataTable");
    const scrollDiv = document.querySelector("#paymentScrollDiv");
    const tbody = document.getElementById("paymentTableBody");

    // Initial state: only show Load Data button, hide table and send button
    // table.style.display = "none";
    scrollDiv.style.display = "none";
    sendBtn.style.display = "none";

    // Select-all logic
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", () => {
            const checkboxes = document.querySelectorAll(".paymentCheckbox");
            checkboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Load Data button click
    window.addEventListener("load", async () => {
        // Fetch payment reminders from main process
        let result = { success: false, data: [] };
        try {
            result = await window.reminderAPI.getPaymentReminders();
        } catch (e) {
            result = { success: false, data: [], message: e.message };
        }

        if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
            await window.dialogBoxAPI.showDialogBox(
                'info',
                'No Data',
                result.message || 'No payment reminders found.',
                ['OK']
            );
            return;
        }

        // Show table and send button
        table.style.display = "table";
        scrollDiv.style.display = "block";
        sendBtn.style.display = "block";

        // Populate table
        if (tbody) {
            tbody.innerHTML = "";
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                result.data.forEach((row, idx) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="w5"><input type='checkbox' class='paymentCheckbox' checked></td>
                        <td class="w5">${idx + 1}</td>
                        <td class="w20">${row.customer_name.toUpperCase()}</td>
                        <td class="w10">${row.charged_amount}</td>
                        <td class="w10">${row.pending_amount}</td>
                        <td class="w40">${row.work_description.toUpperCase()}</td>
                        <td class="w10">${row.mobile_number}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan='5' style='text-align:center;'>No records found</td>`;
                tbody.appendChild(tr);
            }
        }

        // After rendering, update select-all checkbox state and add event listeners
        if (tbody) {
            const checkboxes = tbody.querySelectorAll('.paymentCheckbox');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
                checkboxes.forEach(cb => {
                    cb.addEventListener('change', () => {
                        const allChecked = Array.from(checkboxes).every(c => c.checked);
                        selectAllCheckbox.checked = allChecked;
                    });
                });
            }
        }
    });

    // Send Payment Reminder button click
    sendBtn.addEventListener("click", async () => {
        // Get checked users
        const checkboxes = tbody.querySelectorAll(".paymentCheckbox:checked");
        if (checkboxes.length === 0) {
            await window.dialogBoxAPI.showDialogBox(
                'warning',
                'No Selection',
                'Please select at least one user to send SMS.',
                ['OK']
            );
            return;
        }

        // Confirm before sending SMS
        const confirm = await window.dialogBoxAPI.showDialogBox(
            'question',
            'Send Payment Reminders',
            `Are you sure you want to send payment SMS to ${checkboxes.length} user(s)?`,
            ['Yes', 'No']
        );
        if (confirm !== 0) return;

        // Send SMS to each selected user
        let successCount = 0, failCount = 0;
        for (const cb of checkboxes) {
            const tr = cb.closest("tr");
            const name = tr.children[2].textContent;
            const mobile = tr.children[6].textContent;
            const pending_amount = tr.children[4].textContent;

            try {
                // Use direct import of sendSMS with type 'paymentReminder'
                const date = new Date();
                date.setDate(date.getDate() + 4);
                const res = await sendSMS('paymentReminder', mobile, name, pending_amount, isoToDDMMYYYY(date.toISOString().substring(0, 10)));
                if (res && res.success) successCount++;
                else failCount++;
            } catch {
                failCount++;
            }
        }

        await window.dialogBoxAPI.showDialogBox(
            'info',
            'SMS Result',
            `SMS sent: ${successCount}, Failed: ${failCount}`,
            ['OK']
        );
    });
};

// Exporting the utility function
export default paymentReminderUtility;