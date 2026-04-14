import React from 'react';
import { AppState } from 'react-native';

export const useAppStateListener = ({
  onBackground,
  onForeground,
}: {
  onBackground: () => void;
  onForeground: () => void;
}) => {
  const appState = React.useRef(AppState.currentState);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        (appState.current === 'inactive' ||
          appState.current === 'background') &&
        nextAppState === 'active'
      ) {
        onForeground();
      } else {
        onBackground();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onBackground, onForeground]);
};
