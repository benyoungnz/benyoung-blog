// @ts-nocheck
// Film for the AG-UI protocol explainer: where it sits, the event stream, rendering, state and human in the loop.
// Examples come from the Veeam Agent Terminal lab build; the build itself has its own explainer (agent-interface).
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

/* ---------------- Part one: Where it sits ---------------- */
const OP=[250,440],AG=[800,440],SYX=1200;
const FRONTS=['Veeam Agent Terminal','A mobile app','A chat platform'];
const MODELS=['Agno 2.9, Claude models','Claude Haiku 4.5','Claude Sonnet 5','Claude Opus 5'];
// a label that cycles through its options from `start`, to show one layer changing under the others
function swapLabel(t,x,y,list,start,alpha){let i=0,a=1;if(t>=start){const u=(t-start)/1.4;i=Math.floor(u)%(list.length-1)+1;a=prog(frac(u),0,.25);}
  text(list[i],x,y,17,t>=start?C.brandHi:C.muted,t>=start?600:400,'center',alpha*a);}
const F1={dur:34};
F1.render=function(t){
  backdrop();
  const oa=prog(t,.3,1),aa=prog(t,.8,1.5),sa=prog(t,1.3,2);
  personGlyph(OP[0],OP[1],42,C.sky,'#0F2A40',oa);
  text('Operator',OP[0],OP[1]+80,22,C.ink,700,'center',oa);
  swapLabel(t,OP[0],OP[1]+108,FRONTS,24.4,oa);
  agentGlyph(AG[0],AG[1],38,C.violet,'#1E1A3A',aa);
  text('Agent team',AG[0],AG[1]+80,22,C.ink,700,'center',aa);
  if(t<29.4)text(MODELS[0],AG[0],AG[1]+108,17,C.muted,400,'center',aa);else swapLabel(t,AG[0],AG[1]+108,MODELS,29.4,aa);
  panel(SYX,OP[1]-90,300,180,sa,{stroke:C.green,lw:2});
  text('Your systems',SYX+24,OP[1]-52,15,C.green,600,'left',sa);
  text('Veeam Backup & Replication',SYX+24,OP[1]-10,18,C.ink,600,'left',sa);
  text('Veeam Data Cloud',SYX+24,OP[1]+24,18,C.ink,600,'left',sa);
  text('REST APIs',SYX+24,OP[1]+62,15,C.muted,400,'left',sa);
  // MCP: agent to tools and data
  const mp=prog(t,4.6,5.4);
  drawEdge(AG[0]+50,AG[1],SYX-8,AG[1],C.green,3,1,mp);
  const mx=(AG[0]+50+SYX)/2;
  pillC('MCP',mx,AG[1]+7,C.green,'#04140A',prog(t,5.2,5.8),17);
  text('Agent to tools and data',mx,AG[1]+48,16,C.muted,400,'center',prog(t,5.6,6.2));
  // the gap in front of the person
  const ax=(OP[0]+50+AG[0]-50)/2;
  const gq=win(t,10,15,.4);
  if(gq>0){ctx.save();ctx.setLineDash([8,10]);drawEdge(OP[0]+50,OP[1],AG[0]-50,AG[1],C.node,2,gq);ctx.restore();
    const pu=.5+.5*Math.sin(t*4);circle(ax,OP[1],22+pu*3,'#16303F',C.node,2,gq);text('?',ax,OP[1]+9,26,C.ink,700,'center',gq);}
  // AG-UI: agent to user
  const gp=prog(t,14.6,15.4);
  drawEdge(OP[0]+50,OP[1],AG[0]-50,AG[1],C.brand,4,1,gp);
  if(t>15.6){const sa2=prog(t,15.6,16.4);for(let k=0;k<4;k++){const u=frac(t*.45+k/4);if(Math.abs(u-.5)<.16)continue;circle(lerp(AG[0]-56,OP[0]+56,u),OP[1],4.5,C.brandHi,null,0,sa2*Math.sin(u*Math.PI));}}
  pillC('AG-UI',ax,OP[1]+7,C.brand,'#FFFFFF',prog(t,15.2,15.8),17);
  text('Agent to user',ax,OP[1]+48,16,C.muted,400,'center',prog(t,15.6,16.2));
  // A2A, not in this build
  const a2=prog(t,19.2,20);
  if(a2>0){ctx.save();ctx.setLineDash([7,8]);drawEdge(AG[0],AG[1]+126,AG[0],712,C.peach,2,a2*.9,a2);ctx.restore();
    pillC('A2A',AG[0],664,'#2E2010',C.peach,prog(t,19.8,20.4),16);
    text('Agent to agent',AG[0]+52,652,16,C.muted,400,'left',prog(t,20,20.6));text('Not in my build',AG[0]+52,676,16,C.peach,600,'left',prog(t,20.4,21));
    panel(AG[0]-120,716,240,58,prog(t,20,20.6),{fill:'#1A1A16',stroke:C.peach,dash:true});text('Other agents',AG[0],752,18,C.peach,600,'center',prog(t,20,20.6));}
  footer(oa);
  caption(t,[[.4,4.4,'The agent protocol talk has been about MCP.'],[4.6,9.8,'MCP connects an agent to tools and data.'],[10,14.4,'It says nothing about the person in front of it.'],
    [14.6,19,'AG-UI is the joint between agent and user.'],[19.2,24,'A2A coordinates agents. One team here, so not used.'],[24.2,29.2,'The three layers do not know about each other.'],[29.4,34,'Swap the model or the front end. The rest is untouched.']]);
};
F1.beats=[[0,'Where MCP stops'],[14.4,'AG-UI, agent and user'],[19,'A2A, agent and agent'],[24,'Independent layers']];


