import React, { useState } from 'react';
import { X, Palette, Plus, Check, Trash2 } from 'lucide-react';

interface ColorManagerPopoverProps {
  currentColor: string;
  colors: string[];
  onSelectPrimaryColor: (color: string) => void;
  onUpdateColorsList: (colors: string[]) => void;
  onClose: () => void;
}

export const ColorManagerPopover: React.FC<ColorManagerPopoverProps> = ({
  currentColor,
  colors = ['RAL 7012'],
  onSelectPrimaryColor,
  onUpdateColorsList,
  onClose
}) => {
  const [newColorInput, setNewColorInput] = useState('');

  const effectiveColors = colors && colors.length > 0 ? colors : [currentColor || 'RAL 7012'];

  const handleAddColor = () => {
    const trimmed = newColorInput.trim();
    if (!trimmed) return;
    if (!effectiveColors.includes(trimmed)) {
      const updated = [...effectiveColors, trimmed];
      onUpdateColorsList(updated);
    }
    setNewColorInput('');
  };

  const handleRemoveColor = (colorToRemove: string) => {
    if (effectiveColors.length <= 1) {
      alert('В проекте должен оставаться хотя бы один цвет');
      return;
    }
    const updated = effectiveColors.filter((c) => c !== colorToRemove);
    onUpdateColorsList(updated);
    if (currentColor === colorToRemove) {
      onSelectPrimaryColor(updated[0]);
    }
  };

  const quickRalPresets = ['RAL 7012', 'RAL 7016', 'RAL 7021', 'RAL 9005', 'RAL 9006', 'RAL 9016'];

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="h-10 bg-slate-100 border-b border-slate-200 px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Цвета проекта
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 space-y-3 text-xs font-sans">
        {/* Colors in this project */}
        <div>
          <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
            Активные цвета в проекте:
          </span>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {effectiveColors.map((col) => {
              const isPrimary = col === currentColor;
              return (
                <div
                  key={col}
                  onClick={() => onSelectPrimaryColor(col)}
                  className={`px-2.5 py-1.5 rounded-lg border transition flex items-center justify-between cursor-pointer ${
                    isPrimary
                      ? 'bg-blue-50 border-blue-400 shadow-2xs font-bold text-blue-900'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-slate-400 bg-slate-600 inline-block"></span>
                    <span className="font-mono text-xs">{col}</span>
                    {isPrimary && (
                      <span className="text-[9px] bg-blue-200 text-blue-800 px-1 py-0.2 rounded font-sans font-normal">
                        Основной
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isPrimary ? (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveColor(col);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                        title="Удалить цвет"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add custom color */}
        <div className="pt-2 border-t border-slate-200 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600 block">
            Добавить свой цвет:
          </span>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newColorInput}
              onChange={(e) => setNewColorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColor()}
              placeholder="RAL 9005 (или название)"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddColor}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition text-xs shadow-2xs"
            >
              <Plus className="w-3 h-3" /> Добавить
            </button>
          </div>
        </div>

        {/* Quick RAL buttons */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block">Быстрые варианты:</span>
          <div className="flex flex-wrap gap-1">
            {quickRalPresets.map((ral) => (
              <button
                key={ral}
                onClick={() => {
                  if (!effectiveColors.includes(ral)) {
                    onUpdateColorsList([...effectiveColors, ral]);
                  }
                  onSelectPrimaryColor(ral);
                }}
                className="text-[10px] font-mono bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-600 px-1.5 py-0.5 rounded transition cursor-pointer"
              >
                {ral}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

