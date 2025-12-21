/** 
 * File: src/scripts/utilities/dashboard/clientServerUtility.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Utility functions for client-server architecture setup in the dashboard.
 * Created on: 08/12/2025
 * Last Modified: 21/12/2025
*/

// Function to check client-server information
const checkClientServerInfo = async () => {
    // Getting host address via IPC
    const hostAddress = await window.electronAPI.getHost();

    // If host address is not set, prompt user to set it
    if (hostAddress === undefined || hostAddress === null || hostAddress === '') {
        await setHostAddress();
    }
};

// Function to set host address based on user choice
const setHostAddress = async () => {
    // Prompting user to choose between Client and Server architecture
    let response = await window.dialogBoxAPI.showDialogBox(
        'question',
        'Architecture Type',
        'Please specify whether this installation is for Client-Server or Standalone Server architecture.',
        ['Client-Server', 'Standalone Server']
    );

    // If user chooses Client, open client setup window; if Server, set host to localhost
    if (response === 0) {
        window.electronAPI.openClientSetup();
    } else if (response === 1) {
        await window.electronAPI.setHost('localhost');
    }
};

// Exporting the functions
export { checkClientServerInfo, setHostAddress };