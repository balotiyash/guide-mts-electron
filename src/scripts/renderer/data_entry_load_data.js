/** 
 * File: src/scripts/renderer/data_entry_load_data.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to HELP load customer data into the form.
 * Created on: 31/08/2025
 * Last Modified: 01/09/2025
*/

// Fill the form with customer data using mobile number
const fillForm = (data, formElements) => {
    const { customerIdInput, customerNameInput, dobInput, relationInput, carSelect, instructorSelect, addressInput, licenseInput, classInput, licenseInput2, classInput2, issuedOnInput, validUntilInput, mdlNoInput, mdlClassInput, mdlIssuedInput, mdlValidUntilInput, endorsementInput, endorsementDatedInput, endorsementValidityInput, vehicleNoInput } = formElements;

    // User ID
    customerIdInput.value = data.id || "";

    // Customer Photo & Signature
    handleImages(data);

    // Name
    customerNameInput.value = data.customer_name || "";

    // Date of Birth
    dobInput.value = (data.customer_dob || "").substring(0, 10);

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
    licenseInput.value = data.ll_no_1 || "";
    classInput.value = data.ll_class_1 || "";

    // LL No 2
    licenseInput2.value = data.ll_no_2 || "";
    classInput2.value = data.ll_class_2 || "";

    // LL Issued Date
    issuedOnInput.value = (data.ll_issued_date || "").substring(0, 10);

    // LL Expiry Date
    validUntilInput.value = (data.ll_validity_date || "").substring(0, 10);

    // MDL No
    mdlNoInput.value = data.mdl_no || "";

    // MDL Class
    mdlClassInput.value = data.mdl_class || "";

    // MDL Issued Date
    mdlIssuedInput.value = (data.mdl_issued_date || "").substring(0, 10);

    // MDL Expiry Date
    mdlValidUntilInput.value = (data.mdl_validity_date || "").substring(0, 10);

    // Endorsement No
    endorsementInput.value = data.endorsement || "";

    // Endorsement Issued Date
    endorsementDatedInput.value = (data.endorsement_date || "").substring(0, 10);

    // Endorsement Expiry Date
    endorsementValidityInput.value = (data.endorsement_validity_date || "").substring(0, 10);

    // Vehicle No
    vehicleNoInput.value = data.customer_vehicle_no || "";

    // Charged Amount
    amountInput.value = "";
    workDescriptionInput.value = "";
};

// Handle image uploads
const handleImages = (data) => {
    // Photo & Signature Inputs
    const photoInput = document.getElementById("photoInput");
    const photoInputLabel = document.getElementById("photoInputLabel");
    const signatureInput = document.getElementById("signatureInput");
    const signatureInputLabel = document.getElementById("signatureInputLabel");

    // From DB: Set existing photo/signature if available
    if (data?.customer_image instanceof Uint8Array) {
        setLabelImage(data.customer_image, photoInputLabel);
    }

    if (data?.customer_signature instanceof Uint8Array) {
        setLabelImage(data.customer_signature, signatureInputLabel);
    }

    // On new photo upload
    photoInput?.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (file) {
            setLabelImage(file, photoInputLabel);
        }
    });

    // On new signature upload
    signatureInput?.addEventListener("change", () => {
        const file = signatureInput.files[0];
        if (file) {
            setLabelImage(file, signatureInputLabel);
        }
    });
};

// Set label background image from either a File or a Uint8Array (Blob).
const setLabelImage = (source, label) => {
    let imageUrl;

    // If source is a Uint8Array, create a Blob URL
    if (source instanceof Uint8Array) {
        const blob = new Blob([source], { type: "image/jpeg" });
        imageUrl = URL.createObjectURL(blob);
    } else if (source instanceof File) {
        imageUrl = URL.createObjectURL(source);
    }

    // Set the label background image
    if (imageUrl) {
        label.style.backgroundImage = `url(${imageUrl})`;
        label.classList.add("withImage");
    }
};

// Reset image inputs
const resetImageInputs = () => {
    const photoInput = document.getElementById("photoInput");
    const photoInputLabel = document.getElementById("photoInputLabel");
    const signatureInput = document.getElementById("signatureInput");
    const signatureInputLabel = document.getElementById("signatureInputLabel");

    // Clear file inputs
    photoInput.value = "";
    signatureInput.value = "";

    // Reset photo label
    photoInputLabel.style.backgroundImage = "";
    photoInputLabel.classList.remove("withImage");

    // Reset signature label
    signatureInputLabel.style.backgroundImage = "";
    signatureInputLabel.classList.remove("withImage");
};

// Export functions
export {
    fillForm,
    resetImageInputs
};