/* ---------------- Part two: Why request and response breaks ---------------- */
const RR=['Question','Work','Answer','End'];
const BRK=['It runs long','It takes steps','Its output is not text','It has to stop and ask'];
const BPX=60,BPW=340,BPG=40,BPY=300,BPH=400;
const READS=['jobs','sessions','repositories','proxies','malware events','server info'];
const STEPS=[['Which capability','vbr_list_repositories'],['With what arguments','{"limit":50}'],['What came back','12 repositories']];
const F2={dur:24};
F2.render=function(t){
  backdrop();
  // request and response
  const ra=prog(t,.3,1)*(1-.55*prog(t,5,5.6));
  if(ra>0){const ws=RR.map(s=>chipW(s,17));const tot=ws.reduce((a,b)=>a+b,0)+(RR.length-1)*56;let x=800-tot/2;
    RR.forEach((s,k)=>{const a=ra*prog(t,.4+k*.5,.9+k*.5);chip(s,x,232,'life',a,{size:17,fg:C.ink});if(k<RR.length-1)arrow(x+ws[k]+8,232,x+ws[k]+48,232,C.node,a*prog(t,.8+k*.5,1.2+k*.5));x+=ws[k]+56;});}
  // four ways an agent breaks it
  BRK.forEach((title,k)=>{const t0=5.2+k*4.4;const ap=prog(t,t0,t0+.6);if(ap<=0)return;
    const x=BPX+k*(BPW+BPG),y=BPY+(1-prog(t,t0,t0+.6))*16;const lit=t>t0&&t<t0+4.4;
    panel(x,y,BPW,BPH,ap,{stroke:lit?C.nodeHi:C.panelLine,lw:lit?2.5:1.5});
    mono(`0${k+1}`,x+24,y+40,15,C.muted,600,'left',ap);text(title,x+24,y+76,22,C.ink,700,'left',ap);
    const l=t-t0;
    if(k===0){READS.forEach((r,i)=>{const ry=y+122+i*32;mono(r,x+24,ry,14,C.muted,500,'left',ap);const f=clamp((l-.4-i*.12)/(2.4+i*.3),0,1);
        ctx.globalAlpha=ap;rrect(x+170,ry-9,146,8,4);ctx.fillStyle=C.tile;ctx.fill();if(f>0){rrect(x+170,ry-9,146*f,8,4);ctx.fillStyle=f>=1?C.green:C.nodeHi;ctx.fill();}ctx.globalAlpha=1;});
      const s=Math.round(clamp((l-.2)/3.6,0,1)*20);mono(`0:${String(s).padStart(2,'0')}`,x+24,y+346,38,C.ink,600,'left',ap);text('One question. Nothing on screen.',x+24,y+378,15,C.muted,400,'left',ap);}
    if(k===1){STEPS.forEach(([lab,v],i)=>{const a=ap*prog(l,.4+i*.5,.9+i*.5);const ry=y+128+i*76;text(lab,x+24,ry,15,C.muted,400,'left',a);mono(v,x+24,ry+30,16,C.ink,600,'left',a);check(x+BPW-46,ry+12,16,C.green,a,prog(l,.7+i*.5,1.2+i*.5));});}
    if(k===2){const pa=ap;ctx.globalAlpha=pa;ctx.fillStyle='rgba(185,200,210,.28)';[1,1,.92,.6].forEach((wf,i)=>ctx.fillRect(x+24,y+118+i*16,(BPW-48)*wf,5));ctx.globalAlpha=1;
      const st=prog(l,1,1.5);if(st>0){ctx.globalAlpha=pa*st;ctx.strokeStyle=C.red;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+20,y+150);ctx.lineTo(x+24+(BPW-44)*st,y+132);ctx.stroke();ctx.globalAlpha=1;}
      const ta=pa*prog(l,1.6,2.2);if(ta>0){const gx=x+24,gy=y+196,cw=(BPW-48)/4,rh=30;for(let r=0;r<5;r++)for(let c=0;c<4;c++){ctx.globalAlpha=ta;rrect(gx+c*cw+2,gy+r*rh+2,cw-4,rh-4,4);
        ctx.fillStyle=r===0?'#24414F':c===3&&r===2?'rgba(255,77,79,.45)':C.tile;ctx.fill();ctx.globalAlpha=1;}
        text('90 restore points, as a table',x+24,y+378,15,C.muted,400,'left',ta);}}
    if(k===3){const pa=ap*prog(l,.3,.8);pauseGlyph(x+BPW/2,y+176,44,C.amber,pa);text('Start the job now?',x+BPW/2,y+268,19,C.ink,600,'center',pa);
      button('Approve',x+40,y+300,124,42,C.green,true,pa);button('Decline',x+BPW-164,y+300,124,42,C.nodeHi,false,pa);}
  });
  caption(t,[[.3,5,'A web request. A question, some work, an answer, an end.'],[5.2,9.4,'An agent runs long. Six reads, ~20 seconds.'],[9.6,13.8,'It takes steps, and those are what you care about.'],
    [14,18.2,'Its output is a table, not a paragraph.'],[18.4,24,'And sometimes it has to stop and ask.']]);
};
F2.beats=[[0,'Request and response'],[5,'It runs long'],[9.4,'It takes steps'],[13.8,'Not text'],[18.2,'It stops to ask']];

