import { CellTemplate, Cell, CellFillItem, DependencyRule } from '../types';

const STORAGE_KEY = 'spectool_cell_templates_v2';
const TEMPLATES_ENABLED_KEY = 'spectool_cell_templates_enabled';

// Заводские эталонные шаблоны по умолчанию (только Стеклопакет и Короб, согласно требованию)
export const DEFAULT_CELL_TEMPLATES: CellTemplate[] = [
  {
    id: 'tpl-glass-32',
    title: '🪟 Стеклопакет СПО 32мм (комплектующее)',
    fillType: 'glass',
    name: 'Стеклопакет СПО 32мм (4И-16Ar-4M1-14Ar-4И)',
    markPrefix: 'СП',
    linkType: 'комплектующие',
    hasMaterial: false,
    material: '',
    materialName: '',
    processTemplate: '',
    planGroup: 'Комплектующие',
    widthOffset: -50,
    heightOffset: -50,
    dependencies: []
  },
  {
    id: 'tpl-spandrel-box',
    title: '📦 Короб утепления Оц 0,9мм (деталь ЦМК)',
    fillType: 'spandrel',
    name: 'Короб Оц 0,9мм',
    markPrefix: 'К',
    linkType: 'деталь',
    hasMaterial: true,
    material: 'Оц 0,9мм',
    materialName: 'Лист 0,9 Оц сталь ГОСТ 14918-80',
    processTemplate: 'Короб',
    planGroup: 'Детали ЦМК',
    widthOffset: 86.5,
    heightOffset: 91.5,
    dependencies: [
      {
        article: 'ВС 3,9х16, DIN7981, А2',
        name: 'Винт самонарезающий с полуцилиндрической головкой',
        type: 'fastener',
        unit: 'шт',
        calcType: 'formula',
        formula: '(ROUNDUP((L / 90 + W / 90), 0) + 2) * 3'
      },
      {
        article: 'ISOLON TAPE 3',
        name: 'Изолон 3х30мм',
        type: 'gasket',
        unit: 'м',
        calcType: 'formula',
        formula: 'ROUNDUP((L + W) * 2.05 / 1000, 1)'
      },
      {
        article: 'RookWool 150мм 90 кг/м3',
        name: 'Утеплитель минераловатный',
        type: 'insulation',
        unit: 'м3',
        calcType: 'formula',
        formula: 'ROUNDUP(Area * 0.15, 2)'
      },
      {
        article: 'Гвоздь приварной 3,2х165 в комплекте с тарелкой',
        name: 'Гвоздь приварной омедненный в комплекте с тарелкой',
        type: 'fastener',
        unit: 'шт',
        calcType: 'formula',
        formula: 'ROUNDUP(Area * 6, 0)'
      }
    ]
  }
];

// Проверка включены ли шаблоны (галочка вкл/выкл)
export function areTemplatesEnabled(): boolean {
  try {
    const raw = localStorage.getItem(TEMPLATES_ENABLED_KEY);
    if (raw === null) return true; // по умолчанию включены
    return JSON.parse(raw);
  } catch {
    return true;
  }
}

export function setTemplatesEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(TEMPLATES_ENABLED_KEY, JSON.stringify(enabled));
  } catch (e) {
    console.error('Failed to set templates enabled state', e);
  }
}

// Получить все шаблоны (из хранилища или дефолтные)
export function getAllCellTemplates(): CellTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...DEFAULT_CELL_TEMPLATES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_CELL_TEMPLATES];
  } catch (e) {
    console.error('Failed to load cell templates', e);
    return [...DEFAULT_CELL_TEMPLATES];
  }
}

