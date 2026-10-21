// @ts-nocheck
// Film for the "AI agents in Microsoft 365" explainer (Veeam Intelligent ResOps for Microsoft 365).
// Pure canvas drawing: createFilm(ctx) returns the timeline the Explainer player drives.
// Drawn on a fixed 1600x900 stage; the player scales the context to the canvas size.
// Demo data from a demo tenant; Northwind Group is fictional. User group counts are illustrative.

export default function createFilm(ctx) {
const W=1600,H=900;
const C={bg:'#0A1B26',grid:'rgba(143,163,179,0.07)',ink:'#E8EEF2',muted:'#8FA3B3',node:'#5F7687',nodeHi:'#B9C8D2',
  green:'#00B336',red:'#FF4D4F',amber:'#F2B23A',access:'#3BA7E8',create:'#8E7CE8',modify:'#F2B23A',teal:'#2BB5B0',panel:'#10283A',panelLine:'#24414F'};
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
function circle(x,y,r,fill,stroke,lw=2,alpha=1){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}ctx.globalAlpha=1;}
function pill(label,x,y,bg,fg,alpha,size=17){if(alpha<=0)return 0;const w=textW(label,size,600)+24;ctx.globalAlpha=alpha;rrect(x,y-size-3,w,size+14,(size+14)/2);ctx.fillStyle=bg;ctx.fill();ctx.globalAlpha=1;text(label,x+12,y+2,size,fg,600,'left',alpha);return w;}
// messages: top and centre, slow fades
let CAPHOLD=false; // presenter mode: each message holds until the next one starts
function caption(t,list){list.forEach(([a,b,s],i)=>{let al;if(CAPHOLD){const na=i+1<list.length?list[i+1][0]:1e9;al=t<na?prog(t,a,a+.8):1-prog(t,na,na+.4);}else al=win(t,a,b,.8);if(al>0){const dy=(1-prog(t,a,a+.8))*10;text(s,800,118+dy,42,C.ink,600,'center',al);}});}
function backdrop(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle=C.grid;ctx.lineWidth=1;for(let x=0;x<=W;x+=50){ctx.beginPath();ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H);ctx.stroke();}for(let y=0;y<=H;y+=50){ctx.beginPath();ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5);ctx.stroke();}}
function agentGlyph(x,y,s,stroke,fill,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x-s,y-s,s*2,s*2,s*.45);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y-s*.5);ctx.lineTo(x+s*.16,y-s*.16);ctx.lineTo(x+s*.5,y);ctx.lineTo(x+s*.16,y+s*.16);ctx.lineTo(x,y+s*.5);ctx.lineTo(x-s*.16,y+s*.16);ctx.lineTo(x-s*.5,y);ctx.lineTo(x-s*.16,y-s*.16);ctx.closePath();ctx.fillStyle=stroke;ctx.fill();ctx.globalAlpha=1;}
// agent glyph with a person badge: an agent a user has connected from their own device
function userAgentGlyph(x,y,s,stroke,fill,alpha){agentGlyph(x,y,s,stroke,fill,alpha);if(alpha<=0)return;const bx=x+s*.85,by=y+s*.85,br=s*.55;
  circle(bx,by,br,C.ink,C.bg,3,alpha);ctx.globalAlpha=alpha;ctx.fillStyle=C.bg;ctx.beginPath();ctx.arc(bx,by-br*.25,br*.32,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(bx,by+br*.62,br*.55,Math.PI,0);ctx.fill();ctx.globalAlpha=1;}
function drawEdge(x1,y1,x2,y2,color,lw,alpha,progress=1,bend=0){
  if(alpha<=0||progress<=0)return;
  const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
  const cx=mx-dy/len*bend*len,cy=my+dx/len*bend*len;
  ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);
  const steps=28;for(let i=1;i<=Math.ceil(steps*progress);i++){const u=Math.min(1,i/steps,progress);const x=(1-u)*(1-u)*x1+2*(1-u)*u*cx+u*u*x2;const y=(1-u)*(1-u)*y1+2*(1-u)*u*cy+u*u*y2;ctx.lineTo(x,y);}
  ctx.stroke();ctx.globalAlpha=1;}

/* ---------------- Part one: Discover the agents ---------------- */
const F1={dur:46};
(function setup(){
  const TC=[700,480];F1.TC=TC;F1.TR=300;
  F1.core=[{n:'SharePoint',a:[560,380],g:[820,250]},{n:'OneDrive',a:[840,380],g:[820,420]},{n:'Exchange',a:[560,590],g:[820,590]},{n:'Teams',a:[840,590],g:[820,760]}];
  const angs=[-160,-112,-62,-38,-14,14,38,62,116,142];
  F1.small=angs.map((d,i)=>{const r=d*Math.PI/180;const x=TC[0]+Math.cos(r)*255,y=TC[1]+Math.sin(r)*255;let p=0,best=1e9;
    F1.core.forEach((c,ci)=>{const dd=Math.hypot(c.a[0]-x,c.a[1]-y);if(dd<best){best=dd;p=ci;}});return{p,a:[x,y],g:[1260,200+i*(600/9)]};});
  const gy=i=>210+i*110;
  F1.agents=[
    {n:'Copilot',a:[700,480],g:[360,gy(0)],in:6.2},
    {n:'HR Agent',a:[700,245],g:[360,gy(1)],in:12.0},
    {n:'Sales Research Agent',a:[455,485],g:[360,gy(2)],in:13.6},
    {n:'Customer Service Bot',a:[945,485],g:[360,gy(3)],in:15.2},
    {n:'SharePoint agent',a:[700,725],g:[360,gy(4)],in:16.8},
    {n:'Claude Desktop',s:[-140,250],a:[200,250],g:[360,gy(5)],in:22.4,ext:true}
  ];
  F1.agents.forEach(a=>a.g[0]=440);
  F1.users=[['All staff','1,240 users'],['HR team','14 users'],['Sales','86 users'],['Service desk','32 users'],['Operations','41 users'],['Individual user','1 user, own device']];
  F1.conn={a:[488,268],in:24.0};
  const E=[[0,'c',0],[0,'c',1],[0,'c',3],
    [1,'c',0],[1,'c',1],[1,'s',1],[1,'s',2],
    [2,'c',1],[2,'c',0],[2,'s',0],
    [3,'c',3],[3,'s',5],[3,'s',6],
    [4,'c',3],[4,'c',1],[4,'s',6],
    [5,'c',1],[5,'s',3],[5,'s',4],[5,'s',7]];
  const cnt={};F1.edges=E.map(([ai,k,j])=>{cnt[ai]=(cnt[ai]||0)+1;const base=ai===5?25.0:F1.agents[ai].in+1.0;return{ai,k,j,st:base+(cnt[ai]-1)*.45};});
  F1.claudeFiles={3:'scenic-view-of-mount-fuji.jpg',4:'G20 2024 Statements Summary',7:'vibrant-autumn-foliage.jpg'};
  F1.elements=['First Name','Last Name','Email Address','Date of Birth'];
  F1.rows=[
    {n:'Copilot',src:'Microsoft 365',a:6.6},
    {n:'HR Agent',src:'Copilot Studio',a:12.3},
    {n:'Sales Research Agent',src:'Dynamics 365',a:13.9},
    {n:'Customer Service Bot',src:'Copilot Studio',a:15.5},
    {n:'SharePoint agent',src:'SharePoint',a:17.1},
    {n:'Demo SP Agent',src:'SharePoint',a:18.0},
    {n:'Transcript Parser',src:'Copilot Studio',a:18.5},
    {n:'Email Validation Agent',src:'Dynamics 365',a:19.0},
    {n:'Outreach Agent',src:'Dynamics 365',a:19.4},
    {n:'2024 Folder Agent',src:'SharePoint',a:19.8},
    {n:'Summary Agent',src:'Dynamics 365',a:20.2},
    {n:'Configuration Agent',src:'Dynamics 365',a:20.6},
    {n:'M365 MCP Server for Claude',src:'External, connected by a user',a:25.2,ext:true}
  ];
})();

