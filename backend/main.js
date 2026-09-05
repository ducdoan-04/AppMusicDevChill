const { app, BrowserWindow } = require('electron');
const path = require('path');

// Import the backend server starter
const { startServer } = require('./server');

let mainWindow;
let serverStarted = false;

async function createWindow() {
  // Ensure the server is started or assumed running before loading the URL
  if (!serverStarted) {
    await startServer();
    serverStarted = true;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'DevChillMusic - Kho nhạc miễn phí cho bạn.',
    icon: path.join(__dirname, 'public', 'uploads', 'images', 'logo', 'DevChillLogoApp.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    // Optional: Hide menu bar if you want it to look more like a native app
    autoHideMenuBar: true
  });

  // Load the locally hosted app
  mainWindow.loadURL('http://localhost:5555');

  // Open in full screen (maximized)
  mainWindow.maximize();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
