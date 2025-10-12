/**
 * File: src/scripts/utilities/reports/collectionReportConfig.js
 * Author: Yash Balotiya
 * Description: Configuration for Collection Report
 * Created on: 12/10/2025
 * Last Modified: 12/10/2025
 */

export const collectionReportConfig = {
    reportType: 'collection',
    reportName: 'Collection Report',
    
    // API methods
    api: {
        getData: () => window.collectionReportAPI.getAllCollections(),
        showSaveDialog: (options) => window.collectionReportAPI.showSaveDialog(options),
        writeFile: (filePath, content) => window.collectionReportAPI.writeFile(filePath, content)
    },
    
    // Table columns configuration
    columns: [
        { key: 'serial', class: 'w5', title: 'Sr No' },
        { key: 'customer_id', class: 'w5', title: 'ID' },
        { key: 'customer_name', class: 'w25', title: 'Name', format: 'uppercase' },
        { key: 'mobile_number', class: 'w10', title: 'Mobile Number' },
        { key: 'payment_date', class: 'w10', title: 'Payment Date', format: 'date' },
        { key: 'amount_paid', class: 'w10', title: 'Amount Paid', format: 'currency' },
        { key: 'payment_mode', class: 'w10', title: 'Mode of Payment', format: 'uppercase' },
        { key: 'work_description', class: 'w25', title: 'Job', format: 'uppercase' }
    ],
    
    // Search field configuration
    searchFields: {
        customerId: {
            field: 'customer_id',
            placeholder: 'Enter Customer ID',
            type: 'text'
        },
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
        },
        paymentMethod: {
            field: 'payment_mode',
            placeholder: 'Enter Payment Method (Cash/Online/Card)',
            type: 'text'
        }
    },
    
    // Date filter field
    dateFilterField: 'payment_date',
    
    // CSV export configuration
    csvHeaders: [
        'SR_NO',
        'CUSTOMER_ID',
        'CUSTOMER_NAME',
        'MOBILE_NUMBER',
        'PAYMENT_DATE',
        'AMOUNT_PAID',
        'MODE_OF_PAYMENT',
        'JOB'
    ],
    
    csvMapping: [
        { key: 'serial' },
        { key: 'customer_id' },
        { key: 'customer_name', format: 'uppercase' },
        { key: 'mobile_number' },
        { key: 'payment_date', format: 'date' },
        { key: 'amount_paid', format: 'number' },
        { key: 'payment_mode', format: 'uppercase' },
        { key: 'work_description', format: 'uppercase' }
    ]
};