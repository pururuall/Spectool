/**
 * Сервис управления базой шаблонов технологических процессов (Шаблоны ТП)
 * для интеграции с производством и системой Vogbit.
 */

export const DEFAULT_PROCESS_TEMPLATES: string[] = [
  "Основной профиль, Стойки, рамы, ригеля",
  "Короба, экраны",
  "Кассеты, пилоны в составе модуля",
  "Кронштейны сварные/сборные модульные",
  "Детали кронштейнов из металического листа",
  "Детали кронштейнов из стальных профилей",
  "Детали кронштейнов из алюминиевых профилей",
  "Сэндвич панель, многодетальная кассета в составе модуля",
  "Детали из бруса ПВХ, ПНД",
  "Детали из дерева",
  "Детали из листа ЭППС",
  "Детали из листов ПВХ, ПНД, Паронит",
  "Окна, двери, вентстворки, вентрешетки и тд (вставки) в составе модуля",
  "Профиля \"Вставок\"",
  "Кронштейны \"Вставок\"",
  "Сухари \"Вставок\"",
  "Сухари, подкладки, адаптеры \"Вставок\"",
  "Детали из мет.Листов \"Вставок\"",
  "Пилоны, кассеты, двери как отдельная отправочная марка",
  "Адаптеры ПВХ",
  "Адаптеры Алюминиевые",
  "Прижимы",
  "Крышки",
  "Детали токарные из стальных и алюминиевых профилей",
  "Детали мелкие из Системных профилей (сухари)",
  "Детали из стандартных Ал Профилей (уголок, труба)",
  "Модуль"
];

const STORAGE_KEY = 'spectool_process_templates';

/**
 * Получить список всех шаблонов ТП (из LocalStorage или заводских по умолчанию)
 */
export function getProcessTemplates(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Ошибка чтения шаблонов ТП из localStorage:', err);
  }
  return [...DEFAULT_PROCESS_TEMPLATES];
}

/**
 * Сохранить список шаблонов ТП в LocalStorage
 */
export function saveProcessTemplates(templates: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Ошибка сохранения шаблонов ТП в localStorage:', err);
  }
}

/**
 * Добавить новый шаблон ТП
 */
export function addProcessTemplate(templateName: string): string[] {
  const trimmed = templateName.trim();
  if (!trimmed) return getProcessTemplates();

  const current = getProcessTemplates();
  if (!current.includes(trimmed)) {
    const updated = [trimmed, ...current];
    saveProcessTemplates(updated);
    return updated;
  }
  return current;
}

/**
 * Удалить шаблон ТП
 */
export function removeProcessTemplate(templateName: string): string[] {
  const current = getProcessTemplates();
  const updated = current.filter((t) => t !== templateName);
  saveProcessTemplates(updated);
  return updated;
}

export { removeProcessTemplate as deleteProcessTemplate };

/**
 * Сбросить шаблоны ТП к заводским 27 категориям из «Типы деталей в производстве.xlsx»
 */
export function resetProcessTemplates(): string[] {
  saveProcessTemplates(DEFAULT_PROCESS_TEMPLATES);
  return [...DEFAULT_PROCESS_TEMPLATES];
}