/* ---------------- Part three: The communication path ---------------- */
const TERM={x:100,y:240,w:420,h:540},AGB={x:1180,y:240,w:320,h:540};
const EV=[['RUN_STARTED','life'],['STEP_STARTED','life'],['TOOL_CALL_START','tool'],['TOOL_CALL_ARGS','tool'],['TOOL_CALL_END','tool'],['TOOL_CALL_RESULT','tool'],['STATE_DELTA','state'],
  ['STEP_FINISHED','life'],['TEXT_MESSAGE_START','text'],['TEXT_MESSAGE_CONTENT','text'],['TEXT_MESSAGE_CONTENT','text'],['TEXT_MESSAGE_END','text'],['RUN_FINISHED','life']];
const EV0=4.8,EVGAP=.72,EVTRAVEL=1.4;
const FAMS=[['Lifecycle','life'],['Text message','text'],['Tool call','tool'],['State','state'],['Special','special']];
const RIA=[['threadId','the conversation'],['runId','this run'],['messages','history so far'],['state','shared state'],['tools','front-end tools'],['context','free-form']];
const TRANS=[['HTTP SSE','text','text, easy to debug'],['HTTP binary','tool','compact, for production'],['WebSockets','life','also valid'],['Webhooks','life','also valid']];
const MW=[['Run content','TEXT_MESSAGE_CONTENT','text'],['Tool call started','TOOL_CALL_START','tool'],['Run completed','RUN_FINISHED','life'],['An event it has no handler for','RAW','special']];
const F3={dur:37};
F3.render=function(t){
  backdrop();
  const sa=prog(t,0,.6)*(1-prog(t,27.6,28.2));
  if(sa>0){
    panel(TERM.x,TERM.y,TERM.w,TERM.h,sa,{stroke:C.sky,lw:2});text('Veeam Agent Terminal',TERM.x+24,TERM.y+40,19,C.ink,700,'left',sa);mono('HttpAgent, @ag-ui/client',TERM.x+24,TERM.y+68,14,C.sky,500,'left',sa);
    ctx.globalAlpha=sa;ctx.fillStyle=C.panelLine;ctx.fillRect(TERM.x+24,TERM.y+86,TERM.w-48,1.5);ctx.globalAlpha=1;
    panel(AGB.x,AGB.y,AGB.w,AGB.h,sa,{stroke:C.violet,lw:2});text('Agent team',AGB.x+24,AGB.y+40,19,C.ink,700,'left',sa);mono('POST /agui',AGB.x+24,AGB.y+70,16,C.brandHi,600,'left',sa);
    text('Agno 2.9, AgentOS',AGB.x+24,AGB.y+96,15,C.muted,400,'left',sa);agentGlyph(AGB.x+AGB.w/2,AGB.y+300,42,C.violet,'#1E1A3A',sa);
    // the request
    arrow(TERM.x+TERM.w+12,288,AGB.x-12,288,C.sky,sa,prog(t,.4,1.4));
    const ca=prog(t,1,1.6)*(1-prog(t,16.8,17.4))*sa;
    if(ca>0){const cx=630,cy=316,cw=440;panel(cx,cy,cw,236,ca,{fill:'#0F2A40',stroke:C.sky});mono('RunAgentInput',cx+24,cy+38,18,C.sky,700,'left',ca);
      RIA.forEach(([f,d],i)=>{const a=ca*prog(t,1.4+i*.2,1.8+i*.2);mono(f,cx+24,cy+76+i*26,15,C.ink,500,'left',a);text(d,cx+170,cy+76+i*26,15,C.muted,400,'left',a);});}
    // events back
    const la=prog(t,4.4,5)*sa;
    if(la>0){ctx.globalAlpha=la*.6;ctx.strokeStyle=C.panelLine;ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(AGB.x-12,616);ctx.lineTo(TERM.x+TERM.w+12,616);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
      const sw=prog(t,21.8,22.4);text('text/event-stream',850,594,14,C.muted,400,'center',la*(1-sw));text('any transport',850,594,14,C.brandHi,600,'center',la*sw);}
    let arrived=0;
    EV.forEach(([name,fam],i)=>{const e=EV0+i*EVGAP;const p=clamp((t-e)/EVTRAVEL,0,1);if(t>=e+EVTRAVEL)arrived=i+1;if(t<e||p>=1)return;
      const w=chipW(name,15);const x=lerp(AGB.x-20-w,TERM.x+TERM.w+20,ease(p));chip(name,x,616,fam,sa*Math.min(1,p*6,(1-p)*6),{size:15});});
    for(let i=0;i<arrived;i++){const [name,fam]=EV[i];const ry=TERM.y+126+i*29;const fl=1-prog(t,EV0+i*EVGAP+EVTRAVEL,EV0+i*EVGAP+EVTRAVEL+.8);
      if(fl>0){ctx.globalAlpha=sa*fl*.3;rrect(TERM.x+16,ry-19,TERM.w-32,26,6);ctx.fillStyle=FAMCOL[fam];ctx.fill();ctx.globalAlpha=1;}
      circle(TERM.x+34,ry-6,5,FAMCOL[fam],null,0,sa);mono(name,TERM.x+50,ry,14,C.ink,500,'left',sa);}
    // five families
    const fa=prog(t,13.2,13.8)*(1-prog(t,21.4,22))*sa;
    if(fa>0){const ws=FAMS.map(([s])=>chipW(s,14));const tot=ws.reduce((a,b)=>a+b,0)+(FAMS.length-1)*10;let x=850-tot/2;
      FAMS.forEach(([s,f],k)=>{chip(s,x,700,f,fa*prog(t,13.2+k*.15,13.6+k*.15),{size:14});x+=ws[k]+10;});}
    const qa=prog(t,17.4,18)*sa;
    if(qa>0){text('“an event stream rather than a rendering target”',850,420,24,C.ink,600,'center',qa);text('AG-UI documentation',850,456,16,C.muted,400,'center',qa);}
    // no transport is mandated
    const ta=prog(t,22,22.6)*sa;
    if(ta>0){const ws=TRANS.map(([s])=>chipW(s,15));const tot=ws.reduce((a,b)=>a+b,0)+(TRANS.length-1)*56;let x=850-tot/2;
      TRANS.forEach(([s,f,sub],k)=>{const a=ta*prog(t,22+k*.3,22.4+k*.3);chip(s,x,690,f,a,{size:15});text(sub,x+ws[k]/2,736,13,C.muted,400,'center',a);x+=ws[k]+56;});}
  }
  // middleware: a framework's own events, mapped onto AG-UI
  const ma=prog(t,28.2,28.8);
  if(ma>0){
    panel(100,230,420,440,ma,{stroke:C.violet,lw:2});text('Agno 2.9',124,272,20,C.ink,700,'left',ma);text('Its own event vocabulary',124,300,15,C.muted,400,'left',ma);
    panel(640,230,320,440,ma,{fill:'#1B1640',stroke:C.brand,lw:2});text('Middleware',664,272,20,C.ink,700,'left',ma);mono('agno.os.interfaces.agui',664,300,13,C.brandHi,500,'left',ma);
    panel(1080,230,420,440,ma,{stroke:C.nodeHi,lw:2});text('AG-UI events',1104,272,20,C.ink,700,'left',ma);text('What any client understands',1104,300,15,C.muted,400,'left',ma);
    MW.forEach(([fw,ev,fam],i)=>{const ry=370+i*78;const ti=29+i*.8;const a=ma*prog(t,ti-.4,ti);
      text(fw,124,ry+6,18,C.ink,500,'left',a);
      ctx.globalAlpha=ma*.35;ctx.strokeStyle=C.panelLine;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(520,ry);ctx.lineTo(1080,ry);ctx.stroke();ctx.globalAlpha=1;
      const u=clamp((t-ti)/1.4,0,1);if(u>0&&u<1)circle(lerp(520,1080,ease(u)),ry,6,u<.5?C.violet:FAMCOL[fam],null,0,ma);
      const ra=ma*prog(t,ti+1.2,ti+1.6);chip(ev,1104,ry,fam,ra,{size:15});
      if(i===3)text('passed through unchanged',1104,ry+40,14,C.amber,600,'left',ma*prog(t,33.4,34));});}
  caption(t,[[.3,4.4,'The client posts one RunAgentInput.'],[4.6,9,'The agent answers with a stream of typed events.'],[9.2,13,'Each event has a type, and can carry the raw original.'],
    [13.2,17.2,'Five families. Lifecycle, text, tool calls, state, special.'],[17.4,21.6,'A terminal, a phone or a chat app can render it.'],[21.8,27.6,'The protocol does not mandate a transport.'],
    [28.2,32.4,"Middleware maps a framework's own events onto AG-UI."],[32.6,37,'Anything it does not model passes through as RAW.']]);
};
F3.beats=[[0,'RunAgentInput'],[4.4,'A stream of events'],[13,'Five families'],[17.2,'Not a rendering target'],[21.6,'Any transport'],[28,'Middleware']];

