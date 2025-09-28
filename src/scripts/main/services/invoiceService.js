/**
 * File: src/scripts/main/services/in    htmlContent = htmlContent.replace(
        /href="..\/styles\/invoice\.css"/g, 
        () => {
            const cssPath = path.join(projectRoot, 'src', 'styles', 'invoice.css');
            return `href="${pathToFileURL(cssPath).href}"`;
        }
    );
    
    // Add print-specific CSS link
    const printCssPath = path.join(projectRoot, 'src', 'styles', 'invoice-print.css');
    const printCssLink = `<link rel="stylesheet" href="${pathToFileURL(printCssPath).href}">`;
    htmlContent = htmlContent.replace('</head>', `    ${printCssLink}\n</head>`);
    
    // Create the data injection scriptice.js
 * Author: Yash Balotiya
 * Description: This file contains the main Js code for invoice service
 * Created on: 16/09/2025
 * Last Modified: 23/09/2025
 */

// src/services/invoiceService.js
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique token for each invoice window
const makeToken = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Generate standalone HTML invoice for browser display
const generateStandaloneInvoiceHTML = (invoiceData) => {
    // Read the base invoice HTML template
    const htmlTemplatePath = path.join(__dirname, '../../../views/invoice.html');
    let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');
    
    // Convert relative paths to absolute paths for assets
    const projectRoot = path.join(__dirname, '../../../..');
    
    // Replace asset paths with absolute file:// URLs
    htmlContent = htmlContent.replace(
        /src="..\/assets\/images\/([^"]+)"/g, 
        (match, imageName) => {
            const imagePath = path.join(projectRoot, 'src', 'assets', 'images', imageName);
            return `src="${pathToFileURL(imagePath).href}"`;
        }
    );
    
    htmlContent = htmlContent.replace(
        /href="..\/styles\/invoice\.css"/g, 
        () => {
            const cssPath = path.join(projectRoot, 'src', 'styles', 'invoice.css');
            return `href="${pathToFileURL(cssPath).href}"`;
        }
    );
    
    // Create the data injection script
    const dataScript = `
        <script>
            // Invoice data injected at generation time
            const invoiceData = ${JSON.stringify(invoiceData)};
            
            // Populate invoice fields immediately
            document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('receiptType').textContent = invoiceData.type.toUpperCase() || 'ORIGINAL';
                document.getElementById('customerName').textContent = invoiceData.customer.toUpperCase() || '—';
                document.getElementById('dateId').textContent = invoiceData.date;
                document.getElementById('userId').textContent = invoiceData.admissionNo || '—';
                
                // Populate items table
                const tbody = document.querySelector('#itemsTable tbody');
                tbody.innerHTML = '';
                invoiceData.items.forEach((item, idx) => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${idx + 1}</td>
                        <td>\${item.date || ''}</td>
                        <td>\${item.desc.toUpperCase()}</td>
                        <td>\${item.mode.toUpperCase() || ''}</td>
                        <td>\${item.paid}</td>
                        <td>\${item.remaining}</td>
                    \`;
                    tbody.appendChild(row);
                });
                
                // Populate total amount
                document.getElementById('totalAmount').textContent = invoiceData.total;
                
                // Add print button for convenience
                const printButton = document.createElement('button');
                printButton.textContent = 'Print Invoice';
                printButton.style.cssText = \`
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    cursor: pointer;
                    border-radius: 5px;
                    font-size: 14px;
                    z-index: 1000;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                \`;
                printButton.onclick = () => window.print();
                document.body.appendChild(printButton);
                
                // Add print media query styles
                const printStyles = document.createElement('style');
                printStyles.textContent = \`
                    @media print {
                        button { display: none !important; }
                        body { margin: 0; }
                    }
                \`;
                document.head.appendChild(printStyles);
            });
        </script>
    `;
    
    // Replace the existing script tag with our data injection script
    const scriptRegex = /<script>[\s\S]*?<\/script>/;
    htmlContent = htmlContent.replace(scriptRegex, dataScript);
    
    return htmlContent;
}

