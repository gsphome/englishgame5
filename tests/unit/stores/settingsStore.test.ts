import { describe, it, expect } from 'vitest';
import { useSettingsStore } from '../../../src/stores/settingsStore';

describe('settingsStore', () => {
  it('should have default categories with 10 items', () => {
    const store = useSettingsStore.getState();
    
    expect(store.categories).toHaveLength(10);
    expect(store.categories).toContain('Vocabulary');
    expect(store.categories).toContain('Grammar');
    expect(store.categories).toContain('PhrasalVerbs');
    expect(store.categories).toContain('Idioms');
    expect(store.categories).toContain('Pronunciation');
    expect(store.categories).toContain('Listening');
    expect(store.categories).toContain('Reading');
    expect(store.categories).toContain('Writing');
    expect(store.categories).toContain('Speaking');
    expect(store.categories).toContain('Review');
  });

  it('should have proper store structure', () => {
    const store = useSettingsStore.getState();
    
    // Check that all required properties exist
    expect(store).toHaveProperty('theme');
    expect(store).toHaveProperty('language');
    expect(store).toHaveProperty('level');
    expect(store).toHaveProperty('categories');
    expect(store).toHaveProperty('gameSettings');
    expect(store).toHaveProperty('maxLimits');
    
    // Check that all actions exist
    expect(store).toHaveProperty('setTheme');
    expect(store).toHaveProperty('setLanguage');
    expect(store).toHaveProperty('setLevel');
    expect(store).toHaveProperty('setCategories');
    expect(store).toHaveProperty('setGameSetting');
    expect(store).toHaveProperty('updateMaxLimits');
  });

  it('should allow updating categories', () => {
    const store = useSettingsStore.getState();
    const newCategories = ['Vocabulary', 'Grammar', 'Reading'];
    
    store.setCategories(newCategories);
    
    const updatedStore = useSettingsStore.getState();
    expect(updatedStore.categories).toEqual(newCategories);
  });
});