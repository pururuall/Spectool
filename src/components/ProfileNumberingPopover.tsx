import React from 'react';
import { LineSegment, ModuleModel, ProfileBinding } from '../types';
import { X, Hash, Sparkles, ListOrdered, Check } from 'lucide-react';
import {
  generateProfileMark,
  autoAssignStandardRolesAndNumbers,
  autoAssignSequentialNumbers
} from '../utils/namingService';

interface ProfileNumberingPopoverProps {
  module: ModuleModel;
  selectedLineId: string | null;
  onSelectLine: (lineId: string) => void;
  onUpdateLines: (lines: LineSegment[]) => void;
  onClose: () => void;
}

export const ProfileNumberingPopover: React.FC<ProfileNumberingPopoverProps> = ({
  module,
  selectedLineId,
  onSelectLine,
  onUpdateLines,
  onClose
}) => {
  // Update orderNumber for a specific line and its profiles
  const handleUpdateLineOrderNumber = (lineId: string, newOrder: string) => {
    const updated = module.lines.map((l) => {
      if (l.id !== lineId) return l;

      const updatedProfiles: ProfileBinding[] = (l.profileBindings || []).map((prof) => ({
        ...prof,
        orderNumber: newOrder,
        customMark: generateProfileMark(module.project, prof.article, l.length, newOrder)
      }));

      return {
        ...l,
        orderNumber: newOrder,
        profileBindings: updatedProfiles
      };
    });

    onUpdateLines(updated);
  };

  // Find standard lines: n L, n R, Up, Down, Middle 1
  const leftLine = module.lines.find(
    (l) => Math.abs(l.x1 - l.x2) <= 5 && Math.abs((l.x1 + l.x2) / 2 - 0) <= 25
  );
  const rightLine = module.lines.find(
    (l) => Math.abs(l.x1 - l.x2) <= 5 && Math.abs((l.x1 + l.x2) / 2 - module.width) <= 25
  );
  const upLine = module.lines.find(
    (l) => Math.abs(l.y1 - l.y2) <= 5 && Math.abs((l.y1 + l.y2) / 2 - module.height) <= 25
  );
  const downLine = module.lines.find(
    (l) => Math.abs(l.y1 - l.y2) <= 5 && Math.abs((l.y1 + l.y2) / 2 - 0) <= 25
  );
  const middleLines = module.lines.filter(
    (l) =>
      Math.abs(l.y1 - l.y2) <= 5 &&
      Math.abs((l.y1 + l.y2) / 2 - 0) > 25 &&
      Math.abs((l.y1 + l.y2) / 2 - module.height) > 25
  );

  const applyStandardNumbers = () => {
    const updated = autoAssignStandardRolesAndNumbers(
      module.lines,
      module.width,
      module.height,
      module.project
    );
    onUpdateLines(updated);
  };

  const applySequentialNumbers = () => {
    const updated = autoAssignSequentialNumbers(module.lines, module.project);
    onUpdateLines(updated);
  };

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Popover Header */}
      <div className="h-11 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Порядковые номера профилей («палок»)
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 text-xs font-sans">
        {/* SECTION 1: Standard Zhukov Module Numbering Matrix (Скриншот 1) */}
        <div>
          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
            Сводная таблица по осям модуля:
          </span>
          <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-xl p-2.5 bg-slate-50/60 font-mono">
            {/* Left: Height H and Verticals (n L, n R) */}
            <div className="space-y-1.5">
              <div className="bg-blue-600 text-white font-bold text-center py-1 px-2 rounded text-xs flex justify-between items-center">
                <span>H (Высота):</span>
                <span>{module.height} мм</span>
              </div>
              {/* n L */}
              <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                <span className="text-slate-600 font-semibold">n L (Левая):</span>
                <input
                  type="text"
                  value={leftLine?.orderNumber ?? (leftLine?.profileBindings?.[0]?.orderNumber || '1')}
                  onChange={(e) => leftLine && handleUpdateLineOrderNumber(leftLine.id, e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-blue-700 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              {/* n R */}
              <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                <span className="text-slate-600 font-semibold">n R (Правая):</span>
                <input
                  type="text"
                  value={rightLine?.orderNumber ?? (rightLine?.profileBindings?.[0]?.orderNumber || '2')}
                  onChange={(e) => rightLine && handleUpdateLineOrderNumber(rightLine.id, e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-blue-700 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  placeholder="2"
                />
              </div>
            </div>

            {/* Right: Width W and Horizontals (Up, Down, Middle) */}
            <div className="space-y-1.5">
              <div className="bg-amber-700 text-white font-bold text-center py-1 px-2 rounded text-xs flex justify-between items-center">
                <span>W (Ширина):</span>
                <span>{module.width} мм</span>
              </div>
              {/* Up */}
              <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                <span className="text-slate-600 font-semibold">Up (Верх):</span>
                <input
                  type="text"
                  value={upLine?.orderNumber ?? (upLine?.profileBindings?.[0]?.orderNumber || '3')}
                  onChange={(e) => upLine && handleUpdateLineOrderNumber(upLine.id, e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-amber-800 text-xs focus:bg-white focus:outline-none focus:border-amber-600"
                  placeholder="3"
                />
              </div>
              {/* Down */}
              <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                <span className="text-slate-600 font-semibold">Down (Низ):</span>
                <input
                  type="text"
                  value={downLine?.orderNumber ?? (downLine?.profileBindings?.[0]?.orderNumber || '4')}
                  onChange={(e) => downLine && handleUpdateLineOrderNumber(downLine.id, e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-amber-800 text-xs focus:bg-white focus:outline-none focus:border-amber-600"
                  placeholder="4"
                />
              </div>
              {/* Middle */}
              {middleLines.slice(0, 2).map((mLine, mIdx) => (
                <div key={mLine.id} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                  <span className="text-slate-600 font-semibold">Middle {mIdx + 1}:</span>
                  <input
                    type="text"
                    value={mLine?.orderNumber ?? (mLine?.profileBindings?.[0]?.orderNumber || `${5 + mIdx}`)}
                    onChange={(e) => handleUpdateLineOrderNumber(mLine.id, e.target.value)}
                    className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-amber-800 text-xs focus:bg-white focus:outline-none focus:border-amber-600"
                    placeholder={`${5 + mIdx}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: Complete List of All Lines (Для сложных модулей с множеством линий - Скриншот 2) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700">
              Все осевые линии модуля ({module.lines.length} шт.):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={applySequentialNumbers}
                className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition border border-blue-200 shadow-2xs"
                title="Присвоить всем линиям порядковые номера: 1, 2, 3..."
              >
                <ListOrdered className="w-3 h-3 text-blue-600" />
                Сбросить: по порядку (1, 2, 3...)
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[260px] overflow-y-auto">
            <table className="w-full text-[11px] border-collapse font-sans">
              <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-1.5 px-2 text-left w-8">#</th>
                  <th className="py-1.5 px-2 text-left">Линия / Позиция</th>
                  <th className="py-1.5 px-2 text-right">Ось (мм)</th>
                  <th className="py-1.5 px-2 text-left">Привязанный профиль</th>
                  <th className="py-1.5 px-2 text-center w-24">Порядковый №</th>
                  <th className="py-1.5 px-2 text-left">Марка (превью)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {module.lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Линии ещё не начерчены. Начертите оси на холсте!
                    </td>
                  </tr>
                ) : (
                  module.lines.map((line, idx) => {
                    const isSelected = selectedLineId === line.id;
                    const isVert = Math.abs(line.x1 - line.x2) <= 5;
                    const firstProf = line.profileBindings?.[0];
                    const orderVal = line.orderNumber ?? (firstProf?.orderNumber || idx + 1);
                    const markPreview = firstProf
                      ? generateProfileMark(module.project, firstProf.article, line.length, orderVal)
                      : `${module.project} —-${Math.round(line.length)}-${orderVal}`;

                    return (
                      <tr
                        key={line.id}
                        onClick={() => onSelectLine(line.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-1.5 px-2 text-slate-400 font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                              {line.name}
                            </span>
                            {line.role && (
                              <span className="text-[9px] bg-slate-200/80 text-slate-700 px-1 py-0.2 rounded font-mono">
                                {line.role}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-700">
                          {Math.round(line.length)}
                        </td>
                        <td className="py-1.5 px-2 truncate max-w-[140px] text-slate-600 font-mono text-[10px]">
                          {firstProf ? (
                            <span title={`${firstProf.name} (${firstProf.article})`}>
                              {firstProf.article}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic">не назначен</span>
                          )}
                        </td>
                        <td className="py-1 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={orderVal}
                            onChange={(e) => handleUpdateLineOrderNumber(line.id, e.target.value)}
                            className="w-18 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono font-bold text-blue-700 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            placeholder="500"
                          />
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[10px] text-blue-800 truncate font-semibold">
                          {markPreview}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Popover Footer */}
      <div className="h-10 bg-slate-50 border-t border-slate-200 px-4 flex items-center justify-between text-xs text-slate-500">
        <span>Кликните на строку для выбора линии на холсте</span>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-2xs transition"
        >
          Готово
        </button>
      </div>
    </div>
  );
};