F1.render=function(t){
  backdrop();
  const TC=F1.TC,TR=F1.TR;
  const Rz=prog(t,29.5,33.5);    // resolve into the graph
  const Fo=prog(t,37.5,38.8);    // focus on the external agent
  const P=n=>[lerp(n.a[0],n.g[0],Rz),lerp(n.a[1],n.g[1],Rz)];
  const coreP=F1.core.map(P), smallP=F1.small.map(P);
  const agentP=F1.agents.map(a=>{let x=a.a[0],y=a.a[1];if(a.s){const e=prog(t,a.in,a.in+1.6);x=lerp(a.s[0],a.a[0],e);y=lerp(a.s[1],a.a[1],e);}return[lerp(x,a.g[0],Rz),lerp(y,a.g[1],Rz)];});
  const nodeIn=i=>prog(t,.6+i*.15,1.8+i*.15);
  const isClaudeFile=j=>F1.claudeFiles[j]!==undefined;

  // tenant boundary
  const tb=prog(t,.4,2)*(1-Rz);
  if(tb>0){ctx.save();ctx.setLineDash([6,10]);circle(TC[0],TC[1],TR,null,C.node,1.5,tb*.9);ctx.restore();
    text('Microsoft 365 tenant',TC[0],TC[1]+TR+34,20,C.muted,400,'center',tb);}

  // discovery sweep, continuous while new agents appear
  const sw=win(t,11.8,26.8,1)*(1-Rz);
  if(sw>0){const base=t*1.3;for(let k=0;k<14;k++){const a0=base-k*.045;ctx.globalAlpha=sw*.10*(1-k/14);ctx.fillStyle=C.green;ctx.beginPath();ctx.moveTo(TC[0],TC[1]);ctx.arc(TC[0],TC[1],TR,a0-.045,a0);ctx.closePath();ctx.fill();}ctx.globalAlpha=1;
    const lb='iResOps discovering agents';const lw=textW(lb,15,700)+44;ctx.globalAlpha=sw;rrect(TC[0]-lw/2,TC[1]-TR-15,lw,30,15);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;
    circle(TC[0]-lw/2+16,TC[1]-TR,5,'#04140A',null,0,sw*(.45+.55*Math.abs(Math.sin(t*3))));text(lb,TC[0]-lw/2+30,TC[1]-TR+5,15,'#04140A',700,'left',sw);}

  // core to content edges
  F1.small.forEach((s,j)=>{const c=coreP[s.p],p=smallP[j];const base=nodeIn(4+j)*.5;const hi=isClaudeFile(j);
    drawEdge(c[0],c[1],p[0],p[1],C.node,1.4,hi?base:base*(1-.75*Fo));});

  // agent edges
  F1.edges.forEach(e=>{const ag=F1.agents[e.ai];let a=agentP[e.ai];
    if(ag.ext){const cp=F1.conn.a;a=[lerp(cp[0],a[0],Rz),lerp(cp[1],a[1],Rz)];}
    const b=e.k==='c'?coreP[e.j]:smallP[e.j];const pr=clamp((t-e.st)/1.0,0,1);
    const isExt=!!ag.ext;const al=isExt?.85:.7*(1-.8*Fo);
    drawEdge(a[0],a[1],b[0],b[1],isExt&&Fo>0?C.amber:C.green,isExt&&Fo>0?2.8:1.8,al,ease(pr));});

  // external path: Claude Desktop to the connector on the tenant edge
  const ca=agentP[5];const cp=F1.conn.a;const connA=prog(t,F1.conn.in,F1.conn.in+.8)*(1-Rz);
  drawEdge(ca[0]+30,ca[1],cp[0],cp[1],C.amber,2.4,(1-Rz)*.9,ease(clamp((t-F1.conn.in)/1.0,0,1)));
  if(connA>0){ctx.globalAlpha=connA;rrect(cp[0]-14,cp[1]-14,28,28,6);ctx.fillStyle='#2A2310';ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=2.5;ctx.stroke();ctx.globalAlpha=1;
    text('M365 MCP Server',cp[0]-20,cp[1]-20,17,C.amber,600,'right',connA);}

  // content nodes
  F1.small.forEach((s,j)=>{const p=smallP[j];const al=nodeIn(4+j);const hi=isClaudeFile(j);
    circle(p[0],p[1],9,hi&&Fo>0?C.amber:C.nodeHi,null,0,al*(hi?1:1-.6*Fo));});

  // core nodes
  F1.core.forEach((c,i)=>{const p=coreP[i];const al=nodeIn(i);const keep=i===1?1:1-.5*Fo;
    circle(p[0],p[1],34,'#16303F',C.nodeHi,2.5,al*keep);text(c.n,p[0],p[1]+64,22,C.ink,600,'center',al*keep);});

  // agents
  F1.agents.forEach((a,i)=>{const p=agentP[i];const al=prog(t,a.in,a.in+.8);if(al<=0)return;
    const dim=a.ext?1:1-.6*Fo;
    if(!a.ext&&i>0){const pt=t-a.in;if(pt>0&&pt<1.6){circle(p[0],p[1],26+pt*45,null,C.green,2,(1-pt/1.6)*.8*(1-Rz));}}
    if(a.ext)userAgentGlyph(p[0],p[1],26,C.amber,'#2A2310',al);else agentGlyph(p[0],p[1],24,C.green,'#0E2A1C',al*dim);
    if(Rz<.5){const la=al*(1-prog(t,29.5,31));text(a.n,p[0],p[1]+56,20,C.ink,600,'center',la*dim);if(a.ext)text('Connected by a user',p[0],p[1]+80,16,C.muted,400,'center',la);}
    else{const la=al*prog(t,31.5,33.5);text(a.n,p[0],p[1]+50,17,C.ink,600,'center',la*dim);if(a.ext)text('External',p[0],p[1]+70,15,C.amber,600,'center',la);}
  });

  // users with access to each agent
  F1.users.forEach(([nm,ct],i)=>{const ag=agentP[i];const ua=prog(t,32.4+i*.25,33.2+i*.25)*prog(t,31,33);if(ua<=0)return;const isExt=i===5;const dim=isExt?1:1-.6*Fo;const y=F1.agents[i].g[1];
    const ex=clamp((t-32.6-i*.25)/.6,0,1);drawEdge(300,y,ag[0]-30,ag[1],isExt?C.amber:C.nodeHi,1.6,ua*.7*dim,ease(ex));
    circle(110,y,17,'#16303F',isExt?C.amber:C.nodeHi,1.8,ua*dim);ctx.globalAlpha=ua*dim;ctx.fillStyle=isExt?C.amber:C.nodeHi;ctx.beginPath();ctx.arc(110,y-4,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(110,y+10,8.5,Math.PI,0);ctx.fill();ctx.globalAlpha=1;
    text(nm,136,y-2,17,C.ink,600,'left',ua*dim);text(ct,136,y+17,14,isExt?C.amber:C.muted,400,'left',ua*dim);});

  // graph column headers
  const gh=prog(t,32,33.5)*(1-.4*Fo);
  if(gh>0){text('Users',150,176,19,C.muted,400,'center',gh);text('Agents',440,176,19,C.muted,400,'center',gh);text('Data sources',820,176,19,C.muted,400,'center',gh);text('Files',1260,176,19,C.muted,400,'center',gh);}

  // focus: what the external agent reached, and what is inside
  scanBeam(lerp(1235,1480,clamp((t-39.5)/1.5,0,1)),190,620,win(t,39.3,41.4,.3));
  if(Fo>0){let k=0;for(const j in F1.claudeFiles){const p=smallP[j];const la=prog(t,38.6+k*.6,39.6+k*.6);
      text(F1.claudeFiles[j],p[0]+24,p[1]+6,17,C.ink,600,'left',la);
      if(+j!==4)text('No sensitive data found',p[0]+24,p[1]+30,15,C.muted,400,'left',prog(t,41,42));
      k++;}
    const g=smallP[4];F1.elements.forEach((el,i)=>{const pa=prog(t,41+i*.45,41.8+i*.45);const col=i%2,row=Math.floor(i/2);
      pill(el,g[0]+24+col*150,g[1]+42+row*36,C.teal,'#04201F',pa,15);});text('iResOps found 4 data elements',g[0]+24,g[1]+112,15,C.green,600,'left',prog(t,43,43.6));}

  // agent inventory panel
  const pa=prog(t,6,7)*(1-prog(t,28.8,30.2));
  if(pa>0){
    ctx.globalAlpha=pa;rrect(1090,190,440,610,12);ctx.fillStyle=C.panel;ctx.fill();ctx.strokeStyle=C.panelLine;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;
    text('iResOps agent inventory',1115,232,20,C.ink,600,'left',pa);
    let count=0;F1.rows.forEach(r=>count+=prog(t,r.a,r.a+.5));count+=48*prog(t,18,21);
    text(String(Math.round(count)),1505,236,36,C.ink,700,'right',pa);
    ctx.save();ctx.beginPath();ctx.rect(1090,252,440,546);ctx.clip();
    F1.rows.forEach(r=>{const ap=prog(t,r.a,r.a+.6);if(ap<=0)return;let idx=0;F1.rows.forEach(s=>{if(s.a>r.a)idx+=prog(t,s.a,s.a+.6);});
      const y=290+idx*58;const al=ap*clamp(9.2-idx,0,1)*pa;if(al<=0)return;
      if(r.ext)userAgentGlyph(1128,y-6,13,C.amber,'#2A2310',al);else agentGlyph(1128,y-6,13,C.green,'#0E2A1C',al);
      text(r.n,1158,y-6,18,C.ink,600,'left',al);text(r.src,1158,y+16,15,r.ext?C.amber:C.muted,400,'left',al);
      const nw=win(t,r.a,r.a+2.4,.4);if(nw>0)pill('New',1452,y,C.green,'#04140A',nw*al,14);});
    ctx.restore();
  }

  caption(t,[[ .6,5.8,'Your Microsoft 365 tenant.'],[6.2,11.4,'Copilot is built in, connected to your Microsoft 365 data.'],[11.8,16.6,'Teams are rolling out agents for every kind of task.'],
    [17,21.8,'iResOps continuously scans for new agents.'],[22.2,29.2,'And agents are also connecting externally.'],
    [29.8,33.4,'Every agent, mapped to the data it reaches.'],[33.6,37.2,'And who has access to it.'],[37.8,46,"Which agents. Which data. What's inside it."]]);
};
F1.beats=[[0,'Copilot in your Microsoft 365 tenant'],[11.8,'Continuous agent discovery'],[22.2,'Claude Desktop connects externally'],[29.5,'Agents, data and access'],[37.5,'What the external agent reached']];

/* ---------------- Part two: When agents change data ---------------- */
const F2={dur:41};
const SLOW=1.5; // part two runs at two thirds of its original pace
(function setup(){
  const R=rng(42);
  F2.cols=28;F2.rows=12;F2.ts=30;F2.gap=8;F2.x0=440;F2.y0=240;
  F2.tiles=[];for(let i=0;i<F2.cols*F2.rows;i++){F2.tiles.push({r:.6+R()*.8,ph:R(),k:Math.floor(R()*3)});}
  const kinds=['access','modify','create','modify','delete','access','modify','create'];
  F2.single=kinds.map((k,i)=>({i:Math.floor(R()*F2.tiles.length),k,at:5.3+i*.42}));
  const pick=new Set();while(pick.size<40){pick.add(Math.floor(R()*F2.tiles.length));}
  F2.hit=[...pick].map((i,k)=>({i,k:k<23?'modify':'delete',at:14+k*(3.3/40),back:24.4+k*(2/40)}));
  F2.hitMap={};F2.hit.forEach(h=>F2.hitMap[h.i]=h);
  F2.dots=[];for(let i=0;i<200;i++){F2.dots.push({x:96+(i%20)*14,y:390+Math.floor(i/20)*22});}
  F2.rogue=117;
})();
function tilePos(i){const c=i%F2.cols,r=Math.floor(i/F2.cols);return[F2.x0+c*(F2.ts+F2.gap),F2.y0+r*(F2.ts+F2.gap)];}
const KCOL={access:C.access,create:C.create,modify:C.modify};

F2.scene=function(t){
  backdrop();
  // stat card
  const st=0;
  if(st>0){
    const g1=prog(t,.7,2.4),g2=prog(t,1.1,2.6);
    text('Using or piloting AI agents',300,340,30,C.ink,600,'left',st);
    ctx.globalAlpha=st;rrect(300,360,1000,44,8);ctx.fillStyle='#16303F';ctx.fill();rrect(300,360,Math.max(1,880*g1),44,8);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;
    text(Math.round(88*g1)+'%',1330,394,40,C.ink,700,'left',st);
    text('Truly AI-ready',300,500,30,C.ink,600,'left',st);
    ctx.globalAlpha=st;rrect(300,520,1000,44,8);ctx.fillStyle='#16303F';ctx.fill();rrect(300,520,Math.max(1,70*g2),44,8);ctx.fillStyle=C.nodeHi;ctx.fill();ctx.globalAlpha=1;
    text(Math.round(7*g2)+'%',1330,554,40,C.ink,700,'left',st);
    text('Share of organisations. Source: Veeam Data & AI Trust Gap report.',300,650,20,C.muted,400,'left',st);
  }

  const gIn=prog(t,4.5,5.3);
  const F=prog(t,8.6,10)*(1-prog(t,13.6,15));
  const D=prog(t,18.5,19.3)*(1-prog(t,26.4,27));
  if(gIn>0){
    const singleState={};F2.single.forEach(s=>{if(t>=s.at+.3)singleState[s.i]=s.k;});
    const singleFade=1-prog(t,8.6,9.4);
    for(let i=0;i<F2.tiles.length;i++){
      const [x,y]=tilePos(i);const tl=F2.tiles[i];const h=F2.hitMap[i];
      let fill='#1A3443',stroke=null,al=gIn,dash=false,fa=1;
      if(F>0){const u=tl.r*(t*1.4+4.5*prog(t,8.5,12.5)*(t-8.5));if(frac(u+tl.ph)<.14){fill=[C.access,C.modify,C.create][tl.k];fa=.55;}}
      if(singleState[i]&&singleFade>0){const k=singleState[i];if(k==='delete'){fill='#1A2630';stroke=C.red;dash=true;}else{fill=KCOL[k];fa=.8;}}
      if(h&&t>=h.at){
        if(t<h.back){if(h.k==='modify'){fill=C.modify;fa=1;}else{fill='#1A2630';stroke=C.red;dash=true;fa=1;}}
        else{fill=C.green;fa=1;}
      }
      if(!h)al*=1-.72*D;
      ctx.globalAlpha=al;rrect(x,y,F2.ts,F2.ts,5);ctx.fillStyle='#1A3443';ctx.fill();
      if(fill!=='#1A3443'){ctx.globalAlpha=al*fa;ctx.fillStyle=fill;ctx.fill();ctx.globalAlpha=al;}
      if(stroke){ctx.save();if(dash)ctx.setLineDash([4,4]);ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();ctx.restore();}
      if(h&&t>=h.back){const tp=clamp((t-h.back)/.35,0,1);const p0=[x+8,y+16],p1=[x+13,y+21],p2=[x+23,y+10];ctx.strokeStyle='#04140A';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(p0[0],p0[1]);
        if(tp<.4){const u=tp/.4;ctx.lineTo(lerp(p0[0],p1[0],u),lerp(p0[1],p1[1],u));}else{const u=(tp-.4)/.6;ctx.lineTo(p1[0],p1[1]);ctx.lineTo(lerp(p1[0],p2[0],u),lerp(p1[1],p2[1],u));}
        ctx.stroke();ctx.lineCap='butt';ctx.lineJoin='miter';}
      ctx.globalAlpha=1;
      if(h&&t>=h.at&&t<h.back&&D>0){ctx.globalAlpha=D*(.55+.45*Math.sin(t*4+h.i));rrect(x-4,y-4,F2.ts+8,F2.ts+8,7);ctx.strokeStyle=C.red;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;}
    }
    text('Files across OneDrive and Teams',F2.x0,F2.y0-22,19,C.muted,400,'left',gIn*(1-prog(t,18.5,19)));
    // legend, matching the activity colours in the product
    let lx=F2.x0+28*38-8;[['Delete',C.red],['Modify',C.modify],['Create',C.create],['Access',C.access]].forEach(([n,c])=>{const w=textW(n,17);lx-=w;text(n,lx,F2.y0-22,17,C.muted,400,'left',gIn);lx-=22;ctx.globalAlpha=gIn;ctx.fillStyle=c;ctx.fillRect(lx,F2.y0-30,14,4);ctx.globalAlpha=1;lx-=20;});
  }

  const sa=win(t,4.6,9.2);
  if(sa>0){agentGlyph(230,460,30,C.green,'#0E2A1C',sa);text('Agent',230,525,22,C.ink,600,'center',sa);
    F2.single.forEach(s=>{const a=win(t,s.at,s.at+.6,.15);if(a>0){const [x,y]=tilePos(s.i);drawEdge(262,460,x+15,y+15,KCOL[s.k]||C.red,2,a*sa,1);}});}

  const sw=prog(t,8.6,9.3);
  if(sw>0){
    const cp=prog(t,8.8,12.6);const n=Math.max(1,Math.round(lerp(1,200,cp*cp)));
    const dimSw=(1-.75*prog(t,13.5,14.2))*(1-prog(t,21.6,22.4));
    text(String(n),90,340,96,C.ink,700,'left',sw*dimSw);
    const nw=textW(String(n),96,700);
    text(n===1?'agent':'agents',90+nw+14,340,32,C.muted,400,'left',sw*dimSw);
    F2.dots.forEach((d,i)=>{if(i<n&&!(i===F2.rogue&&t>14.3)){const isR=i===F2.rogue&&t>13.5;circle(d.x,d.y,5,isR?C.red:C.green,null,0,sw*(isR?1:dimSw));}});
    if(F>0){const R=rng(Math.floor(t*8));for(let k=0;k<Math.min(n,40);k++){const di=Math.floor(R()*n);const ti=Math.floor(R()*F2.tiles.length);const [x,y]=tilePos(ti);const d=F2.dots[di];drawEdge(d.x,d.y,x+15,y+15,C.green,1,F*.16*dimSw,1);}}
  }

  const rg=prog(t,13.5,14.3);
  if(rg>0){
    const d=F2.dots[F2.rogue];const rx=lerp(d.x,230,rg),ry=lerp(d.y,710,rg),rs=lerp(5,28,rg);
    F2.hit.forEach(h=>{if(t>=h.at){const [x,y]=tilePos(h.i);const pr=clamp((t-h.at)/.35,0,1);const al=(1-clamp((t-h.back)/.4,0,1))*(t>18.5?.5:.8);drawEdge(rx+rs,ry,x+15,y+15,C.red,1.6,al*rg,pr);}});
    ctx.globalAlpha=rg;rrect(rx-rs,ry-rs,rs*2,rs*2,rs*.45);ctx.fillStyle='#3A1214';ctx.fill();ctx.strokeStyle=C.red;ctx.lineWidth=2.5;ctx.stroke();ctx.globalAlpha=1;
    text('Agent 118',rx,ry+rs+30,22,C.ink,600,'center',prog(t,13.9,14.5));
  }

  const ro=prog(t,18.6,19.4);
  if(ro>0){const mod=F2.hit.filter(h=>h.k==='modify').length,del=F2.hit.length-mod;
    const left=F2.hit.filter(h=>t<h.back).length;
    const s=t<24.4?`Changed by Agent 118: ${mod} modified, ${del} deleted`:(left>0?`Restoring ${F2.hit.length-left} of ${F2.hit.length} files`:`Restored ${F2.hit.length} of ${F2.hit.length} files. Nothing else touched.`);
    text(s,F2.x0,F2.y0-22,20,t<24.4?C.ink:C.green,600,'left',ro);}

  // offsite, independent backup that Undo AI restores from
  const bk=prog(t,22,23);
  if(bk>0){const bx=230,by=440;
    F2.hit.forEach(h=>{const a=clamp((t-h.back+.35)/.35,0,1)*(1-clamp((t-h.back-.6)/.7,0,1));if(a>0){const [x,y]=tilePos(h.i);drawEdge(bx+44,by,x+15,y+15,C.green,1.8,a*.9,clamp((t-h.back+.35)/.35,0,1),.08);}});
    ctx.globalAlpha=bk;rrect(bx-40,by-40,80,80,14);ctx.fillStyle='#0E2A1C';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle=C.green;for(let k=0;k<3;k++){rrect(bx-22,by-22+k*16,44,10,5);ctx.fill();}ctx.globalAlpha=1;
    text('Veeam Backup for Microsoft 365',bx,by+72,18,C.ink,600,'center',bk);
    text('Offsite, independent of the tenant',bx,by+96,15,C.muted,400,'center',bk);}

  const ub=prog(t,22.5,23.2);
  if(ub>0){
    const press=t>=24&&t<24.3?.94:1;const bw=230*press,bh=64*press,bx=968-bw/2,by=760-bh/2;
    ctx.globalAlpha=ub;rrect(bx,by,bw,bh,10);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;
    text('Undo AI',968,770,26,'#04140A',700,'center',ub);
    const cm=prog(t,23.2,24);const cx=lerp(1300,990,cm),cy=lerp(880,772,cm);const ca=ub*(1-prog(t,25,25.6));
    if(ca>0){ctx.globalAlpha=ca;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy+30);ctx.lineTo(cx+8,cy+23);ctx.lineTo(cx+14,cy+36);ctx.lineTo(cx+19,cy+34);ctx.lineTo(cx+13,cy+21);ctx.lineTo(cx+23,cy+21);ctx.closePath();ctx.fillStyle='#FFFFFF';ctx.fill();ctx.strokeStyle='#0A1B26';ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;
      if(t>=24&&t<24.6){circle(cx,cy,10+(t-24)*60,null,'#FFFFFF',2,(1-(t-24)/.6)*ca);}}
  }
};
F2.render=function(rt){
  const t=Math.min(rt/SLOW+4.2,31.3);
  F2.scene(t);
  caption(rt+4.2*SLOW,[[4.6*SLOW,8.5*SLOW,'One agent. One file at a time.'],[8.7*SLOW,13.4*SLOW,'Machine speed. Millions of items.'],[13.7*SLOW,18.4*SLOW,'Compromised account. Same access.'],
    [18.7*SLOW,22.4*SLOW,'Exactly what changed.'],[22.7*SLOW,26.7*SLOW,'Undo AI. Only those files.'],[26.9*SLOW,47,'One click, from an independent copy, with an audit trail.']]);
};
F2.beats=[[4.2*SLOW,'One agent at work'],[8.6*SLOW,'Scale to 200 agents'],[13.5*SLOW,'Compromised agent'],[18.5*SLOW,'Isolate what changed'],[22.5*SLOW,'Undo AI'],[24.2*SLOW,'Restore from backup'],[26.9*SLOW,'One click, audit trail']].map(([a,b])=>[Math.round((a-4.2*SLOW)*10)/10,b]);

