import { ModuleModel } from '../types';

export interface SpectoolProjectFile {
  app: 'Spectool';
  version: string;
  savedAt: string;
  module: ModuleModel;
}

/**
 * Экспортирует полный проект модуля в файл .spectool (JSON)
 */
export function exportProjectFile(module: ModuleModel): void {
  const data: SpectoolProjectFile = {
    app: 'Spectool',
    version: '1.1.0',
    savedAt: new Date().toISOString(),
    module
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const fileName = `${module.project || 'А1187'}_${module.name || 'Модуль'}_${module.width}x${module.height}.spectool`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Читает и валидирует файл .spectool / .json
 */
export async function importProjectFile(file: File): Promise<ModuleModel> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  // Поддержка как структуры { app: 'Spectool', module: ... }, так и прямого ModuleModel
  let moduleData: ModuleModel;
  if (parsed.module && parsed.module.lines) {
    moduleData = parsed.module;
  } else if (parsed.lines && Array.isArray(parsed.lines)) {
    moduleData = parsed as ModuleModel;
  } else {
    throw new Error('Файл не содержит корректных данных модуля Spectool');
  }

  // Гарантируем наличие необходимых массивов
  moduleData.lines = Array.isArray(moduleData.lines) ? moduleData.lines : [];
  moduleData.cells = Array.isArray(moduleData.cells) ? moduleData.cells : [];
  moduleData.standaloneItems = Array.isArray(moduleData.standaloneItems) ? moduleData.standaloneItems : [];
  moduleData.colors = Array.isArray(moduleData.colors) && moduleData.colors.length > 0
    ? moduleData.colors
    : [moduleData.color || 'RAL 7012'];

  return moduleData;
}

