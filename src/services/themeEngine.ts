/**
 * WHO AM I? — Appearance & Theme Engine
 * Controls visual design tokens, preset palettes (including premium Cloud theme),
 * custom theme editing, live previewing, and animation scaling.
 */

import { ThemeTokens, ThemePreset } from '../types';

export const THEME_PRESETS: Record<ThemePreset, ThemeTokens> = {
  // 1. Default Futuristic
  futuristic: {
    name: 'Default Futuristic',
    preset: 'futuristic',
    bgApp: '#090D16',
    bgCard: '#111827',
    bgCardHover: '#1F2937',
    borderCard: '#1E293B',
    textMain: '#F8FAFC',
    textMuted: '#94A3B8',
    textInverted: '#0F172A',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryText: '#FFFFFF',
    primaryLight: 'rgba(99, 102, 241, 0.15)',
    accent: '#06B6D4',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    statusGreen: '#10B981',
    statusYellow: '#F59E0B',
    statusRed: '#EF4444',
    borderRadius: '0.875rem',
    animationIntensity: 'normal',
    uiDensity: 'comfortable',
    isDark: true,
    lyraGlowColor: '#06B6D4',
    lyraWandColor: '#818CF8',
  },

  // 2. Cloud — Premium Warm White + Elegant Brown
  cloud: {
    name: 'Cloud (Warm White & Brown)',
    preset: 'cloud',
    bgApp: '#F8F6F0', // warm off-white / alabaster
    bgCard: '#FFFFFF', // pure soft card surface
    bgCardHover: '#F4EFE6', // subtle warm parchment tint on hover
    borderCard: '#E4DDD3', // elegant warm boundary
    textMain: '#292524', // deep espresso brown charcoal
    textMuted: '#78716C', // warm stone muted
    textInverted: '#FFFFFF',
    primary: '#78350F', // rich elegant deep amber brown
    primaryHover: '#92400E', // warm mahogany hover
    primaryText: '#FFFFFF',
    primaryLight: 'rgba(120, 53, 15, 0.1)',
    accent: '#B45309', // warm gold/copper accent
    accentGlow: 'rgba(180, 83, 9, 0.25)',
    statusGreen: '#15803D',
    statusYellow: '#B45309',
    statusRed: '#B91C1C',
    borderRadius: '1rem',
    animationIntensity: 'normal',
    uiDensity: 'comfortable',
    isDark: false,
    lyraGlowColor: '#D97706', // warm amber fairy glow
    lyraWandColor: '#B45309', // warm burnished wand
  },

  // 3. Midnight — Deep Sapphire & Electric Blue
  midnight: {
    name: 'Midnight',
    preset: 'midnight',
    bgApp: '#080E1A',
    bgCard: '#0F172A',
    bgCardHover: '#1E293B',
    borderCard: '#1E293B',
    textMain: '#F1F5F9',
    textMuted: '#94A3B8',
    textInverted: '#0B0F19',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryText: '#FFFFFF',
    primaryLight: 'rgba(37, 99, 235, 0.15)',
    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.35)',
    statusGreen: '#10B981',
    statusYellow: '#F59E0B',
    statusRed: '#F43F5E',
    borderRadius: '0.75rem',
    animationIntensity: 'normal',
    uiDensity: 'comfortable',
    isDark: true,
    lyraGlowColor: '#38BDF8',
    lyraWandColor: '#60A5FA',
  },

  // 4. Minimal Light — Crisp Porcelain & Slate
  'minimal-light': {
    name: 'Minimal Light',
    preset: 'minimal-light',
    bgApp: '#FAFAFA',
    bgCard: '#FFFFFF',
    bgCardHover: '#F1F5F9',
    borderCard: '#E2E8F0',
    textMain: '#0F172A',
    textMuted: '#64748B',
    textInverted: '#FFFFFF',
    primary: '#0F172A',
    primaryHover: '#334155',
    primaryText: '#FFFFFF',
    primaryLight: 'rgba(15, 23, 42, 0.08)',
    accent: '#2563EB',
    accentGlow: 'rgba(37, 99, 235, 0.2)',
    statusGreen: '#16A34A',
    statusYellow: '#D97706',
    statusRed: '#DC2626',
    borderRadius: '0.625rem',
    animationIntensity: 'minimal',
    uiDensity: 'compact',
    isDark: false,
    lyraGlowColor: '#3B82F6',
    lyraWandColor: '#1E293B',
  },

  // 5. Deep Space / Dark — Void Black & Starlight
  'deep-space': {
    name: 'Deep Space / Dark',
    preset: 'deep-space',
    bgApp: '#030712',
    bgCard: '#0B0F19',
    bgCardHover: '#111827',
    borderCard: '#1F2937',
    textMain: '#F9FAFB',
    textMuted: '#9CA3AF',
    textInverted: '#030712',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    primaryText: '#FFFFFF',
    primaryLight: 'rgba(139, 92, 246, 0.15)',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    statusGreen: '#10B981',
    statusYellow: '#FBBF24',
    statusRed: '#F87171',
    borderRadius: '1rem',
    animationIntensity: 'enhanced',
    uiDensity: 'spacious',
    isDark: true,
    lyraGlowColor: '#A78BFA',
    lyraWandColor: '#C084FC',
  },

  // Custom fallback
  custom: {
    name: 'Custom Theme',
    preset: 'custom',
    bgApp: '#13111C',
    bgCard: '#1C1929',
    bgCardHover: '#2A253D',
    borderCard: '#312B47',
    textMain: '#FDFCFE',
    textMuted: '#A7A1B8',
    textInverted: '#13111C',
    primary: '#EC4899',
    primaryHover: '#DB2777',
    primaryText: '#FFFFFF',
    primaryLight: 'rgba(236, 72, 153, 0.15)',
    accent: '#8B5CF6',
    accentGlow: 'rgba(139, 92, 246, 0.35)',
    statusGreen: '#10B981',
    statusYellow: '#F59E0B',
    statusRed: '#EF4444',
    borderRadius: '0.875rem',
    animationIntensity: 'normal',
    uiDensity: 'comfortable',
    isDark: true,
    lyraGlowColor: '#EC4899',
    lyraWandColor: '#F472B6',
  },
};

