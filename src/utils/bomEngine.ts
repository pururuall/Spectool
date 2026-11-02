import { ModuleModel, BOMRow } from '../types';
import { normalizeCellFills } from './cellTemplates';
import ExcelJS from 'exceljs';

export function calculateFormula(
  formula: string,
  params: { L: number; W: number; H: number; Area: number }
): number {
  try {
    let expr = formula.trim();

    // Replace comma in decimal numbers (e.g. 1,05 -> 1.05, 0,15 -> 0.15)
    expr = expr.replace(/(\d+),(\d+)/g, '$1.$2');

    // Russian functions -> JS/English equivalents
    expr = expr.replace(/\bОКРУГЛВВЕРХ\b/gi, 'ROUNDUP');
    expr = expr.replace(/\bОКРУГЛВНИЗ\b/gi, 'FLOOR');
    expr = expr.replace(/\bОКРУГЛ\b/gi, 'ROUND');
    expr = expr.replace(/\bМАКС\b/gi, 'MAX');
    expr = expr.replace(/\bМИН\b/gi, 'MIN');

    // Russian & English Variables (Perimeter, Area, Length, Width, Height)
    expr = expr.replace(/\b(ПЕРИМЕТР|PERIMETER)\b/gi, `(${2 * (params.W + params.H)})`);
    expr = expr.replace(/(^|[^а-яa-z0-9_])П([^а-яa-z0-9_]|$)/gi, `$1(${2 * (params.W + params.H)})$2`);
    expr = expr.replace(/\b(ПЛОЩАДЬ|AREA)\b/gi, params.Area.toString());
    expr = expr.replace(/(^|[^а-яa-z0-9_])S([^а-яa-z0-9_]|$)/gi, `$1${params.Area}$2`);
    expr = expr.replace(/\b(ДЛИНА|LENGTH)\b/gi, params.L.toString());
    expr = expr.replace(/(^|[^а-яa-z0-9_])(Д|L)([^а-яa-z0-9_]|$)/gi, `$1${params.L}$3`);
    expr = expr.replace(/\b(ШИРИНА|WIDTH)\b/gi, params.W.toString());
    expr = expr.replace(/(^|[^а-яa-z0-9_])(Ш|W)([^а-яa-z0-9_]|$)/gi, `$1${params.W}$3`);
    expr = expr.replace(/\b(ВЫСОТА|HEIGHT)\b/gi, params.H.toString());
    expr = expr.replace(/(^|[^а-яa-z0-9_])(В|H)([^а-яa-z0-9_]|$)/gi, `$1${params.H}$3`);

    const fn = new Function(
      'ROUNDUP',
      'ROUND',
      'CEIL',
      'FLOOR',
      'MAX',
      'MIN',
      `return (${expr});`
    );

    const roundup = (val: number, d = 0) => {
      const factor = Math.pow(10, d);
      return Math.ceil(val * factor) / factor;
    };
    const round = (val: number, d = 0) => {
      const factor = Math.pow(10, d);
      return Math.round(val * factor) / factor;
    };

    const result = fn(roundup, round, Math.ceil, Math.floor, Math.max, Math.min);
    return typeof result === 'number' && !isNaN(result) ? Math.round(result * 100) / 100 : 0;
  } catch (err) {
    console.warn('Error evaluating formula:', formula, err);
    return 0;
  }
}

