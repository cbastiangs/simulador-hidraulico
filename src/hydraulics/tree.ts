import { fittingsOf, missingAdapters, parseScenario, type Scenario, type ScenarioBranch } from "./scenario.ts";
import { METHODS, type MethodId, type FittingKind } from "./references.ts";
import { frictionLossPsi } from "./line.ts";
import type { SeriesResult, Fitting } from "./series.ts";
import type { Term } from "./laws.ts";
import { metersToFeet } from "./units.ts";

export type TreeIssue = {
  code: "allowance-gap" | "high-point" | "pressure-balance";
  segmentId: string | null;
  residualPsi: number;
};
export type TreeSegmentResult = {
  id: string | null;
  flowGpm: number;
  result: SeriesResult;
  branches: TreeSegmentResult[];
  isolated: boolean;
  inletPressurePsi: number | null;
  outletPressurePsi: number | null;
  wyeLossPsi: number;
};
export type ScenarioTreeResult = {
  totalFlowGpm: number;
  root: TreeSegmentResult;
  balanced: boolean;
  issues: TreeIssue[];
};

type Segment = Scenario | ScenarioBranch;
type Prepared = {
  segment: Segment;
  id: string | null;
  start: number;
  end: number;
  highest: number;
  resistance: number;
  fittings: Fitting[];
  fixed: number;
  step: number;
  disconnected: boolean;
  children: Prepared[];
};
type Evaluation = {
  q: number;
  derivative: number;
  head: number;
  childHead: number;
  isolated: boolean;
  dry: boolean;
  children: Evaluation[];
  issue?: TreeIssue;
};
const TOLERANCE = 1e-7;

/**
 * One source, diverging trees only (MODEL §2). Solve each junction's head:
 * H_in = H_junction + r_common (ΣQ_child(H_junction))² + AL(ΣQ_child).
 * Leaves have an analytical quadratic solution. Safeguarded Newton steps
 * accelerate the bounded search; the final energy residual is checked,
 * including discontinuous training allowances and dry-hose boundaries.
 */