/* ---------------- Part three: Trusted context ---------------- */
const F3={dur:58};
function wrapText(s,x,y,maxW,size,weight,color,alpha,lh){ctx.font=`${weight} ${size}px ${FONT}`;const words=s.split(' ');let line='',yy=y;
  for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){text(line,x,yy,size,color,weight,'left',alpha);ctx.font=`${weight} ${size}px ${FONT}`;line=w;yy+=lh;}else line=test;}
  if(line)text(line,x,yy,size,color,weight,'left',alpha);return yy;}
function docCard(x,y,w,h,title,alpha,o={}){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x,y,w,h,8);ctx.fillStyle=o.fill||'#132C3A';ctx.fill();
  if(o.band){ctx.save();rrect(x,y,w,h,8);ctx.clip();ctx.fillStyle=o.band;ctx.fillRect(x,y,w,7);ctx.restore();}
  ctx.strokeStyle=o.stroke||'#24414F';ctx.lineWidth=o.lw||1.5;rrect(x,y,w,h,8);ctx.stroke();
  ctx.fillStyle='rgba(185,200,210,.25)';const n=o.band?1:(o.small?2:3);for(let k=0;k<n;k++){ctx.fillRect(x+10,y+(o.small?16:18)+k*9,(w-20)*(k===n-1?.55:1),3);}
  ctx.globalAlpha=1;
  if(title&&(o.ta===undefined||o.ta>0))wrapText(title,x+10,y+(o.small?50:58),w-18,o.small?11:13,600,C.ink,alpha*(o.ta===undefined?1:o.ta),o.small?13:16);}
