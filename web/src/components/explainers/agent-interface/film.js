// @ts-nocheck
// Film for the "Building a better agent interface" explainer: the Veeam Agent Terminal lab build behind the AG-UI series.
// The protocol itself has its own explainer (ag-ui).
// Pure canvas drawing: createFilm(ctx) returns the timeline the Explainer player drives.
// Drawn on a fixed 1600x900 stage; the player scales the context to the canvas size.
// Lab build, not a Veeam product. Job names, counts and dashboard values are illustrative. Capability names are real.

export default function createFilm(ctx) {
const W=1600,H=900;
const C={bg:'#0A1B26',grid:'rgba(143,163,179,0.07)',ink:'#E8EEF2',muted:'#8FA3B3',node:'#5F7687',nodeHi:'#B9C8D2',
  green:'#00B336',red:'#FF4D4F',amber:'#F2B23A',teal:'#2BB5B0',panel:'#10283A',panelLine:'#24414F',tile:'#1A3443',
  // the series' roles: sky for the operator, violet for the agent, green for Veeam systems and the gateway,
  // peach for things not in the build, and the brand violet for AG-UI itself
  sky:'#5AA9F0',violet:'#A99BF0',peach:'#F0A35E',brand:'#7A5BFF',brandHi:'#B7A6FF'};
const FONT='"Instrument Sans Variable", "Instrument Sans", system-ui, sans-serif';
const MONO='"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const prog=(t,a,b)=>ease(clamp((t-a)/(b-a),0,1));
const win=(t,a,b,f=.45)=>Math.min(prog(t,a,a+f),1-prog(t,b-f,b));
const frac=x=>x-Math.floor(x);
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function text(s,x,y,size,color,weight=400,align='left',alpha=1,font=FONT){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y);ctx.globalAlpha=1;}
const mono=(s,x,y,size,color,weight=500,align='left',alpha=1)=>text(s,x,y,size,color,weight,align,alpha,MONO);
function textW(s,size,weight=400,font=FONT){ctx.font=`${weight} ${size}px ${font}`;return ctx.measureText(s).width;}
function circle(x,y,r,fill,stroke,lw=2,alpha=1){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}ctx.globalAlpha=1;}
function pill(label,x,y,bg,fg,alpha,size=17){if(alpha<=0)return 0;const w=textW(label,size,600)+24;ctx.globalAlpha=alpha;rrect(x,y-size-3,w,size+14,(size+14)/2);ctx.fillStyle=bg;ctx.fill();ctx.globalAlpha=1;text(label,x+12,y+2,size,fg,600,'left',alpha);return w;}
const pillC=(label,cx,y,bg,fg,alpha,size=17)=>pill(label,cx-(textW(label,size,600)+24)/2,y,bg,fg,alpha,size);
function panel(x,y,w,h,alpha,o={}){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x,y,w,h,14);ctx.fillStyle=o.fill||C.panel;ctx.fill();ctx.strokeStyle=o.stroke||C.panelLine;ctx.lineWidth=o.lw||1.5;if(o.dash)ctx.setLineDash([6,6]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
let CAPHOLD=false; // presenter mode: each message holds until the next one starts
function caption(t,list){list.forEach(([a,b,s],i)=>{let al;if(CAPHOLD){const na=i+1<list.length?list[i+1][0]:1e9;al=t<na?prog(t,a,a+.8):1-prog(t,na,na+.4);}else al=win(t,a,b,.8);if(al>0){const dy=(1-prog(t,a,a+.8))*10;text(s,800,118+dy,42,C.ink,600,'center',al);}});}
function backdrop(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle=C.grid;ctx.lineWidth=1;for(let x=0;x<=W;x+=50){ctx.beginPath();ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H);ctx.stroke();}for(let y=0;y<=H;y+=50){ctx.beginPath();ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5);ctx.stroke();}}
function agentGlyph(x,y,s,stroke,fill,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x-s,y-s,s*2,s*2,s*.45);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y-s*.5);ctx.lineTo(x+s*.16,y-s*.16);ctx.lineTo(x+s*.5,y);ctx.lineTo(x+s*.16,y+s*.16);ctx.lineTo(x,y+s*.5);ctx.lineTo(x-s*.16,y+s*.16);ctx.lineTo(x-s*.5,y);ctx.lineTo(x-s*.16,y-s*.16);ctx.closePath();ctx.fillStyle=stroke;ctx.fill();ctx.globalAlpha=1;}
function personGlyph(x,y,r,stroke,fill,alpha){if(alpha<=0)return;circle(x,y,r,fill,stroke,2.5,alpha);ctx.globalAlpha=alpha;ctx.fillStyle=stroke;
  ctx.beginPath();ctx.arc(x,y-r*.24,r*.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x,y+r*.58,r*.52,Math.PI,0);ctx.fill();ctx.globalAlpha=1;}
function pauseGlyph(x,y,r,col,alpha){if(alpha<=0)return;circle(x,y,r,'#2A2410',col,2.5,alpha);ctx.globalAlpha=alpha;ctx.fillStyle=col;ctx.fillRect(x-r*.32,y-r*.4,r*.22,r*.8);ctx.fillRect(x+r*.1,y-r*.4,r*.22,r*.8);ctx.globalAlpha=1;}
function playGlyph(x,y,r,col,fill,alpha){if(alpha<=0)return;circle(x,y,r,fill,col,2.5,alpha);ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(x-r*.28,y-r*.42);ctx.lineTo(x+r*.45,y);ctx.lineTo(x-r*.28,y+r*.42);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.globalAlpha=1;}
function drawEdge(x1,y1,x2,y2,color,lw,alpha,progress=1,bend=0){
  if(alpha<=0||progress<=0)return;
  const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
  const cx=mx-dy/len*bend*len,cy=my+dx/len*bend*len;
  ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);
  const steps=28;for(let i=1;i<=Math.ceil(steps*progress);i++){const u=Math.min(1,i/steps,progress);const x=(1-u)*(1-u)*x1+2*(1-u)*u*cx+u*u*x2;const y=(1-u)*(1-u)*y1+2*(1-u)*u*cy+u*u*y2;ctx.lineTo(x,y);}
  ctx.stroke();ctx.globalAlpha=1;
  return [cx,cy];}
function arrowHead(x,y,dir,color,alpha){if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(dir);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-11,-6);ctx.lineTo(-11,6);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.restore();}
function arrow(x1,y1,x2,y2,color,alpha,p=1,lw=2){if(alpha<=0||p<=0)return;const x=lerp(x1,x2,p),y=lerp(y1,y2,p);drawEdge(x1,y1,x,y,color,lw,alpha);if(p>=1)arrowHead(x2,y2,Math.atan2(y2-y1,x2-x1),color,alpha);}
function curvedArrow(x1,y1,x2,y2,color,alpha,p,bend,lw=2){if(alpha<=0||p<=0)return;const c=drawEdge(x1,y1,x2,y2,color,lw,alpha,p,bend);if(p>=1&&c)arrowHead(x2,y2,Math.atan2(y2-c[1],x2-c[0]),color,alpha);}
function blockX(x,y,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle=C.red;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(x-9,y-9);ctx.lineTo(x+9,y+9);ctx.moveTo(x+9,y-9);ctx.lineTo(x-9,y+9);ctx.stroke();ctx.globalAlpha=1;}
function check(x,y,s,col,alpha,p=1){if(alpha<=0||p<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x,y);
  if(p<.4){const u=p/.4;ctx.lineTo(x+s*.35*u,y+s*.35*u);}else{const u=(p-.4)/.6;ctx.lineTo(x+s*.35,y+s*.35);ctx.lineTo(x+s*.35+s*.65*u,y+s*.35-s*.8*u);}
  ctx.stroke();ctx.lineCap='butt';ctx.lineJoin='miter';ctx.globalAlpha=1;}
