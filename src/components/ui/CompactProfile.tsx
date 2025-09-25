import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Save } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import '../../styles/components/compact-profile.css';
import '../../styles/components/modal-buttons.css';

// Base schema for type inference
const _baseProfileSchema = z.object({
  name: z.string().min(2),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  preferences: z.object({
    language: z.enum(['en', 'es']),
    dailyGoal: z.number().min(1).max(100),
    categories: z.array(z.string()).min(1),
    difficulty: z.number().min(1).max(5),
    notifications: z.boolean(),
  }),
});

// Create schema with dynamic error messages
const createProfileSchema = (t: (_key: string, _defaultValue?: string) => string) =>
  z.object({
    name: z
      .string()
      .min(2, t('profile.nameRequired', 'El nombre debe tener al menos 2 caracteres')),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    preferences: z.object({
      language: z.enum(['en', 'es']),
      dailyGoal: z.number().min(1).max(100),
      categories: z
        .array(z.string())
        .min(1, t('profile.categoriesRequired', 'Selecciona al menos una categoría')),
      difficulty: z.number().min(1).max(5),
      notifications: z.boolean(),
    }),
  });

type ProfileFormData = z.infer<typeof _baseProfileSchema>;

interface CompactProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompactProfile: React.FC<CompactProfileProps> = ({ isOpen, onClose }) => {
  const { user, setUser } = useUserStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);

  const profileSchema = createProfileSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {
      name: '',
      level: 'beginner',
      preferences: {
        language: 'en',
        dailyGoal: 10,
        categories: [],
        difficulty: 3,
        notifications: true,
      },
    },
  });

  const categories = ['Vocabulary', 'Grammar', 'PhrasalVerbs', 'Idioms'] as const;
  const watchedDifficulty = watch('preferences.difficulty');

  const onSubmit = (data: ProfileFormData) => {
    const newUser = {
      id: user?.id || Date.now().toString(),
      ...data,
      email: user?.email,
      createdAt: user?.createdAt || new Date().toISOString(),
      preferences: {
        ...data.preferences,
        categories: data.preferences.categories as any,
      },
    };
    setUser(newUser);
    onClose();
  };

  if (!isOpen) return null;

  const getDifficultyEmoji = (level: number) => {
    const emojis = ['😊', '🙂', '😐', '😤', '🔥'];
    return emojis[level - 1] || '😊';
  };

  const getDifficultyLabel = (level: number) => {
    const labels = [
      t('profile.veryEasy', 'Muy Fácil'),
      t('profile.easy', 'Fácil'),
      t('profile.normal', 'Normal'),
      t('profile.hard', 'Difícil'),
      t('profile.veryHard', 'Muy Difícil'),
    ];
    return labels[level - 1] || labels[0];
  };

  return (
    <div className="compact-profile">
      <div className="compact-profile__container">
        <div className="compact-profile__header">
          <div className="compact-profile__title-section">
            <User className="compact-profile__icon" />
            <h2 className="compact-profile__title">
              {t('profile.userProfile', 'Perfil de Usuario')}
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

        <form onSubmit={handleSubmit(onSubmit)} className="compact-profile__form">
          <div className="compact-profile__content">
            {/* Basic Info */}
            <div className="compact-profile__section">
              <h3 className="compact-profile__section-title">
                👤 {t('profile.basicInfo', 'Información Básica')}
              </h3>
              
              <div className="compact-profile__field">
                <label className="compact-profile__label compact-profile__label--required">{t('profile.name', 'Nombre')}</label>
                <input
                  {...register('name')}
                  className={`compact-profile__input ${errors.name ? 'compact-profile__input--error' : ''}`}
                  placeholder={t('profile.enterName', 'Ej: María González')}
                />
                {errors.name && (
                  <span className="compact-profile__error">{errors.name.message}</span>
                )}
              </div>

              <div className="compact-profile__field">
                <label className="compact-profile__label compact-profile__label--required">
                  {t('profile.englishLevel', 'Nivel de Inglés')}
                </label>
                <select
                  {...register('level')}
                  className={`compact-profile__select ${errors.level ? 'compact-profile__select--error' : ''}`}
                >
                  <option value="beginner">🌱 {t('profile.beginner', 'Principiante')} - Empezando mi viaje</option>
                  <option value="intermediate">🚀 {t('profile.intermediate', 'Intermedio')} - Construyendo confianza</option>
                  <option value="advanced">⭐ {t('profile.advanced', 'Avanzado')} - Perfeccionando habilidades</option>
                </select>
              </div>
            </div>

            {/* Preferences */}
            <div className="compact-profile__section">
              <h3 className="compact-profile__section-title">
                ⚙️ {t('profile.preferences', 'Preferencias de Aprendizaje')}
              </h3>

              <div className="compact-profile__field-row">
                <div className="compact-profile__field compact-profile__field--half">
                  <label className="compact-profile__label compact-profile__label--optional">
                    {t('profile.language', 'Idioma de la App')}
                  </label>
                  <select {...register('preferences.language')} className="compact-profile__select">
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                  </select>
                </div>

                <div className="compact-profile__field compact-profile__field--half">
                  <label className="compact-profile__label compact-profile__label--optional">
                    {t('profile.dailyGoal', 'Meta Diaria')}
                  </label>
                  <div className="compact-profile__input-group">
                    <input
                      type="number"
                      {...register('preferences.dailyGoal', { valueAsNumber: true })}
                      min="1"
                      max="100"
                      className="compact-profile__input compact-profile__input--number"
                      placeholder="15"
                    />
                    <span className="compact-profile__input-addon">min</span>
                  </div>
                </div>
              </div>

              <div className="compact-profile__field">
                <label className="compact-profile__label compact-profile__label--optional">
                  {t('profile.difficulty', 'Nivel de Desafío')}: {getDifficultyEmoji(watchedDifficulty)}{' '}
                  {getDifficultyLabel(watchedDifficulty)}
                </label>
                <input
                  type="range"
                  {...register('preferences.difficulty', { valueAsNumber: true })}
                  min="1"
                  max="5"
                  className="compact-profile__range"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="compact-profile__section">
              <h3 className="compact-profile__section-title">
                🎯 {t('profile.interestedCategories', 'Áreas de Enfoque')} <span style={{color: 'var(--theme-error, #ef4444)', marginLeft: '0.25rem'}}>*</span>
              </h3>
              <div className="compact-profile__categories">
                {categories.map(category => (
                  <label key={category} className="compact-profile__category">
                    <input
                      type="checkbox"
                      {...register('preferences.categories')}
                      value={category}
                      className="compact-profile__checkbox"
                    />
                    <span className="compact-profile__category-label">
                      {category === 'Vocabulary' &&
                        `📚 ${t('categories.vocabulary', 'Vocabulario')}`}
                      {category === 'Grammar' && `📝 ${t('categories.grammar', 'Gramática')}`}
                      {category === 'PhrasalVerbs' &&
                        `🔗 ${t('categories.phrasalverbs', 'Phrasal Verbs')}`}
                      {category === 'Idioms' && `💭 ${t('categories.idioms', 'Modismos')}`}
                    </span>
                  </label>
                ))}
              </div>
              {errors.preferences?.categories && (
                <span className="compact-profile__error">
                  {errors.preferences.categories.message}
                </span>
              )}
            </div>

            {/* Notifications */}
            <div className="compact-profile__section">
              <h3 className="compact-profile__section-title">
                🔔 {t('profile.notifications', 'Notificaciones')}
              </h3>
              <label className="compact-profile__notification">
                <input
                  type="checkbox"
                  {...register('preferences.notifications')}
                  className="compact-profile__checkbox"
                />
                <div className="compact-profile__notification-content">
                  <span className="compact-profile__notification-title">
                    {t('profile.enableNotifications', 'Recordatorios Inteligentes')}
                  </span>
                  <p className="compact-profile__notification-description">
                    {t('profile.notificationDescription', 'Recibe recordatorios personalizados para mantener tu racha de aprendizaje')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="modal__actions modal__actions--double">
            <button
              type="button"
              onClick={onClose}
              className="modal__btn modal__btn--secondary"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button 
              type="submit" 
              className="modal__btn modal__btn--primary"
            >
              <Save className="modal__btn-icon" />
              {t('profile.saveProfile', 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
