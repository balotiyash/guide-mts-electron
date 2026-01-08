/* File: src/scripts/utilities/dataEntryUtility.js
   Author: Yash Balotiya
   Description: Common utility functions for data entry operations.
   Created on: 21/09/2025
   Last Modified: 08/01/2026
*/

// Function to set vehicle names in the select dropdown
const setDropDownNames = async (value) => {
    let selectElement = null;
    let labelKey = "";
    let placeholder = "";

    // Fetch data based on the type (vehicles or instructors)
    // const data = await window.dataEntryAPI.getDropDownNames(value);
    const data = await fetch(`http://${await window.electronAPI.getHost()}:3000/api/v1/data-entry/dropdown-names/${value}`)
        .then(response => response.json())
        .catch(error => {
            console.error("Error fetching dropdown names:", error);
            return [];
        });

    // Set the select element and its properties based on the type
    if (value === "vehicles") {
        selectElement = document.getElementById("carSelect");
        labelKey = "vehicle_name";
        placeholder = "Select Vehicle";
    } else if (value === "instructors") {
        selectElement = document.getElementById("instructorSelect");
        labelKey = "instructor_name";
        placeholder = "Select Instructor";
    }

    // If no select element is found, exit the function
    if (!selectElement) return;

    // Default placeholder option
    const defaultOption = `<option value="" selected>${placeholder}</option>`;

    // Generate options from data
    const options = data.map(item => {
        return `<option value="${item.id}">${item[labelKey]}</option>`;
    }).join("");

    // Set the inner HTML of the select element
    selectElement.innerHTML = defaultOption + options;
};

// Fetching work descriptions for a user
const fetchWorkDescriptions = async (userId, onJobSelected) => {
    // Fetch work descriptions from the API
    // const workDescriptions = await window.dataEntryAPI.getWorkDescriptions(userId);
    const workDescriptions = await fetch(`http://${await window.electronAPI.getHost()}:3000/api/v1/data-entry/work-descriptions/${userId}`)
        .then(response => response.json())
        .catch(error => {
            console.error("Error fetching work descriptions:", error);
            return [];
        });

    // Populate the table with work descriptions
    const tbody = document.querySelector(".scrollDiv table tbody");

    // Clear existing rows
    tbody.innerHTML = "";

    if (workDescriptions.length === 0) {
        // Show single row for no records
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td colspan="4" class="tableCol" style="text-align: center; font-style: italic;">
                No past records found.
            </td>
        `;
        tbody.appendChild(tr);
        return null; // No work descriptions available
    }

    // References to inputs to fill
    const amountInput = document.getElementById("amountInput");
    const workDescriptionInput = document.getElementById("workDescriptionInput");

    // Loop through the data and insert rows
    workDescriptions.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="tableCol">${index + 1}</td>
            <td class="tableCol">${new Date(item.created_on).toLocaleDateString('en-GB')}</td>
            <td class="workCol">${item.work.toUpperCase()}</td>
            <td class="tableCol">₹${item.charged_amount}</td>
            <td class="deleteCol"><img src="../assets/svgs/trash-can-regular-full.svg" alt="Delete" class="deleteIcon" data-job-id="${item.id}"></td>
        `;

        // Add click event to fill inputs
        tr.addEventListener("click", () => {
            // Fill the form inputs
            amountInput.value = item.charged_amount;
            workDescriptionInput.value = item.work;
            
            // Remove active class from all rows
            tbody.querySelectorAll('tr').forEach(row => row.classList.remove('active-row'));
            // Add active class to clicked row
            tr.classList.add('active-row');

            // Notify the parent about the selected job
            if (onJobSelected && typeof onJobSelected === 'function') {
                onJobSelected(item.id);
            }
        });

        // Click event for delete icon
        const deleteIcon = tr.querySelector('.deleteIcon');
        deleteIcon.addEventListener("click", async (event) => {
            // Prevent the row click event
            event.stopPropagation();

            const jobId = deleteIcon.getAttribute("data-job-id");

            // Confirm deletion
            const response = await window.dialogBoxAPI.showDialogBox(
                "warning",
                "Confirm Deletion",
                "Are you sure you want to delete this job? This action cannot be undone.",
                ["Yes", "No"]
            );

            if (response === 0) { // If 'Yes' is clicked
                // const deleteResult = await window.dataEntryAPI.deleteJob(jobId);
                const deleteResult = await fetch(`http://${await window.electronAPI.getHost()}:3000/api/v1/data-entry/delete-job/${jobId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .catch(error => {
                    console.error("Error deleting job:", error);
                    return { status: "error" };
                });

                if (deleteResult.status === "success") {
                    tr.remove();
                } else {
                    await window.dialogBoxAPI.showDialogBox(
                        "error",
                        "Deletion Failed",
                        "Failed to delete the job. Please try again."
                    );
                }
            }
        });

        tbody.appendChild(tr);
    });

    // Return the first job ID as default (or null if no jobs)
    return workDescriptions.length > 0 ? workDescriptions[0].id : null;
};

// Compress and convert blob to Base64
const compressAndConvertImage = async (blob, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression
            canvas.toBlob(
                (compressedBlob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(",")[1]); // strip prefix
                    reader.onerror = reject;
                    reader.readAsDataURL(compressedBlob);
                },
                'image/jpeg',
                quality
            );
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
    });
};

// Convert blob to Base64 (without compression)
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]); // strip prefix
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Export the utility function
export {
    setDropDownNames,
    fetchWorkDescriptions,
    compressAndConvertImage,
    blobToBase64
};