export function solveScenarioTree(input: Scenario, methodId: MethodId = input.methodId): ScenarioTreeResult {
  const scenario = parseScenario(input);
  const method = METHODS[methodId];
  if (!method) throw new RangeError("Unknown hydraulic method");
  const k = method.psiPerMeterOfHeight;
  const threshold = method.fittingStep?.aboveGpm ?? Infinity;
  const fittingLoss = (kind: FittingKind | "wye", q: number) => {
    if (q <= 0) return 0;
    const fixed = kind === "wye" ? method.wyeLossPsi : method.fittingLossPsi?.[kind];
    return fixed != null ? fixed : q > threshold ? method.fittingStep?.lossPsi ?? 0 : 0;
  };
  function prepare(segment: Segment, start: number, id: string | null): Prepared {
    const projected: Scenario = {
      ...scenario, ...segment,
      source: id === null ? scenario.source : { kind: "fixed-pressure", pressurePsi: 0 },
      wye: segment.wye,
    };
    const fittings = fittingsOf(projected);
    const kinds: (FittingKind | "wye")[] = [...fittings.map((f) => f.kind), ...(segment.wye ? ["wye" as const] : [])];
    const fixed = kinds.reduce((sum, kind) => sum + (kind === "wye" ? method.wyeLossPsi ?? 0 : method.fittingLossPsi?.[kind] ?? 0), 0);
    const step = kinds.reduce((sum, kind) => sum + ((kind === "wye" ? method.wyeLossPsi : method.fittingLossPsi?.[kind]) == null ? method.fittingStep?.lossPsi ?? 0 : 0), 0);
    const end = segment.sections.at(-1)!.endElevationM;
    return {
      segment, id, start, end,
      highest: Math.max(start, ...segment.sections.map((s) => s.endElevationM)),
      resistance: segment.sections.reduce((sum, s) => sum + frictionLossPsi(s, 1), 0),
      fittings, fixed, step,
      disconnected: ("open" in segment && !segment.open) || missingAdapters(projected).length > 0,
      children: (segment.wye?.branches ?? []).map((child) => prepare(child, end, child.id)),
    };
  }
  const root = prepare(scenario, 0, null);
  const allowance = (node: Prepared, q: number) => q > 0 ? node.fixed + (q > threshold ? node.step : 0) : 0;
  function minimumPressure(node: Prepared, head: number, q: number): number {
    let h = head;
    let minimum = h - k * node.start;
    for (let i = 0; i < node.segment.sections.length; i++) {
      for (const f of node.fittings.filter((f) => f.joint === i)) h -= fittingLoss(f.kind, q);
      const section = node.segment.sections[i];
      h -= frictionLossPsi(section, q);
      minimum = Math.min(minimum, h - k * section.endElevationM);
    }
    return minimum;
  }
  function stopped(node: Prepared, head: number, isolated: boolean, dry: boolean, issue?: TreeIssue): Evaluation {
    return {
      q: 0, derivative: 0, head, childHead: head, isolated, dry, issue,
      children: node.children.map((child) => stopped(child, head, isolated || child.disconnected, dry)),
    };
  }
  function evaluate(node: Prepared, head: number): Evaluation {
    if (node.disconnected) return stopped(node, head, true, false);
    if (head <= k * node.highest) return stopped(node, head, false, true);
    if (!node.children.length) {
      if (!node.segment.nozzle.open) return stopped(node, head, false, false);
      const nozzle = node.segment.nozzle;
      const resistance = node.resistance + nozzle.ratedPressurePsi / nozzle.ratedFlowGpm ** 2;
      const available = head - k * node.end;
      let q = Math.sqrt(Math.max(0, available - node.fixed) / resistance);
      let issue: TreeIssue | undefined;
      if (available <= node.fixed) {
        issue = { code: "allowance-gap", segmentId: node.id, residualPsi: available };
      } else if (node.step && q > threshold) {
        const above = Math.sqrt(Math.max(0, available - node.fixed - node.step) / resistance);
        if (above <= threshold) {
          q = threshold;
          issue = { code: "allowance-gap", segmentId: node.id, residualPsi: available - node.fixed - resistance * q * q };
        } else q = above;
      }
      const minimum = minimumPressure(node, head, q);
      if (q > 0 && minimum < -TOLERANCE) {
        return stopped(node, head, false, true, { code: "high-point", segmentId: node.id, residualPsi: minimum });
      }
      return { q, derivative: q > 0 && !issue ? 1 / (2 * resistance * q) : 0,
        head, childHead: head - node.resistance * q * q - allowance(node, q), isolated: false, dry: false, children: [], issue };
    }
    let low = k * node.end;
    let high = head;
    let x = (low + high) / 2;
    let best: { x: number; q: number; derivative: number; residual: number; children: Evaluation[] } | undefined;
    // A finite bracket; exact zero-flow is evaluated at the static endpoint.
    for (let iteration = 0; iteration < 64; iteration++) {
      if (iteration === 0) x = high;
      const children = node.children.map((child) => evaluate(child, x));
      const q = children.reduce((sum, c) => sum + c.q, 0);
      const derivative = children.reduce((sum, c) => sum + c.derivative, 0);
      const residual = x + node.resistance * q * q + allowance(node, q) - head;
      if (!best || Math.abs(residual) < Math.abs(best.residual)) best = { x, q, derivative, residual, children };
      if (Math.abs(residual) <= TOLERANCE) break;
      if (residual > 0) high = x;
      else low = x;
      if (high - low <= 1e-10) break;
      const candidate = x - residual / (1 + 2 * node.resistance * q * derivative);
      x = candidate > low && candidate < high ? candidate : (low + high) / 2;
    }
    const solved = best!;
    const minimum = minimumPressure(node, head, solved.q);
    if (solved.q > 0 && minimum < -TOLERANCE) {
      return stopped(node, head, false, true, { code: "high-point", segmentId: node.id, residualPsi: minimum });
    }
    return {
      q: solved.q, derivative: solved.derivative / (1 + 2 * node.resistance * solved.q * solved.derivative),
      head, childHead: solved.x, children: solved.children, isolated: false, dry: false,
      ...(Math.abs(solved.residual) > TOLERANCE ? { issue: {
        code: node.fixed || node.step ? "allowance-gap" as const : "pressure-balance" as const,
        segmentId: node.id, residualPsi: solved.residual,
      } } : {}),
    };
  }
  const issues: TreeIssue[] = [];
  function report(node: Prepared, e: Evaluation): TreeSegmentResult {
    if (e.issue) issues.push(e.issue);
    const q = e.q;
    const localElevation = k * (node.end - node.start);
    let head = e.head;
    const nodes = [{ elevationM: node.start, pressurePsi: e.isolated ? NaN : head - k * node.start }];
    const terms: Term[] = [];
    for (let i = 0; i < node.segment.sections.length; i++) {
      for (const fitting of node.fittings.filter((f) => f.joint === i)) head -= fittingLoss(fitting.kind, q);
      const s = node.segment.sections[i];
      const friction = frictionLossPsi(s, q);
      head -= friction;
      nodes.push({ elevationM: s.endElevationM, pressurePsi: e.isolated ? NaN : head - k * s.endElevationM });
      terms.push({ lawId: "hose.friction", sectionIndex: i,
        inputs: { frictionCoefficient: s.frictionCoefficient, flowGpm: q, lengthFt: metersToFeet(s.lengthM) }, valuePsi: friction });
    }
    terms.push({ lawId: "elevation", inputs: { psiPerMeter: k, heightM: node.end - node.start }, valuePsi: localElevation });
    const appliances = [...node.fittings, ...(node.children.length ? [{ joint: node.segment.sections.length, kind: "wye" as const }] : [])];
    if (q > 0) for (const { joint, kind } of appliances) {
      const fixed = kind === "wye" ? method.wyeLossPsi : method.fittingLossPsi?.[kind];
      terms.push(fixed != null
        ? { lawId: "appliance.fixed", joint, kind, inputs: { lossPsi: fixed }, valuePsi: fittingLoss(kind, q) }
        : { lawId: "appliance.step", joint, kind, inputs: { aboveGpm: threshold, stepPsi: method.fittingStep?.lossPsi ?? 0, flowGpm: q }, valuePsi: fittingLoss(kind, q) });
    }
    if (q > 0 && !node.children.length) terms.push({ lawId: "nozzle.fixed-orifice", inputs: {
      ratedPressurePsi: node.segment.nozzle.ratedPressurePsi, ratedFlowGpm: node.segment.nozzle.ratedFlowGpm, flowGpm: q,
    }, valuePsi: node.segment.nozzle.ratedPressurePsi * (q / node.segment.nozzle.ratedFlowGpm) ** 2 });
    const outlet = e.isolated ? null : e.head - node.resistance * q * q - allowance(node, q) - k * node.end;
    const result: SeriesResult = {
      state: e.dry ? "no-pressure" : q > 0 ? "flowing" : "nozzle-closed", flowGpm: q, nodes,
      nozzlePressurePsi: outlet ?? NaN,
      frictionLossPsi: node.resistance * q * q, fittingLossPsi: allowance(node, q), elevationPressurePsi: localElevation,
      requiredPumpPressurePsi: node.children.length ? NaN : node.segment.nozzle.ratedPressurePsi
        + node.resistance * node.segment.nozzle.ratedFlowGpm ** 2 + localElevation + allowance(node, node.segment.nozzle.ratedFlowGpm),
      unsatisfied: null, terms,
    };
    return { id: node.id, flowGpm: q, result, isolated: e.isolated,
      inletPressurePsi: e.isolated ? null : e.head - k * node.start,
      outletPressurePsi: outlet, wyeLossPsi: node.children.length ? fittingLoss("wye", q) : 0,
      branches: node.children.map((child, i) => report(child, e.children[i])),
    };
  }
  const result = report(root, evaluate(root, scenario.source.pressurePsi));
  return { totalFlowGpm: result.flowGpm, root: result, balanced: issues.length === 0, issues };
}

