// @ts-nocheck
// Film for the "ROT" explainer (Veeam Intelligent ResOps for Microsoft 365).
// Pure canvas drawing: createFilm(ctx) returns the timeline the Explainer player drives.
// Drawn on a fixed 1600x900 stage; the player scales the context to the canvas size.
// Northwind Group is fictional. File counts, dates and names are illustrative, generated from a fixed seed.

export default function createFilm(ctx) {
const W=1600,H=900;
const C={bg:'#0A1B26',grid:'rgba(143,163,179,0.07)',ink:'#E8EEF2',muted:'#8FA3B3',node:'#5F7687',nodeHi:'#B9C8D2',
  green:'#00B336',red:'#FF4D4F',amber:'#F2B23A',purple:'#8E7CE8',teal:'#2BB5B0',panel:'#10283A',panelLine:'#24414F',
  tile:'#1A3443',active:'#2F5568'};
const FONT='"Instrument Sans Variable", "Instrument Sans", system-ui, sans-serif';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const prog=(t,a,b)=>ease(clamp((t-a)/(b-a),0,1));
const win=(t,a,b,f=.45)=>Math.min(prog(t,a,a+f),1-prog(t,b-f,b));
const frac=x=>x-Math.floor(x);
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function text(s,x,y,size,color,weight=400,align='left',alpha=1){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${FONT}`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y);ctx.globalAlpha=1;}
function textW(s,size,weight=400){ctx.font=`${weight} ${size}px ${FONT}`;return ctx.measureText(s).width;}
function wrapText(s,x,y,maxW,size,weight,color,alpha,lh){ctx.font=`${weight} ${size}px ${FONT}`;const words=s.split(' ');let line='',yy=y;
  for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){text(line,x,yy,size,color,weight,'left',alpha);ctx.font=`${weight} ${size}px ${FONT}`;line=w;yy+=lh;}else line=test;}
  if(line)text(line,x,yy,size,color,weight,'left',alpha);return yy;}
function circle(x,y,r,fill,stroke,lw=2,alpha=1){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}ctx.globalAlpha=1;}
function pill(label,x,y,bg,fg,alpha,size=17){if(alpha<=0)return 0;const w=textW(label,size,600)+24;ctx.globalAlpha=alpha;rrect(x,y-size-3,w,size+14,(size+14)/2);ctx.fillStyle=bg;ctx.fill();ctx.globalAlpha=1;text(label,x+12,y+2,size,fg,600,'left',alpha);return w;}
function panel(x,y,w,h,alpha,o={}){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x,y,w,h,14);ctx.fillStyle=o.fill||C.panel;ctx.fill();ctx.strokeStyle=o.stroke||C.panelLine;ctx.lineWidth=o.lw||1.5;ctx.stroke();ctx.globalAlpha=1;}
let CAPHOLD=false; // presenter mode: each message holds until the next one starts
function caption(t,list){list.forEach(([a,b,s],i)=>{let al;if(CAPHOLD){const na=i+1<list.length?list[i+1][0]:1e9;al=t<na?prog(t,a,a+.8):1-prog(t,na,na+.4);}else al=win(t,a,b,.8);if(al>0){const dy=(1-prog(t,a,a+.8))*10;text(s,800,118+dy,42,C.ink,600,'center',al);}});}
function backdrop(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle=C.grid;ctx.lineWidth=1;for(let x=0;x<=W;x+=50){ctx.beginPath();ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H);ctx.stroke();}for(let y=0;y<=H;y+=50){ctx.beginPath();ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5);ctx.stroke();}}
function agentGlyph(x,y,s,stroke,fill,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x-s,y-s,s*2,s*2,s*.45);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y-s*.5);ctx.lineTo(x+s*.16,y-s*.16);ctx.lineTo(x+s*.5,y);ctx.lineTo(x+s*.16,y+s*.16);ctx.lineTo(x,y+s*.5);ctx.lineTo(x-s*.16,y+s*.16);ctx.lineTo(x-s*.5,y);ctx.lineTo(x-s*.16,y-s*.16);ctx.closePath();ctx.fillStyle=stroke;ctx.fill();ctx.globalAlpha=1;}
function personGlyph(x,y,r,stroke,fill,alpha){if(alpha<=0)return;circle(x,y,r,fill,stroke,2.5,alpha);ctx.globalAlpha=alpha;ctx.fillStyle=stroke;
  ctx.beginPath();ctx.arc(x,y-r*.24,r*.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x,y+r*.58,r*.52,Math.PI,0);ctx.fill();ctx.globalAlpha=1;}
function drawEdge(x1,y1,x2,y2,color,lw,alpha,progress=1,bend=0){
  if(alpha<=0||progress<=0)return;
  const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
  const cx=mx-dy/len*bend*len,cy=my+dx/len*bend*len;
  ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);
  const steps=28;for(let i=1;i<=Math.ceil(steps*progress);i++){const u=Math.min(1,i/steps,progress);const x=(1-u)*(1-u)*x1+2*(1-u)*u*cx+u*u*x2;const y=(1-u)*(1-u)*y1+2*(1-u)*u*cy+u*u*y2;ctx.lineTo(x,y);}
  ctx.stroke();ctx.globalAlpha=1;}
function blockX(x,y,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle=C.red;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-7,y-7);ctx.lineTo(x+7,y+7);ctx.moveTo(x+7,y-7);ctx.lineTo(x-7,y+7);ctx.stroke();ctx.globalAlpha=1;}
function docCard(x,y,w,h,title,alpha,o={}){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x,y,w,h,8);ctx.fillStyle=o.fill||'#132C3A';ctx.fill();
  ctx.strokeStyle=o.stroke||'#24414F';ctx.lineWidth=o.lw||1.5;ctx.stroke();
  ctx.fillStyle='rgba(185,200,210,.25)';for(let k=0;k<3;k++){ctx.fillRect(x+12,y+18+k*9,(w-24)*(k===2?.55:1),3);}
  ctx.globalAlpha=1;
  if(title)wrapText(title,x+12,y+64,w-22,15,600,C.ink,alpha*(o.ta===undefined?1:o.ta),18);}
function scanBeam(bx,top,h,alpha,label='iResOps scanning',col='0,179,54',labCol=C.green){if(alpha<=0)return;const g=ctx.createLinearGradient(bx-170,0,bx,0);g.addColorStop(0,`rgba(${col},0)`);g.addColorStop(1,`rgba(${col},0.24)`);
  ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(bx-170,top,170,h);ctx.fillStyle=`rgba(${col},0.35)`;ctx.fillRect(bx-6,top,12,h);ctx.fillStyle=col==='0,179,54'?'#7CF0A0':'#FF9A9B';ctx.fillRect(bx-1.5,top,3,h);ctx.globalAlpha=1;
  const w=textW(label,15,700)+44;ctx.globalAlpha=alpha;rrect(bx-w/2,top-36,w,30,15);ctx.fillStyle=labCol;ctx.fill();ctx.globalAlpha=1;
  circle(bx-w/2+16,top-21,5,'#04140A',null,0,alpha*(.45+.55*Math.abs(Math.sin(bx/18))));
  text(label,bx-w/2+30,top-16,15,'#04140A',700,'left',alpha);}
function check(x,y,s,col,alpha,p=1){if(alpha<=0||p<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x,y);
  if(p<.4){const u=p/.4;ctx.lineTo(x+s*.35*u,y+s*.35*u);}else{const u=(p-.4)/.6;ctx.lineTo(x+s*.35,y+s*.35);ctx.lineTo(x+s*.35+s*.65*u,y+s*.35-s*.8*u);}
  ctx.stroke();ctx.lineCap='butt';ctx.lineJoin='miter';ctx.globalAlpha=1;}

/* ---------------- The estate: one grid of files used by every part ---------------- */
// Columns run left to right by the year a file was created (2019 to 2026). Each file has a "last touched" date.
const COLS=26,ROWS=11,TS=28,GAP=8,PITCH=TS+GAP,X0=240,Y0=236,T_OLD=2024;
const GX1=X0+COLS*PITCH-GAP,GY1=Y0+ROWS*PITCH-GAP;
const N=COLS*ROWS;
const pos=i=>[X0+Math.floor(i/ROWS)*PITCH,Y0+(i%ROWS)*PITCH];
const yearAt=c=>2019+c*8/COLS;
const xAtYear=y=>X0+(y-2019)*COLS/8*PITCH-GAP/2;
const E=[],CL=[];
(function setup(){
  const R=rng(11);
  for(let i=0;i<N;i++){const c=Math.floor(i/ROWS);const created=yearAt(c)+R()*8/COLS;const pAct=.14+.7*Math.pow(c/(COLS-1),1.6);
    const last=R()<pAct?Math.max(created,2025+R()*1.7):created+R()*(2026.6-created)*.55;
    E.push({c,created,last,sens:R()<.12,triv:false,cl:-1,orig:false});}
  const used=new Set();
  const take=(c0,c1)=>{for(let k=0;k<400;k++){const c=c0+Math.floor(R()*(c1-c0+1));const i=c*ROWS+Math.floor(R()*ROWS);if(!used.has(i)){used.add(i);return i;}}return -1;};
  // cluster 0: the pricing proposal and its seven copies, around 2020
  {const m=[];for(let k=0;k<8;k++)m.push(take(3,6));CL.push(m);}
  // cluster 1: a customer list export from 2021 and two copies
  {const m=[];for(let k=0;k<3;k++)m.push(take(7,8));CL.push(m);}
  for(let k=0;k<12;k++){const c0=Math.floor(R()*(COLS-3));const n=2+Math.floor(R()*3);const m=[];for(let j=0;j<n;j++){const i=take(c0,c0+3);if(i>=0)m.push(i);}if(m.length>1)CL.push(m);}
  CL.forEach((m,ci)=>{if(ci>0)m.sort((a,b)=>a-b);m.forEach((i,j)=>{E[i].cl=ci;E[i].orig=j===0;});});
  CL[0].forEach(i=>{E[i].last=E[i].created+.15;E[i].sens=false;});
  CL[1].forEach(i=>{E[i].last=Math.min(E[i].created+.1,2021.4);E[i].sens=true;});
  for(let i=0;i<N;i++){if(E[i].cl<0&&R()<.06)E[i].triv=true;}
})();
const isRed=i=>E[i].cl>=0&&!E[i].orig;
const isObs=i=>E[i].last<T_OLD;
const isRot=i=>isRed(i)||isObs(i)||E[i].triv;
const cat=i=>isRed(i)?'Redundant':isObs(i)?'Obsolete':E[i].triv?'Trivial':null;
const CATCOL={Redundant:C.purple,Obsolete:C.amber,Trivial:C.nodeHi};
const FOCUS=CL[1][1];
const ALL=[...Array(N).keys()];
const ROT=ALL.filter(isRot);
const nCopies=ALL.filter(isRed).length;
const nObs=ALL.filter(isObs).length;
const nTriv=ALL.filter(i=>E[i].triv).length;
// a reviewer keeps a few flagged files that are still needed
const KEPT=(()=>{const tr=ALL.filter(i=>cat(i)==='Trivial'),ob=ALL.filter(i=>cat(i)==='Obsolete'&&E[i].c>12);return[tr[1],tr[Math.floor(tr.length/2)],ob[2],ob[Math.floor(ob.length*.7)]].filter(i=>i!==undefined);})();
const Q=ROT.filter(i=>!KEPT.includes(i));
const REMAIN=ALL.filter(i=>!Q.includes(i));
const qIndex={};Q.forEach((i,k)=>qIndex[i]=k);
const rIndex={};REMAIN.forEach((i,k)=>rIndex[i]=k);
const QPER=Math.ceil(Q.length/3),QP=Math.min(16,(GX1-X0)/QPER);
const qpos=k=>[X0+(k%QPER)*QP,700+Math.floor(k/QPER)*16];
const rpos=k=>[X0+Math.floor(k/ROWS)*PITCH,Y0+(k%ROWS)*PITCH];

// One tile. d = how far the "recently touched vs not" shading has come in.
function tile(i,x,y,s,a,o={}){if(a<=0)return;const e=E[i];const d=o.d===undefined?1:o.d;
  ctx.globalAlpha=a;rrect(x,y,s,s,Math.max(3,s*.18));ctx.fillStyle=C.tile;ctx.fill();
  if(d>0){if(isObs(i)){ctx.globalAlpha=a*.55*d;ctx.fillStyle=C.bg;}else{ctx.globalAlpha=a*d;ctx.fillStyle=C.active;}ctx.fill();}
  if(o.over&&o.oa>0){ctx.globalAlpha=a*o.oa;ctx.fillStyle=o.over;ctx.fill();}
  ctx.globalAlpha=a;
  if(o.stroke){ctx.save();if(o.dash)ctx.setLineDash([4,4]);ctx.strokeStyle=o.stroke;ctx.lineWidth=o.lw||2;ctx.stroke();ctx.restore();}
  ctx.globalAlpha=1;
  if(e.sens&&o.dot!==0&&s>16)circle(x+s-7,y+7,3.6,C.teal,null,0,a*(o.dot===undefined?1:o.dot));}
// flag colour for a tile, given how far each flag has come in (0 to 1)
function flagOver(i,rp,op,tp){const k=cat(i);if(k==='Redundant')return{over:C.purple,oa:rp};if(k==='Obsolete')return{over:C.amber,oa:op};if(k==='Trivial')return{over:C.nodeHi,oa:tp*.85};return{};}
const centre=i=>{const [x,y]=pos(i);return[x+TS/2,y+TS/2];};
function bubble(x,y,w,h,hdr,body,alpha,o={}){if(alpha<=0)return;panel(x,y,w,h,alpha,{fill:o.fill||'#16303F',stroke:o.stroke,lw:2});
  text(hdr,x+20,y+30,14,o.hc||C.muted,o.hc?600:400,'left',alpha);const yy=wrapText(body,x+20,y+62,w-40,20,600,C.ink,alpha,27);
  if(o.note)wrapText(o.note,x+20,yy+34,w-40,16,600,o.nc||C.red,alpha,21);}

/* ---------------- Part one: How ROT piles up ---------------- */
const F1={dur:34};
const LANES=['SharePoint','OneDrive','Exchange','Teams'];
const laneX=l=>145+l*340;
const CARDS=[['Pricing Proposal.docx',0,0,.6],['Pricing Proposal (1).docx',0,1,5.6],['Pricing Proposal FINAL.docx',0,2,6.2],['Pricing Proposal - Copy.docx',1,0,6.8],
  ['Pricing Proposal v2 draft.docx',1,1,7.4],['RE: Pricing (attachment)',2,0,8.0],['FW: Pricing proposal',2,1,8.6],['Pricing Proposal.docx',3,0,9.2]];
const REACH=(()=>{const R=rng(5);const a=new Set(),b=new Set();while(a.size<34)a.add(Math.floor(R()*N));while(b.size<22)b.add(Math.floor(R()*N));return[[...a],[...b]];})();
F1.render=function(t){
  backdrop();
  const m=prog(t,14,15.6);const lh=prog(t,4.8,5.6)*(1-prog(t,14,14.6));
  LANES.forEach((n,l)=>text(n,laneX(l)+115,272,20,C.muted,600,'center',lh));
  const slot=k=>{const [,l,r]=CARDS[k];return[laneX(l),300+r*130];};
  const c0=(()=>{const mv=prog(t,4.8,5.6);const [sx,sy]=slot(0);return[lerp(670,sx,mv),lerp(420,sy,mv),lerp(260,230,mv),lerp(110,96,mv)];})();
  // copies fly out of the first file
  CARDS.forEach(([n,,,at],k)=>{if(k===0||t<at||m>0)return;const [sx,sy]=slot(k);const pr=clamp((t-at)/.6,0,1);
    drawEdge(c0[0]+c0[2]/2,c0[1]+c0[3]/2,sx+115,sy+48,C.purple,1.6,.55*(1-prog(t,12.6,13.6)),ease(pr),.1);});
  // grid fills in, one year at a time
  const fillA=i=>E[i].cl===0?(t>=15.6?1:0):prog(t,15+E[i].c*.3,15.5+E[i].c*.3);
  const d=prog(t,23.6,25.2);
  for(let i=0;i<N;i++){const a=fillA(i);if(a<=0)continue;const [x,y]=pos(i);tile(i,x,y,TS,a,{d,dot:0});}
  CARDS.forEach(([n,,,at],k)=>{if(t<at)return;const ap=prog(t,at,at+.5);let [x,y]=slot(k);let w=230,h=96;
    if(k===0){[x,y,w,h]=c0;}else{const fl=prog(t,at,at+.6);x=lerp(c0[0],x,fl);y=lerp(c0[1],y,fl);}
    if(m>0){const [tx,ty]=pos(CL[0][k]);x=lerp(x,tx,m);y=lerp(y,ty,m);w=lerp(w,TS,m);h=lerp(h,TS,m);}
    if(m>=1)return;
    if(w>70)docCard(x,y,w,h,n,ap,{ta:1-m*3,stroke:k>0?C.purple:undefined});
    else{ctx.globalAlpha=ap;rrect(x,y,w,h,5);ctx.fillStyle='#132C3A';ctx.fill();ctx.strokeStyle=C.purple;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;}});
  // year counter
  const ya=prog(t,15,15.6);
  if(ya>0){const c=clamp(Math.floor((t-15)/.3),0,COLS-1);text(String(Math.floor(yearAt(c+.99))),GX1,Y0-22,30,C.ink,700,'right',ya);
    text('Northwind Group files across Microsoft 365',X0,Y0-24,19,C.muted,400,'left',ya);}
  // legend
  const lg=prog(t,24.6,25.4);
  if(lg>0){ctx.globalAlpha=lg;rrect(X0,GY1+30,18,18,4);ctx.fillStyle=C.active;ctx.fill();rrect(X0+260,GY1+30,18,18,4);ctx.fillStyle='#122630';ctx.fill();ctx.globalAlpha=1;
    text('Touched since 2024',X0+28,GY1+45,17,C.muted,400,'left',lg);text('Untouched since before 2024',X0+288,GY1+45,17,C.muted,400,'left',lg);}
  // the estate in numbers
  const ep=prog(t,24.2,25)*(1-prog(t,27.6,28.2));
  if(ep>0){const x=1210,y=Y0;panel(x,y,350,190,ep);text('Northwind Group',x+24,y+42,22,C.ink,700,'left',ep);
    text('Files',x+24,y+90,18,C.muted,400,'left',ep);text(String(N),x+326,y+90,18,C.ink,600,'right',ep);
    text('Touched since 2024',x+24,y+126,18,C.muted,400,'left',ep);text(String(N-nObs),x+326,y+126,18,C.ink,600,'right',ep);
    text('Untouched since before 2024',x+24,y+162,18,C.amber,600,'left',ep);text(String(nObs),x+326,y+162,18,C.amber,600,'right',ep);}
  // still reachable
  const ra=prog(t,28,28.8);
  if(ra>0){
    REACH[0].forEach((i,k)=>{const [cx,cy]=centre(i);drawEdge(150,400,cx,cy,C.nodeHi,1.2,ra*.45,ease(clamp((t-28.4-k*.04)/.8,0,1)),.05);});
    REACH[1].forEach((i,k)=>{const [cx,cy]=centre(i);drawEdge(150,560,cx,cy,C.green,1.2,ra*.5,ease(clamp((t-29.4-k*.05)/.8,0,1)),-.05);});
    personGlyph(120,400,26,C.nodeHi,'#16303F',ra);text('Everyone',120,454,18,C.ink,600,'center',ra);
    const aa=prog(t,29.2,29.9);agentGlyph(120,560,24,C.green,'#0E2A1C',aa);text('Copilot',120,612,18,C.ink,600,'center',aa);
  }
  caption(t,[[.5,5,'It starts with one file.'],[5.2,9.8,'A copy to send. A version to edit. A draft to finish.'],[10,13.8,'Every one of them is kept.'],
    [14.2,23.4,'Multiply that by every team, every year.'],[23.6,27.8,'Years later, most of it is never touched again.'],[28,34,'And all of it is still reachable.']]);
};
F1.beats=[[0,'It starts with one file'],[5.2,'Copies, versions and drafts'],[14,'Every team, every year'],[23.5,'Years later'],[28,'Still reachable']];

/* ---------------- Part two: Data you can lose ---------------- */
const F2={dur:42};
const LOOT=ALL.filter(i=>E[i].sens&&isObs(i));
const HITS=(()=>{const R=rng(3);const s=new Set(CL[1]);const sens=ALL.filter(i=>E[i].sens);while(s.size<14)s.add(sens[Math.floor(R()*sens.length)]);return[...s];})();
F2.render=function(t){
  backdrop();
  const atk=win(t,.4,10.4,.6);
  const encBeam=lerp(X0-20,GX1+20,clamp((t-10.4)/2.8,0,1));
  const rp=clamp((t-14)/5.5,0,1);
  const encA=1-prog(t,20.6,21.2);
  const hitA=win(t,22.6,31,.6);
  const ai=prog(t,31,31.8);
  for(let i=0;i<N;i++){const [x,y]=pos(i);const o={};
    const looted=LOOT.indexOf(i);if(looted>=0&&atk>0&&t>2+looted*.14+.6){o.stroke=C.red;o.lw=2;}
    if(t>10.4&&encBeam>x+TS/2&&encA>0){const back=clamp(rp*COLS-E[i].c,0,1);o.over=C.red;o.oa=.6*(1-back)*encA;if(back<1){o.stroke=C.red;o.dash=true;o.lw=1.5;}}
    if(hitA>0&&HITS.includes(i)){o.stroke=C.teal;o.lw=2.5;}
    if(ai>0&&CL[0].includes(i)){o.stroke=C.purple;o.lw=2.5;}
    tile(i,x,y,TS,1,o);
    if(hitA>0&&HITS.includes(i)){const ph=frac(t*.7+i*.13);circle(x+TS/2,y+TS/2,TS*.6+ph*14,null,C.teal,1.5,hitA*(1-ph));}}
  // stolen
  if(atk>0){LOOT.forEach((i,k)=>{const [cx,cy]=centre(i);drawEdge(150,430,cx,cy,C.red,1.6,atk*.7,ease(clamp((t-2-k*.14)/.6,0,1)),.06);});
    personGlyph(120,430,28,C.red,'#3A1214',atk);text('Compromised',120,488,17,C.red,600,'center',atk);text('account',120,508,17,C.red,600,'center',atk);
    text(`${LOOT.length} files with customer data, untouched since before 2024`,X0,GY1+46,19,C.red,600,'left',prog(t,5.4,6)*atk);
    const lp=prog(t,1,1.6)*atk;circle(GX1-150,GY1+40,5,C.teal,null,0,lp);text('Contains customer data',GX1,GY1+46,17,C.muted,400,'right',lp);
    const tp=prog(t,6,6.6)*atk;if(tp>0){const x=1210,y=Y0;panel(x,y,350,170,tp,{stroke:C.red,lw:2});text('Exfiltrated',x+24,y+42,22,C.red,700,'left',tp);
      ['Customer list export 2021.xlsx','Old CRM export.csv','Event attendees 2020.xlsx'].forEach((n,k)=>text(n,x+24,y+84+k*28,17,C.ink,400,'left',prog(t,6.4+k*.3,6.9+k*.3)*atk));}}
  // encrypted, then restored
  scanBeam(encBeam,Y0-10,GY1-Y0+20,win(t,10.2,13.4,.3),'Ransomware','255,77,79',C.red);
  const rc=prog(t,13.4,14)*encA;
  if(rc>0){const x=1210,y=Y0,w=350;panel(x,y,w,280,rc);text('Recovery',x+24,y+42,22,C.ink,700,'left',rc);
    const bx=x+24,by=y+80,bw=w-48,bh=34,rotW=bw*ROT.length/N;
    ctx.globalAlpha=rc;rrect(bx,by,bw,bh,8);ctx.fillStyle='#16303F';ctx.fill();ctx.save();rrect(bx,by,bw,bh,8);ctx.clip();
    const fw=bw*rp;ctx.fillStyle=C.node;ctx.fillRect(bx,by,Math.min(fw,rotW),bh);if(fw>rotW){ctx.fillStyle=C.green;ctx.fillRect(bx+rotW,by,fw-rotW,bh);}ctx.restore();ctx.globalAlpha=1;
    text(`Restoring ${Math.round(rp*N)} of ${N} files`,bx,by+66,17,C.muted,400,'left',rc);
    ctx.globalAlpha=rc;ctx.fillStyle=C.node;ctx.fillRect(bx,by+96,14,14);ctx.fillStyle=C.green;ctx.fillRect(bx,by+124,14,14);ctx.globalAlpha=1;
    text(`ROT: ${ROT.length} files`,bx+24,by+109,17,C.ink,400,'left',rc);text(`Data you use: ${N-ROT.length} files`,bx+24,by+137,17,C.ink,400,'left',rc);
    text('All of it comes back.',bx,by+180,18,C.amber,600,'left',rc*prog(t,19,19.6));}
  // in scope for requests
  const rq=win(t,21.4,31,.6);
  if(rq>0){bubble(1210,Y0,350,124,'Data request','Everything you hold on a former customer.',rq);
    text(`${HITS.length} files to find, review and report on`,X0,GY1+46,19,C.teal,600,'left',prog(t,24,24.6)*rq);}
  // surfaced by AI
  if(ai>0){CL[0].forEach((i,k)=>{const [cx,cy]=centre(i);drawEdge(150,430,cx,cy,C.purple,1.8,ai*.75,ease(clamp((t-33-k*.15)/.6,0,1)),.08);});
    agentGlyph(120,430,26,C.green,'#0E2A1C',ai);text('Copilot agent',120,486,18,C.ink,600,'center',ai);
    bubble(1210,Y0,350,104,'A colleague asks','What is our standard discount?',prog(t,31.6,32.2));
    bubble(1210,Y0+130,350,190,'Copilot agent answers','15%, per Pricing Proposal FINAL.',prog(t,35.8,36.4),{stroke:C.red,note:'Cited a 2020 copy. Current pricing says 10%.'});}
  caption(t,[[.4,4.8,'Old files still hold customer data.'],[5,10,"Attackers don't care how old it is."],[10.2,13.6,'Ransomware encrypts all of it.'],[13.8,20.8,'Recovery brings back every stale copy too.'],
    [21.2,25.8,'Someone asks what you hold on them.'],[26,31,'Every copy is in scope.'],[31.2,35.8,'AI agents answer from whatever they can find.'],[36,42,'Including the copy nobody meant to keep.']]);
};
F2.beats=[[0,'Old files, still worth stealing'],[10,'Encrypted, then restored'],[21,'In scope for every request'],[31,'Surfaced by AI']];

/* ---------------- Part three: Find it with context ---------------- */
const F3={dur:46};
const TRIV_NAMES=[['Copy of Book1.xlsx'],['Offsite RSVP.xlsx'],['~$temp.docx'],['Untitled presentation.pptx']];
const TRIV_SHOW=ALL.filter(i=>cat(i)==='Trivial').filter((_,k,a)=>k%Math.max(1,Math.floor(a.length/4))===0).slice(0,4);
F3.render=function(t){
  backdrop();
  const beam=lerp(X0-20,GX1+30,clamp((t-.6)/3.6,0,1));
  const rp=prog(t,8.6,10);
  const lineX=lerp(X0-6,xAtYear(T_OLD),clamp((t-15.6)/3,0,1));
  const tp=prog(t,25.6,26.4);
  const fo=prog(t,33,34);
  for(let i=0;i<N;i++){const [x,y]=pos(i);
    const op=t>15.6?clamp((lineX-(x+TS/2))/30,0,1):0;
    const o=flagOver(i,rp,op,tp);
    const fl=t<4.6?1-clamp(Math.abs(beam-(x+TS/2))/50,0,1):0;if(fl>.2){o.stroke=C.green;o.lw=1.5+2*fl;}
    if(E[i].cl>=0&&E[i].orig&&t>10.2&&t<15.2){o.stroke=C.green;o.lw=2.5;}
    tile(i,x,y,TS,i===FOCUS?1:1-.7*fo,o);}
  scanBeam(beam,Y0-10,GY1-Y0+20,win(t,.4,4.4,.3));
  // redundant: copies linked to the file they copy
  const ll=win(t,5,15,.5);
  if(ll>0)CL.forEach((m,ci)=>{for(let j=1;j<m.length;j++){const [ax,ay]=centre(m[0]),[bx,by]=centre(m[j]);drawEdge(ax,ay,bx,by,C.purple,2,ll*.8*(1-.7*fo),ease(clamp((t-5-ci*.12)/.6,0,1)),.12);}});
  if(t>10.2&&t<15.2){const [x,y]=pos(CL[0][0]);text('Kept',x+TS/2,y-8,14,C.green,700,'center',win(t,10.2,15,.4));}
  // obsolete: an age line moves across the years
  const la=win(t,15.4,33,.5);
  if(la>0){ctx.globalAlpha=la;ctx.fillStyle=C.amber;ctx.fillRect(lineX-1.5,Y0-14,3,GY1-Y0+28);ctx.globalAlpha=1;pill('Untouched since before 2024',lineX-110,Y0-24,C.amber,'#1A1405',la,14);}
  // trivial: a few names
  TRIV_SHOW.forEach((i,k)=>{const [x,y]=pos(i);const a=win(t,26.2+k*.4,32.6,.4)*(1-fo);if(a>0){const w=textW(TRIV_NAMES[k][0],13,600)+24;pill(TRIV_NAMES[k][0],clamp(x+TS/2-w/2,X0,GX1-w),y-8,C.nodeHi,'#0A1B26',a,13);}});
  // running count under the grid
  const cnt=[[9,15,`Redundant: ${nCopies} copies of ${CL.length} files`,C.purple],[18.8,25,`Obsolete: ${nObs} files untouched since before 2024`,C.amber],[26.6,30,`Trivial: ${nTriv} files of clutter`,C.nodeHi],[30.2,33.2,`iResOps flagged ${ROT.length} of ${N} files as ROT`,C.green]];
  cnt.forEach(([a,b,s,col])=>text(s,X0,GY1+46,19,col,600,'left',win(t,a,b,.4)));
  // context for one flagged file
  {const qa=prog(t,39.4,40.2);if(qa>0){text('Graph query',X0,GY1+46,17,C.muted,400,'left',qa);let qx=X0+textW('Graph query',17)+16;
    [['Contains customer data',C.teal,'#04201F'],['in Sales archive',C.nodeHi,'#0A1B26'],['last modified before 2022',C.amber,'#1A1405']].forEach(([l,bg,fg],k)=>{const pa=prog(t,39.6+k*.4,40.2+k*.4);qx+=pill(l,qx,GY1+46,bg,fg,pa,15)+10;});}}
  if(fo>0){const [fx,fy]=pos(FOCUS);circle(fx+TS/2,fy+TS/2,26+4*Math.sin(t*3),null,C.ink,2,fo);
    const px=1196,py=Y0-6,pw=372;drawEdge(fx+TS+14,fy+TS/2,px,py+60,C.ink,1.6,fo*.6,ease(clamp((t-33.4)/.8,0,1)),-.08);
    panel(px,py,pw,490,fo);text('Customer list export 2021.xlsx',px+22,py+40,19,C.ink,700,'left',fo);
    const row=(k,label,at)=>{const a=prog(t,at,at+.5);text(label,px+22,py+84+k*78,14,C.muted,400,'left',a);return a;};
    let a=row(0,'ROT signals',34.4);let xx=px+22;xx+=pill('Obsolete',xx,py+116,C.amber,'#1A1405',a,14)+8;pill('Redundant',xx,py+116,C.purple,'#0A1B26',a,14);
    a=row(1,'Where it lives',35.2);text('Sales archive, SharePoint',px+22,py+194,18,C.ink,600,'left',a);
    a=row(2,'Last modified',36);text('March 2021',px+22,py+272,18,C.ink,600,'left',a);
    a=row(3,'Who can reach it',36.8);text('Everyone except external users',px+22,py+350,18,C.amber,600,'left',a);
    a=row(4,"What's inside, from classification",37.6);xx=px+22;['First Name','Email Address','Phone Number','Date of Birth'].forEach((el,k)=>{const pa=prog(t,37.8+k*.3,38.3+k*.3);const col=k%2,r=Math.floor(k/2);pill(el,px+22+col*168,py+430+r*36,C.teal,'#04201F',pa,14);});
  }
  caption(t,[[.4,4.4,'iResOps scans Microsoft 365 for ROT signals.'],[4.7,9.8,'Redundant. The same content, saved again and again.'],[10,15,'Keep one. Flag the copies.'],
    [15.2,20,'Obsolete. Untouched for years.'],[20.2,25,'You choose the age that counts as old.'],[25.2,29,'Trivial. Clutter with no business value.'],[29.2,33,'The hardest to judge. Worth a human eye.'],
    [33.2,38.8,'Classification feeds the same graph as the ROT signals.'],[39,46,'So you can ask for both at once.']]);
};
F3.beats=[[0,'Scanning for ROT signals'],[4.5,'Redundant'],[15,'Obsolete'],[25,'Trivial'],[33,'With context']];

/* ---------------- Part four: Quarantine, not delete ---------------- */
const F4={dur:40};
F4.render=function(t){
  backdrop();
  const kp=prog(t,4.4,5.4);
  const rf=prog(t,28.4,30.4);
  const zone=prog(t,8,8.8)*(1-prog(t,27.4,28.2));
  // quarantine zone
  if(zone>0){ctx.save();ctx.setLineDash([6,8]);ctx.globalAlpha=zone;rrect(X0-14,680,GX1-X0+28,88,12);ctx.strokeStyle=C.amber;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();ctx.globalAlpha=1;
    text('Quarantine',X0,668,17,C.amber,600,'left',zone);}
  for(let i=0;i<N;i++){let [x,y]=pos(i);let s=TS,a=1;const o=flagOver(i,1,1,1);
    if(KEPT.includes(i)){o.oa=(o.oa||0)*(1-kp);if(kp>0&&t<8.5){o.stroke=C.green;o.lw=2.5;}}
    const q=qIndex[i];
    if(q!==undefined){const fl=prog(t,8.6+q*.012,9.6+q*.012);if(fl>0){const [qx,qy]=qpos(q);x=lerp(x,qx,fl);y=lerp(y,qy,fl);s=lerp(TS,12,fl);}
      a=1-prog(t,21+q*.02,21.6+q*.02);}
    else if(rf>0){const [nx,ny]=rpos(rIndex[i]);x=lerp(x,nx,rf);y=lerp(y,ny,rf);}
    tile(i,x,y,s,a,o);}
  // review panel
  const rv=win(t,.4,8.4,.6);
  if(rv>0){const x=1210,y=Y0;panel(x,y,350,310,rv);text('Review',x+24,y+42,22,C.ink,700,'left',rv);
    [['Redundant',nCopies],['Obsolete',nObs],['Trivial',nTriv]].forEach(([k,n],j)=>{const ry=y+84+j*36;const a=prog(t,1+j*.5,1.5+j*.5)*rv;ctx.globalAlpha=a;ctx.fillStyle=CATCOL[k];ctx.fillRect(x+24,ry-13,14,14);ctx.globalAlpha=1;
      text(k,x+48,ry,18,C.ink,400,'left',a);text(String(n),x+326,ry,18,C.ink,600,'right',a);});
    const ta=prog(t,2.6,3.2)*rv;ctx.globalAlpha=ta;ctx.fillStyle=C.panelLine;ctx.fillRect(x+24,y+180,302,1.5);ctx.globalAlpha=1;
    text('Flagged as ROT',x+24,y+210,18,C.ink,600,'left',ta);text(String(ROT.length),x+326,y+210,18,C.ink,600,'right',ta);
    text('Kept by a reviewer',x+24,y+246,18,C.green,600,'left',prog(t,5,5.6)*rv);text(String(KEPT.length),x+326,y+246,18,C.green,600,'right',prog(t,5,5.6)*rv);
    text('To quarantine',x+24,y+282,18,C.amber,600,'left',prog(t,6,6.6)*rv);text(String(Q.length),x+326,y+282,18,C.amber,600,'right',prog(t,6,6.6)*rv);
    personGlyph(120,430,26,C.green,'#0E2A1C',rv);text('Reviewer',120,484,18,C.ink,600,'center',rv);}
  // users and agents work from what is left
  const ua=win(t,13.6,19.2,.6);
  if(ua>0){const tgt=[[X0+60,706],[X0+420,706]];
    [[150,380],[150,540]].forEach(([sx,sy],k)=>{const [tx,ty]=tgt[k];const pr=ease(clamp((t-14.2-k*.4)/.8,0,1));const bx=lerp(sx,tx,.86),by=lerp(sy,ty,.86);
      drawEdge(sx,sy,bx,by,C.red,1.8,ua*.85,pr);if(pr>=1)blockX(bx,by-10,ua);
      REMAIN.filter((_,j)=>j%9===k*4).forEach((i,j)=>{const [cx,cy]=centre(i);drawEdge(sx,sy,cx,cy,C.green,1.2,ua*.5,ease(clamp((t-14.6-j*.05)/.7,0,1)),.05);});});
    personGlyph(120,380,24,C.nodeHi,'#16303F',ua);text('Users',120,430,17,C.ink,600,'center',ua);
    agentGlyph(120,540,22,C.green,'#0E2A1C',ua);text('Copilot',120,590,17,C.ink,600,'center',ua);}
  // your retention policies do the deletion
  const pb=win(t,19,28,.6);
  if(pb>0){const bx=1210,by=652,bw=350,bh=150;panel(bx,by,bw,bh,pb,{stroke:C.green,lw:2});
    text('Your retention policies',bx+24,by+44,21,C.ink,700,'left',pb);text('Final deletion, on the source system,',bx+24,by+78,16,C.muted,400,'left',pb);text('under your own governance',bx+24,by+100,16,C.muted,400,'left',pb);
    const gone=Q.filter(i=>t>21.6+qIndex[i]*.02).length;text(`${gone} files deleted`,bx+24,by+132,16,C.green,600,'left',pb*prog(t,21.4,22));
    Q.forEach((i,k)=>{const a=win(t,21+k*.02,21.8+k*.02,.3);if(a>0&&k%3===0){const [qx,qy]=qpos(k);drawEdge(qx+6,qy+6,bx,by+bh/2,C.green,1,a*.5,1,.1);}});}
  // a smaller footprint
  const fb=prog(t,30,31);
  if(fb>0){const x=1210,y=Y0;panel(x,y,350,330,fb);text('Before and after',x+24,y+42,22,C.ink,700,'left',fb);
    const sh=prog(t,31,33.4);const ratio=REMAIN.length/N;
    ['Files anyone can reach','Files in backup scope','Files in scope for requests'].forEach((l,j)=>{const ry=y+90+j*78;text(l,x+24,ry,17,C.muted,400,'left',fb);
      ctx.globalAlpha=fb;rrect(x+24,ry+12,302,22,6);ctx.fillStyle='#16303F';ctx.fill();rrect(x+24,ry+12,Math.max(8,302*lerp(1,ratio,sh)),22,6);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;
      text(String(Math.round(lerp(N,REMAIN.length,sh))),x+326,ry,17,C.ink,600,'right',fb);});
    text(`${Q.length} fewer files to lose`,x+24,y+306,18,C.green,600,'left',prog(t,33.4,34)*fb);}
  caption(t,[[.3,4,'Review what was flagged.'],[4.2,8,'Keep what is still needed.'],[8.2,13.6,'Quarantined. Out of everyday reach.'],[13.8,19,'Users and agents work from what is left.'],
    [19.2,23.8,'Final deletion stays with your own retention policies.'],[24,28,'On your terms. On your timeline.'],[28.2,33.4,'A smaller footprint.'],[33.6,40,'Less data. Less to lose.']]);
};
F4.beats=[[0,'Review first'],[8,'Quarantine'],[19,'Your retention policies'],[28,'A smaller footprint']];

/* ---------------- Summary: loops as an outro ---------------- */
const F5={dur:9};
const MINI=(()=>{const R=rng(21);const a=[];for(let i=0;i<32;i++){const r=R();a.push(r<.16?'Redundant':r<.36?'Obsolete':r<.44?'Trivial':null);}return a;})();
function miniGrid(cx,cy,ap,fn){const cols=8,s=26,g=8,x0=cx-(cols*(s+g)-g)/2,y0=cy-(4*(s+g)-g)/2;
  MINI.forEach((k,i)=>{const x=x0+(i%cols)*(s+g),y=y0+Math.floor(i/cols)*(s+g);fn(k,i,x,y,s);});return[x0,y0];}
function vizFind(cx,cy,t,ap){const c=t%6;const span=8*34;const bx=cx-span/2-20+clamp((c-.4)/2.6,0,1)*(span+40);const fade=1-prog(c,5.2,5.8);
  miniGrid(cx,cy,ap,(k,i,x,y,s)=>{ctx.globalAlpha=ap;rrect(x,y,s,s,5);ctx.fillStyle=C.tile;ctx.fill();if(k&&bx>x+s/2&&c>.4){ctx.globalAlpha=ap*fade*(k==='Trivial'?.85:1);ctx.fillStyle=CATCOL[k];ctx.fill();}ctx.globalAlpha=1;});
  const a=ap*win(c,.3,3.2,.3);if(a>0){ctx.globalAlpha=a;ctx.fillStyle='#7CF0A0';ctx.fillRect(bx-1,cy-76,2,152);ctx.globalAlpha=1;}}
function vizContext(cx,cy,t,ap){const pts=[['Where it lives',cx-118,cy-58],['Who can reach it',cx+118,cy-58],["What's inside",cx,cy+72]];
  pts.forEach(([l,x,y],k)=>{const a=ap*(.5+.5*Math.abs(Math.sin(t*1.2+k)));drawEdge(cx,cy,x,y,C.nodeHi,1.5,a*.7,1);const w=textW(l,14,600)+24;pill(l,x-w/2,y+6,k===2?C.teal:'#16303F',k===2?'#04201F':C.ink,ap,14);});
  ctx.globalAlpha=ap;rrect(cx-16,cy-16,32,32,6);ctx.fillStyle=C.amber;ctx.fill();ctx.globalAlpha=1;circle(cx,cy,26+3*Math.sin(t*3),null,C.ink,2,ap);}
function vizStage(cx,cy,t,ap){const c=t%6;const mv=prog(c,1,2.4),gone=prog(c,3.6,4.6),back=prog(c,5.2,5.9);
  ctx.save();ctx.setLineDash([5,6]);ctx.globalAlpha=ap;rrect(cx-150,cy+50,300,40,8);ctx.strokeStyle=C.amber;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();ctx.globalAlpha=1;
  let q=0;miniGrid(cx,cy-30,ap,(k,i,x,y,s)=>{if(i>=24)return;let xx=x,yy=y,ss=s*.8,al=ap;if(k){const qx=cx-140+(q%14)*20,qy=cy+60;q++;xx=lerp(x,qx,mv);yy=lerp(y*.8+(cy-30)*.2,qy,mv);ss=lerp(s*.8,14,mv);al=ap*(1-gone);}
    else yy=y*.8+(cy-30)*.2;
    if(k&&mv>0&&back>0){xx=x;yy=y*.8+(cy-30)*.2;ss=s*.8;al=ap*back;}
    if(al<=0)return;ctx.globalAlpha=al;rrect(xx,yy,ss,ss,4);ctx.fillStyle=k?CATCOL[k]:C.tile;ctx.fill();ctx.globalAlpha=1;});}
F5.render=function(t){backdrop();
  const cards=[{x:130,title:'Find it',lines:['Duplicate content','Untouched for years','Clutter and stale files']},
    {x:590,title:'Understand it',lines:['Where it lives','Who can reach it',"What's inside it"]},
    {x:1050,title:'Stage it out of reach',lines:['Review before anything moves','Quarantine, out of everyday reach','Your retention policies delete']}];
  cards.forEach((c,k)=>{const ap=prog(t,.6+k*.5,1.4+k*.5);if(ap<=0)return;const dy=(1-ap)*16;const x=c.x,y=196+dy,w=420,h=448;const cx=x+w/2;
    panel(x,y,w,h,ap,{lw:1.5});
    ctx.save();rrect(x+20,y+20,w-40,220,12);ctx.clip();ctx.globalAlpha=ap;ctx.fillStyle='#0C2130';ctx.fillRect(x+20,y+20,w-40,220);ctx.globalAlpha=1;
    if(k===0)vizFind(cx,y+130,t,ap);else if(k===1)vizContext(cx,y+130,t,ap);else vizStage(cx,y+130,t,ap);
    ctx.restore();
    text(c.title,x+28,y+290,26,C.ink,700,'left',ap);
    c.lines.forEach((l,i)=>{const ly=y+334+i*34;check(x+30,ly-6,14,C.green,ap);text(l,x+56,ly,17,C.muted,400,'left',ap);});});
  const fb=prog(t,2.2,3);
  if(fb>0){const x=130,y=672,w=1340,h=84;
    ctx.globalAlpha=fb;rrect(x,y,w,h,14);ctx.fillStyle='#0E2A1C';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.stroke();
    ctx.save();rrect(x,y,w,h,14);ctx.clip();const sx=x-300+frac(t/5)*(w+600);const gr=ctx.createLinearGradient(sx-220,0,sx+220,0);gr.addColorStop(0,'rgba(0,179,54,0)');gr.addColorStop(.5,'rgba(0,179,54,.22)');gr.addColorStop(1,'rgba(0,179,54,0)');ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);ctx.restore();ctx.globalAlpha=1;
    text('Veeam Intelligent ResOps for Microsoft 365',800,y+53,30,C.ink,700,'center',fb);}
  caption(t,[[.3,1e9,"Data you don't need is still data you can lose."]]);
};

const PARTS=[F1,F2,F3,F4,F5];
const G=['Part one: How ROT piles up','Part two: Data you can lose','Part three: Find it with context','Part four: Quarantine, not delete','Summary'];
F5.beats=[[0,'Less data, less to lose']];
const OFF=[];let acc=0;PARTS.forEach(p=>{OFF.push(acc);acc+=p.dur;});
const beats=PARTS.flatMap((p,g)=>p.beats.map(([a,b])=>[Math.round((a+OFF[g])*10)/10,b,g]));

return {
  width: W,
  height: H,
  duration: acc,
  groups: G,
  beats,
  render(t, { holdCaptions = false } = {}) {
    CAPHOLD = holdCaptions;
    let g = PARTS.length - 1;
    while (g > 0 && t < OFF[g]) g--;
    PARTS[g].render(t - OFF[g]);
  },
};
}