const THEME_STORAGE_KEY = 'whoami_theme_config';

export function getStoredTheme(): ThemeTokens {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.preset && THEME_PRESETS[parsed.preset as ThemePreset]) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load stored theme:', err);
  }
  // Default to Futuristic or Cloud
  return THEME_PRESETS.cloud;
}

export function saveTheme(tokens: ThemeTokens) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(tokens));
    applyThemeToDOM(tokens);
  } catch (err) {
    console.error('Failed to persist theme:', err);
  }
}

export function applyThemeToDOM(theme: ThemeTokens) {
  const root = document.documentElement;
  
  root.style.setProperty('--bg-app', theme.bgApp);
  root.style.setProperty('--bg-card', theme.bgCard);
  root.style.setProperty('--bg-card-hover', theme.bgCardHover);
  root.style.setProperty('--border-card', theme.borderCard);
  root.style.setProperty('--text-main', theme.textMain);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--text-inverted', theme.textInverted);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-hover', theme.primaryHover);
  root.style.setProperty('--primary-text', theme.primaryText);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-glow', theme.accentGlow);
  root.style.setProperty('--status-green', theme.statusGreen);
  root.style.setProperty('--status-yellow', theme.statusYellow);
  root.style.setProperty('--status-red', theme.statusRed);
  root.style.setProperty('--border-radius', theme.borderRadius);
  root.style.setProperty('--lyra-glow', theme.lyraGlowColor);
  root.style.setProperty('--lyra-wand', theme.lyraWandColor);

  root.setAttribute('data-theme', theme.preset);
  root.setAttribute('data-dark', theme.isDark ? 'true' : 'false');
  root.setAttribute('data-animation', theme.animationIntensity);
  root.setAttribute('data-density', theme.uiDensity);

  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
