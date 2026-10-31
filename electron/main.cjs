const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

process.on('uncaughtException', (error) => {
  try {
    dialog.showErrorBox('Ошибка приложения Spectool', error?.stack || error?.message || String(error));
  } catch (e) {
    console.error('Fatal uncaughtException:', error);
  }
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Spectool — Конструктор фасадов и спецификаций',
    autoHideMenuBar: false,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.maximize();

  const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    dialog.showErrorBox(
      'Ошибка загрузки интерфейса',
      `Не удалось загрузить интерфейс (${errorCode}: ${errorDescription})\nПуть: ${indexPath}`
    );
  });

  mainWindow.loadFile(indexPath).catch((err) => {
    dialog.showErrorBox('Ошибка открытия файла', err?.message || String(err));
  });
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

