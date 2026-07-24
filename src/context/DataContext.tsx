import { createContext, useContext, ReactNode } from 'react';
import { useGoogleSheetsData } from '../hooks/useGoogleSheetsData';
import type { Factory, Station, Alert } from '../types';

interface DataContextType {
  factories: Factory[];
  stations: Station[];
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const data = useGoogleSheetsData();
  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
