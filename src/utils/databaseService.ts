import * as XLSX from 'xlsx';
import { CatalogHardwareItem, CatalogMaterialItem } from '../types';
import defaultHardwareData from '../data/defaultHardware.json';
import defaultMaterialsData from '../data/defaultMaterials.json';

const HARDWARE_STORAGE_KEY = 'spectool_hardware_items_v2';
const HARDWARE_FILENAME_KEY = 'spectool_hardware_filename_v2';
const HARDWARE_UPDATED_KEY = 'spectool_hardware_updated_v2';

const MATERIALS_STORAGE_KEY = 'spectool_materials_items_v2';
const MATERIALS_FILENAME_KEY = 'spectool_materials_filename_v2';
const MATERIALS_UPDATED_KEY = 'spectool_materials_updated_v2';

// ----------------------------------------------------
// 1. HARDWARE (МЕТИЗЫ И КОМПЛЕКТУЮЩИЕ)
// ----------------------------------------------------

export function getHardwareDB(): { items: CatalogHardwareItem[]; filename: string; updatedAt: string } {
  try {
    const saved = localStorage.getItem(HARDWARE_STORAGE_KEY);
    const filename = localStorage.getItem(HARDWARE_FILENAME_KEY) || 'Метизы.xlsx (по умолчанию)';
    const updatedAt = localStorage.getItem(HARDWARE_UPDATED_KEY) || '';

    if (saved) {
      const items: CatalogHardwareItem[] = JSON.parse(saved);
      if (Array.isArray(items) && items.length > 0) {
        return { items, filename, updatedAt };
      }
    }
  } catch (err) {
    console.warn('Не удалось прочитать сохраненную БД метизов из localStorage:', err);
  }

  // Fallback to pre-bundled 338 items
  const defaults = (defaultHardwareData as unknown) as CatalogHardwareItem[];
  return {
    items: defaults,
    filename: 'Метизы.xlsx (заводская база)',
    updatedAt: ''
  };
}

export function saveHardwareDB(items: CatalogHardwareItem[], filename: string) {
  try {
    const now = new Date().toLocaleString('ru-RU');
    localStorage.setItem(HARDWARE_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(HARDWARE_FILENAME_KEY, filename);
    localStorage.setItem(HARDWARE_UPDATED_KEY, now);
  } catch (err) {
    console.error('Ошибка сохранения БД метизов в localStorage:', err);
  }
}

export function resetHardwareDB(): CatalogHardwareItem[] {
  try {
    localStorage.removeItem(HARDWARE_STORAGE_KEY);
    localStorage.removeItem(HARDWARE_FILENAME_KEY);
    localStorage.removeItem(HARDWARE_UPDATED_KEY);
  } catch (e) {
    console.warn(e);
  }
  return (defaultHardwareData as unknown) as CatalogHardwareItem[];
}

export async function parseAndSaveHardwareExcel(
  file: File
): Promise<{ items: CatalogHardwareItem[]; filename: string; count: number }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Pick first sheet or 'Лист1'
  const sheetName = wb.SheetNames.includes('Лист1') ? 'Лист1' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    throw new Error('В файле Excel не найдено листов с данными');
  }

  // Parse rows as raw objects
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);
  if (!rawRows || rawRows.length === 0) {
    throw new Error('Выбранный лист Excel пуст');
  }

  const items: CatalogHardwareItem[] = [];

  rawRows.forEach((r, idx) => {
    // Dynamic mapping for flexible column naming (Russian & English)
    const article = String(
      r['Обозначение'] ||
      r['Артикул'] ||
      r['Код'] ||
      r['Article'] ||
      r['Code'] ||
      `МЕТ-${idx + 1}`
    ).trim();

    const name = String(
      r['Наименование'] ||
      r['Обозначение'] ||
      r['Name'] ||
      r['Description'] ||
      'Метиз'
    ).trim();

    const type = String(
      r['Тип'] ||
      r['Категория'] ||
      r['Группа'] ||
      r['Type'] ||
      'Крепеж'
    ).trim();

    const standard = String(
      r['Стандарт'] ||
      r['ГОСТ'] ||
      r['DIN'] ||
      r['Standard'] ||
      ''
    ).trim();

    const diameter = String(
      r['Основной диаметр'] ||
      r['Диаметр'] ||
      r['Diameter'] ||
      r['D'] ||
      ''
    ).trim();

    const length = String(
      r['Длина'] ||
      r['L'] ||
      r['Length'] ||
      ''
    ).trim();

    const material = String(
      r['Материал и/или покрытие'] ||
      r['Материал'] ||
      r['Покрытие'] ||
      r['Material'] ||
      ''
    ).trim();

    const strength = r['Класс прочности'] ? String(r['Класс прочности']).trim() : undefined;
    const color = r['Цвет'] ? String(r['Цвет']).trim() : undefined;
    const code = r['Артикул'] ? String(r['Артикул']).trim() : undefined;

    // Filter out rows without meaningful name or article
    if (article && name) {
      items.push({
        id: `custom_met_${Date.now()}_${idx}`,
        article,
        code,
        name,
        type,
        standard,
        diameter,
        length,
        material,
        strength,
        color
      });
    }
  });

  if (items.length === 0) {
    throw new Error('Не удалось распознать строки метизов. Проверьте заголовки колонок в файле Excel.');
  }

  saveHardwareDB(items, file.name);

  return {
    items,
    filename: file.name,
    count: items.length
  };
}


