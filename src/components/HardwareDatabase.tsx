import React, { useState } from 'react';
import { Search, Plus, Database, Check, Wrench, Layers } from 'lucide-react';
import catalogData from '../data/catalog.json';
import { CatalogHardwareItem } from '../types';

interface HardwareDatabaseProps {
  selectedLineId: string | null;
  selectedProfileId: string | null;
  selectedCellId: string | null;
  width?: number;
  onSelectHardware: (item: CatalogHardwareItem) => void;
}

export const HardwareDatabase: React.FC<HardwareDatabaseProps> = ({
  selectedLineId,
  selectedProfileId,
  selectedCellId,
  width = 300,
  onSelectHardware
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'screws' | 'bolts' | 'gaskets'>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Standard gaskets and factory accessories from А1187 М507
  const accessoryItems: CatalogHardwareItem[] = [
    { id: 'acc-1', article: 'EF100.1901', name: 'Уплотнитель межмодульный 35мм', type: 'Уплотнитель', standard: 'Alutech', diameter: '35', length: 'м', material: 'EPDM' },
    { id: 'acc-2', article: 'FRK307', name: 'Резина межмодульная (цех)', type: 'Резина', standard: 'Alutech', diameter: '—', length: 'м', material: 'EPDM' },
    { id: 'acc-3', article: 'FRK316', name: 'Уплотнитель в прижим 4мм', type: 'Уплотнитель', standard: 'Alutech', diameter: '4', length: 'м', material: 'EPDM' },
    { id: 'acc-4', article: 'SL160.0948', name: 'Шнур уплотнительный ф2,5мм', type: 'Шнур', standard: 'Alutech', diameter: '2.5', length: 'м', material: 'EPDM' },
    { id: 'acc-5', article: 'FRK300', name: 'Уплотнитель остекления', type: 'Уплотнитель', standard: 'Alutech', diameter: '—', length: 'м', material: 'EPDM' },
    { id: 'acc-6', article: 'FRK308', name: 'Уплотнитель вертикальный', type: 'Уплотнитель', standard: 'Alutech', diameter: '—', length: 'м', material: 'EPDM' },
    { id: 'acc-7', article: 'ISOLON TAPE 3', name: 'Изолон 3х30мм', type: 'Лента', standard: 'ТУ', diameter: '3х30', length: 'м', material: 'ППЭ' },
    { id: 'acc-8', article: 'Лента FIREKS 70', name: 'Лента термореактивная 70мм', type: 'Лента', standard: 'FIREKS', diameter: '70', length: 'м', material: 'Огнестойкий' },
    { id: 'acc-9', article: 'RookWool 150', name: 'Утеплитель минераловатный 150мм', type: 'Утеплитель', standard: 'ГОСТ', diameter: '150', length: 'м3', material: 'Базальт' }
  ];

  const allItems: CatalogHardwareItem[] = [...catalogData.hardware, ...accessoryItems];

  const filteredItems = allItems.filter((item) => {
    if (categoryFilter === 'screws' && !item.name.toLowerCase().includes('винт') && !item.name.toLowerCase().includes('самонарез')) return false;
    if (categoryFilter === 'bolts' && !item.name.toLowerCase().includes('болт') && !item.name.toLowerCase().includes('гайка') && !item.name.toLowerCase().includes('шайба')) return false;
    if (categoryFilter === 'gaskets' && !item.type.toLowerCase().includes('уплотнитель') && !item.type.toLowerCase().includes('резина') && !item.type.toLowerCase().includes('лента')) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.article.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.standard.toLowerCase().includes(q) ||
      item.material.toLowerCase().includes(q)
    );
  });

  const handleAdd = (item: CatalogHardwareItem) => {
    onSelectHardware(item);
    setJustAddedId(item.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const isTargetSelected = !!(selectedProfileId || selectedLineId || selectedCellId);

  return (
    <div
      style={{ width: `${width}px` }}
      className="bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden select-none shrink-0"
    >
      {/* Header with Database link badge */}
      <div className="h-10 border-b border-slate-200 px-3.5 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">БД: Метизы и Комплектующие</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          ● БД Метизы ({allItems.length})
        </span>
      </div>

      {/* Database connection banner */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px]">
        <span className="text-slate-600 truncate font-mono text-[10px]" title="Привязано к файлу: А1187 М507_Модуль Жукова.xlsx">
          📁 Привязано к: <strong>Метизы.xlsx</strong>
        </span>
        <span className="text-[10px] text-blue-600 hover:underline cursor-pointer">
          Обновить
        </span>
      </div>

      {/* Filter and Search */}
      <div className="p-2.5 border-b border-slate-200 space-y-2 bg-white">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск (4.2x32, 5.5, EPDM, ISO...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Quick category filter tags */}
        <div className="flex gap-1 text-[10px] overflow-x-auto pb-0.5">
          {(['all', 'screws', 'bolts', 'gaskets'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' && 'Все'}
              {cat === 'screws' && 'Самонарезы'}
              {cat === 'bolts' && 'Болты/Гайки'}
              {cat === 'gaskets' && 'Резина/Уплотнители'}
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="px-3 py-1 bg-amber-50/60 border-b border-amber-100 text-[10px] text-amber-800 flex items-center justify-between">
        <span>{isTargetSelected ? 'Нажмите «+» для добавления к выбранной детали' : 'Выберите деталь или стеклопакет для привязки'}</span>
      </div>

      {/* Database items list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs font-mono">
        {filteredItems.slice(0, 60).map((item) => {
          const isAdded = justAddedId === item.id;

          return (
            <div
              key={item.id}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-2xs transition flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 truncate text-[11px]">{item.article}</span>
                  {item.material && (
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-sans">
                      {item.material}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 truncate font-sans">{item.name}</div>
                {item.standard && (
                  <div className="text-[9px] text-slate-400 truncate">{item.standard}</div>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => handleAdd(item)}
                disabled={!isTargetSelected}
                className={`p-1.5 rounded transition shrink-0 ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : isTargetSelected
                    ? 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
                title={isTargetSelected ? 'Привязать к выбранной детали' : 'Сначала выберите деталь или линию'}
              >
                {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

