/**
 * promptBuilder.ts
 * Формирует готовый Markdown тикет с контекстом для ИИ-агента
 */

import { InspectedElementInfo } from './fiberInspector';

export interface FeedbackNote {
  element: InspectedElementInfo;
  userComment: string;
  category: 'bug' | 'feature' | 'style' | 'logic';
  expectedBehavior?: string;
  screenshotBase64?: string;
  timestamp: string;
}

export function buildAgentPrompt(note: FeedbackNote): string {
  const { element, userComment, category, expectedBehavior, timestamp } = note;

  return `### 🐞 Заметка для ИИ-Агента: [${category.toUpperCase()}]
**Время:** ${timestamp}

#### 🎯 Контекст целевого элемента в коде:
- **React-компонент:** \`<${element.componentName} />\`
- **Файл (dev):** \`${element.sourceFile || 'Определите по структуре компонентов'}\`
- **DOM Селектор:** \`${element.selector}\` (тег: \`<${element.tagName}>\`)
- **Размеры и позиция:** W=${Math.round(element.rect.width)}px, H=${Math.round(element.rect.height)}px (X=${Math.round(element.rect.left)}, Y=${Math.round(element.rect.top)})
${element.props ? `- **React Props элемента:** \`${JSON.stringify(element.props)}\`` : ''}

#### 📝 Что заметил пользователь (Проблема):
> "${userComment}"

${expectedBehavior ? `#### ✨ Ожидаемое поведение:\n> "${expectedBehavior}"\n` : ''}
#### 🛠️ Задача для агента:
1. Найдите компонент \`<${element.componentName} />\` в проекте.
2. Проверьте обработчики событий и визуальное поведение для \`${element.selector}\`.
3. Исправьте логику в соответствии с замечанием пользователя.
`;
}
