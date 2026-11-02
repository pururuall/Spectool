import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Database,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
  Edit2,
  Upload,
  RotateCcw,
  Search,
  Check,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  Layers,
  Wrench,
  Sliders,
  Save
} from 'lucide-react';
import {
  MaterialFolderNode,
  CatalogMaterialItem,
  CatalogHardwareItem
} from '../types';
import {
  getMaterialTree,
  saveMaterialTree,
  resetMaterialTree,
  addFolderToTree,
  renameFolderInTree,
  deleteFolderFromTree,
  addItemToFolder,
  updateItemInTree,
  deleteItemFromTree,
  parseAndSaveMaterialsExcel,
  getHardwareDB,
  saveHardwareDB,
  resetHardwareDB,
  addHardwareItem,
  updateHardwareItem,
  deleteHardwareItem,
  getHardwareTypes,
  parseAndSaveHardwareExcel
} from '../utils/databaseService';
import {
  getProcessTemplates,
  addProcessTemplate,
  deleteProcessTemplate,
  resetProcessTemplates
} from '../utils/processTemplatesService';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'materials' | 'hardware' | 'processes';
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'materials'
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'hardware' | 'processes'>(initialTab);

  // Synchronize when opened with a specific initial tab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Менеджер Баз Данных Spectool</h2>
              <p className="text-[11px] text-slate-500">
                Иерархические каталоги материалов, заводские метизы и шаблоны технологических карт Vogbit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'materials'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Материалы и профили</span>
              </button>
              <button
                onClick={() => setActiveTab('hardware')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'hardware'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Метизы (338 поз.)</span>
              </button>
              <button
                onClick={() => setActiveTab('processes')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'processes'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Шаблоны ТП (Vogbit)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content based on active tab */}
        <div className="flex-1 overflow-hidden bg-slate-50/50">
          {activeTab === 'materials' && <MaterialsManagerTab />}
          {activeTab === 'hardware' && <HardwareManagerTab />}
          {activeTab === 'processes' && <ProcessesManagerTab />}
        </div>
      </div>
    </div>
  );
};

// ====================================================
// TAB 1: MATERIALS HIERARCHICAL TREE MANAGER
// ====================================================

