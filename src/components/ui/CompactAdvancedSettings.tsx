import React, { useState, useEffect } from 'react';
import { X, Settings, Save, RotateCcw, Gamepad2, Palette, Wrench } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import { validateGameSettings } from '../../utils/inputValidation';
import '../../styles/components/compact-advanced-settings.css';
import '../../styles/components/modal-buttons.css';

interface CompactAdvancedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompactAdvancedSettings: React.FC<CompactAdvancedSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    theme,
    language,
    level,
    developmentMode,
    categories,
    gameSettings,
    setTheme,
    setLanguage,
    setLevel,
    setDevelopmentMode,
    setCategories,
    setGameSetting,
  } = useSettingsStore();

  const { t } = useTranslation(language);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'games' | 'categories'>('general');

  // Local state for editing
  const [localTheme, setLocalTheme] = useState(theme);
  const [localLanguage, setLocalLanguage] = useState(language);
  const [localLevel, setLocalLevel] = useState(level);
  const [localDevelopmentMode, setLocalDevelopmentMode] = useState(developmentMode);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localGameSettings, setLocalGameSettings] = useState(gameSettings);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalTheme(theme);
      setLocalLanguage(language);
      setLocalLevel(level);
      setLocalDevelopmentMode(developmentMode);
      setLocalCategories(categories);
      setLocalGameSettings(gameSettings);
      setHasChanges(false);
    }
  }, [isOpen, theme, language, level, developmentMode, categories, gameSettings]);

  // Check for changes
  useEffect(() => {
    const changed =
      localTheme !== theme ||
      localLanguage !== language ||
      localLevel !== level ||
      localDevelopmentMode !== developmentMode ||
      JSON.stringify(localCategories) !== JSON.stringify(categories) ||
      JSON.stringify(localGameSettings) !== JSON.stringify(gameSettings);
    setHasChanges(changed);
  }, [
    localTheme,
    localLanguage,
    localLevel,
    localDevelopmentMode,
    localCategories,
    localGameSettings,
    theme,
    language,
    level,
    developmentMode,
    categories,
    gameSettings,
  ]);

  const handleSave = () => {
    // Validate all settings before saving
    const validatedSettings = validateGameSettings(localGameSettings);

    // Apply all changes
    setTheme(localTheme);
    setLanguage(localLanguage);
    setLevel(localLevel);
    setDevelopmentMode(localDevelopmentMode);
    setCategories(localCategories);

    // Apply validated game settings
    Object.entries(validatedSettings).forEach(([mode, settings]) => {
      Object.entries(settings as Record<string, unknown>).forEach(([setting, value]) => {
        setGameSetting(mode as any, setting, value as number);
      });
    });

    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setLocalTheme(theme);
    setLocalLanguage(language);
    setLocalLevel(level);
    setLocalDevelopmentMode(developmentMode);
    setLocalCategories(categories);
    setLocalGameSettings(gameSettings);
    setHasChanges(false);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    let newCategories;
    if (checked) {
      newCategories = [...localCategories, category];
    } else {
      newCategories = localCategories.filter(c => c !== category);
    }

    // UX: If no categories selected, auto-select all for consistency
    if (newCategories.length === 0) {
      newCategories = [...allCategories];
    }

    setLocalCategories(newCategories);
  };

  const handleGameSettingChange = (mode: string, setting: string, value: number) => {
    setLocalGameSettings({
      ...localGameSettings,
      [mode]: {
        ...localGameSettings[mode as keyof typeof localGameSettings],
        [setting]: value,
      },
    });
  };

  if (!isOpen) return null;

  const allCategories = ['Vocabulary', 'Grammar', 'PhrasalVerbs', 'Idioms'];
  const categoryLabels = {
    Vocabulary: t('settings.vocabulary', 'Vocabulario'),
    Grammar: t('settings.grammar', 'Gramática'),
    PhrasalVerbs: t('settings.phrasalVerbs', 'Phrasal Verbs'),
    Idioms: t('settings.idioms', 'Modismos'),
  };

  return (
    <div className="compact-settings">
      <div className="compact-settings__container">
        <div className="compact-settings__header">
          <div className="compact-settings__title-section">
            <Settings className="compact-settings__icon" />
            <h2 className="compact-settings__title">
              {t('settings.advancedSettings', 'Configuración Avanzada')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="modal__close-btn"
            aria-label={t('common.close')}
          >
            <X className="modal__close-icon" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="compact-settings__tabs">
          <button
            onClick={() => setActiveTab('general')}
            className={`compact-settings__tab ${activeTab === 'general' ? 'compact-settings__tab--active' : ''}`}
          >
            <Palette className="compact-settings__tab-icon" />
            <span className="compact-settings__tab-title">{t('settings.general', 'General')}</span>
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`compact-settings__tab ${activeTab === 'games' ? 'compact-settings__tab--active' : ''}`}
          >
            <Gamepad2 className="compact-settings__tab-icon" />
            <span className="compact-settings__tab-title compact-settings__tab-title--compact">{t('settings.games', 'Games')}</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`compact-settings__tab ${activeTab === 'categories' ? 'compact-settings__tab--active' : ''}`}
          >
            <Wrench className="compact-settings__tab-icon" />
            <span className="compact-settings__tab-title">
              {t('settings.categories', 'Categorías')}
            </span>
          </button>
        </div>

        <div className="compact-settings__content">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="compact-settings__section">
              <div className="compact-settings__fields">
                <div className="compact-settings__field">
                  <label className="compact-settings__label">
                    {t('settings.theme', 'Tema')}
                  </label>
                  <select
                    className="compact-settings__select"
                    value={localTheme}
                    onChange={e => setLocalTheme(e.target.value as 'light' | 'dark')}
                  >
                    <option value="light">☀️ {t('settings.light', 'Claro')}</option>
                    <option value="dark">🌙 {t('settings.dark', 'Oscuro')}</option>
                  </select>
                </div>

                <div className="compact-settings__field">
                  <label className="compact-settings__label">
                    {t('settings.language', 'Idioma')}
                  </label>
                  <select
                    className="compact-settings__select"
                    value={localLanguage}
                    onChange={e => setLocalLanguage(e.target.value as 'en' | 'es')}
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                  </select>
                </div>

                <div className="compact-settings__field">
                  <label className="compact-settings__label">
                    {t('settings.level', 'Nivel')}
                  </label>
                  <select
                    className="compact-settings__select"
                    value={localLevel}
                    onChange={e => setLocalLevel(e.target.value as any)}
                  >
                    <option value="all">🌟 {t('settings.all', 'Todos')}</option>
                    <option value="a1">🟢 A1</option>
                    <option value="a2">🟡 A2</option>
                    <option value="b1">🟠 B1</option>
                    <option value="b2">🔴 B2</option>
                    <option value="c1">🟣 C1</option>
                    <option value="c2">⚫ C2</option>
                  </select>
                </div>

                <div className="compact-settings__field compact-settings__field--dev">
                  <label className="compact-settings__label compact-settings__label--dev">
                    🔧 {t('settings.developmentMode', 'Modo Desarrollo')}
                  </label>
                  <div className="compact-settings__toggle-container">
                    <input
                      type="checkbox"
                      id="developmentMode"
                      className="compact-settings__toggle"
                      checked={localDevelopmentMode}
                      onChange={e => setLocalDevelopmentMode(e.target.checked)}
                    />
                    <label htmlFor="developmentMode" className="compact-settings__toggle-label">
                      <span className="compact-settings__toggle-text">
                        {localDevelopmentMode
                          ? t('settings.enabled', 'Habilitado')
                          : t('settings.disabled', 'Deshabilitado')}
                      </span>
                    </label>
                  </div>
                  <p className="compact-settings__description compact-settings__description--dev">
                    {t('settings.developmentModeDescription', 'Info adicional para desarrollo')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Games Settings Tab */}
          {activeTab === 'games' && (
            <div className="compact-settings__section">
              <div className="compact-settings__games">
                <div className="compact-settings__game">
                  <label className="compact-settings__game-label">
                    📚 {t('settings.flashcards', 'Flashcards')}
                  </label>
                  <div className="compact-settings__game-controls">
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={localGameSettings.flashcardMode.wordCount || 10}
                      onChange={e =>
                        handleGameSettingChange(
                          'flashcardMode',
                          'wordCount',
                          parseInt(e.target.value)
                        )
                      }
                      className="compact-settings__range"
                    />
                    <span className="compact-settings__range-value">
                      {localGameSettings.flashcardMode.wordCount || 10}
                    </span>
                  </div>
                </div>

                <div className="compact-settings__game">
                  <label className="compact-settings__game-label">
                    ❓ {t('settings.quiz', 'Quiz')}
                  </label>
                  <div className="compact-settings__game-controls">
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={localGameSettings.quizMode.questionCount || 10}
                      onChange={e =>
                        handleGameSettingChange(
                          'quizMode',
                          'questionCount',
                          parseInt(e.target.value)
                        )
                      }
                      className="compact-settings__range"
                    />
                    <span className="compact-settings__range-value">
                      {localGameSettings.quizMode.questionCount || 10}
                    </span>
                  </div>
                </div>

                <div className="compact-settings__game">
                  <label className="compact-settings__game-label">
                    ✏️ {t('settings.completion', 'Completar')}
                  </label>
                  <div className="compact-settings__game-controls">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={localGameSettings.completionMode.itemCount || 10}
                      onChange={e =>
                        handleGameSettingChange(
                          'completionMode',
                          'itemCount',
                          parseInt(e.target.value)
                        )
                      }
                      className="compact-settings__range"
                    />
                    <span className="compact-settings__range-value">
                      {localGameSettings.completionMode.itemCount || 10}
                    </span>
                  </div>
                </div>

                <div className="compact-settings__game">
                  <label className="compact-settings__game-label">
                    🔄 {t('settings.sorting', 'Ordenar')}
                  </label>
                  <div className="compact-settings__game-controls">
                    <input
                      type="range"
                      min="8"
                      max="20"
                      value={localGameSettings.sortingMode.wordCount || 12}
                      onChange={e =>
                        handleGameSettingChange(
                          'sortingMode',
                          'wordCount',
                          parseInt(e.target.value)
                        )
                      }
                      className="compact-settings__range"
                    />
                    <span className="compact-settings__range-value">
                      {localGameSettings.sortingMode.wordCount || 12}
                    </span>
                  </div>
                </div>

                <div className="compact-settings__game">
                  <label className="compact-settings__game-label">
                    🔗 {t('settings.matching', 'Emparejar')}
                  </label>
                  <div className="compact-settings__game-controls">
                    <input
                      type="range"
                      min="4"
                      max="12"
                      value={localGameSettings.matchingMode.wordCount || 6}
                      onChange={e =>
                        handleGameSettingChange(
                          'matchingMode',
                          'wordCount',
                          parseInt(e.target.value)
                        )
                      }
                      className="compact-settings__range"
                    />
                    <span className="compact-settings__range-value">
                      {localGameSettings.matchingMode.wordCount || 6}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="compact-settings__section">
              <div className="compact-settings__categories">
                {allCategories.map(category => (
                  <div key={category} className="compact-settings__category">
                    <input
                      type="checkbox"
                      id={category}
                      checked={localCategories.includes(category)}
                      onChange={e => handleCategoryChange(category, e.target.checked)}
                      className="compact-settings__category-checkbox"
                    />
                    <label htmlFor={category} className="compact-settings__category-label">
                      {category === 'Vocabulary' &&
                        `📚 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                      {category === 'Grammar' &&
                        `📝 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                      {category === 'PhrasalVerbs' &&
                        `🔗 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                      {category === 'Idioms' &&
                        `💭 ${categoryLabels[category as keyof typeof categoryLabels]}`}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Fixed outside scroll area */}
        <div className={`modal__actions ${hasChanges ? 'modal__actions--double' : 'modal__actions--single'}`}>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="modal__btn modal__btn--secondary"
              aria-label={t('settings.reset', 'Restablecer')}
            >
              <RotateCcw className="modal__btn-icon" />
              {t('settings.reset', 'Restablecer')}
            </button>
          )}
          <button
            onClick={hasChanges ? handleSave : onClose}
            className="modal__btn modal__btn--primary"
            aria-label={hasChanges ? t('settings.save', 'Guardar') : t('common.close', 'Cerrar')}
          >
            {hasChanges ? (
              <>
                <Save className="modal__btn-icon" />
                {t('settings.save', 'Guardar')}
              </>
            ) : (
              t('common.close', 'Cerrar')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
