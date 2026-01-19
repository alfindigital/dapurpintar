import { describe, it, expect } from 'vitest';
import {
  isValidFavoriteEntry,
  isValidHistoryEntry,
  isValidCustomFood,
  isValidNutritionEntry,
  isValidDailyNutrition,
  isValidFamilyMember,
  isValidUserProfile,
  isValidDisplaySettings,
  isValidWaterTrackingData,
  isValidDailyWaterRecord,
  isValidStringArray,
  isValidReminderSettings,
  isValidWeightEntry,
  isValidMealSlot,
  isValidWeeklyMealPlan,
  isValidMealPlanTemplate,
} from './validation';

describe('isValidFavoriteEntry', () => {
  it('returns true for valid favorite entry', () => {
    const valid = {
      id: 'test-id',
      timestamp: 1234567890,
      recipe: { nama: 'Nasi Goreng' },
    };
    expect(isValidFavoriteEntry(valid)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidFavoriteEntry(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidFavoriteEntry(undefined)).toBe(false);
  });

  it('returns false for missing id', () => {
    const invalid = { timestamp: 1234567890, recipe: { nama: 'Test' } };
    expect(isValidFavoriteEntry(invalid)).toBe(false);
  });

  it('returns false for non-string id', () => {
    const invalid = { id: 123, timestamp: 1234567890, recipe: { nama: 'Test' } };
    expect(isValidFavoriteEntry(invalid)).toBe(false);
  });

  it('returns false for null recipe', () => {
    const invalid = { id: 'test', timestamp: 1234567890, recipe: null };
    expect(isValidFavoriteEntry(invalid)).toBe(false);
  });

  it('returns false for recipe without nama', () => {
    const invalid = { id: 'test', timestamp: 1234567890, recipe: { other: 'field' } };
    expect(isValidFavoriteEntry(invalid)).toBe(false);
  });
});

describe('isValidHistoryEntry', () => {
  it('returns true for valid history entry', () => {
    const valid = { id: 'test-id', timestamp: 1234567890, data: { resep: [] } };
    expect(isValidHistoryEntry(valid)).toBe(true);
  });

  it('returns false for missing data object', () => {
    const invalid = { id: 'test', timestamp: 1234567890, data: null };
    expect(isValidHistoryEntry(invalid)).toBe(false);
  });

  it('returns false for non-number timestamp', () => {
    const invalid = { id: 'test', timestamp: 'not-a-number', data: {} };
    expect(isValidHistoryEntry(invalid)).toBe(false);
  });
});

describe('isValidCustomFood', () => {
  it('returns true for valid custom food', () => {
    const valid = {
      id: 'custom-123',
      nama: 'Test Food',
      kategori: 'lauk',
      kalori: 100,
      protein: 10,
      karbohidrat: 20,
      lemak: 5,
      porsi: '1 porsi',
      isCustom: true,
      createdAt: 1234567890,
    };
    expect(isValidCustomFood(valid)).toBe(true);
  });

  it('returns false if isCustom is not true', () => {
    const invalid = {
      id: 'custom-123',
      nama: 'Test',
      kategori: 'lauk',
      kalori: 100,
      protein: 10,
      karbohidrat: 20,
      lemak: 5,
      porsi: '1 porsi',
      isCustom: false,
      createdAt: 1234567890,
    };
    expect(isValidCustomFood(invalid)).toBe(false);
  });

  it('returns false for missing required numeric fields', () => {
    const invalid = {
      id: 'custom-123',
      nama: 'Test',
      kategori: 'lauk',
      kalori: 'not-a-number',
      protein: 10,
      karbohidrat: 20,
      lemak: 5,
      porsi: '1 porsi',
      isCustom: true,
      createdAt: 1234567890,
    };
    expect(isValidCustomFood(invalid)).toBe(false);
  });

  it('returns false for empty object', () => {
    expect(isValidCustomFood({})).toBe(false);
  });
});

describe('isValidNutritionEntry', () => {
  it('returns true for valid nutrition entry', () => {
    const valid = {
      id: 'entry-123',
      nama: 'Breakfast',
      kalori: 350,
      protein: 15,
      karbohidrat: 40,
      lemak: 10,
      waktu: 'pagi',
      timestamp: 1234567890,
    };
    expect(isValidNutritionEntry(valid)).toBe(true);
  });

  it('returns false for missing waktu', () => {
    const invalid = {
      id: 'entry-123',
      nama: 'Breakfast',
      kalori: 350,
      protein: 15,
      karbohidrat: 40,
      lemak: 10,
      timestamp: 1234567890,
    };
    expect(isValidNutritionEntry(invalid)).toBe(false);
  });
});

describe('isValidDailyNutrition', () => {
  it('returns true for valid daily nutrition', () => {
    const valid = {
      date: '2024-01-01',
      entries: [],
      totalKalori: 2000,
      totalProtein: 50,
      totalKarbohidrat: 250,
      totalLemak: 65,
    };
    expect(isValidDailyNutrition(valid)).toBe(true);
  });

  it('returns false for non-array entries', () => {
    const invalid = {
      date: '2024-01-01',
      entries: 'not-an-array',
      totalKalori: 2000,
      totalProtein: 50,
      totalKarbohidrat: 250,
      totalLemak: 65,
    };
    expect(isValidDailyNutrition(invalid)).toBe(false);
  });
});

describe('isValidFamilyMember', () => {
  it('returns true for valid family member', () => {
    const valid = {
      id: 'member-123',
      nama: 'John',
      hubungan: 'anak',
      usia: 10,
      kategoriUsia: 'anak',
      kondisiKhusus: [],
    };
    expect(isValidFamilyMember(valid)).toBe(true);
  });

  it('returns false for non-array kondisiKhusus', () => {
    const invalid = {
      id: 'member-123',
      nama: 'John',
      hubungan: 'anak',
      usia: 10,
      kategoriUsia: 'anak',
      kondisiKhusus: 'not-an-array',
    };
    expect(isValidFamilyMember(invalid)).toBe(false);
  });
});

describe('isValidUserProfile', () => {
  it('returns true for valid user profile', () => {
    const valid = {
      nama: 'Test User',
      usia: 30,
      status: 'single',
      anggotaKeluarga: [],
    };
    expect(isValidUserProfile(valid)).toBe(true);
  });

  it('returns false for non-array anggotaKeluarga', () => {
    const invalid = {
      nama: 'Test User',
      usia: 30,
      status: 'single',
      anggotaKeluarga: {},
    };
    expect(isValidUserProfile(invalid)).toBe(false);
  });
});

describe('isValidDisplaySettings', () => {
  it('returns true for valid display settings', () => {
    const valid = {
      fontSize: 'normal',
      highContrast: false,
      colorTheme: 'green',
      profile: 'default',
    };
    expect(isValidDisplaySettings(valid)).toBe(true);
  });

  it('returns false for invalid fontSize', () => {
    const invalid = {
      fontSize: 'extra-large',
      highContrast: false,
      colorTheme: 'green',
      profile: 'default',
    };
    expect(isValidDisplaySettings(invalid)).toBe(false);
  });

  it('returns false for invalid colorTheme', () => {
    const invalid = {
      fontSize: 'normal',
      highContrast: false,
      colorTheme: 'red',
      profile: 'default',
    };
    expect(isValidDisplaySettings(invalid)).toBe(false);
  });

  it('returns false for invalid profile', () => {
    const invalid = {
      fontSize: 'normal',
      highContrast: false,
      colorTheme: 'green',
      profile: 'invalid-profile',
    };
    expect(isValidDisplaySettings(invalid)).toBe(false);
  });
});

describe('isValidWaterTrackingData', () => {
  it('returns true for valid water tracking data', () => {
    const valid = {
      date: '2024-01-01',
      glasses: 5,
      timestamps: ['2024-01-01T08:00:00Z', '2024-01-01T10:00:00Z'],
    };
    expect(isValidWaterTrackingData(valid)).toBe(true);
  });

  it('returns false for non-string timestamps', () => {
    const invalid = {
      date: '2024-01-01',
      glasses: 5,
      timestamps: [123, 456],
    };
    expect(isValidWaterTrackingData(invalid)).toBe(false);
  });

  it('returns false for non-array timestamps', () => {
    const invalid = {
      date: '2024-01-01',
      glasses: 5,
      timestamps: 'not-an-array',
    };
    expect(isValidWaterTrackingData(invalid)).toBe(false);
  });
});

describe('isValidDailyWaterRecord', () => {
  it('returns true for valid daily water record', () => {
    const valid = { date: '2024-01-01', glasses: 8, target: 8 };
    expect(isValidDailyWaterRecord(valid)).toBe(true);
  });

  it('returns false for missing target', () => {
    const invalid = { date: '2024-01-01', glasses: 8 };
    expect(isValidDailyWaterRecord(invalid)).toBe(false);
  });
});

describe('isValidStringArray', () => {
  it('returns true for valid string array', () => {
    expect(isValidStringArray(['a', 'b', 'c'])).toBe(true);
  });

  it('returns true for empty array', () => {
    expect(isValidStringArray([])).toBe(true);
  });

  it('returns false for array with non-strings', () => {
    expect(isValidStringArray(['a', 1, 'c'])).toBe(false);
  });

  it('returns false for non-array', () => {
    expect(isValidStringArray('not-an-array')).toBe(false);
  });
});

describe('isValidReminderSettings', () => {
  it('returns true for valid reminder settings', () => {
    const valid = {
      enabled: true,
      intervalMinutes: 60,
      startHour: 8,
      endHour: 22,
      sound: true,
    };
    expect(isValidReminderSettings(valid)).toBe(true);
  });

  it('returns false for non-boolean enabled', () => {
    const invalid = {
      enabled: 'true',
      intervalMinutes: 60,
      startHour: 8,
      endHour: 22,
      sound: true,
    };
    expect(isValidReminderSettings(invalid)).toBe(false);
  });
});

describe('isValidWeightEntry', () => {
  it('returns true for valid weight entry', () => {
    const valid = { id: 'entry-123', date: '2024-01-01', weight: 70.5 };
    expect(isValidWeightEntry(valid)).toBe(true);
  });

  it('returns true for weight entry with optional note', () => {
    const valid = { id: 'entry-123', date: '2024-01-01', weight: 70.5, note: 'After workout' };
    expect(isValidWeightEntry(valid)).toBe(true);
  });

  it('returns false for non-number weight', () => {
    const invalid = { id: 'entry-123', date: '2024-01-01', weight: '70.5' };
    expect(isValidWeightEntry(invalid)).toBe(false);
  });

  it('returns false for non-string note', () => {
    const invalid = { id: 'entry-123', date: '2024-01-01', weight: 70.5, note: 123 };
    expect(isValidWeightEntry(invalid)).toBe(false);
  });
});

describe('isValidMealSlot', () => {
  it('returns true for valid meal slot', () => {
    const valid = {
      id: 'slot-123',
      dayIndex: 0,
      mealTime: 'sarapan',
      recipe: null,
      isLocked: false,
      isSkipped: false,
    };
    expect(isValidMealSlot(valid)).toBe(true);
  });

  it('returns true for meal slot with recipe object', () => {
    const valid = {
      id: 'slot-123',
      dayIndex: 0,
      mealTime: 'makan_siang',
      recipe: { nama: 'Test Recipe' },
      isLocked: true,
      isSkipped: false,
    };
    expect(isValidMealSlot(valid)).toBe(true);
  });

  it('returns false for invalid mealTime', () => {
    const invalid = {
      id: 'slot-123',
      dayIndex: 0,
      mealTime: 'lunch',
      recipe: null,
      isLocked: false,
      isSkipped: false,
    };
    expect(isValidMealSlot(invalid)).toBe(false);
  });

  it('returns false for non-number dayIndex', () => {
    const invalid = {
      id: 'slot-123',
      dayIndex: 'zero',
      mealTime: 'sarapan',
      recipe: null,
      isLocked: false,
      isSkipped: false,
    };
    expect(isValidMealSlot(invalid)).toBe(false);
  });
});

describe('isValidWeeklyMealPlan', () => {
  it('returns true for valid weekly meal plan', () => {
    const valid = {
      id: 'plan-123',
      weekStart: '2024-01-01T00:00:00Z',
      slots: [
        {
          id: 'slot-1',
          dayIndex: 0,
          mealTime: 'sarapan',
          recipe: null,
          isLocked: false,
          isSkipped: false,
        },
      ],
      generatedAt: '2024-01-01T00:00:00Z',
    };
    expect(isValidWeeklyMealPlan(valid)).toBe(true);
  });

  it('returns false for invalid slot in slots array', () => {
    const invalid = {
      id: 'plan-123',
      weekStart: '2024-01-01T00:00:00Z',
      slots: [{ id: 'invalid' }],
      generatedAt: '2024-01-01T00:00:00Z',
    };
    expect(isValidWeeklyMealPlan(invalid)).toBe(false);
  });

  it('returns false for non-array slots', () => {
    const invalid = {
      id: 'plan-123',
      weekStart: '2024-01-01T00:00:00Z',
      slots: 'not-an-array',
      generatedAt: '2024-01-01T00:00:00Z',
    };
    expect(isValidWeeklyMealPlan(invalid)).toBe(false);
  });
});

describe('isValidMealPlanTemplate', () => {
  it('returns true for valid meal plan template', () => {
    const valid = {
      id: 'template-123',
      name: 'My Template',
      slots: [],
      createdAt: '2024-01-01T00:00:00Z',
    };
    expect(isValidMealPlanTemplate(valid)).toBe(true);
  });

  it('returns true for template with optional description', () => {
    const valid = {
      id: 'template-123',
      name: 'My Template',
      description: 'A test template',
      slots: [],
      createdAt: '2024-01-01T00:00:00Z',
    };
    expect(isValidMealPlanTemplate(valid)).toBe(true);
  });

  it('returns false for missing name', () => {
    const invalid = {
      id: 'template-123',
      slots: [],
      createdAt: '2024-01-01T00:00:00Z',
    };
    expect(isValidMealPlanTemplate(invalid)).toBe(false);
  });
});

// Edge cases
describe('Edge Cases', () => {
  it('handles primitive types gracefully', () => {
    expect(isValidFavoriteEntry('string')).toBe(false);
    expect(isValidFavoriteEntry(123)).toBe(false);
    expect(isValidFavoriteEntry(true)).toBe(false);
    expect(isValidFavoriteEntry([])).toBe(false);
  });

  it('handles deeply nested invalid data', () => {
    const nestedInvalid = {
      id: 'test',
      timestamp: 123,
      recipe: {
        nama: 'Valid',
        nested: {
          deep: {
            invalid: null,
          },
        },
      },
    };
    // Should still validate if required fields are present
    expect(isValidFavoriteEntry(nestedInvalid)).toBe(true);
  });

  it('handles special number values', () => {
    const withNaN = { id: 'test', timestamp: NaN, recipe: { nama: 'Test' } };
    // NaN is still typeof 'number'
    expect(isValidFavoriteEntry(withNaN)).toBe(true);

    const withInfinity = { id: 'test', timestamp: Infinity, recipe: { nama: 'Test' } };
    expect(isValidFavoriteEntry(withInfinity)).toBe(true);
  });

  it('handles empty strings', () => {
    const withEmptyStrings = {
      id: '',
      timestamp: 123,
      recipe: { nama: '' },
    };
    // Empty strings are still valid strings
    expect(isValidFavoriteEntry(withEmptyStrings)).toBe(true);
  });
});
