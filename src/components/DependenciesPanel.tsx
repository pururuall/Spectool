import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  Calculator,
  Settings2,
  Check,
  Edit2,
  X,
  Ruler,
  HelpCircle
} from 'lucide-react';
import { DependencyRule, LineSegment, Cell } from '../types';
import { calculateFormula } from '../utils/bomEngine';

interface DependenciesPanelProps {
  selectedLine: LineSegment | null;
  selectedProfileId: string | null;
  selectedCell: Cell | null;
  selectedRuleId?: string | null;
  onAddDependency: (rule: DependencyRule) => void;
  onUpdateDependency: (rule: DependencyRule) => void;
  onRemoveDependency: (ruleId: string) => void;
}

export const DependenciesPanel: React.FC<DependenciesPanelProps> = ({
  selectedLine,
  selectedProfileId,
  selectedCell,
  selectedRuleId,
  onAddDependency,
  onUpdateDependency,
  onRemoveDependency
}) => {
  // Mode for adding: 'step' | 'formula' | 'fixed'
  const [calcMode, setCalcMode] = useState<'step' | 'formula' | 'fixed'>('step');
  const [customName, setCustomName] = useState('Винт самонарезающий');
  const [customArticle, setCustomArticle] = useState('ВС 5,5х32, ISO14585, А2');
  const [customStep, setCustomStep] = useState<number>(200);
  const [customUnit, setCustomUnit] = useState<'шт' | 'м' | 'м2'>('шт');
  const [customFixedQty, setCustomFixedQty] = useState<number>(2);
  const [customFormula, setCustomFormula] = useState<string>('ROUNDUP(L / 200, 0) + 1');

  // Currently editing dependency rule
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editCalcType, setEditCalcType] = useState<'step' | 'formula' | 'fixed'>('step');
  const [editStepMm, setEditStepMm] = useState<number>(200);
  const [editFormula, setEditFormula] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editUnit, setEditUnit] = useState<'шт' | 'м' | 'м2'>('шт');
  const [editName, setEditName] = useState<string>('');
  const [editArticle, setEditArticle] = useState<string>('');

  const selectedProfile =
    selectedLine?.profileBindings.find((p) => p.id === selectedProfileId) || null;
  const activeDependencies =
    selectedProfile?.dependencies || selectedCell?.dependencies || [];

  const targetLength = selectedProfile ? selectedProfile.calculatedLength : 2555;
  const targetArea = selectedCell
    ? ((selectedCell.glassWidth || selectedCell.width) * (selectedCell.glassHeight || selectedCell.height)) / 1_000_000
    : 1;

  // Helper to calculate evaluated qty for any rule settings
  const evaluateRuleQty = (
    type: 'step' | 'formula' | 'fixed',
    step: number,
    formula: string,
    qty: number
  ): number => {
    if (type === 'fixed') return qty || 1;
    if (type === 'step') {
      const s = Math.max(10, step || 200);
      return Math.ceil(targetLength / s) + 1;
    }
    if (type === 'formula') {
      return calculateFormula(formula, {
        L: targetLength,
        W: selectedCell?.width || 1000,
        H: selectedCell?.height || 2555,
        Area: targetArea
      });
    }
    return 1;
  };

  // Preview quantity for adding
  const previewQty = evaluateRuleQty(calcMode, customStep, customFormula, customFixedQty);

  // Update step input and sync formula
  const handleStepChange = (val: number) => {
    setCustomStep(val);
    setCustomFormula(`ROUNDUP(L / ${val || 200}, 0) + 1`);
  };

  // Add rule
  const handleAdd = () => {
    let finalFormula: string | undefined;
    let finalStep: number | undefined;
    let finalQty: number | undefined;

    if (calcMode === 'step') {
      finalStep = customStep || 200;
      finalFormula = `ROUNDUP(L / ${finalStep}, 0) + 1`;
      finalQty = Math.ceil(targetLength / finalStep) + 1;
    } else if (calcMode === 'formula') {
      finalFormula = customFormula;
      finalQty = evaluateRuleQty('formula', 0, customFormula, 1);
    } else {
      finalQty = customFixedQty || 1;
      finalFormula = `Фикс: ${finalQty} ${customUnit}`;
    }

    const newRule: DependencyRule = {
      id: `dep-${Date.now()}`,
      article: customArticle || 'ВС 5,5х32',
      name: customName || (calcMode === 'step' ? `Крепление (шаг ${finalStep} мм)` : 'Комплектующее'),
      type: customUnit === 'м' ? 'gasket' : 'fastener',
      unit: customUnit,
      calcType: calcMode,
      stepMm: finalStep,
      quantity: finalQty,
      formula: finalFormula,
      evaluatedQty: finalQty
    };

    onAddDependency(newRule);
  };

  // Start editing existing rule
  const handleStartEdit = (dep: DependencyRule) => {
    setEditingRuleId(dep.id);
    setEditCalcType(dep.calcType || 'fixed');
    setEditStepMm(dep.stepMm || 200);
    setEditFormula(dep.formula || (dep.stepMm ? `ROUNDUP(L / ${dep.stepMm}, 0) + 1` : ''));
    setEditQuantity(dep.quantity || 1);
    setEditUnit((dep.unit as any) || 'шт');
    setEditName(dep.name);
    setEditArticle(dep.article);
  };

  React.useEffect(() => {
    if (selectedRuleId) {
      const dep = activeDependencies.find((d) => d.id === selectedRuleId);
      if (dep) {
        handleStartEdit(dep);
      }
    }
  }, [selectedRuleId]);

  // Commit editing changes
  const handleSaveEdit = () => {
    if (!editingRuleId) return;

    let finalFormula: string | undefined;
    let finalStep: number | undefined;
    let finalQty: number = 1;

    if (editCalcType === 'step') {
      finalStep = editStepMm || 200;
      finalFormula = `ROUNDUP(L / ${finalStep}, 0) + 1`;
      finalQty = Math.ceil(targetLength / finalStep) + 1;
    } else if (editCalcType === 'formula') {
      finalFormula = editFormula;
      finalQty = evaluateRuleQty('formula', 0, editFormula, 1);
    } else {
      finalQty = editQuantity || 1;
      finalFormula = `Фикс: ${finalQty} ${editUnit}`;
    }

    const updatedRule: DependencyRule = {
      id: editingRuleId,
      article: editArticle,
      name: editName,
      type: editUnit === 'м' ? 'gasket' : 'fastener',
      unit: editUnit,
      calcType: editCalcType,
      stepMm: finalStep,
      quantity: finalQty,
      formula: finalFormula,
      evaluatedQty: finalQty
    };

    onUpdateDependency(updatedRule);
    setEditingRuleId(null);
  };

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden select-none min-w-[280px]">
      {/* Header */}
      <div className="h-10 border-b border-slate-200 px-3.5 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Привязки и Зависимости
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          {activeDependencies.length} правил
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* Active Target Banner */}
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-semibold">Целевой элемент:</span>
            <span className="font-bold text-slate-800 truncate block">
              {selectedProfile
                ? `Профиль: ${selectedProfile.name}`
                : selectedLine
                ? `Линия: ${selectedLine.name}`
                : selectedCell
                ? `Заполнение: ${selectedCell.name}`
                : 'Не выбран (выберите деталь слева)'}
            </span>
          </div>
          {selectedProfile && (
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              L = {selectedProfile.calculatedLength} мм
            </span>
          )}
        </div>

        {/* 1. Add new Dependency Rule with FREE STEP input and presets */}
        <div className="border border-slate-200 rounded-lg p-3 space-y-2.5 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              Задать правило расчёта:
            </span>
          </div>

          {/* Type Selector (Step / Formula / Fixed) */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => {
                setCalcMode('step');
                setCustomUnit('шт');
                handleStepChange(customStep || 200);
              }}
              className={`py-1 rounded text-center transition cursor-pointer ${
                calcMode === 'step'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📏 По шагу
            </button>
            <button
              onClick={() => {
                setCalcMode('formula');
                setCustomUnit('м');
                setCustomFormula('ROUNDUP(L * 1.05 / 1000, 1)');
              }}
              className={`py-1 rounded text-center transition cursor-pointer ${
                calcMode === 'formula'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📐 По формуле
            </button>
            <button
              onClick={() => {
                setCalcMode('fixed');
                setCustomUnit('шт');
                setCustomFormula(`Фикс: ${customFixedQty} шт`);
              }}
              className={`py-1 rounded text-center transition cursor-pointer ${
                calcMode === 'fixed'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔢 Фикс. кол-во
            </button>
          </div>

          {/* Form fields based on selected calcMode */}
          {calcMode === 'step' && (
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-blue-600" />
                  Шаг крепления (мм):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="20"
                    step="10"
                    value={customStep}
                    onChange={(e) => handleStepChange(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white border border-slate-300 rounded px-2 py-0.5 text-right font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                    placeholder="200"
                  />
                  <span className="text-slate-500 font-mono text-[11px]">мм</span>
                </div>
              </div>

              {/* Quick shortcut chips for fast step selection */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400">Быстрый шаг:</span>
                {[150, 200, 250, 300, 400].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStepChange(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition cursor-pointer ${
                      customStep === s
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s} мм
                  </button>
                ))}
              </div>
            </div>
          )}

          {calcMode === 'formula' && (
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                  Формула расчёта (L = длина, W = ширина, Area = площадь):
                </label>
                <input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs text-blue-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick formula presets */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => {
                    setCustomFormula('ROUNDUP(L * 1.05 / 1000, 1)');
                    setCustomUnit('м');
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Резина: L * 1.05 (м)
                </button>
                <button
                  onClick={() => {
                    setCustomFormula('ROUNDUP(L * 1.05 * 2 / 1000, 1)');
                    setCustomUnit('м');
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  2 нити (цех): L * 1.05 * 2
                </button>
                <button
                  onClick={() => {
                    setCustomFormula('ROUNDUP(Area * 6, 0)');
                    setCustomUnit('шт');
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Гвозди утеплителя: 6 шт/м²
                </button>
              </div>
            </div>
          )}

          {calcMode === 'fixed' && (
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700">Фиксированное количество:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={customFixedQty}
                  onChange={(e) => setCustomFixedQty(parseFloat(e.target.value) || 1)}
                  className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 text-right font-mono font-bold text-blue-700"
                />
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono"
                >
                  <option value="шт">шт</option>
                  <option value="м">м</option>
                  <option value="компл">компл</option>
                </select>
              </div>
            </div>
          )}

          {/* Article & Name fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">Артикул:</span>
              <input
                type="text"
                value={customArticle}
                onChange={(e) => setCustomArticle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-[11px]"
                placeholder="напр. ВС 5,5х32"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">Наименование:</span>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px]"
                placeholder="напр. Саморез"
              />
            </div>
          </div>

          {/* Live calculation result badge */}
          <div className="bg-blue-50 border border-blue-200 p-2 rounded flex items-center justify-between text-[11px]">
            <span className="text-blue-900 font-medium">Расчётное количество:</span>
            <span className="font-mono font-bold text-blue-700 text-sm">
              {previewQty} {customUnit}
            </span>
          </div>

          {/* Apply button */}
          <button
            onClick={handleAdd}
            disabled={!selectedProfile && !selectedCell}
            className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
              selectedProfile || selectedCell
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Привязать к детали
          </button>
        </div>

        {/* 2. List of Active Dependencies WITH INLINE EDITING */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 block">
              Привязанные зависимости ({activeDependencies.length}):
            </span>
            <span className="text-[10px] text-slate-400">кликните на карточку для изменения</span>
          </div>

          {activeDependencies.length === 0 ? (
            <div className="p-3 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-[11px]">
              На этой детали пока нет привязок. Настройте правило выше или кликните «+» в базе метизов справа.
            </div>
          ) : (
            <div className="space-y-2">
              {activeDependencies.map((dep) => {
                const isEditing = editingRuleId === dep.id;

                if (isEditing) {
                  // Interactive Edit Card
                  const editPreview = evaluateRuleQty(
                    editCalcType,
                    editStepMm,
                    editFormula,
                    editQuantity
                  );

                  return (
                    <div
                      key={dep.id}
                      className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50/40 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-blue-200 pb-1.5">
                        <span className="font-bold text-blue-900 text-xs flex items-center gap-1">
                          <Edit2 className="w-3 h-3 text-blue-600" />
                          Редактирование расчёта
                        </span>
                        <button
                          onClick={() => setEditingRuleId(null)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Mode switch */}
                      <div className="grid grid-cols-3 gap-1 bg-white p-0.5 rounded border border-blue-200 text-[10px] font-semibold">
                        <button
                          onClick={() => {
                            setEditCalcType('step');
                            setEditFormula(`ROUNDUP(L / ${editStepMm || 200}, 0) + 1`);
                          }}
                          className={`py-1 rounded text-center transition cursor-pointer ${
                            editCalcType === 'step'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          По шагу
                        </button>
                        <button
                          onClick={() => {
                            setEditCalcType('formula');
                            if (!editFormula) setEditFormula('ROUNDUP(L * 1.05 / 1000, 1)');
                          }}
                          className={`py-1 rounded text-center transition cursor-pointer ${
                            editCalcType === 'formula'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          По формуле
                        </button>
                        <button
                          onClick={() => setEditCalcType('fixed')}
                          className={`py-1 rounded text-center transition cursor-pointer ${
                            editCalcType === 'fixed'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Фикс. кол-во
                        </button>
                      </div>

                      {/* Edit Fields */}
                      {editCalcType === 'step' && (
                        <div className="bg-white p-2 rounded border border-blue-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-700">Шаг (мм):</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="20"
                                step="10"
                                value={editStepMm}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setEditStepMm(val);
                                  setEditFormula(`ROUNDUP(L / ${val || 200}, 0) + 1`);
                                }}
                                className="w-20 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-right font-mono font-bold text-blue-700"
                              />
                              <span className="text-[11px] font-mono text-slate-500">мм</span>
                            </div>
                          </div>
                          {/* Step shortcuts */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {[150, 200, 250, 300, 400].map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  setEditStepMm(s);
                                  setEditFormula(`ROUNDUP(L / ${s}, 0) + 1`);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                                  editStepMm === s
                                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {editCalcType === 'formula' && (
                        <div className="bg-white p-2 rounded border border-blue-200 space-y-1">
                          <span className="text-[10px] text-slate-500 font-semibold block">Формула:</span>
                          <input
                            type="text"
                            value={editFormula}
                            onChange={(e) => setEditFormula(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-mono text-xs text-blue-800 font-semibold"
                          />
                        </div>
                      )}

                      {editCalcType === 'fixed' && (
                        <div className="bg-white p-2 rounded border border-blue-200 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-700">Количество:</span>
                          <input
                            type="number"
                            min="1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 1)}
                            className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-right font-mono font-bold text-blue-700"
                          />
                        </div>
                      )}

                      {/* Recalculated result readout */}
                      <div className="flex items-center justify-between text-[11px] font-mono bg-white px-2 py-1 rounded border border-blue-200">
                        <span className="text-slate-600">Пересчитанный итог:</span>
                        <span className="font-bold text-emerald-700">
                          {editPreview} {editUnit}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 py-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditingRuleId(null)}
                          className="py-1 px-2.5 rounded bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-300 cursor-pointer transition"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={() => {
                            onRemoveDependency(dep.id);
                            setEditingRuleId(null);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Удалить правило"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                // Normal View Card (Clickable to edit!)
                return (
                  <div
                    key={dep.id}
                    onClick={() => handleStartEdit(dep)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 transition cursor-pointer flex items-center justify-between group shadow-2xs"
                    title="Кликните, чтобы изменить шаг или формулу расчёта"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate text-[11px] font-mono">
                          {dep.article}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {dep.calcType === 'step'
                            ? `Шаг ${dep.stepMm} мм`
                            : dep.calcType === 'formula'
                            ? 'Формула'
                            : 'Фикс'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{dep.name}</div>
                      <div className="text-[9.5px] text-blue-700 font-mono mt-0.5 flex items-center gap-1">
                        <span className="text-slate-400">Формула:</span>
                        <span>{dep.formula || `Шаг ${dep.stepMm} мм`}</span>
                        <span className="text-slate-400">➔</span>
                        <strong className="text-emerald-700 font-bold">
                          {dep.evaluatedQty} {dep.unit}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(dep);
                        }}
                        className="text-[10.5px] text-blue-700 font-semibold px-2 py-0.5 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 transition cursor-pointer shadow-2xs"
                        title="Нажмите, чтобы изменить шаг или формулу расчёта"
                      >
                        <Edit2 className="w-3 h-3 text-blue-600" />
                        Изменить
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveDependency(dep.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Удалить привязку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