function wrapText(s,x,y,maxW,size,weight,color,alpha,lh){ctx.font=`${weight} ${size}px ${FONT}`;const words=s.split(' ');let line='',yy=y;
  for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){text(line,x,yy,size,color,weight,'left',alpha);ctx.font=`${weight} ${size}px ${FONT}`;line=w;yy+=lh;}else line=test;}
  if(line)text(line,x,yy,size,color,weight,'left',alpha);return yy;}
function bubble(x,y,w,h,s,alpha,stroke=C.sky){if(alpha<=0)return;panel(x,y,w,h,alpha,{fill:'#0F2A40',stroke,lw:2});personGlyph(x+34,y+h/2,16,stroke,'#0F2A40',alpha);text(s,x+64,y+h/2+7,20,C.ink,500,'left',alpha);}
function button(label,x,y,w,h,col,filled,alpha,pressed=0){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x,y,w,h,10);ctx.fillStyle=filled?col:'rgba(0,0,0,0)';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
  if(pressed>0){ctx.globalAlpha=alpha*pressed*(1-pressed)*2.4;rrect(x-6,y-6,w+12,h+12,14);ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke();}ctx.globalAlpha=1;
  text(label,x+w/2,y+h/2+7,18,filled?'#0A1B26':col,700,'center',alpha);}

// Event chips. One colour per event family, used in every part.
const FAMCOL={life:C.nodeHi,text:C.sky,tool:C.brandHi,state:C.green,special:C.amber};
const FAMFILL={life:'#16303F',text:'#0F2A40',tool:'#221A4A',state:'#0E2A1C',special:'#2A2410'};
const chipW=(label,size=16)=>textW(label,size,600,MONO)+28;
// x is the left edge, y the vertical centre
function chip(label,x,y,fam,alpha,o={}){if(alpha<=0)return 0;const size=o.size||16;const w=chipW(label,size),h=size+18;
  ctx.globalAlpha=alpha;rrect(x,y-h/2,w,h,8);ctx.fillStyle=o.fill||FAMFILL[fam];ctx.fill();ctx.strokeStyle=o.stroke||FAMCOL[fam];ctx.lineWidth=o.lw||1.5;if(o.dash)ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  mono(label,x+14,y+size*.36,size,o.fg||FAMCOL[fam],600,'left',alpha);return w;}
function footer(alpha,s='Lab build. Not a Veeam product.'){text(s,W-60,H-36,15,C.muted,400,'right',alpha);}


/* ---------------- Part one: Tools for the agent ---------------- */
const WRAP=['list_jobs','list_sessions','list_repositories','list_proxies','list_malware_events','get_server_info'];
const READS=['jobs','sessions','repositories','proxies','malware','server'];
const SUMROWS=[['Jobs','2 failed: Nightly file server, Web tier',C.red],['Fullest repository','repo-02 at 81%',C.amber],['Proxies','3 of 3 online',C.green],['Last 24 h','38 runs, 2 failed',C.amber],['Threats','None unresolved',C.green]];
const NOTES=['The repository id can live in two places','Some job types need a file server resolved','An edit replaces the whole definition'];
const ARGS=[['name','"File server daily"'],['scope','[ "File server" ]'],['repository','"repo-02"']];
const T1={dur:34};
T1.render=function(t){
  backdrop();
  // a tool per endpoint
  const sa=prog(t,.2,.8)*(1-prog(t,22.8,23.4));
  if(sa>0){panel(100,200,680,560,sa);text('A tool per endpoint',124,242,22,C.ink,700,'left',sa);text('A one-to-one wrapper around the REST API',124,270,15,C.muted,400,'left',sa);
    const cb={x:480,y:300,w:276,h:436};panel(cb.x,cb.y,cb.w,cb.h,sa,{fill:'#0C2130'});text('Context window',cb.x+18,cb.y+32,14,C.muted,600,'left',sa);
    WRAP.forEach((w,i)=>{const at=1+i*.9;const a=sa*prog(t,at,at+.3);const y=330+i*62;chip(w,124,y,'tool',a,{size:15,stroke:C.violet});
      const d=prog(t,at+.3,at+.8);if(d>0){const by=cb.y+cb.h-14-(i+1)*62,bx=lerp(124+chipW(w,15),cb.x+14,d);ctx.globalAlpha=sa*d;rrect(bx,by,cb.w-28,54,8);ctx.fillStyle=C.tile;ctx.fill();
        ctx.fillStyle='rgba(185,200,210,.3)';for(let k=0;k<3;k++)ctx.fillRect(bx+12,by+12+k*12,(cb.w-52)*(k===2?.5:.9),4);ctx.globalAlpha=1;mono(w.replace(/^(list|get)_/,''),bx+cb.w-40,by+46,11,C.muted,500,'right',sa*d);}});
    const ra=prog(t,9.6,10.2)*sa;if(ra>0){text('Six raw payloads, reasoned over one by one',124,730,16,C.amber,600,'left',ra);}}
  // a composite
  const ca=prog(t,14,14.6)*(1-prog(t,22.8,23.4));
  if(ca>0){const x=840;panel(x,200,660,560,ca,{stroke:C.green,lw:2});text('A composite capability',x+24,242,22,C.ink,700,'left',ca);
    chip('vbr_get_estate_overview',x+24,296,'tool',ca,{fill:C.brand,stroke:C.brand,fg:'#FFFFFF'});
    const fp=clamp((t-14.8)/1.4,0,1);
    READS.forEach((r,i)=>{const bx=x+24+i*102,by=340;ctx.globalAlpha=ca;rrect(bx,by,92,46,8);ctx.fillStyle=C.tile;ctx.fill();ctx.globalAlpha=1;mono(r,bx+46,by+22,12,C.ink,500,'center',ca);
      ctx.globalAlpha=ca;rrect(bx+10,by+32,72,5,2);ctx.fillStyle='#24414F';ctx.fill();if(fp>0){rrect(bx+10,by+32,72*fp,5,2);ctx.fillStyle=fp>=1?C.green:C.nodeHi;ctx.fill();}ctx.globalAlpha=1;});
    text('All six at once, settled, not chained',x+24,412,15,C.muted,400,'left',ca*prog(t,15,15.6));
    SUMROWS.forEach(([l,v,col],i)=>{const a=ca*prog(t,16.6+i*.3,17+i*.3);const ry=470+i*46;circle(x+32,ry-6,5,col,null,0,a);text(l,x+48,ry,15,C.muted,400,'left',a);text(v,x+240,ry,17,C.ink,600,'left',a);});
    text('Detail behind any line is one call away',x+24,736,16,C.brandHi,600,'left',ca*prog(t,19,19.6));}
  // writes
  const wa=prog(t,23.4,24);
  if(wa>0){panel(100,200,680,560,wa,{stroke:C.amber,lw:2});text('A backup job, through the API',124,242,22,C.ink,700,'left',wa);text('Nearly two hundred fields',124,270,15,C.amber,600,'left',wa);
    for(let i=0;i<192;i++){const c=i%16,r=Math.floor(i/16);const a=wa*prog(t,23.6+i*.008,24+i*.008);ctx.globalAlpha=a*.8;rrect(124+c*39.5,300+r*20,32,10,3);ctx.fillStyle=(i*37)%11===0?'#4A3A14':C.tile;ctx.fill();ctx.globalAlpha=1;}
    NOTES.forEach((n,i)=>{const a=wa*prog(t,25+i*.5,25.4+i*.5);const ry=600+i*40;circle(132,ry-6,5,C.amber,null,0,a);text(n,148,ry,17,C.ink,500,'left',a);});
    const ba=prog(t,24.4,25);
    panel(840,200,660,560,ba,{stroke:C.green,lw:2});mono('vbr_create_backup_job',864,244,20,C.brandHi,600,'left',ba);text('What the agent fills in',864,272,15,C.muted,400,'left',ba);
    ARGS.forEach(([k,v],i)=>{const a=ba*prog(t,25+i*.3,25.4+i*.3);mono(k,864,330+i*44,17,C.muted,500,'left',a);mono(v,1060,330+i*44,17,C.ink,500,'left',a);});
    const ha=prog(t,28.2,28.8)*ba;
    if(ha>0){ctx.globalAlpha=ha*.25;rrect(852,446,636,48,8);ctx.fillStyle=C.amber;ctx.fill();ctx.globalAlpha=ha;ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
      mono('runAutomatically',864,476,17,C.amber,600,'left',ha);mono('false',1060,476,17,C.amber,700,'left',ha);text('unless set',1480,476,15,C.amber,600,'right',ha);
      wrapText('Creating a job and scheduling it are two decisions. A job that has not run costs a follow-up question. One that starts copying at 22:00 unannounced is an incident.',864,560,600,18,400,C.ink,prog(t,29.4,30),27);}}
  caption(t,[[.3,4.6,'A one-to-one wrapper is a tool per endpoint.'],[4.8,9.4,'The model calls each one and holds every payload.'],[9.6,13.8,'Orchestration that is identical every time.'],
    [14,18.4,'A composite runs six reads together.'],[18.6,22.8,'It keeps what changes a decision.'],[23.2,28,'Writes hide more. A job spec is nearly two hundred fields.'],[28.2,34,'Risk lives in the tool. A new job does not run by itself.']]);
};
T1.beats=[[0,'A tool per endpoint'],[13.8,'A composite'],[23,'Writes']];