function qBubble(q,alpha,hdr='A colleague asks',bad=false){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(1060,226,480,78,14);ctx.fillStyle=bad?'#3A1214':'#16303F';ctx.fill();ctx.globalAlpha=1;
  text(hdr,1082,252,14,bad?C.red:C.muted,bad?600:400,'left',alpha);text(q,1082,284,20,C.ink,600,'left',alpha);}
function aBubble(ans,note,good,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(1060,532,480,168,14);ctx.fillStyle=C.panel;ctx.fill();ctx.strokeStyle=good?C.green:C.red;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
  text('Copilot agent answers',1082,560,14,C.muted,400,'left',alpha);wrapText(ans,1082,592,436,20,400,C.ink,alpha,27);text(note,1082,680,16,good?C.green:C.red,600,'left',alpha);}
function blockX(x,y,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle=C.red;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-7,y-7);ctx.lineTo(x+7,y+7);ctx.moveTo(x+7,y-7);ctx.lineTo(x-7,y+7);ctx.stroke();ctx.globalAlpha=1;}
const ROTCOL={Obsolete:C.amber,Redundant:C.create,Trivial:C.nodeHi};
function scanBeam(bx,top,h,alpha){if(alpha<=0)return;const g=ctx.createLinearGradient(bx-170,0,bx,0);g.addColorStop(0,'rgba(0,179,54,0)');g.addColorStop(1,'rgba(0,179,54,0.24)');
  ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(bx-170,top,170,h);ctx.fillStyle='rgba(0,179,54,0.35)';ctx.fillRect(bx-6,top,12,h);ctx.fillStyle='#7CF0A0';ctx.fillRect(bx-1.5,top,3,h);ctx.globalAlpha=1;
  const lbl='iResOps scanning';const w=textW(lbl,15,700)+44;ctx.globalAlpha=alpha;rrect(bx-w/2,top-36,w,30,15);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;
  circle(bx-w/2+16,top-21,5,'#04140A',null,0,alpha*(.45+.55*Math.abs(Math.sin(bx/18))));circle(bx-w/2+16,top-21,9,null,'#04140A',1.5,alpha*.5);
  text(lbl,bx-w/2+30,top-16,15,'#04140A',700,'left',alpha);}

