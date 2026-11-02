import * as XLSX from 'xlsx';
import { CatalogHardwareItem, CatalogMaterialItem, MaterialFolderNode } from '../types';
import defaultHardwareData from '../data/defaultHardware.json';
import { defaultMaterialTree } from '../data/defaultMaterialTree';

const HARDWARE_STORAGE_KEY = 'spectool_hardware_items_v2';
const HARDWARE_FILENAME_KEY = 'spectool_hardware_filename_v2';
const HARDWARE_UPDATED_KEY = 'spectool_hardware_updated_v2';

const MATERIAL_TREE_STORAGE_KEY = 'spectool_material_tree_v3';
const MATERIAL_TREE_FILENAME_KEY = 'spectool_material_tree_filename_v3';
const MATERIAL_TREE_UPDATED_KEY = 'spectool_material_tree_updated_v3';

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
    filename: 'Метизы.xlsx (заводская база 338 поз.)',
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

export function addHardwareItem(item: CatalogHardwareItem): CatalogHardwareItem[] {
  const current = getHardwareDB().items;
  const updated = [item, ...current];
  saveHardwareDB(updated, 'Пользовательская БД метизов');
  return updated;
}

export function updateHardwareItem(itemId: string, changes: Partial<CatalogHardwareItem>): CatalogHardwareItem[] {
  const current = getHardwareDB().items;
  const updated = current.map((it) => (it.id === itemId ? { ...it, ...changes } : it));
  saveHardwareDB(updated, 'Пользовательская БД метизов');
  return updated;
}

export function deleteHardwareItem(itemId: string): CatalogHardwareItem[] {
  const current = getHardwareDB().items;
  const updated = current.filter((it) => it.id !== itemId);
  saveHardwareDB(updated, 'Пользовательская БД метизов');
  return updated;
}

