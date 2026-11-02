// themeService.ts — Сервис управления темами интерфейса Spectool

export interface ThemeDefinition {
  id: string;
  name: string;
  brightness: 'light' | 'dark';
  isCustom?: boolean;
  baseStyles: {
    background: string;
    panelBackground: string;
    border: string;
    borderRadius: string;
    boxShadow: string;
    backdropFilter?: string;
    fontFamily: string;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    accent: string;
    textMain: string;
    textMuted: string;
  };
  cadZone: {
    background: string;
    gridColor: string;
    activeColor: string;
  };
  directives: string;
}

export const builtInThemes: Record<string, ThemeDefinition> = {
  // === БАЗОВАЯ ТЕМА: Spectool Classic ===
  classic_default: {
    id: 'classic_default',
    name: 'Spectool Classic Blueprint',
    brightness: 'light',
    baseStyles: {
      background: '#F8FAFC',
      panelBackground: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      fontFamily: 'Inter, sans-serif'
    },
    colors: {
      primary: '#2563EB',
      secondary: '#475569',
      success: '#10B981',
      accent: '#F59E0B',
      textMain: '#0F172A',
      textMuted: '#64748B'
    },
    cadZone: {
      background: '#FFFFFF',
      gridColor: '#CBD5E1',
      activeColor: '#2563EB'
    },
    directives: 'Стандартная сбалансированная инженерная тема Spectool. Светлый чистый интерфейс, акцентный синий цвет и отличная читаемость.'
  },

  // === ВАРИАНТ 3: Ультра-Минимализм (Ultra-Minimalist) ===
  variant_3_ultra_minimalist: {
    id: 'variant_3_ultra_minimalist',
    name: 'Ultra-Minimalist',
    brightness: 'light',
    baseStyles: {
      background: '#F8FAFC',
      panelBackground: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      boxShadow: 'none',
      fontFamily: 'Inter, sans-serif'
    },
    colors: {
      primary: '#2563EB',
      secondary: '#64748B',
      success: '#10B981',
      accent: '#3B82F6',
      textMain: '#0F172A',
      textMuted: '#64748B'
    },
    cadZone: {
      background: '#FFFFFF',
      gridColor: '#F1F5F9',
      activeColor: '#2563EB'
    },
    directives: 'Минимум визуального шума. Использовать только тонкие линии-разделители, полностью отказаться от градиентов и тяжелых теней. Увеличить whitespace между блоками.'
  },

  // === ВАРИАНТ 4: Индустриальный Темный (Industrial CAD) ===
  variant_4_industrial_cad: {
    id: 'variant_4_industrial_cad',
    name: 'Industrial CAD Dark',
    brightness: 'dark',
    baseStyles: {
      background: '#181A1F',
      panelBackground: '#21252B',
      border: '1px solid #323842',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      fontFamily: 'JetBrains Mono, Roboto, monospace'
    },
    colors: {
      primary: '#F97316',
      secondary: '#06B6D4',
      success: '#10B981',
      accent: '#E11D48',
      textMain: '#F3F4F6',
      textMuted: '#9CA3AF'
    },
    cadZone: {
      background: '#0F1115',
      gridColor: '#242933',
      activeColor: '#F97316'
    },
    directives: 'Стиль классического инженерного ПО (AutoCAD, SolidWorks). Темный контрастный интерфейс, технические моноширинные шрифты, яркие оранжевые и голубые акценты.'
  },

  // === ВАРИАНТ 5: Модульный на карточках (Soft & Card-based) ===
  variant_5_soft_card: {
    id: 'variant_5_soft_card',
    name: 'Soft & Card-based Light',
    brightness: 'light',
    baseStyles: {
      background: '#F1F5F9',
      panelBackground: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px -2px rgba(148, 163, 184, 0.16)',
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'
    },
    colors: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      success: '#22C55E',
      accent: '#EC4899',
      textMain: '#1E293B',
      textMuted: '#64748B'
    },
    cadZone: {
      background: '#FFFFFF',
      gridColor: '#E2E8F0',
      activeColor: '#6366F1'
    },
    directives: 'Карточный интерфейс. Все панели явно выглядят как приподнятые скругленные карточки (16px) на мягком сером фоне. Дружелюбный стиль с умеренными тенями.'
  },

  // === ВАРИАНТ 6: Кибернетический Темный (Neon Sci-Fi) ===
  variant_6_neon_scifi: {
    id: 'variant_6_neon_scifi',
    name: 'Neon Sci-Fi Dark',
    brightness: 'dark',
    baseStyles: {
      background: '#0A051B',
      panelBackground: '#120B2E',
      border: '1px solid #3F1D7F',
      borderRadius: '8px',
      boxShadow: '0 0 15px rgba(139, 92, 246, 0.25)',
      fontFamily: 'JetBrains Mono, Orbitron, monospace'
    },
    colors: {
      primary: '#A78BFA',
      secondary: '#22D3EE',
      success: '#34D399',
      accent: '#F43F5E',
      textMain: '#F5F3FF',
      textMuted: '#A78BFA'
    },
    cadZone: {
      background: '#070214',
      gridColor: '#1B0F3F',
      activeColor: '#22D3EE'
    },
    directives: 'Футуристичный киберпанк / Sci-Fi интерфейс. Активное использование светящихся неоновых бордеров, фиолетовых и бирюзовых неоновых акцентов.'
  },

  // === ВАРИАНТ 7: Компактный Космический (Cosmic Slate) ===
  variant_7_cosmic_slate: {
    id: 'variant_7_cosmic_slate',
    name: 'Cosmic Slate Density',
    brightness: 'dark',
    baseStyles: {
      background: '#1E293B',
      panelBackground: '#0F172A',
      border: '1px solid #334155',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
      fontFamily: 'JetBrains Mono, Segoe UI, sans-serif'
    },
    colors: {
      primary: '#38BDF8',
      secondary: '#818CF8',
      success: '#4ADE80',
      accent: '#FB7185',
      textMain: '#F8FAFC',
      textMuted: '#94A3B8'
    },
    cadZone: {
      background: '#020617',
      gridColor: '#1E293B',
      activeColor: '#38BDF8'
    },
    directives: 'Плотный, компактный интерфейс в глубоких космических и стальных тонах. Экономия экранного пространства, высокая контрастность шрифта.'
  },

  // === ВАРИАНТ 8: Контрастный Светлый (Accent Flat) ===
  variant_8_accent_flat: {
    id: 'variant_8_accent_flat',
    name: 'Accent Flat Light',
    brightness: 'light',
    baseStyles: {
      background: '#F3F4F6',
      panelBackground: '#FFFFFF',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      boxShadow: 'none',
      fontFamily: 'Inter, sans-serif'
    },
    colors: {
      primary: '#0F172A',
      secondary: '#059669',
      success: '#10B981',
      accent: '#D97706',
      textMain: '#111827',
      textMuted: '#4B5563'
    },
    cadZone: {
      background: '#FFFFFF',
      gridColor: '#E5E7EB',
      activeColor: '#059669'
    },
    directives: 'Плоский контрастный дизайн. Использование темных или ярких плашек в шапках блоков, чтобы четко разделить разделы. Без теней.'
  },

  // === ВАРИАНТ 9: Экологичный Природный (Natural Sage/Eco) ===
  variant_9_natural_sage: {
    id: 'variant_9_natural_sage',
    name: 'Natural Sage & Eco',
    brightness: 'light',
    baseStyles: {
      background: '#E2ECE9',
      panelBackground: '#FBFDFB',
      border: '1px solid #C4D3CD',
      borderRadius: '14px',
      boxShadow: '0 4px 12px rgba(44, 74, 62, 0.06)',
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'
    },
    colors: {
      primary: '#1E3F35',
      secondary: '#687D6B',
      success: '#2B6B48',
      accent: '#8B5A2B',
      textMain: '#14251F',
      textMuted: '#687D6B'
    },
    cadZone: {
      background: '#1E2F29',
      gridColor: '#2F423C',
      activeColor: '#84CC16'
    },
    directives: 'Естественные природные тона. Плавные линии, скругления (14px). Иконки в глубоком зеленом и болотном цвете. Чертеж слева в теплых хвойных тонах.'
  },

  // === ВАРИАНТ 10: Индустриальный Оранжево-Угольный (Industrial Hazard) ===
  variant_10_industrial_hazard: {
    id: 'variant_10_industrial_hazard',
    name: 'Industrial Hazard & Graphite',
    brightness: 'dark',
    baseStyles: {
      background: '#121213',
      panelBackground: '#1E1E1F',
      border: '1px solid #2E2E31',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      fontFamily: 'JetBrains Mono, Roboto Mono, monospace'
    },
    colors: {
      primary: '#FF7A00',
      secondary: '#FFC700',
      success: '#00E676',
      accent: '#FF1744',
      textMain: '#F5F5F7',
      textMuted: '#8E8E93'
    },
    cadZone: {
      background: '#0D0D0E',
      gridColor: '#1E1E1F',
      activeColor: '#FF7A00'
    },
    directives: 'Суровый индустриальный интерфейс. Обилие жестких прямых линий (4px), техническая разметка. Очень яркие сигнальные маркеры оранжевого цвета.'
  },

  // === ВАРИАНТ 11: Скандинавский «Лёд» (Nordic Ice) ===
  variant_11_nordic_ice: {
    id: 'variant_11_nordic_ice',
    name: 'Nordic Ice Light',
    brightness: 'light',
    baseStyles: {
      background: '#F3F7FA',
      panelBackground: 'rgba(255, 255, 255, 0.92)',
      border: '1px solid #DCE6ED',
      borderRadius: '10px',
      boxShadow: '0 4px 30px rgba(162, 189, 209, 0.18)',
      backdropFilter: 'blur(8px)',
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'
    },
    colors: {
      primary: '#1A56A6',
      secondary: '#3B82F6',
      success: '#10B981',
      accent: '#E11D48',
      textMain: '#1E293B',
      textMuted: '#64748B'
    },
    cadZone: {
      background: '#FFFFFF',
      gridColor: '#EAF1F6',
      activeColor: '#1A56A6'
    },
    directives: 'Легкий скандинавский дизайн с эффектом стеклянных панелей (Glassmorphism). Снежные, ледяные и арктические голубые оттенки.'
  }
};

