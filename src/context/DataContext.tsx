import { createContext, useContext, ReactNode } from 'react';
import { useSimulatedData } from '../hooks/useSimulatedData';
import type { Factory, Station, Alert } from '../types';

interface DataContextType {
  factories: Factory[];
  stations: Station[];
  alerts: Alert[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const data = useSimulatedData();
  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
