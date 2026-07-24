/**
 * PDF report generator — uses browser print-to-PDF (window.print).
 * Opens a styled print window; user saves as PDF from the print dialog.
 * No external dependencies; replaces jsPDF to avoid CVE-blocked packages.
 */

import { format } from 'date-fns';
import type { Factory, Station, SensorHistory, StationStats } from '../types';

export interface GenerateReportOptions {
  factory: Factory;
  station: Station;
  history: SensorHistory[];
  stats: StationStats;
  periodLabel: string;
}

function row(label: string, latest: string, avg: string, min: string, max: string, unit: string) {
  return `<tr>
    <td>${label}</td>
    <td>${latest}</td>
    <td>${avg}</td>
    <td>${min}</td>
    <td>${max}</td>
    <td>${unit}</td>
  </tr>`;
}

function historyRows(history: SensorHistory[], maxRows = 25): string {
  const step = Math.max(1, Math.ceil(history.length / maxRows));
  return history
    .filter((_, i) => i % step === 0)
    .slice(0, maxRows)
    .map(
      (h) => `<tr>
        <td>${format(h.timestamp, 'dd/MM HH:mm')}</td>
        <td>${h.ph.toFixed(2)}</td>
        <td>${h.temperature.toFixed(1)}</td>
        <td>${h.dissolvedOxygen.toFixed(2)}</td>
        <td>${h.estimatedBOD.toFixed(1)}</td>
        <td>${h.turbidity.toFixed(1)}</td>
      </tr>`
    )
    .join('');
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    ok: '#16a34a', 'due-soon': '#d97706', overdue: '#dc2626',
    online: '#16a34a', warning: '#d97706', critical: '#dc2626', offline: '#64748b',
  };
  const color = colors[status] ?? '#64748b';
  return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase">${status}</span>`;
}

const PRINT_CSS = `
  @page { size: A4; margin: 18mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, 'Segoe UI', sans-serif; }
  body { color: #0f172a; font-size: 11px; line-height: 1.5; }
  .brand-bar { background: #0f172a; color: #fff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-radius: 4px; }
  .brand-bar .name { font-size: 14px; font-weight: 700; }
  .brand-bar .sub { font-size: 10px; color: #94a3b8; }
  .brand-bar .meta { text-align: right; font-size: 10px; color: #94a3b8; }
  h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin: 12px 0; }
  .info-grid .label { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .info-grid .value { font-weight: 600; font-size: 11px; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  .section-title { font-size: 12px; font-weight: 700; color: #0f172a; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #0f172a; color: #fff; padding: 6px 8px; text-align: left; font-weight: 600; }
  td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 9px; text-align: center; }
`;

export function generateStationReport(opts: GenerateReportOptions): void {
  const { factory, station, history, stats, periodLabel } = opts;
  const now = new Date();
  const { maintenance: m } = station;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Water-MaaS Report — ${station.name}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>

<div class="brand-bar">
  <div>
    <div class="name">Water-MaaS</div>
    <div class="sub">Water Monitoring-as-a-Service</div>
  </div>
  <div class="meta">
    Generated: ${format(now, 'dd MMM yyyy HH:mm')}<br>
    CONFIDENTIAL
  </div>
</div>

<h2>Environmental Monitoring Report</h2>
<div class="info-grid">
  <div><div class="label">Factory</div><div class="value">${factory.name}</div></div>
  <div><div class="label">Customer</div><div class="value">${factory.customer}</div></div>
  <div><div class="label">Location</div><div class="value">${factory.location}</div></div>
  <div><div class="label">Industry</div><div class="value">${factory.industry}</div></div>
  <div><div class="label">Station</div><div class="value">${station.name}</div></div>
  <div><div class="label">Report Period</div><div class="value">${periodLabel}</div></div>
  <div><div class="label">Station Status</div><div class="value">${statusBadge(station.status)}</div></div>
</div>

<hr class="divider">

<div class="section-title">Summary Statistics</div>
<table>
  <thead><tr><th>Parameter</th><th>Latest</th><th>Average</th><th>Min</th><th>Max</th><th>Unit</th></tr></thead>
  <tbody>
    ${row('pH', station.current.ph.toFixed(2), stats.ph.average.toFixed(2), stats.ph.min.toFixed(2), stats.ph.max.toFixed(2), '—')}
    ${row('Temperature', station.current.temperature.toFixed(1), stats.temperature.average.toFixed(1), stats.temperature.min.toFixed(1), stats.temperature.max.toFixed(1), '°C')}
    ${row('Dissolved Oxygen', station.current.dissolvedOxygen.toFixed(2), stats.dissolvedOxygen.average.toFixed(2), stats.dissolvedOxygen.min.toFixed(2), stats.dissolvedOxygen.max.toFixed(2), 'mg/L')}
    ${row('Estimated BOD', station.current.estimatedBOD.toFixed(1), stats.estimatedBOD.average.toFixed(1), stats.estimatedBOD.min.toFixed(1), stats.estimatedBOD.max.toFixed(1), 'mg/L')}
    ${row('Turbidity', station.current.turbidity.toFixed(1), stats.turbidity.average.toFixed(1), stats.turbidity.min.toFixed(1), stats.turbidity.max.toFixed(1), 'NTU')}
  </tbody>
</table>

<div class="section-title">Regulatory Thresholds</div>
<table>
  <thead><tr><th>Parameter</th><th>Min Threshold</th><th>Max Threshold</th><th>Unit</th></tr></thead>
  <tbody>
    <tr><td>pH</td><td>${station.thresholds.phMin}</td><td>${station.thresholds.phMax}</td><td>—</td></tr>
    <tr><td>Dissolved Oxygen</td><td>${station.thresholds.doMin}</td><td>—</td><td>mg/L</td></tr>
    <tr><td>Estimated BOD</td><td>—</td><td>${station.thresholds.bodMax}</td><td>mg/L</td></tr>
    <tr><td>Turbidity</td><td>—</td><td>${station.thresholds.turbidityMax}</td><td>NTU</td></tr>
    <tr><td>Temperature</td><td>—</td><td>${station.thresholds.temperatureMax}</td><td>°C</td></tr>
  </tbody>
</table>

<div class="section-title">Maintenance Schedule</div>
<table>
  <thead><tr><th>Item</th><th>Date</th><th>Status</th></tr></thead>
  <tbody>
    <tr><td>Last Cleaning</td><td>${format(m.lastCleaning, 'dd MMM yyyy')}</td><td>${statusBadge('ok')}</td></tr>
    <tr><td>Next Cleaning (${m.remainingDays}d remaining)</td><td>${format(m.nextCleaning, 'dd MMM yyyy')}</td><td>${statusBadge(m.status)}</td></tr>
    <tr><td>Last Calibration</td><td>${format(m.lastCalibration, 'dd MMM yyyy')}</td><td>${statusBadge('ok')}</td></tr>
    <tr><td>Next Calibration</td><td>${format(m.nextCalibration, 'dd MMM yyyy')}</td><td>${statusBadge('ok')}</td></tr>
  </tbody>
</table>

<div class="section-title">Historical Readings (sample)</div>
<table>
  <thead><tr><th>Time</th><th>pH</th><th>Temp (°C)</th><th>DO (mg/L)</th><th>BOD (mg/L)</th><th>Turbidity (NTU)</th></tr></thead>
  <tbody>${historyRows(history)}</tbody>
</table>

<div class="footer">
  Water-MaaS Environmental Monitoring Report &nbsp;|&nbsp;
  ${station.name} &mdash; ${factory.name} &nbsp;|&nbsp;
  This report contains simulated data generated for demonstration purposes only.
</div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 500);
}
