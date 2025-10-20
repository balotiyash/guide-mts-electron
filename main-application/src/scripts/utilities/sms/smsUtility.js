/** 
 * File: src/scripts/utilities/sms/smsUtility.js
 * Author: Yash Balotiya
 * Description: Utility function to send SMS notifications for various events.
 * Created on: 20/10/2025
 * Last Modified: 20/10/2025
*/

// SMS Utility Function
const sendSMS = async (
    type,
    phoneNo,
    userName = 'Customer',
    amount = '0',
    date = ''
) => {
    // Validate input parameters
    if (!type || !phoneNo) {
        console.error('Type and phone number are required to send SMS.');
        return {
            success: false,
            message: 'Type and phone number are required.'
        };
    }

    try {
        let response = null;

        // Determine SMS type and send accordingly
        switch (type) {
            case 'welcome':
                response = await fetch(`http://www.smsjust.com/blank/sms/user/urlsms.php?username=aaminkhan&pass=gUIDE7897123@&senderid=GUIDEM&dest_mobileno=${phoneNo}&message=WELCOME %26 THANK YOU FOR JOINING GUIDE MOTOR TRAINING SCHOOL DEAR ${userName.toUpperCase()} NOTE: - LEARNING LICENSE, TRAINING %26 FEES. WILL BE VALID FOR SIX MONTHS ONLY. MONEY ONCE DEPOSITED WILL NOT BE REFUNDED/ADJUSTED. FOR ANY QUERIES / DETAILS CONTACT 022-24072677 / 022-24074237. FROM GUIDE M.T.S.&dltentityid=1601100000000009321&dlttempid=1607100000000299940&response=Y`, {
                    method: 'GET'
                });
                break;
            
            case 'paymentWithName':
                response = await fetch(`http://www.smsjust.com/blank/sms/user/urlsms.php?username=aaminkhan&pass=gUIDE7897123@&senderid=GUIDEM&dest_mobileno=${phoneNo}&message=THANK YOU FOR THE PAYMENT DEAR ${userName.toUpperCase()} NOTE: - LEARNING LICENSE, TRAINING %26 FEES.WILL BE VALID FOR SIX MONTHS ONLY. MONEY ONCE DEPOSITED WILL NOT BE REFUNDED/ADJUSTED. FOR ANY QUERIES / DETAILS CONTACT – 022-24072677 / 022-24074237. FROM GUIDE M.T.S.&dltentityid=1601100000000009321&dlttempid=1607100000000299941&response=Y`, {
                    method: 'GET'
                });
                break;
                
            case 'paymentWithoutName':
                response = await fetch(`http://www.smsjust.com/blank/sms/user/urlsms.php?username=aaminkhan&pass=gUIDE7897123@&senderid=GUIDEM&dest_mobileno=${phoneNo}&message=DEAR CUSTOMER THANKS FOR THE PAYMENT. MONEY ONCE DEPOSITED WILL NOT BE REFUNDED / ADJUSTED. WE APPRECIATE BEING ABLE TO SERVE YOU. THANK YOU FOR CHOOSING GUIDE MOTORS FOR YOUR DRIVING LICENCE / VEHICLE RELATED RTO WORK. THE PROCESS OF YOUR RTO WORK WILL BE COMPLETED SOON. FOR ANY QUERIES / DETAILS CONTACT 022-24072677/022-24074237. FROM GUIDE M.T.S.&dltentityid=1601100000000009321&dlttempid=1607100000000355440&response=Y`, {
                    method: 'GET'
                });
                break;

            case 'paymentReminder':
                response = await fetch(`http://www.smsjust.com/blank/sms/user/urlsms.php?username=aaminkhan&pass=gUIDE7897123@&senderid=GUIDEM&dest_mobileno=${phoneNo}&message=DEAR ${userName.toUpperCase()} YOU ARE HEREBY REQUESTED TO PAY YOUR BALANCE AMOUNT Rs. ${amount} ON OR BEFORE ${date} AT OUR OFFICE. SO THAT WE CAN PROCEED WITH YOUR FURTHER PROCESS. NOTE: - LEARNING LICENSE, TRAINING %26 FEES WILL BE VALID FOR SIX MONTHS ONLY. MONEY ONCE DEPOSITED WILL NOT BE REFUNDED/ADJUSTED. FOR ANY QUERIES / DETAILS CONTACT – 022-24072677 / 022-24074237. FROM GUIDE M.T.S.&dltentityid=1601100000000009321&dlttempid=1607100000000299989&response=Y`, {
                    method: 'GET'
                });
                break;

            case 'birthdayReminder':
                response = await fetch(`http://www.smsjust.com/blank/sms/user/urlsms.php?username=aaminkhan&pass=gUIDE7897123@&senderid=GUIDEM&dest_mobileno=${phoneNo}&message=WISHING YOU A VERY HAPPY BIRTHDAY DEAR ${userName.toUpperCase()} FROM GUIDE MOTOR TRAINING SCHOOL. FOR ANY QUERIES / DETAILS CONTACT – 022-24072677 / 022-24074237.&dltentityid=1601100000000009321&dlttempid=1607100000000299938&response=Y`, {
                    method: 'GET'
                });
                break;
                
            default:
                console.error('Invalid SMS type provided.');
                return {
                    success: false,
                    message: 'Invalid SMS type.'
                };
        }

        if (response && response.ok) {
            const result = await response.text();
            console.log('SMS API Response:', result);
            return {
                success: true,
                message: `SMS sent successfully for ${type}.`,
                response: result
            };
        } else {
            throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
        }

    } catch (error) {
        console.error('Error sending SMS:', error);
        return {
            success: false,
            message: `Failed to send SMS: ${error.message}`
        };
    }
};

