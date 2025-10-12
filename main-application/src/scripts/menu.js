/** 
 * File: src/scripts/menu.js
 * Author: Yash Balotiya, Neha Balotia
 * Description: Menu template for Electron application.
 * Created on: 01/08/2025
 * Last Modified: 12/10/2025
*/

// Module JS
import path from 'path';
import { app } from 'electron';
import { fileURLToPath } from 'url';

// File paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// function createMenuTemplate(win) {
const createMenuTemplate = (win) => {
    // Check if the platform is macOS to adjust menu items accordingly
    const isMac = process.platform === 'darwin';

    return [
        // macOS App Menu (only on macOS)
        ...(isMac ? [{
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),

        // Home Menu
        {
            label: 'Home',
            submenu: [
                {
                    label: 'Dashboard',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/dashboard.html'));
                    },
                }
            ]
        },

        // Registrations Menu
        {
            label: 'Registrations',
            submenu: [
                {
                    label: 'Customer Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/data_entry.html'));
                    },
                },
                {
                    label: 'Master Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/master_entry.html'));
                    },
                },
                {
                    label: 'Vehicle Registration',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/car_entry.html'));
                    },
                },
            ],
        },

        // Management Menu
        {
            label: 'Management',
            submenu: [
                {
                    label: 'Payment Management',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/payment_entry.html'));
                    },
                },
                {
                    label: 'Fuel Entry',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/fuel_entry.html'));
                    },
                },
            ],
        },

        // Reports Menu
        {
            label: 'Reports',
            submenu: [
                {
                    label: 'Form 14',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/form14.html'));
                    },
                },
                { type: 'separator' },
                {
                    label: 'Customer Report',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/search_page.html'));
                    },
                },
                {
                    label: 'Balance Report',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/balance_report.html'));
                    },
                },
                {
                    label: 'Collection Report',
                    click: () => {
                        win.loadFile(path.join(__dirname, '../views/collection_report.html'));
                    },
                },
            ],
        },

        // Edit Menu (standard editing functions)
        // {
        //     label: 'Edit',
        //     submenu: [
        //         { role: 'undo' },
        //         { role: 'redo' },
        //         { type: 'separator' },
        //         { role: 'cut' },
        //         { role: 'copy' },
        //         { role: 'paste' },
        //         ...(isMac ? [
        //             { role: 'pasteAndMatchStyle' },
        //             { role: 'delete' },
        //             { role: 'selectAll' },
        //             { type: 'separator' },
        //             {
        //                 label: 'Speech',
        //                 submenu: [
        //                     { role: 'startSpeaking' },
        //                     { role: 'stopSpeaking' }
        //                 ]
        //             }
        //         ] : [
        //             { role: 'delete' },
        //             { type: 'separator' },
        //             { role: 'selectAll' }
        //         ])
        //     ]
        // },

        // Window Menu
        // {
        //     label: 'Window',
        //     submenu: [
        //         { role: 'minimize' },
        //         { role: 'zoom' },
        //         ...(isMac ? [
        //             { type: 'separator' },
        //             { role: 'front' },
        //             { type: 'separator' },
        //             { role: 'window' }
        //         ] : [
        //             { role: 'close' }
        //         ])
        //     ]
        // },

        // Tools Menu
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Reminders',
                    click: () => {
                        console.log("Reminders clicked");
                        // TODO: Implement reminders functionality
                    }
                },
                { type: 'separator' },
                {
                    label: 'Change Database',
                    click: () => {
                        win.webContents.send('change-database-request');
                    },
                },
                { type: 'separator' },
                // Only show Exit on non-macOS platforms (macOS handles this in app menu)
                ...(!isMac ? [
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        click: () => {
                            app.quit();
                        },
                    }
                ] : [])
            ],
        },

        // View Menu
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },

        // Help Menu
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About System',
                    click: () => {
                        console.log('About System clicked');
                        // TODO: Show about system dialog
                    },
                },
                {
                    label: 'About Developer',
                    click: () => {
                        console.log('About Developer clicked');
                        // TODO: Show about developer dialog
                    }
                },
                { type: 'separator' },
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = await import('electron');
                        await shell.openExternal('https://electronjs.org');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Developer Tools',
                    click: () => {
                        win.webContents.toggleDevTools();
                    }
                }
            ],
        }
    ];
};

// module.exports = createMenuTemplate;
export default createMenuTemplate;
