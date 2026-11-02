import React, { useState } from 'react';
import {
  ThemeDefinition,
  getAllThemes,
  getActiveTheme,
  setActiveTheme,
  saveCustomTheme,
  deleteCustomTheme
} from '../utils/themeService';
import {
  X,
  Check,
  Palette,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  Copy,
  Download,
  Upload,
  Trash2,
  Edit3,
  RotateCcw,
  Layout,
  Layers,
  Eye
} from 'lucide-react';

interface ThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChanged: (newTheme: ThemeDefinition) => void;
}

export const ThemeManagerModal: React.FC<ThemeManagerModalProps> = ({
  isOpen,
  onClose,
  onThemeChanged
}) => {
  if (!isOpen) return null;

  const [activeThemeState, setActiveThemeState] = useState<ThemeDefinition>(() => getActiveTheme());
  const [themesList, setThemesList] = useState<ThemeDefinition[]>(() => getAllThemes());
  const [filterBrightness, setFilterBrightness] = useState<'all' | 'light' | 'dark' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Builder State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTheme, setBuilderTheme] = useState<ThemeDefinition>(() => ({
    ...activeThemeState,
    id: `custom_${Date.now()}`,
    name: 'Моя инженерная тема',
    isCustom: true
  }));

  const handleSelectTheme = (theme: ThemeDefinition) => {
    const updated = setActiveTheme(theme.id);
    setActiveThemeState(updated);
    onThemeChanged(updated);
  };

  const handleLoadIntoBuilder = (theme: ThemeDefinition) => {
    setBuilderTheme({
      ...JSON.parse(JSON.stringify(theme)),
      id: `custom_${Date.now()}`,
      name: `${theme.name} (Моя версия)`,
      isCustom: true
    });
    setIsBuilderOpen(true);
    // Scroll to builder
    setTimeout(() => {
      document.getElementById('theme-builder-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSaveBuilderTheme = () => {
    if (!builderTheme.name.trim()) {
      alert('Укажите название темы!');
      return;
    }
    const themeToSave: ThemeDefinition = {
      ...builderTheme,
      id: builderTheme.id || `custom_${Date.now()}`,
      isCustom: true
    };
    saveCustomTheme(themeToSave);
    const updatedAll = getAllThemes();
    setThemesList(updatedAll);
    handleSelectTheme(themeToSave);
    alert(`Тема "${themeToSave.name}" успешно сохранена и применена!`);
  };

  const handleDeleteTheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить эту пользовательскую тему?')) {
      deleteCustomTheme(themeId);
      const updated = getAllThemes();
      setThemesList(updated);
      if (activeThemeState.id === themeId) {
        handleSelectTheme(updated[0]);
      }
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(builderTheme, null, 2);
    navigator.clipboard.writeText(json);
    alert('JSON-код темы скопирован в буфер обмена!');
  };

  const handleImportJSON = () => {
    const raw = prompt('Вставьте JSON-код темы:');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.name && parsed.baseStyles && parsed.colors && parsed.cadZone) {
        setBuilderTheme({
          ...parsed,
          id: `custom_${Date.now()}`,
          isCustom: true
        });
        setIsBuilderOpen(true);
        alert(`Тема "${parsed.name}" загружена в конструктор!`);
      } else {
        alert('Некорректная структура JSON темы!');
      }
    } catch (err) {
      alert('Ошибка парсинга JSON: ' + String(err));
    }
  };

  const filteredThemes = themesList.filter((t) => {
    if (filterBrightness === 'light' && t.brightness !== 'light') return false;
    if (filterBrightness === 'dark' && t.brightness !== 'dark') return false;
    if (filterBrightness === 'custom' && !t.isCustom) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.directives.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Темы оформления и Конструктор интерфейса</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {themesList.length} тем
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Выберите готовый инженерный стиль CAD/BIM или создайте собственную цветовую палитру
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBuilderOpen(!isBuilderOpen)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isBuilderOpen
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isBuilderOpen ? 'Скрыть конструктор' : '🛠️ Конструктор тем'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Filter & Search Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0 select-none">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilterBrightness('all')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                filterBrightness === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Все ({themesList.length})
            </button>
            <button
              onClick={() => setFilterBrightness('light')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterBrightness === 'light'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Светлые</span>
            </button>
            <button
              onClick={() => setFilterBrightness('dark')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterBrightness === 'dark'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Тёмные</span>
            </button>
            <button
              onClick={() => setFilterBrightness('custom')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterBrightness === 'custom'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Мои темы ({themesList.filter((t) => t.isCustom).length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Поиск по названию или стилю..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 text-xs w-60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 3. Main Scrollable Content: Tiles Grid + Builder */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/50">

          {/* THEME TILES GRID */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Доступные стили оформления ({filteredThemes.length})</span>
              <span className="text-[11px] font-normal text-slate-400">Кликните на плитку для применения</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThemes.map((t) => {
                const isActive = activeThemeState.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t)}
                    className={`rounded-xl border-2 transition p-3.5 flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md relative overflow-hidden ${
                      isActive
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {/* Active Ribbon Badge */}
                    {isActive && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg shadow-xs flex items-center gap-1 z-10">
                        <Check className="w-3 h-3" />
                        <span>АКТИВНА</span>
                      </div>
                    )}

                    <div>
                      {/* MINI GRAPHICAL MOCKUP OF THE THEME (Shows CAD zone + Panel Layout) */}
                      <div
                        className="w-full h-24 rounded-lg border p-1.5 mb-3 flex gap-1.5 overflow-hidden shadow-inner select-none"
                        style={{
                          background: t.baseStyles.background,
                          borderColor: t.baseStyles.border
                        }}
                      >
                        {/* Mock CAD Zone */}
                        <div
                          className="w-2/5 h-full rounded border flex items-center justify-center relative p-1"
                          style={{
                            backgroundColor: t.cadZone.background,
                            borderColor: t.baseStyles.border
                          }}
                        >
                          {/* Mini Grid representation */}
                          <div
                            className="absolute inset-0 opacity-40"
                            style={{
                              backgroundImage: `radial-gradient(${t.cadZone.gridColor} 1px, transparent 1px)`,
                              backgroundSize: '8px 8px'
                            }}
                          />
                          {/* Mini CAD frame with active highlight */}
                          <div
                            className="w-3/4 h-4/5 rounded-xs border-2 relative"
                            style={{
                              borderColor: t.cadZone.activeColor,
                              boxShadow: `0 0 6px ${t.cadZone.activeColor}40`
                            }}
                          >
                            <div
                              className="absolute top-1/2 left-0 right-0 h-0.5"
                              style={{ backgroundColor: t.cadZone.activeColor }}
                            />
                          </div>
                        </div>

                        {/* Mock Header + Panels */}
                        <div className="flex-1 flex flex-col gap-1 h-full">
                          {/* Mini Header */}
                          <div
                            className="h-3.5 rounded px-1.5 flex items-center justify-between border"
                            style={{
                              background: t.baseStyles.panelBackground,
                              borderColor: t.baseStyles.border,
                              backdropFilter: t.baseStyles.backdropFilter
                            }}
                          >
                            <span
                              className="w-3 h-1.5 rounded-xs"
                              style={{ backgroundColor: t.colors.primary }}
                            />
                            <div className="flex gap-1">
                              <span
                                className="w-2 h-1.5 rounded-xs"
                                style={{ backgroundColor: t.colors.accent }}
                              />
                              <span
                                className="w-2 h-1.5 rounded-xs"
                                style={{ backgroundColor: t.colors.success }}
                              />
                            </div>
                          </div>

                          {/* Mini Panels Columns */}
                          <div className="flex-1 flex gap-1">
                            <div
                              className="flex-1 rounded p-1 border flex flex-col justify-between"
                              style={{
                                background: t.baseStyles.panelBackground,
                                borderColor: t.baseStyles.border,
                                borderRadius: t.baseStyles.borderRadius,
                                backdropFilter: t.baseStyles.backdropFilter
                              }}
                            >
                              <div
                                className="w-full h-1.5 rounded-xs"
                                style={{ backgroundColor: t.colors.primary }}
                              />
                              <div
                                className="w-3/4 h-1 rounded-xs"
                                style={{ backgroundColor: t.colors.textMuted }}
                              />
                              <div
                                className="w-1/2 h-1 rounded-xs"
                                style={{ backgroundColor: t.colors.secondary }}
                              />
                            </div>
                            <div
                              className="w-1/3 rounded p-1 border flex flex-col justify-between"
                              style={{
                                background: t.baseStyles.panelBackground,
                                borderColor: t.baseStyles.border,
                                borderRadius: t.baseStyles.borderRadius,
                                backdropFilter: t.baseStyles.backdropFilter
                              }}
                            >
                              <div
                                className="w-full h-1 rounded-xs"
                                style={{ backgroundColor: t.colors.accent }}
                              />
                              <div
                                className="w-full h-1.5 rounded-xs"
                                style={{ backgroundColor: t.colors.success }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Title & Brightness Badge */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate" title={t.name}>
                          {t.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 flex items-center gap-1 ${
                            t.brightness === 'dark'
                              ? 'bg-slate-900 text-slate-100'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {t.brightness === 'dark' ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                          <span>{t.brightness === 'dark' ? 'Тёмная' : 'Светлая'}</span>
                        </span>
                      </div>

                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-1 mb-2">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: t.colors.primary }}
                          title={`Основной акцент: ${t.colors.primary}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: t.colors.secondary }}
                          title={`Вторичный: ${t.colors.secondary}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: t.cadZone.activeColor }}
                          title={`Цвет CAD линий: ${t.cadZone.activeColor}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: t.cadZone.background }}
                          title={`Фон CAD зоны: ${t.cadZone.background}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: t.baseStyles.panelBackground }}
                          title={`Фон панелей: ${t.baseStyles.panelBackground}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: t.colors.accent }}
                          title={`Акцент: ${t.colors.accent}`}
                        />
                      </div>

                      {/* Directives Description */}
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {t.directives}
                      </p>
                    </div>

                    {/* Bottom Actions for Tile */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadIntoBuilder(t);
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                        title="Открыть в конструкторе для создания своей темы на базе этой"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>В конструктор</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {t.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTheme(t.id, e)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Удалить пользовательскую тему"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSelectTheme(t)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700'
                          }`}
                        >
                          {isActive ? 'Применена' : 'Выбрать'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. THEME BUILDER (Конструктор тем) */}
          <div id="theme-builder-section" className="pt-4 border-t-2 border-slate-200">
            <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Интерактивный конструктор тем</h3>
                    <p className="text-xs text-slate-500">
                      Настройте индивидуальные цвета, шрифты, границы и стили чертежа
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={handleExportJSON}
                    className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition flex items-center gap-1 cursor-pointer font-medium"
                    title="Скопировать JSON темы в буфер"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать JSON</span>
                  </button>

                  <button
                    onClick={handleImportJSON}
                    className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition flex items-center gap-1 cursor-pointer font-medium"
                    title="Загрузить тему из JSON"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Импорт JSON</span>
                  </button>

                  <button
                    onClick={handleSaveBuilderTheme}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Сохранить и применить</span>
                  </button>
                </div>
              </div>

              {/* Builder Layout: Controls + Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left 2 Cols: Inputs */}
                <div className="lg:col-span-2 space-y-4 text-xs">
                  {/* Theme Name & Brightness */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Название темы:</label>
                      <input
                        type="text"
                        value={builderTheme.name}
                        onChange={(e) => setBuilderTheme({ ...builderTheme, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Например: Мой Темный CAD"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Яркость темы:</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBuilderTheme({ ...builderTheme, brightness: 'light' })}
                          className={`flex-1 py-1.5 rounded-lg border font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                            builderTheme.brightness === 'light'
                              ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Светлая (Light)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuilderTheme({ ...builderTheme, brightness: 'dark' })}
                          className={`flex-1 py-1.5 rounded-lg border font-semibold flex items-center justify-center gap-1 cursor-pointer transition ${
                            builderTheme.brightness === 'dark'
                              ? 'bg-slate-900 border-slate-950 text-white font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Тёмная (Dark)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Base Styles Group */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                      Базовые стили окон и панелей
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Фон приложения:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.baseStyles.background}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                baseStyles: { ...builderTheme.baseStyles, background: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.baseStyles.background}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                baseStyles: { ...builderTheme.baseStyles, background: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Фон панелей:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.baseStyles.panelBackground}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                baseStyles: { ...builderTheme.baseStyles, panelBackground: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.baseStyles.panelBackground}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                baseStyles: { ...builderTheme.baseStyles, panelBackground: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Скругление углов:</label>
                        <select
                          value={builderTheme.baseStyles.borderRadius}
                          onChange={(e) =>
                            setBuilderTheme({
                              ...builderTheme,
                              baseStyles: { ...builderTheme.baseStyles, borderRadius: e.target.value }
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-[11px]"
                        >
                          <option value="0px">Прямые (0px)</option>
                          <option value="4px">Инженерные (4px)</option>
                          <option value="6px">Строгие (6px)</option>
                          <option value="8px">Стандартные (8px)</option>
                          <option value="12px">Мягкие (12px)</option>
                          <option value="16px">Карточные (16px)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Colors Group */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                      Цветовая гамма акцентов и текста
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Основной акцент:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.colors.primary}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, primary: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.colors.primary}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, primary: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Вторичный акцент:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.colors.secondary}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, secondary: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.colors.secondary}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, secondary: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Цвет деталей (Success):</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.colors.success}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, success: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.colors.success}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, success: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Основной текст:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.colors.textMain}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, textMain: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.colors.textMain}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, textMain: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Приглушенный текст:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.colors.textMuted}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, textMuted: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.colors.textMuted}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                colors: { ...builderTheme.colors, textMuted: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Шрифт интерфейса:</label>
                        <select
                          value={builderTheme.baseStyles.fontFamily}
                          onChange={(e) =>
                            setBuilderTheme({
                              ...builderTheme,
                              baseStyles: { ...builderTheme.baseStyles, fontFamily: e.target.value }
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-[11px]"
                        >
                          <option value="Inter, sans-serif">Inter (Современный)</option>
                          <option value="JetBrains Mono, monospace">JetBrains Mono (Инженерный)</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
                          <option value="Orbitron, monospace">Orbitron (Sci-Fi)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* CAD Zone Group */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                      Параметры CAD-чертежа (Холст и сетка)
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Фон CAD холста:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.cadZone.background}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                cadZone: { ...builderTheme.cadZone, background: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.cadZone.background}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                cadZone: { ...builderTheme.cadZone, background: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Цвет точек сетки:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.cadZone.gridColor}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                cadZone: { ...builderTheme.cadZone, gridColor: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.cadZone.gridColor}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                cadZone: { ...builderTheme.cadZone, gridColor: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Цвет выделения профиля:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={builderTheme.cadZone.activeColor}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                cadZone: { ...builderTheme.cadZone, activeColor: e.target.value }
                              })
                            }
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={builderTheme.cadZone.activeColor}
                            onChange={(e) =>
                              setBuilderTheme({
                                ...builderTheme,
                                cadZone: { ...builderTheme.cadZone, activeColor: e.target.value }
                              })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Live Interactive Mockup */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                      Живое превью вашей темы
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Live
                    </span>
                  </div>

                  {/* Render Mock Interface */}
                  <div
                    className="w-full h-80 rounded-xl border p-2 flex flex-col gap-2 shadow-inner select-none transition-all"
                    style={{
                      background: builderTheme.baseStyles.background,
                      borderColor: builderTheme.baseStyles.border,
                      fontFamily: builderTheme.baseStyles.fontFamily,
                      color: builderTheme.colors.textMain
                    }}
                  >
                    {/* Mock Header */}
                    <div
                      className="h-8 rounded px-2 flex items-center justify-between border"
                      style={{
                        backgroundColor: builderTheme.baseStyles.panelBackground,
                        borderColor: builderTheme.baseStyles.border,
                        borderRadius: builderTheme.baseStyles.borderRadius
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded text-[9px] font-bold text-white flex items-center justify-center"
                          style={{ backgroundColor: builderTheme.colors.primary }}
                        >
                          S
                        </span>
                        <span className="font-bold text-[11px] truncate">
                          {builderTheme.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            backgroundColor: `${builderTheme.colors.primary}20`,
                            color: builderTheme.colors.primary
                          }}
                        >
                          L: 1200
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                          style={{ backgroundColor: builderTheme.colors.success }}
                        >
                          Excel
                        </span>
                      </div>
                    </div>

                    {/* Mock Workspace: CAD + Panels */}
                    <div className="flex-1 flex gap-2 min-h-0">
                      {/* CAD Viewport */}
                      <div
                        className="w-1/2 h-full rounded border relative flex items-center justify-center p-2"
                        style={{
                          backgroundColor: builderTheme.cadZone.background,
                          borderColor: builderTheme.baseStyles.border
                        }}
                      >
                        {/* Grid */}
                        <div
                          className="absolute inset-0 opacity-40"
                          style={{
                            backgroundImage: `radial-gradient(${builderTheme.cadZone.gridColor} 1px, transparent 1px)`,
                            backgroundSize: '12px 12px'
                          }}
                        />

                        {/* Drawn CAD frame */}
                        <div
                          className="w-4/5 h-4/5 rounded-xs border-2 relative"
                          style={{
                            borderColor: builderTheme.cadZone.activeColor,
                            boxShadow: `0 0 10px ${builderTheme.cadZone.activeColor}50`
                          }}
                        >
                          {/* Transom line */}
                          <div
                            className="absolute top-1/3 left-0 right-0 h-0.5"
                            style={{ backgroundColor: builderTheme.cadZone.activeColor }}
                          />
                          {/* Active dimension badge */}
                          <div
                            className="absolute top-1/6 left-1/2 -translate-x-1/2 px-1 rounded text-[8px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: builderTheme.colors.primary }}
                          >
                            630 мм
                          </div>
                        </div>
                      </div>

                      {/* Right Mock Panels */}
                      <div className="w-1/2 flex flex-col gap-1.5 min-h-0">
                        {/* Inspector Box */}
                        <div
                          className="flex-1 rounded p-2 border flex flex-col justify-between"
                          style={{
                            backgroundColor: builderTheme.baseStyles.panelBackground,
                            borderColor: builderTheme.baseStyles.border,
                            borderRadius: builderTheme.baseStyles.borderRadius,
                            boxShadow: builderTheme.baseStyles.boxShadow
                          }}
                        >
                          <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: builderTheme.baseStyles.border }}>
                            <span className="font-bold text-[10px]" style={{ color: builderTheme.colors.textMain }}>
                              Окно параметров
                            </span>
                            <span className="text-[9px] font-mono" style={{ color: builderTheme.colors.textMuted }}>
                              AYPC.0101
                            </span>
                          </div>

                          {/* Mock Card */}
                          <div
                            className="p-1.5 rounded border my-1"
                            style={{
                              borderColor: `${builderTheme.colors.primary}40`,
                              backgroundColor: `${builderTheme.colors.primary}10`
                            }}
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold mb-1">
                              <span>Стойка фасадная</span>
                              <span style={{ color: builderTheme.colors.primary }}>L = 2515</span>
                            </div>
                            <div className="w-full h-1 rounded" style={{ backgroundColor: `${builderTheme.colors.textMuted}30` }} />
                          </div>

                          <button
                            type="button"
                            className="w-full py-1 rounded text-[10px] font-bold text-white transition shadow-2xs"
                            style={{ backgroundColor: builderTheme.colors.primary }}
                          >
                            + Добавить метиз
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    💡 Нажмите <b>«Сохранить и применить»</b> вверху, чтобы сохранить тему в вашу персональную коллекцию.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0 select-none">
          <span className="text-slate-500">
            Текущая активная тема: <b>{activeThemeState.name}</b> ({activeThemeState.brightness})
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const def = setActiveTheme('classic_default');
                setActiveThemeState(def);
                onThemeChanged(def);
              }}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition font-medium cursor-pointer"
            >
              Сброс к исходной теме
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition cursor-pointer shadow-xs"
            >
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

