import React, { useState } from 'react';
import { CellTemplate } from '../types';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import {
  getAllCellTemplates,
  saveCellTemplate,
  deleteCellTemplate,
  resetCellTemplates,
  areTemplatesEnabled,
  setTemplatesEnabled
} from '../utils/cellTemplates';

interface CellTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplatesChanged?: () => void;
}

export const CellTemplatesModal: React.FC<CellTemplatesModalProps> = ({
  isOpen,
  onClose,
  onTemplatesChanged
}) => {
  const [templates, setTemplates] = useState<CellTemplate[]>(() => getAllCellTemplates());
  const [isEnabled, setIsEnabled] = useState<boolean>(() => areTemplatesEnabled());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form fields for creating/editing
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [markPrefix, setMarkPrefix] = useState('СП');
  const [linkType, setLinkType] = useState<'деталь' | 'комплектующие' | 'Сборочная единица'>('комплектующие');
  const [hasMaterial, setHasMaterial] = useState(false);
  const [material, setMaterial] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [processTemplate, setProcessTemplate] = useState('');
  const [planGroup, setPlanGroup] = useState('Комплектующие');
  const [widthOffset, setWidthOffset] = useState<number>(-50);
  const [heightOffset, setHeightOffset] = useState<number>(-50);

  if (!isOpen) return null;

  const handleToggleEnabled = (checked: boolean) => {
    setIsEnabled(checked);
    setTemplatesEnabled(checked);
    onTemplatesChanged?.();
  };

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditingId(null);
    setTitle('Новый шаблон');
    setName('Стеклопакет / Короб');
    setMarkPrefix('ПОЗ');
    setLinkType('комплектующие');
    setHasMaterial(false);
    setMaterial('');
    setMaterialName('');
    setProcessTemplate('');
    setPlanGroup('Комплектующие');
    setWidthOffset(-50);
    setHeightOffset(-50);
  };

  const handleStartEdit = (tpl: CellTemplate) => {
    setEditingId(tpl.id);
    setIsCreatingNew(false);
    setTitle(tpl.title);
    setName(tpl.name);
    setMarkPrefix(tpl.markPrefix);
    setLinkType(tpl.linkType);
    setHasMaterial(tpl.hasMaterial);
    setMaterial(tpl.material || '');
    setMaterialName(tpl.materialName || '');
    setProcessTemplate(tpl.processTemplate || '');
    setPlanGroup(tpl.planGroup || (tpl.hasMaterial ? 'Детали ЦМК' : 'Комплектующие'));
    setWidthOffset(tpl.widthOffset || 0);
    setHeightOffset(tpl.heightOffset || 0);
  };

  const handleSave = () => {
    if (!title.trim() || !name.trim()) {
      alert('Пожалуйста, укажите название шаблона и наименование позиции');
      return;
    }

    const newTpl: CellTemplate = {
      id: editingId || `custom-tpl-${Date.now()}`,
      title: title.trim(),
      fillType: hasMaterial ? 'spandrel' : 'glass',
      name: name.trim(),
      markPrefix: markPrefix.trim() || 'ПОЗ',
      linkType,
      hasMaterial,
      material: hasMaterial ? material.trim() : '',
      materialName: hasMaterial ? materialName.trim() : '',
      processTemplate: processTemplate.trim(),
      planGroup: planGroup.trim() || (hasMaterial ? 'Детали ЦМК' : 'Комплектующие'),
      widthOffset,
      heightOffset,
      dependencies: []
    };

    saveCellTemplate(newTpl);
    const updated = getAllCellTemplates();
    setTemplates(updated);
    setEditingId(null);
    setIsCreatingNew(false);
    onTemplatesChanged?.();
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот шаблон?')) {
      deleteCellTemplate(id);
      const updated = getAllCellTemplates();
      setTemplates(updated);
      if (editingId === id) {
        setEditingId(null);
      }
      onTemplatesChanged?.();
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить шаблоны к заводским (Стеклопакет и Короб)?')) {
      const reset = resetCellTemplates();
      setTemplates(reset);
      setEditingId(null);
      setIsCreatingNew(false);
      onTemplatesChanged?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Менеджер шаблонов заполнений (проёмов)
              </h2>
              <p className="text-xs text-slate-500">
                Настройка, добавление и удаление шаблонов для быстрого заполнения областей
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toggle Banner */}
        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-200/80 flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => handleToggleEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>Показывать выпадающее меню шаблонов в «Окне параметров»</span>
          </label>
          <span className="text-[11px] text-slate-500">
            (Если выключить — проёмы заполняются только напрямую: «+ Деталь», «+ Комплектующее»)
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Активные шаблоны ({templates.length}):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Вернуть базовые шаблоны завода (Стеклопакет и Короб)"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Сбросить к заводским
              </button>
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить свой шаблон
              </button>
            </div>
          </div>

          {/* Form when creating or editing */}
          {(isCreatingNew || editingId) && (
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  {isCreatingNew ? 'Создание нового шаблона' : 'Редактирование шаблона'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingId(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                >
                  Отмена
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Название шаблона (в меню):
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="напр. Короб с полосой и опорами СП"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Наименование позиции (в спецификации):
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="напр. Короб утепления Оц 0,9мм"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Префикс марки:
                  </label>
                  <input
                    type="text"
                    value={markPrefix}
                    onChange={(e) => setMarkPrefix(e.target.value)}
                    placeholder="СП, К, ОБ, Д"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Тип связи (Vogbit):
                  </label>
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium"
                  >
                    <option value="деталь">деталь</option>
                    <option value="комплектующие">комплектующие</option>
                    <option value="Сборочная единица">Сборочная единица</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Отступ ширины (мм от осей):
                  </label>
                  <input
                    type="number"
                    value={widthOffset}
                    onChange={(e) => setWidthOffset(parseFloat(e.target.value) || 0)}
                    placeholder="-50 или +160"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Отступ высоты (мм от осей):
                  </label>
                  <input
                    type="number"
                    value={heightOffset}
                    onChange={(e) => setHeightOffset(parseFloat(e.target.value) || 0)}
                    placeholder="-50 или +160"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={hasMaterial}
                      onChange={(e) => setHasMaterial(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>Привязан листовой материал (деталь ЦМК)</span>
                  </label>
                </div>

                {hasMaterial && (
                  <>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                        Обозначение материала:
                      </label>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="напр. Оц 0,9мм или Лист АМг2 2мм"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                        Шаблон техпроцесса (ТП):
                      </label>
                      <input
                        type="text"
                        value={processTemplate}
                        onChange={(e) => setProcessTemplate(e.target.value)}
                        placeholder="напр. Короб, Детали, Экран"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingId(null);
                  }}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Сохранить шаблон
                </button>
              </div>
            </div>
          )}

          {/* Templates Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between gap-3 group transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {tpl.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {tpl.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(tpl)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer"
                        title="Редактировать шаблон"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tpl.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title="Удалить шаблон"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px] font-mono">
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      Марка: {tpl.markPrefix}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded border ${
                      tpl.linkType === 'деталь'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                        : tpl.linkType === 'Сборочная единица'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {tpl.linkType}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      W: {tpl.widthOffset > 0 ? `+${tpl.widthOffset}` : tpl.widthOffset} мм
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      H: {tpl.heightOffset > 0 ? `+${tpl.heightOffset}` : tpl.heightOffset} мм
                    </span>
                    {tpl.material && (
                      <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                        {tpl.material}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
          <span className="text-slate-500">
            Шаблоны сохраняются в памяти программы и доступны во всех создаваемых модулях.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