/* ---------------- Part two: Your components ---------------- */
const DEF=[['name','vbr_get_job',true],['description','Get one backup job, its schedule, scope and last result.',false],['input','{ jobId }',true],['output','{ name, type, schedule, status, lastResult, … }',true]];
const MAP=[['vbr_get_estate_overview','Estate dashboard'],['vbr_get_job','Job detail'],['vbr_get_session_detail','Verdict, tasks, then log'],['vbr_create_backup_job','Job-created receipt'],
  ['vbr_delete_job','Job-deleted receipt'],['vbr_list_*   (~20 capabilities)','One shared table'],['anything else','Generic view']];
const JD=[['Schedule','Daily, 22:00',C.ink],['Scope','14 VMs',C.ink],['Last result','Failed',C.red],['Target','repo-02',C.ink]];
const REC=[{t:'Job created',warn:true,say:'The job exists but has no schedule. Nothing is protected yet.'},{t:'Job updated',warn:false,say:'Which settings actually moved, read back after the write.'},
  {t:'Job deleted',warn:true,say:'The backups survived and are still restorable. Nothing ages them out now.'},{t:'Cache cleared',warn:false,say:'What was deleted was restore points, on the computers themselves.'}];
const T2={dur:38};
T2.render=function(t){
  backdrop();
  // a declared output shape
  const oa=prog(t,.3,.9)*(1-prog(t,8.8,9.4));
  if(oa>0){panel(240,230,1120,300,oa);text('Capability definition',264,268,15,C.muted,600,'left',oa);
    DEF.forEach(([k,v,isMono],i)=>{const ry=318+i*52;const a=oa*prog(t,.6+i*.3,1+i*.3);const hl=i===3&&t>4.8;
      if(hl){ctx.globalAlpha=a*.25;rrect(252,ry-32,1096,48,8);ctx.fillStyle=C.brand;ctx.fill();ctx.globalAlpha=1;}
      text(k,264,ry,16,C.muted,400,'left',a);if(isMono)mono(v,440,ry,17,i===0?C.brandHi:C.ink,500,'left',a);else text(v,440,ry,17,C.ink,500,'left',a);});
    const ra=prog(t,5.2,5.8)*oa;arrow(800,540,800,600,C.brand,ra,ra,2.5);chip('<JobDetail />',800-chipW('<JobDetail />',16)/2,632,'tool',ra);
    text('keys on fields it knows are there',800,690,16,C.muted,400,'center',ra);}
  // the renderer map
  const ma=prog(t,9.2,9.8)*(1-prog(t,17.6,18.2));
  if(ma>0){text('Capability name',300,212,15,C.muted,600,'left',ma);text('Renders as',980,212,15,C.muted,600,'left',ma);
    MAP.forEach(([cap,comp],i)=>{const a=ma*prog(t,9.6+i*.22,10.1+i*.22);const ry=252+i*56;const hl=i===5&&t>13.8;
      if(hl){ctx.globalAlpha=a*.25;rrect(276,ry-28,1050,46,10);ctx.fillStyle=C.brand;ctx.fill();ctx.globalAlpha=1;}
      mono(cap,300,ry,18,i===6?C.muted:C.brandHi,500,'left',a);arrow(870,ry-6,950,ry-6,C.node,a);text(comp,980,ry,19,i===6?C.muted:C.ink,600,'left',a);});
    const ea=prog(t,14.2,14.8)*ma;
    if(ea>0){text('Every listing returns the same envelope',800,664,16,C.muted,400,'center',ea);mono('{ data: T[], pagination: { total, count, skip, limit } }',800,700,20,C.brandHi,600,'center',ea);}}
  // a job is ~110 fields; the card shows a few
  const fa=prog(t,18.2,18.8)*(1-prog(t,22.2,22.8));
  if(fa>0){panel(100,230,640,420,fa);text('A job definition',124,270,20,C.ink,700,'left',fa);text('~110 fields, most of them modes nobody turned on',124,298,15,C.muted,400,'left',fa);
    for(let i=0;i<110;i++){const c=i%11,r=Math.floor(i/11);const hl=[3,27,58,91].includes(i);ctx.globalAlpha=fa*(hl?1:.6);rrect(124+c*54,330+r*30,46,16,4);ctx.fillStyle=hl?C.brand:C.tile;ctx.fill();ctx.globalAlpha=1;}
    const ja=prog(t,19.4,20)*fa;
    panel(860,230,640,420,ja,{stroke:C.brandHi,lw:2});text('Nightly file server',884,272,22,C.ink,700,'left',ja);mono('<JobDetail />',1476,272,13,C.brandHi,500,'right',ja);
    JD.forEach(([k,v,col],i)=>{const a=ja*prog(t,19.8+i*.25,20.2+i*.25);const ry=340+i*70;text(k,884,ry,15,C.muted,400,'left',a);text(v,884,ry+30,22,col,700,'left',a);});}
  // receipts
  const rc=prog(t,22.6,23.2);
  if(rc>0){const dimR=1-.75*prog(t,31.8,32.3);
    REC.forEach((r,k)=>{const back=t>32.3?prog(t,32.6+k*.3,33+k*.3):1;const a=rc*prog(t,22.8+k*.4,23.2+k*.4)*(t>32.3?Math.max(.25,back):dimR);if(a<=0)return;
      const x=60+k*380,y=250;const warn=r.warn&&t>27.2;
      panel(x,y,340,240,a,{stroke:warn?C.amber:C.panelLine,lw:warn?2.5:1.5});text('Receipt',x+24,y+38,14,warn?C.amber:C.muted,600,'left',a);
      text(r.t,x+24,y+76,22,C.ink,700,'left',a);check(x+300,y+64,16,C.green,a);wrapText(r.say,x+24,y+124,292,18,400,C.ink,a,27);});
    const pa=prog(t,32.4,33);if(pa>0){pillC('Reopened thread',800,600,'#1B1640',C.brandHi,pa,17);text('The same renderers, fed from stored tool calls',800,648,16,C.muted,400,'center',pa);}}
  caption(t,[[.3,4.6,'Each capability declares its output, not just its input.'],[4.8,9,'So a renderer keys on real fields.'],[9.2,13.6,'One map from capability name to component.'],
    [13.8,17.8,'Twenty listings share one envelope, so one table.'],[18,22.4,'A job is ~110 fields. The card shows the few that matter.'],[22.6,27,'Four receipts, because each write has one thing to say.'],
    [27.2,31.6,'A warning only where someone has to come back.'],[31.8,38,'Reopen a thread and the cards come back, not a transcript.']]);
};
T2.beats=[[0,'Declared output'],[9,'The renderer map'],[17.8,'Fewer fields'],[22.4,'Receipts'],[31.6,'History replay']];

