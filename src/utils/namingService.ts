import { LineSegment, ProfileBinding } from '../types';

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
 * Формирует заводское обозначение детали по эталону "Модуля Жукова":
 * [Код объекта] [Цифры артикула]-[Осевая длина]-[Порядковый номер]
 * Пример: "А1187 0101-2555-512"
 */
export function generateProfileMark(
  projectCode: string,
  article: string,
  axialLength: number,
  orderNumber: string | number
): string {
  const proj = (projectCode || 'А1187').trim();
  const digits = extractArticleDigits(article);
  const len = Math.round(axialLength);
  const ord = String(orderNumber ?? '500').trim();
  return `${proj} ${digits}-${len}-${ord}`;
}

/**
 * Автоматически определяет роли линий (n L, n R, Up, Down, Middle)
 * и присваивает заводские порядковые номера (512, 522, 500)
 */
export function autoAssignStandardRolesAndNumbers(
  lines: LineSegment[],
  moduleWidth: number,
  moduleHeight: number,
  projectCode: string
): LineSegment[] {
  let middleCount = 0;
  let innerVertCount = 0;

  return lines.map((line, idx) => {
    const isVert = Math.abs(line.x1 - line.x2) <= 5;
    const isHoriz = Math.abs(line.y1 - line.y2) <= 5;

    let role = line.role;
    let orderNum = line.orderNumber;

    if (isVert) {
      const avgX = (line.x1 + line.x2) / 2;
      if (Math.abs(avgX - 0) <= 25) {
        role = 'n L';
        orderNum = orderNum ?? 512;
      } else if (Math.abs(avgX - moduleWidth) <= 25) {
        role = 'n R';
        orderNum = orderNum ?? 522;
      } else {
        innerVertCount++;
        role = `Стойка ${innerVertCount}`;
        orderNum = orderNum ?? (512 + innerVertCount);
      }
    } else if (isHoriz) {
      const avgY = (line.y1 + line.y2) / 2;
      if (Math.abs(avgY - moduleHeight) <= 25) {
        role = 'Up';
        orderNum = orderNum ?? 500;
      } else if (Math.abs(avgY - 0) <= 25) {
        role = 'Down';
        orderNum = orderNum ?? 500;
      } else {
        middleCount++;
        role = `Middle ${middleCount}`;
        orderNum = orderNum ?? 500;
      }
    } else {
      role = role ?? `Линия ${idx + 1}`;
      orderNum = orderNum ?? (idx + 1);
    }

    // Обновляем марки для профилей
    const updatedProfiles: ProfileBinding[] = (line.profileBindings || []).map((prof) => {
      const pOrder = prof.orderNumber ?? orderNum ?? 500;
      const autoMark = generateProfileMark(projectCode, prof.article, line.length, pOrder);
      return {
        ...prof,
        orderNumber: pOrder,
        role: role,
        // Если марка была пустая или сгенерированная ранее, обновляем её
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
 * Присваивает последовательные порядковые номера 1, 2, 3...
 */
export function autoAssignSequentialNumbers(
  lines: LineSegment[],
  projectCode: string
): LineSegment[] {
  return lines.map((line, idx) => {
    const seqNum = idx + 1;
    const updatedProfiles: ProfileBinding[] = (line.profileBindings || []).map((prof) => ({
      ...prof,
      orderNumber: seqNum,
      customMark: generateProfileMark(projectCode, prof.article, line.length, seqNum)
    }));

    return {
      ...line,
      orderNumber: seqNum,
      profileBindings: updatedProfiles
    };
  });
}

