/**
 * File: src/scripts/renderer/data_entry_load_data.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to HELP load customer data into the form.
 * Created on: 31/08/2025
 * Last Modified: 22/09/2025
 */

// IMporting required modules & libraries
import { isoToDDMMYYYY } from '../shared.js';
import { resetImageInputs, setLabelImage, setupImageInputListeners } from '../utilities/dataEntry/dataLoadUtility.js';

// Fill the form with customer data using mobile number
const fillForm = (data, formElements, imageBlobs) => {
    const { customerIdInput, customerNameInput, dobInput, relationInput, carSelect, instructorSelect, addressInput, licenseInput, classInput, licenseInput2, classInput2, issuedOnInput, validUntilInput, mdlNoInput, mdlClassInput, mdlIssuedInput, mdlValidUntilInput, endorsementInput, endorsementDatedInput, endorsementValidityInput, vehicleNoInput, amountInput, workDescriptionInput } = formElements;

    // First, clear any existing images/blobs before loading new ones
    resetImageInputs(imageBlobs);

    // User ID
    customerIdInput.value = data.id || "";

    // Customer Photo & Signature
    // This part handles loading existing images from the DB
    const photoInputLabel = document.getElementById("photoInputLabel");
    const signatureInputLabel = document.getElementById("signatureInputLabel");

    if (data?.customer_image instanceof Uint8Array) {
        setLabelImage(data.customer_image, photoInputLabel, "customerImageInput", imageBlobs);
    }
    if (data?.customer_signature instanceof Uint8Array) {
        setLabelImage(data.customer_signature, signatureInputLabel, "customerSignatureInput", imageBlobs);
    }

    // Name
    customerNameInput.value = data.customer_name || "";

    // Date of Birth
    // dobInput.value = (data.customer_dob || "").substring(0, 10);
    // Fill visible input
    const dobText = document.getElementById("dobInputText");
    const dobHidden = document.getElementById("dobInput");

    // Convert backend ISO to DD-MM-YYYY for visible input
    dobText.value = isoToDDMMYYYY(data.customer_dob || "");

    // Keep hidden ISO input for backend submission
    dobHidden.value = (data.customer_dob || "").substring(0, 10);

    // Trigger Inputmask so placeholder/mask displays
    if (dobText.inputmask) {
        dobText.inputmask.setValue(dobText.value);
    }

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
    const issuedOnText = document.getElementById("issuedOnInputText");
    const issuedOnHidden = document.getElementById("issuedOnInput");
    issuedOnText.value = isoToDDMMYYYY(data.ll_issued_date || "");
    issuedOnHidden.value = (data.ll_issued_date || "").substring(0, 10);
    if (issuedOnText.inputmask) {
        issuedOnText.inputmask.setValue(issuedOnText.value);
    }

    // LL Expiry Date
    const validUntilText = document.getElementById("validUntilInputText");
    const validUntilHidden = document.getElementById("validUntilInput");
    validUntilText.value = isoToDDMMYYYY(data.ll_validity_date || "");
    validUntilHidden.value = (data.ll_validity_date || "").substring(0, 10);
    if (validUntilText.inputmask) {
        validUntilText.inputmask.setValue(validUntilText.value);
    }

    // MDL No
    mdlNoInput.value = data.mdl_no || "mh01 /";

    // MDL Class
    mdlClassInput.value = data.mdl_class || "";

    // MDL Issued Date
    const mdlIssuedText = document.getElementById("mdlIssuedInputText");
    const mdlIssuedHidden = document.getElementById("mdlIssuedInput");
    mdlIssuedText.value = isoToDDMMYYYY(data.mdl_issued_date || "");
    mdlIssuedHidden.value = (data.mdl_issued_date || "").substring(0, 10);
    if (mdlIssuedText.inputmask) {
        mdlIssuedText.inputmask.setValue(mdlIssuedText.value);
    }

    // MDL Expiry Date
    const mdlValidUntilText = document.getElementById("mdlValidUntilInputText");
    const mdlValidUntilHidden = document.getElementById("mdlValidUntilInput");
    mdlValidUntilText.value = isoToDDMMYYYY(data.mdl_validity_date || "");
    mdlValidUntilHidden.value = (data.mdl_validity_date || "").substring(0, 10);
    if (mdlValidUntilText.inputmask) {
        mdlValidUntilText.inputmask.setValue(mdlValidUntilText.value);
    }

    // Endorsement No
    endorsementInput.value = data.endorsement || "";

    // Endorsement Issued Date
    const endorsementDatedText = document.getElementById("endorsementDatedInputText");
    const endorsementDatedHidden = document.getElementById("endorsementDatedInput");
    endorsementDatedText.value = isoToDDMMYYYY(data.endorsement_date || "");
    endorsementDatedHidden.value = (data.endorsement_date || "").substring(0, 10);
    if (endorsementDatedText.inputmask) {
        endorsementDatedText.inputmask.setValue(endorsementDatedText.value);
    }

    // Endorsement Expiry Date
    const endorsementValidityText = document.getElementById("endorsementValidityInputText");
    const endorsementValidityHidden = document.getElementById("endorsementValidityInput");
    endorsementValidityText.value = isoToDDMMYYYY(data.endorsement_validity_date || "");
    endorsementValidityHidden.value = (data.endorsement_validity_date || "").substring(0, 10);
    if (endorsementValidityText.inputmask) {
        endorsementValidityText.inputmask.setValue(endorsementValidityText.value);
    }

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