/* ---------------- Part four: How UI gets rendered ---------------- */
const LANE=[['TOOL_CALL_START','tool','toolCallName'],['TOOL_CALL_ARGS','tool','{"window_hours":24}'],['TOOL_CALL_END','tool',''],['TOOL_CALL_RESULT','tool','{ jobs, repositories, … }'],['TEXT_MESSAGE','text','the prose']];
const LY=262,LX0=476,LG=24;
const CARD={x:400,y:400,w:760,h:400};
const TILES=[['Jobs','42','2 failed',C.red],['Fullest repository','81%','repo-02',C.amber],['Proxies online','3 of 3','all healthy',C.green],['Unresolved threats','0','last 24 h',C.green]];
const RUNS=(()=>{const R=rng(9);return Array.from({length:24},(_,i)=>({h:.35+R()*.6,c:i===5||i===6?C.red:i===14?C.amber:C.green}));})();
const PROSE='Two jobs failed overnight, both on the file server. Repository space is the next thing to watch.';
const F4={dur:36};
F4.render=function(t){
  backdrop();
  const la=1-prog(t,22.4,23);
  // the agent names a tool
  const na=prog(t,.3,.9)*la;
  agentGlyph(100,LY,24,C.violet,'#1E1A3A',na);
  chip('vbr_get_estate_overview',138,LY,'tool',na,{stroke:C.violet,fg:C.ink});
  arrow(398,LY,LX0-12,LY,C.node,na,prog(t,.8,1.2));
  let x=LX0;const xs=[];
  LANE.forEach(([name,fam,detail],i)=>{const w=chipW(name);xs.push([x,w]);const at=i<4?1.2+i*1.1:18.6;const a=prog(t,at,at+.5)*la;
    const res=i===3&&t>8.6;chip(name,x,LY,fam,a,res?{fill:C.brand,stroke:C.brand,fg:'#FFFFFF'}:{});
    if(detail)mono(detail,x+w/2,LY+44,13,res?C.brandHi:C.muted,500,'center',a);x+=w+LG;});
  // the result drops into the client's own component
  const [rx,rw]=xs[3];const dx=rx+rw/2;
  arrow(dx,LY+58,dx,CARD.y-10,C.brand,la,prog(t,8.8,9.6),2.5);
  const ca=prog(t,9.4,10)*la;
  if(ca>0){const {x:cx,y:cy,w:cw,h:ch}=CARD;const own=t>14.2&&t<18.6;
    panel(cx,cy,cw,ch,ca,{stroke:own?C.brand:C.panelLine,lw:own?3:1.5});
    text('Estate overview',cx+24,cy+38,20,C.ink,700,'left',ca);mono('vbr.lab.local · last 24 h',cx+cw-24,cy+38,14,C.muted,500,'right',ca);
    mono('<EstateDashboard />',cx+24,cy+64,13,C.brandHi,500,'left',ca);
    TILES.forEach(([lab,v,sub,col],i)=>{const a=ca*prog(t,10+i*.25,10.5+i*.25);const tw=169,tx=cx+24+i*(tw+12),ty=cy+86;
      ctx.globalAlpha=a;rrect(tx,ty,tw,130,10);ctx.fillStyle=C.tile;ctx.fill();ctx.globalAlpha=1;
      text(lab,tx+16,ty+28,14,C.muted,400,'left',a);text(v,tx+16,ty+80,34,C.ink,700,'left',a);text(sub,tx+16,ty+110,14,col,600,'left',a);});
    text('Runs, last 24 h',cx+24,cy+252,14,C.muted,400,'left',ca);
    RUNS.forEach((r,i)=>{const p=prog(t,11+i*.03,11.6+i*.03);const bh=86*r.h*p;ctx.globalAlpha=ca;rrect(cx+24+i*29.6,cy+356-bh,20,Math.max(bh,1),3);ctx.fillStyle=r.c;ctx.fill();ctx.globalAlpha=1;});
    text('Illustrative values',cx+cw-24,cy+386,13,C.muted,400,'right',ca);
    const ma=win(t,14.4,18.6,.4);if(ma>0)pillC('Written by the model: nothing',cx+cw/2,cy+ch+40,'#221A4A',C.brandHi,ma,16);}
  // then the prose, separately
  const pa=prog(t,18.8,19.4)*la;
  if(pa>0){panel(1190,400,350,230,pa,{fill:'#0F2A40',stroke:C.sky});text('Agent answer',1214,432,14,C.sky,600,'left',pa);
    const n=Math.floor(PROSE.length*clamp((t-19.2)/2.4,0,1));wrapText(PROSE.slice(0,n),1214,472,302,18,500,C.ink,pa,26);}
  // client-defined and backend-defined tools
  const ta=prog(t,22.8,23.4);
  if(ta>0){
    const ba=prog(t,27.2,27.8);
    panel(100,220,620,330,ta,{stroke:C.sky,lw:2});text('Client-defined tools',128,264,22,C.ink,700,'left',ta);mono('RunAgentInput.tools',128,294,15,C.sky,600,'left',ta);
    wrapText('Sent with each run. The front end adds or removes them by permission or application state.',128,340,560,18,400,C.ink,ta,27);
    chip('confirmAction',128,490,'tool',ta*prog(t,23.8,24.3),{stroke:C.sky});
    panel(880,220,620,330,ba,{stroke:C.violet,lw:2});text('Backend-defined tools',908,264,22,C.ink,700,'left',ba);mono('agent configuration',908,294,15,C.violet,600,'left',ba);
    wrapText('Stay with the agent or its framework. Never sent from the client.',908,340,560,18,400,C.ink,ba,27);
    chip('vbr_get_estate_overview',908,490,'tool',ba*prog(t,27.8,28.3),{stroke:C.violet});
    const ja=prog(t,31.4,32);
    if(ja>0){panel(240,600,1120,190,ja,{fill:'#1B1640',stroke:C.brand,lw:2});text('Both described as JSON Schema',800,642,18,C.brandHi,700,'center',ja);
      mono('{ "type": "object", "properties": { "window_hours": { "type": "integer" } } }',800,690,17,C.ink,500,'center',ja);
      text('The agent generates calls from it',520,752,17,C.muted,400,'center',prog(t,32.4,33)*ja);text('The front end validates arguments against it',1080,752,17,C.muted,400,'center',prog(t,33,33.6)*ja);}}
  caption(t,[[.3,4.4,'The agent names a tool.'],[4.6,9.2,'The call is on the stream as structured events.'],[9.4,14,'The client keys on the name and renders its own card.'],
    [14.2,18.4,'The model writes none of the card.'],[18.6,22.4,'The prose arrives after, and separately.'],[22.6,27,'Some tools come from the front end, in RunAgentInput.'],
    [27.2,31.2,"Others stay in the agent's own configuration."],[31.4,36,'Both are JSON Schema. The agent calls, the client validates.']]);
};
F4.beats=[[0,'Naming a tool'],[9.2,'The client renders it'],[18.4,'Then the prose'],[22.4,'Client and backend tools']];