const MaterialsManagerTab: React.FC = () => {
  const [treeData, setTreeData] = useState(() => getMaterialTree());
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('f_sheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogMaterialItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const updated = addFolderToTree(treeData.root, selectedFolderId, newFolderName.trim());
    saveMaterialTree(updated);
    setTreeData(getMaterialTree());
    setNewFolderName('');
    setIsAddingFolder(false);
    showStatus('Папка успешно создана');
  };

  const handleRenameFolder = (id: string, currentName: string) => {
    const val = prompt('Новое название папки:', currentName);
    if (val && val.trim() && val !== currentName) {
      const updated = renameFolderInTree(treeData.root, id, val.trim());
      saveMaterialTree(updated);
      setTreeData(getMaterialTree());
      showStatus('Папка переименована');
    }
  };

  const handleDeleteFolder = (id: string, name: string) => {
    if (confirm(`Удалить папку «${name}» со всеми подпапками и материалами?`)) {
      const updated = deleteFolderFromTree(treeData.root, id);
      saveMaterialTree(updated);
      setTreeData(getMaterialTree());
      setSelectedFolderId(null);
      showStatus('Папка удалена');
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Сбросить базу материалов к заводской эталонной структуре?')) {
      resetMaterialTree();
      setTreeData(getMaterialTree());
      setSelectedFolderId(null);
      showStatus('База материалов сброшена к заводским позициям');
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await parseAndSaveMaterialsExcel(file);
      setTreeData(getMaterialTree());
      showStatus(`Успешно импортировано: ${res.count} позиций из «${res.filename}»`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showStatus(msg, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Find currently selected folder node
  const findFolder = (nodes: MaterialFolderNode[], id: string | null): MaterialFolderNode | null => {
    if (!id) return null;
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.subfolders && n.subfolders.length > 0) {
        const found = findFolder(n.subfolders, id);
        if (found) return found;
      }
    }
    return null;
  };

  const currentFolder = findFolder(treeData.root, selectedFolderId);

  // Items to show in table: if search is active, show matching across entire tree; otherwise show items in selected folder
  const displayedItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const all: CatalogMaterialItem[] = [];
      const collect = (nodes: MaterialFolderNode[]) => {
        for (const n of nodes) {
          if (n.items) {
            for (const it of n.items) {
              if (
                it.article.toLowerCase().includes(q) ||
                it.name.toLowerCase().includes(q) ||
                (it.code && it.code.toLowerCase().includes(q)) ||
                (it.standard && it.standard.toLowerCase().includes(q))
              ) {
                all.push(it);
              }
            }
          }
          if (n.subfolders) collect(n.subfolders);
        }
      };
      collect(treeData.root);
      return all;
    }
    return currentFolder?.items || [];
  }, [treeData.root, selectedFolderId, searchQuery, currentFolder]);

  return (
    <div className="flex h-full overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelImport}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Left Column: Recursive Folder Tree */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 uppercase tracking-wider">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>Папки материалов</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAddingFolder(true)}
              className="text-[11px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer transition"
              title="Создать подпапку"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Папка</span>
            </button>
          </div>
        </div>

        {isAddingFolder && (
          <div className="p-2.5 bg-blue-50/60 border-b border-blue-200">
            <p className="text-[10px] text-blue-800 font-semibold mb-1">
              {currentFolder ? `Создать внутри «${currentFolder.name}»:` : 'Создать в корне:'}
            </p>
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="Имя папки..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleCreateFolder}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold cursor-pointer"
              >
                ОК
              </button>
              <button
                onClick={() => setIsAddingFolder(false)}
                className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Tree container */}
        <div className="flex-1 overflow-y-auto p-2">
          {treeData.root.map((rootNode) => (
            <FolderTreeItem
              key={rootNode.id}
              node={rootNode}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(id) => {
                setSelectedFolderId(id);
                setSearchQuery('');
              }}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          ))}
        </div>

        {/* Bottom actions: import & reset */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
            title="Импортировать Excel-файл со структурой материалов"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Импорт Excel</span>
          </button>
          <button
            onClick={handleResetToDefault}
            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer text-[11px]"
            title="Сбросить к заводской базе"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сброс</span>
          </button>
        </div>
      </div>

      {/* Right Column: Items in selected folder */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top toolbar */}
        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-slate-800">
              {searchQuery ? `Результаты поиска: «${searchQuery}»` : currentFolder ? currentFolder.name : 'Все материалы'}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-200 px-1.5 py-0.5 rounded">
              {displayedItems.length} поз.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по марке, названию, ГОСТ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {selectedFolderId && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingItem(true);
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Материал</span>
              </button>
            )}
          </div>
        </div>

        {/* Status banner */}
        {statusMsg && (
          <div
            className={`px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 border-b ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Items Table */}
        <div className="flex-1 overflow-auto">
          {displayedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <Folder className="w-10 h-10 stroke-1 text-slate-300 mb-2" />
              <p>В этой папке пока нет материалов</p>
              {selectedFolderId && (
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="mt-2 text-blue-600 hover:underline font-semibold text-xs cursor-pointer"
                >
                  + Добавить первый материал
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-2 px-3">Обозначение / Марка</th>
                  <th className="py-2 px-3">Наименование</th>
                  <th className="py-2 px-3">Стандарт / ГОСТ</th>
                  <th className="py-2 px-3">ЕИ</th>
                  <th className="py-2 px-3">Толщина (мм)</th>
                  <th className="py-2 px-3">Вес (кг)</th>
                  <th className="py-2 px-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 group transition">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{item.code || item.article}</td>
                    <td className="py-2 px-3 text-slate-700">{item.name}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{item.standard || '—'}</td>
                    <td className="py-2 px-3 text-slate-600">{item.unit}</td>
                    <td className="py-2 px-3 text-slate-600">{item.thickness ? `${item.thickness} мм` : '—'}</td>
                    <td className="py-2 px-3 text-slate-600">{item.weight ? `${item.weight}` : '—'}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsAddingItem(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                          title="Редактировать"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Удалить «${item.name}»?`)) {
                              const updated = deleteItemFromTree(treeData.root, item.id);
                              saveMaterialTree(updated);
                              setTreeData(getMaterialTree());
                              showStatus('Материал удален');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal dialog for Add / Edit Item */}
        {isAddingItem && (
          <ItemEditorModal
            folderId={selectedFolderId!}
            item={editingItem}
            onClose={() => {
              setIsAddingItem(false);
              setEditingItem(null);
            }}
            onSave={(savedItem) => {
              let updatedTree: MaterialFolderNode[];
              if (editingItem) {
                updatedTree = updateItemInTree(treeData.root, editingItem.id, savedItem);
                showStatus('Материал обновлен');
              } else {
                updatedTree = addItemToFolder(treeData.root, selectedFolderId!, savedItem);
                showStatus('Материал добавлен');
              }
              saveMaterialTree(updatedTree);
              setTreeData(getMaterialTree());
              setIsAddingItem(false);
              setEditingItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Recursive Folder Tree Node component
const FolderTreeItem: React.FC<{
  node: MaterialFolderNode;
  selectedFolderId: string | null;
  onSelectFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
}> = ({ node, selectedFolderId, onSelectFolder, onRenameFolder, onDeleteFolder }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedFolderId === node.id;
  const hasSubfolders = node.subfolders && node.subfolders.length > 0;
  const totalItems = (node.items?.length || 0);

  return (
    <div className="select-none text-xs">
      <div
        onClick={() => onSelectFolder(node.id)}
        className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition group ${
          isSelected
            ? 'bg-blue-600 text-white font-semibold shadow-2xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {hasSubfolders ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
            >
              {isOpen ? (
                <ChevronDown className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              )}
            </button>
          ) : (
            <span className="w-4.5" />
          )}

          <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`} />
          <span className="truncate">{node.name}</span>
        </div>

        <div className="flex items-center gap-1">
          {totalItems > 0 && (
            <span
              className={`text-[10px] px-1 rounded font-mono ${
                isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {totalItems}
            </span>
          )}

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRenameFolder(node.id, node.name);
              }}
              className={`p-0.5 rounded cursor-pointer ${
                isSelected ? 'hover:bg-blue-700 text-blue-200' : 'hover:bg-slate-200 text-slate-400'
              }`}
              title="Переименовать папку"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(node.id, node.name);
              }}
              className={`p-0.5 rounded cursor-pointer ${
                isSelected ? 'hover:bg-blue-700 text-rose-200' : 'hover:bg-slate-200 text-rose-500'
              }`}
              title="Удалить папку"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {hasSubfolders && isOpen && (
        <div className="ml-3 pl-1 border-l border-slate-200 space-y-0.5 mt-0.5">
          {node.subfolders.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Item Editor Modal Component
const ItemEditorModal: React.FC<{
  folderId: string;
  item: CatalogMaterialItem | null;
  onClose: () => void;
  onSave: (item: CatalogMaterialItem) => void;
}> = ({ item, onClose, onSave }) => {
  const [code, setCode] = useState(item?.code || item?.article || '');
  const [name, setName] = useState(item?.name || '');
  const [standard, setStandard] = useState(item?.standard || '');
  const [material, setMaterial] = useState(item?.material || '');
  const [unit, setUnit] = useState(item?.unit || 'п.м.');
  const [thickness, setThickness] = useState(item?.thickness ? String(item.thickness) : '');
  const [weight, setWeight] = useState(item?.weight ? String(item.weight) : '');

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      alert('Укажите обозначение и наименование материала');
      return;
    }
    const result: CatalogMaterialItem = {
      id: item?.id || `mat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      section: item?.section || 'Материалы',
      subsection: item?.subsection || 'Общее',
      article: code.trim(),
      code: code.trim(),
      name: name.trim(),
      standard: standard.trim() || undefined,
      material: material.trim() || code.trim(),
      unit,
      thickness: thickness ? parseFloat(thickness) : undefined,
      weight: weight ? parseFloat(weight) : undefined
    };
    onSave(result);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="h-11 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50">
          <h4 className="font-bold text-xs text-slate-800">
            {item ? 'Редактировать материал' : 'Добавить материал в папку'}
          </h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Обозначение / Артикул / Марка *
            </label>
            <input
              type="text"
              placeholder="напр. С245 06мм или AYPC.EF100.0101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Полное наименование *
            </label>
            <input
              type="text"
              placeholder="напр. Лист 6 С245 ГОСТ 19903-2015"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ГОСТ / Стандарт
              </label>
              <input
                type="text"
                placeholder="ГОСТ 19903-2015"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Единица измерения
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="п.м.">п.м. (погонный метр)</option>
                <option value="м2">м² (квадратный метр)</option>
                <option value="шт">шт (штука)</option>
                <option value="кг">кг (килограмм)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Толщина (мм)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="напр. 6.0"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Вес единицы (кг)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="напр. 47.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-xs cursor-pointer font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs cursor-pointer font-bold shadow-xs"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================================================
// TAB 2: HARDWARE DATABASE MANAGER
// ====================================================

const HardwareManagerTab: React.FC = () => {
  const [dbState, setDbState] = useState(() => getHardwareDB());
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const types = useMemo(() => getHardwareTypes(dbState.items), [dbState.items]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await parseAndSaveHardwareExcel(file);
      setDbState(getHardwareDB());
      showStatus(`Успешно импортировано: ${res.count} метизов из «${res.filename}»`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showStatus(msg, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить базу метизов к заводским 338 позициям?')) {
      resetHardwareDB();
      setDbState(getHardwareDB());
      showStatus('База метизов сброшена к заводским позициям');
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return dbState.items.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      if (!q) return true;
      return (
        item.article.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.standard.toLowerCase().includes(q) ||
        (item.diameter && item.diameter.toLowerCase().includes(q)) ||
        (item.length && item.length.toLowerCase().includes(q)) ||
        (item.material && item.material.toLowerCase().includes(q))
      );
    });
  }, [dbState.items, selectedType, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelImport}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Top Filter and Controls Bar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          {/* Dynamic Type Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Тип метиза:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Все типы ({dbState.items.length})</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по артикулу, названию, стандарту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Импорт Excel</span>
          </button>
          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сброс (338)</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div
          className={`px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 border-b ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Hardware Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-2 px-3">Обозначение / Артикул</th>
              <th className="py-2 px-3">Наименование</th>
              <th className="py-2 px-3">Тип</th>
              <th className="py-2 px-3">Стандарт (ГОСТ/DIN)</th>
              <th className="py-2 px-3">Диаметр</th>
              <th className="py-2 px-3">Длина</th>
              <th className="py-2 px-3">Материал / покрытие</th>
              <th className="py-2 px-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/40 group transition">
                <td className="py-2 px-3 font-mono font-bold text-slate-900">{item.article}</td>
                <td className="py-2 px-3 text-slate-700">{item.name}</td>
                <td className="py-2 px-3">
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium">
                    {item.type}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{item.standard || '—'}</td>
                <td className="py-2 px-3 text-slate-600 font-mono">{item.diameter || '—'}</td>
                <td className="py-2 px-3 text-slate-600 font-mono">{item.length || '—'}</td>
                <td className="py-2 px-3 text-slate-600">{item.material || '—'}</td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Удалить «${item.name}»?`)) {
                        deleteHardwareItem(item.id);
                        setDbState(getHardwareDB());
                        showStatus('Метиз удален');
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ====================================================
// TAB 3: PROCESS TEMPLATES (VOGBIT) MANAGER
// ====================================================

const ProcessesManagerTab: React.FC = () => {
  const [templates, setTemplates] = useState(() => getProcessTemplates());
  const [newTemplate, setNewTemplate] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newTemplate.trim()) return;
    const updated = addProcessTemplate(newTemplate.trim());
    setTemplates(updated);
    setNewTemplate('');
    setStatusMsg('Шаблон техпроцесса добавлен');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Удалить шаблон ТП «${name}»?`)) {
      const updated = deleteProcessTemplate(name);
      setTemplates(updated);
      setStatusMsg('Шаблон удален');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить базу шаблонов техпроцесса к 27 заводским категориям?')) {
      const updated = resetProcessTemplates();
      setTemplates(updated);
      setStatusMsg('База шаблонов ТП сброшена к заводским позициям');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-4">
      <div className="mb-4 bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-blue-900">Категории техпроцесса для системы Vogbit</h4>
          <p className="text-[11px] text-blue-700">
            Определяют маршрутную технологическую карту (ЦМК, мехобработка, резка, сборка) при импорте спецификации.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-2.5 py-1 text-xs bg-white text-slate-600 hover:text-rose-600 border border-slate-300 rounded font-medium cursor-pointer"
        >
          Сброс к заводским 27 категориям
        </button>
      </div>

      {/* Add new template row */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Введите название нового шаблона техпроцесса..."
          value={newTemplate}
          onChange={(e) => setNewTemplate(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить</span>
        </button>
      </div>

      {statusMsg && (
        <div className="mb-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200 flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Templates List */}
      <div className="flex-1 overflow-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
        {templates.map((tpl, idx) => (
          <div
            key={tpl}
            className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono w-6">{idx + 1}.</span>
              <span className="font-semibold text-slate-800">{tpl}</span>
            </div>
            <button
              onClick={() => handleDelete(tpl)}
              className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
              title="Удалить шаблон"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

