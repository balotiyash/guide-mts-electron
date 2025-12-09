/**
 * File: src/scripts/main/utilities/reminders/dlReminderUtility.js
 * Author: Yash Balotiya
 * Description: This file contains utility functions for DL reminders.
 * Created on: 25/10/2025
 * Last Modified: 09/12/2025
 */

// Importing required modules & libraries
import { isoToDDMMYYYY } from "../../shared.js";

// DL Reminder Utility Function
const dlReminderUtility = () => {
    // Getting DOM elements
    const dlSendBtn = document.getElementById("sendDLReminderBtn");
    const dlTable = document.querySelector("#dlDataTable");
    const dlScrollDiv = document.querySelector("#dlScrollDiv");
    const dlTbody = dlScrollDiv?.querySelector("tbody");
    const selectAllDLCheckbox = document.getElementById("selectAllDLCheckbox");

    // Loading indicator
    if (dlSendBtn && dlTable && dlScrollDiv && dlTbody && selectAllDLCheckbox) {
        // Initial state
        dlTable.style.display = "none";
        dlScrollDiv.style.display = "none";
        dlSendBtn.style.display = "none";

        // Select-all logic
        selectAllDLCheckbox.addEventListener("change", () => {
            const checkboxes = dlTbody.querySelectorAll(".dlCheckbox");
            checkboxes.forEach(cb => {
                cb.checked = selectAllDLCheckbox.checked;
            });
        });

        // Load Data button click
        window.addEventListener("load", async () => {
            // Fetch DL reminders from main process
            let result = { success: false, data: [] };
            try {
                // result = await window.reminderAPI.getLicenceExpiryReminders();
                const hostAddress = await window.electronAPI.getHost();
                const response = await fetch(`http://${hostAddress}:3000/api/v1/reminders/licence-expiry-reminders`);
                result = await response.json();
            } catch (e) {
                result = { success: false, data: [], message: e.message };
            }

            // Always show table and send button (even if no data)
            dlTable.style.display = "table";
            dlScrollDiv.style.display = "block";
            dlSendBtn.style.display = "block";

            // Populate table (blank if no data)
            dlTbody.innerHTML = "";
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                result.data.forEach((row, idx) => {
                    const customerName = (row.customer_name || '').toUpperCase();
                    const dlNo = (row.mdl_no || '').toUpperCase();
                    const dlClass = (row.mdl_class || '').toUpperCase();
                    const dlValidityDate = row.mdl_validity_date ? isoToDDMMYYYY(row.mdl_validity_date) : '';
                    const mobileNumber = row.mobile_number || '';
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="w5"><input type='checkbox' class='dlCheckbox' checked></td>
                        <td class="w15">${idx + 1}</td>
                        <td class="w20">${customerName}</td>
                        <td class="w15">${dlNo}</td>
                        <td class="w15">${dlClass}</td>
                        <td class="w15">${dlValidityDate}</td>
                        <td class="w15">${mobileNumber}</td>
                    `;
                    dlTbody.appendChild(tr);
                });
            } else {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan='5' style='text-align:center;'>No records found</td>`;
                dlTbody.appendChild(tr);
            }

            // After rendering, update select-all checkbox state and add event listeners
            const checkboxes = dlTbody.querySelectorAll('.dlCheckbox');
            selectAllDLCheckbox.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const allChecked = Array.from(checkboxes).every(c => c.checked);
                    selectAllDLCheckbox.checked = allChecked;
                });
            });
        });

        // Send SMS button click (just prompt dialog, no API)
        dlSendBtn.addEventListener("click", async () => {
            const checkboxes = dlTbody.querySelectorAll(".dlCheckbox:checked");
            if (checkboxes.length === 0) {
                await window.dialogBoxAPI.showDialogBox(
                    'warning',
                    'No Selection',
                    'Please select at least one user to send SMS.',
                    ['OK']
                );
                return;
            }
            await window.dialogBoxAPI.showDialogBox(
                'info',
                'No SMS API',
                'No SMS API found for DL Expiry reminders.',
                ['OK']
            );
        });
    }
};

// Exporting the dlReminderUtility function
export default dlReminderUtility;