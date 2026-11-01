import React, { useState, useRef } from 'react';
import { Search, Plus, Database, Check, Upload, RotateCcw, AlertCircle } from 'lucide-react';
import { CatalogHardwareItem } from '../types';
import {
  getHardwareDB,
  parseAndSaveHardwareExcel,
  resetHardwareDB
} from '../utils/databaseService';

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
  const [dbState, setDbState] = useState(() => getHardwareDB());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'screws' | 'bolts' | 'rivets' | 'gaskets'>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const res = await parseAndSaveHardwareExcel(file);
      setDbState(getHardwareDB());
      setUploadSuccess(`Успешно загружено: ${res.count} поз. из «${res.filename}»`);
      setTimeout(() => setUploadSuccess(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg);
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить базу метизов к заводским настройкам (338 позиций)?')) {
      resetHardwareDB();
      setDbState(getHardwareDB());
      setUploadSuccess('База метизов сброшена к заводским 338 позициям');
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const allItems = dbState.items;

  const filteredItems = allItems.filter((item) => {
    const t = (item.type || '').toLowerCase();
    const n = (item.name || '').toLowerCase();
    const art = (item.article || '').toLowerCase();

    if (categoryFilter === 'screws' && !n.includes('винт') && !n.includes('самонарез') && !t.includes('винт') && !t.includes('самонарез')) {
      return false;
    }
    if (categoryFilter === 'bolts' && !n.includes('болт') && !n.includes('гайка') && !n.includes('шайба') && !t.includes('болт') && !t.includes('гайка')) {
      return false;
    }
    if (categoryFilter === 'rivets' && !n.includes('заклеп') && !t.includes('заклеп')) {
      return false;
    }
    if (categoryFilter === 'gaskets' && !t.includes('уплотнитель') && !t.includes('резина') && !t.includes('лента') && !n.includes('уплотнитель') && !n.includes('резина')) {
      return false;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      art.includes(q) ||
      n.includes(q) ||
      (item.standard || '').toLowerCase().includes(q) ||
      (item.material || '').toLowerCase().includes(q) ||
      t.includes(q)
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
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Header with Database link badge */}
      <div className="h-10 border-b border-slate-200 px-3.5 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">БД: Метизы</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          ● {allItems.length} поз.
        </span>
      </div>

      {/* Database connection banner with Action Buttons */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] gap-1">
        <span
          className="text-slate-600 truncate font-mono text-[10px] max-w-[170px]"
          title={`Файл: ${dbState.filename}${dbState.updatedAt ? ` (сохранен: ${dbState.updatedAt})` : ''}`}
        >
          📁 <strong>{dbState.filename}</strong>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 cursor-pointer transition"
            title="Привязать свой Excel-файл метизов (сохраняется постоянно)"
          >
            <Upload className="w-2.5 h-2.5" /> Выбрать
          </button>
          <button
            onClick={handleReset}
            className="text-[10px] text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-200 cursor-pointer transition"
            title="Сбросить к заводским 338 позициям"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Upload Notifications */}
      {uploadSuccess && (
        <div className="px-2.5 py-1 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-[10px] flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="truncate">{uploadSuccess}</span>
        </div>
      )}
      {uploadError && (
        <div className="px-2.5 py-1 bg-rose-50 border-b border-rose-200 text-rose-800 text-[10px] flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
          <span className="truncate">{uploadError}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="p-2.5 border-b border-slate-200 space-y-2 bg-white">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск (4.2x32, 5.5, EPDM, DIN...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Quick category filter tags */}
        <div className="flex gap-1 text-[10px] overflow-x-auto pb-0.5">
          {(['all', 'screws', 'bolts', 'rivets', 'gaskets'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' && 'Все'}
              {cat === 'screws' && 'Винты / Самонарезы'}
              {cat === 'bolts' && 'Болты / Гайки'}
              {cat === 'rivets' && 'Заклепки'}
              {cat === 'gaskets' && 'Уплотнители'}
            </button>
          ))}
        </div>
      </div>

      {/* Target hint */}
      <div className="px-3 py-1 bg-amber-50/60 border-b border-amber-100 text-[10px] text-amber-800 flex items-center justify-between">
        <span>{isTargetSelected ? 'Нажмите «+» для добавления к выбранной детали' : 'Выберите профиль или ячейку для привязки'}</span>
      </div>

      {/* Database items list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs font-mono">
        {filteredItems.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-sans">
            Ничего не найдено
          </div>
        ) : (
          filteredItems.slice(0, 100).map((item) => {
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
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 truncate">
                    {item.type && <span className="text-slate-500">{item.type}</span>}
                    {item.standard && <span>{item.standard}</span>}
                    {item.diameter && <span>Ø{item.diameter}</span>}
                    {item.length && <span>L={item.length}</span>}
                  </div>
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
          })
        )}
      </div>
    </div>
  );
};
