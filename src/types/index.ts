export interface DependencyRule {
  id: string;
  article: string;
  name: string;
  type: 'fastener' | 'gasket' | 'insulation' | 'hardware' | 'other';
  unit: 'шт' | 'м' | 'м2' | 'м3';
  calcType: 'fixed' | 'formula' | 'step';
  quantity?: number;
  stepMm?: number;
  formula?: string; // e.g. "ROUNDUP(L / 200, 0) + 1" or "L * 1.05 / 1000"
  evaluatedQty: number;
}

export interface ProfileBinding {
  id: string;
  lineId: string;
  article: string;
  name: string;
  customMark: string;
  company?: string;
  category: 'profile' | 'clamp' | 'cap' | 'joint' | 'transom' | 'other';
  material: string;
  materialName: string;
  unit: string;
  startOffset: number; // Отступ в начале (мм)
  endOffset: number;   // Отступ в конце (мм)
  calculatedLength: number; // L = line.length - startOffset - endOffset
  color: string;
  orderNumber?: number | string; // Порядковый номер детали ("палки"), напр. 512, 522, 500
  role?: string;        // Роль: 'n L', 'n R', 'Up', 'Down', 'Middle 1' и т.д.
  miterLeft?: number;   // 90 или 45
  miterRight?: number;  // 90 или 45
  miterLeft2?: number;  // Угол подрезки 2 плоскость
  miterRight2?: number; // Угол подрезки 2 плоскость
  planGroup: string;
  dependencies: DependencyRule[];
}

export interface LineSegment {
  id: string;
  name: string;
  x1: number; // мм
  y1: number; // мм
  x2: number; // мм
  y2: number; // мм
  length: number; // мм
  orderNumber?: number | string; // Порядковый номер палки
  role?: string;        // 'n L', 'n R', 'Up', 'Down', 'Middle 1' и т.д.
  profileBindings: ProfileBinding[];
}

export type CellFillType = 'glass' | 'spandrel' | 'louver' | 'sash' | 'pylon' | 'empty' | 'custom';

export interface Cell {
  id: string;
  x: number;      // Начало по X (мм)
  y: number;      // Начало по Y (мм)
  width: number;  // Ширина пролёта (мм)
  height: number; // Высота пролёта (мм)
  fillType: CellFillType;
  name: string;
  mark: string;
  linkType?: 'деталь' | 'комплектующие' | 'Сборочная единица';
  hasMaterial?: boolean; // false для стеклопакетов, решеток, створок; true для коробов и деталей
  material?: string;     // Оц 0,9мм
  materialName?: string; // Лист 0,9 Оц сталь ГОСТ 14918-80
  processTemplate?: string; // Шаблон техпроцесса (напр. "Короб" или пусто)
  planGroup?: string;       // Группа планирования (напр. "Детали ЦМК", "Комплектующие", "Окна и вставки")
  glassWidth: number;   // Реальная ширина заполнения / развертки (мм)
  glassHeight: number;  // Реальная высота заполнения / развертки (мм)
  thickness?: number;   // Толщина (мм)
  formula?: string;     // Формула стеклопакета или описание короба/решетки
  color?: string;
  dependencies: DependencyRule[];
}

export interface CellTemplate {
  id: string;
  title: string;
  fillType: CellFillType;
  name: string;
  markPrefix: string;
  linkType: 'деталь' | 'комплектующие' | 'Сборочная единица';
  hasMaterial: boolean;
  material?: string;
  materialName?: string;
  processTemplate?: string;
  planGroup?: string;
  widthOffset: number;
  heightOffset: number;
  dependencies?: Array<{
    article: string;
    name: string;
    type: 'fastener' | 'hardware' | 'gasket' | 'insulation';
    unit: 'шт' | 'м' | 'м2' | 'м3';
    calcType: 'fixed' | 'formula' | 'step';
    quantity?: number;
    stepMm?: number;
    formula?: string;
  }>;
}

export interface ModuleModel {
  id: string;
  name: string;
  project: string;
  width: number;  // W (мм)
  height: number; // H (мм)
  color: string;
  colors?: string[]; // Массив цветов проекта (напр. ['RAL 7012', 'RAL 9005', 'RAL 9006'])
  lines: LineSegment[];
  cells: Cell[];
}

export interface CatalogHardwareItem {
  id: string;
  article: string;
  code?: string;
  name: string;
  type: string;
  standard: string;
  diameter: string;
  length: string;
  material: string;
  strength?: string;
  color?: string;
}

export interface CatalogMaterialItem {
  id: string;
  section: string;      // Раздел верхнего уровня (Профили, Листовые, Заполнения, и т.д.)
  subsection: string;   // Подраздел (Стойки, Ригели, Оцинковка, Стеклопакеты...)
  article: string;      // Артикул / Марка
  name: string;         // Наименование
  material: string;     // Сплав / состав
  unit: string;         // п.м., м2, шт, кг
  weight?: number;      // Вес единицы (кг/п.м. или кг/м2)
  stockLength?: number; // Длина хлыста (мм)
  width?: number;       // Ширина сечения (мм)
  depth?: number;       // Глубина сечения (мм)
  company?: string;     // Alutech, Schuco и т.д.
  system?: string;      // EF100, FWS50 и т.д.
  defaultOffset?: number;
  defaultOffsetFormula?: string;
  category?: 'frame_vertical' | 'frame_horizontal' | 'transom' | 'clamp' | 'cap' | 'joint' | 'sheet' | 'glass' | 'other';
}

export interface CatalogProfileItem {
  article: string;
  name: string;
  system: string;
  company: string;
  defaultOffset: number;
  defaultOffsetFormula: string;
  category: 'frame_vertical' | 'frame_horizontal' | 'transom' | 'clamp' | 'cap' | 'joint';
  suggestedAccessories: Array<{
    article: string;
    name: string;
    unit: 'шт' | 'м';
    calcType: 'fixed' | 'formula' | 'step';
    quantity?: number;
    stepMm?: number;
    formula?: string;
  }>;
}

export interface BOMRow {
  id: string;
  sourceType: 'profile' | 'cell' | 'accessory' | 'hardware';
  sourceId: string;
  parentName?: string;
  // 19 exact columns from А1187 М507_Модуль Жукова.xlsx
  mark: string;             // Обозначение
  name: string;             // Наименование
  materialMark: string;     // Материал обозначение
  materialName: string;     // Материал наименование
  materialQty: number | string; // Материал кол-во
  materialUnit: string;     // Материал ЕИ
  processTemplate: string;  // Шаблон техпроцесса
  linkType: 'деталь' | 'комплектующие' | 'Сборочная единица' | 'материал'; // Тип связи
  specQty: number;          // Кол-во в спецификации
  specUnit: string;         // ЕИ
  vgbPlanGroup: string;     // VGB_Plan_Group
  vgbL: number | string;    // VGB_L_MM
  vgbB: number | string;    // VGB_B_MM
  vgbLB: number | string;   // VGB_LB_MM
  vgbColor: string;         // VGB_Color
  vgpLeft: number | string;  // VGP_left
  vgpRight: number | string; // VGP_Right
  vgpLeft2: number | string; // VGP_Left_2
  vgpRight2: number | string; // VGP_Right_2

  // Dynamic Excel formulas
  excelFormulaE?: string;
  excelFormulaI?: string;
  excelFormulaL?: string;
  excelFormulaN?: string;

  // Backwards compatibility / helpers
  lengthMm?: number;
  widthMm?: number;
  areaM2?: number;
  color?: string;
  miterLeft?: number;
  miterRight?: number;
  planGroup?: string;
}
