import React, { useState } from 'react';
import { X, Sparkles, Check, HelpCircle, RefreshCw } from 'lucide-react';
import {
  NAMING_PRESETS,
  DEFAULT_NAMING_PATTERN,
  getNamingPattern,
  saveNamingPattern,
  generateProfileMark
} from '../utils/namingService';

interface NamingFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectCode: string;
  onPatternChanged?: (pattern: string) => void;
}

export const NamingFormulaModal: React.FC<NamingFormulaModalProps> = ({
  isOpen,
  onClose,
  projectCode,
  onPatternChanged
}) => {
  const [pattern, setPattern] = useState(getNamingPattern);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  if (!isOpen) return null;

  const sampleArticle = 'AYPC.EF100.40.0101';
  const sampleAxialLength = 2555;
  const sampleCutLength = 2515;
  const sampleOrder = '1';

  const previewMark = generateProfileMark(
    projectCode || 'А1187',
    sampleArticle,
    sampleAxialLength,
    sampleOrder,
    sampleCutLength,
    pattern
  );

  const handleApplyPreset = (presetPattern: string, id: string) => {
    setPattern(presetPattern);
    setSelectedPresetId(id);
  };

  const handleInsertToken = (token: string) => {
    setPattern((prev) => prev + token);
  };

  const handleSave = () => {
    saveNamingPattern(pattern);
    if (onPatternChanged) {
      onPatternChanged(pattern);
    }
    onClose();
  };

  const handleReset = () => {
    setPattern(DEFAULT_NAMING_PATTERN);
    setSelectedPresetId('axial');
  };

  const tokens = [
    { label: '{project}', desc: 'Код объекта (напр. А1187)' },
    { label: '{article}', desc: '4 цифры артикула (напр. 0101)' },
    { label: '{axialLength}', desc: 'Длина по осям (напр. 2555)' },
    { label: '{cutLength}', desc: 'Фактическая длина заготовки L (напр. 2515)' },
    { label: '{order}', desc: 'Порядковый номер (напр. 1, 512)' },
    { label: '{fullArticle}', desc: 'Полный артикул профиля' },
    { label: '-', desc: 'Дефис' },
    { label: ' ', desc: 'Пробел' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="h-12 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Настройка формулы автоматического наименования (Марки деталей)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs font-sans max-h-[80vh] overflow-y-auto">
          {/* Live Preview Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
              Интерактивный предпросмотр марки детали:
            </span>
            <div className="text-base font-mono font-bold text-blue-950 bg-white px-3 py-1.5 rounded-lg border border-blue-200 flex items-center justify-between shadow-2xs">
              <span>{previewMark || '<Пустая марка>'}</span>
              <span className="text-[10px] text-slate-400 font-sans font-normal">
                стойка 2555 мм (подрезка 40 мм, № 1)
              </span>
            </div>
          </div>

          {/* Pattern Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Шаблон формулы:
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value);
                setSelectedPresetId('');
              }}
              placeholder="{project} {article}-{axialLength}-{order}"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Используйте переменные в фигурных скобках и любые символы-разделители (пробел, дефис, слэш).
            </p>
          </div>

          {/* Quick Token Chips */}
          <div>
            <span className="text-[10px] font-bold text-slate-600 block mb-1.5">
              Вставить переменную в формулу кликом:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tokens.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => handleInsertToken(t.label)}
                  title={t.desc}
                  className="px-2 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 border border-slate-200 rounded-md font-mono text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  {t.label === ' ' ? '␣ Пробел' : t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presets Grid */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Готовые отраслевые стандарты:
            </span>
            <div className="space-y-1.5">
              {NAMING_PRESETS.map((p) => {
                const isSelected = pattern === p.pattern;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p.pattern, p.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 shadow-2xs text-blue-950 font-bold'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{p.name}</span>
                        <code className="text-[10px] bg-slate-200/70 text-slate-800 px-1 py-0.2 rounded font-mono">
                          {p.example}
                        </code>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                        {p.description}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-12 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Сбросить к стандарту Жукова
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 font-medium text-xs transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              Сохранить формулу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

