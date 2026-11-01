import React, { useState, useEffect } from 'react';
import { X, Plus, Package, Component, Ruler, Palette, FileText, Check } from 'lucide-react';
import { StandaloneItem } from '../types';
import { getProcessTemplates } from '../utils/processTemplatesService';

interface StandaloneItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StandaloneItem) => void;
  initialItem?: StandaloneItem | null;
  projectCode?: string;
  defaultColor?: string;
}

export const StandaloneItemModal: React.FC<StandaloneItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  projectCode = 'А1187',
  defaultColor = 'RAL 7012'
}) => {
  const [itemType, setItemType] = useState<'part' | 'assembly'>(
    initialItem?.itemType === 'assembly' ? 'assembly' : 'part'
  );
  const [mark, setMark] = useState(initialItem?.mark || '');
  const [name, setName] = useState(initialItem?.name || '');
  const [pos, setPos] = useState(initialItem?.pos || '');
  const [processTemplate, setProcessTemplate] = useState(
    initialItem?.processTemplate || ''
  );
  const [quantity, setQuantity] = useState<number>(initialItem?.quantity || 1);
  const [unit, setUnit] = useState(initialItem?.unit || 'шт');
  const [planGroup, setPlanGroup] = useState(initialItem?.planGroup || '');

  // Part dimensions & materials
  const [material, setMaterial] = useState(initialItem?.material || '');
  const [materialName, setMaterialName] = useState(initialItem?.materialName || '');
  const [lengthMm, setLengthMm] = useState<string>(
    initialItem?.lengthMm !== undefined ? String(initialItem.lengthMm) : ''
  );
  const [widthMm, setWidthMm] = useState<string>(
    initialItem?.widthMm !== undefined ? String(initialItem.widthMm) : ''
  );
  const [thicknessMm, setThicknessMm] = useState<string>(
    initialItem?.thicknessMm !== undefined ? String(initialItem.thicknessMm) : ''
  );
  const [color, setColor] = useState(initialItem?.color || defaultColor);
  const [notes, setNotes] = useState(initialItem?.notes || '');

  const availableTemplates = getProcessTemplates();

  useEffect(() => {
    if (initialItem) {
      setItemType(initialItem.itemType === 'assembly' ? 'assembly' : 'part');
      setMark(initialItem.mark || '');
      setName(initialItem.name || '');
      setPos(initialItem.pos || '');
      setProcessTemplate(initialItem.processTemplate || '');
      setQuantity(initialItem.quantity || 1);
      setUnit(initialItem.unit || 'шт');
      setPlanGroup(initialItem.planGroup || '');
      setMaterial(initialItem.material || '');
      setMaterialName(initialItem.materialName || '');
      setLengthMm(initialItem.lengthMm !== undefined ? String(initialItem.lengthMm) : '');
      setWidthMm(initialItem.widthMm !== undefined ? String(initialItem.widthMm) : '');
      setThicknessMm(initialItem.thicknessMm !== undefined ? String(initialItem.thicknessMm) : '');
      setColor(initialItem.color || defaultColor);
      setNotes(initialItem.notes || '');
    } else {
      setItemType('part');
      setMark(`${projectCode}-КР01-01`);
      setName('Кронштейн опорный');
      setPos('КР-1');
      setProcessTemplate('Кронштейны сварные/сборные модульные');
      setQuantity(2);
      setUnit('шт');
      setPlanGroup('Детали ЦМК');
      setMaterial('Лист 4мм');
      setMaterialName('Сталь 09Г2С ГОСТ 19903-2015');
      setLengthMm('250');
      setWidthMm('180');
      setThicknessMm('4');
      setColor('Горячий цинк');
      setNotes('');
    }
  }, [initialItem, isOpen, projectCode, defaultColor]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Введите наименование позиции');
      return;
    }

    const item: StandaloneItem = {
      id: initialItem?.id || `standalone-${Date.now()}`,
      itemType,
      linkType: itemType === 'assembly' ? 'Сборочная единица' : 'деталь',
      mark: mark.trim() || `${projectCode}-ДЕТ-01`,
      name: name.trim(),
      pos: pos.trim() || undefined,
      processTemplate: processTemplate.trim() || (itemType === 'assembly' ? 'Кронштейны сварные/сборные модульные' : 'Детали ЦМК'),
      quantity: Math.max(1, quantity || 1),
      unit: unit.trim() || 'шт',
      planGroup: planGroup.trim() || (itemType === 'assembly' ? 'Сборочные единицы' : 'Детали ЦМК'),
      material: itemType === 'part' ? material.trim() : undefined,
      materialName: itemType === 'part' ? materialName.trim() : undefined,
      lengthMm: lengthMm ? parseFloat(lengthMm) || undefined : undefined,
      widthMm: widthMm ? parseFloat(widthMm) || undefined : undefined,
      thicknessMm: thicknessMm ? parseFloat(thicknessMm) || undefined : undefined,
      color: color.trim() || undefined,
      notes: notes.trim() || undefined
    };

    onSave(item);
    onClose();
  };

  const calculatedArea =
    lengthMm && widthMm ? ((parseFloat(lengthMm) || 0) * (parseFloat(widthMm) || 0)) / 1000000 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="h-12 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {itemType === 'assembly' ? (
              <Package className="w-4 h-4 text-purple-600" />
            ) : (
              <Component className="w-4 h-4 text-blue-600" />
            )}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {initialItem ? 'Редактировать позицию' : 'Добавить позицию в спецификацию'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs font-sans">
          {/* Type Selector: Part vs Assembly */}
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Тип сущности в спецификации (Vogbit):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setItemType('part');
                  if (!planGroup || planGroup === 'Сборочные единицы') setPlanGroup('Детали ЦМК');
                  if (processTemplate === 'Кронштейны сварные/сборные модульные') {
                    setProcessTemplate('Детали кронштейнов из металического листа');
                  }
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition cursor-pointer ${
                  itemType === 'part'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Component className="w-4 h-4 text-blue-600" />
                <span>Деталь (кронштейн, пластина, сухарь)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType('assembly');
                  if (!planGroup || planGroup === 'Детали ЦМК') setPlanGroup('Сборочные единицы');
                  setProcessTemplate('Кронштейны сварные/сборные модульные');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition cursor-pointer ${
                  itemType === 'assembly'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-2xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4 text-purple-600" />
                <span>Сборочная единица (сварной узел)</span>
              </button>
            </div>
          </div>

          {/* Name & Marking */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Наименование *:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Кронштейн верхний опорный"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Обозначение (Марка):
              </label>
              <input
                type="text"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                placeholder="А1187-КР01-01"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-blue-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Process Template (From TP DB) & Plan Group */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Шаблон техпроцесса (ТП для Vogbit):
              </label>
              <select
                value={processTemplate}
                onChange={(e) => setProcessTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Выберите шаблон ТП --</option>
                {availableTemplates.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                  Количество:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">{unit}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                  Поз. на чертеже:
                </label>
                <input
                  type="text"
                  value={pos}
                  onChange={(e) => setPos(e.target.value)}
                  placeholder="КР-1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Part Specific Fields: Dimensions & Material */}
          {itemType === 'part' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Ruler className="w-3 h-3 text-blue-600" />
                Параметры заготовки / материала:
              </span>

              {/* Material */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">Материал обозначение:</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Лист 4мм / Профиль 60х40х3"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Материал наименование:</label>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="Сталь 09Г2С ГОСТ 19903-2015"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Dims: L, B, S */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">Длина L (мм):</label>
                  <input
                    type="number"
                    value={lengthMm}
                    onChange={(e) => setLengthMm(e.target.value)}
                    placeholder="250"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Ширина B (мм):</label>
                  <input
                    type="number"
                    value={widthMm}
                    onChange={(e) => setWidthMm(e.target.value)}
                    placeholder="180"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Толщина K (мм):</label>
                  <input
                    type="number"
                    value={thicknessMm}
                    onChange={(e) => setThicknessMm(e.target.value)}
                    placeholder="4"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {calculatedArea > 0 && (
                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-mono flex justify-between">
                  <span>Расчетная площадь заготовки:</span>
                  <span className="font-bold">{calculatedArea.toFixed(4)} м²</span>
                </div>
              )}
            </div>
          )}

          {/* Color / Coating & Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Покрытие / цвет / покраска:
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Горячий цинк / RAL 7012"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Производственный комментарий:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Отверстия по чертежу КР-01"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="h-12 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 font-medium text-xs transition cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Сохранить позицию
          </button>
        </div>
      </div>
    </div>
  );
};

