import { LineSegment, ProfileBinding } from '../types';

export const DEFAULT_NAMING_PATTERN = '{project} {article}-{axialLength}-{order}';
const PATTERN_STORAGE_KEY = 'spectool_naming_pattern';

export interface NamingPreset {
  id: string;
  name: string;
  pattern: string;
  example: string;
  description: string;
}

export const NAMING_PRESETS: NamingPreset[] = [
  {
    id: 'axial',
    name: 'По длине по осям (стандарт Жукова)',
    pattern: '{project} {article}-{axialLength}-{order}',
    example: 'А1187 0101-2555-1',
    description: 'Код проекта, пробел, 4 цифры артикула, дефис, осевая длина, дефис, порядковый номер.'
  },
  {
    id: 'actual',
    name: 'По фактической длине детали (с подрезкой)',
    pattern: '{project} {article}-{cutLength}-{order}',
    example: 'А1187 0101-2515-1',
    description: 'Код проекта, пробел, 4 цифры артикула, дефис, фактическая длина L заготовки, дефис, порядковый номер.'
  },
  {
    id: 'dashes',
    name: 'Сплошной дефис (код-арт-длина-номер)',
    pattern: '{project}-{article}-{cutLength}-{order}',
    example: 'А1187-0101-2515-1',
    description: 'Все части разделены дефисами, без пробелов.'
  },
  {
    id: 'no_order',
    name: 'Без порядкового номера (код арт-длина)',
    pattern: '{project} {article}-{cutLength}',
    example: 'А1187 0101-2515',
    description: 'Для объектов, где марки деталей не имеют порядкового индекса.'
  }
];

/**
 * Получить активный шаблон формулы наименования
 */
export function getNamingPattern(): string {
  try {
    const saved = localStorage.getItem(PATTERN_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (_) {}
  return DEFAULT_NAMING_PATTERN;
}

/**
 * Сохранить активный шаблон формулы наименования
 */
export function saveNamingPattern(pattern: string): void {
  try {
    localStorage.setItem(PATTERN_STORAGE_KEY, pattern.trim());
  } catch (_) {}
}

/**
 * Извлекает 4-значный цифровой код из артикула профиля.
 * Например: "AYPC.EF100.40.0101" -> "0101", "AYPC.150.0201" -> "0201"
 */
export function extractArticleDigits(article: string): string {
  if (!article) return '0000';
  const match = article.match(/\b(\d{4})\b/) || article.match(/(\d{4})/);
  if (match) return match[1];

  // Если 4 цифр подряд нет, берем очищенный код
  const cleaned = article.replace(/[^a-zA-Z0-9]/g, '');
  return cleaned.slice(-4) || '0000';
}

/**
 * Формирует марку детали по настраиваемому шаблону формулы.
 * Поддерживаемые переменные:
 *   {project}     - код объекта (напр. "А1187")
 *   {article}     - 4 цифры артикула (напр. "0101")
 *   {fullArticle} - полный исходный артикул (напр. "AYPC.EF100.40.0101")
 *   {axialLength} - длина по осям (напр. 2555)
 *   {length}      - синоним {axialLength}
 *   {cutLength}   - фактическая длина заготовки L с вычетом подрезки (напр. 2515)
 *   {order}       - порядковый номер детали (напр. "1", "512")
 */
export function generateProfileMark(
  projectCode: string,
  article: string,
  axialLength: number,
  orderNumber: string | number,
  cutLength?: number,
  customPattern?: string
): string {
  const pattern = (customPattern || getNamingPattern()).trim();
  const proj = (projectCode || 'А1187').trim();
  const digits = extractArticleDigits(article);
  const fullArt = (article || '').trim();
  const axLen = Math.round(axialLength || 0);
  const actualLen = Math.round(cutLength !== undefined ? cutLength : axialLength);
  const ord = String(orderNumber !== undefined && orderNumber !== '' ? orderNumber : '1').trim();

  let res = pattern
    .replace(/{project}/gi, proj)
    .replace(/{article}/gi, digits)
    .replace(/{fullArticle}/gi, fullArt)
    .replace(/{axialLength}/gi, String(axLen))
    .replace(/{length}/gi, String(axLen))
    .replace(/{cutLength}/gi, String(actualLen))
    .replace(/{order}/gi, ord);

  return res.trim();
}

/**
 * Назначает порядковые номера последовательно (1, 2, 3...)
 * и роли стойкам и ригелям.
 */
export function autoAssignStandardRolesAndNumbers(
  lines: LineSegment[],
  moduleWidth: number,
  moduleHeight: number,
  projectCode: string,
  pattern?: string
): LineSegment[] {
  let middleCount = 0;
  let vertCount = 0;

  return lines.map((line, idx) => {
    const isVert = Math.abs(line.x1 - line.x2) <= 5;
    const isHoriz = Math.abs(line.y1 - line.y2) <= 5;

    let role = line.role;
    // По умолчанию назначаем всегда по порядку 1, 2, 3...
    const seqNum = idx + 1;
    const orderNum = line.orderNumber !== undefined && line.orderNumber !== '' ? line.orderNumber : seqNum;

    if (isVert) {
      vertCount++;
      const avgX = (line.x1 + line.x2) / 2;
      if (Math.abs(avgX - 0) <= 25) {
        role = role || 'Левая стойка';
      } else if (Math.abs(avgX - moduleWidth) <= 25) {
        role = role || 'Правая стойка';
      } else {
        role = role || `Стойка ${vertCount}`;
      }
    } else if (isHoriz) {
      const avgY = (line.y1 + line.y2) / 2;
      if (Math.abs(avgY - moduleHeight) <= 25) {
        role = role || 'Верхняя рама';
      } else if (Math.abs(avgY - 0) <= 25) {
        role = role || 'Нижняя рама';
      } else {
        middleCount++;
        role = role || `Импост ${middleCount}`;
      }
    } else {
      role = role || `Линия ${idx + 1}`;
    }

    // Обновляем марки для профилей
    const updatedProfiles: ProfileBinding[] = (line.profileBindings || []).map((prof) => {
      const pOrder = prof.orderNumber !== undefined && prof.orderNumber !== '' ? prof.orderNumber : orderNum;
      const cutL = prof.calculatedLength !== undefined ? prof.calculatedLength : line.length;
      const autoMark = generateProfileMark(projectCode, prof.article, line.length, pOrder, cutL, pattern);
      return {
        ...prof,
        orderNumber: pOrder,
        role: role,
        customMark: prof.customMark && !prof.customMark.includes('-') ? prof.customMark : autoMark
      };
    });

    return {
      ...line,
      role,
      orderNumber: orderNum,
      profileBindings: updatedProfiles
    };
  });
}

/**
 * Принудительно сбрасывает порядковые номера всех линий строго по порядку 1, 2, 3...
 */
export function autoAssignSequentialNumbers(
  lines: LineSegment[],
  projectCode: string,
  pattern?: string
): LineSegment[] {
  return lines.map((line, idx) => {
    const seqNum = idx + 1;
    const updatedProfiles: ProfileBinding[] = (line.profileBindings || []).map((prof) => {
      const cutL = prof.calculatedLength !== undefined ? prof.calculatedLength : line.length;
      return {
        ...prof,
        orderNumber: seqNum,
        customMark: generateProfileMark(projectCode, prof.article, line.length, seqNum, cutL, pattern)
      };
    });

    return {
      ...line,
      orderNumber: seqNum,
      profileBindings: updatedProfiles
    };
  });
}