const STORAGE_ACTIVE_KEY = 'spectool_active_theme_id';
const STORAGE_CUSTOM_KEY = 'spectool_custom_themes';

// Получить кастомные темы пользователя из LocalStorage
export const getCustomThemes = (): ThemeDefinition[] => {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
};

// Сохранить кастомную тему
export const saveCustomTheme = (theme: ThemeDefinition): void => {
  try {
    const list = getCustomThemes().filter((t) => t.id !== theme.id);
    list.push({ ...theme, isCustom: true });
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(list));
  } catch (_) {}
};

// Удалить кастомную тему
export const deleteCustomTheme = (themeId: string): void => {
  try {
    const list = getCustomThemes().filter((t) => t.id !== themeId);
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(list));
  } catch (_) {}
};

// Получить все доступные темы
export const getAllThemes = (): ThemeDefinition[] => {
  const custom = getCustomThemes();
  const builtIn = Object.values(builtInThemes);
  return [...builtIn, ...custom];
};

// Получить текущую активную тему
export const getActiveTheme = (): ThemeDefinition => {
  try {
    const savedId = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (savedId) {
      const all = getAllThemes();
      const found = all.find((t) => t.id === savedId);
      if (found) return found;
    }
  } catch (_) {}
  return builtInThemes.classic_default;
};

