import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#09090b',
    webPreferences: {
      nodeIntegration: true,    // Разрешаем Node.js в рендере
      contextIsolation: false,  // Упрощаем коммуникацию
      webSecurity: false        // Разрешаем загрузку локальных картинок
    },
    title: "Sculptor Pro",
  });

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// === НОВАЯ ЧАСТЬ: Обработка выбора файла ===
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Movies', extensions: ['mp4', 'mkv', 'mov', 'avi'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      // Отправляем выбранный путь обратно в React
      event.reply('selected-file', result.filePaths[0]);
    }
  }).catch(err => {
    console.log(err);
  });
});

ipcMain.on('open-audio-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'flac'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.reply('selected-audio', result.filePaths[0]);
    }
  }).catch(err => {
    console.log(err);
  });
});

ipcMain.on('open-folder', (event, path) => {
  shell.openPath(path);
});