export function generateBOM(module: ModuleModel): BOMRow[] {
  const rows: BOMRow[] = [];

  // 1. Process all Drawn Lines and their Profile Bindings
  for (const line of module.lines) {
    for (const prof of line.profileBindings) {
      const isVertical = Math.abs(line.x1 - line.x2) <= 5;
      const totalOffset = prof.startOffset + prof.endOffset;
      const calcLength = Math.max(0, line.length - totalOffset);
      prof.calculatedLength = calcLength;

      // Columns 16-19: Cut Angles (VGP_left, VGP_Right, VGP_Left_2, VGP_Right_2)
      // ONLY numeric miter angles in degrees (e.g. 45, 90) or empty string! NEVER 'n L', 'Up', 'Down', etc.!
      const vgpLeft = prof.miterLeft !== undefined && prof.miterLeft !== null ? prof.miterLeft : '';
      const vgpRight = prof.miterRight !== undefined && prof.miterRight !== null ? prof.miterRight : '';
      const vgpLeft2 = prof.miterLeft2 !== undefined && prof.miterLeft2 !== null ? prof.miterLeft2 : '';
      const vgpRight2 = prof.miterRight2 !== undefined && prof.miterRight2 !== null ? prof.miterRight2 : '';

      const currentExcelRow = rows.length + 2; // Row 1 is header in Excel, data starts at Row 2
      const profRowId = `bom-${prof.id}`;

      // Dynamic Excel formulas for length:
      // Vertical profiles link to Height (Y1), Horizontal link to Width (Z1)
      let formulaE = '';
      if (isVertical) {
        formulaE = totalOffset > 0 ? `Y1-${totalOffset}` : 'Y1';
      } else {
        formulaE = totalOffset > 0 ? `Z1-${totalOffset}` : 'Z1';
      }
      const formulaL = `E${currentExcelRow}`;

      // Add profile row (Деталь)
      rows.push({
        id: profRowId,
        sourceType: 'profile',
        sourceId: prof.id,
        mark: prof.customMark || `${module.project || 'А1187'} ${prof.article.slice(-4)}-${calcLength}`,
        name: prof.name,
        materialMark: prof.material || prof.article,
        materialName: prof.materialName || 'Профиль алюминиевый',
        materialQty: calcLength,
        materialUnit: 'мм',
        processTemplate: 'Профиль алюминиевый',
        linkType: 'деталь',
        specQty: 1,
        specUnit: prof.unit || 'шт',
        vgbPlanGroup: prof.planGroup || 'Профиль Алюминиевый',
        vgbL: calcLength,
        vgbB: '',
        vgbLB: '',
        vgbColor: prof.color || module.color || 'RAL 7012',
        vgpLeft,
        vgpRight,
        vgpLeft2,
        vgpRight2,
        lengthMm: calcLength,
        color: prof.color || module.color,
        miterLeft: prof.miterLeft,
        miterRight: prof.miterRight,
        planGroup: prof.planGroup || 'Профиль Алюминиевый',
        excelFormulaE: formulaE,
        excelFormulaL: formulaL
      });

      // Add dependencies of this profile (screws, gaskets, etc.)
      for (const dep of prof.dependencies) {
        let qty = 0;
        let formulaI: string | undefined;

        if (dep.calcType === 'fixed') {
          qty = dep.quantity || 1;
        } else if (dep.calcType === 'step' && dep.stepMm) {
          qty = Math.ceil(calcLength / dep.stepMm) + 1;
          formulaI = `ROUNDUP(E${currentExcelRow}/${dep.stepMm},0)+1`;
        } else if (dep.calcType === 'formula' && dep.formula) {
          qty = calculateFormula(dep.formula, {
            L: calcLength,
            W: module.width,
            H: module.height,
            Area: (calcLength * 100) / 1_000_000
          });

          if (dep.formula.includes('2.05') || dep.name.includes('цех')) {
            formulaI = `ROUNDUP(E${currentExcelRow}*1.05*2/1000,1)`;
          } else if (dep.formula.includes('1.05')) {
            formulaI = `ROUNDUP(E${currentExcelRow}*1.05/1000,1)`;
          } else if (dep.stepMm) {
            formulaI = `ROUNDUP(E${currentExcelRow}/${dep.stepMm},0)+1`;
          } else {
            // General translation of L -> E${currentExcelRow}
            formulaI = dep.formula
              .replace(/\bL\b/gi, `E${currentExcelRow}`)
              .replace(/\s+/g, '');
          }
        }
        dep.evaluatedQty = qty;

        rows.push({
          id: `bom-${dep.id}`,
          sourceType: 'accessory',
          sourceId: dep.id,
          parentName: prof.name,
          mark: dep.article,
          name: dep.name,
          materialMark: '',
          materialName: '',
          materialQty: '',
          materialUnit: '',
          processTemplate: '',
          linkType: 'комплектующие',
          specQty: qty,
          specUnit: dep.unit,
          vgbPlanGroup: '',
          vgbL: '',
          vgbB: '',
          vgbLB: '',
          vgbColor: '',
          vgpLeft: '',
          vgpRight: '',
          vgpLeft2: '',
          vgpRight2: '',
          planGroup: 'Комплектующие',
          excelFormulaI: formulaI
        });
      }
    }
  }

  // 2. Process all Cells (Spandrels, Panels, Glass, Screens, multiple fills per cell)
  for (const cell of module.cells) {
    const fills = normalizeCellFills(cell);
    for (const fill of fills) {
      const isGlass = fill.fillType === 'glass';
      const cellL = fill.height;
      const cellB = fill.width;
      const area = (cellL * cellB) / 1_000_000;
      const currentCellExcelRow = rows.length + 2;

      // Has material: true only if explicitly enabled or if spandrel/sheet metal with material
      const hasMat = fill.hasMaterial !== undefined ? fill.hasMaterial : (!isGlass && !!fill.material);
      const matMark = hasMat ? (fill.material || 'Оц 0,9мм') : '';
      const matName = hasMat ? (fill.materialName || 'Лист 0,9 Оц сталь ГОСТ 14918-80') : '';
      const tmpl = fill.processTemplate !== undefined ? fill.processTemplate : (hasMat ? 'Короб' : '');
      const lkType = fill.linkType || (hasMat ? 'деталь' : 'комплектующие');
      const planGrp = fill.planGroup || (hasMat ? 'Детали ЦМК' : '');

      rows.push({
        id: `bom-${cell.id}-${fill.id}`,
        sourceType: 'cell',
        sourceId: cell.id,
        fillId: fill.id,
        mark: fill.mark || (isGlass ? 'СП-1' : 'А1187 К1080-1000'),
        name: isGlass ? `${fill.name}${fill.formula ? ' ' + fill.formula : ''}` : fill.name,
        materialMark: matMark,
        materialName: matName,
        materialQty: hasMat ? Math.round(area * 100) / 100 : undefined,
        materialUnit: hasMat ? 'м2' : '',
        processTemplate: tmpl,
        linkType: lkType,
        specQty: 1,
        specUnit: 'шт',
        vgbPlanGroup: planGrp,
        vgbL: cellL,
        vgbB: cellB,
        vgbLB: Math.round(cellL * cellB),
        vgbColor: isGlass ? '' : (fill.color || ''),
        vgpLeft: '',
        vgpRight: '',
        vgpLeft2: '',
        vgpRight2: '',
        lengthMm: cellL,
        widthMm: cellB,
        areaM2: Math.round(area * 100) / 100,
        color: fill.color,
        planGroup: planGrp,
        excelFormulaE: hasMat ? `ROUNDUP(N${currentCellExcelRow}/1000000, 2)` : undefined,
        excelFormulaN: `ROUNDUP(L${currentCellExcelRow}*M${currentCellExcelRow}, 0)`
      });

      // Add dependencies of this fill (screws, insulation, pins, isolon)
      for (const dep of fill.dependencies || []) {
        let qty = 0;
        let formulaI: string | undefined;

        if (dep.calcType === 'fixed') {
          qty = dep.quantity || 1;
        } else if (dep.formula) {
          qty = calculateFormula(dep.formula, {
            L: cellL,
            W: cellB,
            H: cellL,
            Area: area
          });

          if (dep.formula.includes('/ 90') || dep.name.includes('Винт') || dep.name.includes('3,9х16')) {
            formulaI = `(ROUNDUP((L${currentCellExcelRow}/90+M${currentCellExcelRow}/90),0)+2)*3`;
          } else if (dep.formula.includes('2.05') || dep.name.includes('Изолон')) {
            formulaI = `ROUNDUP((L${currentCellExcelRow}+M${currentCellExcelRow})*2.05/1000,1)`;
          } else if (dep.formula.includes('0.15') || dep.name.includes('Утеплитель') || dep.name.includes('RookWool')) {
            formulaI = `ROUNDUP(E${currentCellExcelRow}*0.15,2)`;
          } else if (dep.formula.includes('* 6') || dep.name.includes('Гвоздь')) {
            formulaI = `ROUNDUP(E${currentCellExcelRow}*6,0)`;
          }
        }
        dep.evaluatedQty = qty;

        rows.push({
          id: `bom-${dep.id}`,
          sourceType: 'accessory',
          sourceId: dep.id,
          fillId: fill.id,
          parentName: `${fill.name} (${fill.mark})`,
          mark: dep.article,
          name: dep.name,
          materialMark: '',
          materialName: '',
          materialQty: '',
          materialUnit: '',
          processTemplate: '',
          linkType: 'комплектующие',
          specQty: qty,
          specUnit: dep.unit,
          vgbPlanGroup: '',
          vgbL: '',
          vgbB: '',
          vgbLB: '',
          vgbColor: '',
          vgpLeft: '',
          vgpRight: '',
          vgpLeft2: '',
          vgpRight2: '',
          lengthMm: 0,
          color: '',
          planGroup: '',
          excelFormulaI: formulaI
        });
      }
    }
  }

  // 3. Process Standalone Items (Отдельные детали и сборочные единицы: кронштейны, закладные и т.д.)
  if (module.standaloneItems && module.standaloneItems.length > 0) {
    for (const item of module.standaloneItems) {
      const isAssembly = item.itemType === 'assembly' || item.linkType === 'Сборочная единица';
      const isPart = item.itemType === 'part' || item.linkType === 'деталь';

      const hasDims = item.lengthMm && item.lengthMm > 0;
      const area = item.lengthMm && item.widthMm ? (item.lengthMm * item.widthMm) / 1000000 : 0;

      rows.push({
        id: `bom-standalone-${item.id}`,
        sourceType: 'standalone',
        sourceId: item.id,
        parentName: isAssembly ? 'Сборочная единица' : 'Деталь',
        mark: item.mark,
        name: item.name,
        materialMark: item.material || '',
        materialName: item.materialName || '',
        materialQty: hasDims ? (item.widthMm ? Math.round(area * 100) / 100 : item.lengthMm!) : '',
        materialUnit: hasDims ? (item.widthMm ? 'м2' : 'мм') : item.material ? 'шт' : '',
        processTemplate: item.processTemplate || '',
        linkType: item.linkType || (isAssembly ? 'Сборочная единица' : isPart ? 'деталь' : 'комплектующие'),
        specQty: item.quantity || 1,
        specUnit: item.unit || 'шт',
        vgbPlanGroup: item.planGroup || (isAssembly ? 'Сборочные единицы' : 'Детали ЦМК'),
        vgbL: item.lengthMm ?? '',
        vgbB: item.widthMm ?? '',
        vgbLB: item.lengthMm && item.widthMm ? Math.round(item.lengthMm * item.widthMm) : item.thicknessMm ?? '',
        vgbColor: item.color || module.color || '',
        vgpLeft: item.miterLeft ?? (isPart ? 90 : ''),
        vgpRight: item.miterRight ?? (isPart ? 90 : ''),
        vgpLeft2: isPart ? 90 : '',
        vgpRight2: isPart ? 90 : '',
        lengthMm: item.lengthMm,
        widthMm: item.widthMm,
        areaM2: area > 0 ? Math.round(area * 100) / 100 : undefined,
        color: item.color || module.color,
        planGroup: item.planGroup || (isAssembly ? 'Сборочные единицы' : 'Детали ЦМК')
      });
    }
  }

  return rows;
}

