/* File: src/scripts/utilities/dataEntry/dateUtility.js
   Author: Yash Balotiya
   Description: Utility functions for handling date fields in the data entry form.
   Created on: 21/09/2025
   Last Modified: 21/09/2025
*/

// Importing required modules & libraries
import { isoToDDMMYYYY } from "../../shared.js";

// Function to initialize and manage date fields
const dateUtility = () => {

    // Utility: add months to a date
    const addMonthsToDate = (date, months) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
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
        { textId: "license-expiration-text", hiddenId: "license-expiration", dataKey: "license_expiration_date" }
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

        // Flatpickr
        // console.log(`Applying Flatpickr to ${textId}`);
        flatpickr(textInput, {
            dateFormat: "d-m-Y",
            allowInput: true,
            onChange: function (selectedDates) {
                if (selectedDates.length) {
                    const isoDate = selectedDates[0].toISOString().split("T")[0];
                    hiddenInput.value = isoDate;

                    // Special case: Issued On → auto update Valid Until (+6 months)
                    if (hiddenId === "issuedOnInput") {
                        const newDate = addMonthsToDate(selectedDates[0], 6);
                        const validUntilText = document.getElementById("validUntilInputText");
                        const validUntilHidden = document.getElementById("validUntilInput");

                        validUntilHidden.value = newDate.toISOString().split("T")[0];
                        validUntilText.value = isoToDDMMYYYY(validUntilHidden.value);
                        if (validUntilText.inputmask) {
                            validUntilText.inputmask.setValue(validUntilText.value);
                        }
                    }
                } else {
                    hiddenInput.value = "";
                }
            }
        });

        // Inputmask
        const im = new window.Inputmask("99-99-9999", {
            placeholder: "__-__-____",
            showMaskOnHover: false,
            showMaskOnFocus: true,
            clearIncomplete: false
        });
        im.mask(textInput);

        // Sync hidden on typing
        textInput.addEventListener("input", () => {
            const parts = textInput.value.split("-");
            if (parts.length === 3) {
                const [dd, mm, yyyy] = parts;
                if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
                    hiddenInput.value = `${yyyy}-${mm}-${dd}`;
                }
            }
        });
    });
};

// Export the dateUtility function
export default dateUtility;