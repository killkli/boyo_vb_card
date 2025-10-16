// User profile customization options

export const AVATAR_OPTIONS = [
  // 動物類
  '🦁', '🐼', '🐨', '🐯', '🦊', '🐸', '🐙', '🦄',
  '🐱', '🐶', '🐰', '🐻', '🐷', '🐵', '🐔', '🐧',

  // 物品類
  '🚀', '⚽', '🎨', '📚', '🎮', '🌈', '⭐', '🎵',
  '🎯', '🏆', '💎', '🎪', '🎭', '🎸', '🎬', '🎤',

  // 食物類
  '🍎', '🍕', '🍦', '🍰', '🍔', '🍪', '🧁', '🍓',
] as const;

export interface ThemeColor {
  name: string;
  value: string;
  emoji: string;
}

export const THEME_COLORS: ThemeColor[] = [
  { name: '熱情紅', value: '#EF4444', emoji: '🔴' },
  { name: '活力橙', value: '#F97316', emoji: '🟠' },
  { name: '陽光黃', value: '#EAB308', emoji: '🟡' },
  { name: '清新綠', value: '#22C55E', emoji: '🟢' },
  { name: '天空藍', value: '#3B82F6', emoji: '🔵' },
  { name: '夢幻紫', value: '#A855F7', emoji: '🟣' },
  { name: '沉穩棕', value: '#92400E', emoji: '🟤' },
  { name: '經典黑', value: '#1F2937', emoji: '⚫' },
];

export const DEFAULT_AVATAR = AVATAR_OPTIONS[0];
export const DEFAULT_THEME_COLOR = THEME_COLORS[4]; // 天空藍

export const MAX_PROFILES = 10; // 最多 10 個用戶檔案
export const MAX_NAME_LENGTH = 12; // 暱稱最大長度
