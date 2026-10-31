import React, { useRef } from 'react';
import { ModuleModel, BOMRow } from '../types';
import { Upload, Download, Sparkles, PlusCircle, Ruler } from 'lucide-react';
import { exportToExcel } from '../utils/bomEngine';
import * as XLSX from 'xlsx';

interface HeaderProps {
  module: ModuleModel;
  bomRows: BOMRow[];
  onUpdateModuleName: (name: string) => void;
  onUpdateProjectName: (project: string) => void;
  onUpdateDimensions: (width: number, height: number) => void;
  onNewEmptyModule: () => void;
  onLoadPreset: () => void;
  onImportExcel: (importedModule: Partial<ModuleModel>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  module,
  bomRows,
  onUpdateModuleName,
  onUpdateProjectName,
  onUpdateDimensions,
  onNewEmptyModule,
  onLoadPreset,
  onImportExcel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];

        const y1Val = ws['Y1']?.v;
        const z1Val = ws['Z1']?.v;

        if (y1Val && z1Val) {
          onUpdateDimensions(parseFloat(z1Val) || 1000, parseFloat(y1Val) || 2555);
        }
        alert(`Файл "${file.name}" загружен. Лист: "${sheetName}".`);
      } catch (err) {
        alert('Ошибка при чтении Excel файла: ' + err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between select-none shadow-xs z-20">
      {/* Left: Excel Import / Name Input as in sketch */}
      <div className="flex items-center gap-4">
        {/* Import Excel Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg transition flex items-center gap-1.5 font-medium shadow-2xs"
          title="Загрузить Excel файл спецификации"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          Импорт Excel
        </button>

        {/* Export Excel Button */}
        <button
          onClick={() => exportToExcel(module, bomRows)}
          className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1.5 font-semibold shadow-2xs"
          title="Выгрузить спецификацию в Excel (.xlsx)"
        >
          <Download className="w-3.5 h-3.5" />
          Экспорт Excel
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Input: Module Name (from sketch "Ввод имени модуля") */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Имя модуля:</span>
          <input
            type="text"
            value={module.name}
            onChange={(e) => onUpdateModuleName(e.target.value)}
            className="bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono font-bold w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            placeholder="Ввод имени модуля..."
          />
        </div>

        {/* Input: Project */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-mono">Проект:</span>
          <input
            type="text"
            value={module.project}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-0.5 text-xs text-slate-800 font-mono w-20 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Center: Dimensions H & L direct inputs as in sketch */}
      <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500 font-mono">L (ширина):</span>
          <input
            type="number"
            value={module.width}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 100;
              onUpdateDimensions(val, module.height);
            }}
            className="w-18 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-blue-700 text-xs focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-[11px]">мм</span>
        </div>

        <span className="text-slate-300">|</span>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500 font-mono">H (высота):</span>
          <input
            type="number"
            value={module.height}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 100;
              onUpdateDimensions(module.width, val);
            }}
            className="w-18 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-mono font-bold text-blue-700 text-xs focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-[11px]">мм</span>
        </div>

        <span className="text-slate-300">|</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">Цвет:</span>
          <span className="font-mono text-slate-800 font-medium text-xs">{module.color}</span>
        </div>
      </div>

      {/* Right: Template / Preset actions */}
      <div className="flex items-center gap-2">
        {/* Create empty module for drawing from scratch */}
        <button
          onClick={onNewEmptyModule}
          className="px-3 py-1.5 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition flex items-center gap-1.5 font-medium shadow-2xs"
          title="Очистить и начертить оси модуля с нуля"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
          Чистый лист (с нуля)
        </button>

        {/* Load Zhukov preset */}
        <button
          onClick={onLoadPreset}
          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition flex items-center gap-1.5 font-medium shadow-2xs"
          title="Загрузить тестовую спецификацию модуля Жукова (М507)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Пример Жукова (М507)
        </button>
      </div>
    </header>
  );
};
