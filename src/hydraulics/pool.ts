import { metersToFeet } from "./units.ts";

export type PoolSupply = { liftM: number; diameterIn?: 5 | 6 };
export const POOL = { minLiftM: 0.5, maxLiftM: 3, minGpm: 250, maxGpm: 1000 } as const;
// Waterous F-2093 fig. 3: gpm, then loss (ft) for single 5- and 6-inch suctions.
const losses = [
  [250, 0.5, 0.2], [350, 1, 0.4], [375, 1.2, 0.5], [500, 2.1, 0.9],
  [525, 2.3, 0.9], [625, 3.3, 1.3], [700, 4.1, 1.7], [750, 4.7, 1.9],
  [875, 6.5, 2.6], [1000, 8.4, 3.4],
] as const;

export function parsePool(value: unknown): PoolSupply {
  const liftM = (value as PoolSupply)?.liftM;
  if (!Number.isFinite(liftM) || liftM < POOL.minLiftM || liftM > POOL.maxLiftM)
    throw new RangeError("Lift outside pool range");
  const diameterIn = (value as PoolSupply).diameterIn;
  if (diameterIn === undefined) return { liftM };
  if (diameterIn !== 5 && diameterIn !== 6) throw new RangeError("Unsupported pool suction diameter");
  return { liftM, diameterIn };
}

export function poolIntakePsi(pool: PoolSupply, q: number): number | null {
  const liftFt = metersToFeet(parsePool(pool).liftM);
  if (q === 0) return -liftFt / 2.31;
  if (q < POOL.minGpm) return null;
  for (let i = 1; i < losses.length; i++) {
    const column = pool.diameterIn === 6 ? 2 : 1;
    const a = losses[i-1][0], b = losses[i][0];
    const low = losses[i-1][column], high = losses[i][column];
    if (q <= b) return -(liftFt + low + (high-low)*(q-a)/(b-a)) / 2.31;
  }
  return null;
}
