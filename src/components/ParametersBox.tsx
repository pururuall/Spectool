import React, { useState, useEffect } from 'react';
import { LineSegment, Cell, ProfileBinding, CellFillItem, DependencyRule } from '../types';
import {
  Trash2,
  Plus,
  Layers,
  Tag,
  Ruler,
  Sparkles,
  Box,
  Info,
  Copy,
  ClipboardPaste,
  Scissors,
  Check,
  ChevronDown,
  Settings,
  X,
  Package,
  Wrench,
  Building2,
  HelpCircle
} from 'lucide-react';
import {
  getAllCellTemplates,
  normalizeCellFills,
  syncCellWithPrimaryFill,
  createFillFromTemplate,
  createBlankFill,
  areTemplatesEnabled
} from '../utils/cellTemplates';
import { generateProfileMark } from '../utils/namingService';
import { copyToClipboard, getFromClipboard } from '../utils/clipboardService';

interface ParametersBoxProps {
  allLines?: LineSegment[];
  allCells?: Cell[];
  selectedLine: LineSegment | null;
  selectedCell: Cell | null;
  selectedProfileId: string | null;
  selectedFillId?: string | null;
  projectCode?: string;
  projectColors?: string[];
  width?: number;
  onSelectLine?: (id: string | null) => void;
  onSelectCell?: (id: string | null) => void;
  onSelectFill?: (fillId: string | null) => void;
  onUpdateLine: (line: LineSegment) => void;
  onDeleteLine: (lineId: string) => void;
  onUpdateCell: (cell: Cell) => void;
  onDeleteCell?: (cellId: string) => void;
  onUpdateProfile: (lineId: string, prof: ProfileBinding) => void;
  onDeleteProfile: (lineId: string, profId: string) => void;
  onSelectProfile: (profId: string | null) => void;
  onAddDependencyToTarget?: (rule: DependencyRule) => void;
  onRemoveDependency?: (depId: string) => void;
  onOpenCellTemplatesModal?: () => void;
}