(function setup(){
  F3.lib=[['Travel Policy 2025',null],['Travel Policy 2023','Obsolete'],['Copy of Travel Policy FINAL (1)','Redundant'],['BYOD Scheme 2019','Obsolete'],['Leeds Office Parking','Obsolete'],
    ['Travelcorp Contacts','Obsolete'],['Expenses Policy 2025',null],['Expenses draft v3','Trivial'],['Hotel Caps 2022','Obsolete'],['Onboarding Guide',null],
    ['Meeting notes 12 Mar','Trivial'],['IT Service Portal guide',null],['Hotel Caps FINAL copy','Redundant'],['Code of Conduct',null],['Travel FAQ',null],
    ['Org chart 2021','Obsolete'],['Leave Policy',null],['Leave Policy (1)','Redundant'],['Voyager booking guide',null],['Lunch roster','Trivial']];
  F3.rot=F3.lib.map((d,i)=>d[1]?i:-1).filter(i=>i>=0);
  F3.touched=[0,1,2,8,12];
  F3.site=[];for(let i=0;i<38;i++)F3.site.push({title:null,label:null});
  const keys={3:'Project Atlas proposal',10:'Churn risk accounts',17:'Meridian rate card',22:'Rebate calculation',28:'Ops roles review',33:'Restructure timeline'};
  for(const k in keys)F3.site[k].title=keys[k];
  [3,28,33,12,25,36,7].forEach(i=>F3.site[i].label='Restricted');
  [10,17,22,1,5,14,19,20,30,31,35].forEach(i=>F3.site[i].label='Confidential');
  F3.askB=[3,28,33,10,17,0,9,15,24,27,6,21];
  F3.rogueB=[3,28,33,12,25,10,17,0,9,15,24,27];
})();
const libPos=i=>[140+(i%5)*166,220+Math.floor(i/5)*112,150,96];
const sitePos=i=>[140+(i%8)*102,230+Math.floor(i/8)*80,92,70];
const AG=[1300,440];

