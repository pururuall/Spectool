import { UserSettings } from '../types';

const STORAGE_KEY = 'spectool_user_settings_v1';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultProjectCode: 'ПРОЕКТ',
  defaultModuleName: 'Новый модуль',
  defaultWidth: 1000,
  defaultHeight: 2500,
  defaultColors: [], // Чистая палитра по умолчанию, чтобы пользователь не удалял чужие цвета!
  defaultPrimaryColor: '',
  defaultOrderStart: 1,
  defaultDimensionMode: 'selection_inputs',
  defaultNamingPattern: '{project} {article}-{axialLength}-{order}'
};

export const getUserSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_SETTINGS,
      ...parsed
    };
  } catch (e) {
    console.error('Error loading user settings:', e);
    return { ...DEFAULT_USER_SETTINGS };
  }
};

export const saveUserSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving user settings:', e);
  }
};

export const resetUserSettings = (): UserSettings => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting user settings:', e);
  }
  return { ...DEFAULT_USER_SETTINGS };
};

