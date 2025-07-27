const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  navigateTo: (page) => ipcRenderer.send('navigate-to', page),
  showMenu: () => ipcRenderer.send('show-menu'),
});
