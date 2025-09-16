// src/services/invoiceService.js
import { BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function makeToken() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function generateInvoice(invoiceData) {
    const token = makeToken();

    const invoiceWin = new BrowserWindow({
        show: false, // keep it hidden while rendering
        webPreferences: {
            preload: path.join(__dirname, '../../preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    const htmlPath = path.join(__dirname, '../../../views/invoice.html');
    // build file:// URL, append token as query param
    const fileUrl = pathToFileURL(htmlPath).href + `?token=${token}`;

    // Handlers specific to this invoice/token
    const onReady = (event, receivedToken) => {
        console.log(receivedToken)
        if (receivedToken !== token) return;
        // send the actual data to the invoice window that requested it
        try {
            invoiceWin.webContents.send('invoice-data', invoiceData);
        } catch (err) {
            console.error('Failed to send invoice-data to invoice window:', err);
        }
    };

    let resolveRendered;
    let rejectRendered;
    const renderedPromise = new Promise((resolve, reject) => {
        resolveRendered = resolve;
        rejectRendered = reject;
    });

    const onRendered = (event, receivedToken) => {
        console.log(receivedToken)
        if (receivedToken !== token) return;
        resolveRendered();
    };

    // Register listeners *before* loadURL to avoid missing messages
    ipcMain.on('invoice-ready', onReady);
    ipcMain.on('invoice-rendered', onRendered);

    try {
        await invoiceWin.loadURL(fileUrl);

        // Give renderer a short grace period in case it still needs to paint script-run etc.
        // Wait up to 10 seconds for the renderer's "invoice-rendered" message
        const timeoutMs = 10000;
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout waiting for invoice to render')), timeoutMs);
        });

        await Promise.race([renderedPromise, timeout]);

        // Ask user where to save
        const { canceled, filePath: savePath } = await dialog.showSaveDialog({
            title: 'Save Invoice as PDF',
            defaultPath: `invoice-${Date.now()}.pdf`,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });

        if (canceled || !savePath) {
            invoiceWin.close();
            return null;
        }

        // Print to PDF
        const pdfBuffer = await invoiceWin.webContents.printToPDF({
            marginsType: 0,
            printBackground: true,
            landscape: false
        });

        fs.writeFileSync(savePath, pdfBuffer);

        invoiceWin.close();
        return savePath;
    } finally {
        // Clean up listeners no matter what
        ipcMain.removeListener('invoice-ready', onReady);
        ipcMain.removeListener('invoice-rendered', onRendered);
        // make extra sure the window is closed
        if (!invoiceWin.isDestroyed()) invoiceWin.close();
    }
}

export default generateInvoice;
