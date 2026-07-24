/**
 * Fetches live data from Google Apps Script / Google Sheets.
 * Polls every 30 s. Falls back to mock data on any error.
 *
 * ponytail: no history endpoint exists yet — useStationHistory still uses simulation.
 * upgrade: when Apps Script exposes getHistory?station_id=X, replace generateHistory here.
 */

import { useState, useEffect, useCallback } from 'react';
import { sheetsApi } from '../lib/sheetsApi';
import { STATIONS as FALLBACK_STATIONS, FACTORIES as FALLBACK_FACTORIES } from '../data/mockFactories';
import { MOCK_ALERTS } from '../data/alerts';
import { deriveStationStatus } from '../lib/utils';
import type { Factory, Station, Alert, MaintenanceRecord, StatusLevel, AlertSeverity, AlertType } from '../types';
import type { ApiMaintenance } from '../lib/sheetsApi';

const POLL_MS = 30_000;

const DEFAULT_THRESHOLDS = {
  phMin: 6.0, phMax: 9.0, doMin: 2.0,
  bodMax: 60.0, turbidityMax: 100.0, temperatureMax: 40.0,
};

function thresholdsFor(stationId: string) {
  return FALLBACK_STATIONS.find(s => s.id === stationId)?.thresholds ?? DEFAULT_THRESHOLDS;
}

function buildMaintenance(records: ApiMaintenance[], stationId: string): MaintenanceRecord {
  const fallback = FALLBACK_STATIONS.find(s => s.id === stationId)?.maintenance;
  const cleaning = records.find(r => r.station_id === stationId && r.type === 'cleaning');
  const calibration = records.find(r => r.station_id === stationId && r.type === 'calibration');

  if (!cleaning && !calibration) {
    return fallback ?? {
      lastCleaning: new Date(), nextCleaning: new Date(),
      lastCalibration: new Date(), nextCalibration: new Date(),
      remainingDays: 30, status: 'ok',
    };
  }

  const lastCleaning = new Date(cleaning?.last_date ?? fallback?.lastCleaning ?? Date.now());
  const nextCleaning = new Date(cleaning?.next_date ?? fallback?.nextCleaning ?? Date.now());
  const lastCalibration = new Date(calibration?.last_date ?? fallback?.lastCalibration ?? Date.now());
  const nextCalibration = new Date(calibration?.next_date ?? fallback?.nextCalibration ?? Date.now());
  const remainingDays = cleaning?.remaining_days ?? fallback?.remainingDays ?? 0;
  const status = cleaning?.status ?? fallback?.status ?? 'ok';

  return { lastCleaning, nextCleaning, lastCalibration, nextCalibration, remainingDays, status };
}

export function useGoogleSheetsData() {
  const [factories, setFactories] = useState<Factory[]>(FALLBACK_FACTORIES);
  const [stations, setStations] = useState<Station[]>(FALLBACK_STATIONS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [apiFactories, apiStations, apiReadings, apiAlerts, apiMaintenance] = await Promise.all([
        sheetsApi.getFactories(),
        sheetsApi.getStations(),
        sheetsApi.getSensorData(),
        sheetsApi.getAlerts(),
        sheetsApi.getMaintenance(),
      ]);

      const readingsByStation = Object.fromEntries(apiReadings.map(r => [r.station_id, r]));

      const mappedFactories: Factory[] = apiFactories
        .filter(f => f.active)
        .map(f => ({
          id: f.factory_id,
          name: f.name,
          customer: f.customer,
          location: f.location,
          industry: f.industry,
          status: f.status as StatusLevel,
          stationIds: apiStations
            .filter(s => s.factory_id === f.factory_id && s.active)
            .map(s => s.station_id),
        }));

      const mappedStations: Station[] = apiStations
        .filter(s => s.active)
        .map(s => {
          const r = readingsByStation[s.station_id];
          const thresholds = thresholdsFor(s.station_id);
          const fallbackCurrent = FALLBACK_STATIONS.find(fs => fs.id === s.station_id)?.current;

          const current = r
            ? {
                ph: r.ph,
                temperature: r.temperature,
                dissolvedOxygen: r.dissolved_oxygen,
                estimatedBOD: r.estimated_bod,
                turbidity: r.turbidity,
                timestamp: new Date(r.timestamp),
              }
            : fallbackCurrent ?? {
                ph: 7, temperature: 28, dissolvedOxygen: 4,
                estimatedBOD: 30, turbidity: 40, timestamp: new Date(),
              };

          const status = r
            ? deriveStationStatus(r.ph, r.dissolved_oxygen, r.estimated_bod, r.turbidity, thresholds)
            : (s.status as StatusLevel);

          return {
            id: s.station_id,
            factoryId: s.factory_id,
            name: s.name,
            description: s.description,
            status,
            lastUpdated: new Date(s.last_updated),
            current,
            thresholds,
            maintenance: buildMaintenance(apiMaintenance, s.station_id),
          };
        });

      const mappedAlerts: Alert[] = apiAlerts.map(a => ({
        id: a.alert_id,
        stationId: a.station_id,
        stationName: a.station_name,
        factoryId: a.factory_id,
        factoryName: a.factory_name,
        type: a.type as AlertType,
        severity: a.severity as AlertSeverity,
        message: a.message,
        value: a.value,
        threshold: a.threshold,
        timestamp: new Date(a.timestamp),
        resolved: a.resolved,
        resolvedAt: a.resolved_at ? new Date(a.resolved_at) : undefined,
      }));

      setFactories(mappedFactories);
      setStations(mappedStations);
      setAlerts(mappedAlerts);
      setError(null);
    } catch (e) {
      // Keep existing (or fallback) data on error; just surface the error message
      setError(e instanceof Error ? e.message : 'Failed to fetch from Google Sheets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { factories, stations, alerts, loading, error };
}
