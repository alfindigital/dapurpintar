import { useState, useEffect, useCallback } from "react";

export type FontSize = "small" | "normal" | "large";
export type ColorTheme = "green" | "blue" | "orange" | "purple";

export interface DisplaySettings {
  fontSize: FontSize;
  highContrast: boolean;
  colorTheme: ColorTheme;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  fontSize: "normal",
  highContrast: false,
  colorTheme: "green",
};

const STORAGE_KEY = "display_settings";

export function useDisplaySettings() {
  const [settings, setSettings] = useState<DisplaySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

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
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  const setHighContrast = (highContrast: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast }));
  };

  const setColorTheme = (colorTheme: ColorTheme) => {
    setSettings((prev) => ({ ...prev, colorTheme }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    setFontSize,
    setHighContrast,
    setColorTheme,
    resetToDefaults,
  };
}
