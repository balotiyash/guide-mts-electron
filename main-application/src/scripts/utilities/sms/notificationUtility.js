/* File: src/scripts/utilities/sms/notificationUtility.js
   Author: Krishna Rajput
   Description: whatsapp and sms messaging features combined.
   Created on: 15/06/2026
   Last Modified: 16/06/2026
*/

import {sendSMSPrompt,sendPaymentSMS,sendSMS} from './smsUtility.js';

import {sendWhatsAppPrompt,  sendPaymentWhatsApp,sendWhatsApp} from './whatsappUtility.js';

const sendNotificationPrompt = async (
    type,
    phoneNumber,
    userName = 'Customer',
    amount = '0',
    date = ''
) => {

    try {

        const choice =
            await window.dialogBoxAPI.showDialogBox(
                'question',
                'Send Notification',
                'Choose how you want to notify the customer.',
                ['SMS', 'WhatsApp', 'Both', 'Cancel']
            );

        switch (choice) {

            case 0:

                return await sendSMS( //it was sendSMSPrompt before, changed to sendSMS for direct sending without extra prompt
                    type,
                    phoneNumber,
                    userName,
                    amount,
                    date
                );

            case 1:

                return await sendWhatsApp(//it was sendWhatsAppPrompt before, changed to sendWhatsApp for direct sending without extra prompt
                    type,
                    phoneNumber,
                    userName,
                    amount,
                    date
                );

            case 2:

                const smsResult =
                    await sendSMS(
                        type,
                        phoneNumber,
                        userName,
                        amount,
                        date
                    );

                const whatsappResult =
                    await sendWhatsApp(
                        type,
                        phoneNumber,
                        userName,
                        amount,
                        date
                    );

                return {
                    success:
                        smsResult.success &&
                        whatsappResult.success,
                    smsResult,
                    whatsappResult
                };

            default:

                return {
                    success: false,
                    cancelled: true
                };
        }

    } catch (error) {

        console.error(
            'Notification Error:',
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
};



const sendPaymentNotificationWithChoice = async (
    mobile_number,
    customerName
) => {

    const methodChoice =
        await window.dialogBoxAPI.showDialogBox(
            'question',
            'Send Notification',
            'Choose notification method',
            ['SMS', 'WhatsApp', 'Both', 'Cancel']
        );

    if (methodChoice === 3) {
        return {
            success: false,
            cancelled: true
        };
    }

    const templateChoice =
        await window.dialogBoxAPI.showDialogBox(
            'question',
            'Payment Notification',
            'Choose message type',
            ['With Name', 'Without Name', 'Cancel']
        );

    if (templateChoice === 2) {
        return {
            success: false,
            cancelled: true
        };
    }

    const withName = templateChoice === 0;

    // SMS
    if (methodChoice === 0) {
        return await sendPaymentSMS(
            mobile_number,
            customerName,
            withName
        );
    }

    // WhatsApp
    if (methodChoice === 1) {
        return await sendPaymentWhatsApp(
            mobile_number,
            customerName,
            withName
        );
    }

    // Both
    if (methodChoice === 2) {

        const smsResult =
            await sendPaymentSMS(
                mobile_number,
                customerName,
                withName
            );

        const whatsappResult =
            await sendPaymentWhatsApp(
                mobile_number,
                customerName,
                withName
            );

        return {
            success:
                smsResult.success &&
                whatsappResult.success,
            smsResult,
            whatsappResult
        };
    }

    return {
        success: false,
        cancelled: true
    };
};

export {
    sendNotificationPrompt,
    sendPaymentNotificationWithChoice
};