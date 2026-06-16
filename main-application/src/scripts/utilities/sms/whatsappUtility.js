/* 
File: src/scripts/utilities/sms/whatsappUtility.js
Author: Krishna Rajput
Description: Utility functions for sending WhatsApp messages.
Created on: 15/06/2026
Last Modified: 16/06/2026
*/

const API_KEY =  'api' ; //api key for whatsapp

// Whatsapp message Utility Function
const sendWhatsApp = async (
    type,
    phoneNo,
    userName = 'Customer',
    amount = '0',
    date = ''
) => {
    // Validate input parameters
    if (!type || !phoneNo) {
        console.error('Type and phone number are required to send WhatsApp message.');
        return {
            success: false,
            message: 'Type and phone number are required.'
        };
    }
    
    try {
        let response = null;

        // Determine WhatsApp message type and send accordingly
        switch (type) {
            case 'welcome':
                response = await fetch(`https://www.fast2sms.com/dev/whatsapp?authorization=${API_KEY}&message_id=18250&phone_number_id=1032604983275259&numbers=${phoneNo}&variables_values=${userName.toUpperCase()}`, {
                    method: 'GET'
                });
                break;
            
            case 'paymentWithName':
                response = await fetch(`https://www.fast2sms.com/dev/whatsapp?authorization=${API_KEY}&message_id=18287&phone_number_id=1032604983275259&numbers=${phoneNo}&variables_values=${userName}|${amount}|${date}`,{
                  method: 'GET'
                });
                break;
            
            case 'paymentWithoutName':
                response =await fetch(`https://www.fast2sms.com/dev/whatsapp?authorization=${API_KEY}&message_id=18286&phone_number_id=1032604983275259&numbers=${phoneNo}`,{
                    method: 'GET'
                });
                break;                

            case 'paymentReminder':
                response = await fetch(`https://www.fast2sms.com/dev/whatsapp?authorization=${API_KEY}&message_id=18281&phone_number_id=1032604983275259&numbers=${phoneNo}&variables_values=${userName.toUpperCase()}|${amount}|${date}`, {
                    method: 'GET'
                });
                break;

            case 'birthdayReminder':
                response = await fetch(`https://www.fast2sms.com/dev/whatsapp?authorization=${API_KEY}&message_id=18277&phone_number_id=1032604983275259&numbers=${phoneNo}&variables_values=${userName.toUpperCase()}`, {
                    method: 'GET'
                });

                break;
                
            default:
                console.error('Invalid WhatsApp message type provided.');
                return {
                    success: false,
                    message: 'Invalid WhatsApp message type.'
                };
        }

        if (response && response.ok) {
            const result = await response.text();
            console.log('WhatsApp API Response:', result);
            return {
                success: true,
                message: `WhatsApp message sent successfully for ${type}.`,
                response: result
            };
        } else {
            throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
        }

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return {
            success: false,
            message: `Failed to send WhatsApp message: ${error.message}`
        };
    }
};


// Reusable WhatsApp function for different scenarios
const sendWhatsAppPrompt = async (whatsAppMessageType, phoneNumber, userName = 'Customer', amount = '0', date = '') => {
    try {
        // Define WhatsApp type descriptions for user prompts
        const whatsAppPrompts = {
            welcome: 'Send Welcome WhatsApp Message?',
            paymentWithName: 'Send Payment Confirmation WhatsApp Message?',
            paymentWithoutName: 'Send Payment Confirmation WhatsApp Message?',
            paymentReminder: 'Send Payment Reminder WhatsApp Message?',
            birthdayReminder: 'Send Birthday Reminder WhatsApp Message?'
        };

        const whatsAppSuccessMessages = {
            welcome: 'Welcome WhatsApp message has been sent successfully.',
            paymentWithName: 'Payment confirmation WhatsApp message has been sent successfully.',
            paymentWithoutName: 'Payment confirmation WhatsApp message has been sent successfully.',
            paymentReminder: 'Payment reminder WhatsApp message has been sent successfully.',
            birthdayReminder: 'Birthday reminder WhatsApp message has been sent successfully.'
            };

        // Show WhatsApp prompt
        const response = await window.dialogBoxAPI.showDialogBox(
            "question", 
            whatsAppPrompts[whatsAppMessageType] || 'Send WhatsApp Message?', 
            `Do you want to ${whatsAppPrompts[whatsAppMessageType] || 'send WhatsApp message'}`, 
            ['Yes', 'No']
        );

        // If user confirms, send WhatsApp message
        if (response === 0) {
            const whatsAppResponse = await sendWhatsApp(whatsAppMessageType, phoneNumber, userName, amount, date);
            if (whatsAppResponse.success) {
                await window.dialogBoxAPI.showDialogBox(
                    "info", 
                    "WhatsApp Message Sent", 
                    whatsAppSuccessMessages[whatsAppMessageType] || 'WhatsApp message has been sent successfully.'
                );
                return { success: true, sent: true };
            } else {
                await window.dialogBoxAPI.showDialogBox(
                    "error", 
                    "WhatsApp Message Failed", 
                    `Failed to send WhatsApp message: ${whatsAppResponse.message}`
                );
                return { success: false, sent: false, error: whatsAppResponse.message };
            }
        } else {
            // User chose not to send WhatsApp message
            return { success: true, sent: false };
        }
    } catch (error) {
        console.error('WhatsApp Error:', error);
        await window.dialogBoxAPI.showDialogBox(
            "error", 
            "WhatsApp Message Error", 
            "An error occurred while sending WhatsApp message."
        );
        return { success: false, sent: false, error: error.message };
    }
};

const sendPaymentWhatsAppWithChoice = async (
    mobile_number,
    customerName
) => {

    if (!mobile_number) {
        return {
            success: false,
            sent: false,
            error: 'No mobile number available'
        };
    }

    try {

        const choice =
            await window.dialogBoxAPI.showDialogBox(
                'question',
                'Send Payment WhatsApp Message?',
                'Do you want to send payment confirmation WhatsApp message?',
                ['With Name', 'Without Name', 'No WhatsApp Message']
            );

        if (choice === 0) {

            const whatsappResponse =
                await sendWhatsApp(
                    'paymentWithName',
                    mobile_number,
                    customerName
                );

            if (whatsappResponse.success) {

                await window.dialogBoxAPI.showDialogBox(
                    'info',
                    'WhatsApp Message Sent',
                    'Payment confirmation WhatsApp message has been sent successfully.'
                );

                return {
                    success: true,
                    sent: true
                };
            }

        } else if (choice === 1) {

            const whatsappResponse =
                await sendWhatsApp(
                    'paymentWithoutName',
                    mobile_number,
                    customerName
                );

            if (whatsappResponse.success) {

                await window.dialogBoxAPI.showDialogBox(
                    'info',
                    'WhatsApp Message Sent',
                    'Payment confirmation WhatsApp message has been sent successfully.'
                );

                return {
                    success: true,
                    sent: true
                };
            }

        } else {

            return {
                success: true,
                sent: false,
                message: 'User chose not to send WhatsApp message'
            };
        }

        await window.dialogBoxAPI.showDialogBox(
            'error',
            'WhatsApp Message Failed',
            'Failed to send payment confirmation WhatsApp message.'
        );

        return {
            success: false,
            sent: false
        };

    } catch (error) {

        console.error(
            'Error in sendPaymentWhatsAppWithChoice:',
            error
        );

        return {
            success: false,
            sent: false,
            error: error.message
        };
    }
};
export {sendWhatsApp, sendWhatsAppPrompt, sendPaymentWhatsAppWithChoice};