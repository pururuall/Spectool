import { CellFillItem, LineSegment, ProfileBinding, StandaloneItem, DependencyRule, ModuleModel } from '../types';

export type ClipboardType = 'fill' | 'line' | 'profile' | 'standalone' | 'dependencies' | 'module';

export interface ClipboardPayload {
  type: ClipboardType;
  title: string;
  data: any;
  copiedAt: number;
}

const CLIPBOARD_STORAGE_KEY = 'spectool_universal_clipboard_v1';

export function copyToClipboard(type: ClipboardType, title: string, data: any): void {
  try {
    const payload: ClipboardPayload = {
      type,
      title,
      data: JSON.parse(JSON.stringify(data)),
      copiedAt: Date.now()
    };
    localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to write to clipboard', e);
  }
}

export function getFromClipboard(): ClipboardPayload | null {
  try {
    const raw = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read from clipboard', e);
    return null;
  }
}

export function clearClipboard(): void {
  try {
    localStorage.removeItem(CLIPBOARD_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear clipboard', e);
  }
}

