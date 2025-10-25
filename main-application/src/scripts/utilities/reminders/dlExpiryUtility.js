/**
 * File: src/scripts/main/utilities/reminders/dlExpiryUtility.js
 * Author: Yash Balotiya
 * Description: This file contains utility functions for Licence Expiry reminders.
 * Created on: 24/10/2025
 * Last Modified: 25/10/2025
 */

// Importing required modules & libraries
import { isoToDDMMYYYY } from "../../shared.js";

// LL Reminder Utility Function
const dlExpiryUtility = () => {
    // Getting DOM elements
    const dlSendBtn = document.getElementById("sendLicenceReminderBtn");
    const dlTable = document.querySelector("#dlDataTable");
    const dlScrollDiv = document.querySelector("#dlScrollDiv");
    const dlTbody = dlScrollDiv?.querySelector("dlTablebody");
    const selectAllLicenceExpiryCheckbox = document.getElementById("selectAllLicenceExpiryCheckbox");

    // Loading indicator
    if (dlSendBtn && dlTable && dlScrollDiv && dlTbody && selectAllLicenceExpiryCheckbox) {
        // Initial state
        dlTable.style.display = "none";
        dlScrollDiv.style.display = "none";
        dlSendBtn.style.display = "none";

        // Select-all logic
        selectAllLicenceExpiryCheckbox.addEventListener("change", () => {
            const checkboxes = dlTbody.querySelectorAll(".dlCheckbox");
            checkboxes.forEach(cb => {
                cb.checked = selectAllLicenceExpiryCheckbox.checked;
            });
        });

        // Load Data button click
        window.addEventListener("load", async () => {
            // Fetch Licence Expiry reminders from main process
            let result = { success: false, data: [] };
            try {
                result = await window.reminderAPI.getLicenceExpiryReminders();
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
                    const mdlNo = (row.mdl_no || '').toUpperCase();
                    const mdlClass = (row.mdl_class || '').toUpperCase();
                    const mdlValidityDate = (row.mdl_validity_date || '');
                    const mobileNumber = row.mobile_number || '';
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="w5"><input type='checkbox' class='dlCheckbox' checked></td>
                        <td class="w15">${idx + 1}</td>
                        <td class="w20">${customerName}</td>
                        <td class="w15">${mdlNo}</td>
                        <td class="w15">${mdlClass}</td>
                        <td class="w15">${mdlValidityDate}</td>
                        <td class="w15">${mobileNumber}</td>
                    `;
                    dlTbody.appendChild(tr);
                });
            } else {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan='7' style='text-align:center;'>No records found</td>`;
                dlTbody.appendChild(tr);
            }

            // After rendering, update select-all checkbox state and add event listeners
            const checkboxes = dlTbody.querySelectorAll('.dlCheckbox');
            selectAllLicenceExpiryCheckbox.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const allChecked = Array.from(checkboxes).every(c => c.checked);
                    selectAllLicenceExpiryCheckbox.checked = allChecked;
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
                'No SMS API found for Licence Expiry reminders.',
                ['OK']
            );
        });
    }
};

// Exporting the dlExpiryUtility function
export default dlExpiryUtility;