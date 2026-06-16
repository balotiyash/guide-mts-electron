/* File: src/scripts/utilities/sms/notificationUtility.js
   Author: Krishna Rajput
   Description: whatsapp and sms messaging features combined.
   Created on: 15/06/2026
   Last Modified: 16/06/2026
*/

import {sendSMSPrompt,sendPaymentSMSWithChoice,sendSMS} from './smsUtility.js';

import {sendWhatsAppPrompt,  sendPaymentWhatsAppWithChoice,sendWhatsApp} from './whatsappUtility.js';

const sendNotificationPrompt = async (
    type,
    phoneNumber,
    userName = 'Customer',
    amount = '0',
    date = ''
) => {
    console.log(
        "SEND NOTIFICATION PROMPT CALLED"
    );

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

                return await sendWhatsAppPrompt(
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

    if (methodChoice === 0) {
        return await sendPaymentSMSWithChoice(
            mobile_number,
            customerName
        );
    }

    if (methodChoice === 1) {
        return await sendPaymentWhatsAppWithChoice(
            mobile_number,
            customerName
        );
    }

    if (methodChoice === 2) {

        // SMS choice
        await sendPaymentSMSWithChoice(
            mobile_number,
            customerName
        );

        // WhatsApp choice
        await sendPaymentWhatsAppWithChoice(
            mobile_number,
            customerName
        );

        return {
            success: true
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