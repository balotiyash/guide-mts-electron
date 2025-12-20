/** 
 * File: src/scripts/logger.js
 * Author: Yash Balotiya
 * Description: Logs user activity in the renderer process of an Electron app.
 * Created on: 15/09/2025
 * Last Modified: 20/12/2025
*/

// logger.js (put this in a shared folder)
import log from 'electron-log';

// Configure log level for renderer
log.transports.file.level = "info";

// --- Activity logging hooks ---

// Page load
log.info("Renderer loaded:", window.location.href);

// Track navigation changes (hash/router-based apps)
window.addEventListener("hashchange", () => {
    log.info("Route changed to:", window.location.hash);
});

// Track clicks (basic)
document.addEventListener("click", (e) => {
    let path = e.composedPath ? e.composedPath()[0] : e.target;
    log.info("User clicked:", path.tagName, path.className || "", path.id || "");
});

// Track fetch calls
const origFetch = window.fetch;
window.fetch = async (...args) => {
    log.info("Fetch request:", args[0]);
    try {
        const res = await origFetch(...args);
        log.info("Fetch response:", args[0], "->", res.status);
        return res;
    } catch (err) {
        log.error("Fetch error:", args[0], err.message);
        throw err;
    }
};

// Track JS errors
window.addEventListener("error", (e) => {
    log.error("Uncaught error:", e.message, "at", e.filename, ":", e.lineno);
});

// Track unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
    log.error("Unhandled rejection:", e.reason);
});

// Export the logger for use in other modules
export default log;