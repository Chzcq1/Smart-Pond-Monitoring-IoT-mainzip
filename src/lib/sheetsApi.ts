/**
 * Typed client for the Google Apps Script web app.
 * All requests are GET with an `action` query param; responses are { ok, data } or { ok, error }.
 */

const API_URL =
  'https://script.google.com/macros/s/AKfycbzRNPTNiYjTx8CZPd4XRckgkz1G27vxYkzXrxWjhEx_Gg5gf17sNlLbmEuOWEIDpHrz/exec';

async function apiFetch<T>(action: string): Promise<T> {
  const res = await fetch(`${API_URL}?action=${action}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? 'API error');
  return json.data as T;
}

export interface ApiFactory {
  factory_id: string;
  name: string;
  customer: string;
  location: string;
  industry: string;
  status: string;
  active: boolean;
}

export interface ApiStation {
  station_id: string;
  factory_id: string;
  name: string;
  description: string;
  status: string;
  last_updated: string;
  active: boolean;
}

export interface ApiSensorReading {
  reading_id: string;
  station_id: string;
  factory_id: string;
  timestamp: string;
  ph: number;
  temperature: number;
  dissolved_oxygen: number;
  estimated_bod: number;
  turbidity: number;
  source: string;
}

export interface ApiAlert {
  alert_id: string;
  station_id: string;
  station_name: string;
  factory_id: string;
  factory_name: string;
  type: string;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  resolved: boolean;
  resolved_at: string;
}

export interface ApiMaintenance {
  maintenance_id: string;
  station_id: string;
  type: 'cleaning' | 'calibration';
  last_date: string;
  next_date: string;
  status: 'ok' | 'due-soon' | 'overdue';
  remaining_days: number;
  performed_by: string;
  notes: string;
}

export const sheetsApi = {
  getFactories: () => apiFetch<ApiFactory[]>('getFactories'),
  getStations: () => apiFetch<ApiStation[]>('getStations'),
  getSensorData: () => apiFetch<ApiSensorReading[]>('getSensorData'),
  getAlerts: () => apiFetch<ApiAlert[]>('getAlerts'),
  getMaintenance: () => apiFetch<ApiMaintenance[]>('getMaintenance'),
};
