import React, { useState } from 'react';
import { X, Plus, Layers } from 'lucide-react';
import { CatalogProfileItem } from '../types';

interface CustomProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: CatalogProfileItem) => void;
}

export const CustomProfileModal: React.FC<CustomProfileModalProps> = ({
  isOpen,
  onClose,
  onAddProfile
}) => {
  if (!isOpen) return null;

  const [company, setCompany] = useState('Alutech');
  const [customCompany, setCustomCompany] = useState('');
  const [article, setArticle] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'frame_vertical' | 'frame_horizontal' | 'transom' | 'clamp' | 'cap' | 'joint'>('transom');
  const [defaultOffset, setDefaultOffset] = useState<number>(40);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!article.trim() || !name.trim()) return;

    const actualCompany = company === 'Other' ? customCompany || 'Пользовательский' : company;

    onAddProfile({
      article: article.trim(),
      name: name.trim(),
      system: `${actualCompany} Custom`,
      company: actualCompany,
      defaultOffset: defaultOffset || 0,
      defaultOffsetFormula: `L - ${defaultOffset}`,
      category,
      suggestedAccessories: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Добавить профиль в каталог</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Компания / Производитель:</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
            >
              <option value="Alutech">Alutech (Алютех)</option>
              <option value="Schüco">Schüco (Шуко)</option>
              <option value="Reynaers">Reynaers (Рейнарс)</option>
              <option value="Татпроф">Татпроф</option>
              <option value="Сиал">Сиал</option>
              <option value="Other">Другой производитель...</option>
            </select>
          </div>

          {company === 'Other' && (
            <div>
              <label className="text-slate-500 block mb-0.5">Название компании:</label>
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="например Нью-Тек, СИАЛ"
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Артикул профиля:</label>
            <input
              type="text"
              required
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              placeholder="например AYPC.EF100.40.0101 или Sc 398120"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Наименование профиля:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например Рама боковая, Ригель промежуточный"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Категория:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800"
              >
                <option value="frame_vertical">Стойка / Боковая рама</option>
                <option value="frame_horizontal">Горизонтальная рама</option>
                <option value="transom">Импост / Ригель</option>
                <option value="clamp">Прижимная планка</option>
                <option value="cap">Декоративная крышка</option>
                <option value="joint">Стык / Соединитель</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Отступ по умолч. (мм):</label>
              <input
                type="number"
                value={defaultOffset}
                onChange={(e) => setDefaultOffset(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить в каталог
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

