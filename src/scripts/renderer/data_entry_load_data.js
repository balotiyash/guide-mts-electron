/**
 * File: src/scripts/renderer/data_entry_load_data.js
 * Author: Yash Balotiya
 * Description: This file contains JS code to HELP load customer data into the form.
 * Created on: 31/08/2025
 * Last Modified: 15/09/2025
 */

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
    licenseInput.value = data.ll_no_1 || "mh01 /";
    classInput.value = data.ll_class_1 || "";

    // LL No 2
    licenseInput2.value = data.ll_no_2 || "mh01 /";
    classInput2.value = data.ll_class_2 || "";

    // LL Issued Date
    issuedOnInput.value = (data.ll_issued_date || "").substring(0, 10);

    // LL Expiry Date
    validUntilInput.value = (data.ll_validity_date || "").substring(0, 10);

    // MDL No
    mdlNoInput.value = data.mdl_no || "mh01 /";

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

    // Charged Amount & Work Description (These are not part of the main customer data, so they should be reset)
    amountInput.value = "";
    workDescriptionInput.value = "";
};

// NEW: Function to set up event listeners for image inputs
const setupImageInputListeners = (imageBlobs) => {
    const photoInput = document.getElementById("photoInput");
    const photoInputLabel = document.getElementById("photoInputLabel");
    const signatureInput = document.getElementById("signatureInput");
    const signatureInputLabel = document.getElementById("signatureInputLabel");

    // On new photo upload
    photoInput?.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (file) {
            setLabelImage(file, photoInputLabel, "customerImageInput", imageBlobs);
        } else {
            // If user clears selection, reset the image
            setLabelImage(null, photoInputLabel, "customerImageInput", imageBlobs);
        }
    });

    // On new signature upload
    signatureInput?.addEventListener("change", () => {
        const file = signatureInput.files[0];
        if (file) {
            setLabelImage(file, signatureInputLabel, "customerSignatureInput", imageBlobs);
        } else {
            // If user clears selection, reset the image
            setLabelImage(null, signatureInputLabel, "customerSignatureInput", imageBlobs);
        }
    });
};


// Set label background image + store blob
const setLabelImage = (source, label, blobKey, imageBlobs) => {
    let imageUrl;
    let blob = null; // Initialize blob to null

    // Clear previous image and blob if no source is provided (e.g., clearing selection)
    if (!source) {
        label.style.backgroundImage = "";
        label.classList.remove("withImage");
        imageBlobs[blobKey] = null; // Clear the blob in the storage
        return; // Exit early
    }

    if (source instanceof Uint8Array) {
        blob = new Blob([source], { type: "image/jpeg" }); // Assuming JPEG for DB images
        imageUrl = URL.createObjectURL(blob);
    } else if (source instanceof File) {
        blob = source;
        imageUrl = URL.createObjectURL(source);
    }

    if (imageUrl) {
        label.style.backgroundImage = `url(${imageUrl})`;
        label.classList.add("withImage");
        imageBlobs[blobKey] = blob; // Store the blob
    }
};

// Convert blob to Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]); // strip prefix
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Reset image inputs and their associated blobs
const resetImageInputs = (imageBlobs) => {
    const photoInput = document.getElementById("photoInput");
    const photoInputLabel = document.getElementById("photoInputLabel");
    const signatureInput = document.getElementById("signatureInput");
    const signatureInputLabel = document.getElementById("signatureInputLabel");

    // Clear file inputs
    if (photoInput) photoInput.value = "";
    if (signatureInput) signatureInput.value = "";

    // Reset photo label and blob
    if (photoInputLabel) {
        photoInputLabel.style.backgroundImage = "";
        photoInputLabel.classList.remove("withImage");
        imageBlobs.customerImageInput = null;
    }

    // Reset signature label and blob
    if (signatureInputLabel) {
        signatureInputLabel.style.backgroundImage = "";
        signatureInputLabel.classList.remove("withImage");
        imageBlobs.customerSignatureInput = null;
    }
};

// Export functions
export {
    fillForm,
    blobToBase64,
    resetImageInputs,
    setupImageInputListeners // Export the new function
};