export function getHardwareTypes(items: CatalogHardwareItem[]): string[] {
  const typesSet = new Set<string>();
  items.forEach((it) => {
    if (it.type && it.type.trim()) {
      typesSet.add(it.type.trim());
    }
  });
  return Array.from(typesSet).sort((a, b) => a.localeCompare(b, 'ru'));
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
// 2. MATERIALS: HIERARCHICAL TREE ENGINE
// ----------------------------------------------------

export function flattenMaterialTree(nodes: MaterialFolderNode[]): CatalogMaterialItem[] {
  const result: CatalogMaterialItem[] = [];

  function traverse(list: MaterialFolderNode[], currentPath: string[]) {
    for (const node of list) {
      const path = [...currentPath, node.name];
      if (node.items && node.items.length > 0) {
        for (const it of node.items) {
          result.push({
            ...it,
            folderPath: path,
            section: path[0] || it.section || 'Материалы',
            subsection: path.slice(1).join(' / ') || it.subsection || 'Общее'
          });
        }
      }
      if (node.subfolders && node.subfolders.length > 0) {
        traverse(node.subfolders, path);
      }
    }
  }

  traverse(nodes, []);
  return result;
}

export function getMaterialTree(): { root: MaterialFolderNode[]; filename: string; updatedAt: string } {
  try {
    const saved = localStorage.getItem(MATERIAL_TREE_STORAGE_KEY);
    const filename = localStorage.getItem(MATERIAL_TREE_FILENAME_KEY) || 'Материалы (заводская иерархия)';
    const updatedAt = localStorage.getItem(MATERIAL_TREE_UPDATED_KEY) || '';

    if (saved) {
      const parsed: MaterialFolderNode[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { root: parsed, filename, updatedAt };
      }
    }
  } catch (err) {
    console.warn('Не удалось прочитать сохраненную иерархическую БД материалов из localStorage:', err);
  }

  return {
    root: JSON.parse(JSON.stringify(defaultMaterialTree)),
    filename: 'Материалы (заводская иерархия)',
    updatedAt: ''
  };
}

export function saveMaterialTree(tree: MaterialFolderNode[], filename?: string) {
  try {
    const now = new Date().toLocaleString('ru-RU');
    localStorage.setItem(MATERIAL_TREE_STORAGE_KEY, JSON.stringify(tree));
    if (filename) localStorage.setItem(MATERIAL_TREE_FILENAME_KEY, filename);
    localStorage.setItem(MATERIAL_TREE_UPDATED_KEY, now);
  } catch (err) {
    console.error('Ошибка сохранения иерархической БД материалов в localStorage:', err);
  }
}

export function resetMaterialTree(): MaterialFolderNode[] {
  try {
    localStorage.removeItem(MATERIAL_TREE_STORAGE_KEY);
    localStorage.removeItem(MATERIAL_TREE_FILENAME_KEY);
    localStorage.removeItem(MATERIAL_TREE_UPDATED_KEY);
  } catch (e) {
    console.warn(e);
  }
  return JSON.parse(JSON.stringify(defaultMaterialTree));
}

// Folder CRUD
export function addFolderToTree(
  tree: MaterialFolderNode[],
  parentId: string | null,
  folderName: string
): MaterialFolderNode[] {
  const newFolder: MaterialFolderNode = {
    id: `folder_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: folderName.trim(),
    parentId,
    subfolders: [],
    items: []
  };

  if (!parentId) {
    return [...tree, newFolder];
  }

  function insert(nodes: MaterialFolderNode[]): MaterialFolderNode[] {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          subfolders: [...(node.subfolders || []), newFolder]
        };
      }
      if (node.subfolders && node.subfolders.length > 0) {
        return {
          ...node,
          subfolders: insert(node.subfolders)
        };
      }
      return node;
    });
  }

  return insert(tree);
}

export function renameFolderInTree(
  tree: MaterialFolderNode[],
  folderId: string,
  newName: string
): MaterialFolderNode[] {
  function rename(nodes: MaterialFolderNode[]): MaterialFolderNode[] {
    return nodes.map((node) => {
      if (node.id === folderId) {
        return { ...node, name: newName.trim() };
      }
      if (node.subfolders && node.subfolders.length > 0) {
        return { ...node, subfolders: rename(node.subfolders) };
      }
      return node;
    });
  }
  return rename(tree);
}

export function deleteFolderFromTree(
  tree: MaterialFolderNode[],
  folderId: string
): MaterialFolderNode[] {
  function filterOut(nodes: MaterialFolderNode[]): MaterialFolderNode[] {
    return nodes
      .filter((n) => n.id !== folderId)
      .map((n) => ({
        ...n,
        subfolders: n.subfolders ? filterOut(n.subfolders) : []
      }));
  }
  return filterOut(tree);
}

// Material Items CRUD inside Tree
export function addItemToFolder(
  tree: MaterialFolderNode[],
  folderId: string,
  item: CatalogMaterialItem
): MaterialFolderNode[] {
  function add(nodes: MaterialFolderNode[]): MaterialFolderNode[] {
    return nodes.map((node) => {
      if (node.id === folderId) {
        return {
          ...node,
          items: [...(node.items || []), item]
        };
      }
      if (node.subfolders && node.subfolders.length > 0) {
        return {
          ...node,
          subfolders: add(node.subfolders)
        };
      }
      return node;
    });
  }
  return add(tree);
}

export function updateItemInTree(
  tree: MaterialFolderNode[],
  itemId: string,
  changes: Partial<CatalogMaterialItem>
): MaterialFolderNode[] {
  function update(nodes: MaterialFolderNode[]): MaterialFolderNode[] {
    return nodes.map((node) => {
      const updatedItems = (node.items || []).map((it) =>
        it.id === itemId ? { ...it, ...changes } : it
      );
      const updatedSubfolders = node.subfolders ? update(node.subfolders) : [];
      return {
        ...node,
        items: updatedItems,
        subfolders: updatedSubfolders
      };
    });
  }
  return update(tree);
}

export function deleteItemFromTree(
  tree: MaterialFolderNode[],
  itemId: string
): MaterialFolderNode[] {
  function remove(nodes: MaterialFolderNode[]): MaterialFolderNode[] {
    return nodes.map((node) => {
      const filteredItems = (node.items || []).filter((it) => it.id !== itemId);
      const updatedSubfolders = node.subfolders ? remove(node.subfolders) : [];
      return {
        ...node,
        items: filteredItems,
        subfolders: updatedSubfolders
      };
    });
  }
  return remove(tree);
}

// Backwards compatibility layer for legacy components
export function getMaterialsDB(): { items: CatalogMaterialItem[]; filename: string; updatedAt: string } {
  const treeData = getMaterialTree();
  const items = flattenMaterialTree(treeData.root);
  return {
    items,
    filename: treeData.filename,
    updatedAt: treeData.updatedAt
  };
}

export function saveMaterialsDB(items: CatalogMaterialItem[], filename: string) {
  const tree = getMaterialTree().root;
  const existingFolder = tree.find((f) => f.name === 'Импортированные материалы');
  if (existingFolder) {
    existingFolder.items = items;
  } else {
    tree.push({
      id: `folder_imported_${Date.now()}`,
      name: 'Импортированные материалы',
      subfolders: [],
      items
    });
  }
  saveMaterialTree(tree, filename);
}

export function resetMaterialsDB(): CatalogMaterialItem[] {
  const fresh = resetMaterialTree();
  return flattenMaterialTree(fresh);
}

// Helper to insert item into tree based on path segments
function ensureFolderPath(tree: MaterialFolderNode[], pathSegments: string[]): MaterialFolderNode {
  if (pathSegments.length === 0) {
    pathSegments = ['Прочее'];
  }

  let currentLevel = tree;
  let currentParent: MaterialFolderNode | null = null;

  for (let i = 0; i < pathSegments.length; i++) {
    const segName = pathSegments[i].trim();
    let found = currentLevel.find((n) => n.name.toLowerCase() === segName.toLowerCase());
    if (!found) {
      found = {
        id: `folder_imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: segName,
        parentId: currentParent ? currentParent.id : null,
        subfolders: [],
        items: []
      };
      currentLevel.push(found);
    }
    currentParent = found;
    currentLevel = found.subfolders;
  }

  return currentParent!;
}

