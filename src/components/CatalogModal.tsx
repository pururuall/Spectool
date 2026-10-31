import React, { useState } from 'react';
import { X, Search, Plus, Filter, Check } from 'lucide-react';
import catalogData from '../data/catalog.json';
import { CatalogHardwareItem, CatalogProfileItem, DependencyRule, ProfileBinding } from '../types';

interface CatalogModalProps {
  target: {
    type: 'profile' | 'hardware' | 'gasket';
    axisId?: string;
    profileId?: string;
    cellId?: string;
  } | null;
  onClose: () => void;
  onSelectProfile: (axisId: string, profile: CatalogProfileItem) => void;
  onSelectHardware: (target: { axisId?: string; profileId?: string; cellId?: string }, item: CatalogHardwareItem, rule: Partial<DependencyRule>) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  target,
  onClose,
  onSelectProfile,
  onSelectHardware
}) => {
  if (!target) return null;

  const [activeTab, setActiveTab] = useState<'profiles' | 'hardware'>(
    target.type === 'profile' ? 'profiles' : 'hardware'
  );
  const [search, setSearch] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');

  // Fastener standards list for filtering
  const standards = ['all', 'DIN7981', 'DIN7982', 'DIN965', 'DIN7991', 'ISO14585', 'DIN933', 'DIN934', 'Спецвинт'];

  const filteredHardware = catalogData.hardware.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.article.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.standard.toLowerCase().includes(q);
    const matchesStd = selectedStandard === 'all' || item.standard.toUpperCase().includes(selectedStandard.toUpperCase());
    return matchesSearch && matchesStd;
  });

  const filteredProfiles = catalogData.profiles.filter((p) => {
    const q = search.toLowerCase();
    return p.article.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.system.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[650px] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">Каталог комплектующих и профилей</h2>
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setActiveTab('profiles')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  activeTab === 'profiles' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Профили Alutech
              </button>
              <button
                onClick={() => setActiveTab('hardware')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  activeTab === 'hardware' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Метизы (338 шт)
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'profiles' ? 'Поиск по артикулу или названию профиля...' : 'Поиск по метизам, ГОСТ, DIN, диаметру, резьбе...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              autoFocus
            />
          </div>

          {activeTab === 'hardware' && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              {standards.slice(0, 6).map((std) => (
                <button
                  key={std}
                  onClick={() => setSelectedStandard(std)}
                  className={`px-2 py-1 text-[11px] rounded-md font-mono transition ${
                    selectedStandard === std
                      ? 'bg-blue-600/30 border border-blue-500 text-blue-300 font-bold'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {std === 'all' ? 'Все' : std}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'profiles' ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProfiles.map((p) => (
                <div
                  key={p.article}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 hover:border-blue-500/80 hover:bg-slate-800/80 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-sky-400">{p.article}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {p.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 mb-2">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">Система: {p.system}</p>

                    <div className="text-[10px] text-slate-500 font-mono mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      Отступ по умолчанию: <span className="text-amber-400 font-bold">{p.defaultOffsetFormula}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (target.axisId) {
                        onSelectProfile(target.axisId, p as unknown as CatalogProfileItem);
                        onClose();
                      }
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Привязать к оси
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredHardware.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 hover:border-blue-500/80 hover:bg-slate-800/80 transition flex items-center justify-between"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-white">{hw.article}</span>
                      {hw.standard && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 border border-slate-700">
                          {hw.standard}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{hw.name}</p>
                    <div className="flex gap-4 text-[10px] text-slate-500 font-mono mt-1">
                      {hw.diameter && <span>Диаметр: {hw.diameter} мм</span>}
                      {hw.length && <span>Длина: {hw.length} мм</span>}
                      {hw.material && <span>Материал: {hw.material}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectHardware(target, hw, {
                          calcType: 'step',
                          stepMm: 200,
                          formula: 'ROUNDUP(L / 200, 0) + 1'
                        });
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-medium transition"
                      title="Привязать с шагом 200 мм (ROUNDUP(L / 200) + 1)"
                    >
                      По шагу (L/200)
                    </button>
                    <button
                      onClick={() => {
                        onSelectHardware(target, hw, {
                          calcType: 'fixed',
                          quantity: 2
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-sm"
                      title="Привязать фиксированное количество (2 шт)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Фикс. (2 шт)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
