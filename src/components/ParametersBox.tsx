import React, { useState, useEffect } from 'react';
import { LineSegment, Cell, ProfileBinding } from '../types';
import { Trash2, Plus, Layers, Tag, Ruler, BookmarkPlus, Sparkles, Box, Info, Palette } from 'lucide-react';
import { getAllCellTemplates, applyTemplateToCell, saveCustomCellTemplate } from '../utils/cellTemplates';
import { generateProfileMark } from '../utils/namingService';

interface ParametersBoxProps {
  allLines?: LineSegment[];
  allCells?: Cell[];
  selectedLine: LineSegment | null;
  selectedCell: Cell | null;
  selectedProfileId: string | null;
  projectCode?: string;
  projectColors?: string[];
  width?: number;
  onSelectLine?: (id: string | null) => void;
  onSelectCell?: (id: string | null) => void;
  onUpdateLine: (line: LineSegment) => void;
  onDeleteLine: (lineId: string) => void;
  onUpdateCell: (cell: Cell) => void;
  onDeleteCell?: (cellId: string) => void;
  onUpdateProfile: (lineId: string, prof: ProfileBinding) => void;
  onDeleteProfile: (lineId: string, profId: string) => void;
  onSelectProfile: (profId: string | null) => void;
  onOpenFastenerModal: (target: { lineId?: string; profileId?: string; cellId?: string }) => void;
}

