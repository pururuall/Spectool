import React, { useState } from 'react';
import { BOMRow, ModuleModel, StandaloneItem } from '../types';
import { Download, Copy, Search, Check, FileSpreadsheet, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { exportToExcel, EXACT_EXCEL_HEADERS } from '../utils/bomEngine';

interface SpecificationTableProps {
  module: ModuleModel;
  bomRows: BOMRow[];
  selectedSourceId: string | null;
  height?: number;
  onSelectRow: (sourceType: string, sourceId: string) => void;
  onUpdateBOMCell: (rowId: string, field: keyof BOMRow, value: any) => void;
  onAddStandaloneItem?: () => void;
  onEditStandaloneItem?: (item: StandaloneItem) => void;
  onDeleteStandaloneItem?: (id: string) => void;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({
  module,
  bomRows,
  selectedSourceId,
  height = 260,
  onSelectRow,
  onUpdateBOMCell,
  onAddStandaloneItem,
  onEditStandaloneItem,
  onDeleteStandaloneItem
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredRows = bomRows.filter((row) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      row.mark.toLowerCase().includes(q) ||
      row.name.toLowerCase().includes(q) ||
      row.materialMark.toLowerCase().includes(q) ||
      row.materialName.toLowerCase().includes(q) ||
      row.linkType.toLowerCase().includes(q)
    );
  });

  const handleCopyClipboard = () => {
    const tsv = [
      EXACT_EXCEL_HEADERS.join('\t'),
      ...bomRows.map((r) =>
        [
          r.mark,
          r.name,
          r.materialMark,
          r.materialName,
          r.materialQty,
          r.materialUnit,
          r.processTemplate,
          r.linkType,
          r.specQty,
          r.specUnit,
          r.vgbPlanGroup,
          r.vgbL,
          r.vgbB,
          r.vgbLB,
          r.vgbColor,
          r.vgpLeft,
          r.vgpRight,
          r.vgpLeft2,
          r.vgpRight2
        ].join('\t')
      )
    ].join('\n');

    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ height: `${height}px` }}
      className="bg-white border-t border-slate-300 flex flex-col select-none shadow-xs shrink-0"
    >
      {/* Table Toolbar */}
      <div className="h-9 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Спецификация (19 колонок точно по Excel «А1187 М507_Модуль Жукова»)</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
              {bomRows.length} строк
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по спецификации..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-64 bg-white border border-slate-300 rounded pl-8 pr-2.5 py-0.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onAddStandaloneItem && (
            <button
              onClick={onAddStandaloneItem}
              className="px-2.5 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Добавить отдельную деталь или сборочную единицу (кронштейн, закладную, узел)"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Деталь / СБ</span>
            </button>
          )}

          <button
            onClick={handleCopyClipboard}
            className="px-2.5 py-1 text-xs rounded bg-white hover:bg-slate-100 text-slate-700 font-medium transition flex items-center gap-1.5 border border-slate-300 shadow-2xs"
            title="Скопировать всю таблицу со всеми 19 колонками для вставки в Excel"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Скопировано!' : 'Копировать TSV'}
          </button>

          <button
            onClick={() => exportToExcel(module, bomRows)}
            className="px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Выгрузить файл Excel (.xlsx) с точной структурой"
          >
            <Download className="w-3.5 h-3.5" />
            Экспорт в Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Grid Table with light Excel theme and all 19 exact columns */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left text-xs font-mono border-collapse whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300 z-10 text-[11px] select-none">
            <tr>
              <th className="py-1.5 px-2 font-bold border-r border-slate-200 w-10 text-center bg-slate-200/70">№</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[200px]">Обозначение</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[220px]">Наименование</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[180px]">Материал обозначение</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[190px]">Материал наименование</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[110px] text-right">Материал кол-во</th>
              <th className="py-1.5 px-2 font-bold border-r border-slate-200 min-w-[80px] text-center">Материал ЕИ</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[170px]">Шаблон техпроцесса</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[120px]">Тип связи</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[90px] text-right">Кол-во в спец.</th>
              <th className="py-1.5 px-2 font-bold border-r border-slate-200 min-w-[60px] text-center">ЕИ</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[170px]">VGB_Plan_Group</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[90px] text-right">VGB_L_MM</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[90px] text-right">VGB_B_MM</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[90px] text-right">VGB_LB_MM</th>
              <th className="py-1.5 px-2.5 font-bold border-r border-slate-200 min-w-[100px]">VGB_Color</th>
              <th className="py-1.5 px-2 font-bold border-r border-slate-200 min-w-[70px] text-center">VGP_left</th>
              <th className="py-1.5 px-2 font-bold border-r border-slate-200 min-w-[70px] text-center">VGP_Right</th>
              <th className="py-1.5 px-2 font-bold border-r border-slate-200 min-w-[80px] text-center">VGP_Left_2</th>
              <th className="py-1.5 px-2 font-bold border-r border-slate-200 min-w-[80px] text-center">VGP_Right_2</th>
              <th className="py-1.5 px-2 font-bold text-center text-slate-700 text-[11px] w-14">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredRows.map((row, idx) => {
              const isSelected = selectedSourceId === row.sourceId;
              const isAssembly = row.linkType === 'Сборочная единица';
              const isPart = row.linkType === 'деталь';
              const isChild = !!row.parentName || row.linkType === 'комплектующие';

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectRow(row.sourceType, row.sourceId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-200/90 font-bold ring-1 ring-blue-500'
                      : isAssembly
                      ? 'bg-[#FFF2CC]/80 hover:bg-[#FEEFC3] text-amber-950 font-semibold'
                      : isPart
                      ? 'bg-[#E2EFDA]/70 hover:bg-[#D4E8CD] text-slate-900 font-semibold'
                      : 'bg-[#DDEBF7]/55 hover:bg-[#CDDFEF] text-slate-700'
                  }`}
                >
                  {/* Row index */}
                  <td className="py-1 px-2 border-r border-slate-200 text-center text-slate-400 text-[11px] bg-slate-50">
                    {idx + 1}
                  </td>

                  {/* 1. Обозначение (Editable) */}
                  <td className="py-1 px-2 border-r border-slate-200">
                    <div className="flex items-center gap-1">
                      {isChild && <span className="text-slate-400 pl-1">↳</span>}
                      <input
                        type="text"
                        value={row.mark}
                        onChange={(e) => onUpdateBOMCell(row.id, 'mark', e.target.value)}
                        className={`bg-transparent hover:bg-white focus:bg-white px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full font-mono ${
                          isChild ? 'text-slate-600' : 'text-blue-800 font-bold'
                        }`}
                      />
                    </div>
                  </td>

                  {/* 2. Наименование (Editable) */}
                  <td className="py-1 px-2 border-r border-slate-200">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => onUpdateBOMCell(row.id, 'name', e.target.value)}
                      className="bg-transparent hover:bg-white focus:bg-white px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-slate-900"
                    />
                  </td>

                  {/* 3. Материал обозначение */}
                  <td className="py-1 px-2 border-r border-slate-200 text-slate-700 font-mono">
                    <input
                      type="text"
                      value={row.materialMark}
                      onChange={(e) => onUpdateBOMCell(row.id, 'materialMark', e.target.value)}
                      className="bg-transparent hover:bg-white focus:bg-white px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-slate-700 font-mono"
                    />
                  </td>

                  {/* 4. Материал наименование */}
                  <td className="py-1 px-2 border-r border-slate-200 text-slate-700">
                    <input
                      type="text"
                      value={row.materialName}
                      onChange={(e) => onUpdateBOMCell(row.id, 'materialName', e.target.value)}
                      className="bg-transparent hover:bg-white focus:bg-white px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-slate-700"
                    />
                  </td>

                  {/* 5. Материал кол-во */}
                  <td className="py-1 px-2 border-r border-slate-200 text-right font-mono font-semibold text-slate-900">
                    {row.materialQty}
                  </td>

                  {/* 6. Материал ЕИ */}
                  <td className="py-1 px-2 border-r border-slate-200 text-center text-slate-500 text-[11px]">
                    {row.materialUnit}
                  </td>

                  {/* 7. Шаблон техпроцесса */}
                  <td className="py-1 px-2 border-r border-slate-200 text-slate-700">
                    {row.processTemplate}
                  </td>

                  {/* 8. Тип связи */}
                  <td className="py-1 px-2 border-r border-slate-200 text-slate-700">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        row.linkType === 'деталь'
                          ? 'bg-blue-100 text-blue-800'
                          : row.linkType === 'Сборочная единица'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {row.linkType}
                    </span>
                  </td>

                  {/* 9. Кол-во в спецификации */}
                  <td className="py-1 px-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                    <input
                      type="number"
                      value={row.specQty}
                      onChange={(e) => onUpdateBOMCell(row.id, 'specQty', parseFloat(e.target.value) || 0)}
                      className="bg-transparent hover:bg-white focus:bg-white px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-16 text-right font-mono font-bold"
                    />
                  </td>

                  {/* 10. ЕИ */}
                  <td className="py-1 px-2 border-r border-slate-200 text-center text-slate-500 font-mono text-[11px]">
                    {row.specUnit}
                  </td>

                  {/* 11. VGB_Plan_Group */}
                  <td className="py-1 px-2 border-r border-slate-200 text-slate-600 text-[11px]">
                    {row.vgbPlanGroup}
                  </td>

                  {/* 12. VGB_L_MM */}
                  <td className="py-1 px-2 border-r border-slate-200 text-right font-mono text-slate-800 font-semibold">
                    {row.vgbL}
                  </td>

                  {/* 13. VGB_B_MM */}
                  <td className="py-1 px-2 border-r border-slate-200 text-right font-mono text-slate-800">
                    {row.vgbB}
                  </td>

                  {/* 14. VGB_LB_MM */}
                  <td className="py-1 px-2 border-r border-slate-200 text-right font-mono text-slate-800">
                    {row.vgbLB}
                  </td>

                  {/* 15. VGB_Color */}
                  <td className="py-1 px-2 border-r border-slate-200 text-slate-700 text-[11px]">
                    {row.vgbColor}
                  </td>

                  {/* 16. VGP_left */}
                  <td className="py-1 px-2 border-r border-slate-200 text-center font-mono text-slate-700 text-[11px]">
                    {row.vgpLeft}
                  </td>

                  {/* 17. VGP_Right */}
                  <td className="py-1 px-2 border-r border-slate-200 text-center font-mono text-slate-700 text-[11px]">
                    {row.vgpRight}
                  </td>

                  {/* 18. VGP_Left_2 */}
                  <td className="py-1 px-2 border-r border-slate-200 text-center font-mono text-slate-700 text-[11px]">
                    {row.vgpLeft2}
                  </td>

                  {/* 19. VGP_Right_2 */}
                  <td className="py-1 px-2 border-r border-slate-200 text-center font-mono text-slate-700 text-[11px]">
                    {row.vgpRight2}
                  </td>

                  {/* Actions for standalone items */}
                  <td className="py-1 px-1.5 text-center">
                    {row.sourceType === 'standalone' && (
                      <div className="flex items-center justify-center gap-1">
                        {onEditStandaloneItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const found = module.standaloneItems?.find((it) => it.id === row.sourceId);
                              if (found) onEditStandaloneItem(found);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition cursor-pointer"
                            title="Редактировать параметры позиции"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {onDeleteStandaloneItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteStandaloneItem(row.sourceId);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                            title="Удалить позицию"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