/* ---------------- Part three: Quick actions ---------------- */
const JOBS=[['Nightly file server','Failed',C.red,'22:00'],['SQL cluster','Success',C.green,'23:30'],['Exchange archive','Success',C.green,'01:00'],['Web tier','Warning',C.amber,'02:00']];
const MENU=[['Why did this fail?','Sends'],['What can I recover from it?','Sends'],['Run it now','Drafts'],['Hold it during maintenance','Drafts']];
const ALLOWED=['Entire VM restore','File-level restore'];
const T3={dur:20};
T3.render=function(t){
  backdrop();
  const out=1-prog(t,9.2,9.8);
  const qa=prog(t,.2,.8)*out;
  if(qa>0){const tx=120,ty=220,tw=820;panel(tx,ty,tw,300,qa);
    ['Job','Last result','Next run'].forEach((h,i)=>text(h,tx+24+[0,360,580][i],ty+40,14,C.muted,600,'left',qa));
    JOBS.forEach(([n,r,col,nx],i)=>{const ry=ty+92+i*52;const hv=i===0&&t>.8;
      if(hv){ctx.globalAlpha=qa*.5;rrect(tx+12,ry-30,tw-24,46,8);ctx.fillStyle=C.tile;ctx.fill();ctx.globalAlpha=1;}
      text(n,tx+24,ry,18,C.ink,500,'left',qa);text(r,tx+384,ry,17,col,600,'left',qa);circle(tx+372,ry-6,5,col,null,0,qa);mono(nx,tx+580,ry,16,C.ink,500,'left',qa);
      if(i===0){const ba=prog(t,.8,1.2);ctx.globalAlpha=qa*ba;rrect(tx+tw-64,ry-28,40,40,8);ctx.fillStyle=t>1.2?'#221A4A':C.tile;ctx.fill();ctx.strokeStyle=C.brandHi;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;text('⋯',tx+tw-44,ry,22,C.ink,700,'center',qa*ba);}});
    const mn=prog(t,1.4,2)*out;
    if(mn>0){const mx=980,my=268;panel(mx,my,460,236,mn,{fill:'#132C3A',stroke:C.brandHi});
      MENU.forEach(([s,tag],i)=>{const ry=my+48+i*52;const sel=i===2&&t>5;
        if(sel){ctx.globalAlpha=mn*.3;rrect(mx+10,ry-30,440,46,8);ctx.fillStyle=C.brand;ctx.fill();ctx.globalAlpha=1;}
        text(s,mx+24,ry,18,C.ink,500,'left',mn*prog(t,1.6+i*.15,2+i*.15));
        const read=tag==='Sends';const w=textW(tag,13,600)+24;pill(tag,mx+436-w,ry,read?'#0E2A1C':'#2A2410',read?C.green:C.amber,mn*prog(t,2.6+i*.15,3+i*.15),13);});}
    const cp=prog(t,5.2,5.8)*out;
    if(cp>0){const cx=120,cy=700,cw=1320;panel(cx,cy,cw,76,cp,{fill:'#0F2A40',stroke:C.sky,lw:2});
      const s='Run the Nightly file server job now.';const n=Math.floor(s.length*clamp((t-5.6)/1.6,0,1));
      text(s.slice(0,n),cx+28,cy+46,20,C.ink,500,'left',cp);if(n<s.length||frac(t*1.6)<.5){const cw2=textW(s.slice(0,n),20,500);ctx.globalAlpha=cp;ctx.fillStyle=C.sky;ctx.fillRect(cx+30+cw2,cy+26,2,26);ctx.globalAlpha=1;}
      button('Send',cx+cw-150,cy+16,126,44,C.sky,false,cp);
      text('The operator sends it. The agent proposes the call. The approval gate applies.',800,826,17,C.muted,400,'center',prog(t,7.2,7.8)*out);}}
  // the product decides what is possible
  const ra=prog(t,9.8,10.4);
  if(ra>0){panel(120,240,760,260,ra);text('Restore point',144,280,14,C.muted,600,'left',ra);text('File server, today 02:00',144,314,22,C.ink,700,'left',ra);
    mono('allowedOperations',144,372,16,C.brandHi,600,'left',ra);let px=144;ALLOWED.forEach((s,i)=>{px+=pill(s,px,424,'#0E2A1C',C.green,ra*prog(t,10.4+i*.3,10.8+i*.3),15)+10;});
    const ma=prog(t,11.4,12);panel(980,240,460,190,ma,{fill:'#132C3A',stroke:C.brandHi});
    ['Restore the entire VM','Browse files to restore'].forEach((s,i)=>{const a=ma*prog(t,11.8+i*.3,12.2+i*.3);text(s,1004,292+i*52,18,C.ink,500,'left',a);drawEdge(144+300,424,980,286+i*52,C.green,1.5,a*.5,a,.05*(i?1:-1));});
    const na=prog(t,14.8,15.4);if(na>0){panel(980,460,460,70,na,{fill:'#141F28',stroke:C.panelLine,dash:true});text('Instant recovery',1004,502,18,C.muted,500,'left',na);text('not offered',1416,502,15,C.amber,600,'right',na);
      text('Not in allowedOperations, so not in the menu',1210,566,15,C.muted,400,'center',na);}}
  caption(t,[[.3,4.8,'Quick actions write a prompt. They never call a capability.'],[5,9.2,'So a write still goes through the approval gate.'],
    [9.6,14.6,'Recovery items come from allowedOperations.'],[14.8,20,'So the menu never offers what the server would refuse.']]);
};
T3.beats=[[0,'Prompts, not calls'],[9.4,'The product decides']];

