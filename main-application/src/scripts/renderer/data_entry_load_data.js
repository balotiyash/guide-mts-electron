/**
 * File: src/scripts/renderer/data_entry_load_data.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to HELP load customer data into the form.
 * Created on: 31/08/2025
 * Last Modified: 09/12/2025
 */

// IMporting required modules & libraries
import { isoToDDMMYYYY, sanitizeDate } from '../shared.js';
import { resetImageInputs, setLabelImage, setupImageInputListeners } from '../utilities/dataEntry/dataLoadUtility.js';

// Helper function to safely load and format date
const loadDateField = (dateValue, textInputId, hiddenInputId) => {
    const textInput = document.getElementById(textInputId);
    const hiddenInput = document.getElementById(hiddenInputId);
    
    if (!textInput || !hiddenInput) {
        console.warn(`Date field elements not found: ${textInputId}, ${hiddenInputId}`);
        return;
    }
    
    // Sanitize and validate the date
    const sanitizedDate = sanitizeDate(dateValue);
    
    if (sanitizedDate) {
        // Set the hidden input (ISO format for backend)
        hiddenInput.value = sanitizedDate;
        
        // Convert to DD-MM-YYYY for display
        const displayDate = isoToDDMMYYYY(sanitizedDate);
        textInput.value = displayDate;
        
        // Trigger Inputmask if available
        if (textInput.inputmask) {
            textInput.inputmask.setValue(displayDate);
        }
    } else {
        // Clear both inputs if date is invalid
        textInput.value = "";
        hiddenInput.value = "";
        
        if (textInput.inputmask) {
            textInput.inputmask.setValue("");
        }
    }
};

// Fill the form with customer data using mobile number
const fillForm = (data, formElements, imageBlobs) => {
    console.log("fillForm called with data:", data); // Debug log
    
    const { customerIdInput, customerNameInput, dobInput, relationInput, carSelect, instructorSelect, addressInput, licenseInput, classInput, licenseInput2, classInput2, issuedOnInput, validUntilInput, mdlNoInput, mdlClassInput, mdlIssuedInput, mdlValidUntilInput, endorsementInput, endorsementDatedInput, endorsementValidityInput, vehicleNoInput, amountInput, workDescriptionInput } = formElements;

    // First, clear any existing images/blobs before loading new ones
    resetImageInputs(imageBlobs);

    // User ID
    customerIdInput.value = data.id || "";

    // Customer Photo & Signature
    // This part handles loading existing images from the DB
    const photoInputLabel = document.getElementById("photoInputLabel");
    const signatureInputLabel = document.getElementById("signatureInputLabel");

    // Convert Buffer-like objects to Uint8Array if needed
    const convertToUint8Array = (data) => {
        if (!data) return null;
        if (data instanceof Uint8Array) return data;
        // If it's a buffer-like object (serialized from HTTP response)
        if (data.type === 'Buffer' && Array.isArray(data.data)) {
            return new Uint8Array(data.data);
        }
        // If it's an object with numeric keys
        if (typeof data === 'object' && !Array.isArray(data)) {
            const values = Object.values(data);
            if (values.length > 0 && typeof values[0] === 'number') {
                return new Uint8Array(values);
            }
        }
        return null;
    };

    const customerImage = convertToUint8Array(data?.customer_image);
    const customerSignature = convertToUint8Array(data?.customer_signature);

    if (customerImage) {
        setLabelImage(customerImage, photoInputLabel, "customerImageInput", imageBlobs);
    }
    if (customerSignature) {
        setLabelImage(customerSignature, signatureInputLabel, "customerSignatureInput", imageBlobs);
    }

    // OLD CODE: Direct Uint8Array check (works with IPC but not with HTTP API)
    // if (data?.customer_image instanceof Uint8Array) {
    //     setLabelImage(data.customer_image, photoInputLabel, "customerImageInput", imageBlobs);
    // }
    // if (data?.customer_signature instanceof Uint8Array) {
    //     setLabelImage(data.customer_signature, signatureInputLabel, "customerSignatureInput", imageBlobs);
    // }

    // Name
    customerNameInput.value = data.customer_name || "";

    // Date of Birth
    loadDateField(data.customer_dob, "dobInputText", "dobInput");

    // Relation Name
    relationInput.value = data.relation_name || "";

    // Car
    if (data.vehicle_id == 1) {
        carSelect.value = "";
    } else {
        carSelect.value = data.vehicle_id || "";
    }

    // Instructor
    if (data.instructor_id == 1) {
        instructorSelect.value = "";
    } else {
        instructorSelect.value = data.instructor_id || "";
    }

    // Address
    addressInput.value = data.address || "";

    // LL No 1
    licenseInput.value = data.ll_no_1 || "mh01 /";
    classInput.value = data.ll_class_1 || "";

    // LL No 2
    licenseInput2.value = data.ll_no_2 || "mh01 /";
    classInput2.value = data.ll_class_2 || "";

    // LL Issued Date
    loadDateField(data.ll_issued_date, "issuedOnInputText", "issuedOnInput");

    // LL Expiry Date
    loadDateField(data.ll_validity_date, "validUntilInputText", "validUntilInput");

    // MDL No
    mdlNoInput.value = data.mdl_no || "mh01 /";

    // MDL Class
    mdlClassInput.value = data.mdl_class || "";

    // MDL Issued Date
    loadDateField(data.mdl_issued_date, "mdlIssuedInputText", "mdlIssuedInput");

    // MDL Expiry Date
    loadDateField(data.mdl_validity_date, "mdlValidUntilInputText", "mdlValidUntilInput");

    // Endorsement No
    endorsementInput.value = data.endorsement || "";

    // Endorsement Issued Date
    loadDateField(data.endorsement_date, "endorsementDatedInputText", "endorsementDatedInput");

    // Endorsement Expiry Date
    loadDateField(data.endorsement_validity_date, "endorsementValidityInputText", "endorsementValidityInput");

    // Vehicle No
    vehicleNoInput.value = data.customer_vehicle_no || "";

    // Charged Amount & Work Description (These are not part of the main customer data, so they should be reset)
    amountInput.value = "";
    workDescriptionInput.value = "";
};

// Export functions
export {
    fillForm,
    resetImageInputs,
    setupImageInputListeners
};