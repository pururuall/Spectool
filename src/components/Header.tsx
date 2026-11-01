import React, { useRef, useState } from 'react';
import { ModuleModel, BOMRow, LineSegment } from '../types';
import {
  Upload,
  Download,
  Sparkles,
  PlusCircle,
  Hash,
  Palette,
  Layers,
  Tag,
  Save,
  Component,
  FolderOpen
} from 'lucide-react';
import { exportToExcel } from '../utils/bomEngine';
import { ProfileNumberingPopover } from './ProfileNumberingPopover';
import { ColorManagerPopover } from './ColorManagerPopover';

interface HeaderProps {
  module: ModuleModel;
  bomRows: BOMRow[];
  selectedLineId: string | null;
  onSelectLine: (lineId: string) => void;
  onUpdateLines: (lines: LineSegment[]) => void;
  onUpdateColor: (color: string) => void;
  onUpdateColorsList: (colors: string[]) => void;
  onUpdateModuleName: (name: string) => void;
  onUpdateProjectName: (project: string) => void;
  onUpdateDimensions: (width: number, height: number) => void;
  onNewEmptyModule: () => void;
  onLoadPreset: () => void;
  onOpenNamingModal: () => void;
  onOpenProcessTemplatesModal: () => void;
  onOpenStandaloneItemModal: () => void;
  onExportProject: () => void;
  onImportFile: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  module,
  bomRows,
  selectedLineId,
  onSelectLine,
  onUpdateLines,
  onUpdateColor,
  onUpdateColorsList,
  onUpdateModuleName,
  onUpdateProjectName,
  onUpdateDimensions,
  onNewEmptyModule,
  onLoadPreset,
  onOpenNamingModal,
  onOpenProcessTemplatesModal,
  onOpenStandaloneItemModal,
  onExportProject,
  onImportFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNumberingPopover, setShowNumberingPopover] = useState(false);
  const [showColorPopover, setShowColorPopover] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      e.target.value = '';
    }
  };

  const colorsList = module.colors && module.colors.length > 0 ? module.colors : [module.color || 'RAL 7012'];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 flex items-center justify-between select-none shadow-xs z-30 relative">
      {/* Left: Project / File Operations & Module Info */}
      <div className="flex items-center gap-2">
        {/* Universal File Import (.xlsx, .spectool, .json) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls, .spectool, .json"
          className="hidden"
        />

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 text-xs bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg transition flex items-center gap-1 font-medium shadow-2xs cursor-pointer"
            title="Импортировать файл спецификации (.xlsx) или проект Spectool (.spectool / .json)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Импорт</span>
          </button>

          <button
            onClick={onExportProject}
            className="px-2 py-1 text-xs bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg transition flex items-center gap-1 font-medium shadow-2xs cursor-pointer"
            title="Сохранить весь проект целиком в файл .spectool"
          >
            <Save className="w-3.5 h-3.5 text-indigo-600" />
            <span>Сохранить</span>
          </button>

          <button
            onClick={() => exportToExcel(module, bomRows)}
            className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1 font-semibold shadow-2xs cursor-pointer"
            title="Выгрузить 19-колоночную производственную спецификацию в Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт Excel</span>
          </button>
        </div>

        {/* Input: Module Name */}
        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-xs font-semibold text-slate-600">Модуль:</span>
          <input
            type="text"
            value={module.name}
            onChange={(e) => onUpdateModuleName(e.target.value)}
            className="bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-lg px-2 py-1 text-xs text-slate-900 font-mono font-bold w-40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            placeholder="Ввод имени модуля..."
          />
        </div>

        {/* Input: Project */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 font-mono">Проект:</span>
          <input
            type="text"
            value={module.project}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-0.5 text-xs text-slate-800 font-mono w-16 focus:outline-none focus:border-blue-500 font-bold"
          />
        </div>
      </div>

      {/* Center: Dimensions H & L, stick numbering, colors, formula, TP templates */}
      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
        {/* L Width */}
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-500 font-mono">L (ширина):</span>
          <input
            type="number"
            value={module.width}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 100;
              onUpdateDimensions(val, module.height);
            }}
            className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-blue-700 text-xs focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-[11px]">мм</span>
        </div>

        <span className="text-slate-300">|</span>

        {/* H Height */}
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-500 font-mono">H (высота):</span>
          <input
            type="number"
            value={module.height}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 100;
              onUpdateDimensions(module.width, val);
            }}
            className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-blue-700 text-xs focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-[11px]">мм</span>
        </div>

        <span className="text-slate-300">|</span>

        {/* Numbering Table Trigger Button (№ Палок) */}
        <button
          onClick={() => {
            setShowNumberingPopover(!showNumberingPopover);
            setShowColorPopover(false);
          }}
          className={`px-2 py-1 rounded-lg border font-mono text-xs flex items-center gap-1 cursor-pointer transition shadow-2xs ${
            showNumberingPopover
              ? 'bg-blue-600 text-white border-blue-700 font-bold'
              : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-700'
          }`}
          title="Открыть таблицу порядковых номеров профилей («палок»)"
        >
          <Hash className="w-3 h-3 text-blue-500" />
          <span>№ Палок</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-sans">
            {module.lines.length}
          </span>
        </button>

        {/* Color Button with Popover */}
        <button
          onClick={() => {
            setShowColorPopover(!showColorPopover);
            setShowNumberingPopover(false);
          }}
          className={`px-2 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs ${
            showColorPopover
              ? 'bg-blue-600 text-white border-blue-700 font-bold'
              : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
          }`}
          title="Настроить цвета проекта (мульти-RAL для профилей и крышек)"
        >
          <Palette className="w-3 h-3 text-amber-500" />
          <span>{module.color || 'RAL 7012'}</span>
          {colorsList.length > 1 && (
            <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold font-sans">
              +{colorsList.length - 1}
            </span>
          )}
        </button>

        <span className="text-slate-300">|</span>

        {/* Naming Formula Settings Button */}
        <button
          onClick={onOpenNamingModal}
          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer"
          title="Настройка формулы автоматического наименования профилей и деталей"
        >
          <Tag className="w-3 h-3 text-indigo-600" />
          <span>Формула марки</span>
        </button>

        {/* Technological Process Templates DB */}
        <button
          onClick={onOpenProcessTemplatesModal}
          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer"
          title="База данных шаблонов техпроцесса (ТП для Vogbit)"
        >
          <Layers className="w-3 h-3 text-blue-600" />
          <span>Шаблоны ТП</span>
        </button>

        {/* Add Standalone Item (Кронштейн / СБ) */}
        <button
          onClick={onOpenStandaloneItemModal}
          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
          title="Добавить независимую деталь или сборочную единицу (кронштейн, закладную, узел)"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>+ Деталь / СБ</span>
        </button>
      </div>

      {/* Floating Popovers */}
      {showNumberingPopover && (
        <ProfileNumberingPopover
          module={module}
          selectedLineId={selectedLineId}
          onSelectLine={(lId) => onSelectLine(lId)}
          onUpdateLines={onUpdateLines}
          onClose={() => setShowNumberingPopover(false)}
        />
      )}

      {showColorPopover && (
        <ColorManagerPopover
          currentColor={module.color || 'RAL 7012'}
          colors={colorsList}
          onSelectPrimaryColor={(col) => onUpdateColor(col)}
          onUpdateColorsList={onUpdateColorsList}
          onClose={() => setShowColorPopover(false)}
        />
      )}

      {/* Right: Template / Preset actions */}
      <div className="flex items-center gap-2">
        {/* Create empty module for drawing from scratch */}
        <button
          onClick={onNewEmptyModule}
          className="px-2 py-1.5 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition flex items-center gap-1 font-medium shadow-2xs cursor-pointer"
          title="Очистить и начертить оси модуля с нуля"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>С нуля</span>
        </button>

        {/* Load Zhukov preset */}
        <button
          onClick={onLoadPreset}
          className="px-2.5 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition flex items-center gap-1 font-medium shadow-2xs cursor-pointer"
          title="Загрузить тестовую спецификацию модуля Жукова (М507)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Пример Жукова</span>
        </button>
      </div>
    </header>
  );
};
