import React, { useState } from 'react';
import { Search, Plus, Wrench, Shield, Link2, Check, ArrowRight } from 'lucide-react';
import catalogData from '../data/catalog.json';
import { CatalogHardwareItem, DependencyRule } from '../types';

interface AssignmentPanelsProps {
  selectedLineId: string | null;
  selectedProfileId: string | null;
  selectedCellId: string | null;
  onAttachHardware: (item: CatalogHardwareItem, rule: Partial<DependencyRule>) => void;
  onAttachAccessory: (acc: { article: string; name: string; unit: 'м' | 'шт' | 'м2' | 'м3'; calcType: 'fixed' | 'formula'; formula?: string; quantity?: number }) => void;
}

export const AssignmentPanels: React.FC<AssignmentPanelsProps> = ({
  selectedLineId,
  selectedProfileId,
  selectedCellId,
  onAttachHardware,
  onAttachAccessory
}) => {
  const [fastenerSearch, setFastenerSearch] = useState('');
  const [accessorySearch, setAccessorySearch] = useState('');
  const [activeRuleType, setActiveRuleType] = useState<'step200' | 'step300' | 'fixed' | 'gasket105' | 'gasket205'>('step200');
  const [fixedQty, setFixedQty] = useState(2);

  // Common accessories list
  const standardAccessories = [
    { article: 'EF100.1901', name: 'Уплотнитель межмодульный 35мм', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 1.05 / 1000, 1)' },
    { article: 'FRK307', name: 'Резина межмодульная (цех)', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 1.05 * 2 / 1000, 1)' },
    { article: 'FRK316', name: 'Уплотнитель в прижим 4мм', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 1.05 / 1000, 1)' },
    { article: 'SL160.0948', name: 'Шнур уплотнительный ф2,5мм', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 1.05 / 1000, 1)' },
    { article: 'FRK300', name: 'Уплотнитель', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 4.2 / 1000, 1)' },
    { article: 'FRK308', name: 'Уплотнитель вертикальный межмодульный', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 1.05 / 1000, 1)' },
    { article: 'AYPC.F50.0903-01', name: 'Адаптер ПВХ 30мм', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 1.1 / 1000, 1)' },
    { article: 'ISOLON TAPE 3', name: 'Изолон 3х30мм', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 2.05 / 1000, 1)' },
    { article: 'Лента FIREKS 70мм', name: 'Лента термореактивная FIREKS 70мм', unit: 'м' as const, calcType: 'formula' as const, formula: 'ROUNDUP(L * 1.1 / 1000, 1)' },
    { article: 'RookWool 150мм', name: 'Утеплитель минераловатный', unit: 'м3' as const, calcType: 'formula' as const, formula: 'ROUNDUP(Area * 0.15, 2)' },
    { article: 'Гвоздь приварной 3,2х165', name: 'Гвоздь приварной с тарелкой', unit: 'шт' as const, calcType: 'formula' as const, formula: 'ROUNDUP(Area * 6, 0)' },
    { article: 'А1187 К1', name: 'Деталь подъема', unit: 'шт' as const, calcType: 'fixed' as const, quantity: 2 },
    { article: 'А1187 П1', name: 'Пластина-шайба t=3мм С245', unit: 'шт' as const, calcType: 'fixed' as const, quantity: 2 },
    { article: 'Подкладка опорная 32мм', name: 'Подкладка под стеклопакет', unit: 'шт' as const, calcType: 'fixed' as const, quantity: 2 }
  ];

  const filteredHardware = catalogData.hardware.filter((hw) => {
    if (!fastenerSearch) return true;
    const q = fastenerSearch.toLowerCase();
    return hw.article.toLowerCase().includes(q) || hw.name.toLowerCase().includes(q) || hw.standard.toLowerCase().includes(q);
  }).slice(0, 30);

  const filteredAccessories = standardAccessories.filter((acc) => {
    if (!accessorySearch) return true;
    const q = accessorySearch.toLowerCase();
    return acc.article.toLowerCase().includes(q) || acc.name.toLowerCase().includes(q);
  });

  const getActiveRule = (): Partial<DependencyRule> => {
    if (activeRuleType === 'step200') {
      return { calcType: 'step', stepMm: 200, formula: 'ROUNDUP(L / 200, 0) + 1' };
    }
    if (activeRuleType === 'step300') {
      return { calcType: 'step', stepMm: 300, formula: 'ROUNDUP(L / 300, 0) + 1' };
    }
    if (activeRuleType === 'gasket105') {
      return { calcType: 'formula', formula: 'ROUNDUP(L * 1.05 / 1000, 1)' };
    }
    if (activeRuleType === 'gasket205') {
      return { calcType: 'formula', formula: 'ROUNDUP(L * 2.05 / 1000, 1)' };
    }
    return { calcType: 'fixed', quantity: fixedQty };
  };

  return (
    <div className="flex-1 flex flex-col gap-2.5 overflow-hidden select-none">
      {/* 1. ПРИСВОЕНИЕ МЕТИЗОВ (как в эскизе) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden">
        <div className="h-9 border-b border-slate-200 px-3 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Присвоение метизов</h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">338 винтов/болтов</span>
        </div>

        {/* Search Input */}
        <div className="p-2 border-b border-slate-200 bg-slate-50/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск метизов (DIN 7981, 7982, 965, спецвинты)..."
              value={fastenerSearch}
              onChange={(e) => setFastenerSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* List of Hardware */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono">
          {filteredHardware.map((hw) => (
            <div
              key={hw.id}
              onClick={() => onAttachHardware(hw as any, getActiveRule())}
              className="p-1.5 rounded hover:bg-blue-50 border border-transparent hover:border-blue-200 cursor-pointer flex items-center justify-between group transition"
              title="Кликните, чтобы привязать к выбранному профилю или ячейке"
            >
              <div className="truncate pr-2">
                <span className="font-bold text-slate-900 group-hover:text-blue-700 block text-[11px] truncate">
                  {hw.article}
                </span>
                <span className="text-[9.5px] text-slate-500 block truncate">{hw.name}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. ПРИСВОЕНИЕ ЗАВИСИМОСТЕЙ (Правила расчёта) */}
      <div className="h-32 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Присвоение зависимостей</h4>
          </div>
          <span className="text-[10px] text-slate-500">Правило расчёта</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            onClick={() => setActiveRuleType('step200')}
            className={`px-2 py-1 rounded text-left font-mono border transition ${
              activeRuleType === 'step200'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            • Шаг 200 мм (L / 200 + 1)
          </button>
          <button
            onClick={() => setActiveRuleType('step300')}
            className={`px-2 py-1 rounded text-left font-mono border transition ${
              activeRuleType === 'step300'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            • Шаг 300 мм (L / 300 + 1)
          </button>
          <button
            onClick={() => setActiveRuleType('gasket105')}
            className={`px-2 py-1 rounded text-left font-mono border transition ${
              activeRuleType === 'gasket105'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            • Расход L * 1.05 (Уплотнитель)
          </button>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
            <span className="text-slate-600">Фикс. кол-во:</span>
            <input
              type="number"
              value={fixedQty}
              onChange={(e) => {
                setFixedQty(parseInt(e.target.value, 10) || 1);
                setActiveRuleType('fixed');
              }}
              className="w-10 bg-white border border-slate-300 rounded px-1 text-center font-mono font-bold"
            />
            <span className="text-slate-400">шт</span>
          </div>
        </div>
      </div>

      {/* 3. ПРИСВОЕНИЕ КОМПЛЕКТУЮЩИХ (Резинки, шнуры, ленты, изолон) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden">
        <div className="h-9 border-b border-slate-200 px-3 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Присвоение комплектующих</h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Уплотнители / Ленты</span>
        </div>

        {/* Search Input */}
        <div className="p-2 border-b border-slate-200 bg-slate-50/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск комплектующих (резина, лента, адаптер, Rockwool)..."
              value={accessorySearch}
              onChange={(e) => setAccessorySearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* List of Accessories */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono">
          {filteredAccessories.map((acc) => (
            <div
              key={acc.article}
              onClick={() => onAttachAccessory(acc)}
              className="p-1.5 rounded hover:bg-emerald-50 border border-transparent hover:border-emerald-200 cursor-pointer flex items-center justify-between group transition"
              title="Кликните, чтобы привязать к выбранному профилю или ячейке"
            >
              <div className="truncate pr-2">
                <span className="font-bold text-slate-900 group-hover:text-emerald-700 block text-[11px] truncate">
                  {acc.article}
                </span>
                <span className="text-[9.5px] text-slate-500 block truncate">{acc.name}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

