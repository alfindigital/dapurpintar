import { useState, useEffect, useCallback } from "react";

export type FontSize = "small" | "normal" | "large";
export type ColorTheme = "green" | "blue" | "orange" | "purple";
export type AccessibilityProfile = "default" | "lansia" | "low-vision";

export interface DisplaySettings {
  fontSize: FontSize;
  highContrast: boolean;
  colorTheme: ColorTheme;
  profile: AccessibilityProfile;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  fontSize: "normal",
  highContrast: false,
  colorTheme: "green",
  profile: "default",
};

// Profile presets
const PROFILE_PRESETS: Record<AccessibilityProfile, Omit<DisplaySettings, "profile">> = {
  default: {
    fontSize: "normal",
    highContrast: false,
    colorTheme: "green",
  },
  lansia: {
    fontSize: "large",
    highContrast: true,
    colorTheme: "blue",
  },
  "low-vision": {
    fontSize: "large",
    highContrast: true,
    colorTheme: "orange",
  },
};

const STORAGE_KEY = "display_settings";

const VALID_FONT_SIZES: FontSize[] = ["small", "normal", "large"];
const VALID_COLOR_THEMES: ColorTheme[] = ["green", "blue", "orange", "purple"];
const VALID_PROFILES: AccessibilityProfile[] = ["default", "lansia", "low-vision"];

// Validate display settings
function isValidDisplaySettings(data: unknown): data is DisplaySettings {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    VALID_FONT_SIZES.includes(d.fontSize as FontSize) &&
    typeof d.highContrast === 'boolean' &&
    VALID_COLOR_THEMES.includes(d.colorTheme as ColorTheme) &&
    VALID_PROFILES.includes(d.profile as AccessibilityProfile)
  );
}

// Safe parse with validation
function safeLoadDisplaySettings(): DisplaySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(saved);
    if (!isValidDisplaySettings(parsed)) return DEFAULT_SETTINGS;
    
    return parsed;
  } catch {
    console.warn('Failed to parse display settings from localStorage');
    return DEFAULT_SETTINGS;
  }
}

export function useDisplaySettings() {
  const [settings, setSettings] = useState<DisplaySettings>(() => safeLoadDisplaySettings());

  const applySettings = useCallback((s: DisplaySettings) => {
    const html = document.documentElement;

    // Remove all font size classes
    html.classList.remove("font-small", "font-normal", "font-large");
    html.classList.add(`font-${s.fontSize}`);

    // Toggle high contrast
    if (s.highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }

    // Remove all theme classes and add current
    html.classList.remove("theme-green", "theme-blue", "theme-orange", "theme-purple");
    html.classList.add(`theme-${s.colorTheme}`);
  }, []);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, applySettings]);

  const setFontSize = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize, profile: "default" }));
  };

  const setHighContrast = (highContrast: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast, profile: "default" }));
  };

  const setColorTheme = (colorTheme: ColorTheme) => {
    setSettings((prev) => ({ ...prev, colorTheme, profile: "default" }));
  };

  const setProfile = (profile: AccessibilityProfile) => {
    const preset = PROFILE_PRESETS[profile];
    setSettings({ ...preset, profile });
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    setFontSize,
    setHighContrast,
    setColorTheme,
    setProfile,
    resetToDefaults,
    profiles: PROFILE_PRESETS,
  };
}
