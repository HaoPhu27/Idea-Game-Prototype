(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
let scenariosById=Object.create(null);
let states=[];
let raf=0;
let observer=null;
const NUM_TWEEN=['x','y','scale','opacity'];
function clone(o){return o==null?o:JSON.parse(JSON.stringify(o));}
function lerp(a,b,p){return a+(b-a)*p;}
function indexScenarios(data){const m=Object.create(null);(data&&data.scenarios||[]).forEach(function(sc){if(sc&&sc.id)m[sc.id]=sc;});return m;}
function getMode(s){const modes=s.scenario&&s.scenario.modes||[];return modes.find(function(m){return m.id===s.modeId;})||modes[0];}
function sampleScene(key,seconds,modeId){
 const sc=scenariosById[key];
 if(!sc)return null;
 const modes=sc.modes||[];
 const mode=modes.find(function(m){return m.id===modeId;})||modes[0];
 if(!mode)return null;
 const frames=mode.frames||[];
 if(!frames.length)return null;
 let s=Number(seconds);
 if(!isFinite(s)||s<0)s=0;
 const dur=Number(mode.duration)||0;
 if(dur>0&&s>dur)s=s%dur;
 let idx=-1;
 for(let i=0;i<frames.length;i++){
  if(Number(frames[i].t)<=s+1e-9)idx=i;
  else break;
 }
 if(idx<0)return clone(frames[0]);
 const cur=frames[idx];
 if(Math.abs(s-Number(cur.t))<1e-9)return clone(cur);
 const next=frames[idx+1];
 if(!next)return clone(cur);
 const nt=Number(next.t);
 if(s>=nt-1e-9)return clone(next);
 const ct=Number(cur.t);
 const span=nt-ct;
 if(span<=0)return clone(next);
 const p=(s-ct)/span;
 const out=clone(cur);
 if(out.pointer&&next.pointer&&typeof out.pointer==='object'&&typeof next.pointer==='object'){
  NUM_TWEEN.forEach(function(k){
   if(k==='x'||k==='y'){
    if(typeof out.pointer[k]==='number'&&typeof next.pointer[k]==='number')out.pointer[k]=lerp(out.pointer[k],next.pointer[k],p);
   }
  });
 }
 Object.keys(out).forEach(function(name){
  const a=out[name];
  const b=next[name];
  if(!Array.isArray(a)||!Array.isArray(b))return;
  const byId=Object.create(null);
  b.forEach(function(e){if(e&&typeof e==='object'&&e.id!=null)byId[e.id]=e;});
  out[name]=a.map(function(e){
   if(!e||typeof e!=='object'||e.id==null)return e;
   const ne=byId[e.id];
   if(!ne)return e;
   const merged=Object.assign({},e);
   NUM_TWEEN.forEach(function(prop){
    if(typeof merged[prop]==='number'&&typeof ne[prop]==='number')merged[prop]=lerp(merged[prop],ne[prop],p);
   });
   if(typeof merged.remaining==='number'&&typeof ne.remaining==='number')merged.remaining=lerp(merged.remaining,ne.remaining,p);
   return merged;
  });
 });
 return out;
}
function styleControl(el){el.style.minWidth='44px';el.style.width='auto';el.style.height='44px';el.style.margin='4px';}
function updateControls(s){
 const paused=!s.playing;
 s.pauseBtn.textContent=paused?'Chạy tiếp':'Tạm dừng';
 s.pauseBtn.setAttribute('aria-label',paused?'Chạy tiếp':'Tạm dừng');
 s.pauseBtn.setAttribute('aria-pressed',paused?'true':'false');
}
function renderState(s){
 const mode=getMode(s);
 const dur=mode?Number(mode.duration)||0:0;
 const scene=sampleScene(s.key,s.time,s.modeId);
 if(scene&&window.FactoryScene&&typeof window.FactoryScene.render==='function')window.FactoryScene.render(s.svg,scene);
 s.caption.textContent=scene&&scene.caption!=null?String(scene.caption):'';
 s.progress.textContent=s.time.toFixed(1)+' / '+dur.toFixed(1)+' giây';
}
function buildStage(root,sc){
 const modes=sc.modes||[];
 const first=modes[0];
 root.innerHTML='';
 const svg=document.createElementNS(NS,'svg');
 svg.setAttribute('width','420');
 svg.setAttribute('height','540');
 svg.setAttribute('viewBox','0 0 420 540');
 svg.setAttribute('role','img');
 svg.setAttribute('aria-label',sc.title||sc.id);
 root.appendChild(svg);
 const caption=document.createElement('div');
 caption.className='demo-caption';
 caption.setAttribute('aria-live','off');
 caption.style.maxWidth='none';
 root.appendChild(caption);
 const progress=document.createElement('div');
 progress.className='demo-progress';
 root.appendChild(progress);
 const controls=document.createElement('div');
 controls.className='fd-controls';
 root.appendChild(controls);
 const pauseBtn=document.createElement('button');
 pauseBtn.type='button';
 styleControl(pauseBtn);
 const replayBtn=document.createElement('button');
 replayBtn.type='button';
 replayBtn.textContent='Xem lại';
 replayBtn.setAttribute('aria-label','Xem lại');
 styleControl(replayBtn);
 const stepBtn=document.createElement('button');
 stepBtn.type='button';
 stepBtn.textContent='Từng bước';
 stepBtn.setAttribute('aria-label','Từng bước');
 styleControl(stepBtn);
 const state={key:sc.id,scenario:sc,modeId:first?first.id:null,time:0,playing:!reduced,visible:false,lastTs:null,root:root,svg:svg,caption:caption,progress:progress,pauseBtn:pauseBtn,select:null};
 pauseBtn.addEventListener('click',function(){state.playing=!state.playing;state.lastTs=null;updateControls(state);});
 replayBtn.addEventListener('click',function(){state.time=0;state.lastTs=null;renderState(state);});
 stepBtn.addEventListener('click',function(){
  state.playing=false;
  state.lastTs=null;
  const mode=getMode(state);
  const frames=mode&&mode.frames||[];
  const next=frames.find(function(f){return Number(f.t)>state.time+1e-6;});
  state.time=next?Number(next.t):0;
  updateControls(state);
  renderState(state);
 });
 controls.appendChild(pauseBtn);
 controls.appendChild(replayBtn);
 controls.appendChild(stepBtn);
 if(modes.length>1){
  const select=document.createElement('select');
  styleControl(select);
  select.setAttribute('aria-label','Chọn chế độ');
  modes.forEach(function(m){const o=document.createElement('option');o.value=m.id;o.textContent=m.label||m.id;select.appendChild(o);});
  select.value=state.modeId;
  select.addEventListener('change',function(){state.modeId=select.value;state.time=0;state.lastTs=null;renderState(state);});
  state.select=select;
  controls.appendChild(select);
 }
 root.setAttribute('data-demo-mounted','true');
 renderState(state);
 updateControls(state);
 return state;
}
function showError(el,msg){
 el.innerHTML='';
 const p=document.createElement('p');
 p.setAttribute('role','alert');
 p.className='demo-error';
 p.textContent=msg;
 el.appendChild(p);
}
function loadData(){return fetch('authored-storyboards.json?v=queue-top-v4-20261110',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});}
function setupObserver(){
 if(observer){observer.disconnect();observer=null;}
 states.forEach(function(s){s.visible=false;s.lastTs=null;});
 if(typeof IntersectionObserver!=='function'){states.forEach(function(s){s.visible=true;});return;}
 observer=new IntersectionObserver(function(entries){
  entries.forEach(function(en){
   const s=states.find(function(st){return st.root===en.target;});
   if(!s)return;
   const v=!!en.isIntersecting;
   if(s.visible!==v){s.visible=v;s.lastTs=null;}
  });
 },{threshold:.05});
 states.forEach(function(s){observer.observe(s.root);});
}
function onVisibility(){states.forEach(function(s){s.lastTs=null;});}
function tick(ts){
 if(document.hidden){
  states.forEach(function(s){s.lastTs=null;});
 }else{
  states.forEach(function(s){
   if(!s.visible||!s.playing){s.lastTs=null;return;}
   if(s.lastTs==null){s.lastTs=ts;return;}
   const dt=(ts-s.lastTs)/1000;
   s.lastTs=ts;
   if(dt<=0)return;
   const mode=getMode(s);
   const dur=mode?Number(mode.duration)||0:0;
   if(dur>0){s.time+=dt;if(s.time>=dur)s.time=s.time%dur;}
   renderState(s);
  });
 }
 raf=requestAnimationFrame(tick);
}
function pauseAll(){states.forEach(function(s){s.playing=false;s.lastTs=null;updateControls(s);});}
function resumeAll(){states.forEach(function(s){s.playing=true;s.lastTs=null;updateControls(s);});}
function cleanup(){
 if(raf){cancelAnimationFrame(raf);raf=0;}
 if(observer){observer.disconnect();observer=null;}
 document.removeEventListener('visibilitychange',onVisibility);
 window.removeEventListener('pagehide',cleanup);
}
async function mountAll(){
 const els=Array.prototype.slice.call(document.querySelectorAll('[data-mechanic]'));
 if(!els.length)return states;
 if(states.length&&els.every(function(el){return el.querySelector('svg');}))return states;
 let data;
 try{data=await loadData();}catch(e){els.forEach(function(el){showError(el,'Không thể tải dữ liệu hoạt hình.');});return states;}
 scenariosById=indexScenarios(data);
 states=[];
 if(observer){observer.disconnect();observer=null;}
 els.forEach(function(el){
  const key=el.getAttribute('data-mechanic');
  const sc=scenariosById[key];
  if(!sc||!sc.modes||!sc.modes.length){showError(el,'Không tìm thấy kịch bản: '+key);return;}
  states.push(buildStage(el,sc));
 });
 setupObserver();
 states.forEach(function(s){renderState(s);});
 return states;
}
async function start(){
 if(document.readyState==='loading')await new Promise(function(r){document.addEventListener('DOMContentLoaded',r,{once:true});});
 await mountAll();
 if(!raf)raf=requestAnimationFrame(tick);
 return states;
}
window.addEventListener('pagehide',cleanup,{once:true});
document.addEventListener('visibilitychange',onVisibility);
const ready=start();
window.FactoryDemo={ready:ready,mountAll:mountAll,pauseAll:pauseAll,resumeAll:resumeAll,sampleScene:sampleScene};
})();