// DI container'ını React ağacına sağlar
import { createContext, useContext, type ReactNode } from 'react';
import type { AppContainer } from '@core/di/container';

const DIContext = createContext<AppContainer | null>(null);

interface DIProviderProps {
  readonly container: AppContainer;
  readonly children: ReactNode;
}

export function DIProvider({ container, children }: DIProviderProps) {
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI(): AppContainer {
  const container = useContext(DIContext);
  if (!container) throw new Error('useDI, DIProvider içinde kullanılmalı.');
  return container;
}
