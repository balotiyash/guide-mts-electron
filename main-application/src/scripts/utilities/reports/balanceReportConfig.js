/**
 * File: src/scripts/utilities/reports/balanceReportConfig.js
 * Author: Yash Balotiya
 * Description: Configuration for Balance Report
 * Created on: 12/10/2025
 * Last Modified: 09/12/2025
 */

// Function to get host address from Electron main process
const getHostAddress = async () => {
    const hostAddress = await window.electronAPI.getHost();
    return hostAddress || 'localhost';
};

// Balance Report Configuration
export const balanceReportConfig = {
    reportType: 'balance',
    reportName: 'Balance Report',
    
    // API methods
    api: {
        // getData: () => window.balanceReportAPI.getAllBalances(),
        getData: async () => await fetch(`http://${await getHostAddress()}:3000/api/v1/reports/balances`).then(res => res.json()),
        showSaveDialog: (options) => window.balanceReportAPI.showSaveDialog(options),
        writeFile: (filePath, content) => window.balanceReportAPI.writeFile(filePath, content)
    },
    
    // Table columns configuration
    columns: [
        { key: 'serial', class: 'w5', title: 'Sr No' },
        { key: 'customer_id', class: 'w5', title: 'Customer ID' },
        { key: 'customer_name', class: 'w15', title: 'Customer Name', format: 'uppercase' },
        { key: 'mobile_number', class: 'w10', title: 'Mobile No' },
        { key: 'total_charged_amount', class: 'w10', title: 'Total Amount', format: 'currency' },
        { key: 'total_paid_amount', class: 'w10', title: 'Paid Amount', format: 'currency' },
        { key: 'balance_amount', class: 'w10', title: 'Balance', format: 'currency' },
        { key: 'last_payment_date', class: 'w10', title: 'Last Payment', format: 'date' },
        { key: 'work_description', class: 'w25', title: 'Work Description', format: 'uppercase' }
    ],
    
    // Search field configuration
    searchFields: {
        customerName: {
            field: 'customer_name',
            placeholder: 'Enter Customer Name',
            type: 'text'
        },
        mobileNumber: {
            field: 'mobile_number',
            placeholder: 'Enter Mobile Number',
            type: 'tel',
            maxLength: 10,
            validation: 'numeric'
        }
    },
    
    // Date filter field
    dateFilterField: 'registration_date',
    
    // CSV export configuration
    csvHeaders: [
        'SR_NO',
        'CUSTOMER_ID', 
        'CUSTOMER_NAME',
        'MOBILE_NUMBER',
        'TOTAL_CHARGED_AMOUNT',
        'TOTAL_PAID_AMOUNT',
        'BALANCE_AMOUNT',
        'LAST_PAYMENT_DATE',
        'WORK_DESCRIPTION'
    ],
    
    csvMapping: [
        { key: 'serial' },
        { key: 'customer_id' },
        { key: 'customer_name', format: 'uppercase' },
        { key: 'mobile_number' },
        { key: 'total_charged_amount', format: 'number' },
        { key: 'total_paid_amount', format: 'number' },
        { key: 'balance_amount', format: 'number' },
        { key: 'last_payment_date', format: 'date' },
        { key: 'work_description', format: 'uppercase' }
    ]
};