// Generate and save invoice as PDF
const generateInvoice = async (invoiceData) => {
    // Generate a unique token for the invoice window
    const token = makeToken();

    // Create a hidden BrowserWindow to load the invoice HTML
    const invoiceWin = new BrowserWindow({
        show: false, // keep it hidden while rendering
        webPreferences: {
            preload: path.join(__dirname, '../../preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Path to the invoice HTML file
    const htmlPath = path.join(__dirname, '../../../views/invoice.html');

    // build file:// URL, append token as query param
    const fileUrl = pathToFileURL(htmlPath).href + `?token=${token}`;

    // Create a hidden BrowserWindow to load the invoice HTML
    let resolveRendered;
    const renderedPromise = new Promise((resolve) => (resolveRendered = resolve));

    // Handlers specific to this invoice/token
    const onReady = (event, receivedToken) => {
        if (receivedToken !== token) return;
        // send the actual data to the invoice window that requested it
        try {
            invoiceWin.webContents.send('invoice-data', invoiceData);
        } catch (err) {
            console.error('Failed to send invoice-data to invoice window:', err);
        }
    };

    // Handle invoice rendered event
    const onRendered = (event, receivedToken) => {
        if (receivedToken !== token) return;
        resolveRendered();
    };

    // Register listeners *before* loadURL to avoid missing messages
    ipcMain.on('invoice-ready', onReady);
    ipcMain.on('invoice-rendered', onRendered);

    try {
        await invoiceWin.loadURL(fileUrl);
        await renderedPromise;

        // Ask user where to save
        const { canceled, filePath: savePath } = await dialog.showSaveDialog({
            title: 'Save Invoice as PDF',
            defaultPath: `invoice-${Date.now()}.pdf`,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });

        // If user canceled the save dialog, just close and return null
        if (canceled || !savePath) {
            invoiceWin.close();
            return null;
        }

        // Generate PDF
        const pdfBuffer = await invoiceWin.webContents.printToPDF({
            marginsType: 0,
            printBackground: true,
            landscape: false
        });

        // Save PDF to the selected path
        fs.writeFileSync(savePath, pdfBuffer);

        // Close the window and return the path
        invoiceWin.close();
        return savePath;
    } finally {
        // Cleanup listeners
        ipcMain.removeListener('invoice-ready', onReady);
        ipcMain.removeListener('invoice-rendered', onRendered);
        if (!invoiceWin.isDestroyed()) invoiceWin.close();
    }
}

// Print invoice directly without saving
const printInvoice = async (invoiceData) => {
    // Generate a unique token for the invoice window
    const token = makeToken();

    // Create a hidden BrowserWindow to load the invoice HTML
    const invoiceWin = new BrowserWindow({
        width: 800,          // optional, reasonable size
        height: 600,
        show: true,          // ✅ must be true for print preview
        webPreferences: {
            preload: path.join(__dirname, '../../preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Path to the invoice HTML file
    const htmlPath = path.join(__dirname, '../../../views/invoice.html');

    // build file:// URL, append token as query param
    const fileUrl = pathToFileURL(htmlPath).href + `?token=${token}`;

    // Create a hidden BrowserWindow to load the invoice HTML
    let resolveRendered;
    const renderedPromise = new Promise((resolve) => (resolveRendered = resolve));

    // Handlers specific to this invoice/token
    const onReady = (event, receivedToken) => {
        if (receivedToken !== token) return;
        try {
            invoiceWin.webContents.send('invoice-data', invoiceData);
        } catch (error) {
            console.error('Error sending invoice data:', error);
        }
    };

    // Handle invoice rendered event
    const onRendered = (event, receivedToken) => {
        if (receivedToken !== token) return;
        resolveRendered();
    };

    // Register listeners *before* loadURL to avoid missing messages
    ipcMain.on('invoice-ready', onReady);
    ipcMain.on('invoice-rendered', onRendered);

    try {
        // Load the invoice HTML into the window
        await invoiceWin.loadURL(fileUrl);
        await renderedPromise;

        // ✅ show print preview dialog
        await new Promise((resolve, reject) => {
            invoiceWin.webContents.print(
                { printBackground: true, silent: false }, // silent: false ensures preview dialog
                (success, errorType) => {
                    if (!success) {
                        console.error('Print failed:', errorType);
                        return reject(new Error(errorType));
                    }
                    console.log('Print dialog completed successfully'); // Debug log
                    resolve();
                }
            );
        });

    } catch (error) {
        throw error;
    } finally {
        ipcMain.removeListener('invoice-ready', onReady);
        ipcMain.removeListener('invoice-rendered', onRendered);
        if (!invoiceWin.isDestroyed()) invoiceWin.close();
    }
}

// Open invoice in default browser for printing
const openInvoiceInBrowser = async (invoiceData) => {
    try {
        // Generate standalone HTML content
        const htmlContent = generateStandaloneInvoiceHTML(invoiceData);
        
        // Create temporary file in system temp directory
        const tempDir = os.tmpdir();
        const fileName = `invoice-${Date.now()}-${invoiceData.admissionNo || 'unknown'}.html`;
        const tempFilePath = path.join(tempDir, fileName);
        
        // Write HTML content to temporary file
        fs.writeFileSync(tempFilePath, htmlContent, 'utf8');
        
        // Open the file in default browser
        await shell.openExternal(`file://${tempFilePath}`);
        
        console.log(`Invoice opened in browser: ${tempFilePath}`);
        return { success: true, filePath: tempFilePath };
        
    } catch (error) {
        console.error('Error opening invoice in browser:', error);
        throw error;
    }
}

// Exporting the functions
export {
    generateInvoice,
    printInvoice,
    openInvoiceInBrowser
};
