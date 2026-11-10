(function(){'use strict';
var NS='http://www.w3.org/2000/svg';
var ASSETS='assets/';
var COL={navy:'#1f2b4d',honey:'#d99a3c',honeyD:'#b87a24',belt:'#8a8f9c',beltD:'#5c6270',rail:'#c6cbd6',cleat:'#9aa1b0',slot:'#f3f0e6',queC:'#dfe6ee'};
function el(tag,attrs,parent){var n=document.createElementNS(NS,tag);if(attrs){for(var k in attrs){n.setAttribute(k,attrs[k]);}}if(parent)parent.appendChild(n);return n;}
function txt(parent,x,y,s,attrs){attrs=attrs||{};attrs.x=x;attrs.y=y;var t=el('text',attrs,parent);t.textContent=String(s);return t;}
var STYLE={fontFamily:'Verdana,Geneva,Arial,sans-serif'};
function clearSVG(svg){while(svg.firstChild)svg.removeChild(svg.firstChild);}
function wrapLabel(s,max){s=String(s||'');if(s.length<=max)return[s];var words=s.split(' '),lines=[],cur='';
for(var i=0;i<words.length;i++){var w=words[i];if(!cur){cur=w;}else if((cur+' '+w).length<=max){cur+=' '+w;}else{lines.push(cur);cur=w;}}
if(cur)lines.push(cur);return lines.slice(0,2);}
function render(svg,scene){
if(!svg||!scene)return;
clearSVG(svg);
svg.setAttribute('viewBox','0 0 420 540');
svg.setAttribute('role','img');
svg.setAttribute('aria-label',scene.caption||'Factory scene');
svg.style.width='100%';svg.style.height='auto';svg.style.display='block';
var root=el('g',{'font-family':STYLE.fontFamily},svg);
// background
el('rect',{x:0,y:0,width:420,height:540,fill:'#f7f8fb'},root);
// shipping area TOP
el('rect',{x:8,y:8,width:404,height:40,fill:COL.belt,stroke:COL.beltD,'stroke-width':2,rx:6},root);
for(var bx=16;bx<404;bx+=26){el('rect',{x:bx,y:12,width:12,height:4,fill:COL.beltD,opacity:0.6},root);}
// queue area below shipping
el('rect',{x:30,y:52,width:360,height:88,fill:'#eef1f6',stroke:'#c6cbd6','stroke-width':1.5,rx:8},root);
var qslots=[40,165,290];
for(var qi=0;qi<3;qi++){el('rect',{x:qslots[qi],y:65,width:110,height:60,fill:COL.queC,stroke:'#9aa1b0','stroke-width':2,'stroke-dasharray':'6 4',rx:6},root);}
// STATIC LAYOUT: vertical conveyor flow bottom(feed)->top(active). No long empty ladder rails above active boxes.
var lanes=[20,155,290];
// 3 conveyor lanes spanning y215..495, drawn behind boxes
for(var li=0;li<3;li++){
  var lx=lanes[li];
  el('rect',{x:lx+2,y:215,width:6,height:280,fill:COL.rail,stroke:COL.cleat,'stroke-width':1},root);
  el('rect',{x:lx+102,y:215,width:6,height:280,fill:COL.rail,stroke:COL.cleat,'stroke-width':1},root);
  // horizontal cleats (subtle tracks) only between active row (y230) and feed row (y390), indicating upward feed
  for(var cy=270;cy<390;cy+=24){el('rect',{x:lx+8,y:cy,width:94,height:4,fill:COL.cleat,opacity:0.55},root);}
  // subtle rows below active row indicating feed direction upward (only in gap region)
  el('rect',{x:lx+8,y:360,width:94,height:2,fill:COL.cleat,opacity:0.35},root);
  el('rect',{x:lx+8,y:378,width:94,height:2,fill:COL.cleat,opacity:0.35},root);
}
// active docks row near queue at y230, width110 height90
for(var di=0;di<3;di++){el('rect',{x:lanes[di]+5,y:230,width:100,height:90,fill:'#e6e9f0',stroke:'#b6bcc8','stroke-width':2,rx:8},root);}
// feed/rear docks row BELOW at y390
for(var fi=0;fi<3;fi++){el('rect',{x:lanes[fi]+5,y:390,width:100,height:90,fill:'#eceef4',stroke:'#c2c8d4','stroke-width':2,'stroke-dasharray':'5 4',rx:8},root);}
// small UP arrows in lanes around y350 indicating upward feed
for(var ai=0;ai<3;ai++){
  var ax=lanes[ai]+55;
  el('path',{d:'M'+ax+' 345 L'+(ax-10)+' 362 L'+(ax+10)+' 362 Z',fill:COL.cleat,opacity:0.7},root);
  el('rect',{x:ax-3,y:362,width:6,height:12,fill:COL.cleat,opacity:0.7},root);
}
// feed hood at BOTTOM (y490), NOT top
el('path',{d:'M10 490 L410 490 L410 500 L10 500 Z',fill:'#c9cfdb',stroke:'#9aa1b0','stroke-width':1},root);
// hoist crane (authored scene visual, drawn behind boxes)
var boxes=scene.boxes||[];
if(scene.hoist&&scene.hoist.targetId){
  var ht=null;
  for(var hi=0;hi<boxes.length;hi++){if(boxes[hi]&&boxes[hi].id===scene.hoist.targetId){ht=boxes[hi];break;}}
  if(ht){
    var htx=(+ht.x||0),hty=(+ht.y||0),hts=(ht.scale!=null?ht.scale:1);
    var tcx=htx+55*hts,tcy=hty+45*hts;
    var beamY=12,beamX0=10,beamX1=410,feedX=396;
    el('rect',{x:beamX0,y:beamY,width:beamX1-beamX0,height:6,fill:COL.beltD,rx:2},root);
    el('rect',{x:feedX-6,y:beamY,width:12,height:24,fill:COL.belt,rx:2},root);
    var hookX=Math.max(20,Math.min(400,tcx));
    el('path',{d:'M'+hookX+' '+(beamY+6)+' L'+hookX+' '+(tcy-24),fill:'none',stroke:'#3a4050','stroke-width':2},root);
    el('path',{d:'M'+(hookX-8)+' '+(tcy-24)+' L'+(hookX+8)+' '+(tcy-24)+' L'+hookX+' '+(tcy-14)+' Z',fill:'#8a8f9c',stroke:'#3a4050','stroke-width':1.5},root);
    el('circle',{cx:hookX,cy:tcy-12,r:6,fill:COL.honeyD,stroke:'#6e4a10','stroke-width':1.5},root);
    var cl=el('image',{href:ASSETS+'clamp.svg',width:28,height:28,x:hookX-14,y:tcy-14},root);
    cl.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+'clamp.svg');
  }
}
function findBox(id){for(var i=0;i<boxes.length;i++){if(boxes[i]&&boxes[i].id===id)return boxes[i];}return null;}
var links=scene.links||[];
for(var L=0;L<links.length;L++){
  var a=findBox(links[L].from),b=findBox(links[L].to);
  if(!a||!b)continue;if(a.opacity===0||b.opacity===0)continue;
  var asc=(a.scale!=null?a.scale:1),bsc=(b.scale!=null?b.scale:1);
  var ax=(+a.x||0)+55*asc,ay=(+a.y||0)+45*asc,bxb=(+b.x||0)+55*bsc,byb=(+b.y||0)+45*bsc;
  var mx=(ax+bxb)/2,my=(ay+byb)/2-(Math.abs(bxb-ax)>60?40:24);
  el('path',{d:'M'+ax+' '+ay+' Q'+mx+' '+my+' '+bxb+' '+byb,fill:'none',stroke:'#7b8394','stroke-width':3,'stroke-linecap':'round','stroke-dasharray':'8 5'},root);
}
// queue used text
var cap=(scene.queueCapacity!=null?scene.queueCapacity:scene.queueUsed!=null?scene.queueUsed:3);
var used=(scene.queueUsed!=null?scene.queueUsed:0);
txt(root,34,60,'QUEUE '+used+'/'+cap,{fill:COL.navy,'font-size':13,'font-weight':'bold'});
// boxes: draw supplied positions literally (no remapping)
for(var bi=0;bi<boxes.length;bi++){drawBox(root,boxes[bi]);}
// flying items
var fly=scene.flyingItems||[];
for(var f=0;f<fly.length;f++){drawFly(root,fly[f]);}
// pointer
if(scene.pointer){drawPointer(root,scene.pointer);}
// status bottom
if(scene.status){
  var sl=wrapLabel(scene.status,50);
  var sy=515;
  for(var si=0;si<sl.length;si++){txt(root,20,sy+si*16,sl[si],{fill:COL.navy,'font-size':14,'font-weight':'bold'});}
}
}
function drawFly(parent,f){
  if(!f)return;
  var g=el('g',{opacity:(f.opacity!=null?f.opacity:1)},parent);
  var img=el('image',{href:ASSETS+f.type+'.svg',width:28,height:28},g);
  img.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+f.type+'.svg');
  var s=(f.scale!=null?f.scale:1);
  g.setAttribute('transform','translate('+f.x+' '+f.y+') scale('+s+')');
}
function drawPointer(parent,p){
  var x=+p.x||0,y=+p.y||0,down=!!p.down;
  var g=el('g',{'pointer-events':'none'},parent);
  el('circle',{cx:x,cy:y,r:10,fill:down?'#e04a4a':'#2f6fd6',opacity:down?0.35:0.18},g);
  el('path',{d:'M'+x+' '+(y+16)+' L'+(x-7)+' '+y+' L'+(x+7)+' '+y+' Z',fill:down?'#e04a4a':'#2f6fd6',stroke:'#ffffff','stroke-width':1.5},g);
}
function drawBox(parent,b){
  if(!b)return;
  if(b.opacity===0)return;
  var x=+b.x||0,y=+b.y||0,sc=(b.scale!=null?b.scale:1);
  var g=el('g',{opacity:(b.opacity!=null?b.opacity:1)},parent);
  g.setAttribute('transform','translate('+x+' '+y+') scale('+sc+') translate('+(-x)+' '+(-y)+')');
  g.setAttribute('data-scale',String(sc));
  g.setAttribute('data-box-id',b.id||'');
  if(b.sealed)g.setAttribute('data-sealed','1');
  if(b.hidden)g.setAttribute('data-hidden','1');
  if(b.locked)g.setAttribute('data-locked','1');
  if(b.iceSlot!=null&&b.iceSlot!==false)g.setAttribute('data-ice-slot',String(b.iceSlot));
  var w=110,h=90;
  el('rect',{x:x,y:y,width:w,height:h,fill:b.sealed?COL.honeyD:COL.honey,stroke:'#8a5a12','stroke-width':2,rx:6},g);
  // carton open-top flaps
  el('rect',{x:x+4,y:y+4,width:w-8,height:8,fill:b.sealed?COL.honeyD:'#f0c878',stroke:'#8a5a12','stroke-width':1},g);
  el('rect',{x:x+4,y:y+4,width:w-8,height:h-8,fill:'none',stroke:'#a06a1a','stroke-width':1.5,rx:4},g);
  if(b.sealed){
    el('rect',{x:x-2,y:y+h/2-8,width:w+4,height:16,fill:'#c98d3a',stroke:'#6e4a10','stroke-width':1.5},g);
  }
  if(b.hidden){
    txt(g,x+w/2,y+h/2,'?',{fill:'#4a3a10','font-size':48,'font-weight':'bold','text-anchor':'middle','dominant-baseline':'central'});
  }else if(!b.sealed){
    var slotIds=[8,40,72];
    for(var si=0;si<3;si++){
      var sx=x+slotIds[si],sy=y+38;
      el('rect',{x:sx,y:sy,width:28,height:28,fill:'#f7e4b8',stroke:'#a06a1a','stroke-width':1,rx:3},g);
      var it=(b.items&&b.items[si]!=null)?b.items[si]:null;
      if(it){var im=el('image',{href:ASSETS+it+'.svg',width:28,height:28,x:sx,y:sy},g);im.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+it+'.svg');}
    }
  }
  // ice overlay on target slot
  if(b.iceSlot!=null&&b.iceSlot!==false&&!b.sealed&&!b.hidden){
    var sidx=[8,40,72][b.iceSlot];
    if(sidx==null)sidx=8;
    var sx2=x+sidx;
    var im2=el('image',{href:ASSETS+'ice.svg',width:32,height:32,x:sx2-2,y:y+36},g);
    im2.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+'ice.svg');
  }
  // labels
  txt(g,x+w/2,y-6,b.id||'',{fill:COL.navy,'font-size':14,'font-weight':'bold','text-anchor':'middle'});
  if(b.label){var ll=wrapLabel(b.label,16);for(var li2=0;li2<ll.length;li2++){txt(g,x+w/2,y+h+14+li2*12,ll[li2],{fill:COL.navy,'font-size':11,'text-anchor':'middle'});}}
  // badge
  if(b.badge){drawBadge(g,b);}
  // implicit padlock for locked boxes (only if no padlock badge already)
  if(b.locked&&b.badge!=='locked'&&b.badge!=='padlock'){
    var lp=el('image',{href:ASSETS+'padlock.svg',width:24,height:24,x:x+w-26,y:y+2},g);
    lp.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+'padlock.svg');
  }
  // remaining timer pill above box
  if(b.remaining!=null){
    var ice=(b.iceSlot!=null&&b.iceSlot!==false);
    var pillFill=ice?'#2f6fd6':'#e04a4a';
    var px=x+w-34,py=y-44;
    el('rect',{x:px,y:py,width:32,height:22,rx:6,fill:pillFill,opacity:0.95},g);
    txt(g,px+16,py+16,String(Math.ceil(+b.remaining))+'s',{fill:'#ffffff','font-size':14,'font-weight':'bold','text-anchor':'middle'});
  }
}
function drawBadge(g,b){
  var w=110;
  if(b.badge==='locked'||b.badge==='padlock'){
    var im=el('image',{href:ASSETS+'padlock.svg',width:24,height:24,x:+b.x+w-26,y:+b.y+2},g);
    im.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+'padlock.svg');
  }else if(b.badge==='stuck'){
    var c=el('image',{href:ASSETS+'clamp.svg',width:24,height:24,x:+b.x+w-26,y:+b.y+2},g);
    c.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+'clamp.svg');
  }else if(b.badge==='inspection'||b.badge==='defective'){
    var s=el('image',{href:ASSETS+'scanner.svg',width:24,height:24,x:+b.x+w-26,y:+b.y+2},g);
    s.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+'scanner.svg');
    txt(g,+b.x+w-4,+b.y+40,'Kiểm tra',{fill:COL.navy,'font-size':11,'font-weight':'bold','text-anchor':'end'});
  }else if(b.badge==='urgent'){
    var a=el('image',{href:ASSETS+'alarm.svg',width:24,height:24,x:+b.x+w-26,y:+b.y+2},g);
    a.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ASSETS+'alarm.svg');
    txt(g,+b.x+w-4,+b.y+40,'URGENT',{fill:'#e04a4a','font-size':11,'font-weight':'bold','text-anchor':'end'});
  }else{
    txt(g,+b.x+w-4,+b.y+16,String(b.badge),{fill:COL.navy,'font-size':11,'font-weight':'bold','text-anchor':'end'});
  }
}
window.FactoryScene=window.FactoryScene||{};
window.FactoryScene.render=render;
})();
