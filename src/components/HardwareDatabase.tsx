import React, { useState, useRef, useMemo } from 'react';
import { Search, Plus, Database, Check, Upload, RotateCcw, AlertCircle, Wrench } from 'lucide-react';
import { CatalogHardwareItem } from '../types';
import {
  getHardwareDB,
  parseAndSaveHardwareExcel,
  resetHardwareDB,
  getHardwareTypes
} from '../utils/databaseService';

interface HardwareDatabaseProps {
  selectedLineId: string | null;
  selectedProfileId: string | null;
  selectedCellId: string | null;
  selectedFillId?: string | null;
  targetDescription?: string;
  width?: number;
  onSelectHardware: (item: CatalogHardwareItem) => void;
  onOpenDatabaseManager?: () => void;
}

export const HardwareDatabase: React.FC<HardwareDatabaseProps> = ({
  selectedLineId,
  selectedProfileId,
  selectedCellId,
  selectedFillId,
  targetDescription,
  width = 300,
  onSelectHardware,
  onOpenDatabaseManager
}) => {
  const [dbState, setDbState] = useState(() => getHardwareDB());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hardwareTypes = useMemo(() => getHardwareTypes(dbState.items), [dbState.items]);

  const getHardwareSize = (item: CatalogHardwareItem): string => {
    if (item.diameter && item.length) {
      return `${item.diameter}х${item.length}`;
    }
    if (item.diameter) return `Ø${item.diameter}`;
    if (item.length) return `L${item.length}`;
    const m = item.article.match(/(\d+(?:[.,]\d+)?\s*[xхXХ]\s*\d+(?:[.,]\d+)?)/);
    if (m) return m[1].replace(/\s+/g, '').replace('x', 'х').replace('X', 'х');
    return '';
  };

  const hardwareSizes = useMemo(() => {
    const set = new Set<string>();
    const source = selectedType === 'all' ? dbState.items : dbState.items.filter((i) => i.type === selectedType);
    source.forEach((item) => {
      const s = getHardwareSize(item);
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [dbState.items, selectedType]);

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

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allItems.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      if (selectedSize !== 'all') {
        const s = getHardwareSize(item);
        if (s !== selectedSize) return false;
      }
      if (!q) return true;
      return (
        item.article.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.standard || '').toLowerCase().includes(q) ||
        (item.material || '').toLowerCase().includes(q) ||
        (item.diameter && item.diameter.toLowerCase().includes(q)) ||
        (item.length && item.length.toLowerCase().includes(q)) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }, [allItems, selectedType, selectedSize, searchQuery]);

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

      {/* Header */}
      <div className="h-10 border-b border-slate-200 px-3.5 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">БД: Метизы</h3>
        </div>
        <div className="flex items-center gap-2">
          {onOpenDatabaseManager && (
            <button
              onClick={onOpenDatabaseManager}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              title="Открыть менеджер баз данных (полное редактирование)"
            >
              Менеджер
            </button>
          )}
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            ● {allItems.length} поз.
          </span>
        </div>
      </div>

      {/* Database connection banner with Action Buttons */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] gap-1">
        <span
          className="text-slate-600 truncate font-mono text-[10px] max-w-[170px]"
          title={`Файл: ${dbState.filename}`}
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

      {/* Search Input & Dynamic Type Filter Dropdown */}
      <div className="p-2 border-b border-slate-200 bg-white space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по марке, названию, ГОСТ, d..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Dynamic Category & Size Filters */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] font-semibold text-slate-500 shrink-0">Тип:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedSize('all');
              }}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer truncate"
            >
              <option value="all">Все типы ({allItems.length})</option>
              {hardwareTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] font-semibold text-slate-500 shrink-0">Размер:</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer truncate"
            >
              <option value="all">Все ({hardwareSizes.length})</option>
              {hardwareSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selection context helper */}
      {targetDescription ? (
        <div className="px-3 py-1 bg-blue-50 border-b border-blue-200 text-blue-900 text-[10px] font-bold flex items-center justify-between">
          <span className="truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Цель привязки: {targetDescription}
          </span>
        </div>
      ) : !isTargetSelected ? (
        <div className="px-3 py-1 bg-amber-50 border-b border-amber-200 text-amber-800 text-[10px] font-medium flex items-center justify-between">
          <span>⚠️ Выберите линию, профиль или слой проёма для привязки</span>
        </div>
      ) : null}

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Метизы не найдены
          </div>
        ) : (
          filteredItems.map((item) => {
            const isJustAdded = justAddedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg p-2 transition group flex flex-col gap-1"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-bold text-xs text-slate-900 truncate block">
                      {item.article}
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight mt-0.5">
                      {item.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAdd(item)}
                    disabled={!isTargetSelected}
                    className={`shrink-0 p-1 rounded-md transition cursor-pointer ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : isTargetSelected
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title={isTargetSelected ? 'Привязать метиз' : 'Сначала выберите профиль или проём'}
                  >
                    {isJustAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 font-mono">
                  <span className="bg-white px-1 py-0.5 rounded border border-slate-200">
                    {item.type}
                  </span>
                  {item.diameter && (
                    <span className="bg-white px-1 py-0.5 rounded border border-slate-200">
                      Ø{item.diameter}
                    </span>
                  )}
                  {item.length && (
                    <span className="bg-white px-1 py-0.5 rounded border border-slate-200">
                      L={item.length}
                    </span>
                  )}
                  {item.standard && (
                    <span className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-600">
                      {item.standard}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
