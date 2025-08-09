/** 
 * File: menu.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Menu template for Electron application.
 * Created on: 01/08/2025
 * Last Modified: 09/08/2025
*/

// Menu template for the application
const path = require('path');
const { app } = require('electron');

function createMenuTemplate(win) {
    // Check if the platform is macOS to adjust menu items accordingly
    const isMac = process.platform === 'darwin';

    return [
        {
            label: 'Master',
            submenu: [
                {
                    label: 'Dashboard',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/dashboard.html'));
                    },
                },
                {
                    label: 'Customer Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/data_entry.html'));
                    },
                },
                {
                    label: 'Master Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/master_entry.html'));
                    },
                },
                {
                    label: 'Car Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/car_entry.html'));
                    },
                },
                {
                    label: 'Fuel Entry',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/fuel_entry.html'));
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
                {
                    label: 'Logout',
                    click: () => {
                        win.loadFile(path.join(__dirname, 'src/views/index.html'));
                    },
                },{
                    label: 'Exit',
                    click: () => {
                        app.quit();
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
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),

        // File menu
        {
            label: 'File',
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },

        // Edit menu (default roles like copy/paste)
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' },
                ])
            ]
        },

        // View menu with DevTools
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' }, // Dev Tools toggle
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },

        // Window menu
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        },

        // Help menu (you can customize this too)
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://electronjs.org');
                    }
                }
            ]
        }
    ];
}

module.exports = createMenuTemplate;
