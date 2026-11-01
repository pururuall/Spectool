import React, { useState } from 'react';
import { X, Layers, Plus, Trash2, RefreshCw, Check, Search, BookOpen } from 'lucide-react';
import {
  getProcessTemplates,
  addProcessTemplate,
  removeProcessTemplate,
  resetProcessTemplates
} from '../utils/processTemplatesService';

interface ProcessTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (templateName: string) => void;
}

export const ProcessTemplatesModal: React.FC<ProcessTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<string[]>(getProcessTemplates);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newTemplateName.trim();
    if (!trimmed) return;
    const updated = addProcessTemplate(trimmed);
    setTemplates(updated);
    setNewTemplateName('');
  };

  const handleRemove = (name: string) => {
    if (confirm(`Удалить шаблон ТП "${name}"?`)) {
      const updated = removeProcessTemplate(name);
      setTemplates(updated);
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить шаблоны ТП к заводскому списку (27 категорий по технологической карте)?')) {
      const reset = resetProcessTemplates();
      setTemplates(reset);
    }
  };

  const filtered = templates.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="h-12 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              База данных: Шаблоны техпроцесса (ТП для Vogbit)
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-full">
              {templates.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Add Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
          {/* Add Input */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Добавить новый шаблон техпроцесса..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newTemplateName.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по шаблонам техпроцесса..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* List of Templates */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1 max-h-[50vh]">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Шаблонов не найдено
            </div>
          ) : (
            filtered.map((tmpl, idx) => (
              <div
                key={tmpl}
                className="group flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition text-xs"
              >
                <div
                  onClick={() => {
                    if (onSelectTemplate) {
                      onSelectTemplate(tmpl);
                      onClose();
                    }
                  }}
                  className={`flex-1 flex items-center gap-2 ${onSelectTemplate ? 'cursor-pointer' : ''}`}
                >
                  <span className="font-mono text-[10px] text-slate-400 w-5 text-right">
                    {idx + 1}.
                  </span>
                  <span className="font-medium text-slate-800 group-hover:text-blue-900">
                    {tmpl}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {onSelectTemplate && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTemplate(tmpl);
                        onClose();
                      }}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-[10px] font-bold transition cursor-pointer"
                    >
                      Выбрать
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(tmpl)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                    title="Удалить шаблон"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
            title="Восстановить заводской перечень (27 категорий)"
          >
            <RefreshCw className="w-3 h-3" />
            Заводские 27 категорий (из файла БД)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

