import test from 'node:test';
import assert from 'node:assert/strict';
import { WATEROUS_CX, scaledPumpCurve, pumpPressureAt, solvePump } from '../src/hydraulics/pump.ts';
import { parseScenario, solveScenario, solveScenarioTree, pathResult } from '../src/hydraulics/scenario.ts';
const near=(a,b,t=1e-5)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b} ± ${t}`);
const config=(mode='pressure',speedRpm=4000)=>({curve:structuredClone(WATEROUS_CX),mode,speedRpm});
const hose={hoseSizeId:null,diameterIn:2.5,frictionCoefficient:2,lengthM:0,endElevationM:0};
const nozzle={kind:'fixed-orifice',specId:null,settingsGpm:[],ratedFlowGpm:1000,ratedPressurePsi:202,open:true,pattern:0};
const lay=()=>({schema:'simulador-hidraulico/scenario',version:1,name:'CX arithmetic',methodId:'physical',source:{kind:'fixed-pressure',pressurePsi:250,pump:config()},sections:[hose],nozzle});

test('CX curve: independent F-2115 4000 rpm operating points within graph/table read-off tolerance',()=>{
  // F-2115 revision 2022-08-16 p.1, independently of 810304 chart digitization.
  near(pumpPressureAt(WATEROUS_CX.points,1050),200,5);
  near(pumpPressureAt(WATEROUS_CX.points,1500),150,5);
  assert.equal(pumpPressureAt(WATEROUS_CX.points,1601),null);
});
test('pump affinity: 80% speed gives 80% flow and 64% head',()=>{
  // Hand arithmetic: (1000,202) at 4000 → (800,129.28) at 3200.
  near(pumpPressureAt(scaledPumpCurve(config('rpm',3200)),800),129.28);
});
test('pump/lay balance: governor, RPM, shared branches, closed nozzle and domain boundary',()=>{
  // Zero hose loss; nozzle takes 1000 at 202 psi, exactly a chart node.
  const s=parseScenario(lay());
  let r=solveScenario(s);near(r.flowGpm,1000);near(r.nodes[0].pressurePsi,202);assert.equal(r.pump.status,'limited');
  const held=solveScenario({...s,source:{...s.source,pressurePsi:100}});
  near(held.flowGpm,1000*Math.sqrt(100/202));near(held.pump.pressurePsi,100);assert.equal(held.pump.status,'holding');
  const rpm={...s,source:{...s.source,pump:config('rpm')}};
  r=solveScenario({...rpm,nozzle:{...nozzle,open:false}});near(r.pump.pressurePsi,224);near(r.flowGpm,0);
  // CGBVP bifurco loss 5 psi: each of two leaves takes 500 gpm at 197 psi.
  const branch=id=>({id,name:id,open:true,sections:[hose],nozzle:{...nozzle,ratedFlowGpm:500,ratedPressurePsi:197}});
  const tree={...s,methodId:'cgbvp-2019',wye:{branches:[branch('a'),branch('b')]}};
  const both=solveScenarioTree(tree);near(both.totalFlowGpm,1000);near(both.root.result.pump.pressurePsi,202);
  near(pathResult(both.root,['a']).flowGpm,500);
  const one=solveScenarioTree({...tree,wye:{branches:[branch('a'),{...branch('b'),open:false}]}});
  assert.ok(one.root.result.pump.pressurePsi>both.root.result.pump.pressurePsi);
  near(one.root.result.terms.reduce((n,t)=>n+t.valuePsi,0)+one.root.outletPressurePsi,one.root.inletPressurePsi);
  const outside=solveScenario({...rpm,nozzle:{...nozzle,ratedFlowGpm:10000,ratedPressurePsi:100}});
  assert.equal(outside.pump.status,'outside-curve');assert.equal(outside.pump.flowGpm,null);assert.equal(outside.nodes[0].pressurePsi,null);
  // Numeric curve survives sharing; a catalog name does not replace its values.
  const copy=JSON.parse(JSON.stringify(s));copy.source.pump.curve.id='archived-curve';
  near(solveScenario(parseScenario(copy)).pump.pressurePsi,202);
});
