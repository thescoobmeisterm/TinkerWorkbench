# Ignite · Tinkerer's Robot Lab

A local, dependency-free HTML learning app for the **Ignite Tinkerers Spark Table**. Open `index.html` in a browser, run `npm start` and visit http://127.0.0.1:5186, or quote the in-repo launcher:

```bash
bash "/absolute/path/to/TinkerersRobotLab/Launch Tinkerers Robot Lab.desktop"
```

That starts a local server, waits until http://127.0.0.1:5186 answers, and opens the default browser. Leave the terminal open; Ctrl+C stops the server. `tinkerers-robot-lab.desktop` is a FreeDesktop app-menu spec — do not execute it as a shell script.


## The learning loop

Pick an experiment → tap two labeled component terminals to connect a wire → add script blocks in recipe order → run the demonstration → mark the level complete.

1. Light a red LED — polarity, a complete circuit, current limiting.
2. Blink an LED — timing and repetition.
3. Button-controlled LED — digital input.
4. Sweep a servo — controlled movement.
5. Potentiometer-controlled servo — analog input mapped to an angle.

Any level can be selected, useful for a drop-in learning table. All controls support tapping and keyboard focus. Progress is stored locally in this browser; no accounts or external requests. Reset build clears only the current circuit and script, not completed levels.

## Sandbox (purple smoke)

After the five experiments, **Sandbox** is free play on the same bench. There is no recipe. Wire any two labeled pins, then run it. The sandbox palette includes every unique script block from the five lessons (setup, on, off, repeat, button, sweep, read, map, servo) so you can mix blink, button, sweep, or pot-to-servo programs.

Harmless purple smoke puffs — with a one-sentence why — when you:

- short 5V straight to GND
- wire an LED across a voltage source with no series resistor
- short a GPIO pin straight to ground
- power a servo from a GPIO pin (never do this on hardware)

Nothing is actually destroyed. Clear the air, rewind the last wire, and try again. This is still not SPICE: only those hazards are checked.

## Scope and honesty

This is a **guided connection trainer**, not SPICE, an arbitrary electronics simulator, or a USB-connected hardware editor. Components are pre-placed; labeled terminals are interactive, breadboard holes are illustrative. It validates the lesson's specified connection pairs and ordered block recipe, then demonstrates the lesson behavior. It does not solve arbitrary equivalent circuits, simulate voltage/current, execute general programs, upload Arduino sketches, or detect real wiring. No Arduino is required to try it.

The real-parts guide explains a conventional Arduino Uno R3 setup. Servo diagrams use a simplified simulated rail: a physical servo needs a suitably rated external regulated 5 V supply with common ground, not a GPIO supply. Power off before rewiring; never connect mains. A facilitator should inspect hardware before it is powered.

## Acceptance and verification

Primary target: desktop, tablet, and phone browsers at a learning table. Layout reflows: laptop keeps the two-column workbench, iPad stacks the mission beside the bench, phone uses a single column with a horizontal level picker. Tap targets stay at least 36×44 px. One complete circuit-to-script-to-running loop on every level, clear next-wire guidance, rejected incorrect wiring/scripts, interactive button and potentiometer, completion persistence, no browser script errors.

Run `npm install`, `npm test`, and `npm run test:browser`. Browser tests use system Chromium at `/usr/bin/chromium` (adjust `playwright.config.cjs` on another platform). The app itself needs no build step or packages. Python 3 is needed only for the optional local server.

Real hardware operation and educator/user acceptance require on-table testing. Deferred: movable breadboard components, electrical network solving, freeform script execution, Arduino code export/upload, and separate learner profiles.
