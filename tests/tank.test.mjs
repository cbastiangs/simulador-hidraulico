import test from 'node:test';
import assert from 'node:assert/strict';
import { drainTank, tankMinutes } from '../src/hydraulics/tank.ts';
import { parseScenario, solveScenarioTree } from '../src/hydraulics/scenario.ts';
import { readFileSync } from 'node:fs';

test('tank volume conservation: 1000 gal at 250 gpm lasts 4 min; empty supply stops all delivery',()=>{
  // Hand arithmetic: 250 gal/min × 2 min = 500 gal, twice empties 1000 gal.
  let tank={capacityGal:1000,remainingGal:1000};
  assert.equal(tankMinutes(tank,250),4);
  tank=drainTank(tank,250,120);assert.equal(tank.remainingGal,500);
  assert.equal(tankMinutes(tank,250),2);
  assert.equal(tankMinutes(tank,0),null);assert.equal(tankMinutes(tank,null),null);
  assert.deepEqual(drainTank(tank,0,120),tank);
  tank=drainTank(tank,250,130);assert.equal(tank.remainingGal,0);
  const s=parseScenario(JSON.parse(readFileSync(new URL('../data/presets/segunda-descarga.json',import.meta.url))));
  s.source.tank=tank;
  const dry=solveScenarioTree(s);
  assert.equal(dry.totalFlowGpm,0);assert.equal(dry.root.result.pump.status,'empty');
  for(const b of dry.root.branches){assert.equal(b.flowGpm,0);assert.equal(b.outletPressurePsi,null);}
});
