/**
 * Realistic sensor data simulator.
 * Uses sine waves + bounded random walk to avoid jarring jumps.
 * Each station has its own state so different stations diverge naturally.
 */

import type { SensorReading, SensorHistory, StationStats } from '../types';
import { subHours, subDays, subMonths, format } from 'date-fns';

interface SimState {
  ph: number;
  temperature: number;
  dissolvedOxygen: number;
  estimatedBOD: number;
  turbidity: number;
}

// Per-station simulation state (persists across ticks)
const stateCache: Record<string, SimState> = {};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function noise(amplitude: number) {
  return (Math.random() - 0.5) * 2 * amplitude;
}

function walk(current: number, target: number, speed: number, amplitude: number, min: number, max: number) {
  const drift = (target - current) * speed;
  return clamp(current + drift + noise(amplitude), min, max);
}

/** Get or create stable simulation state for a station */
function getState(stationId: string, seed: SimState): SimState {
  if (!stateCache[stationId]) {
    stateCache[stationId] = { ...seed };
  }
  return stateCache[stationId];
}

/** Advance simulation by one tick and return new reading */
export function tick(stationId: string, seed: SimState, isCritical = false): SensorReading {
  const s = getState(stationId, seed);
  const t = Date.now() / 60000; // slow time base

  // Targets drift sinusoidally to simulate diurnal patterns
  const phTarget = isCritical ? 5.2 : 7.2 + Math.sin(t * 0.3) * 0.4;
  const tempTarget = 28 + Math.sin(t * 0.1) * 3 + (isCritical ? 5 : 0);
  const doTarget = isCritical ? 1.2 : 4.5 + Math.sin(t * 0.2) * 0.8;
  const bodTarget = isCritical ? 120 : 30 + Math.sin(t * 0.15) * 10;
  const turbTarget = isCritical ? 180 : 45 + Math.sin(t * 0.25) * 15;

  s.ph = walk(s.ph, phTarget, 0.05, 0.08, 3.0, 12.0);
  s.temperature = walk(s.temperature, tempTarget, 0.03, 0.15, 10, 45);
  s.dissolvedOxygen = walk(s.dissolvedOxygen, doTarget, 0.04, 0.06, 0, 14);
  s.estimatedBOD = walk(s.estimatedBOD, bodTarget, 0.04, 1.2, 0, 250);
  s.turbidity = walk(s.turbidity, turbTarget, 0.05, 2.5, 0, 300);

  return {
    ph: Math.round(s.ph * 100) / 100,
    temperature: Math.round(s.temperature * 10) / 10,
    dissolvedOxygen: Math.round(s.dissolvedOxygen * 100) / 100,
    estimatedBOD: Math.round(s.estimatedBOD * 10) / 10,
    turbidity: Math.round(s.turbidity * 10) / 10,
    timestamp: new Date(),
  };
}

/** Generate a smooth historical time series (hourly points) */
export function generateHistory(
  stationId: string,
  seed: SimState,
  hours: number,
  isCritical = false,
): SensorHistory[] {
  const points: SensorHistory[] = [];
  const state: SimState = { ...seed };
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const ts = subHours(now, i);
    const t = ts.getTime() / 60000;
    const phTarget = isCritical && i < hours * 0.3 ? 5.2 : 7.2 + Math.sin(t * 0.3) * 0.4;
    const tempTarget = 28 + Math.sin(t * 0.1) * 3;
    const doTarget = isCritical && i < hours * 0.3 ? 1.2 : 4.5 + Math.sin(t * 0.2) * 0.8;
    const bodTarget = isCritical && i < hours * 0.3 ? 120 : 30 + Math.sin(t * 0.15) * 10;
    const turbTarget = isCritical && i < hours * 0.3 ? 180 : 45 + Math.sin(t * 0.25) * 15;

    state.ph = walk(state.ph, phTarget, 0.08, 0.05, 3.0, 12.0);
    state.temperature = walk(state.temperature, tempTarget, 0.05, 0.1, 10, 45);
    state.dissolvedOxygen = walk(state.dissolvedOxygen, doTarget, 0.06, 0.04, 0, 14);
    state.estimatedBOD = walk(state.estimatedBOD, bodTarget, 0.06, 0.8, 0, 250);
    state.turbidity = walk(state.turbidity, turbTarget, 0.07, 1.5, 0, 300);

    points.push({
      id: `${stationId}-h${i}`,
      ph: Math.round(state.ph * 100) / 100,
      temperature: Math.round(state.temperature * 10) / 10,
      dissolvedOxygen: Math.round(state.dissolvedOxygen * 100) / 100,
      estimatedBOD: Math.round(state.estimatedBOD * 10) / 10,
      turbidity: Math.round(state.turbidity * 10) / 10,
      timestamp: ts,
    });
  }
  return points;
}

export function computeStats(history: SensorHistory[], field: keyof Omit<SensorReading, 'timestamp'>): import('../types').SensorStats {
  const vals = history.map((h) => h[field] as number);
  const latest = vals[vals.length - 1] ?? 0;
  const average = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return {
    latest,
    average: Math.round(average * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
  };
}

export function computeAllStats(history: SensorHistory[]): StationStats {
  return {
    ph: computeStats(history, 'ph'),
    temperature: computeStats(history, 'temperature'),
    dissolvedOxygen: computeStats(history, 'dissolvedOxygen'),
    estimatedBOD: computeStats(history, 'estimatedBOD'),
    turbidity: computeStats(history, 'turbidity'),
  };
}
