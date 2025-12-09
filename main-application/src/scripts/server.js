/** 
 * File: src/scripts/server.js
 * Author: Yash Balotiya
 * Description: This file sets up and starts the Express API server for the Electron application.
 * Created on: 07/12/2025
 * Last Modified: 09/12/2025
*/

// Importing required modules & libraries
import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import Store from 'electron-store';

// Importing route handlers
import dashboardRoutes from './routes/dashboard.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import form14Routes from './routes/form14.routes.js';
import reportRoutes from './routes/report.routes.js';
import reminderRoutes from './routes/reminder.routes.js';

// Function to start the API server
export const startApiServer = async () => {
    // Creating an Express application
    const app = express();

    // Initializing Electron Store for configuration management
    const store = new Store();

    // Defining server parameters
    const port = 3000;
    const host = store.get('hostAddress') || 'localhost';

    // Middleware setup
    app.use(express.json());
    app.use(cors()); // optional if you only call from Electron, but harmless

    // Setting up API routes
    const apiRouter = Router();
    app.use('/api/v1', apiRouter);

    // Dashboard routes
    apiRouter.use('/dashboard', dashboardRoutes);

    // Payment routes
    apiRouter.use('/payments', paymentRoutes);

    // Form 14 routes
    apiRouter.use('/form14', form14Routes);

    // Report routes
    apiRouter.use('/reports', reportRoutes);

    // Reminder routes
    apiRouter.use('/reminders', reminderRoutes);

    // Starting the server
    return new Promise((resolve, reject) => {
        const server = app
            .listen(port, host, () => {
                console.log(`API server listening on  ${host}:${port}`);
                resolve(server);
            })
            .on('error', reject);
    });
};