function sceneA(t){
  const fa=1-prog(t,25,25.8);if(fa<=0)return;
  const mv=prog(t,16.2,18.4);
  const tr=prog(t,16,16.8)*fa;
  if(tr>0){text("Remediated out of the agent's reach",140,738,16,C.muted,400,'left',tr);ctx.save();ctx.setLineDash([5,7]);ctx.globalAlpha=tr;rrect(126,748,830,66,10);ctx.strokeStyle=C.node;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();ctx.globalAlpha=1;}
  const barX=lerp(110,990,clamp((t-10.6)/3,0,1));
  // agent lines, before
  const l1=win(t,5.4,10.6,.5)*fa;
  const l2=win(t,20.8,25.6,.5)*fa;
  const linesA=()=>{
  F3.touched.forEach((i,k)=>{const [x,y,w,h]=libPos(i);const pr=clamp((t-5.6-k*.3)/.7,0,1);drawEdge(AG[0]-32,AG[1],x+w/2,y+h/2,C.green,2,l1*.9,ease(pr),.06);if(pr>=1)circle(x+w/2,y+h/2,4,C.green,null,0,l1);});
  // agent line, after
  {const [x,y,w,h]=libPos(0);const pr=clamp((t-21)/.8,0,1);drawEdge(AG[0]-32,AG[1],x+w/2,y+h/2,C.green,2.8,l2,ease(pr),.06);if(pr>=1)circle(x+w/2,y+h/2,5,C.green,null,0,l2);}};
  F3.lib.forEach((d,i)=>{let [x,y,w,h]=libPos(i);const ap=prog(t,.4+i*.06,1.2+i*.06)*fa;const ri=F3.rot.indexOf(i);
    let o={};
    if(ri>=0&&mv>0){x=lerp(x,140+ri*68,mv);y=lerp(y,756,mv);w=lerp(w,60,mv);h=lerp(h,46,mv);}
    if(ri>=0)o.ta=1-mv;
    if(ri>=0&&mv>=1){o.small=true;}
    const touchedNow=l1>0&&F3.touched.includes(i);
    if(touchedNow){o.stroke=C.green;o.lw=2;}
    if(i===1&&t>7.4&&t<10.6){o.stroke=C.red;o.lw=3;}
    if(i===0&&t>21.8){o.stroke=C.green;o.lw=3;}
    {const [ox,,ow]=libPos(i);const fl=(t>10.4&&t<14.1&&mv===0)?1-clamp(Math.abs(barX-(ox+ow/2))/60,0,1):0;if(fl>0){o.stroke=C.green;o.lw=1.5+2*fl;if(fl>.3)o.fill='#17402F';}}
    const al=ap*(ri>=0?lerp(1,.55,mv):1);
    docCard(x,y,w,h,mv>.5&&ri>=0?null:d[0],al,o);
    if(ri>=0){const pa=clamp((barX-(x+w/2))/40,0,1)*(t>10.6?1:0)*(1-mv)*fa;if(pa>0)pill(d[1],x+8,y+32,ROTCOL[d[1]],'#0A1B26',pa,13);}
  });
  linesA();
  scanBeam(barX,206,456,win(t,10.4,14.1,.3)*fa);
  {const n=F3.rot.filter(i=>{const [x,,w]=libPos(i);return barX>x+w/2+40&&t>10.6;}).length;text(`iResOps flagged ${n} of 20 files as ROT`,140,694,18,C.green,600,'left',prog(t,10.6,11.2)*(1-prog(t,19.6,20.4))*fa);}
  qBubble('What is the hotel cap in London?',prog(t,4.4,5)*fa);
  aBubble('You can spend up to £150 per night.','Cited a 2023 policy. The current cap is £180.',false,win(t,8,10.6,.5)*fa);
  aBubble('£180 per night in London, £130 elsewhere.','One document cited.',true,prog(t,22,22.6)*fa);
  agentGlyph(AG[0],AG[1],28,C.green,'#0E2A1C',prog(t,1.4,2.2)*fa);text('Copilot agent',AG[0],AG[1]+60,20,C.ink,600,'center',prog(t,1.4,2.2)*fa);
  caption(t,[[.5,5,'Agents answer from whatever they can find.'],[5.2,10.2,'Old and duplicate files give wrong answers.'],[10.6,15.8,'iResOps finds redundant, obsolete and trivial content.'],
    [16,20.4,"Remediated out of the agent's reach."],[20.6,25.6,'One current version. One right answer.']]);
}

