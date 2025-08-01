/** 
 * File: menu.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Menu template for Electron application.
 * Created on: 01/08/2025
 * Last Modified: 01/08/2025
*/

// Menu template for the application
const path = require('path');
const { app } = require('electron');

function createMenuTemplate(win) {
    return [
        {
            label: 'Master',
            submenu: [
                {
                    label: 'Customer Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/data_entry.html'));
                    },
                },
                {
                    label: 'Master Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/master_regs.html'));
                    },
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: 'Payments',
            submenu: [
                {
                    label: 'Receive Payment',
                    click: () => {
                        console.log('Receive Payment clicked');
                    },
                },
            ],
        },
        {
            label: 'Reports',
            submenu: [
                {
                    label: 'Customer Report',
                    click: () => {
                        console.log('Customer Report clicked');
                    },
                },
            ],
        },
        {
            label: 'Form-14',
            submenu: [
                {
                    label: 'Generate Form',
                    click: () => {
                        console.log('Generate Form clicked');
                    },
                },
            ],
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Developer Tools',
                    click: () => {
                        win.webContents.openDevTools();
                    },
                },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        console.log('About clicked');
                    },
                },
            ],
        },
    ];
}

module.exports = createMenuTemplate;
