import { useGesture, UserGestureConfig } from '@use-gesture/react';

/**
 * Custom hook to encapsulate gesture logic for mobile touch interactions
 * across the entire application.
 */
export const useGlobalGestures = (
  handler: Parameters<typeof useGesture>[0],
  config?: UserGestureConfig
) => {
  return useGesture(handler, {
    ...config,
    drag: {
      ...config?.drag,
      from: [0, 0],
      pointer: { touch: true },
    },
  });
};