function sceneB(u){
  if(u<0)return;
  const fi=prog(u,0,.8);
  const barX=lerp(110,980,clamp((u-11.2)/3,0,1));
  const sh=prog(u,16.5,17.5);
  const SX=1018;
  const lineTo=(i,col,lw,al,pr,blocked,from)=>{const [x,y,w,h]=sitePos(i);const cx=x+w/2,cy=y+h/2;const f=from||[AG[0]-32,AG[1]];
    if(blocked){const k=(f[0]-SX)/(f[0]-cx);const ex=lerp(f[0],cx,k),ey=lerp(f[1],cy,k);drawEdge(f[0],f[1],ex,ey,col,lw,al,pr);if(pr>=1)blockX(ex-18,ey,al);}
    else drawEdge(f[0],f[1],cx,cy,col,lw,al,pr);};
  // before: agent reaches everything
  const l1=win(u,5.4,11.2,.5);
  const l2=win(u,18.4,24.6,.5);
  const rg=prog(u,24.6,25.4);
  const linesB=()=>{
  F3.askB.forEach((i,k)=>lineTo(i,C.green,1.8,l1*.85,ease(clamp((u-5.6-k*.12)/.7,0,1)),false));
  // after: labelled content blocked by DLP
  F3.askB.forEach((i,k)=>{const lab=F3.site[i].label;lineTo(i,lab?C.red:C.green,1.8,l2*.9,ease(clamp((u-18.6-k*.12)/.7,0,1)),!!lab);});
  // compromised agent
  if(rg>0){F3.rogueB.forEach((i,k)=>{const lab=F3.site[i].label;lineTo(i,lab?C.red:C.green,1.8,rg*.9,ease(clamp((u-25.8-k*.15)/.7,0,1)),!!lab);});}};
  let labelled=0;
  F3.site.forEach((d,i)=>{const [x,y,w,h]=sitePos(i);const ap=prog(u,.2+i*.03,.9+i*.03);const o={small:true};
    const lp=d.label?clamp((barX-(x+w/2))/30,0,1)*(u>11.2?1:0):0;if(lp>=1)labelled++;
    if(lp>0)o.band=d.label==='Restricted'?C.red:C.amber;
    if(l1>0&&F3.askB.includes(i)){o.stroke=C.green;o.lw=2;}
    if(l1>0&&(i===3||i===28||i===33)&&u>7.4){o.stroke=C.red;o.lw=3;}
    {const fl=(u>11&&u<14.6)?1-clamp(Math.abs(barX-(x+w/2))/50,0,1):0;if(fl>0){o.stroke=C.green;o.lw=1.5+2*fl;if(fl>.3)o.fill='#17402F';}}
    docCard(x,y,w,h,d.title,ap,o);
    if(lp>0)text(d.label,x+10,y+36,11,d.label==='Restricted'?C.red:C.amber,600,'left',lp*ap);});
  const lc=prog(u,11.2,11.8);if(lc>0)text(`iResOps applied ${labelled} sensitivity labels`,140,662,18,C.green,600,'left',lc);
  scanBeam(barX,216,410,win(u,11,14.5,.3));
  // DLP barrier
  if(sh>0){ctx.globalAlpha=sh;rrect(SX-8,222,16,560,8);ctx.fillStyle='#2A2310';ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
    text('Purview DLP',SX,208,17,C.amber,600,'center',sh);text('Confidential and Restricted',SX+10,808,14,C.muted,400,'right',sh);text('excluded from grounding',SX+10,828,14,C.muted,400,'right',sh);}
  linesB();
  qBubble('Are any Operations roles being held or cut?',prog(u,4.4,5)*(1-prog(u,24.2,24.8)));qBubble('Find everything on the restructure.',prog(u,24.8,25.4),'A compromised agent asks',true);
  aBubble('Yes. 12 roles are to be removed, with notice issued on 18 May 2026.','An unannounced restructure, disclosed.',false,win(u,7.8,11.2,.5));
  aBubble("I can't find any document stating Operations roles are being held or cut.",'Restricted content blocked. Routed to the People Team.',true,prog(u,20.6,21.2)*(1-prog(u,24.4,25)));
  aBubble('Project Atlas proposal exists, but its content is not available to me.','Labelled content stays blocked for any agent.',true,prog(u,27.6,28.2));
  agentGlyph(AG[0],AG[1],28,C.green,'#0E2A1C',fi*(1-rg));agentGlyph(AG[0],AG[1],28,C.red,'#3A1214',rg);text('Copilot agent',AG[0],AG[1]+60,20,C.ink,600,'center',fi*(1-rg));text('Compromised agent',AG[0],AG[1]+60,20,C.red,600,'center',rg);
  caption(u,[[.4,5,'Permissions drift. Sensitive files pile up.'],[5.2,10.8,'Agents can surface what nobody announced.'],[11.2,16.2,'iResOps classifies and labels sensitive data at scale.'],
    [16.6,24.4,'Purview DLP keeps labelled content out of grounding.'],[24.8,32,"Even a compromised agent can't pull restricted content."]]);
}
F3.render=function(t){backdrop();sceneA(t);sceneB(t-26);};
F3.beats=[[0,'Context library'],[5.2,'Wrong answer from old files'],[10.6,'Find ROT'],[16,'Remediate ROT'],[20.6,'One right answer'],[25,'Ops team site'],[31.2,'Sensitive disclosure'],[37.2,'Classify and label'],[42.6,'Purview DLP blocks'],[50.8,'Compromised agent blocked']];

/* ---------------- Summary: loops as an outro ---------------- */
const F4={dur:8};
(function(){const R=rng(9);F4.tiles=[];for(let i=0;i<32;i++)F4.tiles.push({on:R()<.45,ph:R()*6});
  F4.dots=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2+R()*.5,r=38+R()*48;F4.dots.push({a,r,ext:i===4});}})();
function vizAgents(cx,cy,t,ap){const R0=95;circle(cx,cy,R0,null,C.node,1.2,ap*.6);circle(cx,cy,R0*.55,null,C.node,1,ap*.3);
  const a=t*1.1;for(let k=0;k<16;k++){const a0=a-k*.04;ctx.globalAlpha=ap*.12*(1-k/16);ctx.fillStyle=C.green;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R0,a0-.04,a0);ctx.closePath();ctx.fill();}ctx.globalAlpha=1;
  F4.dots.forEach(d=>{const x=cx+Math.cos(d.a)*d.r,y=cy+Math.sin(d.a)*d.r;const diff=((a-d.a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);const ping=diff<1.2?1-diff/1.2:0;
    const col=d.ext?C.amber:C.green;if(ping>0)circle(x,y,10+(1-ping)*16,null,col,1.5,ap*ping);
    if(d.ext)userAgentGlyph(x,y,10,col,'#2A2310',ap);else agentGlyph(x,y,10,col,'#0E2A1C',ap);});
  circle(cx,cy,5,C.green,null,0,ap);}
