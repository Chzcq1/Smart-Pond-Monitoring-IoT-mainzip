export type StatusLevel = 'online' | 'warning' | 'critical' | 'offline';
export type AlertSeverity = 'warning' | 'critical';
export type AlertType = 'ph' | 'do' | 'bod' | 'turbidity' | 'temperature';
export type TrendPeriod = 'daily' | 'weekly' | 'monthly';
export type ReportPeriod = 'today' | '7days' | '30days' | 'custom';

export interface SensorReading {
  ph: number;
  temperature: number;        // °C
  dissolvedOxygen: number;    // mg/L
  estimatedBOD: number;       // mg/L
  turbidity: number;          // NTU
  timestamp: Date;
}

export interface SensorHistory extends SensorReading {
  id: string;
}

export interface Thresholds {
  phMin: number;
  phMax: number;
  doMin: number;
  bodMax: number;
  turbidityMax: number;
  temperatureMax: number;
}

export interface MaintenanceRecord {
  lastCleaning: Date;
  nextCleaning: Date;
  lastCalibration: Date;
  nextCalibration: Date;
  status: 'ok' | 'due-soon' | 'overdue';
  remainingDays: number;
}

export interface Station {
  id: string;
  factoryId: string;
  name: string;
  description: string;
  status: StatusLevel;
  lastUpdated: Date;
  current: SensorReading;
  thresholds: Thresholds;
  maintenance: MaintenanceRecord;
}

export interface Factory {
  id: string;
  name: string;
  customer: string;
  location: string;
  status: StatusLevel;
  industry: string;
  stationIds: string[];
}

export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  factoryId: string;
  factoryName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface SensorStats {
  latest: number;
  average: number;
  min: number;
  max: number;
}

export interface StationStats {
  ph: SensorStats;
  temperature: SensorStats;
  dissolvedOxygen: SensorStats;
  estimatedBOD: SensorStats;
  turbidity: SensorStats;
}
