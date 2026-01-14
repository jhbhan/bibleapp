import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true // Unsafe, but simplifies path handling for this case.
    }
  });

  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('esv-path', path.join(__dirname, 'esv.json'));
  });

  // Open the DevTools.
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
