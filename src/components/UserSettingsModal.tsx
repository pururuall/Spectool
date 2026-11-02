import React, { useState, useEffect } from 'react';
import { UserSettings, DimensionDisplayMode } from '../types';
import { getUserSettings, saveUserSettings, resetUserSettings } from '../utils/userSettingsService';
import { Settings, Save, RotateCcw, X, Plus, Trash2, Check, Sliders, Palette, Tag } from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySettings?: (newSettings: UserSettings) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  onApplySettings
}) => {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [newColorInput, setNewColorInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getUserSettings());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveUserSettings(settings);
    setSaveSuccess(true);
    if (onApplySettings) {
      onApplySettings(settings);
    }
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    if (confirm('Сбросить все пользовательские настройки к исходным (чистая палитра, ширина 1000, высота 2500)?')) {
      const reset = resetUserSettings();
      setSettings(reset);
      if (onApplySettings) {
        onApplySettings(reset);
      }
    }
  };

  const handleAddColor = () => {
    const val = newColorInput.trim().toUpperCase();
    if (!val) return;
    if (!settings.defaultColors.includes(val)) {
      setSettings((prev) => ({
        ...prev,
        defaultColors: [...prev.defaultColors, val],
        defaultPrimaryColor: prev.defaultPrimaryColor || val
      }));
    }
    setNewColorInput('');
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setSettings((prev) => {
      const filtered = prev.defaultColors.filter((c) => c !== colorToRemove);
      return {
        ...prev,
        defaultColors: filtered,
        defaultPrimaryColor: prev.defaultPrimaryColor === colorToRemove ? (filtered[0] || '') : prev.defaultPrimaryColor
      };
    });
  };

  const handleSetPrimaryColor = (c: string) => {
    setSettings((prev) => ({ ...prev, defaultPrimaryColor: c }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Пользовательские настройки приложения</h2>
              <p className="text-[11px] text-slate-400">
                Параметры, которые сохраняются навсегда и применяются к новым проектам
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Default Project Parameters */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Sliders className="w-4 h-4 text-blue-600" />
              Параметры нового модуля по умолчанию
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Код проекта (шифр):</label>
                <input
                  type="text"
                  value={settings.defaultProjectCode}
                  onChange={(e) => setSettings({ ...settings, defaultProjectCode: e.target.value })}
                  placeholder="напр. А1187 или ПРОЕКТ"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Начальный номер палок:</label>
                <input
                  type="number"
                  value={settings.defaultOrderStart}
                  onChange={(e) => setSettings({ ...settings, defaultOrderStart: parseInt(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Ширина модуля L (мм):</label>
                <input
                  type="number"
                  value={settings.defaultWidth}
                  onChange={(e) => setSettings({ ...settings, defaultWidth: parseInt(e.target.value) || 1000 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Высота модуля H (мм):</label>
                <input
                  type="number"
                  value={settings.defaultHeight}
                  onChange={(e) => setSettings({ ...settings, defaultHeight: parseInt(e.target.value) || 2500 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Режим образмеривания при старте:</label>
              <select
                value={settings.defaultDimensionMode}
                onChange={(e) => setSettings({ ...settings, defaultDimensionMode: e.target.value as DimensionDisplayMode })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="selection_inputs">Интерактивные поля ввода над выбранным ригелем/стойкой</option>
                <option value="outer_chains">Внешние инженерные размерные цепочки (AutoCAD)</option>
                <option value="all_lines">Размеры на всех линиях</option>
                <option value="hidden">Скрыть все размеры (чистый чертеж)</option>
              </select>
            </div>
          </div>

          {/* Default Palette Colors */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Palette className="w-4 h-4 text-indigo-600" />
                Цвета по умолчанию для новых проектов
              </h3>
              <span className="text-[10px] text-slate-500">
                {settings.defaultColors.length === 0 ? 'Палитра пуста (чистый старт)' : `${settings.defaultColors.length} цветов`}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Настройте свою корпоративную палитру. Эти цвета будут появляться в новых проектах вместо сторонних образцов.
            </p>

            {/* Colors list */}
            {settings.defaultColors.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {settings.defaultColors.map((col) => {
                  const isPrimary = settings.defaultPrimaryColor === col;
                  return (
                    <div
                      key={col}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md border text-xs transition ${
                        isPrimary ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-400" />
                        <span>{col}</span>
                        {isPrimary && (
                          <span className="text-[9px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded font-normal">
                            Основной
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!isPrimary && (
                          <button
                            onClick={() => handleSetPrimaryColor(col)}
                            className="text-[10px] text-indigo-600 hover:underline px-1.5 py-0.5"
                          >
                            Сделать основным
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveColor(col)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                          title="Удалить цвет из палитры по умолчанию"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center bg-white rounded border border-dashed border-slate-300 text-slate-400 text-xs">
                Палитра пуста. При создании нового модуля список цветов будет чистым.
              </div>
            )}

            {/* Add color */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColor()}
                placeholder="Ввести RAL (напр. RAL 7016)..."
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddColor}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить
              </button>
            </div>
          </div>

          {/* Naming formula preview */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Tag className="w-4 h-4 text-emerald-600" />
              Шаблон формулы наименования марок
            </h3>
            <input
              type="text"
              value={settings.defaultNamingPattern}
              onChange={(e) => setSettings({ ...settings, defaultNamingPattern: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[10px] text-slate-400">
              Доступны теги: {'{project}'}, {'{article}'}, {'{axialLength}'}, {'{cutLength}'}, {'{order}'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Сбросить к заводским
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md transition"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 text-white transition ${
                saveSuccess ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Сохранено!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Сохранить настройки
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

