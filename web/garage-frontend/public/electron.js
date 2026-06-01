const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

app.name = 'Garage';

let mainWindow;

function setupRequestInterceptor() {
  // En mode packagé (file://), Chromium envoie Origin: null ce qui bloque
  // les cookies/sessions avec withCredentials. On force l'origine à localhost:3001.
  if (!isDev) {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      const url = details.url;
      if (url.startsWith('http://localhost:3002')) {
        details.requestHeaders['Origin'] = 'http://localhost:3001';
        details.requestHeaders['Referer'] = 'http://localhost:3001/';
      }
      callback({ requestHeaders: details.requestHeaders });
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'logo512.png'),
    title: 'Garage',
    show: false,
  });

  // En dev  : __dirname = public/  (avant build)
  // En prod : __dirname = build/   (dans l'asar, CRA a copié public/ → build/)
  const startUrl = isDev
    ? 'http://localhost:3001'
    : `file://${path.join(__dirname, 'index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  setupRequestInterceptor();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
