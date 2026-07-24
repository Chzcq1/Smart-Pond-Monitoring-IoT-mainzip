/**
 * React hook that wires live simulation into the component tree.
 * Ticks every 5 seconds so charts animate naturally.
 * Returns factories + stations (with live current readings) + alerts.
 *
 * API shape mirrors what a real REST backend would return —
 * swap `getState(id)` for `fetch('/api/stations/${id}')` to go live.
 */

import { useState, useEffect, useCallback } from 'react';
import { FACTORIES } from '../data/mockFactories';
import { STATIONS as INITIAL_STATIONS } from '../data/mockFactories';
import { MOCK_ALERTS } from '../data/alerts';
import { tick, generateHistory, computeAllStats } from '../data/simulation';
import type { Factory, Station, Alert, SensorHistory, StationStats } from '../types';
import { deriveStationStatus } from '../lib/utils';

const TICK_MS = 5000;

// Seeds for each station (critical flag for stations in bad shape)
const CRITICAL_STATIONS = new Set(['st-04']);
const WARNING_STATIONS = new Set(['st-02', 'st-05']);

function seedFor(s: Station) {
  return {
    ph: s.current.ph,
    temperature: s.current.temperature,
    dissolvedOxygen: s.current.dissolvedOxygen,
    estimatedBOD: s.current.estimatedBOD,
    turbidity: s.current.turbidity,
  };
}

export function useSimulatedData() {
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [factories] = useState<Factory[]>(FACTORIES);
  const [alerts] = useState<Alert[]>(MOCK_ALERTS);

  const tickAll = useCallback(() => {
    setStations((prev) =>
      prev.map((s) => {
        const isCritical = CRITICAL_STATIONS.has(s.id);
        const isWarning = WARNING_STATIONS.has(s.id);
        const reading = tick(s.id, seedFor(s), isCritical);
        const status = deriveStationStatus(
          reading.ph, reading.dissolvedOxygen, reading.estimatedBOD,
          reading.turbidity, s.thresholds
        );
        return { ...s, current: reading, status, lastUpdated: new Date() };
      })
    );
  }, []);

  useEffect(() => {
    const id = setInterval(tickAll, TICK_MS);
    return () => clearInterval(id);
  }, [tickAll]);

  return { factories, stations, alerts };
}

export function useStationHistory(
  stationId: string,
  hours: number
): { history: SensorHistory[]; stats: StationStats } {
  const station = INITIAL_STATIONS.find((s) => s.id === stationId);
  const isCritical = CRITICAL_STATIONS.has(stationId);

  const history = generateHistory(
    stationId,
    station ? seedFor(station) : { ph: 7, temperature: 28, dissolvedOxygen: 4, estimatedBOD: 30, turbidity: 40 },
    hours,
    isCritical,
  );

  const stats = computeAllStats(history);
  return { history, stats };
}

export function useDashboardSummary(stations: Station[]) {
  const online = stations.filter((s) => s.status === 'online').length;
  const warning = stations.filter((s) => s.status === 'warning').length;
  const critical = stations.filter((s) => s.status === 'critical').length;
  return { online, warning, critical, total: stations.length };
}