// Установить активную тему
export const setActiveTheme = (themeId: string): ThemeDefinition => {
  const all = getAllThemes();
  const theme = all.find((t) => t.id === themeId) || builtInThemes.classic_default;
  try {
    localStorage.setItem(STORAGE_ACTIVE_KEY, theme.id);
  } catch (_) {}
  applyThemeToDocument(theme);
  return theme;
};

// Применить тему к DOM (CSS переменные и data-theme)
export const applyThemeToDocument = (theme: ThemeDefinition): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', theme.brightness);
  root.setAttribute('data-theme-id', theme.id);

  // Установка глобальных CSS переменных
  root.style.setProperty('--app-bg', theme.baseStyles.background);
  root.style.setProperty('--panel-bg', theme.baseStyles.panelBackground);
  root.style.setProperty('--panel-border', theme.baseStyles.border);
  root.style.setProperty('--panel-radius', theme.baseStyles.borderRadius);
  root.style.setProperty('--panel-shadow', theme.baseStyles.boxShadow);
  root.style.setProperty('--app-font', theme.baseStyles.fontFamily);

  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--text-main', theme.colors.textMain);
  root.style.setProperty('--text-muted', theme.colors.textMuted);

  root.style.setProperty('--cad-bg', theme.cadZone.background);
  root.style.setProperty('--cad-grid', theme.cadZone.gridColor);
  root.style.setProperty('--cad-active', theme.cadZone.activeColor);

  document.body.style.backgroundColor = theme.baseStyles.background;
  document.body.style.color = theme.colors.textMain;
  document.body.style.fontFamily = theme.baseStyles.fontFamily;
};