/* ---------------- Part five: State and human in the loop ---------------- */
const SNAP=['{','  "mode": "delegated",','  "grants": [','    "vdc_get_estate_overview"','  ]','}'];
const SNAP2=['{','  "mode": "delegated",','  "grants": [','    "vdc_get_estate_overview",','    "vbr_list_jobs"','  ]','}'];
const SAG={x:100,y:220,w:260,h:520},SMS={x:520,y:220,w:440,h:300},SST={x:1040,y:220,w:460,h:420};
const HRUN={x:100,y:260,w:340,h:280},HCL={x:1100,y:240,w:400,h:380};
const HCH=[['TOOL_CALL_START','confirmAction'],['TOOL_CALL_ARGS','{"action":"start job"}'],['TOOL_CALL_END','']];
// a chip moving along a lane, between two panel edges, in either direction
function travel(label,fam,x1,x2,y,t,a,b,alpha,o={}){const p=clamp((t-a)/(b-a),0,1);if(p<=0||p>=1)return;const w=chipW(label,o.size||14);
  const from=x2>x1?x1:x1-w,to=x2>x1?x2-w:x2;chip(label,lerp(from,to,ease(p)),y,fam,alpha*Math.min(1,p*6,(1-p)*6),Object.assign({size:14},o));}
const F5={dur:42};
F5.render=function(t){
  backdrop();
  // shared state, beside the messages
  const st=prog(t,.2,.8)*(1-prog(t,17.6,18.2));
  if(st>0){
    panel(SAG.x,SAG.y,SAG.w,SAG.h,st,{stroke:C.violet,lw:2});text('Agent',SAG.x+24,SAG.y+40,20,C.ink,700,'left',st);agentGlyph(SAG.x+SAG.w/2,SAG.y+SAG.h/2,40,C.violet,'#1E1A3A',st);
    panel(SMS.x,SMS.y,SMS.w,SMS.h,st);text('Messages',SMS.x+24,SMS.y+40,18,C.ink,700,'left',st);
    const s='Checking the backup server now.';const n=Math.floor(s.length*clamp((t-2.4)/1.2,0,1));text(s.slice(0,n),SMS.x+24,SMS.y+92,19,C.ink,500,'left',st);
    const rendered=t>13.8;
    panel(SST.x,SST.y,SST.w,SST.h,st,{stroke:rendered?C.brand:C.green,lw:2});text('Shared state',SST.x+24,SST.y+40,18,C.ink,700,'left',st);
    // the two lanes
    ctx.globalAlpha=st*.5;ctx.strokeStyle=C.panelLine;ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(SAG.x+SAG.w+8,370);ctx.lineTo(SMS.x-8,370);ctx.moveTo(SAG.x+SAG.w+8,600);ctx.lineTo(SST.x-8,600);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
    travel('TEXT_MESSAGE_CONTENT','text',SAG.x+SAG.w+12,SMS.x-12,370,t,1,2.2,st);
    travel('STATE_SNAPSHOT','state',SAG.x+SAG.w+12,SST.x-12,600,t,4.8,6,st);
    travel('STATE_DELTA','state',SAG.x+SAG.w+12,SST.x-12,600,t,9.4,10.6,st);
    const ja=prog(t,6,6.5)*st;
    if(ja>0){const lines=t>10.6?SNAP2:SNAP;const flAll=1-prog(t,6,7.2);
      if(flAll>0){ctx.globalAlpha=ja*flAll*.25;rrect(SST.x+14,SST.y+64,SST.w-28,lines.length*30+16,8);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;}
      lines.forEach((l,j)=>{const ry=SST.y+96+j*30;if(t>10.6&&j===4){const fl=1-prog(t,10.6,12);if(fl>0){ctx.globalAlpha=ja*fl*.4;rrect(SST.x+14,ry-22,SST.w-28,30,6);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;}}
        mono(l,SST.x+28,ry,17,C.ink,500,'left',ja);});}
    const pa=prog(t,9.8,10.4)*(1-prog(t,13.6,14.2))*st;
    if(pa>0){panel(SST.x,SST.y+SST.h+24,SST.w,92,pa,{fill:'#0E2A1C',stroke:C.green});text('JSON Patch',SST.x+24,SST.y+SST.h+50,13,C.green,700,'left',pa);
      mono('{ "op": "add", "path": "/grants/-",',SST.x+24,SST.y+SST.h+76,14,C.ink,500,'left',pa);mono('  "value": "vbr_list_jobs" }',SST.x+24,SST.y+SST.h+98,14,C.ink,500,'left',pa);}
    const ra=prog(t,14,14.6)*st;
    if(ra>0){text('Rendered wherever the client likes',SST.x+SST.w/2,SST.y+SST.h+52,16,C.brandHi,600,'center',ra);
      const opts=['Access panel','Progress bar','Status line'];const ws=opts.map(s=>textW(s,14,600)+24);const tot=ws.reduce((a,b)=>a+b,0)+20;let x=SST.x+SST.w/2-tot/2;
      opts.forEach((s,k)=>{pill(s,x,SST.y+SST.h+96,'#1B1640',C.brandHi,ra*prog(t,14.4+k*.2,14.8+k*.2),14);x+=ws[k]+10;});}
  }
  // human in the loop, expressed as a tool
  const ha=prog(t,18.2,18.8);
  if(ha>0){
    panel(HRUN.x,HRUN.y,HRUN.w,HRUN.h,ha,{stroke:C.violet,lw:2});text('Agent run',HRUN.x+24,HRUN.y+40,20,C.ink,700,'left',ha);
    const sx=HRUN.x+56,sy=HRUN.y+150;
    if(t<20.6){playGlyph(sx,sy,26,C.violet,'#1E1A3A',ha);text('Running',sx+42,sy+8,19,C.violet,600,'left',ha);}
    else if(t<28.4){pauseGlyph(sx,sy,26,C.amber,ha);text('Waiting on the client',sx+42,sy+8,19,C.amber,600,'left',ha);}
    else{playGlyph(sx,sy,26,C.green,'#0E2A1C',ha);text('Carries on',sx+42,sy+8,19,C.green,600,'left',ha);text('with the answer',sx+42,sy+34,15,C.muted,400,'left',ha);}
    let cx=470;
    HCH.forEach(([n,d],i)=>{const a=ha*prog(t,19+i*.5,19.4+i*.5);const w=chip(n,cx,330,'tool',a,{size:14})||chipW(n,14);if(d)mono(d,cx+w/2,368,12,C.muted,500,'center',a);cx+=w+12;});
    const na=ha*prog(t,20.6,21.2);chip('TOOL_CALL_RESULT',470,420,'life',na*.8,{size:14,dash:true,stroke:C.node,fg:C.node,fill:'#0E2230'});
    text('comes from the client, not the agent',470+chipW('TOOL_CALL_RESULT',14)+14,426,15,C.amber,600,'left',na);
    panel(HCL.x,HCL.y,HCL.w,HCL.h,ha,{stroke:C.sky,lw:2});text('Client',HCL.x+24,HCL.y+40,20,C.ink,700,'left',ha);
    mono('confirmAction',HCL.x+24,HCL.y+70,15,C.brandHi,600,'left',ha);text('a front-end tool',HCL.x+170,HCL.y+70,14,C.muted,400,'left',ha);
    const fa=prog(t,21.4,22)*ha;
    if(fa>0){panel(HCL.x+20,HCL.y+96,HCL.w-40,250,fa,{fill:'#1A2216',stroke:C.amber,lw:2});text('Confirm',HCL.x+44,HCL.y+132,15,C.amber,700,'left',fa);
      wrapText('Start the Nightly file server job?',HCL.x+44,HCL.y+172,HCL.w-88,20,600,C.ink,fa,28);
      button('Approve',HCL.x+44,HCL.y+270,140,44,C.green,true,fa,t>27.6?prog(t,27.6,28.4):0);button('Decline',HCL.x+200,HCL.y+270,140,44,C.nodeHi,false,fa);}
    // the answer goes back as the tool's result
    ctx.globalAlpha=ha*prog(t,27.6,28)*.5;ctx.strokeStyle=C.panelLine;ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(HCL.x-8,560);ctx.lineTo(HRUN.x+HRUN.w+8,560);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
    travel('tool result: approved','state',HCL.x-12,HRUN.x+HRUN.w+12,560,t,27.8,29,ha);
    text('sent back as a tool message, and the run continues',770,604,16,C.muted,400,'center',ha*prog(t,29,29.6)*(1-prog(t,32.4,32.8)));
    travel('tool result: error','special',HCL.x-12,HRUN.x+HRUN.w+12,560,t,32.8,34,ha,{stroke:C.red,fg:C.red,fill:'#2A0A0B'});
    text('a failed result is marked with error',770,604,16,C.red,600,'center',ha*prog(t,34,34.6));
  }
  caption(t,[[.3,4.4,'Shared state is a channel beside the messages.'],[4.6,9,"A snapshot replaces the client's copy wholesale."],[9.2,13.6,'A delta sends only what changed, as JSON Patch.'],
    [13.8,18,'The client renders it wherever it likes, outside the chat.'],[18.4,23,'There is no interrupt event. A pause is a tool call.'],[23.2,27.4,'The front end owns the tool, so it asks a person.'],
    [27.6,32.4,'The answer goes back as the tool result.'],[32.6,37,'A failed result is marked, so the agent can tell.'],[37.2,42,'AI suggests actions. People make the critical calls.']]);
};
F5.beats=[[0,'A channel beside the messages'],[4.4,'Snapshot'],[9,'Delta'],[18.2,'A pause is a tool call'],[27.4,'The answer goes back']];