/* ---------------- Part four: Just-in-time access ---------------- */
const ACC={x:940,y:220,w:560,h:600};
const GRANTS=[['vdc_get_estate_overview',6],['vbr_get_estate_overview',15.2],['vbr_list_jobs',16.8],['vbr_get_session_detail',18.4],['vbr_list_repositories',20]];
const F4={dur:36};
F4.render=function(t){
  backdrop();
  const ha=prog(t,.3,.9);
  text('Messages',100,186,16,C.muted,700,'left',ha);text('Shared state',ACC.x,186,16,C.muted,700,'left',ha);
  ctx.globalAlpha=ha*.6;ctx.fillStyle=C.panelLine;ctx.fillRect(900,170,1.5,650);ctx.globalAlpha=1;
  // the access panel
  const pa=prog(t,.8,1.4);const {x,y,w}=ACC;
  const did=t>27.8&&t<31.6;
  panel(x,y,w,ACC.h,pa,{stroke:did?C.green:C.panelLine,lw:did?3:1.5});
  text('Access',x+24,y+40,22,C.ink,700,'left',pa);
  const fill=prog(t,5.6,6.2);
  text('Agent',x+24,y+86,15,C.muted,400,'left',pa);text('Veeam Agent Terminal',x+150,y+86,17,C.ink,600,'left',pa*fill);
  text('Mode',x+24,y+124,15,C.muted,400,'left',pa);
  const auto=t>34;pill(auto?'Autonomous':'Delegated',x+150,y+122,auto?'#2A2410':'#0F2A40',auto?C.amber:C.sky,pa*fill,15);
  const n=GRANTS.filter(([,g])=>t>=g).length;
  text('Reads',x+24,y+162,15,C.muted,400,'left',pa);text(`${n} of 59 reads`,x+150,y+162,17,C.ink,700,'left',pa*fill);
  ctx.globalAlpha=pa*fill;rrect(x+24,y+180,w-48,8,4);ctx.fillStyle=C.tile;ctx.fill();if(n>0){rrect(x+24,y+180,(w-48)*n/59,8,4);ctx.fillStyle=C.green;ctx.fill();}ctx.globalAlpha=1;
  ctx.globalAlpha=pa;ctx.fillStyle=C.panelLine;ctx.fillRect(x+24,y+210,w-48,1.5);ctx.globalAlpha=1;
  text('Granted',x+24,y+246,14,C.muted,600,'left',pa);
  if(did){const s='What it did';pill(s,x+w-24-(textW(s,14,600)+24),y+250,'#0E2A1C',C.green,prog(t,27.8,28.4),14);}
  GRANTS.forEach(([cap,g],i)=>{if(t<g)return;const ry=y+290+i*46;const a=pa*prog(t,g,g+.3);const fl=1-prog(t,g,g+1.4);
    const ring=i===0?win(t,9.2,13.4,.4):0;
    if(fl>0||ring>0){ctx.globalAlpha=a*Math.max(fl*.45,ring*.3);rrect(x+14,ry-28,w-28,42,8);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;}
    if(ring>0){ctx.globalAlpha=a*ring;rrect(x+14,ry-28,w-28,42,8);ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;}
    mono(cap,x+28,ry,16,C.ink,500,'left',a);check(x+w-46,ry-8,16,C.green,a,prog(t,g+.2,g+.6));});
  // the snapshot that seeds it
  const sp=clamp((t-4.8)/1,0,1);
  if(sp>0&&sp<1){chip('STATE_SNAPSHOT',lerp(500,x+20,ease(sp)),y+290,'state',Math.min(1,sp*6,(1-sp)*6),{size:15});}
  // a conversation that reaches for capabilities
  const cv=1-prog(t,23,23.6);
  bubble(100,236,760,72,'How is the backup server doing?',prog(t,13.6,14.2)*cv);
  GRANTS.slice(1).forEach(([cap,g],i)=>{const ry=360+i*62;const a=prog(t,g-.8,g-.4)*cv;if(a<=0)return;
    const w=chip(cap,140,ry,'tool',a,{size:16});
    const p=clamp((t-g+.4)/.6,0,1);if(p>0&&p<1){chip('STATE_DELTA',lerp(150+w,x+20,ease(p)),lerp(ry,y+290+(i+1)*46-8,ease(p)),'state',Math.min(1,p*6,(1-p)*6),{size:13});}});
  // granting everything up front
  const ua=win(t,23.2,31.4,.5);
  if(ua>0){panel(100,236,760,440,ua,{stroke:C.amber,lw:2});text('Granted up front',124,278,20,C.ink,700,'left',ua);text('59 of 59 reads',836,278,17,C.amber,700,'right',ua);
    for(let i=0;i<59;i++){const c=i%12,r=Math.floor(i/12);const a=ua*prog(t,23.4+i*.02,23.8+i*.02);ctx.globalAlpha=a*.7;rrect(124+c*58,312+r*58,46,46,8);ctx.fillStyle='#4A3A14';ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;}
    text('What it might touch',124,644,18,C.amber,600,'left',ua);}
  // two auth modes
  const ma=prog(t,31.6,32.2);
  if(ma>0){[[100,'Delegated','Privileged capabilities pause in the conversation for an inline approval card.',C.sky,!auto],
      [490,'Autonomous','Nothing pauses. A named server policy decided at registration. A refusal is final.',C.amber,auto]].forEach(([px,h,b,col,on])=>{
      panel(px,236,370,260,ma,{stroke:on?col:C.panelLine,lw:on?2.5:1.5});text(h,px+24,280,22,on?col:C.ink,700,'left',ma);wrapText(b,px+24,322,322,18,400,C.ink,ma,27);});}
  caption(t,[[.3,4.6,'Shared state is a channel beside the messages.'],[4.8,9,'The agent writes it. The client renders it outside the chat.'],[9.2,13.4,'A fresh session holds exactly one capability.'],
    [13.6,18.4,'Each read is granted the first time a tool reaches for it.'],[18.6,23,'So the panel grows as the conversation does.'],[23.2,27.6,'Granting everything up front lists what it might touch.'],
    [27.8,31.4,'This lists what it did.'],[31.6,36,'Delegated pauses to ask. Autonomous follows a named policy.']]);
};
F4.beats=[[0,'A channel beside the chat'],[9,'One capability to start'],[13.4,'Just-in-time grants'],[23,'What it did'],[31.4,'Delegated or autonomous']];