function vizUndo(cx,cy,t,ap){const cols=8,rows=4,s=30,g=8,x0=cx-(cols*(s+g)-g)/2,y0=cy-(rows*(s+g)-g)/2;
  F4.tiles.forEach((tl,i)=>{const x=x0+(i%cols)*(s+g),y=y0+Math.floor(i/cols)*(s+g);ctx.globalAlpha=ap;rrect(x,y,s,s,5);ctx.fillStyle='#1A3443';ctx.fill();
    if(tl.on){const c=(t+tl.ph)%6;
      if(c<1.4){ctx.fillStyle=C.modify;ctx.globalAlpha=ap*prog(c,0,.3);ctx.fill();}
      else if(c<3){const fa=1-prog(c,2.6,3);ctx.fillStyle=C.green;ctx.globalAlpha=ap*fa;ctx.fill();const tp=clamp((c-1.4)/.35,0,1);
        ctx.strokeStyle='#04140A';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+8,y+16);ctx.lineTo(x+13,y+21);if(tp>.4)ctx.lineTo(x+13+(tp-.4)/.6*10,y+21-(tp-.4)/.6*11);ctx.stroke();ctx.lineCap='butt';}}
    ctx.globalAlpha=1;});}
function scanBeamMini(bx,top,h,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;const g=ctx.createLinearGradient(bx-60,0,bx,0);g.addColorStop(0,'rgba(0,179,54,0)');g.addColorStop(1,'rgba(0,179,54,.25)');ctx.fillStyle=g;ctx.fillRect(bx-60,top,60,h);ctx.fillStyle='#7CF0A0';ctx.fillRect(bx-1,top,2,h);ctx.globalAlpha=1;}
function vizContext(cx,cy,t,ap){const w=82,h=58,g=14,x0=cx-(3*w+2*g)/2,y0=cy-(2*h+g)/2;const c=t%6;const bx=x0-20+clamp((c-.5)/2.4,0,1)*(3*w+2*g+40);
  const kinds=[null,'Confidential','ROT',null,'Restricted',null];const fade=1-prog(c,5,5.6);
  kinds.forEach((k,i)=>{const x=x0+(i%3)*(w+g),y=y0+Math.floor(i/3)*(h+g);const passed=bx>x+w/2&&c>.5?1:0;const o={small:true};let al=ap;
    if(k==='ROT'&&passed)al=ap*lerp(1,.35,fade);
    if(k&&k!=='ROT'&&passed&&fade>.5)o.band=k==='Restricted'?C.red:C.amber;
    docCard(x,y,w,h,null,al,o);
    if(k&&passed)text(k==='ROT'?'Remediated':k,x+10,y+h-10,11,k==='Restricted'?C.red:k==='ROT'?C.muted:C.amber,600,'left',ap*fade);});
  scanBeamMini(bx,y0-8,2*h+g+16,ap*win(c,.3,3.2,.3));}
F4.render=function(t){backdrop();
  const cards=[{x:130,title:'See every agent',lines:['Copilot, custom and external agents','Who has access to each one','What data each one reaches']},
    {x:590,title:'Undo what agents change',lines:['Every create, modify and delete','Undo AI restores only what changed','From an independent backup']},
    {x:1050,title:'Trust the context',lines:['ROT remediated out of reach','Sensitive data labelled at scale','Purview DLP enforced on agents']}];
  cards.forEach((c,k)=>{const ap=prog(t,.6+k*.5,1.4+k*.5);if(ap<=0)return;const dy=(1-ap)*16;const x=c.x,y=196+dy,w=420,h=448;const cx=x+w/2;
    ctx.globalAlpha=ap;rrect(x,y,w,h,16);ctx.fillStyle=C.panel;ctx.fill();ctx.strokeStyle=C.panelLine;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;
    ctx.save();rrect(x+20,y+20,w-40,220,12);ctx.clip();ctx.globalAlpha=ap;ctx.fillStyle='#0C2130';ctx.fillRect(x+20,y+20,w-40,220);ctx.globalAlpha=1;
    if(k===0)vizAgents(cx,y+130,t,ap);else if(k===1)vizUndo(cx,y+130,t,ap);else vizContext(cx,y+130,t,ap);
    ctx.restore();
    text(c.title,x+28,y+290,26,C.ink,700,'left',ap);
    c.lines.forEach((l,i)=>{const ly=y+334+i*34;ctx.globalAlpha=ap;ctx.strokeStyle=C.green;ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+30,ly-6);ctx.lineTo(x+35,ly-1);ctx.lineTo(x+44,ly-12);ctx.stroke();ctx.lineCap='butt';ctx.globalAlpha=1;
      text(l,x+56,ly,17,C.muted,400,'left',ap);});});
  const fb=prog(t,2.2,3);
  if(fb>0){const x=130,y=672,w=1340,h=84;
    cards.forEach(c=>{const cx=c.x+210;ctx.globalAlpha=fb;ctx.fillStyle=C.green;ctx.fillRect(cx-1.5,644,3,28);ctx.globalAlpha=1;circle(cx,672-frac(t*.8+c.x/400)*28,4,C.green,null,0,fb);});
    ctx.globalAlpha=fb;rrect(x,y,w,h,14);ctx.fillStyle='#0E2A1C';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.stroke();
    ctx.save();rrect(x,y,w,h,14);ctx.clip();const sx=x-300+frac(t/5)*(w+600);const gr=ctx.createLinearGradient(sx-220,0,sx+220,0);gr.addColorStop(0,'rgba(0,179,54,0)');gr.addColorStop(.5,'rgba(0,179,54,.22)');gr.addColorStop(1,'rgba(0,179,54,0)');ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);ctx.restore();ctx.globalAlpha=1;
    text('Veeam Intelligent ResOps for Microsoft 365',800,y+53,30,C.ink,700,'center',fb);}
  caption(t,[[.3,1e9,'Safe AI agents need all three.']]);
};
const G=['Part one: Discover the agents','Part two: When agents change data','Part three: Trusted context','Summary'];
const O2=F1.dur+F2.dur,O3=O2+F3.dur;
const FULL={dur:O3+F4.dur,render(t){if(t<F1.dur)F1.render(t);else if(t<O2)F2.render(t-F1.dur);else if(t<O3)F3.render(t-O2);else F4.render(t-O3);},
  beats:[...F1.beats.map(([a,b])=>[a,b,0]),...F2.beats.map(([a,b])=>[a+F1.dur,b,1]),...F3.beats.map(([a,b])=>[a+F1.dur+F2.dur,b,2]),[O3,'Safe AI agents need all three',3]]};

return {
  width: W,
  height: H,
  duration: FULL.dur,
  groups: G,
  beats: FULL.beats,
  render(t, { holdCaptions = false } = {}) { CAPHOLD = holdCaptions; FULL.render(t); },
};
}