export const ParametersBox: React.FC<ParametersBoxProps> = ({
  allLines = [],
  allCells = [],
  selectedLine,
  selectedCell,
  selectedProfileId,
  projectCode = 'А1187',
  projectColors = ['RAL 7012'],
  width = 320,
  onSelectLine,
  onSelectCell,
  onUpdateLine,
  onDeleteLine,
  onUpdateCell,
  onDeleteCell,
  onUpdateProfile,
  onDeleteProfile,
  onSelectProfile,
  onOpenFastenerModal
}) => {
  const [templates, setTemplates] = useState(getAllCellTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');

  useEffect(() => {
    setTemplates(getAllCellTemplates());
  }, [selectedCell?.id]);

  // Direct length change calculation: extends line along its angle
  const handleLineLengthChange = (newLen: number) => {
    if (!selectedLine || newLen <= 0) return;
    const dx = selectedLine.x2 - selectedLine.x1;
    const dy = selectedLine.y2 - selectedLine.y1;
    const currentLen = Math.hypot(dx, dy);

    let newX2 = selectedLine.x2;
    let newY2 = selectedLine.y2;

    if (currentLen > 0) {
      const ratio = newLen / currentLen;
      newX2 = Math.round(selectedLine.x1 + dx * ratio);
      newY2 = Math.round(selectedLine.y1 + dy * ratio);
    } else {
      newX2 = selectedLine.x1 + newLen;
    }

    onUpdateLine({
      ...selectedLine,
      x2: newX2,
      y2: newY2,
      length: newLen
    });
  };

  const handleApplyTemplate = (tplId: string) => {
    if (!selectedCell) return;
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    const updated = applyTemplateToCell(selectedCell, tpl);
    onUpdateCell(updated);
    setSelectedTemplateId(tplId);
  };

  const handleSaveCurrentAsTemplate = () => {
    if (!selectedCell || !newTemplateTitle.trim()) return;
    saveCustomCellTemplate(selectedCell, newTemplateTitle.trim());
    setTemplates(getAllCellTemplates());
    setNewTemplateTitle('');
    setIsSavingTemplate(false);
  };

  const cellAreaM2 = selectedCell
    ? Math.round(((selectedCell.glassWidth * selectedCell.glassHeight) / 1_000_000) * 100) / 100
    : 0;

  return (
    <div
      style={{ width: `${width}px` }}
      className="bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden select-none shrink-0"
    >
      {/* Title */}
      <div className="h-10 border-b border-slate-200 px-3.5 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Окно параметров</h3>
        </div>
        {selectedLine && (
          <button
            onClick={() => onDeleteLine(selectedLine.id)}
            className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium hover:bg-rose-50 px-1.5 py-0.5 rounded transition"
            title="Удалить эту линию"
          >
            <Trash2 className="w-3 h-3" />
            Удалить линию
          </button>
        )}
        {selectedCell && onDeleteCell && (
          <button
            onClick={() => onDeleteCell(selectedCell.id)}
            className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium hover:bg-rose-50 px-1.5 py-0.5 rounded transition"
            title="Удалить эту область"
          >
            <Trash2 className="w-3 h-3" />
            Удалить область
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
        {/* 1. SELECTED LINE PARAMETERS */}
        {selectedLine && (
          <div className="space-y-3">
            {/* Direct Line Length Input Box */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{selectedLine.name}</span>
                <span className="text-[10px] font-mono text-slate-400">ID: {selectedLine.id.slice(-6)}</span>
              </div>

              {/* Direct Length Input */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <label className="text-slate-700 font-semibold flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-blue-600" />
                  Длина линии:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={selectedLine.length}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      handleLineLengthChange(val);
                    }}
                    className="w-24 bg-white border border-slate-300 rounded px-2 py-0.5 text-right font-mono font-bold text-blue-700 text-sm focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  <span className="text-slate-500 font-mono text-[11px]">мм</span>
                </div>
              </div>

              {/* Point Coordinates */}
              <div className="text-[10px] text-slate-500 font-mono flex justify-between pt-1 border-t border-slate-200">
                <span>Точка 1: ({selectedLine.x1}, {selectedLine.y1})</span>
                <span>Точка 2: ({selectedLine.x2}, {selectedLine.y2})</span>
              </div>
            </div>

            {/* Profiles bound to this line */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Привязанные профили ({(selectedLine.profileBindings || []).length}):
                </span>
              </div>

              {(selectedLine.profileBindings || []).length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center text-slate-400">
                  <p className="text-[11px] mb-1">Профиль не привязан</p>
                  <p className="text-[10px] text-blue-600 font-medium">
                    👉 Кликните на любой профиль в дереве материалов справа, чтобы привязать его сюда!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(selectedLine.profileBindings || []).map((prof) => {
                    return (
                      <div
                        key={prof.id}
                        onClick={() => onSelectProfile(prof.id)}
                        className={`border rounded-lg p-2.5 shadow-2xs space-y-2 cursor-pointer transition ${
                          selectedProfileId === prof.id
                            ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{prof.name}</span>
                            <span className="font-mono text-[10px] text-blue-600 font-medium">{prof.article}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProfile(selectedLine.id, prof.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                            title="Отвязать профиль"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* 1. Offsets from ends of line and calculated cut length */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                            <span className="flex items-center gap-1">
                              <Ruler className="w-3 h-3 text-blue-600" />
                              Отступы от концов (подрезка):
                            </span>
                            <span className="font-mono text-emerald-700 font-bold text-xs bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              L = {Math.max(0, selectedLine.length - (prof.startOffset || 0) - (prof.endOffset || 0))} мм
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-500 block">Отступ 1 (начало):</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={prof.startOffset ?? 0}
                                  onChange={(e) => {
                                    const s = parseFloat(e.target.value) || 0;
                                    const newL = Math.max(0, selectedLine.length - s - (prof.endOffset || 0));
                                    onUpdateProfile(selectedLine.id, {
                                      ...prof,
                                      startOffset: s,
                                      calculatedLength: newL
                                    });
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-[10px] text-slate-400">мм</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-500 block">Отступ 2 (конец):</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={prof.endOffset ?? 0}
                                  onChange={(e) => {
                                    const end = parseFloat(e.target.value) || 0;
                                    const newL = Math.max(0, selectedLine.length - (prof.startOffset || 0) - end);
                                    onUpdateProfile(selectedLine.id, {
                                      ...prof,
                                      endOffset: end,
                                      calculatedLength: newL
                                    });
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-[10px] text-slate-400">мм</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick presets */}
                          <div className="flex items-center gap-1 text-[9px] pt-1 border-t border-slate-200">
                            <span className="text-slate-400">Быстро:</span>
                            {[
                              { label: '0 / 0', s: 0, e: 0 },
                              { label: '40 / 0', s: 40, e: 0 },
                              { label: '30 / 30', s: 30, e: 30 },
                              { label: '20 / 20', s: 20, e: 20 }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  const newL = Math.max(0, selectedLine.length - preset.s - preset.e);
                                  onUpdateProfile(selectedLine.id, {
                                    ...prof,
                                    startOffset: preset.s,
                                    endOffset: preset.e,
                                    calculatedLength: newL
                                  });
                                }}
                                className="px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono transition cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Custom mark & Order number */}
                        <div className="space-y-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-slate-700">Обозначение детали (Марка):</label>
                            <button
                              type="button"
                              onClick={() => {
                                const ord = prof.orderNumber || selectedLine.orderNumber || 500;
                                const autoMark = generateProfileMark(projectCode || 'А1187', prof.article, selectedLine.length, ord);
                                onUpdateProfile(selectedLine.id, {
                                  ...prof,
                                  customMark: autoMark
                                });
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                              title="Сгенерировать марку: [Проект] [Код арт.]-[Ось]-[Порядковый №]"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> По формуле
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={prof.customMark || ''}
                                onChange={(e) => {
                                  onUpdateProfile(selectedLine.id, {
                                    ...prof,
                                    customMark: e.target.value
                                  });
                                }}
                                placeholder="А1187 0101-2555-512"
                                className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-blue-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <input
                                type="text"
                                value={prof.orderNumber ?? (selectedLine.orderNumber ?? '')}
                                onChange={(e) => {
                                  const ord = e.target.value;
                                  const autoMark = generateProfileMark(projectCode || 'А1187', prof.article, selectedLine.length, ord);
                                  onUpdateProfile(selectedLine.id, {
                                    ...prof,
                                    orderNumber: ord,
                                    customMark: autoMark
                                  });
                                }}
                                placeholder="№ 512"
                                className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-center text-xs font-bold text-amber-800 focus:outline-none focus:border-amber-600"
                                title="Порядковый номер палки (512, 522, 500, 1, 2...)"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Profile Color */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
                            <span className="flex items-center gap-1">
                              <Palette className="w-3 h-3 text-amber-500" />
                              Цвет профиля / покраска:
                            </span>
                            <span className="font-mono text-slate-500 text-[10px]">{prof.color || 'RAL 7012'}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={prof.color || ''}
                              onChange={(e) => {
                                onUpdateProfile(selectedLine.id, {
                                  ...prof,
                                  color: e.target.value
                                });
                              }}
                              placeholder="RAL 7012"
                              className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {projectColors && projectColors.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {projectColors.map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => {
                                    onUpdateProfile(selectedLine.id, {
                                      ...prof,
                                      color: col
                                    });
                                  }}
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition cursor-pointer ${
                                    prof.color === col
                                      ? 'bg-blue-600 text-white border-blue-700 font-bold'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {col}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Attached Hardware for this profile */}
                        <div className="pt-1.5 border-t border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-slate-600">
                              Привязанные метизы и компл. ({(prof.dependencies || []).length}):
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenFastenerModal({ lineId: selectedLine.id, profileId: prof.id });
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 hover:bg-blue-50 px-1 py-0.5 rounded"
                            >
                              <Plus className="w-2.5 h-2.5" /> Метиз
                            </button>
                          </div>

                          <div className="space-y-1">
                            {(prof.dependencies || []).map((dep) => (
                              <div
                                key={dep.id}
                                className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[11px] flex items-center justify-between"
                              >
                                <span className="font-mono text-slate-700 truncate max-w-[170px]" title={dep.article}>
                                  {dep.article}
                                </span>
                                <span className="font-mono font-bold text-emerald-700 text-[10px]">
                                  {dep.evaluatedQty} {dep.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. UNIVERSAL CELL / AREA PARAMETERS */}
        {selectedCell && (
          <div className="space-y-3">
            {/* Header info */}
            <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-900 text-xs flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  Область модуля ({selectedCell.width} × {selectedCell.height} мм)
                </span>
                <span className="text-[10px] font-mono text-blue-600">ID: {selectedCell.id.slice(-6)}</span>
              </div>
              <p className="text-[10px] text-blue-700">
                Координаты проёма: X={selectedCell.x}, Y={selectedCell.y}
              </p>
            </div>

            {/* Template Selector & Presets */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Шаблон заполнения:
                </label>
                <button
                  onClick={() => setIsSavingTemplate(!isSavingTemplate)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 hover:bg-blue-50 px-1 py-0.5 rounded transition"
                  title="Сохранить текущие настройки как шаблон в память"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  Сохранить шаблон
                </button>
              </div>

              <select
                value={selectedTemplateId}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium shadow-2xs focus:border-blue-500"
              >
                <option value="">⚡ Выберите готовый шаблон...</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>

              {/* Save Template dialog */}
              {isSavingTemplate && (
                <div className="p-2 bg-white rounded border border-blue-200 space-y-1.5 mt-1.5 shadow-2xs">
                  <label className="text-[10px] text-slate-600 font-medium block">
                    Название нового шаблона:
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTemplateTitle}
                      onChange={(e) => setNewTemplateTitle(e.target.value)}
                      placeholder="напр. Стеклопакет 40мм с герметиком"
                      className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800"
                    />
                    <button
                      onClick={handleSaveCurrentAsTemplate}
                      disabled={!newTemplateTitle.trim()}
                      className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Position Identification */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Реквизиты позиции</span>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Обозначение (Марка):</label>
                <input
                  type="text"
                  value={selectedCell.mark}
                  onChange={(e) => onUpdateCell({ ...selectedCell, mark: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs font-bold text-blue-700 shadow-2xs"
                  placeholder="напр. СП-1, А1187 К1080-1000 или ВР-1"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Наименование:</label>
                <input
                  type="text"
                  value={selectedCell.name}
                  onChange={(e) => onUpdateCell({ ...selectedCell, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 shadow-2xs"
                  placeholder="напр. Стеклопакет СПО 32мм или Короб Оц 0,9мм"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Тип связи:</label>
                  <select
                    value={selectedCell.linkType || (selectedCell.hasMaterial ? 'деталь' : 'комплектующие')}
                    onChange={(e) =>
                      onUpdateCell({ ...selectedCell, linkType: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-800 font-medium"
                  >
                    <option value="комплектующие">комплектующие</option>
                    <option value="деталь">деталь</option>
                    <option value="Сборочная единица">Сборочная единица</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Группа планир.:</label>
                  <select
                    value={selectedCell.planGroup || (selectedCell.hasMaterial ? 'Детали ЦМК' : 'Комплектующие')}
                    onChange={(e) => onUpdateCell({ ...selectedCell, planGroup: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-800 font-medium"
                  >
                    <option value="Комплектующие">Комплектующие</option>
                    <option value="Детали ЦМК">Детали ЦМК</option>
                    <option value="Окна и вставки">Окна и вставки</option>
                    <option value="Прочее">Прочее</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Blank Dimensions (L and B) */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Габариты заготовки / развертки</span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  S = {cellAreaM2} м²
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Ширина B (мм):</label>
                  <input
                    type="number"
                    value={selectedCell.glassWidth}
                    onChange={(e) =>
                      onUpdateCell({
                        ...selectedCell,
                        glassWidth: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs font-bold text-blue-700 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Высота L (мм):</label>
                  <input
                    type="number"
                    value={selectedCell.glassHeight}
                    onChange={(e) =>
                      onUpdateCell({
                        ...selectedCell,
                        glassHeight: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs font-bold text-blue-700 shadow-2xs"
                  />
                </div>
              </div>

              {/* Quick dimension offsets buttons */}
              <div className="flex items-center gap-1 pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCell({
                      ...selectedCell,
                      glassWidth: selectedCell.width,
                      glassHeight: selectedCell.height
                    })
                  }
                  className="px-1.5 py-0.5 text-[10px] bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-700 transition"
                  title="Ширина и высота равны проёму в осях"
                >
                  По осям
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCell({
                      ...selectedCell,
                      glassWidth: Math.max(0, selectedCell.width - 50),
                      glassHeight: Math.max(0, selectedCell.height - 50)
                    })
                  }
                  className="px-1.5 py-0.5 text-[10px] bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-700 transition"
                  title="Зазор 25мм со всех 4 сторон для уплотнителей"
                >
                  Зазор -25мм
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCell({
                      ...selectedCell,
                      glassWidth: Math.round((selectedCell.width + 86.5) * 10) / 10,
                      glassHeight: Math.round((selectedCell.height + 91.5) * 10) / 10
                    })
                  }
                  className="px-1.5 py-0.5 text-[10px] bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-700 transition"
                  title="Развертка короба утепления с отбортовками"
                >
                  Развертка короба
                </button>
              </div>
            </div>

            {/* Material Section: With or Without Material */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Материал позиции</span>
                {/* Toggle: Has material vs No material */}
                <div className="flex items-center rounded bg-slate-200 p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCell({
                        ...selectedCell,
                        hasMaterial: false,
                        material: '',
                        materialName: ''
                      })
                    }
                    className={`px-2 py-0.5 rounded font-medium transition ${
                      !selectedCell.hasMaterial
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Без материала
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateCell({
                        ...selectedCell,
                        hasMaterial: true,
                        material: selectedCell.material || 'Оц 0,9мм',
                        materialName:
                          selectedCell.materialName || 'Лист 0,9 Оц сталь ГОСТ 14918-80',
                        linkType: 'деталь',
                        planGroup: 'Детали ЦМК'
                      })
                    }
                    className={`px-2 py-0.5 rounded font-medium transition ${
                      selectedCell.hasMaterial
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    С материалом
                  </button>
                </div>
              </div>

              {!selectedCell.hasMaterial ? (
                <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-dashed border-slate-300 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    Позиция без материала (стеклопакет, решетка, створка). Поля материала в спецификации останутся чистыми.
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Обозначение материала:</label>
                    <input
                      type="text"
                      value={selectedCell.material || ''}
                      onChange={(e) =>
                        onUpdateCell({ ...selectedCell, material: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-semibold text-slate-800"
                      placeholder="напр. Оц 0,9мм"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Наименование материала:</label>
                    <input
                      type="text"
                      value={selectedCell.materialName || ''}
                      onChange={(e) =>
                        onUpdateCell({ ...selectedCell, materialName: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800"
                      placeholder="напр. Лист 0,9 Оц сталь ГОСТ 14918-80"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Шаблон техпроцесса:</label>
                    <input
                      type="text"
                      value={selectedCell.processTemplate || ''}
                      onChange={(e) =>
                        onUpdateCell({ ...selectedCell, processTemplate: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800"
                      placeholder="напр. Короб"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Attached Hardware for this Cell */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Привязанные метизы и компл. ({(selectedCell.dependencies || []).length}):
                </span>
                <button
                  onClick={() => onOpenFastenerModal({ cellId: selectedCell.id })}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 hover:bg-blue-50 px-1 py-0.5 rounded transition"
                >
                  <Plus className="w-2.5 h-2.5" /> Метиз
                </button>
              </div>

              {(selectedCell.dependencies || []).length === 0 ? (
                <div className="text-[11px] text-slate-400 border border-dashed border-slate-300 rounded p-2 text-center">
                  Метизы не привязаны. Кликните на метиз в каталоге справа или нажмите «+ Метиз».
                </div>
              ) : (
                <div className="space-y-1">
                  {(selectedCell.dependencies || []).map((dep) => (
                    <div
                      key={dep.id}
                      className="bg-white border border-slate-200 px-2 py-1.5 rounded text-[11px] flex items-center justify-between shadow-2xs"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="font-bold text-slate-800 block truncate" title={dep.name}>
                          {dep.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 block truncate">
                          {dep.article}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono font-bold text-emerald-700 text-[10px]">
                          {dep.evaluatedQty} {dep.unit}
                        </span>
                        <button
                          onClick={() => {
                            onUpdateCell({
                              ...selectedCell,
                              dependencies: selectedCell.dependencies.filter((d) => d.id !== dep.id)
                            });
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Удалить привязку"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. NOTHING SELECTED */}
        {!selectedLine && !selectedCell && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Tag className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-600 mb-1">Ничего не выбрано</p>
            <p className="text-[11px] text-slate-400">
              Кликните по любой линии или области слева, чтобы настроить параметры, привязать профиль, стеклопакет или короб.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
