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
  Wrench,
  Layers,
  Sliders,
  FolderPlus
} from 'lucide-react';
import { CatalogProfileItem, CatalogMaterialItem, MaterialFolderNode } from '../types';
import {
  getMaterialTree,
  saveMaterialTree,
  resetMaterialTree,
  parseAndSaveMaterialsExcel,
  addFolderToTree,
  flattenMaterialTree
} from '../utils/databaseService';

interface MaterialsTreeProps {
  selectedLineId: string | null;
  selectedProfileId: string | null;
  selectedCellId: string | null;
  width?: number;
  onBindProfileToSelectedLine: (profileItem: CatalogProfileItem) => void;
  onBindAsAccessory?: (item: CatalogMaterialItem) => void;
  onOpenDatabaseManager?: () => void;
  onAddCustomProfile?: () => void;
}

export const MaterialsTree: React.FC<MaterialsTreeProps> = ({
  selectedLineId,
  selectedProfileId,
  selectedCellId,
  width = 300,
  onBindProfileToSelectedLine,
  onBindAsAccessory,
  onOpenDatabaseManager,
  onAddCustomProfile
}) => {
  const [treeData, setTreeData] = useState(() => getMaterialTree());
  const [searchQuery, setSearchQuery] = useState('');
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>({
    f_sheet: true,
    f_sheet_black: true,
    f_profile: true,
    f_prof_alutech: true,
    f_alutech_ef100: true
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [justBoundArticle, setJustBoundArticle] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFolder = (id: string) => {
    setOpenFolderIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const res = await parseAndSaveMaterialsExcel(file);
      setTreeData(getMaterialTree());
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
    if (confirm('Сбросить базу материалов к заводской эталонной иерархии?')) {
      resetMaterialTree();
      setTreeData(getMaterialTree());
      setUploadSuccess('База материалов сброшена к заводским позициям');
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleBindAsProfile = (item: CatalogMaterialItem) => {
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

  const handleBindAsAcc = (item: CatalogMaterialItem) => {
    if (onBindAsAccessory) {
      onBindAsAccessory(item);
      setJustBoundArticle(item.article);
      setTimeout(() => setJustBoundArticle(null), 1500);
    }
  };

  const flatCount = useMemo(() => flattenMaterialTree(treeData.root).length, [treeData]);

  // Search filtered view if query is non-empty
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;
    const all = flattenMaterialTree(treeData.root);
    return all.filter((it) => {
      return (
        it.article.toLowerCase().includes(q) ||
        it.name.toLowerCase().includes(q) ||
        (it.code && it.code.toLowerCase().includes(q)) ||
        (it.standard && it.standard.toLowerCase().includes(q)) ||
        (it.folderPath && it.folderPath.some((p) => p.toLowerCase().includes(q)))
      );
    });
  }, [treeData, searchQuery]);

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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">БД: Материалы</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenDatabaseManager && (
            <button
              onClick={onOpenDatabaseManager}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              title="Открыть менеджер баз данных (полное редактирование)"
            >
              Менеджер
            </button>
          )}
          {onAddCustomProfile && (
            <button
              onClick={onAddCustomProfile}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-0.5 cursor-pointer ml-1"
              title="Добавить свой профиль в базу вручную"
            >
              <Plus className="w-3 h-3" /> Свой
            </button>
          )}
        </div>
      </div>

      {/* Info / Import Toolbar */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] gap-1">
        <span
          className="text-slate-600 truncate font-mono text-[10px] max-w-[170px]"
          title={`Файл: ${treeData.filename}`}
        >
          📁 <strong>{treeData.filename}</strong> ({flatCount} поз.)
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 cursor-pointer transition"
            title="Привязать свой Excel-файл материалов"
          >
            <Upload className="w-2.5 h-2.5" /> Выбрать
          </button>
          <button
            onClick={handleReset}
            className="text-[10px] text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-200 cursor-pointer transition"
            title="Сбросить к заводской иерархии"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Upload Messages */}
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
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по папкам, маркам, ГОСТ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Tree Content / Search Results */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {searchResults !== null ? (
          /* Search results list */
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
              Найдено: {searchResults.length} поз.
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                По запросу «{searchQuery}» ничего не найдено
              </div>
            ) : (
              searchResults.map((item) => (
                <MaterialItemCard
                  key={item.id}
                  item={item}
                  selectedLineId={selectedLineId}
                  selectedProfileId={selectedProfileId}
                  selectedCellId={selectedCellId}
                  isJustBound={justBoundArticle === item.article}
                  onBindAsProfile={() => handleBindAsProfile(item)}
                  onBindAsAccessory={() => handleBindAsAcc(item)}
                />
              ))
            )}
          </div>
        ) : (
          /* Recursive Hierarchical Tree */
          treeData.root.map((rootNode) => (
            <TreeFolderView
              key={rootNode.id}
              node={rootNode}
              openFolderIds={openFolderIds}
              onToggleFolder={toggleFolder}
              selectedLineId={selectedLineId}
              selectedProfileId={selectedProfileId}
              selectedCellId={selectedCellId}
              justBoundArticle={justBoundArticle}
              onBindAsProfile={handleBindAsProfile}
              onBindAsAccessory={handleBindAsAcc}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Recursive Folder Tree Node Renderer
const TreeFolderView: React.FC<{
  node: MaterialFolderNode;
  openFolderIds: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  selectedLineId: string | null;
  selectedProfileId: string | null;
  selectedCellId: string | null;
  justBoundArticle: string | null;
  onBindAsProfile: (item: CatalogMaterialItem) => void;
  onBindAsAccessory: (item: CatalogMaterialItem) => void;
}> = ({
  node,
  openFolderIds,
  onToggleFolder,
  selectedLineId,
  selectedProfileId,
  selectedCellId,
  justBoundArticle,
  onBindAsProfile,
  onBindAsAccessory
}) => {
  const isOpen = !!openFolderIds[node.id];
  const hasSubfolders = node.subfolders && node.subfolders.length > 0;
  const hasItems = node.items && node.items.length > 0;
  const hasChildren = hasSubfolders || hasItems;

  return (
    <div className="text-xs">
      {/* Folder Row */}
      <div
        onClick={() => onToggleFolder(node.id)}
        className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer text-slate-800 transition select-none"
      >
        <div className="flex items-center gap-1.5 truncate">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )
          ) : (
            <span className="w-3.5" />
          )}
          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{node.name}</span>
        </div>
        {hasItems && (
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">
            {node.items.length}
          </span>
        )}
      </div>

      {/* Expanded subfolders & items */}
      {isOpen && (
        <div className="ml-3 pl-1.5 border-l border-slate-200 space-y-1 mt-0.5">
          {/* Subfolders */}
          {hasSubfolders &&
            node.subfolders.map((sub) => (
              <TreeFolderView
                key={sub.id}
                node={sub}
                openFolderIds={openFolderIds}
                onToggleFolder={onToggleFolder}
                selectedLineId={selectedLineId}
                selectedProfileId={selectedProfileId}
                selectedCellId={selectedCellId}
                justBoundArticle={justBoundArticle}
                onBindAsProfile={onBindAsProfile}
                onBindAsAccessory={onBindAsAccessory}
              />
            ))}

          {/* Items inside this folder */}
          {hasItems &&
            node.items.map((item) => (
              <MaterialItemCard
                key={item.id}
                item={item}
                selectedLineId={selectedLineId}
                selectedProfileId={selectedProfileId}
                selectedCellId={selectedCellId}
                isJustBound={justBoundArticle === item.article}
                onBindAsProfile={() => onBindAsProfile(item)}
                onBindAsAccessory={() => onBindAsAccessory(item)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// Item Card Component with Dual Binding Buttons
const MaterialItemCard: React.FC<{
  item: CatalogMaterialItem;
  selectedLineId: string | null;
  selectedProfileId: string | null;
  selectedCellId: string | null;
  isJustBound: boolean;
  onBindAsProfile: () => void;
  onBindAsAccessory: () => void;
}> = ({
  item,
  selectedLineId,
  selectedProfileId,
  selectedCellId,
  isJustBound,
  onBindAsProfile,
  onBindAsAccessory
}) => {
  return (
    <div className="bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-lg p-2 transition group flex flex-col gap-1">
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-xs text-slate-900 truncate">
              {item.code || item.article}
            </span>
            {item.thickness && (
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1 rounded font-mono font-semibold">
                {item.thickness} мм
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight mt-0.5">{item.name}</p>
        </div>

        {isJustBound && (
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 shrink-0">
            ✓ Привязано
          </span>
        )}
      </div>

      {/* Meta tags: unit, weight, standard */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
        <span>{item.unit}</span>
        {item.weight && <span>● {item.weight} кг</span>}
        {item.standard && <span className="truncate">● {item.standard}</span>}
      </div>

      {/* Action buttons: Dual binding */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 mt-0.5">
        <button
          onClick={onBindAsProfile}
          disabled={!selectedLineId}
          className={`flex-1 py-0.5 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
            selectedLineId
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title={selectedLineId ? 'Привязать как несущий профиль к выбранной линии' : 'Сначала выберите линию на холсте'}
        >
          <Layers className="w-2.5 h-2.5" />
          <span>Как профиль</span>
        </button>

        <button
          onClick={onBindAsAccessory}
          disabled={!selectedProfileId && !selectedCellId}
          className={`flex-1 py-0.5 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
            selectedProfileId || selectedCellId
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title={
            selectedProfileId || selectedCellId
              ? 'Привязать как комплектующее (уплотнитель, термомост, резина)'
              : 'Сначала выберите профиль или ячейку'
          }
        >
          <Wrench className="w-2.5 h-2.5" />
          <span>Как компл.</span>
        </button>
      </div>
    </div>
  );
};