/**
 * One pump-to-nozzle path through the tree, as a single series reading: the
 * feed's friction at the total flow, each wye's allowance at its inlet flow,
 * then the branch's own terms. Its terms sum to the pump pressure, so the
 * pressure split and the breakdown read the same as a single line's. Section
 * and joint indices count along the path. `path` names one branch per wye and
 * should end at a nozzle; it stops early at a missing id.
 */
export function pathResult(root: TreeSegmentResult, path: readonly string[]): SeriesResult {
  const chain = [root];
  for (const id of path) {
    const next = chain.at(-1)!.branches.find((b) => b.id === id);
    if (!next) break;
    chain.push(next);
  }
  const leaf = chain.at(-1)!;
  const nodes: SeriesResult["nodes"] = [];
  const terms: Term[] = [];
  let sections = 0;
  let heightM = 0;
  let psiPerMeter = 0;
  let elevationPsi = 0;
  for (const [i, segment] of chain.entries()) {
    const r = segment.result;
    nodes.push(...(i === 0 ? r.nodes : r.nodes.slice(1)));
    for (const t of r.terms) {
      if (t.lawId === "elevation") {
        heightM += t.inputs.heightM;
        psiPerMeter = t.inputs.psiPerMeter;
        elevationPsi += t.valuePsi;
      } else if (t.lawId === "hose.friction") terms.push({ ...t, sectionIndex: t.sectionIndex + sections });
      else if (t.lawId === "appliance.fixed" || t.lawId === "appliance.step") terms.push({ ...t, joint: t.joint + sections });
      else terms.push(t);
    }
    sections += r.nodes.length - 1;
  }
  terms.push({ lawId: "elevation", inputs: { psiPerMeter, heightM }, valuePsi: elevationPsi });
  const sum = (f: (r: SeriesResult) => number) => chain.reduce((a, s) => a + f(s.result), 0);
  return {
    state: chain.some((s) => s.isolated) ? "nozzle-closed" : leaf.result.state,
    flowGpm: leaf.flowGpm,
    nodes,
    nozzlePressurePsi: leaf.result.nozzlePressurePsi,
    frictionLossPsi: sum((r) => r.frictionLossPsi),
    fittingLossPsi: sum((r) => r.fittingLossPsi),
    elevationPressurePsi: elevationPsi,
    requiredPumpPressurePsi: NaN,
    unsatisfied: null,
    terms,
  };
}
