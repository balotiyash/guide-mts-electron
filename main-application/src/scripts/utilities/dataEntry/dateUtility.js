/* File: src/scripts/utilities/dataEntry/dateUtility.js
   Author: Yash Balotiya
   Description: Utility functions for handling date fields in the data entry form.
   Created on: 21/09/2025
   Last Modified: 04/10/2025
*/

// Importing required modules & libraries
import { isoToDDMMYYYY, ddmmyyyyToISO, sanitizeDate } from "../../shared.js";

// Function to initialize and manage date fields
const dateUtility = () => {

    // Utility: add months to a date
    const addMonthsToDate = (date, months) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        newDate.setDate(newDate.getDate() - 1); // Subtract 1 day
        return newDate;
    };

    // Date fields
    const dateFields = [
        { textId: "dobInputText", hiddenId: "dobInput", dataKey: "customer_dob" },
        { textId: "issuedOnInputText", hiddenId: "issuedOnInput", dataKey: "ll_issued_date" },
        { textId: "validUntilInputText", hiddenId: "validUntilInput", dataKey: "ll_validity_date" },
        { textId: "mdlIssuedInputText", hiddenId: "mdlIssuedInput", dataKey: "mdl_issued_date" },
        { textId: "mdlValidUntilInputText", hiddenId: "mdlValidUntilInput", dataKey: "mdl_validity_date" },
        { textId: "endorsementDatedInputText", hiddenId: "endorsementDatedInput", dataKey: "endorsement_date" },
        { textId: "endorsementValidityInputText", hiddenId: "endorsementValidityInput", dataKey: "endorsement_validity_date" },
        // Master entry date field
        { textId: "license-expiration-text", hiddenId: "license-expiration", dataKey: "license_expiration_date" },
        // Fuel entry date field
        { textId: "entrydate_text", hiddenId: "entrydate", dataKey: "entry_date" },
        // Search page date fields
        { textId: "starting-date-text", hiddenId: "starting-date", dataKey: "starting_date" },
        { textId: "ending-date-text", hiddenId: "ending-date", dataKey: "ending_date" }
    ];

    // Initialize all date fields
    dateFields.forEach(({ textId, hiddenId }) => {
        // Get references to the text and hidden inputs
        const textInput = document.getElementById(textId);
        const hiddenInput = document.getElementById(hiddenId);

        // console.log(`Checking date field: ${textId}, textInput:`, textInput, `hiddenInput:`, hiddenInput);

        // If either input is missing, skip initialization
        if (!textInput || !hiddenInput) {
            // console.log(`Skipping ${textId} - missing element`);
            return;
        }

        // Flatpickr configuration
        const flatpickrConfig = {
            dateFormat: "d-m-Y",
            allowInput: true,
            onChange: function (selectedDates) {
                if (selectedDates.length) {
                    const dt = selectedDates[0];
                    const yyyy = dt.getFullYear();
                    const mm = String(dt.getMonth() + 1).padStart(2, '0');
                    const dd = String(dt.getDate()).padStart(2, '0');
                    hiddenInput.value = `${yyyy}-${mm}-${dd}`; // <-- local date, correct

                    // Special case: Issued On → auto update Valid Until (+6 months)
                    if (hiddenId === "issuedOnInput") {
                        const newDate = addMonthsToDate(dt, 6);
                        const validUntilText = document.getElementById("validUntilInputText");
                        const validUntilHidden = document.getElementById("validUntilInput");

                        validUntilHidden.value = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
                        validUntilText.value = isoToDDMMYYYY(validUntilHidden.value);
                        if (validUntilText.inputmask) {
                            validUntilText.inputmask.setValue(validUntilText.value);
                        }
                    }
                } else {
                    hiddenInput.value = "";
                }
            }
        };

        // Set default date to today for fuel entry field
        if (textId === "entrydate_text") {
            const today = new Date();

            flatpickrConfig.defaultDate = today;
            flatpickrConfig.allowInput = true;

            flatpickrConfig.onReady = function (selectedDates, dateStr, instance) {
                // Ensure hidden input is set correctly when flatpickr is ready
                const dt = selectedDates.length ? selectedDates[0] : today;
                const yyyy = dt.getFullYear();
                const mm = String(dt.getMonth() + 1).padStart(2, '0');
                const dd = String(dt.getDate()).padStart(2, '0');
                hiddenInput.value = `${yyyy}-${mm}-${dd}`;

                textInput.value = `${dd}-${mm}-${yyyy}`;

                // Only now we can load fuel entry safely
                if (window.loadExistingFuelEntry) {
                    window.loadExistingFuelEntry();
                }
            };
        }

        // Apply Flatpickr
        flatpickr(textInput, flatpickrConfig);

        // Inputmask
        const im = new window.Inputmask("99-99-9999", {
            placeholder: "__-__-____",
            showMaskOnHover: false,
            showMaskOnFocus: true,
            clearIncomplete: false
        });
        im.mask(textInput);

        // Sync hidden on typing - debounced to prevent excessive processing
        let inputTimeout;
        textInput.addEventListener("input", () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                const inputValue = textInput.value.trim();

                // Only process if we have a complete date pattern
                if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
                    const isoDate = ddmmyyyyToISO(inputValue);
                    if (isoDate) {
                        hiddenInput.value = isoDate;
                    } else {
                        // Invalid date, clear hidden input
                        hiddenInput.value = "";
                        console.warn(`Invalid date entered: ${inputValue}`);
                    }
                } else if (inputValue === "") {
                    // Clear hidden input if text input is empty
                    hiddenInput.value = "";
                }
            }, 300); // 300ms debounce
        });
    });
};

// Export the dateUtility function
export default dateUtility;