// Сохранить или обновить шаблон
export function saveCellTemplate(template: CellTemplate): void {
  const current = getAllCellTemplates();
  const index = current.findIndex((t) => t.id === template.id);
  let updated: CellTemplate[];
  if (index >= 0) {
    updated = current.map((t) => (t.id === template.id ? template : t));
  } else {
    updated = [...current, template];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Удалить шаблон
export function deleteCellTemplate(id: string): void {
  const current = getAllCellTemplates();
  const updated = current.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Сброс к заводским эталонам
export function resetCellTemplates(): CellTemplate[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CELL_TEMPLATES));
  return [...DEFAULT_CELL_TEMPLATES];
}

// Создать чистое заполнение без шаблона (Прямое добавление детали / комплектующего / СБ)
export function createBlankFill(
  kind: 'part' | 'accessory' | 'assembly',
  cellWidth: number,
  cellHeight: number,
  index = 1,
  projectPrefix = 'А1187'
): CellFillItem {
  const id = `fill-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (kind === 'part') {
    return {
      id,
      fillType: 'custom',
      name: 'Новая деталь (напр. полоса оцинкованная)',
      mark: `${projectPrefix} Д${cellHeight}-${cellWidth}`,
      linkType: 'деталь',
      hasMaterial: true,
      material: 'Оц 0,9мм',
      materialName: 'Лист 0,9 Оц сталь ГОСТ 14918-80',
      processTemplate: 'Детали',
      planGroup: 'Детали ЦМК',
      widthOffset: 0,
      heightOffset: 0,
      width: cellWidth,
      height: cellHeight,
      thickness: 1,
      color: '#fef3c7',
      dependencies: []
    };
  }

  if (kind === 'accessory') {
    return {
      id,
      fillType: 'custom',
      name: 'Опоры стеклопакета',
      mark: `ОПР-${index}`,
      linkType: 'комплектующие',
      hasMaterial: false,
      material: '',
      materialName: '',
      processTemplate: '',
      planGroup: 'Комплектующие',
      widthOffset: 0,
      heightOffset: 0,
      width: cellWidth,
      height: cellHeight,
      thickness: 0,
      color: '#e0f2fe',
      dependencies: []
    };
  }

  // assembly
  return {
    id,
    fillType: 'sash',
    name: 'Сборочный узел (СБ)',
    mark: `СБ-${index}`,
    linkType: 'Сборочная единица',
    hasMaterial: false,
    material: '',
    materialName: '',
    processTemplate: 'Сборка',
    planGroup: 'Сборочные узлы',
    widthOffset: 0,
    heightOffset: 0,
    width: cellWidth,
    height: cellHeight,
    thickness: 0,
    color: '#fff2cc',
    dependencies: []
  };
}

// Нормализация слоев ячейки
export function normalizeCellFills(cell: Cell): CellFillItem[] {
  if (cell.fills && cell.fills.length > 0) {
    return cell.fills;
  }
  const isGlass = cell.fillType === 'glass';
  const legacyFill: CellFillItem = {
    id: `fill-${cell.id}-1`,
    fillType: cell.fillType || 'glass',
    name: cell.name || 'Стеклопакет',
    mark: cell.mark || 'СП-1',
    linkType: cell.linkType || (cell.hasMaterial ? 'деталь' : 'комплектующие'),
    hasMaterial: cell.hasMaterial !== undefined ? cell.hasMaterial : (!isGlass && !!cell.material),
    material: cell.material || '',
    materialName: cell.materialName || '',
    processTemplate: cell.processTemplate || '',
    planGroup: cell.planGroup || (cell.hasMaterial ? 'Детали ЦМК' : 'Комплектующие'),
    widthOffset: (cell.glassWidth || cell.width) - cell.width,
    heightOffset: (cell.glassHeight || cell.height) - cell.height,
    width: cell.glassWidth || cell.width,
    height: cell.glassHeight || cell.height,
    thickness: cell.thickness,
    formula: cell.formula,
    color: cell.color,
    dependencies: cell.dependencies || []
  };
  return [legacyFill];
}

// Синхронизация ячейки с её первичным слоем
export function syncCellWithPrimaryFill(cell: Cell, fills: CellFillItem[]): Cell {
  const primary = fills[0];
  if (!primary) {
    return { ...cell, fills: [] };
  }
  return {
    ...cell,
    fills,
    fillType: primary.fillType,
    name: primary.name,
    mark: primary.mark,
    linkType: primary.linkType,
    hasMaterial: primary.hasMaterial,
    material: primary.material,
    materialName: primary.materialName,
    processTemplate: primary.processTemplate,
    planGroup: primary.planGroup,
    glassWidth: primary.width,
    glassHeight: primary.height,
    thickness: primary.thickness,
    formula: primary.formula,
    color: primary.color,
    dependencies: primary.dependencies
  };
}

// Создание слоя на основе шаблона
export function createFillFromTemplate(
  template: CellTemplate,
  cellWidth: number,
  cellHeight: number,
  countIndex = 1,
  projectPrefix = 'А1187'
): CellFillItem {
  const newWidth = Math.max(10, Math.round(cellWidth + (template.widthOffset || 0)));
  const newHeight = Math.max(10, Math.round(cellHeight + (template.heightOffset || 0)));

  let newMark = `${template.markPrefix}-${countIndex}`;
  if (template.fillType === 'spandrel') {
    newMark = `${projectPrefix} ${template.markPrefix}${newHeight}-${newWidth}`;
  }

  const newDependencies = (template.dependencies || []).map((dep, idx) => ({
    id: `dep-${Date.now()}-${idx}`,
    article: dep.article,
    name: dep.name,
    type: dep.type,
    unit: (dep.unit || 'шт') as 'шт' | 'м' | 'м2' | 'м3',
    calcType: dep.calcType,
    quantity: dep.quantity || 1,
    stepMm: dep.stepMm,
    formula: dep.formula,
    evaluatedQty: dep.quantity || 1
  }));

  return {
    id: `fill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fillType: template.fillType,
    name: template.name,
    mark: newMark,
    linkType: template.linkType,
    hasMaterial: template.hasMaterial,
    material: template.hasMaterial ? template.material : '',
    materialName: template.hasMaterial ? template.materialName : '',
    processTemplate: template.processTemplate || '',
    planGroup: template.planGroup || (template.hasMaterial ? 'Детали ЦМК' : 'Комплектующие'),
    widthOffset: template.widthOffset || 0,
    heightOffset: template.heightOffset || 0,
    width: newWidth,
    height: newHeight,
    thickness: template.fillType === 'glass' ? 32 : 1,
    color: template.fillType === 'glass' ? '#e0f2fe' : template.fillType === 'spandrel' ? '#fef3c7' : '#f1f5f9',
    dependencies: newDependencies
  };
}

