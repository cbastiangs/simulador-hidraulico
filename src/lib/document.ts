import { branchesOf, parseScenario, ScenarioError, type Scenario, type ScenarioBranch } from '../hydraulics/scenario.ts';

export type Assignment = { path: string[]; role: 'attack' | 'confinement' | 'backup' };
export type Exercise = { lengthM: number; widthM: number; involvedFraction: number; assignments: Assignment[] };
export type AppDocument = { schema: 'simulador-hidraulico/document'; version: 1; scenario: Scenario; exercise?: Exercise };
export const wrapScenario = (scenario: Scenario): AppDocument => ({ schema: 'simulador-hidraulico/document', version: 1, scenario });
export const pathKey = (path: readonly string[]) => JSON.stringify(path);
export function terminals(scenario: Scenario) {
  const out: { path: string[]; name: string; nozzle: Scenario['nozzle'] }[] = [];
  function visit(s: Scenario | ScenarioBranch, path: string[], names: string[]) {
    const children = branchesOf(s);
    if (!children.length && s.sections.length && s.nozzle.design !== 'open-end') out.push({ path, name: names.join(' › ') || 'Línea principal', nozzle: s.nozzle });
    for (const child of children) visit(child, [...path, child.id], [...names, child.name]);
  }
  visit(scenario, [], []);
  return out;
}
function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ScenarioError(path, 'Expected object');
  return value as Record<string, unknown>;
}
export function parseDocument(value: unknown): AppDocument {
  const raw = object(value, 'document');
  if (raw.schema === 'simulador-hidraulico/scenario') return wrapScenario(parseScenario(value));
  if (raw.schema !== 'simulador-hidraulico/document') throw new ScenarioError('schema', 'Unknown document');
  if (raw.version !== 1) throw new ScenarioError('version', 'Unsupported document version');
  const doc = wrapScenario(parseScenario(raw.scenario));
  if (raw.exercise === undefined) return doc;
  const e = object(raw.exercise, 'exercise');
  const number = (key: string, min: number, max: number) => {
    const n = e[key];
    if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) throw new ScenarioError(`exercise.${key}`, 'Outside supported range');
    return n;
  };
  const lengthM = number('lengthM', 0.1, 1000), widthM = number('widthM', 0.1, 1000), involvedFraction = number('involvedFraction', 0, 1);
  if (!Array.isArray(e.assignments)) throw new ScenarioError('exercise.assignments', 'Expected array');
  const valid = new Set(terminals(doc.scenario).map(t => pathKey(t.path))), seen = new Set<string>();
  const assignments = e.assignments.map((value, i): Assignment => {
    const a = object(value, `exercise.assignments.${i}`);
    if (!Array.isArray(a.path) || !a.path.every(id => typeof id === 'string') || !['attack', 'confinement', 'backup'].includes(String(a.role))) throw new ScenarioError(`exercise.assignments.${i}`, 'Invalid assignment');
    const path = a.path as string[], key = pathKey(path);
    if (!valid.has(key) || seen.has(key)) throw new ScenarioError(`exercise.assignments.${i}.path`, 'Missing, ineligible or duplicate terminal');
    seen.add(key);
    return { path: [...path], role: a.role as Assignment['role'] };
  });
  return { ...doc, exercise: { lengthM, widthM, involvedFraction, assignments } };
}
/** Keep old hydraulic-only exports readable by the previous app. */
export const portableDocument = (doc: AppDocument) => doc.exercise ? doc : doc.scenario;

/** Removal/replacement clears assignments in the same edit; undo restores both. */
export function withScenario(doc: AppDocument, scenario: Scenario): AppDocument {
  if (!doc.exercise) return { ...doc, scenario };
  const before = terminals(doc.scenario), after = terminals(scenario);
  const assignments = doc.exercise.assignments.filter(a => {
    const old = before.find(t => pathKey(t.path) === pathKey(a.path));
    const next = after.find(t => pathKey(t.path) === pathKey(a.path));
    return old && next && old.nozzle.specId === next.nozzle.specId && old.nozzle.design === next.nozzle.design && old.nozzle.tipIn === next.nozzle.tipIn;
  });
  return { ...doc, scenario, exercise: assignments.length === doc.exercise.assignments.length ? doc.exercise : { ...doc.exercise, assignments } };
}
