/**
 * File: src/scripts/main/utilities/reminders/birthdayReminderUtility.js
 * Author: Yash Balotiya
 * Description: This file contains utility functions for birthday reminders.
 * Created on: 24/10/2025
 * Last Modified: 21/12/2025
 */

// Importing required modules & libraries
import { sendSMS } from "../../utilities/sms/smsUtility.js";
import { isoToDDMMYYYY } from "../../shared.js";

// Birthday Reminder Utility Function
const birthdayReminderUtility = () => {
    // Select-all checkbox
    const selectAllCheckbox = document.getElementById("selectAllBirthdayCheckbox");
    
    // Elements
    const sendBtn = document.getElementById("sendBirthdayReminderBtn");
    const table = document.querySelector(".reminderSection table");
    const scrollDiv = document.querySelector(".reminderSection .scrollDiv");
    const tbody = document.getElementById("birthdayTableBody");

    // Initial state: only show Load Data button, hide table and send button
    // table.style.display = "none";
    scrollDiv.style.display = "none";
    sendBtn.style.display = "none";

    // Select-all logic
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", () => {
            const checkboxes = document.querySelectorAll(".birthdayCheckbox");
            checkboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Load Data button click
    window.addEventListener("load", async () => {
        // Fetch birthday reminders from main process
        let result = { success: false, data: [] };
        try {
            // result = await window.reminderAPI.getBirthdayReminders();
            const hostAddress = await window.electronAPI.getHost();
            const response = await fetch(`http://${hostAddress}:3000/api/v1/reminders/birthdays`);
            result = await response.json();
        } catch (e) {
            result = { success: false, data: [], message: e.message };
            await window.dialogBoxAPI.showDialogBox(
                'error',
                'API Error',
                `Failed to fetch birthday reminders: ${e.message}`,
                ['OK']
            );
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
                        <td class=\"w5\"><input type='checkbox' class='birthdayCheckbox' checked></td>
                        <td class=\"w15\">${idx + 1}</td>
                        <td class=\"w35\">${row.customer_name.toUpperCase()}</td>
                        <td class=\"w20\">${isoToDDMMYYYY(row.customer_dob)}</td>
                        <td class=\"w20\">${row.mobile_number}</td>
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
            const checkboxes = tbody.querySelectorAll('.birthdayCheckbox');
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

    // Send Birthday Reminder button click
    sendBtn.addEventListener("click", async () => {
        // Get checked users
        const checkboxes = tbody.querySelectorAll(".birthdayCheckbox:checked");
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
            'Send Birthday Reminders',
            `Are you sure you want to send birthday SMS to ${checkboxes.length} user(s)?`,
            ['Yes', 'No']
        );
        if (confirm !== 0) return;

        // Send SMS to each selected user
        let successCount = 0, failCount = 0;
        for (const cb of checkboxes) {
            const tr = cb.closest("tr");
            const name = tr.children[2].textContent;
            const mobile = tr.children[4].textContent;
            try {
                // Use direct import of sendSMS with type 'birthdayReminder'
                const res = await sendSMS('birthdayReminder', mobile, name);
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
export default birthdayReminderUtility;