// Применение шаблона к существующей ячейке
export function applyTemplateToCell(cell: Cell, template: CellTemplate, projectPrefix = 'А1187'): Cell {
  const newWidth = Math.max(10, Math.round(cell.width + (template.widthOffset || 0)));
  const newHeight = Math.max(10, Math.round(cell.height + (template.heightOffset || 0)));

  const markNum = cell.mark?.match(/\d+/)?.[0] || '1';
  let newMark = `${template.markPrefix}-${markNum}`;
  if (template.fillType === 'spandrel') {
    newMark = `${projectPrefix} ${template.markPrefix}${newHeight}-${newWidth}`;
  }

  const newDependencies = (template.dependencies || []).map((dep, idx) => ({
    id: `dep-${Date.now()}-${idx}`,
    article: dep.article,
    name: dep.name,
    type: dep.type,
    unit: (dep.unit || 'шт') as 'шт' | 'м' | 'м2' | 'м3',
    calcType: dep.calcType,
    quantity: dep.quantity || 1,
    stepMm: dep.stepMm,
    formula: dep.formula,
    evaluatedQty: dep.quantity || 1
  }));

  const primaryFill: CellFillItem = {
    id: `fill-${Date.now()}-1`,
    fillType: template.fillType,
    name: template.name,
    mark: newMark,
    linkType: template.linkType,
    hasMaterial: template.hasMaterial,
    material: template.hasMaterial ? template.material : '',
    materialName: template.hasMaterial ? template.materialName : '',
    processTemplate: template.processTemplate || '',
    planGroup: template.planGroup || (template.hasMaterial ? 'Детали ЦМК' : 'Комплектующие'),
    widthOffset: template.widthOffset || 0,
    heightOffset: template.heightOffset || 0,
    width: newWidth,
    height: newHeight,
    thickness: template.fillType === 'glass' ? 32 : 1,
    color: template.fillType === 'glass' ? '#e0f2fe' : template.fillType === 'spandrel' ? '#fef3c7' : '#f1f5f9',
    dependencies: newDependencies
  };

  return {
    ...cell,
    fills: [primaryFill],
    fillType: template.fillType,
    name: template.name,
    mark: newMark,
    linkType: template.linkType,
    hasMaterial: template.hasMaterial,
    material: template.hasMaterial ? template.material : '',
    materialName: template.hasMaterial ? template.materialName : '',
    processTemplate: template.processTemplate || '',
    planGroup: template.planGroup || (template.hasMaterial ? 'Детали ЦМК' : 'Комплектующие'),
    glassWidth: newWidth,
    glassHeight: newHeight,
    color: primaryFill.color,
    dependencies: newDependencies
  };
}

// Сохранить текущую ячейку как новый шаблон
export function saveCustomCellTemplate(cell: Cell, templateTitle: string): CellTemplate {
  const currentFills = normalizeCellFills(cell);
  const primary = currentFills[0];

  const newTpl: CellTemplate = {
    id: `custom-tpl-${Date.now()}`,
    title: `⭐ ${templateTitle}`,
    fillType: primary?.fillType || cell.fillType || 'custom',
    name: primary?.name || cell.name || templateTitle,
    markPrefix: (primary?.mark || cell.mark || 'ПОЗ').replace(/-?\d+.*$/, '') || 'ПОЗ',
    linkType: primary?.linkType || cell.linkType || 'деталь',
    hasMaterial: primary ? primary.hasMaterial : !!cell.hasMaterial,
    material: primary ? primary.material : (cell.material || ''),
    materialName: primary ? primary.materialName : (cell.materialName || ''),
    processTemplate: primary ? primary.processTemplate : (cell.processTemplate || ''),
    planGroup: primary ? primary.planGroup : (cell.planGroup || 'Детали ЦМК'),
    widthOffset: Math.round((primary ? primary.width : (cell.glassWidth || cell.width)) - cell.width),
    heightOffset: Math.round((primary ? primary.height : (cell.glassHeight || cell.height)) - cell.height),
    dependencies: (primary ? primary.dependencies : (cell.dependencies || [])).map((d) => ({
      article: d.article,
      name: d.name,
      type: d.type as any,
      unit: d.unit,
      calcType: d.calcType,
      quantity: d.quantity,
      stepMm: d.stepMm,
      formula: d.formula
    }))
  };

  saveCellTemplate(newTpl);
  return newTpl;
}
