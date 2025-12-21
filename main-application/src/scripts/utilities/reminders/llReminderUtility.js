/**
 * File: src/scripts/main/utilities/reminders/llReminderUtility.js
 * Author: Yash Balotiya
 * Description: This file contains utility functions for LL reminders.
 * Created on: 24/10/2025
 * Last Modified: 21/12/2025
 */

// Importing required modules & libraries
import { isoToDDMMYYYY } from "../../shared.js";

// LL Reminder Utility Function
const llReminderUtility = () => {
    // Getting DOM elements
    const llSendBtn = document.getElementById("sendLLCompletedReminderBtn");
    const llTable = document.querySelector("#llDataTable");
    const llScrollDiv = document.querySelector("#llScrollDiv");
    const llTbody = llScrollDiv?.querySelector("tbody");
    const selectAllLLCheckbox = document.getElementById("selectAllLLCheckbox");

    // Loading indicator
    if (llSendBtn && llTable && llScrollDiv && llTbody && selectAllLLCheckbox) {
        // Initial state
        llTable.style.display = "none";
        llScrollDiv.style.display = "none";
        llSendBtn.style.display = "none";

        // Select-all logic
        selectAllLLCheckbox.addEventListener("change", () => {
            const checkboxes = llTbody.querySelectorAll(".llCheckbox");
            checkboxes.forEach(cb => {
                cb.checked = selectAllLLCheckbox.checked;
            });
        });

        // Load Data button click
        window.addEventListener("load", async () => {
            // Fetch LL reminders from main process
            let result = { success: false, data: [] };
            try {
                // result = await window.reminderAPI.getLLReminders();
                const hostAddress = await window.electronAPI.getHost();
                const response = await fetch(`http://${hostAddress}:3000/api/v1/reminders/ll-reminders`);
                result = await response.json();
            } catch (e) {
                result = { success: false, data: [], message: e.message };
                await window.dialogBoxAPI.showDialogBox(
                    'error',
                    'API Error',
                    `Failed to fetch LL reminders: ${e.message}`,
                    ['OK']
                );
            }

            // Always show table and send button (even if no data)
            llTable.style.display = "table";
            llScrollDiv.style.display = "block";
            llSendBtn.style.display = "block";

            // Populate table (blank if no data)
            llTbody.innerHTML = "";
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                result.data.forEach((row, idx) => {
                    const customerName = (row.customer_name || '').toUpperCase();
                    const llNo1 = (row.ll_no_1 || '').toUpperCase();
                    const llNo2 = (row.ll_no_2 || '').toUpperCase();
                    const llClass1 = (row.ll_class_1 || '').toUpperCase();
                    const llClass2 = (row.ll_class_2 || '').toUpperCase();
                    const llIssuedDate = row.ll_issued_date ? isoToDDMMYYYY(row.ll_issued_date) : '';
                    const mobileNumber = row.mobile_number || '';
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="w5"><input type='checkbox' class='llCheckbox' checked></td>
                        <td class="w15">${idx + 1}</td>
                        <td class="w20">${customerName}</td>
                        <td class="w15">${llNo1}${llNo2 ? ", " + llNo2 : ""}</td>
                        <td class="w15">${llClass1}${llClass2 ? ", " + llClass2 : ""}</td>
                        <td class="w15">${llIssuedDate}</td>
                        <td class="w15">${mobileNumber}</td>
                    `;
                    llTbody.appendChild(tr);
                });
            } else {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan='5' style='text-align:center;'>No records found</td>`;
                llTbody.appendChild(tr);
            }

            // After rendering, update select-all checkbox state and add event listeners
            const checkboxes = llTbody.querySelectorAll('.llCheckbox');
            selectAllLLCheckbox.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const allChecked = Array.from(checkboxes).every(c => c.checked);
                    selectAllLLCheckbox.checked = allChecked;
                });
            });
        });

        // Send SMS button click (just prompt dialog, no API)
        llSendBtn.addEventListener("click", async () => {
            const checkboxes = llTbody.querySelectorAll(".llCheckbox:checked");
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
                'Send LL Completed Reminders',
                `Are you sure you want to send LL completion reminder SMS to ${checkboxes.length} user(s)?`,
                ['Yes', 'No']
            );
            if (confirm !== 0) return;

            // Send SMS to each selected user
            let successCount = 0, failCount = 0;
            for (const cb of checkboxes) {
                const tr = cb.closest("tr");
                const name = tr.children[2].textContent;
                const mobile = tr.children[6].textContent;
                try {
                    // TODO: Replace with actual sendSMS call when LL completion SMS API is available
                    // const res = await sendSMS('llCompleted', mobile, name);
                    // For now, simulate success
                    await new Promise(resolve => setTimeout(resolve, 50));
                    const res = { success: true };
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
    }
};

// Exporting the llReminderUtility function
export default llReminderUtility;