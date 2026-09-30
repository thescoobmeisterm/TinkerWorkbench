(() => {
'use strict';
const $ = s => document.querySelector(s);
let current=0,sandbox=false,wires=[],blocks=[],selected=null,running=false,timer=null,angle=0,done=[];
try {const saved=JSON.parse(localStorage.getItem('ignite-progress')||'[]');if(Array.isArray(saved))done=[...new Set(saved.filter(n=>Number.isInteger(n)&&n>=1&&n<=5))];}catch{}
const names={'uno:5v':'UNO 5V','uno:gnd':'UNO GND','uno:13':'UNO D13','uno:2':'UNO D2','uno:9':'UNO D9','uno:a0':'UNO A0','rail:plus':'+ rail','rail:minus':'− rail','res:in':'Resistor IN','res:out':'Resistor OUT','led:anode':'LED +','led:cathode':'LED −','button:out':'Button OUT','button:gnd':'Button GND','servo:power':'Servo +','servo:ground':'Servo GND','servo:signal':'Servo signal','pot:power':'Pot +','pot:ground':'Pot GND','pot:wiper':'Pot wiper'};
const SANDBOX_BLOCKS=[{type:'start',label:'Setup: D13 = OUTPUT'},{type:'on',label:'D13 HIGH → LED on'},{type:'off',label:'D13 LOW → LED off'}];
const SANDBOX_HARDWARE='Sandbox is a hazard playground on the same virtual bench, not SPICE and not a USB-connected Arduino. Dead shorts, an LED with no series resistor, a GPIO pin jammed to ground, and a servo powered from a GPIO pin puff harmless purple smoke and tell you why. A physical short can destroy parts for real: power off before rewiring, never use GPIO for motor power, and ask a facilitator to inspect hardware before you apply power.';
const lesson=()=>LESSONS[current];
const pin=(id,label,cls='')=>`<button class="pin ${cls}" data-pin="${id}" aria-label="Connect ${names[id]}">${label}</button>`;
function status(message,error=false){$('#status').textContent=message;$('#status').classList.toggle('error',error);}
function hideSmoke(){$('#board').classList.remove('smoked');if($('#smoke'))$('#smoke').hidden=true;}
function showSmoke(why){$('#board').classList.add('smoked');$('#smoke').hidden=false;$('#smoke-why').textContent=why;}
function stop(){clearInterval(timer);timer=null;running=false;$('#run').textContent='▶ Run experiment';$('#finish').hidden=true;$('#led-bulb')?.classList.remove('lit');hideSmoke();}
function renderNav(){ $('#levels').innerHTML=LESSONS.map((l,i)=>`<button class="level ${!sandbox&&i===current?'active':''}" data-level="${i}" ${!sandbox&&i===current?'aria-current="step"':''}><span class="level-number">${done.includes(l.id)?'✓':l.id}</span><span><strong>${l.title}</strong><small>${['Your first circuit','Make a rhythm','Add an input','Make it move','You’re in control'][i]}</small></span></button>`).join('')+`<button class="level sandbox-level ${sandbox?'active':''}" data-sandbox="1" ${sandbox?'aria-current="step"':''}><span class="level-number">∞</span><span><strong>Sandbox</strong><small>Purple smoke allowed</small></span></button>`;$('#progress-label').textContent=`${done.length} of 5 experiments complete`;$('#progress-bar').style.width=`${done.length/5*100}%`;}
function partsHtml(kind){
  const led=`<div class="part led-part"><div class="part-name">RED LED</div><div id="led-bulb" class="led-bulb"></div><div class="part-pins">${pin('led:anode','+ long')}${pin('led:cathode','− short')}</div></div>`;
  const res=`<div class="part res-part"><div class="part-name">220 Ω RESISTOR</div><div class="resistor"></div><div class="part-pins">${pin('res:in','IN')}${pin('res:out','OUT')}</div></div>`;
  const button=`<div class="part button-part"><div class="part-name">BUTTON</div><div class="part-pins">${pin('button:out','OUT')}${pin('button:gnd','GND')}</div></div>`;
  const servo=`<div class="part servo-part"><div class="part-name">SG90 SERVO</div><div class="servo-body"><div class="servo-horn" id="servo-horn"></div></div><div class="part-pins">${pin('servo:power','+ red')}${pin('servo:ground','GND')}${pin('servo:signal','Signal')}</div></div>`;
  const pot=`<div class="part pot-part"><div class="part-name">10 kΩ POT</div><div class="knob"></div><div class="part-pins">${pin('pot:power','+')}${pin('pot:ground','GND')}${pin('pot:wiper','Wiper')}</div></div>`;
  if(kind==='all') return led+res+button+servo+pot;
  if(kind==='led') return led+res;
  if(kind==='button') return led+res+button;
  if(kind==='servo') return servo;
  return servo+pot;
}
function attachLive(){
  const range=$('#pot-value');if(range)range.addEventListener('input',()=>{angle=Math.round(20+Number(range.value)*140/1023);$('#analog-label').textContent=`Analog input: ${range.value} / 1023 · Output: ${angle}°`;if(running)setServo(angle);});
  const button=$('#press-button');if(button){const set=v=>{if(running)$('#led-bulb')?.classList.toggle('lit',v);};button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);set(true);});['pointerup','pointercancel','lostpointercapture','blur'].forEach(type=>button.addEventListener(type,()=>set(false)));button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();set(true);}});button.addEventListener('keyup',()=>set(false));}
}
function loadSandbox(){
  $('#lesson-tag').textContent='SANDBOX · TRY ANYTHING';
  $('h1').textContent='Purple smoke playground';
  $('#subtitle').textContent='Wire anything. If you mess up, the magic smoke comes out.';
  $('#mission-title').textContent='Break it. Then fix it.';
  $('#concept').textContent='A real bench punishes dead shorts and unprotected parts. This sandbox does too — with harmless purple smoke and a sentence about why. Reset, rewind the last wire, and try again.';
  $('#parts-list').replaceChildren(...['Arduino UNO R3 (5V logic)','Breadboard and jumper wires','Red LED','220 ohm resistor','Momentary pushbutton','SG90 servo','10 kohm potentiometer'].map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  $('#steps').replaceChildren(...['Tap any two labeled pins. There is no recipe.','Skip the resistor, short 5V to GND, or power a servo from a GPIO pin if you want to see purple smoke.','Add blocks if you want a program, then run it. Smoke means power off and rethink — nothing here is actually destroyed.'].map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  $('#uno-pins').innerHTML=[['uno:5v','5V'],['uno:gnd','GND'],['uno:13','D13'],['uno:2','D2'],['uno:9','D9'],['uno:a0','A0']].map(([id,label])=>pin(id,label)).join('');
  $('#rails').innerHTML=pin('rail:plus','+ POWER','rail-pin plus')+pin('rail:minus','− GROUND','rail-pin minus');
  $('#parts-on-board').innerHTML=partsHtml('all');
  $('#live-controls').innerHTML='<button id="press-button" class="primary">Press virtual button</button><label for="pot-value">Turn the potentiometer <strong id="angle-label">20°</strong></label><input type="range" id="pot-value" min="0" max="1023" value="0"><span id="analog-label">Analog input: 0 / 1023 · Output: 20°</span>';
  $('#block-palette').innerHTML=SANDBOX_BLOCKS.map((b,n)=>`<button class="block" data-add="${n}"><small>${n+1}</small>${b.label}<em>＋</em></button>`).join('');
  renderScript();renderWires();status('Tap any two pins. Run it when you are curious — or reckless.');
  attachLive();
}
function load(i){
  stop();sandbox=i==='sandbox';if(!sandbox)current=i;wires=[];blocks=[];selected=null;document.body.classList.toggle('sandbox',sandbox);renderNav();
  if(sandbox){loadSandbox();return;}
  const l=lesson();$('#lesson-tag').textContent=`EXPERIMENT 0${l.id} / 05 · START SOMETHING`; $('h1').textContent=l.title;$('#subtitle').textContent=l.subtitle;$('#mission-title').textContent=['Let there be light.','Find your rhythm.','Give it a nudge.','Meet your first motor.','Turn curiosity into motion.'][i];$('#concept').textContent=l.concept;$('#parts-list').replaceChildren(...l.parts.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));$('#steps').replaceChildren(...l.steps.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  const pins=new Set(l.connections.flat());$('#uno-pins').innerHTML=[['uno:5v','5V'],['uno:gnd','GND'],['uno:13','D13'],['uno:2','D2'],['uno:9','D9'],['uno:a0','A0']].filter(([id])=>pins.has(id)).map(([id,label])=>pin(id,label)).join('');$('#rails').innerHTML=pin('rail:plus','+ POWER','rail-pin plus')+pin('rail:minus','− GROUND','rail-pin minus');
  $('#parts-on-board').innerHTML=i<3?partsHtml(i===2?'button':'led'):partsHtml(i===4?'pot':'servo');
  $('#live-controls').innerHTML=i===2?'<button id="press-button" class="primary">Press virtual button</button><span> LED follows the button while running.</span>':i===4?'<label for="pot-value">Turn the potentiometer <strong id="angle-label">20°</strong></label><input type="range" id="pot-value" min="0" max="1023" value="0"><span id="analog-label">Analog input: 0 / 1023 · Output: 20°</span>':i===3?'<span id="angle-label">Servo position: 20° — run your script to start the sweep.</span>':'';
  $('#block-palette').innerHTML=l.blocks.map((b,n)=>`<button class="block" data-add="${n}"><small>${n+1}</small>${b.label}<em>＋</em></button>`).join('');renderScript();renderWires();status('Connect your wires, add your blocks, then see what happens.');
  attachLive();
}
function palette(){return sandbox?SANDBOX_BLOCKS:lesson().blocks;}
function renderScript(){const root=$('#script');root.innerHTML=blocks.length?blocks.map((type,n)=>{const b=palette().find(b=>b.type===type);return `<button class="block" data-remove-block="${n}" aria-label="Remove block ${n+1}: ${b.label}">${b.label}<em>×</em></button>`;}).join(''):'<div class="empty-script">Your idea starts here.<br>← Tap the first block.</div>';}
function renderWires(){
  if(sandbox){
    $('#next-wire').innerHTML=selected?`Now tap the other pin. Selected: <b>${names[selected]}</b> · tap again to cancel.`:'Tap any two pins. There is no recipe here — shorts puff purple smoke.';
    document.querySelectorAll('[data-pin]').forEach(p=>{p.classList.toggle('selected',p.dataset.pin===selected);p.classList.remove('hint');});
  }else{
    const next=lesson().connections.find(pair=>!wires.some(w=>LabEngine.key(w)===LabEngine.key(pair)));
    $('#next-wire').innerHTML=selected?`Now tap the other pin. Selected: <b>${names[selected]}</b> · tap again to cancel.`:next?`Next wire <b>${names[next[0]]}</b> → <b>${names[next[1]]}</b> <span>· tap both pins</span>`:'✓ All recipe wires connected. Now build your script below.';
    document.querySelectorAll('[data-pin]').forEach(p=>{p.classList.toggle('selected',p.dataset.pin===selected);p.classList.toggle('hint',!!next&&next.includes(p.dataset.pin));});
  }
  $('#wire-count').textContent=`Your connections · ${wires.length} wires (tap to review or remove)`;
  $('#wire-list').innerHTML=wires.map((w,n)=>`<div><span>${names[w[0]]} → ${names[w[1]]}</span><button data-remove-wire="${n}" aria-label="Remove wire ${n+1}">Remove ×</button></div>`).join('');
  requestAnimationFrame(drawWires);
}
function drawWires(){const r=$('#board').getBoundingClientRect();$('#wires').innerHTML=wires.map((w,i)=>{const a=document.querySelector(`[data-pin="${w[0]}"]`).getBoundingClientRect(),b=document.querySelector(`[data-pin="${w[1]}"]`).getBoundingClientRect();const x1=a.left+a.width/2-r.left,y1=a.top+12-r.top,x2=b.left+b.width/2-r.left,y2=b.top+12-r.top;const color=w.some(id=>/gnd|ground|minus|cathode/.test(id))?'#52655a':w.some(id=>/5v|plus|power/.test(id))?'#d27158':'#c39436';return `<path d="M${x1},${y1} C${x1},${y1+30+i*3} ${x2},${y2+30+i*3} ${x2},${y2}" fill="none" stroke="#f8f7ef" stroke-width="6"/><path d="M${x1},${y1} C${x1},${y1+30+i*3} ${x2},${y2+30+i*3} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;}).join('');}
function setServo(value){$('#servo-horn').style.transform=`rotate(${value-90}deg)`;$('#angle-label').textContent=`Servo position: ${value}°`;}
function runSandbox(){
  if(!wires.length){status('Nothing connected yet. Tap two pins to start.');return;}
  const last=[...blocks].reverse().find(t=>t==='on'||t==='off');
  const result=LabEngine.play(wires,{gpio:{13:last==='on'?'high':'low'}});
  status(result.message,result.smoked);
  if(result.smoked){showSmoke(result.why);return;}
  running=true;$('#run').textContent='■ Stop experiment';
  if(result.led==='on')$('#led-bulb')?.classList.add('lit');
}
function run(){if(running){stop();status('Simulation paused. Your circuit is ready when you are.');return;}if(sandbox){runSandbox();return;}const result=LabEngine.validate(lesson(),wires,blocks);status(result.message,!result.ok);if(!result.ok)return;running=true;$('#run').textContent='■ Stop experiment';$('#finish').hidden=false;if(current===0)$('#led-bulb').classList.add('lit');if(current===1){$('#led-bulb').classList.add('lit');timer=setInterval(()=>$('#led-bulb').classList.toggle('lit'),500);}if(current===3){let value=20,dir=1;setServo(20);timer=setInterval(()=>{value+=dir*2;if(value>=160||value<=20)dir*=-1;setServo(value);},40);}if(current===4)setServo(Math.round(20+Number($('#pot-value').value)*140/1023));}
document.addEventListener('click',e=>{const pinEl=e.target.closest('[data-pin]');if(pinEl){stop();const id=pinEl.dataset.pin;if(!selected)selected=id;else if(selected===id)selected=null;else{const pair=[selected,id];if(!wires.some(w=>LabEngine.key(w)===LabEngine.key(pair)))wires.push(pair);selected=null;}renderWires();status(sandbox?'Keep connecting. Run it when you want to know if it smokes.':'Keep connecting. The highlighted pins show your next wire.');return;}const sand=e.target.closest('[data-sandbox]');if(sand){load('sandbox');return;}const level=e.target.closest('[data-level]');if(level)load(Number(level.dataset.level));const add=e.target.closest('[data-add]');if(add){stop();if(blocks.length>=12){status('Script is full. Remove a block or clear the script.',true);return;}blocks.push(palette()[Number(add.dataset.add)].type);renderScript();}const remove=e.target.closest('[data-remove-block]');if(remove){stop();blocks.splice(Number(remove.dataset.removeBlock),1);renderScript();}const wire=e.target.closest('[data-remove-wire]');if(wire){stop();wires.splice(Number(wire.dataset.removeWire),1);renderWires();}});
$('#run').onclick=run;$('#reset').onclick=()=>load(sandbox?'sandbox':current);$('#clear-script').onclick=()=>{stop();blocks=[];renderScript();};$('#finish').onclick=()=>{if(!running||sandbox)return;if(!done.includes(lesson().id))done.push(lesson().id);let storageNote='';try{localStorage.setItem('ignite-progress',JSON.stringify(done));}catch{storageNote=' This browser could not save progress; keep this tab open.';}renderNav();$('#success-copy').textContent=`${lesson().title} — complete. ${lesson().concept}${storageNote}`;$('#next-level').textContent=current<4?'Next experiment →':'Back to your first spark →';$('#completion').showModal();};$('#next-level').onclick=()=>{$('#completion').close();load(current<4?current+1:0);};$('#keep-tinkering').onclick=()=>$('#completion').close();
function info(title,text){$('#info-title').textContent=title;$('#info-body').replaceChildren();for(const paragraph of text.split('\n')){const p=document.createElement('p');p.textContent=paragraph;$('#info-body').append(p);}$('#info').showModal();}
$('#help').onclick=()=>info('A spark starts with a connection.','1. Pick any experiment. Start with level 1 if you’re new.\n2. Tap the two labeled pins in the next-wire guide. The line is your jumper wire. Open Your connections to remove mistakes.\n3. Add the instruction blocks in their numbered order. Tap a block in your script to remove it.\n4. Run the experiment. Fix any hints, then mark your level complete.\nWant to go off-script? Open Sandbox. There is no recipe. Dead shorts, a missing LED resistor, and a servo powered from a GPIO pin puff purple smoke and tell you why. Nothing is actually destroyed.\nThis is a guided connection-and-script trainer, not a full electrical simulator. Components are pre-placed, and the script recipe is checked before its behavior is demonstrated. Breadboard holes are illustrative; connect the labeled terminals. No USB device is connected and no code is uploaded.\nCompleted levels are saved in this browser when storage is available. Shared table? Everyone shares the same progress in this browser.');$('#hardware').onclick=()=>info('From screen to spark table',(sandbox?SANDBOX_HARDWARE:lesson().hardware)+'\nAlways disconnect power before moving wires. Use only low-voltage electronics; ask a facilitator to check your circuit before powering it. This app does not validate or control your physical circuit.');document.querySelectorAll('.close,.close-info').forEach(b=>b.onclick=()=>$('#info').close());$('#clear-smoke')?.addEventListener('click',()=>{hideSmoke();status('Smoke cleared. Rewind the last wire and try a different idea.');});new ResizeObserver(drawWires).observe($('#board'));load(0);
})();