// ----------------------------------------------------
// 2. MATERIALS (ПРОФИЛИ, ЛИСТОВЫЕ, ЗАПОЛНЕНИЯ)
// ----------------------------------------------------

export function getMaterialsDB(): { items: CatalogMaterialItem[]; filename: string; updatedAt: string } {
  try {
    const saved = localStorage.getItem(MATERIALS_STORAGE_KEY);
    const filename = localStorage.getItem(MATERIALS_FILENAME_KEY) || 'Материалы.xlsx (по умолчанию)';
    const updatedAt = localStorage.getItem(MATERIALS_UPDATED_KEY) || '';

    if (saved) {
      const items: CatalogMaterialItem[] = JSON.parse(saved);
      if (Array.isArray(items) && items.length > 0) {
        return { items, filename, updatedAt };
      }
    }
  } catch (err) {
    console.warn('Не удалось прочитать сохраненную БД материалов из localStorage:', err);
  }

  const defaults = (defaultMaterialsData as unknown) as CatalogMaterialItem[];
  return {
    items: defaults,
    filename: 'Материалы.xlsx (заводская база)',
    updatedAt: ''
  };
}

export function saveMaterialsDB(items: CatalogMaterialItem[], filename: string) {
  try {
    const now = new Date().toLocaleString('ru-RU');
    localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(MATERIALS_FILENAME_KEY, filename);
    localStorage.setItem(MATERIALS_UPDATED_KEY, now);
  } catch (err) {
    console.error('Ошибка сохранения БД материалов в localStorage:', err);
  }
}

export function resetMaterialsDB(): CatalogMaterialItem[] {
  try {
    localStorage.removeItem(MATERIALS_STORAGE_KEY);
    localStorage.removeItem(MATERIALS_FILENAME_KEY);
    localStorage.removeItem(MATERIALS_UPDATED_KEY);
  } catch (e) {
    console.warn(e);
  }
  return (defaultMaterialsData as unknown) as CatalogMaterialItem[];
}

