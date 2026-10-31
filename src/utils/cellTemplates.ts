import { CellTemplate, Cell } from '../types';

const STORAGE_KEY = 'spectool_cell_templates_v1';

export const BUILTIN_CELL_TEMPLATES: CellTemplate[] = [
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
  },
  {
    id: 'tpl-louver',
    title: '💨 Вентиляционная решетка (комплектующее)',
    fillType: 'louver',
    name: 'Вентиляционная решетка наружная',
    markPrefix: 'ВР',
    linkType: 'комплектующие',
    hasMaterial: false,
    material: '',
    materialName: '',
    processTemplate: '',
    planGroup: 'Комплектующие',
    widthOffset: -40,
    heightOffset: -40,
    dependencies: []
  },
  {
    id: 'tpl-sash',
    title: '🚪 Оконный блок / створка (сборочная единица)',
    fillType: 'sash',
    name: 'Оконный блок (створка фасадная)',
    markPrefix: 'ОБ',
    linkType: 'Сборочная единица',
    hasMaterial: false,
    material: '',
    materialName: '',
    processTemplate: 'Окна и вставки',
    planGroup: 'Окна и вставки',
    widthOffset: -40,
    heightOffset: -40,
    dependencies: []
  }
];

export function getCustomCellTemplates(): CellTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom cell templates', e);
    return [];
  }
}

export function getAllCellTemplates(): CellTemplate[] {
  return [...BUILTIN_CELL_TEMPLATES, ...getCustomCellTemplates()];
}

export function saveCustomCellTemplate(cell: Cell, templateTitle: string): CellTemplate {
  const custom = getCustomCellTemplates();

  const newTpl: CellTemplate = {
    id: `custom-tpl-${Date.now()}`,
    title: `⭐ ${templateTitle}`,
    fillType: cell.fillType,
    name: cell.name,
    markPrefix: cell.mark.replace(/-?\d+.*$/, '') || 'ПОЗ',
    linkType: cell.linkType || (cell.hasMaterial ? 'деталь' : 'комплектующие'),
    hasMaterial: !!cell.hasMaterial,
    material: cell.material || '',
    materialName: cell.materialName || '',
    processTemplate: cell.processTemplate || '',
    planGroup: cell.planGroup || (cell.hasMaterial ? 'Детали ЦМК' : 'Комплектующие'),
    widthOffset: Math.round(cell.glassWidth - cell.width),
    heightOffset: Math.round(cell.glassHeight - cell.height),
    dependencies: cell.dependencies.map((d) => ({
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

  const updated = [...custom, newTpl];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newTpl;
}

export function deleteCustomCellTemplate(id: string): void {
  const custom = getCustomCellTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

/**
 * Applies a template to a target cell, updating geometry offsets and dependencies.
 */
export function applyTemplateToCell(cell: Cell, template: CellTemplate, projectPrefix = 'А1187'): Cell {
  const newWidth = Math.max(10, Math.round(cell.width + (template.widthOffset || 0)));
  const newHeight = Math.max(10, Math.round(cell.height + (template.heightOffset || 0)));

  const markNum = cell.mark.match(/\d+/)?.[0] || '1';
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

  return {
    ...cell,
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
    color: template.fillType === 'glass' ? '#e0f2fe' : template.fillType === 'spandrel' ? '#fef3c7' : '#f1f5f9',
    dependencies: newDependencies
  };
}
