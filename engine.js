var LabEngine = (() => {
  const key = pair => [...pair].sort().join('|');
  const GPIO = ['uno:13', 'uno:2', 'uno:9'];
  const PLUS = 'uno:5v';
  const GROUND = 'uno:gnd';

  function validate(lesson, wires, blocks) {
    const expected = new Set(lesson.connections.map(key));
    const actual = new Set(wires.map(key));
    if ([...actual].some(k => !expected.has(k))) return {ok:false,message:'One wire goes to the wrong place. Remove it in the connection list and follow the next-wire guide.'};
    if ([...expected].some(k => !actual.has(k))) return {ok:false,message:`Connect all the wires first. ${expected.size-actual.size} still to go.`};
    if (blocks.length !== lesson.blocks.length || blocks.some((b,i)=>b!==lesson.blocks[i].type)) return {ok:false,message:'Your script needs a little adjustment. Add the blocks in the numbered recipe order.'};
    return {ok:true,message:'Circuit checked. Your experiment is running!'};
  }

  function graph(wires) {
    const adj = new Map();
    const touch = (a, b) => {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a).add(b);
      adj.get(b).add(a);
    };
    for (const pair of wires || []) touch(pair[0], pair[1]);
    const cache = new Map();
    const cluster = node => {
      if (cache.has(node)) return cache.get(node);
      const group = new Set();
      if (!adj.has(node)) {
        group.add(node);
        cache.set(node, group);
        return group;
      }
      const stack = [node];
      group.add(node);
      while (stack.length) {
        const cur = stack.pop();
        for (const next of adj.get(cur) || []) {
          if (group.has(next)) continue;
          group.add(next);
          stack.push(next);
        }
      }
      for (const member of group) cache.set(member, group);
      return group;
    };
    return (a, b) => cluster(a).has(b);
  }

  function smoke(hazard, why) {
    return {
      ok: false,
      smoked: true,
      hazard,
      message: 'Purple smoke! Power off and rewind that last wire.',
      why,
      led: 'off'
    };
  }

  function inspect(wires) {
    const linked = graph(wires);
    if (linked(PLUS, GROUND)) {
      return smoke('supply_short', '5V is shorted straight to GND. That path has almost no resistance, so current explodes and purple smoke comes out.');
    }
    for (const pin of GPIO) {
      if (linked(pin, GROUND)) {
        return smoke('gpio_short', 'A GPIO pin is shorted straight to ground. Outputs cannot sink that much current — purple smoke.');
      }
    }
    for (const pin of GPIO) {
      if (linked('servo:power', pin)) {
        return smoke('gpio_motor', 'Servo power is tied to a GPIO pin. Never use GPIO for motor power — motors need a real 5V supply. Purple smoke.');
      }
    }
    const anodeHot = linked('led:anode', PLUS) || GPIO.some(pin => linked('led:anode', pin));
    if (anodeHot && linked('led:cathode', GROUND)) {
      return smoke('led_unprotected', 'The LED is across a voltage source with no series resistor. LEDs need a current-limiting resistor or they burn — purple smoke.');
    }
    const ledReady = linked('uno:13', 'res:in') && linked('res:out', 'led:anode') && linked('led:cathode', GROUND);
    return {
      ok: true,
      smoked: false,
      hazard: null,
      message: ledReady ? 'Looks safe to try. Run it and see what happens.' : 'No purple smoke. Keep tinkering — or run it if you think it should work.',
      why: '',
      led: ledReady ? 'ready' : 'off'
    };
  }

  function play(wires, opts) {
    const report = inspect(wires);
    if (report.smoked) return report;
    const high = String((opts && opts.gpio && opts.gpio[13]) || '').toLowerCase() === 'high';
    if (report.led === 'ready') {
      return {
        ok: true,
        smoked: false,
        hazard: null,
        why: '',
        led: high ? 'on' : 'off',
        message: high ? 'LED is on. D13 is HIGH on a current-limited path.' : 'LED is off. Drive D13 HIGH to light it.'
      };
    }
    return report;
  }

  return {key, validate, inspect, play};
})();