export async function parseAndSaveMaterialsExcel(
  file: File
): Promise<{ items: CatalogMaterialItem[]; filename: string; count: number }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const items: CatalogMaterialItem[] = [];

  // Iterate all non-empty sheets (allows multi-sheet files where Sheet = Section)
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);
    if (!rawRows || rawRows.length === 0) continue;

    rawRows.forEach((r, idx) => {
      // 1. Hierarchy: Section & Subsection
      let section = String(
        r['Раздел'] ||
        r['Категория'] ||
        r['Группа 1'] ||
        r['Section'] ||
        (wb.SheetNames.length > 1 ? sheetName : 'Материалы')
      ).trim();

      let subsection = String(
        r['Подраздел'] ||
        r['Группа 2'] ||
        r['Тип'] ||
        r['Subsection'] ||
        'Общее'
      ).trim();

      // Support "Путь" format: e.g. "Профили / Alutech / Стойки"
      const pathCol = r['Путь'] || r['Папка'] || r['Path'];
      if (pathCol) {
        const parts = String(pathCol).split(/[/|\\]/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          section = parts[0];
          subsection = parts.slice(1).join(' / ');
        } else if (parts.length === 1) {
          section = parts[0];
        }
      }

      // 2. Article & Name
      const article = String(
        r['Артикул'] ||
        r['Обозначение'] ||
        r['Код'] ||
        r['Article'] ||
        `МАТ-${idx + 1}`
      ).trim();

      const name = String(
        r['Наименование'] ||
        r['Название'] ||
        r['Name'] ||
        article
      ).trim();

      // 3. Material & Unit
      const material = String(
        r['Материал / Сплав'] ||
        r['Материал'] ||
        r['Сплав'] ||
        r['Material'] ||
        ''
      ).trim();

      const unit = String(
        r['Ед. изм.'] ||
        r['ЕИ'] ||
        r['Ед.изм'] ||
        r['Unit'] ||
        'п.м.'
      ).trim();

      // 4. Weight & dimensions
      const rawWeight = r['Вес (п.м. или м²)'] ?? r['Вес п.м. (кг)'] ?? r['Вес (кг)'] ?? r['Вес'] ?? r['Weight'];
      const weight = rawWeight !== undefined && rawWeight !== null ? Number(String(rawWeight).replace(',', '.')) : undefined;

      const rawStock = r['Длина хлыста (мм)'] ?? r['Длина хлыста'] ?? r['Длина'] ?? r['Length'];
      const stockLength = rawStock ? Number(String(rawStock).replace(',', '.')) : undefined;

      const rawWidth = r['Ширина (мм)'] ?? r['Ширина'] ?? r['Width'];
      const width = rawWidth ? Number(String(rawWidth).replace(',', '.')) : undefined;

      const rawDepth = r['Глубина (мм)'] ?? r['Глубина'] ?? r['Толщина'] ?? r['Depth'];
      const depth = rawDepth ? Number(String(rawDepth).replace(',', '.')) : undefined;

      const company = r['Производитель'] || r['Бренд'] || r['Компания'] ? String(r['Производитель'] || r['Бренд'] || r['Компания']).trim() : undefined;
      const system = r['Система'] ? String(r['Система']).trim() : undefined;

      // Category detection
      let category: CatalogMaterialItem['category'] = 'other';
      const lowName = name.toLowerCase();
      const lowSub = subsection.toLowerCase();
      const lowSec = section.toLowerCase();

      if (lowSec.includes('профил') || lowSub.includes('профил') || lowName.includes('стойк') || lowName.includes('ригел') || lowName.includes('рама')) {
        if (lowName.includes('стойк') || lowSub.includes('стойк')) category = 'frame_vertical';
        else if (lowName.includes('ригел') || lowSub.includes('ригел')) category = 'transom';
        else if (lowName.includes('прижим')) category = 'clamp';
        else if (lowName.includes('крышк')) category = 'cap';
        else if (lowName.includes('рам')) category = 'frame_horizontal';
        else category = 'frame_vertical';
      } else if (lowSec.includes('лист') || lowName.includes('лист') || lowName.includes('короб') || lowName.includes('кассет')) {
        category = 'sheet';
      } else if (lowSec.includes('заполн') || lowName.includes('стеклопакет') || lowName.includes('спд') || lowName.includes('спо')) {
        category = 'glass';
      }

      if (article && name) {
        items.push({
          id: `custom_mat_${Date.now()}_${items.length + 1}`,
          section,
          subsection,
          article,
          name,
          material,
          unit,
          weight: isNaN(weight as number) ? undefined : weight,
          stockLength: isNaN(stockLength as number) ? undefined : stockLength,
          width: isNaN(width as number) ? undefined : width,
          depth: isNaN(depth as number) ? undefined : depth,
          company,
          system,
          category
        });
      }
    });
  }

  if (items.length === 0) {
    throw new Error('Не удалось распознать строки материалов. Проверьте заголовки таблицы в файле Excel.');
  }

  saveMaterialsDB(items, file.name);

  return {
    items,
    filename: file.name,
    count: items.length
  };
}

