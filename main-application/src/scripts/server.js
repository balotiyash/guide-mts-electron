/** 
 * File: src/scripts/server.js
 * Author: Yash Balotiya
 * Description: This file sets up and starts the Express API server for the Electron application.
 * Created on: 07/12/2025
 * Last Modified: 10/04/2026
*/

// Importing required modules & libraries
import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import os from 'os';
import bonjourLib from 'bonjour';

// Importing route handlers
import dashboardRoutes from './routes/dashboard.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import form14Routes from './routes/form14.routes.js';
import reportRoutes from './routes/report.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import dataEntryRoutes from './routes/dataEntry.routes.js';

// Server variables
let httpServer = null;
let bonjour = null;
let bonjourService = null;

// Get first non-internal IPv4 address
const getLocalIPv4 = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
};

// Function to start the API server
export const startApiServer = async () => {
    if (httpServer) {
        return httpServer;
    }

    // Creating an Express application
    const app = express();

    // Defining server parameters
    const port = 3000;

    /**
     * IMPORTANT:
     * Server MUST listen on 0.0.0.0
     * Never use localhost here
     */
    const listenHost = '0.0.0.0';

    // Middleware setup
    // Increase body size limit to handle large image uploads (e.g., 50MB)
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use(cors());

    // Setting up API routes
    const apiRouter = Router();
    app.use('/api/v1', apiRouter);

    // Dashboard routes
    apiRouter.use('/dashboard', dashboardRoutes);

    // Data Entry routes
    apiRouter.use('/data-entry', dataEntryRoutes);

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
        const server = app.listen(port, listenHost, () => {
            const localIP = getLocalIPv4();

            console.log('API server listening on:');
            console.log(`-> http://localhost:${port}`);
            console.log(`-> http://${localIP}:${port}\n`);

            // mDNS / Bonjour advertisement
            try {
                const machineName = os.hostname();
                const serviceName = `Guide MTS Server (${machineName})`;

                bonjour = bonjourLib();
                bonjourService = bonjour.publish({
                    name: serviceName,
                    type: 'http',
                    protocol: 'tcp',
                    port,
                    host: machineName.toLowerCase()
                });

                bonjourService.on('error', (error) => {
                    // Bonjour emits async errors; handle gracefully without crashing the app.
                    console.warn('mDNS advertisement failed, continuing without it');
                    console.warn(error.message);
                });

                console.log(`mDNS advertised as: ${serviceName} on port ${port}\n`);
            } catch (err) {
                console.warn('mDNS advertisement failed, continuing without it');
                console.warn(err.message);
            }

            // Store the server instance for later shutdown
            httpServer = server;
            resolve(server);
        });

        // Handle server errors
        server.on('error', (error) => {
            reject(error);
        });

        // Clean up server reference on close
        server.on('close', () => {
            httpServer = null;
        });
    });
};

// Function to stop the API server
export const stopApiServer = async () => {
    if (bonjourService) {
        try {
            // Stop the mDNS service before destroying the bonjour instance
            bonjourService.stop();
        } catch (error) {
            console.warn('Failed to stop mDNS service cleanly:', error.message);
        }
        // Destroy the bonjour instance after stopping the service
        bonjourService = null;
    }

    // Destroy the bonjour instance to free up resources
    if (bonjour) {
        try {
            bonjour.destroy();
        } catch (error) {
            console.warn('Failed to destroy mDNS instance cleanly:', error.message);
        }
        bonjour = null;
    }

    if (!httpServer) {
        return;
    }

    // Close the server and wait for it to finish closing before resolving
    await new Promise((resolve) => {
        httpServer.close(() => {
            httpServer = null;
            resolve();
        });
    });
};