/* ---------------- Part five: Approvals ---------------- */
const RUN={x:100,y:290,w:360,h:250},AP={x:560,y:270,w:480,h:300},GW={x:1140,y:290,w:360,h:250};
const PCH=[['TOOL_CALL_START','tool'],['TOOL_CALL_ARGS','tool'],['TOOL_CALL_END','tool']];
const F5={dur:40};
F5.render=function(t){
  backdrop();
  const dec=t>36.8;
  bubble(100,168,620,70,'Start the Nightly file server job now.',prog(t,.3,.9));
  // the agent run
  const ra=prog(t,.8,1.4);
  panel(RUN.x,RUN.y,RUN.w,RUN.h,ra,{stroke:C.violet,lw:2});text('Agent run',RUN.x+24,RUN.y+40,20,C.ink,700,'left',ra);mono('vbr_start_job',RUN.x+24,RUN.y+74,16,C.brandHi,600,'left',ra*prog(t,2,2.6));
  const sx=RUN.x+60,sy=RUN.y+150;
  if(dec){pauseGlyph(sx,sy,28,C.node,ra);text('Ended. Nothing ran.',sx+46,sy+8,20,C.muted,600,'left',ra);}
  else if(t<4.8){playGlyph(sx,sy,28,C.violet,'#1E1A3A',ra);text('Running',sx+46,sy+8,20,C.violet,600,'left',ra);}
  else if(t<23.4){pauseGlyph(sx,sy,28,C.amber,ra);text('Paused',sx+46,sy+8,20,C.amber,600,'left',ra);}
  else{playGlyph(sx,sy,28,C.green,'#0E2A1C',ra);text('Resumed',sx+46,sy+8,20,C.green,600,'left',ra);
    const ok=prog(t,24.6,25.2);check(RUN.x+26,RUN.y+214,16,C.green,ra*ok,ok);text('Job session started',RUN.x+52,RUN.y+222,17,C.ink,600,'left',ra*ok);}
  // how the pause arrives: a tool call with no result
  const ca=1-prog(t,18.2,18.8);let cx=100;
  PCH.forEach(([n,f],i)=>{const a=prog(t,5+i*.5,5.4+i*.5)*ca;const w=chip(n,cx,630,f,a,{size:15});cx+=(w||chipW(n,15))+14;});
  const na=prog(t,6.6,7.2)*ca;chip('TOOL_CALL_RESULT',cx,630,'life',na*.8,{size:15,dash:true,stroke:C.node,fg:C.node,fill:'#0E2230'});
  text('no result yet',cx+chipW('TOOL_CALL_RESULT',15)+16,636,16,C.amber,600,'left',na);
  const ac=win(t,14.2,18.6,.4);
  if(ac>0){mono('autoCancelPendingToolCalls: false',800,706,18,C.amber,600,'center',ac);text('client setting, so the pending call is kept',800,734,15,C.muted,400,'center',ac);}
  // the approval card
  const pa=prog(t,9.6,10.2);
  if(pa>0){const {x,y,w,h}=AP;const col=dec?C.node:C.amber;
    panel(x,y,w,h,pa,{fill:'#1A2216',stroke:col,lw:2.5});ctx.globalAlpha=pa;ctx.save();rrect(x,y,w,h,14);ctx.clip();ctx.fillStyle=col;ctx.fillRect(x,y,8,h);ctx.restore();ctx.globalAlpha=1;
    text(dec?'Declined':'Approval needed',x+32,y+40,15,col,700,'left',pa);
    text('Start the backup job',x+32,y+80,24,C.ink,700,'left',pa);text('Nightly file server, now.',x+32,y+112,20,C.ink,500,'left',pa);
    ctx.globalAlpha=pa;ctx.fillStyle=C.panelLine;ctx.fillRect(x+32,y+136,w-64,1.5);ctx.globalAlpha=1;
    mono('vbr_start_job',x+32,y+170,16,C.brandHi,600,'left',pa*prog(t,10.4,10.8));mono('{"job":"Nightly file server"}',x+32,y+198,15,C.muted,500,'left',pa*prog(t,10.6,11));
    button('Approve',x+32,y+226,150,46,C.green,true,pa*(dec?.35:1),t>18.6&&!dec?prog(t,18.6,19.4):0);
    button('Decline',x+198,y+226,150,46,dec?C.red:C.nodeHi,false,pa,dec?prog(t,36.8,37.6):0);}
  // the gateway
  const ga=prog(t,1.2,1.8);
  panel(GW.x,GW.y,GW.w,GW.h,ga,{stroke:C.green,lw:2});text('Gateway',GW.x+24,GW.y+40,20,C.ink,700,'left',ga);
  text('My own service. Separate write-up.',GW.x+24,GW.y+70,14,C.muted,400,'left',ga);
  const granted=t>19.6&&!dec;
  if(granted){const g=prog(t,19.6,20.2);check(GW.x+28,GW.y+144,18,C.green,ga*g,g);text('Grant created',GW.x+58,GW.y+156,20,C.green,700,'left',ga*g);text('recorded with the approver',GW.x+58,GW.y+184,15,C.muted,400,'left',ga*g);}
  else{circle(GW.x+38,GW.y+150,8,null,C.node,2,ga);text('No grant',GW.x+58,GW.y+156,20,C.muted,600,'left',ga);}
  // approve: the browser posts the decision to the gateway
  const dp=prog(t,18.8,19.4)*(dec?1-prog(t,36.8,37.2):1);
  arrow(AP.x+AP.w+8,AP.y+120,GW.x-8,AP.y+120,C.green,dp>0?1:0,dp,2.5);text('decision',(AP.x+AP.w+GW.x)/2,AP.y+104,14,C.green,600,'center',dp);
  // then the run resumes with the operator's answer
  const rp=prog(t,23,23.8)*(1-prog(t,27.2,27.8));
  curvedArrow(AP.x+AP.w/2,AP.y+AP.h+8,RUN.x+RUN.w/2,RUN.y+RUN.h+8,C.green,rp>0?1-prog(t,27.2,27.8):0,prog(t,23,23.8),-.22,2.5);
  text("resumes with the operator's answer",540,720,16,C.green,600,'center',rp);
  // never through the agent's own backend
  const bp=win(t,27.6,36.6,.5);
  if(bp>0){ctx.save();ctx.setLineDash([8,8]);drawEdge(RUN.x+80,RUN.y+RUN.h+6,GW.x+GW.w-80,GW.y+GW.h+6,C.red,2.5,bp,prog(t,27.6,28.6),.2);ctx.restore();
    blockX(800,665,prog(t,28.6,29));text("The agent's backend approving its own request",800,720,18,C.red,600,'center',prog(t,28.8,29.4)*bp);}
  // decline
  const da=prog(t,37.2,37.8);
  if(da>0){panel(400,640,800,104,da,{stroke:C.red});text('Decline',430,680,20,C.red,700,'left',da);text('Nothing runs. No grant. The reason is kept as a record.',430,716,19,C.ink,500,'left',da);}
  caption(t,[[.3,4.6,'Some capabilities write. Those need a person.'],[4.8,9.4,'The run pauses. A tool call arrives with no result.'],[9.6,14,'The card says what will happen, then the arguments.'],
    [14.2,18.4,'The client default would cancel it, so that is off.'],[18.6,22.8,'Approve posts the decision to the gateway.'],[23,27.4,'Then the run resumes with the answer.'],
    [27.6,32.4,"The decision never travels through the agent's backend."],[32.6,36.6,'A service approving its own request approved nothing.'],[36.8,40,'Decline. Nothing runs and no grant is made.']]);
};
F5.beats=[[0,'A privileged call'],[4.6,'The run pauses'],[9.4,'The approval card'],[18.4,'Approve via the gateway'],[27.4,"Not the agent's backend"],[36.6,'Decline']];

/* ---------------- Part six: Honest interfaces ---------------- */
const HON=[
  {a:'Question sent. Nothing came back.',as:'A failed run, shown as an empty answer',b:'This turn failed. The language model rejected the API key.',bs:'Fixed in the AG-UI bridge, Agno 2.9'},
  {a:'Job disabled',as:'Echoes the argument that was sent',b:'Read back from the server: Disabled',bs:'And says so when the read-back fails'},
  {a:'Granted: 59 of 59 reads',as:'What the agent might touch',b:'Granted: 5 of 59 reads',bs:'What the agent did touch'},
  {a:'Status: Idle',as:'A disabled job, shown as idle',b:'Status: Disabled',bs:'Shown as what it is'}];
