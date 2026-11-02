import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Trash2,
  Sparkles,
  PlusCircle,
  Hash,
  Eye,
  Settings,
  Database,
  Palette,
  Tag,
  Sliders,
  RotateCcw,
  HelpCircle,
  Check,
  ChevronDown,
  Layers,
  Square
} from 'lucide-react';
import { DimensionDisplayMode } from '../types';

interface MenuBarProps {
  dimensionMode: DimensionDisplayMode;
  onChangeDimensionMode: (mode: DimensionDisplayMode) => void;
  onNewEmptyModule: () => void;
  onLoadPreset: () => void;
  onImportClick: () => void;
  onExportProject: () => void;
  onExportExcel: () => void;
  onClearCanvas: () => void;
  onAddBoxContour: () => void;
  onOpenDatabaseManager: (initialTab?: 'materials' | 'hardware' | 'processes') => void;
  onOpenUserSettings: () => void;
  onOpenColorManager: () => void;
  onOpenNamingModal: () => void;
  onOpenProcessTemplatesModal: () => void;
  onOpenCellTemplatesModal?: () => void;
  onOpenStandaloneModal: () => void;
  onOpenNumberingPopover: () => void;
  onResetLayout: () => void;
  onOpenAboutModal: () => void;
  onOpenThemeManager?: () => void;
  activeThemeName?: string;
  // Panel visibility toggles
  panelVisibility: {
    params: boolean;
    materials: boolean;
    hardware: boolean;
    table: boolean;
  };
  onTogglePanel: (panel: 'params' | 'materials' | 'hardware' | 'table') => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  dimensionMode,
  onChangeDimensionMode,
  onNewEmptyModule,
  onLoadPreset,
  onImportClick,
  onExportProject,
  onExportExcel,
  onClearCanvas,
  onAddBoxContour,
  onOpenDatabaseManager,
  onOpenUserSettings,
  onOpenColorManager,
  onOpenNamingModal,
  onOpenProcessTemplatesModal,
  onOpenCellTemplatesModal,
  onOpenStandaloneModal,
  onOpenNumberingPopover,
  onResetLayout,
  onOpenAboutModal,
  onOpenThemeManager,
  activeThemeName,
  panelVisibility,
  onTogglePanel
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleMouseEnter = (menuName: string) => {
    if (activeMenu !== null) {
      setActiveMenu(menuName);
    }
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div
      ref={menuBarRef}
      className="h-8 bg-slate-100 border-b border-slate-300 px-2 flex items-center select-none text-xs text-slate-700 relative z-50 font-sans"
    >
      {/* Brand logo tag */}
      <div className="flex items-center gap-1.5 mr-3 pr-2.5 border-r border-slate-300">
        <span className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
          S
        </span>
        <span className="font-bold tracking-tight text-slate-800 text-xs">Spectool</span>
        <span className="text-[10px] font-mono text-slate-400">CAD/BIM</span>
      </div>

      {/* Menu items */}
      <div className="flex items-center gap-0.5">
        {/* FILE */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            onMouseEnter={() => handleMouseEnter('file')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer transition ${
              activeMenu === 'file' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-200 text-slate-800'
            }`}
          >
            Файл
          </button>
          {activeMenu === 'file' && (
            <div className="absolute left-0 top-full mt-0.5 w-60 bg-white border border-slate-300 rounded-md shadow-xl py-1 z-50">
              <button
                onClick={() => {
                  onNewEmptyModule();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Новый модуль</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+N</span>
              </button>
              <button
                onClick={() => {
                  onImportClick();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Открыть / Импорт (.xlsx, .spectool)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
              </button>
              <button
                onClick={() => {
                  onExportProject();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Сохранить проект (.spectool)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>
              <button
                onClick={() => {
                  onExportExcel();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Экспорт спецификации Excel (.xlsx)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+E</span>
              </button>

              <div className="my-1 border-t border-slate-200" />

              <button
                onClick={() => {
                  onLoadPreset();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Загрузить эталон: «Модуль Жукова»</span>
              </button>
              <button
                onClick={() => {
                  onClearCanvas();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Очистить холст</span>
              </button>
            </div>
          )}
        </div>

        {/* EDIT */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            onMouseEnter={() => handleMouseEnter('edit')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer transition ${
              activeMenu === 'edit' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-200 text-slate-800'
            }`}
          >
            Правка
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute left-0 top-full mt-0.5 w-64 bg-white border border-slate-300 rounded-md shadow-xl py-1 z-50">
              <button
                onClick={() => {
                  onAddBoxContour();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-blue-500" />
                <span>Создать контур габаритов (L × H)</span>
              </button>
              <button
                onClick={() => {
                  onOpenStandaloneModal();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Добавить деталь / СБ (кронштейн, узел)</span>
              </button>
              <button
                onClick={() => {
                  onOpenNumberingPopover();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <Hash className="w-3.5 h-3.5 text-purple-600" />
                <span>Таблица номеров профилей («палок»)...</span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            onMouseEnter={() => handleMouseEnter('view')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer transition ${
              activeMenu === 'view' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-200 text-slate-800'
            }`}
          >
            Вид
          </button>
          {activeMenu === 'view' && (
            <div className="absolute left-0 top-full mt-0.5 w-72 bg-white border border-slate-300 rounded-md shadow-xl py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Отображение размеров на чертеже
              </div>
              <button
                onClick={() => {
                  onChangeDimensionMode('selection_inputs');
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dimensionMode === 'selection_inputs' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {dimensionMode === 'selection_inputs' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Интерактивные размеры при выборе (ТЗ)</span>
                </div>
                <span className="text-[10px] text-blue-600 font-medium">Инпуты</span>
              </button>
              <button
                onClick={() => {
                  onChangeDimensionMode('outer_chains');
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dimensionMode === 'outer_chains' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {dimensionMode === 'outer_chains' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Инженерные размерные цепочки CAD</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Снаружи</span>
              </button>
              <button
                onClick={() => {
                  onChangeDimensionMode('all_lines');
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dimensionMode === 'all_lines' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {dimensionMode === 'all_lines' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Размеры на всех линиях</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Бейджи</span>
              </button>
              <button
                onClick={() => {
                  onChangeDimensionMode('hidden');
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dimensionMode === 'hidden' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {dimensionMode === 'hidden' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Скрыть все размеры (чистый холст)</span>
                </div>
              </button>

              <div className="my-1 border-t border-slate-200" />
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Видимость панелей
              </div>

              <button
                onClick={() => onTogglePanel('params')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <span>Панель параметров</span>
                {panelVisibility.params && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => onTogglePanel('materials')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <span>База материалов и профилей</span>
                {panelVisibility.materials && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => onTogglePanel('hardware')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <span>База метизов</span>
                {panelVisibility.hardware && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => onTogglePanel('table')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer"
              >
                <span>Таблица спецификации (BOM)</span>
                {panelVisibility.table && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              <div className="my-1 border-t border-slate-200" />
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Стили и цветовые темы
              </div>
              <button
                onClick={() => {
                  onOpenThemeManager?.();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between cursor-pointer font-medium text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Темы оформления (Конструктор)...</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">F7</span>
              </button>
            </div>
          )}
        </div>

        {/* SETTINGS */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('settings')}
            onMouseEnter={() => handleMouseEnter('settings')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer transition ${
              activeMenu === 'settings' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-200 text-slate-800'
            }`}
          >
            Настройки
          </button>
          {activeMenu === 'settings' && (
            <div className="absolute left-0 top-full mt-0.5 w-72 bg-white border border-slate-300 rounded-md shadow-xl py-1 z-50">
              <button
                onClick={() => {
                  onOpenUserSettings();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-bold text-blue-900"
              >
                <Settings className="w-3.5 h-3.5 text-blue-600" />
                <span>Пользовательские настройки по умолчанию...</span>
              </button>

              <div className="my-1 border-t border-slate-200" />

              <button
                onClick={() => {
                  onOpenDatabaseManager();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Настройка Баз Данных (Материалы, Метизы, ТП)...</span>
              </button>

              <div className="my-1 border-t border-slate-200" />

              <button
                onClick={() => {
                  onOpenColorManager();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                <span>Цвета проекта (мульти-RAL)...</span>
              </button>
              <button
                onClick={() => {
                  onOpenNamingModal();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Формулы наименования марок...</span>
              </button>
              <button
                onClick={() => {
                  onOpenProcessTemplatesModal();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Шаблоны техпроцесса (Vogbit)...</span>
              </button>
              {onOpenCellTemplatesModal && (
                <button
                  onClick={() => {
                    onOpenCellTemplatesModal();
                    closeMenu();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Шаблоны заполнений (проёмов)...</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* WINDOW */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('window')}
            onMouseEnter={() => handleMouseEnter('window')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer transition ${
              activeMenu === 'window' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-200 text-slate-800'
            }`}
          >
            Окно
          </button>
          {activeMenu === 'window' && (
            <div className="absolute left-0 top-full mt-0.5 w-56 bg-white border border-slate-300 rounded-md shadow-xl py-1 z-50">
              <button
                onClick={() => {
                  onResetLayout();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Сбросить размеры панелей</span>
              </button>
            </div>
          )}
        </div>

        {/* HELP */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            onMouseEnter={() => handleMouseEnter('help')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer transition ${
              activeMenu === 'help' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-200 text-slate-800'
            }`}
          >
            Справка
          </button>
          {activeMenu === 'help' && (
            <div className="absolute left-0 top-full mt-0.5 w-60 bg-white border border-slate-300 rounded-md shadow-xl py-1 z-50">
              <button
                onClick={() => {
                  onOpenAboutModal();
                  closeMenu();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>О программе Spectool v2.1.1</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side status / active dimension mode quick pill */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => {
            const nextMode: DimensionDisplayMode =
              dimensionMode === 'selection_inputs'
                ? 'outer_chains'
                : dimensionMode === 'outer_chains'
                ? 'all_lines'
                : dimensionMode === 'all_lines'
                ? 'hidden'
                : 'selection_inputs';
            onChangeDimensionMode(nextMode);
          }}
          className="px-2 py-0.5 text-[11px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded flex items-center gap-1 cursor-pointer transition shadow-2xs font-mono"
          title="Кликните для быстрого переключения режима отображения размеров на чертеже"
        >
          <Eye className="w-3 h-3 text-blue-600" />
          <span>Размеры: </span>
          <strong className="text-blue-700">
            {dimensionMode === 'selection_inputs' && 'Интерактивные инпуты'}
            {dimensionMode === 'outer_chains' && 'Цепочки CAD'}
            {dimensionMode === 'all_lines' && 'Все линии'}
            {dimensionMode === 'hidden' && 'Скрыты'}
          </strong>
        </button>

        {onOpenThemeManager && (
          <button
            onClick={() => onOpenThemeManager()}
            className="px-2 py-0.5 text-[11px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-300 hover:border-indigo-300 rounded flex items-center gap-1 cursor-pointer transition shadow-2xs"
            title="Сменить тему оформления или открыть конструктор тем"
          >
            <Palette className="w-3 h-3 text-indigo-600" />
            <span>Тема: </span>
            <strong className="text-indigo-700">{activeThemeName || 'Classic'}</strong>
          </button>
        )}

        <button
          onClick={() => onOpenDatabaseManager()}
          className="px-2 py-0.5 text-[11px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded flex items-center gap-1 cursor-pointer transition shadow-2xs"
          title="Открыть менеджер баз данных (Материалы, Метизы, Шаблоны ТП)"
        >
          <Database className="w-3 h-3 text-emerald-600" />
          <span>Базы данных</span>
        </button>
      </div>
    </div>
  );
};

