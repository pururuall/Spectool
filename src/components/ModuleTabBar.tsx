import React, { useState, useRef, useEffect } from 'react';
import { ModuleModel } from '../types';
import { Plus, X, Copy, Sparkles, Building2, ChevronDown, Edit2 } from 'lucide-react';

interface ModuleTabBarProps {
  modules: ModuleModel[];
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  onNewEmptyModule: () => void;
  onDuplicateModule: (id: string) => void;
  onCloseModule: (id: string) => void;
  onLoadPreset: () => void;
  onRenameModule?: (id: string, newName: string) => void;
}

export const ModuleTabBar: React.FC<ModuleTabBarProps> = ({
  modules,
  activeModuleId,
  onSelectModule,
  onNewEmptyModule,
  onDuplicateModule,
  onCloseModule,
  onLoadPreset,
  onRenameModule
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextTabId, setContextTabId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setContextTabId(null);
    setIsMenuOpen((prev) => !prev);
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY + 4 });
    setContextTabId(tabId);
    setIsMenuOpen(true);
  };

  const startRename = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditingName(currentName);
    setIsMenuOpen(false);
  };

  const saveRename = () => {
    if (editingTabId && editingName.trim() && onRenameModule) {
      onRenameModule(editingTabId, editingName.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="h-9 bg-slate-200/90 border-b border-slate-300 px-2 flex items-center justify-between select-none shrink-0 relative z-20 overflow-hidden">
      {/* Scrollable Tabs Track with scrollbars strictly suppressed */}
      <div
        className="flex items-center gap-1 overflow-x-auto overflow-y-hidden h-full pt-1 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {modules.map((m, index) => {
          const isActive = m.id === activeModuleId;
          const isEditing = editingTabId === m.id;
          const baseName = m.name || `Модуль ${index + 1}`;
          const title = `${m.project ? m.project + ' ' : ''}${baseName}`;

          return (
            <div
              key={m.id}
              onClick={() => {
                if (!isEditing) onSelectModule(m.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                startRename(m.id, m.name || 'Модуль');
              }}
              onContextMenu={(e) => handleContextMenu(e, m.id)}
              className={`group flex items-center gap-2 px-3 h-8 rounded-t-md text-xs cursor-pointer transition shrink-0 max-w-[280px] ${
                isActive
                  ? 'bg-white border-t-2 border-t-blue-600 border-x border-b-0 border-slate-300 font-bold text-slate-900 shadow-xs'
                  : 'bg-slate-300/60 hover:bg-slate-300 text-slate-700 border-t-2 border-t-transparent border-x border-slate-300/40'
              }`}
              title={`${title} (${m.width}×${m.height} мм)\nДвойной клик — переименовать\nПравый клик — меню`}
            >
              <Building2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />

              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename();
                    if (e.key === 'Escape') setEditingTabId(null);
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white border border-blue-500 rounded px-1 py-0.5 text-xs text-slate-900 w-28 focus:outline-none"
                />
              ) : (
                <span className="truncate">{title}</span>
              )}

              <span
                className={`text-[10px] font-mono px-1 rounded shrink-0 font-normal ${
                  isActive ? 'bg-slate-100 text-slate-600' : 'text-slate-500'
                }`}
              >
                {m.width}×{m.height}
              </span>

              {/* Close Tab Button */}
              {modules.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseModule(m.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-red-100 text-slate-400 hover:text-red-600 p-0.5 rounded transition cursor-pointer ml-0.5"
                  title="Закрыть вкладку этого модуля"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Buttons: Direct New Tab (+) + Dropdown options (v) */}
        <div className="flex items-center gap-0.5 shrink-0 pl-1">
          {/* 1. Direct Add New Tab on 1 Click */}
          <button
            type="button"
            onClick={onNewEmptyModule}
            className="h-7 px-2 rounded-md bg-white hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-300 hover:border-blue-600 transition flex items-center gap-1 cursor-pointer text-xs font-semibold shadow-2xs group"
            title="Создать новый модуль в новой вкладке (+)"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
            <span className="hidden sm:inline text-[11px]">Новый</span>
          </button>

          {/* 2. Extra options button */}
          <button
            type="button"
            onClick={handleOpenDropdown}
            className="h-7 px-1.5 rounded-md bg-white hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 transition flex items-center justify-center cursor-pointer text-xs shadow-2xs"
            title="Дополнительные действия с модулями (дублировать, эталон Жукова)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FIXED POSITION DROPDOWN MENU — NEVER CLIPPED BY ANY OVERFLOW */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            left: `${menuPos.x}px`,
            top: `${menuPos.y}px`,
            zIndex: 9999
          }}
          className="w-64 bg-white border border-slate-300 rounded-xl shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            {contextTabId
              ? `Модуль: ${modules.find((m) => m.id === contextTabId)?.name || 'Вкладка'}`
              : 'Управление вкладками'}
          </div>

          <button
            type="button"
            onClick={() => {
              onNewEmptyModule();
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Новый пустой модуль</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDuplicateModule(contextTabId || activeModuleId);
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition font-medium text-emerald-800"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span>📋 Дублировать {contextTabId ? 'этот' : 'текущий'} модуль</span>
          </button>

          {contextTabId && onRenameModule && (
            <button
              type="button"
              onClick={() => {
                const targetMod = modules.find((m) => m.id === contextTabId);
                startRename(contextTabId, targetMod?.name || 'Модуль');
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition font-medium text-slate-700"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>✏️ Переименовать</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              onLoadPreset();
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition text-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>⭐ Загрузить эталон Жукова (М507)</span>
          </button>

          {contextTabId && modules.length > 1 && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  onCloseModule(contextTabId);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 cursor-pointer transition font-medium text-red-600"
              >
                <X className="w-3.5 h-3.5" />
                <span>Закрыть эту вкладку</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