const F6={dur:30};
F6.render=function(t){
  backdrop();
  const ha=prog(t,4.8,5.4);
  text('What it said',100,184,16,C.muted,700,'left',ha);text('What was true',860,184,16,C.muted,700,'left',ha);
  HON.forEach((r,k)=>{const t0=4.8+k*4.8;const y=204+k*128;const la=prog(t,t0,t0+.5);if(la<=0)return;
    const dim=t>t0+4.8?.75:1;
    panel(100,y,660,108,la*dim,{fill:'#1E1618',stroke:'#5A2A2C'});
    text(r.a,128,y+46,20,C.ink,600,'left',la*dim);text(r.as,128,y+82,15,C.muted,400,'left',la*dim);
    const st=prog(t,t0+1.4,t0+1.9);if(st>0){const sw=textW(r.a,20,600);ctx.globalAlpha=la*dim;ctx.strokeStyle=C.red;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(124,y+39);ctx.lineTo(124+(sw+8)*st,y+39);ctx.stroke();ctx.globalAlpha=1;}
    const rp=prog(t,t0+2,t0+2.5),ra=rp*dim;
    arrow(772,y+54,846,y+54,C.node,ra,rp);
    panel(860,y,640,108,ra,{fill:'#0E2A1C',stroke:C.green});check(886,y+38,16,C.green,ra,ra);
    const fs=textW(r.b,20,600)>560?18:20;text(r.b,914,y+46,fs,C.ink,600,'left',ra);text(r.bs,914,y+82,15,C.muted,400,'left',ra);});
  footer(ha,'Agno 2.9, ag-ui-protocol 0.1.20, @ag-ui/client 0.0.57');
  caption(t,[[.3,4.6,'Much of the work was making the interface honest.'],[4.8,9.4,'A failed run looked like an empty answer.'],[9.6,14.2,'A receipt echoed the request, not the result.'],
    [14.4,19,'A grant list showed what the agent might touch.'],[19.2,23.8,'A disabled job looked the same as an idle one.'],[24,27,'An agent makes each of these worse.'],[27.2,30,'It answers with more confidence than the data deserves.']]);
};
F6.beats=[[0,'Comfortable untruths'],[4.6,'A silent failure'],[9.4,'An echoed receipt'],[14.2,'A grant list'],[19,'A disabled job']];


/* ---------------- Part six: Latency is interface ---------------- */
const TIERS=[['Router','Claude Haiku 4.5','Routing, listing, transcription','Paid on every question, twice a turn',C.sky],
  ['Fast','Claude Sonnet 5','Reading estate posture','Judgement over a payload already aggregated',C.green],
  ['Deep','Claude Opus 5, extended reasoning','Planning a restore into a live tenant','A wrong restore point is not fixed by retrying',C.brandHi]];
const MEAS=[['Team leader, before delegating',6],['Estate analyst on Opus, high effort, before its first call',13],['The same analyst on Sonnet, medium effort',10]];
const T6={dur:32};
T6.render=function(t){
  backdrop();
  // silent seconds on the stream
  const la=prog(t,.2,.8)*(1-prog(t,8.8,9.4));
  if(la>0){const y=420,x0=150,pps=60;
    ctx.globalAlpha=la*.6;ctx.strokeStyle=C.panelLine;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(1460,y);ctx.stroke();ctx.globalAlpha=1;
    for(let s=0;s<=20;s+=5){mono(`${s} s`,x0+s*pps,y+56,13,C.muted,500,'center',la);ctx.globalAlpha=la*.6;ctx.fillStyle=C.panelLine;ctx.fillRect(x0+s*pps-1,y+28,2,10);ctx.globalAlpha=1;}
    circle(x0,y,8,C.sky,null,0,la);text('Question sent',x0,y-60,16,C.sky,600,'center',la);
    chip('RUN_STARTED',x0+14,y-28,'life',la*prog(t,.6,1),{size:13});
    const gp=clamp((t-1)/3.6,0,1);
    if(gp>0){ctx.save();ctx.setLineDash([6,6]);drawEdge(x0+12,y,x0+12+(13*pps-12)*gp,y,C.red,3,la);ctx.restore();
      const s=Math.round(gp*13);mono(`0:${String(s).padStart(2,'0')}`,x0+13*pps/2,y+130,40,C.red,600,'center',la);text('nothing reaches the stream',x0+13*pps/2,y+166,16,C.red,600,'center',la);}
    const fa=prog(t,4.6,5.2)*la;if(fa>0){circle(x0+13*pps,y,7,C.brandHi,null,0,fa);chip('TOOL_CALL_START',x0+13*pps+14,y-28,'tool',fa,{size:13});}}
  // three tiers
  const ta=prog(t,9.2,9.8)*(1-prog(t,17.8,18.4));
  if(ta>0)TIERS.forEach(([tier,model,work,why,col],k)=>{const a=ta*prog(t,9.4+k*.4,9.9+k*.4);const x=100+k*460;
    panel(x,240,420,340,a,{stroke:col,lw:2});text(tier,x+24,284,15,col,700,'left',a);wrapText(model,x+24,326,372,24,700,C.ink,a,30);
    text(work,x+24,420,17,C.ink,500,'left',a);wrapText(why,x+24,470,372,16,400,C.muted,a,24);});
  // measured
  const ma=prog(t,18.2,18.8)*(1-prog(t,26.2,26.8));
  if(ma>0){const bx=880,pps=40;
    MEAS.forEach(([l,s],i)=>{const ry=290+i*96;const a=ma*prog(t,18.4+i*.4,18.8+i*.4);wrapText(l,100,ry,700,18,500,C.ink,a,24);
      const p=prog(t,18.6+i*.4,19.6+i*.4);ctx.globalAlpha=a;rrect(bx,ry-20,s*pps*p,26,6);ctx.fillStyle=i===1?C.red:C.amber;ctx.fill();ctx.globalAlpha=1;
      mono(`~${s} s`,bx+s*pps*p+14,ry,17,i===1?C.red:C.amber,600,'left',a*p);});
    const ra=prog(t,22.6,23.2)*ma;if(ra>0){panel(100,580,1400,110,ra,{fill:'#0E2A1C',stroke:C.green});check(128,628,18,C.green,ra,ra);text('Extended reasoning off for that agent',160,632,20,C.ink,700,'left',ra);
      text('Its first call is already named in its instructions. The analysis happens after the payload lands.',160,664,16,C.muted,400,'left',ra);}}
  // a counted wait
  const ca=prog(t,26.6,27.2);
  if(ca>0){bubble(360,250,880,72,'What failed overnight?',ca);panel(360,350,880,170,ca);
    const dots=Math.floor(t*3)%4;text('Working'+'.'.repeat(dots),392,420,22,C.ink,600,'left',ca);
    const s=Math.floor(Math.max(0,t-26.8)*1.6);mono(`0:${String(s).padStart(2,'0')}`,1208,424,40,C.brandHi,600,'right',ca);
    text('Elapsed, for exactly as long as the thread runs',392,476,16,C.muted,400,'left',ca);}
  caption(t,[[.3,4.6,'On a stream, every silent second looks broken.'],[4.8,9,'So model choice becomes an interface decision.'],[9.2,13.6,'Haiku routes, and its latency is paid twice a turn.'],
    [13.8,18,'Opus plans restores, where a retry does not fix a mistake.'],[18.2,22.4,'~13 seconds deciding a call its instructions already named.'],[22.6,26.4,'Reasoning off. The analysis happens after the payload lands.'],
    [26.6,32,'The wait that remains is counted, so it reads as progress.']]);
};
T6.beats=[[0,'Silent seconds'],[9,'Three tiers'],[18,'Measured'],[26.4,'A counted wait']];

