import type { Alert } from '../types';
import { subHours, subMinutes } from 'date-fns';

const now = new Date();

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'al-01', stationId: 'st-04', stationName: 'Equalization Basin',
    factoryId: 'fac-02', factoryName: 'Delta Foods Processing',
    type: 'bod', severity: 'critical',
    message: 'Estimated BOD exceeded critical threshold. Inspect biological treatment process.',
    value: 125.3, threshold: 60.0,
    timestamp: subMinutes(now, 8), resolved: false,
  },
  {
    id: 'al-02', stationId: 'st-04', stationName: 'Equalization Basin',
    factoryId: 'fac-02', factoryName: 'Delta Foods Processing',
    type: 'ph', severity: 'critical',
    message: 'pH below minimum threshold. Acid neutralization required.',
    value: 4.9, threshold: 6.0,
    timestamp: subMinutes(now, 12), resolved: false,
  },
  {
    id: 'al-03', stationId: 'st-04', stationName: 'Equalization Basin',
    factoryId: 'fac-02', factoryName: 'Delta Foods Processing',
    type: 'do', severity: 'critical',
    message: 'Dissolved Oxygen critically low. Aeration system failure suspected.',
    value: 1.1, threshold: 2.0,
    timestamp: subMinutes(now, 15), resolved: false,
  },
  {
    id: 'al-04', stationId: 'st-02', stationName: 'Clarifier Tank 01',
    factoryId: 'fac-01', factoryName: 'ABC Textile Factory',
    type: 'turbidity', severity: 'warning',
    message: 'Turbidity above warning threshold. Check flocculation dosing.',
    value: 112.6, threshold: 100.0,
    timestamp: subMinutes(now, 22), resolved: false,
  },
  {
    id: 'al-05', stationId: 'st-02', stationName: 'Clarifier Tank 01',
    factoryId: 'fac-01', factoryName: 'ABC Textile Factory',
    type: 'ph', severity: 'warning',
    message: 'pH below normal operating range.',
    value: 5.7, threshold: 6.0,
    timestamp: subMinutes(now, 25), resolved: false,
  },
  {
    id: 'al-06', stationId: 'st-05', stationName: 'Biological Reactor',
    factoryId: 'fac-02', factoryName: 'Delta Foods Processing',
    type: 'bod', severity: 'warning',
    message: 'Estimated BOD elevated. Monitor biological oxygen demand closely.',
    value: 72.1, threshold: 60.0,
    timestamp: subHours(now, 1), resolved: false,
  },
  {
    id: 'al-07', stationId: 'st-01', stationName: 'Aeration Tank 01',
    factoryId: 'fac-01', factoryName: 'ABC Textile Factory',
    type: 'temperature', severity: 'warning',
    message: 'Temperature above normal range during afternoon peak.',
    value: 38.2, threshold: 35.0,
    timestamp: subHours(now, 3), resolved: true,
    resolvedAt: subHours(now, 2),
  },
  {
    id: 'al-08', stationId: 'st-04', stationName: 'Equalization Basin',
    factoryId: 'fac-02', factoryName: 'Delta Foods Processing',
    type: 'turbidity', severity: 'critical',
    message: 'Extreme turbidity detected. Emergency inspection required.',
    value: 215.0, threshold: 100.0,
    timestamp: subHours(now, 6), resolved: true,
    resolvedAt: subHours(now, 4),
  },
];
