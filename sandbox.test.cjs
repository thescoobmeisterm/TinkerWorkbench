const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function engine() {
  const c = {};
  vm.createContext(c);
  vm.runInContext(fs.readFileSync(__dirname + '/engine.js', 'utf8'), c);
  return c.LabEngine;
}

const ledSafe = [
  ['uno:5v', 'rail:plus'],
  ['uno:gnd', 'rail:minus'],
  ['uno:13', 'res:in'],
  ['res:out', 'led:anode'],
  ['led:cathode', 'rail:minus']
];

test('sandbox inspects free wiring and puffs purple smoke on a dead short', () => {
  const e = engine();
  assert.equal(typeof e.inspect, 'function');
  const shorted = e.inspect([['uno:5v', 'uno:gnd']]);
  assert.equal(shorted.smoked, true);
  assert.equal(shorted.ok, false);
  assert.equal(shorted.hazard, 'supply_short');
  assert.match(shorted.message, /purple smoke/i);
  assert.match(shorted.why, /5V.*GND|short/i);
});

test('sandbox smokes an LED wired across supply with no resistor', () => {
  const e = engine();
  const fried = e.inspect([
    ['uno:5v', 'rail:plus'],
    ['uno:gnd', 'rail:minus'],
    ['led:anode', 'rail:plus'],
    ['led:cathode', 'rail:minus']
  ]);
  assert.equal(fried.smoked, true);
  assert.equal(fried.hazard, 'led_unprotected');
  assert.match(fried.why, /resistor/i);
});

test('sandbox smokes a servo powered from a GPIO pin', () => {
  const e = engine();
  const fried = e.inspect([
    ['uno:gnd', 'rail:minus'],
    ['servo:power', 'uno:9'],
    ['servo:ground', 'rail:minus'],
    ['servo:signal', 'uno:13']
  ]);
  assert.equal(fried.smoked, true);
  assert.equal(fried.hazard, 'gpio_motor');
  assert.match(fried.why, /GPIO|never.*motor power/i);
});

test('sandbox smokes a GPIO pin shorted straight to ground', () => {
  const e = engine();
  const fried = e.inspect([['uno:13', 'uno:gnd']]);
  assert.equal(fried.smoked, true);
  assert.equal(fried.hazard, 'gpio_short');
});

test('sandbox allows the current-limited LED path and reports no smoke', () => {
  const e = engine();
  const safe = e.inspect(ledSafe);
  assert.equal(safe.smoked, false);
  assert.equal(safe.ok, true);
  assert.equal(safe.hazard, null);
  assert.equal(safe.led, 'ready');
});

test('sandbox play lights the LED when D13 is driven on the safe path', () => {
  const e = engine();
  const lit = e.play(ledSafe, {gpio: {13: 'high'}});
  assert.equal(lit.smoked, false);
  assert.equal(lit.led, 'on');
  const off = e.play(ledSafe, {gpio: {13: 'low'}});
  assert.equal(off.led, 'off');
});

test('sandbox programs reuse every unique lesson block type', () => {
  const e = engine();
  assert.equal(typeof e.programMode, 'function');
  assert.equal(e.programMode(['start', 'on']), 'led_on');
  assert.equal(e.programMode(['start', 'repeat', 'on', 'off']), 'blink');
  assert.equal(e.programMode(['start', 'repeat', 'button']), 'button');
  assert.equal(e.programMode(['start', 'repeat', 'sweep']), 'sweep');
  assert.equal(e.programMode(['start', 'read', 'map', 'servo']), 'pot');
  assert.equal(e.programMode(['start', 'off']), 'led_off');
  assert.equal(e.programMode([]), 'idle');
});
