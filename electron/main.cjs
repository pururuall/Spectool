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

function createApplicationMenu(mainWindow) {
  const send = (action) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('menu-action', action);
    }
  };

  const template = [
    {
      label: 'Файл',
      submenu: [
        { label: 'Новый модуль (в новой вкладке)', accelerator: 'CmdOrCtrl+N', click: () => send('menu-new-tab') },
        { label: 'Дублировать текущий модуль', accelerator: 'CmdOrCtrl+D', click: () => send('menu-duplicate-tab') },
        { label: 'Закрыть текущую вкладку', accelerator: 'CmdOrCtrl+W', click: () => send('menu-close-tab') },
        { type: 'separator' },
        { label: 'Открыть / Импорт...', accelerator: 'CmdOrCtrl+O', click: () => send('menu-import') },
        { label: 'Сохранить проект...', accelerator: 'CmdOrCtrl+S', click: () => send('menu-save') },
        { type: 'separator' },
        { label: 'Экспорт в Excel (BOM)...', accelerator: 'CmdOrCtrl+E', click: () => send('menu-export-excel') },
        { label: 'Пример: Модуль Жукова', click: () => send('menu-load-example') },
        { type: 'separator' },
        { label: 'Очистить холст', click: () => send('menu-clear') },
        { type: 'separator' },
        { label: 'Выход', role: 'quit' }
      ]
    },
    {
      label: 'Правка',
      submenu: [
        { label: 'Контур габаритов (Рама)', click: () => send('menu-add-outer-frame') },
        { label: 'Добавить деталь / СБ...', click: () => send('menu-add-standalone') },
        { label: 'Таблица порядковых номеров палок...', click: () => send('menu-open-numbering') }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { label: 'Темы оформления (Конструктор)...', accelerator: 'F7', click: () => send('menu-open-themes') },
        { type: 'separator' },
        { label: 'Размеры: Интерактивные поля при выборе', click: () => send('menu-dim-inputs') },
        { label: 'Размеры: Внешние цепочки CAD', click: () => send('menu-dim-chains') },
        { label: 'Размеры: На всех линиях', click: () => send('menu-dim-all') },
        { label: 'Размеры: Скрыть', click: () => send('menu-dim-hidden') },
        { type: 'separator' },
        { label: 'Скрыть/Показать окно параметров', click: () => send('menu-toggle-params') },
        { label: 'Скрыть/Показать базу материалов', click: () => send('menu-toggle-materials') },
        { label: 'Скрыть/Показать базу метизов', click: () => send('menu-toggle-hardware') },
        { label: 'Скрыть/Показать спецификацию', click: () => send('menu-toggle-table') },
        { type: 'separator' },
        { label: 'Полноэкранный режим', role: 'togglefullscreen' },
        { label: 'Перезагрузить', role: 'reload' },
        { label: 'Инструменты разработчика', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Настройки',
      submenu: [
        { label: 'Пользовательские настройки по умолчанию...', click: () => send('menu-open-user-settings') },
        { label: 'Шаблоны заполнений (проёмов)...', click: () => send('menu-open-cell-templates') },
        { type: 'separator' },
        { label: 'Управление Базами Данных (Материалы, Метизы, ТП)...', click: () => send('menu-open-db') },
        { label: 'Цвета проекта (мульти-RAL)...', click: () => send('menu-open-colors') },
        { label: 'Формулы наименования марок...', click: () => send('menu-open-naming') },
        { label: 'Шаблоны техпроцесса (Vogbit)...', click: () => send('menu-open-process') }
      ]
    },
    {
      label: 'Окно',
      submenu: [
        { label: 'Свернуть', role: 'minimize' },
        { label: 'Сбросить панели интерфейса', click: () => send('menu-reset-layout') }
      ]
    },
    {
      label: 'Справка',
      submenu: [
        { label: 'О программе Spectool', click: () => send('menu-about') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const iconPath = path.join(app.getAppPath(), 'build', 'icon.png');
  const preloadPath = path.join(__dirname, 'preload.cjs');

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Spectool — CAD/BIM Конструктор фасадов',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: false,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: fs.existsSync(preloadPath) ? preloadPath : undefined
    }
  });

  createApplicationMenu(mainWindow);
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
