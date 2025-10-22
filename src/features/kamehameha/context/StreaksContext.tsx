/**
 * StreaksContext - Global streak data provider
 * 
 * Ensures only ONE instance of useStreaks runs, preventing duplicate writes
 */

import { createContext, useContext, ReactNode } from 'react';
import { useStreaks } from '../hooks/useStreaks';
import type { UseStreaksReturn } from '../types/kamehameha.types';

const StreaksContext = createContext<UseStreaksReturn | null>(null);

interface StreaksProviderProps {
  children: ReactNode;
}

export function StreaksProvider({ children }: StreaksProviderProps) {
  const streaksData = useStreaks();
  
  return (
    <StreaksContext.Provider value={streaksData}>
      {children}
    </StreaksContext.Provider>
  );
}

export function useStreaksContext(): UseStreaksReturn {
  const context = useContext(StreaksContext);
  
  if (!context) {
    throw new Error('useStreaksContext must be used within a StreaksProvider');
  }
  
  return context;
}

