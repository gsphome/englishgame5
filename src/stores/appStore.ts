import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, LearningModule, SessionScore } from '../types';

interface AppStore extends AppState {
  // Global score that persists across sessions
  globalScore: SessionScore;

  // Actions
  setCurrentModule: (module: LearningModule | null) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  updateSessionScore: (score: Partial<SessionScore>) => void;
  updateGlobalScore: (score: Partial<SessionScore>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  resetGlobalScore: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      currentModule: null,
      currentView: 'menu',
      sessionScore: {
        correct: 0,
        incorrect: 0,
        total: 0,
        accuracy: 0
      },
      globalScore: {
        correct: 0,
        incorrect: 0,
        total: 0,
        accuracy: 0
      },
      isLoading: false,
      error: null,

      // Actions
      setCurrentModule: (module) => set((state) => {
        // Always reset session score when setting a new module
        const shouldResetScore = module && (!state.currentModule || module.id !== state.currentModule.id);

        const newSessionScore = shouldResetScore
          ? { correct: 0, incorrect: 0, total: 0, accuracy: 0 }
          : state.sessionScore;

        return {
          currentModule: module,
          sessionScore: newSessionScore
        };
      }),

      setCurrentView: (view) => set((state) => {
        return {
          currentView: view,
          // Clear currentModule when going back to menu
          currentModule: view === 'menu' ? null : state.currentModule
        };
      }),

      updateSessionScore: (scoreUpdate) => set((state) => {

        // INCREMENT the session score values
        const newSessionScore = { ...state.sessionScore };
        if (scoreUpdate.correct) {
          newSessionScore.correct += scoreUpdate.correct;
        }
        if (scoreUpdate.incorrect) {
          newSessionScore.incorrect += scoreUpdate.incorrect;
        }

        newSessionScore.total = newSessionScore.correct + newSessionScore.incorrect;
        newSessionScore.accuracy = newSessionScore.total > 0 ? (newSessionScore.correct / newSessionScore.total) * 100 : 0;

        // Also update global score
        const newGlobalScore = { ...state.globalScore };
        if (scoreUpdate.correct) {
          newGlobalScore.correct += scoreUpdate.correct;
        }
        if (scoreUpdate.incorrect) {
          newGlobalScore.incorrect += scoreUpdate.incorrect;
        }

        newGlobalScore.total = newGlobalScore.correct + newGlobalScore.incorrect;
        newGlobalScore.accuracy = newGlobalScore.total > 0 ? (newGlobalScore.correct / newGlobalScore.total) * 100 : 0;

        return {
          sessionScore: newSessionScore,
          globalScore: newGlobalScore
        };
      }),

      updateGlobalScore: (scoreUpdate) => set((state) => {

        const newGlobalScore = { ...state.globalScore };
        if (scoreUpdate.correct) {
          newGlobalScore.correct += scoreUpdate.correct;
        }
        if (scoreUpdate.incorrect) {
          newGlobalScore.incorrect += scoreUpdate.incorrect;
        }

        newGlobalScore.total = newGlobalScore.correct + newGlobalScore.incorrect;
        newGlobalScore.accuracy = newGlobalScore.total > 0 ? (newGlobalScore.correct / newGlobalScore.total) * 100 : 0;

        return { globalScore: newGlobalScore };
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      resetSession: () => {
        return set({
          sessionScore: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
          error: null,
          currentModule: null
        });
      },

      resetGlobalScore: () => {
        return set({
          globalScore: { correct: 0, incorrect: 0, total: 0, accuracy: 0 }
        });
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        currentView: state.currentView,
        currentModule: state.currentModule,
        globalScore: state.globalScore
        // sessionScore should NOT be persisted - it's session-only data
      })
    }
  )
);