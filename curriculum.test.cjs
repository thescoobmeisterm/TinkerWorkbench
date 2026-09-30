const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function lessons() {
  const filename = path.join(__dirname, 'curriculum.js');
  assert.ok(fs.existsSync(filename), 'curriculum.js must exist');
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  return JSON.parse(JSON.stringify(context.window.LESSONS));
}

test('LED lessons preserve a current-limited D13 path and an active-low button', () => {
  const data = lessons();
  for (const lesson of data.slice(0, 3)) {
    hasEdge(lesson, 'uno:13', 'res:in');
    hasEdge(lesson, 'res:out', 'led:anode');
    hasEdge(lesson, 'led:cathode', 'rail:minus');
    assert.match(lesson.hardware, /220 ohm/);
  }
  assert.deepEqual(data.map(lesson => lesson.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(data[0].blocks.map(block => block.type), ['start', 'on']);
  assert.deepEqual(data[1].blocks.map(block => block.type), ['start', 'repeat', 'on', 'off']);
  hasEdge(data[2], 'uno:2', 'button:out');
  hasEdge(data[2], 'button:gnd', 'rail:minus');
  assert.match(JSON.stringify(data[2].blocks), /INPUT_PULLUP/);
  assert.match(JSON.stringify(data[2].blocks), /LOW → D13 HIGH/);
});

test('servo lessons distinguish simulated power from safe real wiring', () => {
  const data = lessons();
  for (const lesson of data.slice(3)) {
    hasEdge(lesson, 'servo:power', 'rail:plus');
    hasEdge(lesson, 'servo:ground', 'rail:minus');
    hasEdge(lesson, 'uno:9', 'servo:signal');
    assert.match(lesson.hardware, /external regulated 5V/);
    assert.match(lesson.hardware, /not the board supply/);
    assert.match(lesson.hardware, /Never use GPIO for motor power/);
    assert.match(lesson.hardware, /shared GND/);
    assert.match(lesson.hardware, /simulation shortcut/);
  }
  assert.ok(data[3].blocks.some(block => block.type === 'sweep'));
  hasEdge(data[4], 'pot:power', 'rail:plus');
  hasEdge(data[4], 'pot:ground', 'rail:minus');
  hasEdge(data[4], 'pot:wiper', 'uno:a0');
  assert.deepEqual(data[4].blocks.map(block => block.type), ['start', 'read', 'map', 'servo']);
  assert.match(data[4].hardware, /10 kohm/);
  assert.match(data[4].hardware, /separate positive rails/);
});

test('each lesson includes power-off and honest trainer limitations', () => {
  for (const lesson of lessons()) {
    assert.match(lesson.hardware, /power off|Disconnect USB and other power/i);
    assert.match(lesson.hardware, /breadboard/i);
    assert.match(lesson.hardware, /not SPICE/i);
    assert.match(lesson.hardware, /no actual USB|not.*actual USB/i);
  }
});

const terminals = new Set('uno:5v uno:gnd uno:13 uno:2 uno:9 uno:a0 rail:plus rail:minus res:in res:out led:anode led:cathode button:out button:gnd servo:power servo:ground servo:signal pot:power pot:ground pot:wiper'.split(' '));
const types = new Set('start on wait off repeat button sweep read map servo'.split(' '));
function hasEdge(lesson, a, b) {
  assert.ok(lesson.connections.some(edge => edge.includes(a) && edge.includes(b)), `${lesson.title}: missing ${a} → ${b}`);
}

test('browser curriculum provides five complete guided lessons with valid contracts', () => {
  const data = lessons();
  assert.equal(data.length, 5);
  assert.equal(new Set(data.map(lesson => lesson.id)).size, 5);
  for (const lesson of data) {
    assert.deepEqual(Object.keys(lesson).sort(), ['id', 'title', 'subtitle', 'concept', 'parts', 'steps', 'connections', 'blocks', 'hardware'].sort());
    for (const key of ['title', 'subtitle', 'concept', 'hardware']) assert.ok(typeof lesson[key] === 'string' && lesson[key].trim());
    for (const key of ['parts', 'steps']) {
      assert.ok(Array.isArray(lesson[key]) && lesson[key].length);
      assert.ok(lesson[key].every(value => typeof value === 'string' && value.trim()));
    }
    assert.ok(lesson.connections.length);
    for (const edge of lesson.connections) {
      assert.equal(edge.length, 2);
      assert.notEqual(edge[0], edge[1]);
      assert.ok(edge.every(terminal => terminals.has(terminal)));
    }
    assert.ok(lesson.blocks.length > 0 && lesson.blocks.length <= 4);
    for (const block of lesson.blocks) {
      assert.deepEqual(Object.keys(block).sort(), ['label', 'type']);
      assert.ok(types.has(block.type));
      assert.ok(typeof block.label === 'string' && block.label.trim());
    }
    hasEdge(lesson, 'uno:5v', 'rail:plus');
    hasEdge(lesson, 'uno:gnd', 'rail:minus');
  }
});