export const ParametersBox: React.FC<ParametersBoxProps> = ({
  allLines = [],
  allCells = [],
  selectedLine,
  selectedCell,
  selectedProfileId,
  selectedFillId,
  projectCode = 'А1187',
  projectColors = ['RAL 7012'],
  width = 320,
  onSelectLine,
  onSelectCell,
  onSelectFill,
  onUpdateLine,
  onDeleteLine,
  onUpdateCell,
  onDeleteCell,
  onUpdateProfile,
  onDeleteProfile,
  onSelectProfile,
  onAddDependencyToTarget,
  onRemoveDependency,
  onOpenCellTemplatesModal
}) => {
  const [templates, setTemplates] = useState(() => getAllCellTemplates());
  const [templatesEnabled, setTemplatesEnabled] = useState(() => areTemplatesEnabled());
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Quick Fastener Modal State
  const [fastenerTarget, setFastenerTarget] = useState<{
    type: 'profile' | 'fill';
    id: string; // profId or fillId
    title: string;
    dimensionMm: number;
  } | null>(null);

  const [fastenerArticle, setFastenerArticle] = useState('ВС 5,5х32, ISO14585, А2');
  const [fastenerName, setFastenerName] = useState('Винт самонарезающий');
  const [fastenerCalcMode, setFastenerCalcMode] = useState<'step' | 'formula' | 'fixed'>('step');
  const [fastenerStep, setFastenerStep] = useState<number>(200);
  const [fastenerQty, setFastenerQty] = useState<number>(2);
  const [fastenerUnit, setFastenerUnit] = useState<'шт' | 'м' | 'м2' | 'м3'>('шт');

  // Copied dependencies buffer (persisted in localStorage)
  const [copiedDeps, setCopiedDeps] = useState<DependencyRule[] | null>(() => {
    try {
      const raw = localStorage.getItem('spectool_copied_dependencies_v1');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setTemplates(getAllCellTemplates());
    setTemplatesEnabled(areTemplatesEnabled());
  }, [selectedCell?.id]);

  const handleCopyDependencies = (deps: DependencyRule[]) => {
    if (!deps || deps.length === 0) return;
    setCopiedDeps(deps);
    try {
      localStorage.setItem('spectool_copied_dependencies_v1', JSON.stringify(deps));
    } catch {}
  };

  const handlePasteDependenciesToProfile = (lineId: string, profId: string) => {
    if (!copiedDeps || copiedDeps.length === 0 || !selectedLine) return;
    const targetProf = selectedLine.profileBindings.find((p) => p.id === profId);
    if (!targetProf) return;
    const cloned = copiedDeps.map((d, i) => ({
      ...d,
      id: `dep-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`
    }));
    onUpdateProfile(lineId, {
      ...targetProf,
      dependencies: [...(targetProf.dependencies || []), ...cloned]
    });
  };

  const handlePasteDependenciesToCellFill = (fillId: string) => {
    if (!copiedDeps || copiedDeps.length === 0 || !selectedCell) return;
    const fills = normalizeCellFills(selectedCell);
    const cloned = copiedDeps.map((d, i) => ({
      ...d,
      id: `dep-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`
    }));
    const updated = fills.map((f) => {
      if (f.id !== fillId) return f;
      return {
        ...f,
        dependencies: [...(f.dependencies || []), ...cloned]
      };
    });
    onUpdateCell(syncCellWithPrimaryFill(selectedCell, updated));
  };

  // Delete single dependency from profile
  const handleDeleteProfileDep = (profId: string, depId: string) => {
    if (!selectedLine) return;
    const prof = selectedLine.profileBindings.find((p) => p.id === profId);
    if (!prof) return;
    onUpdateProfile(selectedLine.id, {
      ...prof,
      dependencies: (prof.dependencies || []).filter((d) => d.id !== depId)
    });
    onRemoveDependency?.(depId);
  };

  // Delete single dependency from cell fill
  const handleDeleteFillDep = (fillId: string, depId: string) => {
    if (!selectedCell) return;
    const fills = normalizeCellFills(selectedCell);
    const updated = fills.map((f) => {
      if (f.id !== fillId) return f;
      return {
        ...f,
        dependencies: (f.dependencies || []).filter((d) => d.id !== depId)
      };
    });
    onUpdateCell(syncCellWithPrimaryFill(selectedCell, updated));
    onRemoveDependency?.(depId);
  };

  // Add a blank layer (Part / Accessory / Assembly) directly to cell without template constraints
  const handleAddBlankLayerToCell = (kind: 'part' | 'accessory' | 'assembly') => {
    if (!selectedCell) return;
    const currentFills = normalizeCellFills(selectedCell);
    const newFill = createBlankFill(kind, selectedCell.width, selectedCell.height, currentFills.length + 1, projectCode);
    const updatedFills = [...currentFills, newFill];
    onUpdateCell(syncCellWithPrimaryFill(selectedCell, updatedFills));
    onSelectFill?.(newFill.id);
  };

  // Add fill from an active template
  const handleAddTemplateToCell = (templateId: string) => {
    if (!selectedCell) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    const currentFills = normalizeCellFills(selectedCell);
    const newFill = createFillFromTemplate(tpl, selectedCell.width, selectedCell.height, currentFills.length + 1, projectCode);
    const updatedFills = [...currentFills, newFill];
    onUpdateCell(syncCellWithPrimaryFill(selectedCell, updatedFills));
    onSelectFill?.(newFill.id);
    setIsTemplateMenuOpen(false);
  };

  // Update a specific fill layer in cell
  const handleUpdateFillInCell = (fillId: string, partial: Partial<CellFillItem>) => {
    if (!selectedCell) return;
    const currentFills = normalizeCellFills(selectedCell);
    const updatedFills = currentFills.map((f) => {
      if (f.id !== fillId) return f;
      return { ...f, ...partial };
    });
    onUpdateCell(syncCellWithPrimaryFill(selectedCell, updatedFills));
  };

  // Remove a specific fill layer from cell
  const handleRemoveFillFromCell = (fillId: string) => {
    if (!selectedCell) return;
    const currentFills = normalizeCellFills(selectedCell);
    if (currentFills.length <= 1) {
      alert('В проёме должен оставаться хотя бы один слой');
      return;
    }
    const updatedFills = currentFills.filter((f) => f.id !== fillId);
    onUpdateCell(syncCellWithPrimaryFill(selectedCell, updatedFills));
    if (selectedFillId === fillId) {
      onSelectFill?.(updatedFills[0]?.id || null);
    }
  };

  // Copy fill layer to universal clipboard
  const handleCopyFillLayer = (fill: CellFillItem) => {
    copyToClipboard('fill', fill.name || fill.mark, fill);
    alert(`Слой «${fill.name || fill.mark}» скопирован в буфер обмена`);
  };

  // Paste fill layer from universal clipboard
  const handlePasteFillLayer = () => {
    if (!selectedCell) return;
    const payload = getFromClipboard();
    if (!payload || payload.type !== 'fill') {
      alert('В буфере обмена нет скопированного слоя');
      return;
    }
    const original = payload.data as CellFillItem;
    const currentFills = normalizeCellFills(selectedCell);
    const newFill: CellFillItem = {
      ...original,
      id: `fill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      width: selectedCell.width,
      height: selectedCell.height,
      dependencies: (original.dependencies || []).map((d, i) => ({
        ...d,
        id: `dep-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`
      }))
    };
    const updated = [...currentFills, newFill];
    onUpdateCell(syncCellWithPrimaryFill(selectedCell, updated));
    onSelectFill?.(newFill.id);
  };

  // Submit Fastener from Quick Popover
  const handleAddFastener = (presetRule?: DependencyRule) => {
    if (!fastenerTarget) return;

    let rule: DependencyRule;
    if (presetRule) {
      rule = {
        ...presetRule,
        id: `dep-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      };
    } else {
      const isLinear = fastenerUnit === 'м';
      let evalQty = fastenerQty;
      let formula: string | undefined;

      if (fastenerCalcMode === 'step') {
        const step = Math.max(10, fastenerStep || 200);
        evalQty = Math.ceil(fastenerTarget.dimensionMm / step) + 1;
        formula = `ROUNDUP(L / ${step}, 0) + 1`;
      } else if (fastenerCalcMode === 'fixed') {
        evalQty = fastenerQty;
      } else if (isLinear) {
        evalQty = Math.round((fastenerTarget.dimensionMm / 1000) * 100) / 100;
        formula = 'L / 1000';
      }

      rule = {
        id: `dep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        article: fastenerArticle.trim(),
        name: fastenerName.trim(),
        type: fastenerArticle.toLowerCase().includes('винт') || fastenerArticle.toLowerCase().includes('самонарез')
          ? 'fastener'
          : fastenerUnit === 'м'
          ? 'gasket'
          : 'hardware',
        unit: fastenerUnit,
        calcType: fastenerCalcMode,
        quantity: fastenerQty,
        stepMm: fastenerCalcMode === 'step' ? fastenerStep : undefined,
        formula,
        evaluatedQty: evalQty
      };
    }

    if (fastenerTarget.type === 'profile' && selectedLine) {
      const prof = selectedLine.profileBindings.find((p) => p.id === fastenerTarget.id);
      if (prof) {
        onUpdateProfile(selectedLine.id, {
          ...prof,
          dependencies: [...(prof.dependencies || []), rule]
        });
      }
    } else if (fastenerTarget.type === 'fill' && selectedCell) {
      const fills = normalizeCellFills(selectedCell);
      const updated = fills.map((f) => {
        if (f.id !== fastenerTarget.id) return f;
        return {
          ...f,
          dependencies: [...(f.dependencies || []), rule]
        };
      });
      onUpdateCell(syncCellWithPrimaryFill(selectedCell, updated));
    }

    onAddDependencyToTarget?.(rule);
    setFastenerTarget(null);
  };

  const hasCopiedFillInClipboard = () => {
    const payload = getFromClipboard();
    return payload?.type === 'fill';
  };

  return (
    <div
      style={{ width: `${width}px` }}
      className="bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden select-none shrink-0"
    >
      {/* Header */}
      <div className="h-10 border-b border-slate-200 px-3 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
            Окно параметров
          </h3>
        </div>

        {selectedLine && (
          <button
            onClick={() => onDeleteLine(selectedLine.id)}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-50 transition cursor-pointer"
            title="Удалить выбранную линию"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Удалить</span>
          </button>
        )}

        {selectedCell && onDeleteCell && (
          <button
            onClick={() => onDeleteCell(selectedCell.id)}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-50 transition cursor-pointer"
            title="Удалить эту область"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Удалить область</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* 1. LINE / BEAM PARAMETERS */}
        {selectedLine && (
          <div className="space-y-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs truncate">
                  {selectedLine.name}
                </span>
                <span className="font-mono text-blue-700 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  L = {selectedLine.length} мм
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                <div>Точка 1: ({selectedLine.x1}, {selectedLine.y1})</div>
                <div>Точка 2: ({selectedLine.x2}, {selectedLine.y2})</div>
              </div>
            </div>

            {/* Profile bindings on this line */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  Привязанные профили ({selectedLine.profileBindings.length}):
                </span>
              </div>

              {selectedLine.profileBindings.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs text-center">
                  Профиль не привязан. Выберите профиль в колонке «БД: Профили» справа.
                </div>
              ) : (
                selectedLine.profileBindings.map((prof) => {
                  const isProfSelected = selectedProfileId === prof.id;
                  const cutLength = Math.max(0, Math.round(selectedLine.length - (prof.startOffset || 0) - (prof.endOffset || 0)));

                  return (
                    <div
                      key={prof.id}
                      onClick={() => onSelectProfile(prof.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer space-y-2 ${
                        isProfSelected
                          ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 text-xs block truncate" title={prof.name}>
                            {prof.name}
                          </span>
                          <span className="font-mono text-[11px] text-blue-600 font-semibold block truncate">
                            {prof.article}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProfile(selectedLine.id, prof.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                          title="Удалить профиль с линии"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Cut offsets */}
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-700 flex items-center gap-1">
                            <Scissors className="w-3 h-3 text-blue-600" />
                            Отступы от концов (подрезка):
                          </span>
                          <span className="font-mono text-emerald-700 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            L = {cutLength} мм
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-500 block">Отступ 1 (начало):</label>
                            <input
                              type="number"
                              value={prof.startOffset || 0}
                              onChange={(e) => {
                                const s = parseFloat(e.target.value) || 0;
                                const newL = Math.max(0, selectedLine.length - s - (prof.endOffset || 0));
                                onUpdateProfile(selectedLine.id, {
                                  ...prof,
                                  startOffset: s,
                                  calculatedLength: newL
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block">Отступ 2 (конец):</label>
                            <input
                              type="number"
                              value={prof.endOffset || 0}
                              onChange={(e) => {
                                const end = parseFloat(e.target.value) || 0;
                                const newL = Math.max(0, selectedLine.length - (prof.startOffset || 0) - end);
                                onUpdateProfile(selectedLine.id, {
                                  ...prof,
                                  endOffset: end,
                                  calculatedLength: newL
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-xs"
                            />
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

                      {/* Mark & Order number */}
                      <div className="space-y-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-slate-700">Обозначение (Марка):</label>
                          <button
                            type="button"
                            onClick={() => {
                              const ord = prof.orderNumber || selectedLine.orderNumber || 1;
                              const autoMark = generateProfileMark(projectCode || 'А1187', prof.article, selectedLine.length, ord);
                              onUpdateProfile(selectedLine.id, {
                                ...prof,
                                customMark: autoMark
                              });
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                            title="Сгенерировать марку по стандартной формуле"
                          >
                            <Sparkles className="w-2.5 h-2.5" /> По формуле
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={prof.customMark || ''}
                              onChange={(e) => onUpdateProfile(selectedLine.id, { ...prof, customMark: e.target.value })}
                              placeholder="А1187 0101-2555-1"
                              className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-blue-800"
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
                              placeholder="№ 1"
                              className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Color */}
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                          Цвет профиля / покраска:
                        </label>
                        <input
                          type="text"
                          value={prof.color || ''}
                          onChange={(e) => onUpdateProfile(selectedLine.id, { ...prof, color: e.target.value })}
                          placeholder="RAL 7012"
                          className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs mb-1"
                        />
                        <div className="flex flex-wrap gap-1">
                          {projectColors.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => onUpdateProfile(selectedLine.id, { ...prof, color: c })}
                              className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition ${
                                prof.color === c
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Attached Hardware for this profile */}
                      <div className="pt-1.5 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-slate-600">
                            Привязанные метизы ({(prof.dependencies || []).length}):
                          </span>
                          <div className="flex items-center gap-1">
                            {(prof.dependencies || []).length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleCopyDependencies(prof.dependencies)}
                                className="text-[9px] text-slate-600 hover:text-blue-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                                title="Скопировать все метизы этого профиля"
                              >
                                <Copy className="w-2.5 h-2.5" /> Копировать
                              </button>
                            )}
                            {copiedDeps && copiedDeps.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handlePasteDependenciesToProfile(selectedLine.id, prof.id)}
                                className="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 cursor-pointer"
                                title={`Вставить ${copiedDeps.length} метизов`}
                              >
                                <ClipboardPaste className="w-2.5 h-2.5" /> Вставить
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProfile(prof.id);
                                setFastenerTarget({
                                  type: 'profile',
                                  id: prof.id,
                                  title: `${prof.name} (${prof.customMark || prof.article})`,
                                  dimensionMm: prof.calculatedLength || selectedLine.length
                                });
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 hover:bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer border border-blue-200"
                            >
                              <Plus className="w-2.5 h-2.5" /> Метиз
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {(prof.dependencies || []).map((dep) => (
                            <div
                              key={dep.id}
                              className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[11px] flex items-center justify-between"
                            >
                              <span className="font-mono text-slate-700 truncate max-w-[150px]" title={dep.article}>
                                {dep.article}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-emerald-700 text-[10px]">
                                  {dep.evaluatedQty} {dep.unit}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProfileDep(prof.id, dep.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                                  title="Удалить этот метиз"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. UNIVERSAL CELL / AREA PARAMETERS WITH TOTAL FREEDOM */}
        {selectedCell && (
          <div className="space-y-3">
            {/* Header info */}
            <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-900 text-xs flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  Область ({selectedCell.width} × {selectedCell.height} мм)
                </span>
                <span className="text-[10px] font-mono text-blue-600">
                  X={selectedCell.x}, Y={selectedCell.y}
                </span>
              </div>
            </div>

            {/* Direct Add Action Bar: Total Flexibility */}
            {(() => {
              const fills = normalizeCellFills(selectedCell);

              return (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        Слои и элементы в проёме ({fills.length}):
                      </span>
                      {hasCopiedFillInClipboard() && (
                        <button
                          type="button"
                          onClick={handlePasteFillLayer}
                          className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition"
                          title="Вставить скопированный слой из буфера обмена"
                        >
                          <ClipboardPaste className="w-3 h-3" /> Вставить слой
                        </button>
                      )}
                    </span>

                    {/* Direct Quick Add Buttons */}
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddBlankLayerToCell('part')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition"
                        title="Добавить листовую деталь ЦМК (короб, полоса, экран, накладка)"
                      >
                        <Plus className="w-3 h-3 text-emerald-600" /> + Деталь
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddBlankLayerToCell('accessory')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition"
                        title="Добавить комплектующее (опоры СП, фиксаторы, шнуры)"
                      >
                        <Plus className="w-3 h-3 text-blue-600" /> + Компл.
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddBlankLayerToCell('assembly')}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition"
                        title="Добавить сборочную единицу (створка, готовый блок)"
                      >
                        <Plus className="w-3 h-3 text-amber-700" /> + СБ
                      </button>
                    </div>

                    {/* Optional Template Menu (Controlled by User Setting) */}
                    {templatesEnabled && (
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                            className="text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <span>Шаблоны ({templates.length})</span>
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>

                          {isTemplateMenuOpen && (
                            <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-1 space-y-0.5 text-[11px]">
                              {templates.map((tpl) => (
                                <button
                                  key={tpl.id}
                                  type="button"
                                  onClick={() => handleAddTemplateToCell(tpl.id)}
                                  className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition cursor-pointer"
                                >
                                  <span className="truncate">{tpl.title}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">{tpl.linkType}</span>
                                </button>
                              ))}
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  setIsTemplateMenuOpen(false);
                                  onOpenCellTemplatesModal?.();
                                }}
                                className="w-full text-left px-2 py-1 text-[10px] text-blue-700 font-bold hover:bg-blue-50 rounded flex items-center gap-1.5 cursor-pointer"
                              >
                                <Settings className="w-3 h-3 text-blue-600" />
                                <span>⚙ Настроить шаблоны...</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={onOpenCellTemplatesModal}
                          className="text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                          title="Открыть менеджер шаблонов заполнений"
                        >
                          <Settings className="w-3 h-3" />
                          <span>Менеджер шаблонов</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render each Fill Layer Card */}
                  {fills.map((fill, fIdx) => {
                    const isFillActive = (selectedFillId === fill.id) || (!selectedFillId && fIdx === 0);
                    const fillArea = Math.round(((fill.width * fill.height) / 1_000_000) * 100) / 100;

                    return (
                      <div
                        key={fill.id}
                        onClick={() => onSelectFill?.(fill.id)}
                        className={`rounded-xl p-2.5 transition cursor-pointer space-y-2 ${
                          isFillActive
                            ? 'bg-blue-50/30 border-2 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Layer Header */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isFillActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {fIdx + 1}
                            </span>
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {fill.name || 'Слой заполнения'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {isFillActive ? (
                              <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                🎯 Активный слой
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectFill?.(fill.id);
                                }}
                                className="text-[9px] text-slate-500 hover:text-blue-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                Выбрать цель
                              </button>
                            )}

                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1 rounded shrink-0">
                              {fillArea} м²
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyFillLayer(fill);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer"
                              title="Скопировать этот слой (с метизами) в буфер"
                            >
                              <Copy className="w-3 h-3" />
                            </button>

                            {fills.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFillFromCell(fill.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                title="Удалить этот слой из проёма"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Identification */}
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-500 block">Обозначение (Марка):</label>
                              <input
                                type="text"
                                value={fill.mark}
                                onChange={(e) => handleUpdateFillInCell(fill.id, { mark: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-blue-700 focus:bg-white"
                                placeholder="напр. СП-1, КРБ-1"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] text-slate-500 block">Тип связи:</label>
                              <select
                                value={fill.linkType}
                                onChange={(e) => handleUpdateFillInCell(fill.id, { linkType: e.target.value as any })}
                                className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-800 font-medium focus:bg-white cursor-pointer"
                              >
                                <option value="комплектующие">комплектующие</option>
                                <option value="деталь">деталь</option>
                                <option value="Сборочная единица">Сборочная единица</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] text-slate-500 block">Наименование слоя:</label>
                            <input
                              type="text"
                              value={fill.name}
                              onChange={(e) => handleUpdateFillInCell(fill.id, { name: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:bg-white font-medium"
                              placeholder="напр. Полоса оцинкованная, Короб Оц 0,9мм, Стеклопакет СПО 32мм"
                            />
                          </div>
                        </div>

                        {/* Cut Dimensions */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-700">Размеры заготовки/развертки:</span>
                            <div className="flex items-center gap-1 text-[9px]">
                              <button
                                type="button"
                                onClick={() => handleUpdateFillInCell(fill.id, { width: selectedCell.width, height: selectedCell.height })}
                                className="px-1 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                              >
                                По осям
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFillInCell(fill.id, { width: Math.max(0, selectedCell.width - 50), height: Math.max(0, selectedCell.height - 50) })}
                                className="px-1 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                              >
                                -25/-25
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-500 block">Ширина B (мм):</label>
                              <input
                                type="number"
                                value={fill.width}
                                onChange={(e) => handleUpdateFillInCell(fill.id, { width: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-blue-700"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 block">Высота L (мм):</label>
                              <input
                                type="number"
                                value={fill.height}
                                onChange={(e) => handleUpdateFillInCell(fill.id, { height: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-blue-700"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Material section */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-700">Материал слоя:</span>
                            <div className="flex items-center rounded bg-slate-200 p-0.5 text-[9px]">
                              <button
                                type="button"
                                onClick={() => handleUpdateFillInCell(fill.id, { hasMaterial: false, material: '', materialName: '' })}
                                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${!fill.hasMaterial ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'}`}
                              >
                                Без мат.
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFillInCell(fill.id, {
                                  hasMaterial: true,
                                  material: fill.material || 'Оц 0,9мм',
                                  materialName: fill.materialName || 'Лист 0,9 Оц сталь ГОСТ 14918-80',
                                  linkType: 'деталь',
                                  planGroup: 'Детали ЦМК'
                                })}
                                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${fill.hasMaterial ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'}`}
                              >
                                С мат.
                              </button>
                            </div>
                          </div>

                          {fill.hasMaterial && (
                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <input
                                type="text"
                                value={fill.material || ''}
                                onChange={(e) => handleUpdateFillInCell(fill.id, { material: e.target.value })}
                                placeholder="Обозначение (напр. Оц 0,9мм)"
                                className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={fill.materialName || ''}
                                onChange={(e) => handleUpdateFillInCell(fill.id, { materialName: e.target.value })}
                                placeholder="Полное наименование (напр. Лист 0,9 Оц ГОСТ 14918-80)"
                                className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800"
                              />
                              <input
                                type="text"
                                value={fill.processTemplate || ''}
                                onChange={(e) => handleUpdateFillInCell(fill.id, { processTemplate: e.target.value })}
                                placeholder="Шаблон техпроцесса (напр. Короб, Детали)"
                                className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800"
                              />
                            </div>
                          )}
                        </div>

                        {/* Layer Dependencies with Copy/Paste & Functional +Метиз */}
                        <div className="pt-1.5 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-slate-600">
                              Метизы/комплектующие ({(fill.dependencies || []).length}):
                            </span>
                            <div className="flex items-center gap-1">
                              {(fill.dependencies || []).length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyDependencies(fill.dependencies);
                                  }}
                                  className="text-[9px] text-slate-600 hover:text-blue-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                                  title="Скопировать метизы этого слоя"
                                >
                                  <Copy className="w-2.5 h-2.5" /> Копировать
                                </button>
                              )}
                              {copiedDeps && copiedDeps.length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePasteDependenciesToCellFill(fill.id);
                                  }}
                                  className="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 cursor-pointer"
                                  title={`Вставить ${copiedDeps.length} скопированных метизов`}
                                >
                                  <ClipboardPaste className="w-2.5 h-2.5" /> Вставить
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectFill?.(fill.id);
                                  setFastenerTarget({
                                    type: 'fill',
                                    id: fill.id,
                                    title: `${fill.name} [${fill.mark}]`,
                                    dimensionMm: fill.height || selectedCell.height
                                  });
                                }}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 hover:bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer border border-blue-200"
                              >
                                <Plus className="w-2.5 h-2.5" /> Метиз
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {(fill.dependencies || []).map((dep) => (
                              <div
                                key={dep.id}
                                className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[11px] flex items-center justify-between"
                              >
                                <span className="font-mono text-slate-700 truncate max-w-[150px]" title={dep.article}>
                                  {dep.article}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-emerald-700 text-[10px]">
                                    {dep.evaluatedQty} {dep.unit}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFillDep(fill.id, dep.id);
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                                    title="Удалить этот метиз"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* 3. NOTHING SELECTED */}
        {!selectedLine && !selectedCell && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Tag className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-600 mb-1">Ничего не выбрано</p>
            <p className="text-[11px] text-slate-400">
              Кликните по любой линии или области слева, чтобы настроить параметры, добавить детали, метизы или стеклопакет.
            </p>
          </div>
        )}
      </div>

      {/* QUICK FASTENER / ACCESSORY POPUP MODAL */}
      {fastenerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 select-none">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  Привязать метиз / комплектующее
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setFastenerTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Целевой элемент:</span>
                <span className="font-bold text-slate-900 truncate block">
                  {fastenerTarget.title} (L = {fastenerTarget.dimensionMm} мм)
                </span>
              </div>

              {/* Quick Factory Presets */}
              <div>
                <span className="text-[10px] font-bold text-slate-600 block mb-1">
                  Быстрые заводские варианты (1 клик):
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {[
                    {
                      label: 'Винт ВС 5,5х32 (шаг 200)',
                      article: 'ВС 5,5х32, ISO14585, А2',
                      name: 'Винт самонарезающий',
                      calcType: 'step' as const,
                      stepMm: 200,
                      unit: 'шт' as const
                    },
                    {
                      label: 'Винт ВС 4,2х16 (шаг 200)',
                      article: 'ВС 4,2х16, DIN7504-N, А2',
                      name: 'Винт самонарезающий',
                      calcType: 'step' as const,
                      stepMm: 200,
                      unit: 'шт' as const
                    },
                    {
                      label: 'Винт 5,5х25 Alutech (шаг 250)',
                      article: '201018 BC 5,5х25, DIN7982',
                      name: 'Винт самонарезающий Alutech',
                      calcType: 'step' as const,
                      stepMm: 250,
                      unit: 'шт' as const
                    },
                    {
                      label: 'Минвата RockWool 200мм',
                      article: 'Rockwool 200мм 80 кг/м3',
                      name: 'Утеплитель минераловатный',
                      calcType: 'formula' as const,
                      formula: 'ROUNDUP(Area * 0.15, 2)',
                      unit: 'м3' as const
                    },
                    {
                      label: 'Изолон 3х30мм (периметр)',
                      article: 'ISOLON TAPE 3',
                      name: 'Изолон 3х30мм',
                      calcType: 'formula' as const,
                      formula: 'ROUNDUP((L + W) * 2.05 / 1000, 1)',
                      unit: 'м' as const
                    },
                    {
                      label: 'Гвозди приварные 3,2х165 (6 шт)',
                      article: 'Гвоздь приварной 3,2х165',
                      name: 'Гвозди приварные омедненные',
                      calcType: 'fixed' as const,
                      quantity: 6,
                      unit: 'шт' as const
                    }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAddFastener(preset as any)}
                      className="px-2 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-left transition cursor-pointer font-medium"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-600 block">
                  Или задать свой метиз / формулу:
                </span>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={fastenerArticle}
                    onChange={(e) => setFastenerArticle(e.target.value)}
                    placeholder="Артикул / Обозначение"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-semibold"
                  />
                  <input
                    type="text"
                    value={fastenerName}
                    onChange={(e) => setFastenerName(e.target.value)}
                    placeholder="Полное наименование"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  />

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div>
                      <label className="text-[9px] text-slate-500 block">Расчёт:</label>
                      <select
                        value={fastenerCalcMode}
                        onChange={(e) => setFastenerCalcMode(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded px-1 py-1 text-xs font-medium cursor-pointer"
                      >
                        <option value="step">По шагу</option>
                        <option value="fixed">Фикс. кол-во</option>
                        <option value="formula">По формуле</option>
                      </select>
                    </div>

                    {fastenerCalcMode === 'step' ? (
                      <div>
                        <label className="text-[9px] text-slate-500 block">Шаг (мм):</label>
                        <input
                          type="number"
                          value={fastenerStep}
                          onChange={(e) => setFastenerStep(parseFloat(e.target.value) || 200)}
                          className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[9px] text-slate-500 block">Количество:</label>
                        <input
                          type="number"
                          value={fastenerQty}
                          onChange={(e) => setFastenerQty(parseFloat(e.target.value) || 1)}
                          className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[9px] text-slate-500 block">ЕИ:</label>
                      <select
                        value={fastenerUnit}
                        onChange={(e) => setFastenerUnit(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded px-1 py-1 text-xs font-medium cursor-pointer"
                      >
                        <option value="шт">шт</option>
                        <option value="м">м</option>
                        <option value="м2">м2</option>
                        <option value="м3">м3</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFastenerTarget(null)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleAddFastener()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-2xs"
              >
                + Привязать метиз
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
