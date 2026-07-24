import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { StatusLevel } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValue(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function getStatusColor(status: StatusLevel) {
  switch (status) {
    case 'online': return 'green';
    case 'warning': return 'yellow';
    case 'critical': return 'red';
    case 'offline': return 'gray';
  }
}

export function getStatusLabel(status: StatusLevel): string {
  switch (status) {
    case 'online': return 'Online';
    case 'warning': return 'Warning';
    case 'critical': return 'Critical';
    case 'offline': return 'Offline';
  }
}

export function deriveStationStatus(
  ph: number, do_: number, bod: number, turbidity: number,
  thresholds: { phMin: number; phMax: number; doMin: number; bodMax: number; turbidityMax: number }
): StatusLevel {
  const critical =
    ph < thresholds.phMin - 1 || ph > thresholds.phMax + 1 ||
    do_ < thresholds.doMin - 0.5 ||
    bod > thresholds.bodMax * 1.5 ||
    turbidity > thresholds.turbidityMax * 1.5;
  if (critical) return 'critical';

  const warning =
    ph < thresholds.phMin || ph > thresholds.phMax ||
    do_ < thresholds.doMin ||
    bod > thresholds.bodMax ||
    turbidity > thresholds.turbidityMax;
  if (warning) return 'warning';

  return 'online';
}
