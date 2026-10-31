/**
 * fiberInspector.ts
 * Утилита для извлечения информации о React компоненте из любого DOM/SVG узла
 */

export interface InspectedElementInfo {
  componentName: string;
  sourceFile?: string;
  tagName: string;
  className: string;
  id: string;
  selector: string;
  rect: DOMRect;
  props?: Record<string, any>;
}

export function inspectElement(target: HTMLElement | SVGElement): InspectedElementInfo {
  const rect = target.getBoundingClientRect();
  const tagName = target.tagName.toLowerCase();
  const id = target.id || '';
  const className = typeof target.className === 'string' ? target.className : '';

  // Генерируем читаемый CSS-селектор
  let selector = tagName;
  if (id) selector += `#${id}`;
  else if (className) {
    const firstClass = className.trim().split(/\s+/)[0];
    if (firstClass) selector += `.${firstClass}`;
  }

  // Пытаемся заглянуть в React Fiber дерево (работает в Dev режиме React)
  let componentName = tagName.toUpperCase();
  let sourceFile: string | undefined;
  let props: Record<string, any> | undefined;

  try {
    const fiberKey = Object.keys(target).find(
      (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    );

    if (fiberKey) {
      let fiber = (target as any)[fiberKey];
      while (fiber) {
        if (typeof fiber.type === 'function' && (fiber.type.displayName || fiber.type.name)) {
          componentName = fiber.type.displayName || fiber.type.name;
          sourceFile = fiber._debugSource?.fileName;
          // Фильтруем props (убираем children и тяжелые объекты)
          if (fiber.memoizedProps) {
            const cleanProps: Record<string, any> = {};
            for (const [k, v] of Object.entries(fiber.memoizedProps)) {
              if (k === 'children') continue;
              if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                cleanProps[k] = v;
              }
            }
            props = cleanProps;
          }
          break;
        }
        fiber = fiber.return;
      }
    }
  } catch (err) {
    console.warn('[AgentFeedback] Fiber inspection fallback:', err);
  }

  return {
    componentName,
    sourceFile,
    tagName,
    className,
    id,
    selector,
    rect,
    props
  };
}
