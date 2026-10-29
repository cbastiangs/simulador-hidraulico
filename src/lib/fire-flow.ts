import { pathResult, type ScenarioTreeResult } from '../hydraulics/scenario.ts';
import type { SeriesResult } from '../hydraulics/series.ts';
import { compareNfaFireFlow, calculateNfaFireFlow } from '../extinguishment/fire-flow.ts';
import { pathKey, terminals, type AppDocument } from './document.ts';

/** Aggregate terminal delivery only; upstream shared-feed terms are never summed. */
export function exerciseReadings(doc: AppDocument, single: SeriesResult, network: ScenarioTreeResult | null) {
  if (!doc.exercise) return null;
  const e = doc.exercise;
  const root = network?.root.result ?? single;
  const empty = root.pump?.status === 'empty';
  const unavailable = !empty && (root.pump?.pressurePsi === null || (network ? !network.balanced : single.issues.length > 0));
  const lines = terminals(doc.scenario).map(t => {
    const r = network ? pathResult(network.root, t.path) : single;
    const flowGpm = empty ? 0 : unavailable || r.issues.length > 0 ? null : r.flowGpm;
    return { ...t, flowGpm, status: empty ? 'Tanque vacío' : r.state === 'isolated' ? 'Aislada' : !t.nozzle.open ? 'Pitón cerrado' : null, assigned: e.assignments.find(a => pathKey(a.path) === pathKey(t.path)) };
  });
  const selected = lines.filter(t => t.assigned);
  const delivered = selected.length && selected.every(t => t.flowGpm !== null)
    ? selected.reduce((sum, t) => sum + t.flowGpm!, 0) : null;
  const input = { floorAreaM2: e.lengthM * e.widthM, involvedFraction: e.involvedFraction };
  return { lines, reference: calculateNfaFireFlow(input), comparison: delivered === null ? null : compareNfaFireFlow(input, delivered), unavailable: selected.filter(t => t.flowGpm === null).map(t => t.name) };
}