/* ---------------- Summary: loops as an outro ---------------- */
const F6={dur:9};
function vizStream(cx,cy,t,ap){for(let i=0;i<4;i++){const [nm,f]=EV[[0,3,6,9][i]];const w=chipW(nm,12);const u=frac(t*.22+i*.27);chip(nm,lerp(cx-180,cx+180-w,u),cy-54+i*36,f,ap*Math.sin(u*Math.PI),{size:12});}}
function vizGen(cx,cy,t,ap){const c=t%6;const k=prog(c,.4,.9)*(1-prog(c,5.2,5.8));chip('TOOL_CALL_RESULT',cx-chipW('TOOL_CALL_RESULT',14)/2,cy-62,'tool',ap*k,{size:14,fill:C.brand,stroke:C.brand,fg:'#FFFFFF'});
  const p=prog(c,1,1.6)*(1-prog(c,5.2,5.8));arrow(cx,cy-42,cx,cy-14,C.brand,ap*p,p);
  const ca=ap*prog(c,1.6,2.2)*(1-prog(c,5.2,5.8));if(ca>0){ctx.globalAlpha=ca;rrect(cx-120,cy-6,240,92,10);ctx.fillStyle=C.tile;ctx.fill();ctx.strokeStyle=C.brandHi;ctx.lineWidth=1.5;ctx.stroke();
    for(let i=0;i<3;i++){rrect(cx-108+i*76,cy+6,68,30,6);ctx.fillStyle='#24414F';ctx.fill();}
    RUNS.slice(0,12).forEach((r,i)=>{const bh=30*r.h;rrect(cx-108+i*18.6,cy+78-bh,12,bh,2);ctx.fillStyle=r.c;ctx.fill();});ctx.globalAlpha=1;}}