/* ---------------- Summary: loops as an outro ---------------- */
const T8={dur:9};
const RUNS=(()=>{const R=rng(9);return Array.from({length:24},(_,i)=>({h:.35+R()*.6,c:i===5||i===6?C.red:i===14?C.amber:C.green}));})();
function vizComp(cx,cy,t,ap){const c=t%6;const vis=1-prog(c,5.2,5.8);chip('vbr_get_estate_overview',cx-chipW('vbr_get_estate_overview',13)/2,cy-62,'tool',ap*vis,{size:13,fill:C.brand,stroke:C.brand,fg:'#FFFFFF'});
  const fp=clamp((c-.6)/1.2,0,1);for(let i=0;i<6;i++){const bx=cx-162+i*56;ctx.globalAlpha=ap*vis;rrect(bx,cy-26,48,22,5);ctx.fillStyle=C.tile;ctx.fill();rrect(bx+6,cy-12,36*fp,4,2);ctx.fillStyle=fp>=1?C.green:C.nodeHi;ctx.fill();ctx.globalAlpha=1;}
  const sa=ap*prog(c,2,2.6)*vis;if(sa>0){[[C.red,'2 jobs failed'],[C.amber,'repo-02 at 81%'],[C.green,'0 threats']].forEach(([col,s],i)=>{circle(cx-150,cy+20+i*26,5,col,null,0,sa);text(s,cx-138,cy+26+i*26,14,C.ink,500,'left',sa*prog(c,2+i*.3,2.4+i*.3));});}}
function vizGen(cx,cy,t,ap){const c=t%6;const k=prog(c,.4,.9)*(1-prog(c,5.2,5.8));chip('TOOL_CALL_RESULT',cx-chipW('TOOL_CALL_RESULT',14)/2,cy-62,'tool',ap*k,{size:14,fill:C.brand,stroke:C.brand,fg:'#FFFFFF'});
  const p=prog(c,1,1.6)*(1-prog(c,5.2,5.8));arrow(cx,cy-42,cx,cy-14,C.brand,ap*p,p);
  const ca=ap*prog(c,1.6,2.2)*(1-prog(c,5.2,5.8));if(ca>0){ctx.globalAlpha=ca;rrect(cx-120,cy-6,240,92,10);ctx.fillStyle=C.tile;ctx.fill();ctx.strokeStyle=C.brandHi;ctx.lineWidth=1.5;ctx.stroke();
    for(let i=0;i<3;i++){rrect(cx-108+i*76,cy+6,68,30,6);ctx.fillStyle='#24414F';ctx.fill();}
    RUNS.slice(0,12).forEach((r,i)=>{const bh=30*r.h;rrect(cx-108+i*18.6,cy+78-bh,12,bh,2);ctx.fillStyle=r.c;ctx.fill();});ctx.globalAlpha=1;}}
function vizAppr(cx,cy,t,ap){const c=t%6;const vis=1-prog(c,5.2,5.8);const a=ap*prog(c,.3,.8)*vis;if(a<=0)return;
  ctx.globalAlpha=a;rrect(cx-140,cy-70,280,140,10);ctx.fillStyle='#1A2216';ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.stroke();ctx.save();rrect(cx-140,cy-70,280,140,10);ctx.clip();ctx.fillStyle=C.amber;ctx.fillRect(cx-140,cy-70,6,140);ctx.restore();ctx.globalAlpha=1;
  text('Approval needed',cx-118,cy-40,13,C.amber,700,'left',a);mono('vbr_start_job',cx-118,cy-10,15,C.brandHi,600,'left',a);
  const pr=c>2.6?prog(c,2.6,3.4):0;button('Approve',cx-118,cy+18,112,36,C.green,true,a,pr);
  const g=prog(c,3.2,3.8);check(cx+20,cy+34,14,C.green,a*g,g);text('Granted',cx+42,cy+42,15,C.green,700,'left',a*g);}
T8.render=function(t){backdrop();
  const cards=[{x:130,title:'Tools for the agent',lines:['Composites, not endpoint wrappers','Output shapes declared per capability','Risk set in the tool, not the prompt']},
    {x:590,title:'Your components',lines:['One map from name to component','Receipts that say one thing','Quick actions write prompts']},
    {x:1050,title:'Access and approval',lines:['Grants taken just in time','A person approves, via the gateway','Failures and waits shown, not hidden']}];
  cards.forEach((c,k)=>{const ap=prog(t,.6+k*.5,1.4+k*.5);if(ap<=0)return;const dy=(1-ap)*16;const x=c.x,y=196+dy,w=420,h=448;const cx=x+w/2;
    panel(x,y,w,h,ap,{lw:1.5});
    ctx.save();rrect(x+20,y+20,w-40,220,12);ctx.clip();ctx.globalAlpha=ap;ctx.fillStyle='#0C2130';ctx.fillRect(x+20,y+20,w-40,220);ctx.globalAlpha=1;
    if(k===0)vizComp(cx,y+130,t,ap);else if(k===1)vizGen(cx,y+130,t,ap);else vizAppr(cx,y+130,t,ap);
    ctx.restore();
    text(c.title,x+28,y+290,26,C.ink,700,'left',ap);
    c.lines.forEach((l,i)=>{const ly=y+334+i*34;check(x+30,ly-6,14,C.green,ap);text(l,x+56,ly,17,C.muted,400,'left',ap);});});
  const fb=prog(t,2.2,3);
  if(fb>0){const x=130,y=672,w=1340,h=84;
    ctx.globalAlpha=fb;rrect(x,y,w,h,14);ctx.fillStyle='#1B1640';ctx.fill();ctx.strokeStyle=C.brand;ctx.lineWidth=2;ctx.stroke();
    ctx.save();rrect(x,y,w,h,14);ctx.clip();const sx=x-300+frac(t/5)*(w+600);const gr=ctx.createLinearGradient(sx-220,0,sx+220,0);gr.addColorStop(0,'rgba(122,91,255,0)');gr.addColorStop(.5,'rgba(122,91,255,.28)');gr.addColorStop(1,'rgba(122,91,255,0)');ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);ctx.restore();ctx.globalAlpha=1;
    text('Building a better agent interface',800,y+53,30,C.ink,700,'center',fb);
    text('Lab build. Veeam Backup & Replication REST API and a Veeam Data Cloud technical preview. Not a Veeam product.',800,y+124,15,C.muted,400,'center',fb);}
  caption(t,[[.3,1e9,'My UI, driven by the agent.']]);
};
T8.beats=[[0,'My UI, driven by the agent']];

const PARTS=[T1,T2,T3,F4,F5,T6,F6,T8];
const G=['Part one: Tools for the agent','Part two: Your components','Part three: Quick actions','Part four: Just-in-time access','Part five: Approvals','Part six: Latency is interface','Part seven: Honest interfaces','Summary'];

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
