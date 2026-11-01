import * as XLSX from 'xlsx';
import { StandaloneItem, ModuleModel } from '../types';

export interface ImportedSpecificationResult {
  width?: number;
  height?: number;
  projectName?: string;
  moduleName?: string;
  color?: string;
  standaloneItems: StandaloneItem[];
  importedRowsCount: number;
}

/**
 * Парсер производственной спецификации Excel (.xlsx)
 * Читает лист "Спецификация" (19 колонок), габариты из Y1/Z1,
 * и формирует список деталей и сборочных единиц (кронштейны, закладные, узлы).
 */
export async function importSpecificationFromExcel(file: File): Promise<ImportedSpecificationResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Ищем лист "Спецификация" или берем первый лист
  const sheetName = wb.SheetNames.find((s) => s.toLowerCase().includes('спецификац')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    throw new Error('В файле не найден подходящий лист со спецификацией');
  }

  // 1. Читаем габариты модуля из ячеек Y1 (Высота) и Z1 (Ширина)
  const y1 = ws['Y1']?.v;
  const z1 = ws['Z1']?.v;
  let parsedHeight = typeof y1 === 'number' ? y1 : parseFloat(String(y1 || '')) || undefined;
  let parsedWidth = typeof z1 === 'number' ? z1 : parseFloat(String(z1 || '')) || undefined;

  // Извлекаем имя модуля и проекта из названия файла если возможно
  // например: "А1187 М507_Модуль Жукова.xlsx"
  let projectName = 'А1187';
  let moduleName = file.name.replace(/\.[^/.]+$/, '');
  const matchProject = file.name.match(/([А-ЯA-Z]\d{3,4})/i);
  if (matchProject) {
    projectName = matchProject[1];
  }

  // 2. Читаем строки спецификации в 2D массив
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:S50');
  const standaloneItems: StandaloneItem[] = [];
  let colorFound = '';
  let rowCount = 0;

  // Начинаем со строки 2 (индекс 1 в 0-based), так как строка 1 — это заголовок
  for (let R = 1; R <= range.e.r; ++R) {
    const getVal = (colIdx: number): string => {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: colIdx });
      const cell = ws[cellRef];
      if (!cell || cell.v === undefined || cell.v === null) return '';
      return String(cell.v).trim();
    };

    const mark = getVal(0);              // A: Обозначение
    const name = getVal(1);              // B: Наименование
    const matMark = getVal(2);           // C: Материал обозначение
    const matName = getVal(3);           // D: Материал наименование
    const matQtyRaw = getVal(4);         // E: Материал кол-во
    const matUnit = getVal(5);           // F: Материал ЕИ
    const processTemplate = getVal(6);   // G: Шаблон техпроцесса
    const linkTypeRaw = getVal(7);       // H: Тип связи
    const specQtyRaw = getVal(8);        // I: Кол-во в спецификации
    const specUnit = getVal(9);          // J: ЕИ
    const planGroup = getVal(10);        // K: VGB_Plan_Group
    const vgbL = parseFloat(getVal(11)) || undefined;  // L: VGB_L_MM
    const vgbB = parseFloat(getVal(12)) || undefined;  // M: VGB_B_MM
    const vgbLB = parseFloat(getVal(13)) || undefined; // N: VGB_LB_MM
    const vgbColor = getVal(14);         // O: VGB_Color

    // Если строка полностью пустая, пропускаем
    if (!mark && !name) continue;
    rowCount++;

    if (vgbColor && !colorFound) {
      colorFound = vgbColor;
    }

    // Определяем тип связи
    let linkType: 'деталь' | 'Сборочная единица' | 'комплектующие' = 'деталь';
    const lowerLink = linkTypeRaw.toLowerCase();
    if (lowerLink.includes('сбор') || lowerLink.includes('сб') || lowerLink.includes('узел')) {
      linkType = 'Сборочная единица';
    } else if (lowerLink.includes('комплект') || lowerLink.includes('метиз')) {
      linkType = 'комплектующие';
    }

    // Исключаем основные стойки и рамы чертежа, если они уже есть в CAD
    // Но импортируем кронштейны, закладные, вспомогательные детали, сборочные единицы
    const isMainCadProfile = (
      name.toLowerCase().includes('рама левая') ||
      name.toLowerCase().includes('рама правая') ||
      name.toLowerCase().includes('рама верхняя') ||
      name.toLowerCase().includes('рама нижняя') ||
      name.toLowerCase().includes('импост')
    ) && (matUnit === 'мм' && !name.toLowerCase().includes('кронштейн'));

    // Если это кронштейн, закладная или сборочная единица — добавляем в standaloneItems
    const isBracketOrAssembly = (
      name.toLowerCase().includes('кронштейн') ||
      name.toLowerCase().includes('закладн') ||
      name.toLowerCase().includes('сухарь') ||
      name.toLowerCase().includes('адаптер') ||
      name.toLowerCase().includes('угол') ||
      name.toLowerCase().includes('пластин') ||
      linkType === 'Сборочная единица' ||
      !isMainCadProfile
    );

    if (isBracketOrAssembly) {
      const quantity = parseFloat(specQtyRaw) || 1;
      standaloneItems.push({
        id: `imp-${Date.now()}-${R}`,
        itemType: linkType === 'Сборочная единица' ? 'assembly' : 'part',
        linkType,
        mark: mark || `ДЕТ-${R}`,
        name: name || 'Деталь спецификации',
        processTemplate: processTemplate || (linkType === 'Сборочная единица' ? 'Кронштейны сварные/сборные модульные' : 'Детали ЦМК'),
        quantity,
        unit: specUnit || 'шт',
        planGroup: planGroup || (linkType === 'Сборочная единица' ? 'Сборочные единицы' : 'Детали ЦМК'),
        material: matMark,
        materialName: matName,
        lengthMm: vgbL,
        widthMm: vgbB,
        thicknessMm: vgbLB,
        color: vgbColor || colorFound || 'RAL 7012'
      });
    }
  }

  return {
    width: parsedWidth,
    height: parsedHeight,
    projectName,
    moduleName,
    color: colorFound,
    standaloneItems,
    importedRowsCount: rowCount
  };
}

