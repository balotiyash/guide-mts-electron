import { sendSMS } from "../utilities/sms/smsUtility.js";
import { isoToDDMMYYYY } from "../shared.js";

document.addEventListener('DOMContentLoaded', () => {
    // Select-all checkbox
    const selectAllCheckbox = document.getElementById("selectAllBirthdayCheckbox");
    // Elements
    const loadingDiv = document.getElementById("loadingDiv");
    const loadBtn = document.getElementById("loadBirthdayRemindersBtn");
    const sendBtn = document.getElementById("sendBirthdayReminderBtn");
    const table = document.querySelector(".reminderSection table");
    const scrollDiv = document.querySelector(".reminderSection .scrollDiv");
    const tbody = document.getElementById("pendingPaymentsTableBody");

    // Initial state: only show Load Data button, hide table and send button
    loadingDiv.style.display = "none";
    table.style.display = "none";
    scrollDiv.style.display = "none";
    sendBtn.style.display = "none";

    // Center the Load Data button
    loadBtn.style.margin = "auto";
    loadBtn.style.display = "block";

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
    loadBtn.addEventListener("click", async () => {
        // Show loading, block UI
        loadingDiv.style.display = "flex";
        loadingDiv.style.justifyContent = "center";
        loadingDiv.style.alignItems = "center";
        loadBtn.style.display = "none";

        // Fetch birthday reminders from main process
        let result = { success: false, data: [] };
        try {
            result = await window.reminderAPI.getBirthdayReminders();
        } catch (e) {
            result = { success: false, data: [], message: e.message };
        }


        // Hide loading
        loadingDiv.style.display = "none";

        if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
            await window.dialogBoxAPI.showDialogBox(
                'info',
                'No Data',
                result.message || 'No birthday reminders found.',
                ['OK']
            );
            loadBtn.style.display = "block";
            return;
        }

        // Show table and send button
        table.style.display = "table";
        scrollDiv.style.display = "block";
        sendBtn.style.display = "block";

        // Populate table
        tbody.innerHTML = "";
        result.data.forEach((row, idx) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="w5"><input type='checkbox' class='birthdayCheckbox' checked></td>
                <td class="w15">${idx + 1}</td>
                <td class="w35">${row.customer_name.toUpperCase()}</td>
                <td class="w20">${isoToDDMMYYYY(row.customer_dob)}</td>
                <td class="w20">${row.mobile_number}</td>
            `;
            tbody.appendChild(tr);
        });

        // After rendering, update select-all checkbox state and add event listeners
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

        // Show loading
        loadingDiv.style.display = "flex";
        loadingDiv.style.justifyContent = "center";
        loadingDiv.style.alignItems = "center";

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

        // Hide loading
        loadingDiv.style.display = "none";

        await window.dialogBoxAPI.showDialogBox(
            'info',
            'SMS Result',
            `SMS sent: ${successCount}, Failed: ${failCount}`,
            ['OK']
        );
    });
});