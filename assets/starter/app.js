/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { mountSculpture } from '../runtime/motion.js';
import { createTimeline } from '../runtime/timeline.js';
import { STYLES, PALETTES, MOTIONS, TRANSITIONS, PROJECTIONS, resolveDesign, applyDesign, materialColors } from '../runtime/designs.js';
import { makeScene } from './scenes.js';
import initial from './config.js';

const host = document.querySelector('[data-particle-studio]');
const canvas = host.querySelector('canvas');
const button = document.querySelector('#pause');
const sequence = document.querySelector('#sequence');
const progress = document.querySelector('#progress');
const controls = Object.fromEntries(['style','palette','theme','motion','transition','projection'].map(key=>[key,document.getElementById(key)]));
for (const [key,catalogue] of Object.entries({style:STYLES,palette:PALETTES,motion:MOTIONS,transition:TRANSITIONS,projection:PROJECTIONS})) {
  for (const [value,item] of Object.entries(catalogue)) controls[key].add(new Option(typeof item === 'string' ? item : item.name,value));
}
const query = Object.fromEntries([...new URLSearchParams(location.search)].filter(([key])=>Object.hasOwn(controls,key)));
let settings, inputs={...initial,...query};
try { settings=resolveDesign(inputs); }
catch(error) { inputs=initial;settings=resolveDesign(initial); const notice=document.querySelector('#notice'); notice.hidden=false; notice.textContent=`${error.message}. Showing the starting direction.`; }
const overrides=Object.fromEntries(Object.entries(inputs).filter(([key])=>key!=='style'&&Object.hasOwn(controls,key)));
let owner, timeline, userPaused=navigator.connection?.saveData===true;

function updateDesign() {
  applyDesign(host,settings);
  for(const [key,control] of Object.entries(controls))control.value=settings[key];
  const preset=STYLES[settings.style];
  document.querySelector('#direction').textContent=`0${Object.keys(STYLES).indexOf(settings.style)+1} / ${preset.name}`;
  document.querySelector('#title').textContent=preset.title;
  document.querySelector('#description').textContent=preset.description;
  document.querySelector('#subject').textContent=preset.subject;
  owner?.configure({projection:settings.projection,materials:materialColors(settings)});
  const params=new URLSearchParams(settings);
  history.replaceState(null,'',`${location.pathname}?${params}${location.hash}`);
}
function mount() {
  owner?.dispose();
  timeline=createTimeline([makeScene(settings.style,settings,0),makeScene(settings.style,settings,1)],{hold:5,morph:1.8,transition:settings.transition});
  owner=mountSculpture(canvas,timeline,{
    render:{projection:settings.projection,materials:materialColors(settings)},
    onState(state) {
    button.textContent = state === 'paused' ? 'Play' : state === 'reduced' ? 'Reduced motion' : 'Pause';
    button.setAttribute('aria-pressed', String(state === 'paused'));
    button.disabled = state === 'reduced' || state === 'unsupported';
    document.querySelector('#fallback').hidden = state !== 'unsupported';
      document.querySelector('#hint').textContent=state==='reduced'?'Still, at your preference.':state==='paused'?'Paused. Take a closer look.':state==='unsupported'?'Explore the choices below.':'Move through the points.';
    },
  });
  if(userPaused)owner?.pause(true);
  if(!sequence.checked)owner?.seek(Number(progress.value));
}
for(const [key,control] of Object.entries(controls)) control.addEventListener('change',()=>{
  if(key==='style') { Object.assign(settings,resolveDesign({style:control.value,...overrides})); progress.value='0'; }
  else {settings[key]=control.value;overrides[key]=control.value;}
  updateDesign();
  if(key==='style')mount();
  else { if(key==='transition')timeline.setTransition(settings.transition); owner?.refresh(); }
});
document.querySelector('#reset').addEventListener('click',()=>{
  for(const key of Object.keys(overrides))delete overrides[key];
  Object.assign(settings,resolveDesign({style:settings.style}));
  updateDesign();timeline.setTransition(settings.transition);owner?.refresh();
});
button.addEventListener('click',()=>{userPaused=!userPaused;owner?.pause(userPaused);});
sequence.addEventListener('change',()=>sequence.checked?owner?.select(null):owner?.seek(Number(progress.value)));
progress.addEventListener('input',()=>{sequence.checked=false;owner?.seek(Number(progress.value));});
updateDesign(); mount();
// A small inspection hook supports the same real-browser checks as the original demo.
window.particleStudio={inspect:()=>({...owner?.inspect(),design:{...settings}})};
window.addEventListener('pagehide', event => { if (!event.persisted) owner?.dispose(); });
