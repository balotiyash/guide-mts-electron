/**
 * File: src/scripts/utilities/dataEntry/dataLoadUtility.js
 * Author: Yash Balotiya
 * Description: This file contains utility functions to handle image inputs for data entry forms.
 * Created on: 22/09/2025
 * Last Modified: 22/09/2025
 */

// NEW: Function to set up event listeners for image inputs
const setupImageInputListeners = (imageBlobs) => {
    // Get input elements and their labels
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

// Reset image inputs and their associated blobs
const resetImageInputs = (imageBlobs) => {
    // Get input elements and their labels
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

// Exporting functions for use in other modules
export {
    setLabelImage,
    resetImageInputs,
    setupImageInputListeners
};