// Reusable SMS function for different scenarios
const sendSMSPrompt = async (smsType, phoneNumber, userName = 'Customer', amount = '0', date = '') => {
    try {
        // Define SMS type descriptions for user prompts
        const smsPrompts = {
            'welcome': 'Send Welcome SMS?',
            'paymentReminder': 'Send Payment Reminder SMS?',
            'birthdayReminder': 'Send Birthday Reminder SMS?'
        };

        const smsSuccessMessages = {
            'welcome': 'Welcome SMS has been sent successfully.',
            'paymentReminder': 'Payment reminder SMS has been sent successfully.',
            'birthdayReminder': 'Birthday reminder SMS has been sent successfully.'
        };

        // Show SMS prompt
        const response = await window.dialogBoxAPI.showDialogBox(
            "question", 
            smsPrompts[smsType] || 'Send SMS?', 
            `Do you want to ${smsPrompts[smsType] || 'send SMS'}`, 
            ['Yes', 'No']
        );

        // If user confirms, send SMS
        if (response === 0) {
            const smsResponse = await sendSMS(smsType, phoneNumber, userName, amount, date);
            if (smsResponse.success) {
                await window.dialogBoxAPI.showDialogBox(
                    "info", 
                    "SMS Sent", 
                    smsSuccessMessages[smsType] || 'SMS has been sent successfully.'
                );
                return { success: true, sent: true };
            } else {
                await window.dialogBoxAPI.showDialogBox(
                    "error", 
                    "SMS Failed", 
                    `Failed to send SMS: ${smsResponse.message}`
                );
                return { success: false, sent: false, error: smsResponse.message };
            }
        } else {
            // User chose not to send SMS
            return { success: true, sent: false };
        }
    } catch (error) {
        console.error('SMS Error:', error);
        await window.dialogBoxAPI.showDialogBox(
            "error", 
            "SMS Error", 
            "An error occurred while sending SMS."
        );
        return { success: false, sent: false, error: error.message };
    }
};

// Function to handle payment SMS with user choice
const sendPaymentSMSWithChoice = async (mobile_number, customerName) => {
    if (!mobile_number) {
        return { success: false, sent: false, error: 'No mobile number available' };
    }

    try {
        // Show SMS type selection prompt
        const smsChoice = await window.dialogBoxAPI.showDialogBox(
            'question',
            'Send Payment SMS?',
            'Do you want to send payment confirmation SMS?',
            ['With Name', 'Without Name', 'No SMS']
        );

        // Send SMS based on user choice
        if (smsChoice === 0) {
            // With Name
            const smsResponse = await sendSMS("paymentWithName", mobile_number, customerName);
            if (smsResponse.success) {
                await window.dialogBoxAPI.showDialogBox("info", "SMS Sent", "Payment confirmation SMS has been sent successfully.");
                return { success: true, sent: true };
            } else {
                await window.dialogBoxAPI.showDialogBox("error", "SMS Failed", "Failed to send payment confirmation SMS.");
                return { success: false, sent: false, error: smsResponse.error };
            }
        } else if (smsChoice === 1) {
            // Without Name
            const smsResponse = await sendSMS("paymentWithoutName", mobile_number, customerName);
            if (smsResponse.success) {
                await window.dialogBoxAPI.showDialogBox("info", "SMS Sent", "Payment confirmation SMS has been sent successfully.");
                return { success: true, sent: true };
            } else {
                await window.dialogBoxAPI.showDialogBox("error", "SMS Failed", "Failed to send payment confirmation SMS.");
                return { success: false, sent: false, error: smsResponse.error };
            }
        } else {
            // User chose "No SMS"
            return { success: true, sent: false, message: 'User chose not to send SMS' };
        }
    } catch (error) {
        console.error('Error in sendPaymentSMSWithChoice:', error);
        return { success: false, sent: false, error: error.message };
    }
};

// Export the sendSMS function
export { sendSMSPrompt, sendSMS, sendPaymentSMSWithChoice };