function vizConfirm(cx,cy,t,ap){const c=t%6;const vis=1-prog(c,5.2,5.8);const a=ap*prog(c,.3,.8)*vis;if(a<=0)return;
  ctx.globalAlpha=a;rrect(cx-140,cy-70,280,140,10);ctx.fillStyle='#1A2216';ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
  text('Confirm',cx-118,cy-40,13,C.amber,700,'left',a);mono('confirmAction',cx-118,cy-10,15,C.brandHi,600,'left',a);
  const pr=c>2.6?prog(c,2.6,3.4):0;button('Approve',cx-118,cy+18,112,36,C.green,true,a,pr);
  const g=prog(c,3.2,3.8);check(cx+20,cy+34,14,C.green,a*g,g);text('Result sent',cx+42,cy+42,15,C.green,700,'left',a*g);}
F6.render=function(t){backdrop();
  const cards=[{x:130,title:'One event stream',lines:['RunAgentInput in, typed events out','Five families, any transport','Middleware for existing frameworks']},
    {x:590,title:'Rendered by the client',lines:['Tool calls as structured events','Components keyed on the tool name','Client and backend tools, JSON Schema']},
    {x:1050,title:'State and decisions',lines:['Snapshots and JSON Patch deltas','A pause is a tool call','A person answers, the run carries on']}];
  cards.forEach((c,k)=>{const ap=prog(t,.6+k*.5,1.4+k*.5);if(ap<=0)return;const dy=(1-ap)*16;const x=c.x,y=196+dy,w=420,h=448;const cx=x+w/2;
    panel(x,y,w,h,ap,{lw:1.5});
    ctx.save();rrect(x+20,y+20,w-40,220,12);ctx.clip();ctx.globalAlpha=ap;ctx.fillStyle='#0C2130';ctx.fillRect(x+20,y+20,w-40,220);ctx.globalAlpha=1;
    if(k===0)vizStream(cx,y+130,t,ap);else if(k===1)vizGen(cx,y+130,t,ap);else vizConfirm(cx,y+130,t,ap);
    ctx.restore();
    text(c.title,x+28,y+290,26,C.ink,700,'left',ap);
    c.lines.forEach((l,i)=>{const ly=y+334+i*34;check(x+30,ly-6,14,C.green,ap);text(l,x+56,ly,17,C.muted,400,'left',ap);});});
  const fb=prog(t,2.2,3);
  if(fb>0){const x=130,y=672,w=1340,h=84;
    ctx.globalAlpha=fb;rrect(x,y,w,h,14);ctx.fillStyle='#1B1640';ctx.fill();ctx.strokeStyle=C.brand;ctx.lineWidth=2;ctx.stroke();
    ctx.save();rrect(x,y,w,h,14);ctx.clip();const sx=x-300+frac(t/5)*(w+600);const gr=ctx.createLinearGradient(sx-220,0,sx+220,0);gr.addColorStop(0,'rgba(122,91,255,0)');gr.addColorStop(.5,'rgba(122,91,255,.28)');gr.addColorStop(1,'rgba(122,91,255,0)');ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);ctx.restore();ctx.globalAlpha=1;
    text('AG-UI, the protocol',800,y+53,30,C.ink,700,'center',fb);
    text('Examples from a lab build against Veeam Backup & Replication. Not a Veeam product.',800,y+124,15,C.muted,400,'center',fb);}
  caption(t,[[.3,1e9,'The agent streams. The interface decides how it looks.']]);
};
F6.beats=[[0,'The agent streams']];

const PARTS=[F1,F2,F3,F4,F5,F6];
const G=['Part one: Where it sits','Part two: Why request and response breaks','Part three: The communication path','Part four: How UI gets rendered','Part five: State and human in the loop','Summary'];

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