export async function parseAndSaveMaterialsExcel(
  file: File
): Promise<{ items: CatalogMaterialItem[]; filename: string; count: number; tree: MaterialFolderNode[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const currentTree = getMaterialTree().root;
  let importedCount = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);
    if (!rawRows || rawRows.length === 0) continue;

    rawRows.forEach((r, idx) => {
      // 1. Path detection
      let pathSegments: string[] = [];
      const pathCol = r['Путь'] || r['Папка'] || r['Path'] || r['Иерархия'];
      if (pathCol) {
        pathSegments = String(pathCol).split(/[/|\\]/).map((s) => s.trim()).filter(Boolean);
      } else {
        const sec = String(r['Раздел'] || r['Категория'] || r['Группа 1'] || (wb.SheetNames.length > 1 ? sheetName : 'Материалы')).trim();
        const sub = String(r['Подраздел'] || r['Группа 2'] || r['Тип'] || '').trim();
        if (sec) pathSegments.push(sec);
        if (sub) {
          const subParts = sub.split(/[/|\\]/).map((s) => s.trim()).filter(Boolean);
          pathSegments.push(...subParts);
        }
      }

      const article = String(
        r['Обозначение'] ||
        r['Артикул'] ||
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

      const material = String(
        r['Материал / Сплав'] ||
        r['Материал'] ||
        r['Сплав'] ||
        r['Material'] ||
        ''
      ).trim();

      const standard = String(
        r['Стандарт'] ||
        r['ГОСТ'] ||
        r['DIN'] ||
        r['ТУ'] ||
        ''
      ).trim();

      const unit = String(
        r['Ед. изм.'] ||
        r['ЕИ'] ||
        r['Ед.изм'] ||
        r['Unit'] ||
        'п.м.'
      ).trim();

      const rawWeight = r['Вес (п.м. или м²)'] ?? r['Вес п.м. (кг)'] ?? r['Вес (кг)'] ?? r['Вес'] ?? r['Weight'];
      const weight = rawWeight !== undefined && rawWeight !== null ? Number(String(rawWeight).replace(',', '.')) : undefined;

      const rawThickness = r['Толщина (мм)'] ?? r['Толщина'] ?? r['Thickness'];
      const thickness = rawThickness ? Number(String(rawThickness).replace(',', '.')) : undefined;

      const rawStock = r['Длина хлыста (мм)'] ?? r['Длина хлыста'] ?? r['Длина'] ?? r['Length'];
      const stockLength = rawStock ? Number(String(rawStock).replace(',', '.')) : undefined;

      const rawWidth = r['Ширина (мм)'] ?? r['Ширина'] ?? r['Width'];
      const width = rawWidth ? Number(String(rawWidth).replace(',', '.')) : undefined;

      const rawDepth = r['Глубина (мм)'] ?? r['Глубина'] ?? r['Depth'];
      const depth = rawDepth ? Number(String(rawDepth).replace(',', '.')) : undefined;

      const company = r['Производитель'] || r['Бренд'] || r['Компания'] ? String(r['Производитель'] || r['Бренд'] || r['Компания']).trim() : undefined;
      const system = r['Система'] ? String(r['Система']).trim() : undefined;

      // Category detection
      let category: CatalogMaterialItem['category'] = 'other';
      const lowName = name.toLowerCase();
      const pathStr = pathSegments.join(' ').toLowerCase();

      if (pathStr.includes('профил') || lowName.includes('стойк') || lowName.includes('ригел') || lowName.includes('рама')) {
        if (lowName.includes('стойк')) category = 'frame_vertical';
        else if (lowName.includes('ригел')) category = 'transom';
        else if (lowName.includes('прижим')) category = 'clamp';
        else if (lowName.includes('крышк')) category = 'cap';
        else if (lowName.includes('рам')) category = 'frame_horizontal';
        else category = 'frame_vertical';
      } else if (pathStr.includes('лист') || lowName.includes('лист') || lowName.includes('короб') || lowName.includes('кассет')) {
        category = 'sheet';
      } else if (pathStr.includes('заполн') || lowName.includes('стеклопакет') || lowName.includes('спд') || lowName.includes('спо')) {
        category = 'glass';
      }

      if (article && name) {
        const targetFolder = ensureFolderPath(currentTree, pathSegments);
        const newItem: CatalogMaterialItem = {
          id: `imp_mat_${Date.now()}_${importedCount + 1}`,
          section: pathSegments[0] || 'Материалы',
          subsection: pathSegments.slice(1).join(' / ') || 'Общее',
          folderPath: pathSegments,
          article,
          code: article,
          name,
          material,
          standard,
          unit,
          thickness: isNaN(thickness as number) ? undefined : thickness,
          weight: isNaN(weight as number) ? undefined : weight,
          stockLength: isNaN(stockLength as number) ? undefined : stockLength,
          width: isNaN(width as number) ? undefined : width,
          depth: isNaN(depth as number) ? undefined : depth,
          company,
          system,
          category
        };

        if (!targetFolder.items) targetFolder.items = [];
        targetFolder.items.push(newItem);
        importedCount++;
      }
    });
  }

  if (importedCount === 0) {
    throw new Error('Не удалось распознать строки материалов. Проверьте заголовки таблицы в файле Excel.');
  }

  saveMaterialTree(currentTree, file.name);
  const flatItems = flattenMaterialTree(currentTree);

  return {
    items: flatItems,
    filename: file.name,
    count: importedCount,
    tree: currentTree
  };
}
