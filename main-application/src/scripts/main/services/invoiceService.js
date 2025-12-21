/**
 * File: src/scripts/main/services/invoiceService.js
 * Author: Yash Balotiya
 * Description: This file contains the main Js code for invoice service
 * Created on: 16/09/2025
 * Last Modified: 21/12/2025
 */

// src/services/invoiceService.js
import { BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique token for each invoice window
const makeToken = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

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
};

// Print invoice directly without saving - Using PDF preview for better Windows support
const printInvoice = async (invoiceData) => {
    // Generate a unique token for the invoice window
    const token = makeToken();

    // Create a hidden BrowserWindow to load the invoice HTML
    const invoiceWin = new BrowserWindow({
        show: false,
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

        // Generate PDF in memory
        const pdfBuffer = await invoiceWin.webContents.printToPDF({
            marginsType: 0,
            printBackground: true,
            landscape: false
        });

        // Save to temporary file
        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempPdfPath = path.join(tempDir, `invoice-preview-${Date.now()}.pdf`);
        fs.writeFileSync(tempPdfPath, pdfBuffer);

        // Close the invoice rendering window
        invoiceWin.close();

        // Create a new window to display the PDF with preview
        const previewWin = new BrowserWindow({
            width: 900,
            height: 700,
            title: 'Invoice Preview - Print using Ctrl+P',
            webPreferences: {
                plugins: true,
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        // Load the PDF in the preview window
        await previewWin.loadFile(tempPdfPath);

        // Clean up temp file when window closes
        previewWin.on('closed', () => {
            try {
                if (fs.existsSync(tempPdfPath)) {
                    fs.unlinkSync(tempPdfPath);
                }
            } catch (error) {
                console.error('Error cleaning up temp PDF:', error);
            }
        });

    } catch (error) {
        throw error;
    } finally {
        ipcMain.removeListener('invoice-ready', onReady);
        ipcMain.removeListener('invoice-rendered', onRendered);
        if (!invoiceWin.isDestroyed()) invoiceWin.close();
    }
};

// Exporting the functions
export {
    generateInvoice,
    printInvoice
};
