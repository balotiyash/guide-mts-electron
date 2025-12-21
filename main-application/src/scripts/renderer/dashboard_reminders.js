/**
 * File: src/scripts/renderer/dashboard_reminders.js
 * Author: Yash Balotiya
 * Description: Handles all reminder rendering for the dashboard, including rotation and click persistence.
 * Created on: 26/10/2025
 * Last Modified: 21/12/2025
 */

// --- Configuration ---
const REMINDERS_CONFIG = [
    { id: 'birthdayReminder', title: 'Birthday', page: 'reminders.html' },
    { id: 'llCompletedReminder', title: 'LL Completed', page: 'reminders.html' },
    { id: 'paymentReminder', title: 'Payment', page: 'reminders.html' },
    { id: 'dlExpiryReminder', title: 'DL Expiry', page: 'reminders.html' }
];

const LOCAL_STORAGE_KEY = 'daily_reminders_status';
const ROTATION_INTERVAL_MS = 30000; // 30 seconds

let currentReminderIndex = 0;
let acknowledgedReminders = {};
let rotationTimer = null;

/**
 * Utility: Today's date in YYYY-MM-DD
 */
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// Load daily reminder status from localStorage
const loadReminderStatus = () => {
    const today = getTodayDateString();
    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');

    if (storedData.date === today && storedData.status) {
        acknowledgedReminders = storedData.status;
    } else {
        // Reset for new day
        acknowledgedReminders = {};
        saveReminderStatus();
    }
};

// Save current status to localStorage
const saveReminderStatus = () => {
    const data = {
        date: getTodayDateString(),
        status: acknowledgedReminders
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

// Handle bar click -> ask confirmation -> mark as acknowledged -> optionally navigate
const handleReminderClick = async (reminder) => {
    const { id, title, page } = reminder;

    let userChoice = 1; // Default = "No"
    try {
        // 0 = Yes, 1 = No (like standard dialog result codes)
        userChoice = await window.dialogBoxAPI.showDialogBox(
            'question',
            `${title} Reminder`,
            `Do you want to see today's '${title.toUpperCase()}' reminders?`,
            ['Yes', 'No']
        );
    } catch {
        // Fallback (browser mode)
        userChoice = confirm(`Do you want to see today's '${title.toUpperCase()}' reminders?`) ? 0 : 1;
    }

    // ✅ Always mark as acknowledged, regardless of Yes or No
    acknowledgedReminders[id] = true;
    saveReminderStatus();
    updateReminderDisplay();

    // If user clicked "Yes", navigate to reminders page
    if (userChoice === 0) {
        if (window.electronAPI && window.electronAPI.navigateTo) {
            window.electronAPI.navigateTo(page);
        } else {
            window.location.href = page;
        }
    }
};

// Show one bar (rotating every 30s) or 'no reminders' if all done
const updateReminderDisplay = () => {
    const barContainer = document.getElementById('reminderBarContainer');
    const noMsg = document.getElementById('noRemindersMessage');
    const available = REMINDERS_CONFIG.filter(r => !acknowledgedReminders[r.id]);

    if (!barContainer || !noMsg) return;

    // Hide all bars
    REMINDERS_CONFIG.forEach(r => {
        const el = document.getElementById(r.id);
        if (el) el.style.display = 'none';
    });

    // If all are done
    if (available.length === 0) {
        barContainer.style.display = 'none';
        noMsg.style.display = 'block';
        clearInterval(rotationTimer);
        return;
    }

    // Otherwise, show active one
    noMsg.style.display = 'none';
    barContainer.style.display = 'flex';

    currentReminderIndex = currentReminderIndex % available.length;
    const active = available[currentReminderIndex];
    const activeEl = document.getElementById(active.id);
    if (activeEl) {
        activeEl.style.display = 'flex';
    }
};

// Rotate to next reminder
const rotateReminder = () => {
    const available = REMINDERS_CONFIG.filter(r => !acknowledgedReminders[r.id]);
    if (available.length > 0) {
        currentReminderIndex = (currentReminderIndex + 1) % available.length;
    }
    updateReminderDisplay();
};

/**
 * Main Init
 */
window.addEventListener('DOMContentLoaded', () => {
    loadReminderStatus();

    // Setup animation for bars
    document.querySelectorAll('.bar').forEach(bar => {
        const randomDuration = (Math.random() * 4 + 6).toFixed(1); // 6–10s
        const randomDelay = (Math.random() * 2).toFixed(1); // 0–2s
        bar.style.animation = `wave ${randomDuration}s ease-in-out ${randomDelay}s infinite`;

        bar.addEventListener('mouseenter', () => (bar.style.animationPlayState = 'paused'));
        bar.addEventListener('mouseleave', () => (bar.style.animationPlayState = 'running'));
    });

    // Click listeners
    REMINDERS_CONFIG.forEach(reminder => {
        const el = document.getElementById(reminder.id);
        if (el) {
            el.addEventListener('click', () => handleReminderClick(reminder));
        }
    });

    // Initial render
    updateReminderDisplay();

    // Start rotation every 30s
    rotationTimer = setInterval(rotateReminder, ROTATION_INTERVAL_MS);
});