// 19 exact columns from А1187 М507_Модуль Жукова.xlsx
export const EXACT_EXCEL_HEADERS = [
  'Обозначение',
  'Наименование',
  'Материал обозначение',
  'Материал наименование',
  'Материал кол-во',
  'Материал ЕИ',
  'Шаблон техпроцесса',
  'Тип связи',
  'Кол-во в спецификации',
  'ЕИ',
  'VGB_Plan_Group',
  'VGB_L_MM',
  'VGB_B_MM',
  'VGB_LB_MM',
  'VGB_Color',
  'VGP_left',
  'VGP_Right',
  'VGP_Left_2',
  'VGP_Right_2'
];

/**
 * Export specification to Excel (.xlsx) with:
 * 1. Exact 19 columns
 * 2. Real Excel formulas for cutting lengths and accessory calculations
 * 3. Soft green styling for parts (Columns A to S)
 * 4. Soft blue styling for accessories (Columns A to K)
 */
export async function exportToExcel(module: ModuleModel, bomRows: BOMRow[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Spectool Facade Builder';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Спецификация', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  // 1. ROW 1 IS THE HEADER ROW (Columns A1 to S1), plus module dimensions in Y1 and Z1!
  const row1 = worksheet.getRow(1);
  row1.values = EXACT_EXCEL_HEADERS;
  row1.height = 24;

  // Store module dimensions in Y1 (Height) and Z1 (Width) on Row 1
  row1.getCell(25).value = module.height; // Y1
  row1.getCell(26).value = module.width;  // Z1

  // Header Row styling
  for (let c = 1; c <= 19; c++) {
    const cell = row1.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F4F7' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: c === 5 || c === 9 || c === 12 || c === 13 || c === 14 ? 'right' : c === 6 || c === 10 || c >= 16 ? 'center' : 'left'
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'medium', color: { argb: 'FF9CA3AF' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };
  }

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
  };

  // Add data rows starting at Row 2!
  bomRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // 1-based, Row 1 is header, data starts at Row 2

    // Build cell values (using formulas where applicable!)
    const valE = row.excelFormulaE
      ? { formula: row.excelFormulaE, result: Number(row.materialQty) || row.materialQty }
      : row.materialQty;

    const valL = row.excelFormulaL
      ? { formula: row.excelFormulaL, result: Number(row.vgbL) || row.vgbL }
      : row.vgbL;

    const valN = (row as any).excelFormulaN
      ? { formula: (row as any).excelFormulaN, result: Number(row.vgbLB) || row.vgbLB }
      : row.vgbLB;

    const valI = row.excelFormulaI
      ? { formula: row.excelFormulaI, result: Number(row.specQty) || row.specQty }
      : row.specQty;

    const rowData = [
      row.mark,
      row.name,
      row.materialMark,
      row.materialName,
      valE,
      row.materialUnit,
      row.processTemplate,
      row.linkType,
      valI,
      row.specUnit,
      row.vgbPlanGroup,
      valL,
      row.vgbB,
      valN,
      row.vgbColor,
      row.vgpLeft,
      row.vgpRight,
      row.vgpLeft2,
      row.vgpRight2
    ];

    const excelRow = worksheet.addRow(rowData);
    excelRow.height = 20;

    const isAssembly = row.linkType === 'Сборочная единица';
    const isPart = row.linkType === 'деталь';

    if (isAssembly) {
      // 1. Сборочные единицы: Пастельный желтый (#FFFFF2CC)
      for (let c = 1; c <= 19; c++) {
        const cell = excelRow.getCell(c);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF2CC' }
        };
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: c <= 2,
          color: { argb: c <= 2 ? 'FF92400E' : 'FF1F2937' }
        };
        cell.border = thinBorder;
        cell.alignment = {
          vertical: 'middle',
          horizontal: c === 5 || c === 9 || c === 12 || c === 13 || c === 14 ? 'right' : c === 6 || c === 10 || c >= 16 ? 'center' : 'left'
        };
      }
    } else if (isPart) {
      // 2. Детали: Светло-зеленый цвет (A до S - все 19 колонок!)
      for (let c = 1; c <= 19; c++) {
        const cell = excelRow.getCell(c);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' } // Pastel Light Green
        };
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: c <= 2,
          color: { argb: c <= 2 ? 'FF1E3A8A' : 'FF1F2937' }
        };
        cell.border = thinBorder;
        cell.alignment = {
          vertical: 'middle',
          horizontal: c === 5 || c === 9 || c === 12 || c === 13 || c === 14 ? 'right' : c === 6 || c === 10 || c >= 16 ? 'center' : 'left'
        };
      }
    } else {
      // 3. Комплектующие: Светло-синий цвет (A до K - первые 11 колонок!)
      for (let c = 1; c <= 11; c++) {
        const cell = excelRow.getCell(c);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' } // Pastel Light Blue
        };
        cell.font = {
          name: 'Calibri',
          size: 10,
          color: { argb: 'FF334155' }
        };
        cell.border = thinBorder;
        cell.alignment = {
          vertical: 'middle',
          horizontal: c === 5 || c === 9 ? 'right' : c === 6 || c === 10 ? 'center' : 'left'
        };
      }
      for (let c = 12; c <= 19; c++) {
        const cell = excelRow.getCell(c);
        cell.border = thinBorder;
      }
    }
  });

  // Set column widths matching original specification
  worksheet.columns = [
    { width: 28 }, // A: Обозначение
    { width: 34 }, // B: Наименование
    { width: 25 }, // C: Материал обозначение
    { width: 28 }, // D: Материал наименование
    { width: 16 }, // E: Материал кол-во
    { width: 13 }, // F: Материал ЕИ
    { width: 24 }, // G: Шаблон техпроцесса
    { width: 16 }, // H: Тип связи
    { width: 20 }, // I: Кол-во в спецификации
    { width: 8 },  // J: ЕИ
    { width: 24 }, // K: VGB_Plan_Group
    { width: 13 }, // L: VGB_L_MM
    { width: 13 }, // M: VGB_B_MM
    { width: 13 }, // N: VGB_LB_MM
    { width: 14 }, // O: VGB_Color
    { width: 10 }, // P: VGP_left
    { width: 10 }, // Q: VGP_Right
    { width: 10 }, // R: VGP_Left_2
    { width: 10 }, // S: VGP_Right_2
    { width: 5 },  // T
    { width: 5 },  // U
    { width: 5 },  // V
    { width: 5 },  // W
    { width: 5 },  // X
    { width: 10 }, // Y: Height H
    { width: 10 }  // Z: Width W
  ];

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${module.project || 'А1187'}_${module.name || 'Спецификация'}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
