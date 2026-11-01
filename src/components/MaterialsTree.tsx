import React, { useState, useRef, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  Database,
  Plus,
  Search,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { CatalogProfileItem, CatalogMaterialItem } from '../types';
import {
  getMaterialsDB,
  parseAndSaveMaterialsExcel,
  resetMaterialsDB
} from '../utils/databaseService';

interface MaterialsTreeProps {
  selectedLineId: string | null;
  width?: number;
  onBindProfileToSelectedLine: (profileItem: CatalogProfileItem) => void;
  onAddCustomProfile: () => void;
}

export const MaterialsTree: React.FC<MaterialsTreeProps> = ({
  selectedLineId,
  width = 290,
  onBindProfileToSelectedLine,
  onAddCustomProfile
}) => {
  const [dbState, setDbState] = useState(() => getMaterialsDB());
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Профили системные': true,
    'Листовой материал': true,
    'Заполнения и вставки': true
  });
  const [openSubsections, setOpenSubsections] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [justBoundArticle, setJustBoundArticle] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const res = await parseAndSaveMaterialsExcel(file);
      setDbState(getMaterialsDB());
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
    if (confirm('Сбросить базу материалов к заводским настройкам?')) {
      resetMaterialsDB();
      setDbState(getMaterialsDB());
      setUploadSuccess('База материалов сброшена к заводским позициям');
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSubsection = (subKey: string) => {
    setOpenSubsections((prev) => ({ ...prev, [subKey]: !prev[subKey] }));
  };

  // Group items by Section -> Subsection
  const treeData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = dbState.items.filter((item) => {
      if (!q) return true;
      return (
        item.article.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        item.subsection.toLowerCase().includes(q) ||
        (item.material && item.material.toLowerCase().includes(q))
      );
    });

    const sectionsMap: Record<string, Record<string, CatalogMaterialItem[]>> = {};

    filtered.forEach((item) => {
      const sec = item.section || 'Прочее';
      const sub = item.subsection || 'Общее';
      if (!sectionsMap[sec]) sectionsMap[sec] = {};
      if (!sectionsMap[sec][sub]) sectionsMap[sec][sub] = [];
      sectionsMap[sec][sub].push(item);
    });

    return sectionsMap;
  }, [dbState.items, searchQuery]);

  const handleBind = (item: CatalogMaterialItem) => {
    if (!selectedLineId) return;

    const profileItem: CatalogProfileItem = {
      article: item.article,
      name: item.name,
      system: item.system || item.subsection || 'Alutech',
      company: item.company || 'Alutech',
      defaultOffset: item.defaultOffset || 50,
      defaultOffsetFormula: item.defaultOffsetFormula || 'W - 50',
      category: item.category && ['frame_vertical', 'frame_horizontal', 'transom', 'clamp', 'cap', 'joint'].includes(item.category)
        ? (item.category as CatalogProfileItem['category'])
        : 'transom',
      suggestedAccessories: []
    };

    onBindProfileToSelectedLine(profileItem);
    setJustBoundArticle(item.article);
    setTimeout(() => setJustBoundArticle(null), 1500);
  };

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
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">БД: Профили и Материалы</h3>
        </div>
        <button
          onClick={onAddCustomProfile}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
          title="Добавить свой профиль в базу вручную"
        >
          <Plus className="w-3 h-3" /> Свой
        </button>
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
            className="text-[10px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 cursor-pointer transition border border-emerald-200"
            title="Привязать свой Excel-файл материалов (сохраняется постоянно)"
          >
            <Upload className="w-2.5 h-2.5" /> Выбрать
          </button>
          <button
            onClick={handleReset}
            className="text-[10px] text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-200 cursor-pointer transition"
            title="Сбросить к заводской базе материалов"
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

      {/* Search Input */}
      <div className="p-2 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по материалам (EF100, Оцинковка...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Helper hint */}
      <div className="px-3 py-1 bg-emerald-50/60 border-b border-emerald-100 text-[10px] text-emerald-800">
        {selectedLineId
          ? '⚡ Кликните на профиль для привязки к выбранной линии'
          : '💡 Выберите линию на холсте для привязки профиля'}
      </div>

      {/* Hierarchical folder tree */}
      <div className="flex-1 overflow-y-auto p-2 text-xs font-sans space-y-1">
        {Object.keys(treeData).length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Ничего не найдено
          </div>
        ) : (
          Object.entries(treeData).map(([sectionName, subsections]) => {
            const isSecOpen = openSections[sectionName] ?? true;
            const totalItemsCount = Object.values(subsections).reduce((acc, arr) => acc + arr.length, 0);

            return (
              <div key={sectionName} className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
                {/* 1st Level Folder: Section */}
                <button
                  onClick={() => toggleSection(sectionName)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-slate-800 hover:bg-slate-100 text-left font-bold cursor-pointer transition"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isSecOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{sectionName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-normal text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                    {totalItemsCount}
                  </span>
                </button>

                {/* Subsections & Items */}
                {isSecOpen && (
                  <div className="pl-2 pr-1 pb-1 space-y-1 bg-white">
                    {Object.entries(subsections).map(([subName, items]) => {
                      const subKey = `${sectionName}__${subName}`;
                      const isSubOpen = openSubsections[subKey] ?? true;

                      return (
                        <div key={subKey} className="border-l-2 border-slate-200 pl-1.5 mt-0.5">
                          {/* 2nd Level Folder: Subsection */}
                          <button
                            onClick={() => toggleSubsection(subKey)}
                            className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 text-left font-semibold text-[11px] cursor-pointer"
                          >
                            <div className="flex items-center gap-1 truncate">
                              {isSubOpen ? (
                                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate">{subName}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {items.length}
                            </span>
                          </button>

                          {/* Items in Subsection */}
                          {isSubOpen && (
                            <div className="space-y-1 pl-3.5 pt-0.5">
                              {items.map((item) => {
                                const isJustBound = justBoundArticle === item.article;

                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => handleBind(item)}
                                    className={`p-1.5 rounded border transition flex items-center justify-between gap-1.5 cursor-pointer ${
                                      isJustBound
                                        ? 'bg-emerald-50 border-emerald-400 shadow-2xs'
                                        : 'bg-slate-50/70 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
                                    }`}
                                    title={selectedLineId ? `Нажмите для привязки ${item.article} к выбранной линии` : `Выберите линию для привязки`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900 font-mono text-[11px] truncate">
                                          {item.article}
                                        </span>
                                        {item.material && (
                                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded shrink-0">
                                            {item.material}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-600 truncate">{item.name}</div>
                                      {(item.weight || item.width) && (
                                        <div className="text-[9px] text-slate-400 font-mono truncate">
                                          {item.weight && `${item.weight} ${item.unit === 'м2' ? 'кг/м²' : 'кг/м'}`}
                                          {item.width && item.depth && ` | ${item.width}×${item.depth} мм`}
                                        </div>
                                      )}
                                    </div>

                                    {isJustBound && (
                                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                                        <Check className="w-3 h-3" /> Привязано
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
