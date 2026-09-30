/* Plain browser data for a guided connection trainer, not a SPICE simulator.
   Programs are teaching blocks; this file does not connect to USB hardware. */
window.LESSONS = [
  {
    id: 1,
    title: 'Light an LED',
    subtitle: 'Build your first complete circuit',
    concept: 'A digital output drives current through a resistor and LED to ground. LED polarity matters; the resistor limits current.',
    parts: ['Arduino UNO R3 (5V logic)', 'Breadboard and jumper wires', 'Red LED', '220 ohm resistor'],
    steps: [
      'Power off before wiring. Connect UNO 5V to the + rail and GND to the − rail.',
      'Connect D13 to resistor IN, resistor OUT to the LED anode, and the LED cathode to the − rail.',
      'Check the complete path, then run the blocks: configure D13 as OUTPUT and set it HIGH.'
    ],
    connections: [['uno:5v', 'rail:plus'], ['uno:gnd', 'rail:minus'], ['uno:13', 'res:in'], ['res:out', 'led:anode'], ['led:cathode', 'rail:minus']],
    blocks: [{ type: 'start', label: 'Setup: D13 = OUTPUT' }, { type: 'on', label: 'D13 HIGH → LED on' }],
    hardware: 'Use a common UNO R3 with 5V logic, a red LED, and a series 220 ohm resistor. The long LED lead is normally the anode (+); the short lead / flat rim marks the cathode (−). Breadboard groups of five holes connect on each side of the center gap, not across it; power rails run lengthwise and may be split, so check continuity with power off and bridge only matching rail sections. Keep resistor leads in separate groups. Disconnect USB and other power before wiring. This guided connection trainer is not SPICE, does not validate real current, and has no actual USB integration.'
  },
  {
    id: 2,
    title: 'Blink LED',
    subtitle: 'Make time part of your program',
    concept: 'A repeating sequence alternates HIGH and LOW. Each state needs a delay so the blink is visible.',
    parts: ['Arduino UNO R3 (5V logic)', 'Breadboard and jumper wires', 'Red LED', '220 ohm resistor'],
    steps: [
      'Power off. Wire 5V to + and GND to −; keep the D13 → 220 ohm resistor → LED anode path.',
      'Connect the LED cathode to − and check that no breadboard row bypasses the resistor.',
      'Run the repeating program: HIGH for 500 ms, then LOW for 500 ms. A full cycle takes one second.'
    ],
    connections: [['uno:5v', 'rail:plus'], ['uno:gnd', 'rail:minus'], ['uno:13', 'res:in'], ['res:out', 'led:anode'], ['led:cathode', 'rail:minus']],
    blocks: [{ type: 'start', label: 'Setup: D13 = OUTPUT' }, { type: 'repeat', label: 'Forever: repeat the next two blocks' }, { type: 'on', label: 'D13 HIGH; wait 500 ms' }, { type: 'off', label: 'D13 LOW; wait 500 ms' }],
    hardware: 'Use the UNO R3 5V circuit with a red LED and series 220 ohm resistor, never an LED directly across an output and ground. Power off before moving wires. Breadboard five-hole groups connect internally; the center gap separates them and power rails may be split. The rail supply does not replace the D13 signal connection. Blocks express a guided program, not SPICE or an actual USB upload.'
  },
  {
    id: 3,
    title: 'Button LED',
    subtitle: 'Read an active-low input',
    concept: 'INPUT_PULLUP holds D2 HIGH when the button is released. Pressing the button connects D2 to GND, so LOW means pressed.',
    parts: ['Arduino UNO R3 (5V logic)', 'Breadboard and jumper wires', 'Red LED', '220 ohm resistor', 'Normally-open momentary pushbutton'],
    steps: [
      'Power off. Connect the supply rails and the D13 → resistor → LED → − circuit.',
      'Connect D2 to button OUT and button GND to the − rail. The button must close this path only when pressed.',
      'Configure D2 as INPUT_PULLUP. Run the loop: pressed (LOW) turns the LED on; released (HIGH) turns it off.'
    ],
    connections: [['uno:5v', 'rail:plus'], ['uno:gnd', 'rail:minus'], ['uno:13', 'res:in'], ['res:out', 'led:anode'], ['led:cathode', 'rail:minus'], ['uno:2', 'button:out'], ['button:gnd', 'rail:minus']],
    blocks: [{ type: 'start', label: 'Setup: D13 OUTPUT; D2 INPUT_PULLUP' }, { type: 'repeat', label: 'Forever: check the button' }, { type: 'button', label: 'D2 LOW → D13 HIGH; otherwise D13 LOW' }],
    hardware: 'Use a 5V UNO R3, red LED, and series 220 ohm resistor. INPUT_PULLUP needs no external pull-down resistor: wire the normally-open switch between D2 and GND, not 5V. On a four-leg tactile switch, each pair may already be internally joined; check with power off and choose contacts that connect only on a press. Straddle the breadboard center gap as appropriate and verify split rail continuity. Mechanical contacts bounce; this level-following example is not a debounced press counter. Power off before rewiring. Guided trainer only: not SPICE and no actual USB integration.'
  },
  {
    id: 4,
    title: 'Servo sweep',
    subtitle: 'Control position with a signal',
    concept: 'The D9 control signal requests a servo angle; a separate power path supplies the motor. Sweep slowly between safe endpoints.',
    parts: ['Arduino UNO R3 (5V logic)', 'Breadboard and jumper wires', 'SG90 positional servo', 'External regulated 5V servo supply with adequate current capacity'],
    steps: [
      'With power off, wire the simulated 5V and GND rails. Connect servo POWER to + and servo GROUND to −.',
      'Connect D9 to servo SIGNAL. In this trainer the UNO 5V rail is only a simulation shortcut; use the external supply described below for real hardware.',
      'Run a slow 20° to 160° sweep and back. Keep the horn clear and stop if the mechanism binds.'
    ],
    connections: [['uno:5v', 'rail:plus'], ['uno:gnd', 'rail:minus'], ['servo:power', 'rail:plus'], ['servo:ground', 'rail:minus'], ['uno:9', 'servo:signal']],
    blocks: [{ type: 'start', label: 'Attach servo control to D9' }, { type: 'repeat', label: 'Forever: repeat the sweep' }, { type: 'sweep', label: '20° → 160° → 20°; 1° per 20 ms' }],
    hardware: 'The UNO-powered servo rail is a simulation shortcut. For a real SG90, use an external regulated 5V supply of adequate current capacity for startup/stall (check the servo specifications; allow at least 1A for one small SG90 and more if required), not the board supply. Never use GPIO for motor power. Connect external +5V to the servo power rail INSTEAD of UNO 5V; do not join external +5V to the UNO 5V/USB supply. Connect external GND, servo ground, and UNO GND together (shared GND); D9 carries signal only. Typical SG90 colors: red power, brown ground, orange signal; verify your unit. Power off both supplies before wiring. Check breadboard rail splits and connection/current ratings. Use unloaded conservative angles and stop on buzzing or binding. This is a guided connection trainer, not SPICE, and has no actual USB integration.'
  },
  {
    id: 5,
    title: 'Potentiometer servo',
    subtitle: 'Map an analog reading to an angle',
    concept: 'A potentiometer is a voltage divider. A0 reads 0–1023 on a 5V UNO R3; map that range to a conservative servo angle of 20°–160°.',
    parts: ['Arduino UNO R3 (5V logic)', 'Breadboard and jumper wires', 'SG90 positional servo', '10 kohm linear potentiometer', 'External regulated 5V servo supply with adequate current capacity'],
    steps: [
      'Power off. Wire the simulated supply rails and servo: POWER to +, GROUND to −, SIGNAL to D9.',
      'Connect the potentiometer outer terminals POWER to + and GROUND to −; connect its center WIPER to A0.',
      'Run the repeating read → map → servo program. Turn the knob slowly to move the servo between 20° and 160°.',
      'For real hardware, separate the servo supply from the UNO 5V rail as described below; retain shared GND.'
    ],
    connections: [['uno:5v', 'rail:plus'], ['uno:gnd', 'rail:minus'], ['servo:power', 'rail:plus'], ['servo:ground', 'rail:minus'], ['uno:9', 'servo:signal'], ['pot:power', 'rail:plus'], ['pot:ground', 'rail:minus'], ['pot:wiper', 'uno:a0']],
    blocks: [{ type: 'start', label: 'Attach servo to D9; repeat next three blocks' }, { type: 'read', label: 'Read A0 → value (0–1023)' }, { type: 'map', label: 'Map value 0–1023 → angle 20°–160°' }, { type: 'servo', label: 'Write angle to D9 servo; wait 20 ms' }],
    hardware: 'Use a 10 kohm linear pot: outer terminals across UNO 5V and GND, center wiper to A0; reversing outer leads reverses direction. Keep A0 within 0V–UNO 5V. For a real SG90 use an external regulated 5V supply of adequate startup/stall current capacity (check specifications; allow at least 1A for one small SG90 and more if required), not the board supply. Never use GPIO for motor power. The shared + rail is a simulation shortcut: on hardware use separate positive rails, UNO 5V for the pot and external +5V for the servo; never tie the two positive supplies together. Join external GND, UNO GND, pot ground, and servo ground (shared GND). D9 is signal only. Power off all supplies before wiring; verify breadboard five-hole groups, center-gap isolation, split rails, and current ratings. Keep the horn clear and stop on binding. Guided connection trainer only, not SPICE; no actual USB integration.'
  }
];
