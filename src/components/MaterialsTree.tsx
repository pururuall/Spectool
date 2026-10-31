import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Database, Plus, Check, Search } from 'lucide-react';
import { CatalogProfileItem } from '../types';
import catalogData from '../data/catalog.json';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [openSheets, setOpenSheets] = useState(true);
  const [openProfiles, setOpenProfiles] = useState(true);
  const [openAlutech, setOpenAlutech] = useState(true);
  const [openSchueco, setOpenSchueco] = useState(true);

  // Group profiles from catalog
  const alutechProfiles = catalogData.profiles.filter(
    (p) =>
      p.company === 'Alutech' &&
      (!searchQuery ||
        p.article.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const schuecoProfiles = catalogData.profiles.filter(
    (p) =>
      p.company === 'Schüco' &&
      (!searchQuery ||
        p.article.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      style={{ width: `${width}px` }}
      className="bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden select-none shrink-0"
    >
      {/* Title matching sketch "Материалы" */}
      <div className="h-10 border-b border-slate-200 px-3.5 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">БД: Профили и Материалы</h3>
        </div>
        <button
          onClick={onAddCustomProfile}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
          title="Добавить свой профиль в базу"
        >
          <Plus className="w-3 h-3" /> Свой
        </button>
      </div>

      {/* Database connection banner */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px]">
        <span className="text-slate-600 truncate font-mono text-[10px]" title="Привязано к файлу: Каталог_Профилей.xlsx">
          📁 Привязано к: <strong>Каталог_Профилей.xlsx</strong>
        </span>
        <span className="text-[10px] text-blue-600 hover:underline cursor-pointer">
          Обновить
        </span>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по профилям (EF100, 0101...)"
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

      <div className="flex-1 overflow-y-auto p-2 text-xs font-sans space-y-1">
        {/* 1. ЛИСТОВОЙ МАТЕРИАЛ (Al, Fe) */}
        <div>
          <button
            onClick={() => setOpenSheets(!openSheets)}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-left font-semibold cursor-pointer"
          >
            {openSheets ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>Листовой мат. (Al, Fe)</span>
          </button>

          {openSheets && (
            <div className="pl-6 space-y-0.5 mt-0.5 text-[11px]">
              <div className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded flex items-center justify-between cursor-pointer">
                <span>Al (Лист алюминиевый 2мм / 3мм)</span>
              </div>
              <div className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded flex items-center justify-between cursor-pointer">
                <span>Fe (Оцинкованная сталь 0.9мм / 0.7мм)</span>
              </div>
              <div className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded flex items-center justify-between cursor-pointer">
                <span>Нержавеющая сталь AISI 304</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. ПРОФИЛИ */}
        <div>
          <button
            onClick={() => setOpenProfiles(!openProfiles)}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-slate-700 hover:bg-slate-100 rounded text-left font-semibold cursor-pointer"
          >
            {openProfiles ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <Folder className="w-3.5 h-3.5 text-blue-500" />
            <span>Профиль (Каталог)</span>
          </button>

          {openProfiles && (
            <div className="pl-4 space-y-1 mt-0.5">
              {/* Alutech */}
              <div>
                <button
                  onClick={() => setOpenAlutech(!openAlutech)}
                  className="w-full flex items-center gap-1.5 px-2 py-0.5 text-slate-700 hover:bg-slate-100 rounded text-left font-medium text-[11px] cursor-pointer"
                >
                  {openAlutech ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                  <span>Alutech (Алютех)</span>
                </button>

                {openAlutech && (
                  <div className="pl-4 space-y-1 mt-1">
                    {alutechProfiles.map((prof) => (
                      <div
                        key={prof.article}
                        onClick={() => onBindProfileToSelectedLine(prof as unknown as CatalogProfileItem)}
                        className={`p-1.5 rounded border text-[11px] transition cursor-pointer ${
                          selectedLineId
                            ? 'bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-400'
                            : 'bg-slate-50/50 border-slate-200 opacity-80'
                        }`}
                        title="Нажмите, чтобы привязать к выбранной линии"
                      >
                        <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                          <span className="text-blue-700 truncate">{prof.article}</span>
                          <span className="text-[10px] text-slate-400">Δ={prof.defaultOffset}мм</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-sans truncate">{prof.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 flex justify-between">
                          <span>{prof.system}</span>
                          <span className="text-blue-600 font-medium">+ Привязать</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schüco */}
              <div>
                <button
                  onClick={() => setOpenSchueco(!openSchueco)}
                  className="w-full flex items-center gap-1.5 px-2 py-0.5 text-slate-700 hover:bg-slate-100 rounded text-left font-medium text-[11px] cursor-pointer"
                >
                  {openSchueco ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                  <span>Schüco (Шуко)</span>
                </button>

                {openSchueco && (
                  <div className="pl-4 space-y-1 mt-1">
                    {schuecoProfiles.map((prof) => (
                      <div
                        key={prof.article}
                        onClick={() => onBindProfileToSelectedLine(prof as unknown as CatalogProfileItem)}
                        className={`p-1.5 rounded border text-[11px] transition cursor-pointer ${
                          selectedLineId
                            ? 'bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-400'
                            : 'bg-slate-50/50 border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                          <span className="text-blue-700 truncate">{prof.article}</span>
                          <span className="text-[10px] text-slate-400">Δ={prof.defaultOffset}мм</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-sans truncate">{prof.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
