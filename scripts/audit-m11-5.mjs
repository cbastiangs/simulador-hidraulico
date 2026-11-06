// Read-only comparison: never fits or modifies the runtime pump curve.
import { readFile } from 'node:fs/promises';
import { WATEROUS_CX, parsePump, scaledPumpCurve, pumpPressureAt } from '../src/hydraulics/pump.ts';

// Owner handoff: docs/reference/vehicles/m11-5/README.md.
// Conditional interpretation: shaft rpm = engine rpm × 2.27.
const ratio = 2.27;
const csv = await readFile(new URL('../docs/reference/vehicles/m11-5/pump-rating-points.csv', import.meta.url), 'utf8');
const [header, ...rows] = csv.trim().split(/\r?\n/);
if (!header.startsWith('flow_us_gpm,discharge_psi,engine_rpm,')) throw new Error('Unexpected plate CSV columns');
const comparisons = rows.map(row => {
  // Only the first three, numeric columns of this specific evidence file.
  const [flowGpm, recordedPressurePsi, engineRpm] = row.split(',').slice(0, 3).map(Number);
  if (![flowGpm, recordedPressurePsi, engineRpm].every(n => Number.isFinite(n) && n > 0)) throw new Error('Invalid plate evidence');
  const shaftRpm = engineRpm * ratio;
  if (shaftRpm < WATEROUS_CX.minRpm || shaftRpm > WATEROUS_CX.maxRpm) {
    return { flowGpm, recordedPressurePsi, engineRpm, shaftRpm, status: 'outside-speed-domain' };
  }
  const curve = scaledPumpCurve(parsePump({ curve: WATEROUS_CX, mode: 'rpm', speedRpm: shaftRpm }));
  const modelPressurePsi = pumpPressureAt(curve, flowGpm);
  return { flowGpm, recordedPressurePsi, engineRpm, shaftRpm,
    maxSupportedFlowGpm: curve.at(-1).flowGpm, modelPressurePsi,
    differencePsi: modelPressurePsi === null ? null : modelPressurePsi - recordedPressurePsi,
    status: modelPressurePsi === null ? 'outside-flow-domain' : 'comparison-only' };
});
console.log(JSON.stringify({
  apparatus: 'M11-5', curveId: WATEROUS_CX.id,
  assumptions: ['Shaft rpm = engine rpm × 2.27; confirm gearing and speed labels.',
    'Recorded discharge pressure compared directly with model net pressure; intake pressure is unknown.'],
  recordedGovernorRpm: 2400, conditionalGovernorShaftRpm: 2400 * ratio,
  modelShaftRpmRange: [WATEROUS_CX.minRpm, WATEROUS_CX.maxRpm],
  calibrated: false, comparisons,
}, null, 2));
