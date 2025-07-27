const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let win;

// ✅ Define the custom menu once at top level
const menuTemplate = [
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

function createWindow() {
  win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'src/views/index.html'));
  win.maximize(); 
  win.show();

  // ❌ No menu on startup (login screen)
  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  try {
    createWindow();
  } catch (err) {
    console.error('Failed to create window:', err);
  }
});

// ✅ Show the menu after successful login
ipcMain.on('show-menu', () => {
  const customMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(customMenu);
});

// ✅ Handle login validation
ipcMain.handle('login', async (event, { username, password }) => {
  return username === 'ADMIN' && password === 'ADMIN'
    ? { success: true }
    : { success: false };
});

// ✅ Secure page navigation
ipcMain.on('navigate-to', (event, targetPage) => {
  if (win) {
    win.loadFile(path.join(__dirname, 'src/views', targetPage));
  }
});
