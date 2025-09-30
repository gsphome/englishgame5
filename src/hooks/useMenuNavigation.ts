import { useAppStore } from '../stores/appStore';

/**
 * Custom hook for handling menu navigation with context awareness
 * Returns users to their previous menu context (progression or list view)
 */
export const useMenuNavigation = () => {
  const { setCurrentView, previousMenuContext } = useAppStore();

  const returnToMenu = () => {
    setCurrentView('menu');
    // The MainMenu component will automatically use the previousMenuContext
    // to set the correct view mode when it mounts
  };

  return {
    returnToMenu,
    previousMenuContext,
  };
};