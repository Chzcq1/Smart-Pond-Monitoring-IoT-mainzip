import type { Factory, Station, Thresholds, MaintenanceRecord } from '../types';
import { addDays, subDays } from 'date-fns';

const now = new Date();

const defaultThresholds: Thresholds = {
  phMin: 6.0,
  phMax: 9.0,
  doMin: 2.0,
  bodMax: 60.0,
  turbidityMax: 100.0,
  temperatureMax: 40.0,
};

function makeMaintenance(cleaningOffsetDays: number, calibrationOffsetDays: number): MaintenanceRecord {
  const lastCleaning = subDays(now, cleaningOffsetDays);
  const nextCleaning = addDays(lastCleaning, 30);
  const lastCalibration = subDays(now, calibrationOffsetDays);
  const nextCalibration = addDays(lastCalibration, 90);
  const remainingDays = Math.max(0, Math.round((nextCleaning.getTime() - now.getTime()) / 86400000));
  const status = remainingDays <= 0 ? 'overdue' : remainingDays <= 5 ? 'due-soon' : 'ok';
  return { lastCleaning, nextCleaning, lastCalibration, nextCalibration, remainingDays, status };
}

export const STATIONS: Station[] = [
  // Factory 1 — ABC Textile
  {
    id: 'st-01', factoryId: 'fac-01', name: 'Aeration Tank 01',
    description: 'Primary aeration treatment basin',
    status: 'online', lastUpdated: new Date(),
    current: { ph: 7.2, temperature: 28.5, dissolvedOxygen: 4.8, estimatedBOD: 32.1, turbidity: 45.2, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(12, 45),
  },
  {
    id: 'st-02', factoryId: 'fac-01', name: 'Clarifier Tank 01',
    description: 'Secondary clarification unit',
    status: 'warning', lastUpdated: new Date(),
    current: { ph: 5.7, temperature: 29.1, dissolvedOxygen: 1.8, estimatedBOD: 68.4, turbidity: 112.6, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(28, 85),
  },
  {
    id: 'st-03', factoryId: 'fac-01', name: 'Final Discharge Point',
    description: 'Effluent discharge monitoring',
    status: 'online', lastUpdated: new Date(),
    current: { ph: 7.8, temperature: 27.2, dissolvedOxygen: 5.2, estimatedBOD: 28.9, turbidity: 38.7, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(5, 20),
  },
  // Factory 2 — Delta Foods
  {
    id: 'st-04', factoryId: 'fac-02', name: 'Equalization Basin',
    description: 'Inlet flow equalization',
    status: 'critical', lastUpdated: new Date(),
    current: { ph: 4.9, temperature: 35.8, dissolvedOxygen: 1.1, estimatedBOD: 125.3, turbidity: 189.4, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(32, 95),
  },
  {
    id: 'st-05', factoryId: 'fac-02', name: 'Biological Reactor',
    description: 'Anaerobic biological treatment',
    status: 'warning', lastUpdated: new Date(),
    current: { ph: 6.1, temperature: 33.2, dissolvedOxygen: 1.9, estimatedBOD: 72.1, turbidity: 95.8, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(18, 60),
  },
  // Factory 3 — GreenTech Electronics
  {
    id: 'st-06', factoryId: 'fac-03', name: 'Rinse Water Tank',
    description: 'PCB rinse water treatment',
    status: 'online', lastUpdated: new Date(),
    current: { ph: 7.4, temperature: 24.1, dissolvedOxygen: 6.1, estimatedBOD: 18.5, turbidity: 22.3, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(3, 30),
  },
  {
    id: 'st-07', factoryId: 'fac-03', name: 'Chemical Neutralization',
    description: 'Acid/alkali neutralization chamber',
    status: 'online', lastUpdated: new Date(),
    current: { ph: 7.1, temperature: 25.0, dissolvedOxygen: 5.8, estimatedBOD: 21.2, turbidity: 28.9, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(8, 40),
  },
  {
    id: 'st-08', factoryId: 'fac-03', name: 'Polishing Filter',
    description: 'Final sand filter before discharge',
    status: 'online', lastUpdated: new Date(),
    current: { ph: 7.3, temperature: 24.8, dissolvedOxygen: 6.3, estimatedBOD: 15.7, turbidity: 14.1, timestamp: new Date() },
    thresholds: defaultThresholds,
    maintenance: makeMaintenance(1, 10),
  },
];

export const FACTORIES: Factory[] = [
  {
    id: 'fac-01', name: 'ABC Textile Factory', customer: 'ABC Industries Co., Ltd.',
    location: 'Samut Prakan Industrial Zone, Thailand', industry: 'Textile Manufacturing',
    status: 'warning', stationIds: ['st-01', 'st-02', 'st-03'],
  },
  {
    id: 'fac-02', name: 'Delta Foods Processing', customer: 'Delta Foods Group',
    location: 'Chachoengsao Food Industrial Estate, Thailand', industry: 'Food Processing',
    status: 'critical', stationIds: ['st-04', 'st-05'],
  },
  {
    id: 'fac-03', name: 'GreenTech Electronics', customer: 'GreenTech PCB Mfg.',
    location: 'Ayutthaya Hi-Tech Industrial Estate, Thailand', industry: 'Electronics Manufacturing',
    status: 'online', stationIds: ['st-06', 'st-07', 'st-08'],
  },
];
