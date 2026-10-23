// @ts-nocheck
// Film for the "scanning and classification" explainer (Veeam Intelligent ResOps for Microsoft 365).
// Pure canvas drawing: createFilm(ctx) returns the timeline the Explainer player drives.
// Drawn on a fixed 1600x900 stage; the player scales the context to the canvas size.
// Northwind Group is fictional. People, numbers and file counts are illustrative, generated from a fixed seed.

export default function createFilm(ctx) {
const W=1600,H=900;
const C={bg:'#0A1B26',grid:'rgba(143,163,179,0.07)',ink:'#E8EEF2',muted:'#8FA3B3',node:'#5F7687',nodeHi:'#B9C8D2',
  green:'#00B336',red:'#FF4D4F',amber:'#F2B23A',purple:'#8E7CE8',teal:'#2BB5B0',panel:'#10283A',panelLine:'#24414F',
  tile:'#1A3443',active:'#2F5568'};
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
function shieldGlyph(x,y,s,stroke,fill,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x+s*.85,y-s*.62);ctx.lineTo(x+s*.85,y+s*.05);
  ctx.quadraticCurveTo(x+s*.8,y+s*.72,x,y+s);ctx.quadraticCurveTo(x-s*.8,y+s*.72,x-s*.85,y+s*.05);ctx.lineTo(x-s*.85,y-s*.62);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();ctx.globalAlpha=1;
  check(x-s*.38,y+s*.02,s*.95,stroke,alpha);}
function drawEdge(x1,y1,x2,y2,color,lw,alpha,progress=1,bend=0){
  if(alpha<=0||progress<=0)return;
  const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
  const cx=mx-dy/len*bend*len,cy=my+dx/len*bend*len;
  ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);
  const steps=28;for(let i=1;i<=Math.ceil(steps*progress);i++){const u=Math.min(1,i/steps,progress);const x=(1-u)*(1-u)*x1+2*(1-u)*u*cx+u*u*x2;const y=(1-u)*(1-u)*y1+2*(1-u)*u*cy+u*u*y2;ctx.lineTo(x,y);}
  ctx.stroke();ctx.globalAlpha=1;}
function arrowHead(x,y,dir,color,alpha){if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(dir);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-11,-6);ctx.lineTo(-11,6);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.restore();}
function arrow(x1,y1,x2,y2,color,alpha,p=1){if(alpha<=0||p<=0)return;const x=lerp(x1,x2,p),y=lerp(y1,y2,p);drawEdge(x1,y1,x,y,color,2,alpha);if(p>=1)arrowHead(x2,y2,Math.atan2(y2-y1,x2-x1),color,alpha);}
function blockX(x,y,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle=C.red;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(x-9,y-9);ctx.lineTo(x+9,y+9);ctx.moveTo(x+9,y-9);ctx.lineTo(x-9,y+9);ctx.stroke();ctx.globalAlpha=1;}
function check(x,y,s,col,alpha,p=1){if(alpha<=0||p<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x,y);
  if(p<.4){const u=p/.4;ctx.lineTo(x+s*.35*u,y+s*.35*u);}else{const u=(p-.4)/.6;ctx.lineTo(x+s*.35,y+s*.35);ctx.lineTo(x+s*.35+s*.65*u,y+s*.35-s*.8*u);}
  ctx.stroke();ctx.lineCap='butt';ctx.lineJoin='miter';ctx.globalAlpha=1;}
function docCard(x,y,w,h,title,alpha,o={}){if(alpha<=0)return;ctx.globalAlpha=alpha;rrect(x,y,w,h,8);ctx.fillStyle=o.fill||'#132C3A';ctx.fill();
  ctx.strokeStyle=o.stroke||'#24414F';ctx.lineWidth=o.lw||1.5;ctx.stroke();
  ctx.fillStyle='rgba(185,200,210,.25)';for(let k=0;k<3;k++){ctx.fillRect(x+12,y+18+k*9,(w-24)*(k===2?.55:1),3);}
  ctx.globalAlpha=1;if(title)text(title,x+12,y+h-18,15,C.ink,600,'left',alpha);}
function scanBeam(bx,top,h,alpha,label='iResOps scanning'){if(alpha<=0)return;const g=ctx.createLinearGradient(bx-170,0,bx,0);g.addColorStop(0,'rgba(0,179,54,0)');g.addColorStop(1,'rgba(0,179,54,0.24)');
  ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(bx-170,top,170,h);ctx.fillStyle='rgba(0,179,54,0.35)';ctx.fillRect(bx-6,top,12,h);ctx.fillStyle='#7CF0A0';ctx.fillRect(bx-1.5,top,3,h);ctx.globalAlpha=1;
  const w=textW(label,15,700)+44;ctx.globalAlpha=alpha;rrect(bx-w/2,top-36,w,30,15);ctx.fillStyle=C.green;ctx.fill();ctx.globalAlpha=1;
  circle(bx-w/2+16,top-21,5,'#04140A',null,0,alpha*(.45+.55*Math.abs(Math.sin(bx/18))));
  text(label,bx-w/2+30,top-16,15,'#04140A',700,'left',alpha);}
function bubble(x,y,w,h,hdr,body,alpha,o={}){if(alpha<=0)return;panel(x,y,w,h,alpha,{fill:o.fill||'#16303F',stroke:o.stroke,lw:2});
  text(hdr,x+20,y+30,14,o.hc||C.muted,o.hc?600:400,'left',alpha);wrapText(body,x+20,y+62,w-40,20,600,C.ink,alpha,27);}
function wrapText(s,x,y,maxW,size,weight,color,alpha,lh){ctx.font=`${weight} ${size}px ${FONT}`;const words=s.split(' ');let line='',yy=y;
  for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){text(line,x,yy,size,color,weight,'left',alpha);ctx.font=`${weight} ${size}px ${FONT}`;line=w;yy+=lh;}else line=test;}
  if(line)text(line,x,yy,size,color,weight,'left',alpha);return yy;}

// What the scan finds. One colour per kind of data, used in every part.
const CATS=['Personal','Financial','Business-critical'];
const CATCOL={Personal:C.teal,Financial:C.amber,'Business-critical':C.purple};

/* ---------------- Part one: Where is it ---------------- */
// Northwind's files in three workloads. Columns 0 to 7 SharePoint, 8 to 15 OneDrive, 16 to 23 Teams.
const COLS=24,ROWS=11,TS=28,PITCH=36,BAND=8,BGAP=30,X0=190,Y0=246;
const BANDS=['SharePoint','OneDrive','Teams'];
const tx=c=>X0+c*PITCH+Math.floor(c/BAND)*BGAP;
const GX1=tx(COLS-1)+TS,GY1=Y0+(ROWS-1)*PITCH+TS;
const FILES=(()=>{const R=rng(17);const a=[];for(let i=0;i<COLS*ROWS;i++){const r=R();a.push({c:Math.floor(i/ROWS),r:i%ROWS,cat:r<.12?'Personal':r<.18?'Financial':r<.23?'Business-critical':null});}return a;})();
const F1={dur:30};
F1.render=function(t){
  backdrop();
  const beam=lerp(X0-30,GX1+40,clamp((t-7.4)/6,0,1));
  const dim=prog(t,18.4,19.4);
  const ha=prog(t,.3,1);
  text('Northwind Group across Microsoft 365',X0,Y0-62,19,C.muted,400,'left',ha);
  BANDS.forEach((b,k)=>text(b,tx(k*BAND),Y0-22,18,C.ink,600,'left',prog(t,.6+k*.5,1.2+k*.5)));
  FILES.forEach((f,i)=>{const x=tx(f.c),y=Y0+f.r*PITCH;const a=prog(t,.6+f.c*.14,1.1+f.c*.14);if(a<=0)return;
    const seen=f.cat&&t>7.4?clamp((beam-(x+TS/2))/40,0,1):0;
    const al=a*(f.cat?1:1-.65*dim);
    ctx.globalAlpha=al;rrect(x,y,TS,TS,5);ctx.fillStyle=C.tile;ctx.fill();
    if(seen>0){ctx.globalAlpha=al*seen;ctx.fillStyle=CATCOL[f.cat];ctx.fill();}
    ctx.globalAlpha=1;
    if(f.cat&&dim>0){const ph=frac(t*.6+i*.137);circle(x+TS/2,y+TS/2,TS*.6+ph*12,null,CATCOL[f.cat],1.5,dim*(1-ph)*.8);}});
  scanBeam(beam,Y0-8,GY1-Y0+16,win(t,7.2,13.8,.3));
  // what the scan has found so far
  const pa=prog(t,7.8,8.4);
  if(pa>0){const x=1190,y=Y0-10,w=370;panel(x,y,w,236,pa);text('Found so far',x+24,y+42,22,C.ink,700,'left',pa);
    CATS.forEach((k,j)=>{const ry=y+92+j*42;const n=FILES.filter(f=>f.cat===k&&tx(f.c)+TS/2<beam).length;
      ctx.globalAlpha=pa;rrect(x+24,ry-15,16,16,4);ctx.fillStyle=CATCOL[k];ctx.fill();ctx.globalAlpha=1;
      text(k,x+52,ry,18,C.ink,400,'left',pa);text(String(n),x+w-24,ry,18,C.ink,600,'right',pa);});
    const tot=FILES.filter(f=>tx(f.c)+TS/2<beam).length;text(`${tot} of ${FILES.length} files scanned`,x+24,y+214,16,C.muted,400,'left',pa);}
  // where it is, by workload
  BANDS.forEach((b,k)=>{const n=FILES.filter(f=>f.cat&&Math.floor(f.c/BAND)===k).length;text(`${n} files with sensitive data`,tx(k*BAND),GY1+42,17,C.ink,600,'left',prog(t,19.6+k*.4,20.2+k*.4));});
  const la=prog(t,21.4,22.2);
  if(la>0){const x=1190,y=Y0+260,w=370;panel(x,y,w,150,la);text('Scanning answers',x+24,y+42,17,C.muted,400,'left',la);text('Where is the data?',x+24,y+80,24,C.ink,700,'left',la);
    text('Next: what is it?',x+24,y+122,18,C.green,600,'left',prog(t,24.6,25.2));}
  caption(t,[[.4,6.8,'Years of files across Microsoft 365.'],[7,12.6,'iResOps scans SharePoint, OneDrive and Teams.'],[12.8,17.8,'Files, sites and the data inside them.'],
    [18,24,'Scanning answers where the data is.'],[24.2,30,'The next question is what it is.']]);
};
F1.beats=[[0,'Years of files'],[7,'Scanning Microsoft 365'],[18,'Where it is']];

/* ---------------- Part two: What is it ---------------- */
const NUM='482 913 607';
const CARDS=[
  {title:'Payroll export.xlsx',rows:[['Name','Aroha Tane'],['Date of birth','14/03/1988'],['Tax file no.',NUM]],hit:2,sens:true,verdict:'Tax file number',ctx:['Header: Tax file no.','Name and date of birth nearby']},
  {title:'Purchase order 1182.pdf',rows:[['Supplier','Kauri Logistics'],['Order no.',NUM],['Total','$4,180.00']],hit:1,sens:false,verdict:'Order number',ctx:['Header: Order no.','Document type: Purchase order']},
  {title:'Parts list.xlsx',rows:[['Part no.',NUM],['Item','Pump housing'],['Qty','12']],hit:0,sens:false,verdict:'Part number',ctx:['Header: Part no.','No personal data nearby']},
  {title:'New starter form.pdf',rows:[['Full name','Aroha Tane'],['Tax file number','482-913-607']],hit:1,sens:true,scan:true,verdict:'Tax file number',ctx:['Scanned image, read with OCR','Document type: New starter form']},
];
const CW=320,CH=390,CY=286,CG=36;
const F2={dur:38};
F2.render=function(t){
  backdrop();
  const nF=lerp(3,4,prog(t,16,17));
  const x0=800-(nF*CW+(nF-1)*CG)/2;
  // the number on its own
  const na=prog(t,.3,1)*(1-prog(t,4.4,5.2));
  if(na>0){mono(NUM,800,470,76,C.ink,600,'center',na);text('Is it sensitive?',800,540,24,C.muted,400,'center',prog(t,1.6,2.2)*na);}
  // pattern, then context
  const ra=win(t,7.2,24.6,.5);
  if(ra>0){const s='Pattern rule:  \\d{3} ?\\d{3} ?\\d{3}';const w=textW(s,18,600,MONO)+40;ctx.globalAlpha=ra;rrect(800-w/2,214,w,44,22);ctx.fillStyle='#2A2410';ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;mono(s,800,243,18,C.amber,600,'center',ra);}
  const ia=prog(t,24.6,25.4);
  if(ia>0)pillC('iResOps weighs every signal together',800,243,C.green,'#04140A',ia,18);
  CARDS.forEach((cd,k)=>{
    const ap=k<3?prog(t,4.8+k*.3,5.4+k*.3):prog(t,16.4,17.2);if(ap<=0)return;
    const x=x0+k*(CW+CG),y=CY+(1-ap)*20;
    const flagged=k<3&&t>8.4+k*.5&&t<25+k*1.6;
    const missed=k===3&&t>18.2&&t<25+k*1.6;
    const decided=t>26+k*1.6;
    let stroke=C.panelLine,lw=1.5;
    if(flagged){stroke=C.amber;lw=2.5;}if(missed){stroke=C.red;lw=2.5;}if(decided){stroke=cd.sens?C.teal:C.panelLine;lw=cd.sens?2.5:1.5;}
    panel(x,y,CW,CH,ap,{fill:cd.scan?'#14242C':C.panel,stroke,lw,dash:missed});
    text(cd.title,x+22,y+38,18,C.ink,700,'left',ap);
    ctx.globalAlpha=ap;ctx.fillStyle=C.panelLine;ctx.fillRect(x+22,y+54,CW-44,1.5);ctx.globalAlpha=1;
    cd.rows.forEach(([l,v],r)=>{const ry=y+88+r*58;text(l,x+22,ry,14,C.muted,400,'left',ap);
      if(r===cd.hit){const hw=textW(v,20,500,MONO)+16;const hc=decided?(cd.sens?C.teal:C.node):flagged?C.amber:missed?C.red:null;
        if(hc){ctx.globalAlpha=ap*.22;rrect(x+16,ry+10,hw,30,6);ctx.fillStyle=hc;ctx.fill();ctx.globalAlpha=ap;ctx.strokeStyle=hc;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;}}
      if(cd.scan)text(v,x+24,ry+30,21,C.nodeHi,500,'left',ap,'"Segoe Print", "Bradley Hand", cursive');else mono(v,x+24,ry+30,20,C.ink,500,'left',ap);});
    if(cd.scan){ctx.globalAlpha=ap*.5;ctx.save();ctx.setLineDash([3,5]);ctx.strokeStyle=C.node;ctx.lineWidth=1;rrect(x+14,y+66,CW-28,140,6);ctx.stroke();ctx.restore();ctx.globalAlpha=1;text('scanned image',x+CW-22,y+222,13,C.muted,400,'right',ap);}
    // the pattern's verdict
    if(flagged)pill('Tax file number?',x+22,y+CH-24,C.amber,'#1A1405',prog(t,8.4+k*.5,8.9+k*.5),15);
    if(flagged&&k>0)text('False positive',x+CW-22,y+CH-22,15,C.red,600,'right',prog(t,11+k*.4,11.5+k*.4));
    if(missed){pill('Missed',x+22,y+CH-24,C.red,'#2A0A0B',prog(t,18.2,18.8),15);text('False negative',x+CW-22,y+CH-22,15,C.red,600,'right',prog(t,19,19.6));}
    // the context signals, then the decision
    cd.ctx.forEach((c,j)=>{const a=prog(t,25+k*1.6+j*.35,25.5+k*1.6+j*.35);if(a>0)pill(c,x+22,y+262+j*40,'#16303F',C.ink,a,14);});
    if(decided){const a=prog(t,26+k*1.6,26.6+k*1.6);
      if(cd.sens)pill(cd.verdict,x+22,y+CH-24,C.teal,'#04201F',a,15);
      else{check(x+24,y+CH-34,14,C.green,a);text(`${cd.verdict}, not sensitive`,x+48,y+CH-22,15,C.green,600,'left',a);}}
  });
  // running tally under the cards
  const tl=[[11.4,16,'3 flagged. 2 of them are false positives.',C.amber],[19.4,24.4,'And the one that mattered was missed.',C.red],[33,38,'2 found. No false positives.',C.green]];
  tl.forEach(([a,b,s,col])=>text(s,800,CY+CH+64,22,col,600,'center',win(t,a,b,.4)));
  caption(t,[[.3,4.4,'One nine-digit number.'],[4.6,7,'Three very different files.'],[7.2,11.2,'A pattern matches anything that looks right.'],[11.4,15.8,'False positives turn security into manual work.'],
    [16,20.2,'Reformat it, or scan it, and the rule misses it.'],[20.4,24.2,'False negatives leave risk invisible.'],[24.4,29.4,'Headers, neighbours, layout, document type.'],[29.6,34,'Weighed together, not one at a time.'],[34.2,38,'More found. Less noise.']]);
};
F2.beats=[[0,'One nine-digit number'],[7,'Patterns match everything'],[16,'And miss the rest'],[24.2,'Context decides']];

/* ---------------- Part three: How it decides ---------------- */
const DOC={x:96,y:214,w:430,h:540};
const STAFF=[['Aroha Tane','E10482'],['Mere Walker','E10517'],['Sam Patel','E10533'],['Lena Fischer','E10561']];
const DET=[{k:'Data elements',sub:'Described data',body:'Name · Employee ID',col:C.teal,y:224,at:.8},
  {k:'Exact data profiles',sub:'Registered data',body:'Rows match the HR employee index',col:C.purple,y:396,at:8.6},
  {k:'Document types',sub:'What the file is for',body:'Restructure proposal',col:C.amber,y:568,at:16.6}];
const DX=620,DW=410,DH=146,PX=1110,PW=440,PY=330,PH=230;
const F3={dur:40};
F3.render=function(t){
  backdrop();
  const da=prog(t,.2,.9);
  const tp=prog(t,16.8,17.6)*(1-prog(t,39,40));
  // the document
  panel(DOC.x,DOC.y,DOC.w,DOC.h,da,{stroke:tp>0?C.amber:C.panelLine,lw:tp>0?2.5:1.5});
  text('Project Atlas proposal.docx',DOC.x+24,DOC.y+40,19,C.ink,700,'left',da);
  ctx.globalAlpha=da;ctx.fillStyle=C.panelLine;ctx.fillRect(DOC.x+24,DOC.y+58,DOC.w-48,1.5);ctx.globalAlpha=1;
  text('Operations restructure',DOC.x+24,DOC.y+104,24,C.ink,700,'left',da);
  text('Prepared for the Board, May 2026',DOC.x+24,DOC.y+136,16,C.muted,400,'left',da);
  text('Roles affected',DOC.x+24,DOC.y+190,15,C.muted,600,'left',da);
  const ea=prog(t,1.6,2.2),xa=prog(t,9.4,10);
  STAFF.forEach(([n,id],r)=>{const ry=DOC.y+232+r*50;
    if(xa>0){ctx.globalAlpha=da*xa;rrect(DOC.x+16,ry-28,DOC.w-32,42,8);ctx.strokeStyle=C.purple;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;}
    const nw=textW(n,19,500);
    if(ea>0){ctx.globalAlpha=da*ea*.25;rrect(DOC.x+20,ry-22,nw+12,30,6);ctx.fillStyle=C.teal;ctx.fill();rrect(DOC.x+270,ry-22,textW(id,18,500,MONO)+12,30,6);ctx.fill();ctx.globalAlpha=1;}
    text(n,DOC.x+26,ry,19,C.ink,500,'left',da);mono(id,DOC.x+276,ry,18,C.ink,500,'left',da);});
  text('Notice to be issued 18 May 2026',DOC.x+24,DOC.y+470,16,C.muted,400,'left',da);
  text('Confidential draft',DOC.x+24,DOC.y+500,16,C.muted,400,'left',da);
  // detectors
  DET.forEach((d,k)=>{const a=prog(t,d.at,d.at+.6)*(1-.45*prog(t,24.2,25));if(a<=0)return;
    const lit=t>d.at&&t<d.at+7.6;panel(DX,d.y,DW,DH,a,{stroke:lit?d.col:C.panelLine,lw:lit?2.5:1.5});
    ctx.globalAlpha=a;rrect(DX+22,d.y+22,14,14,4);ctx.fillStyle=d.col;ctx.fill();ctx.globalAlpha=1;
    text(d.k,DX+46,d.y+36,20,C.ink,700,'left',a);text(d.sub,DX+22,d.y+70,15,d.col,600,'left',a);
    wrapText(d.body,DX+22,d.y+106,DW-44,17,400,C.ink,prog(t,d.at+.8,d.at+1.4)*a,22);
    // from the document to the detector
    const ea2=win(t,d.at+.4,d.at+7.6,.4);if(ea2>0)drawEdge(DOC.x+DOC.w,DOC.y+(k===2?120:k===0?250:300),DX,d.y+DH/2,d.col,2,ea2*.8,ease(clamp((t-d.at-.4)/.6,0,1)),.08);
    // into the content profile
    const pa=prog(t,25+k*.4,25.8+k*.4);if(pa>0){drawEdge(DX+DW,d.y+DH/2,PX,PY+PH/2,d.col,2,pa*.85,pa,-.04);}});
  // content profile
  const pa=prog(t,24.6,25.4);
  if(pa>0){panel(PX,PY,PW,PH,pa,{stroke:C.green,lw:2.5});text('Content profile',PX+24,PY+38,15,C.green,600,'left',pa);text('HR Confidential',PX+24,PY+72,24,C.ink,700,'left',pa);
    const lines=['Employee records','AND (Restructure proposal','     OR Board paper)'];
    lines.forEach((l,j)=>mono(l,PX+24,PY+124+j*32,17,C.nodeHi,500,'left',prog(t,26.4+j*.8,27+j*.8)));}
  // sensitivity
  const sa=prog(t,32.6,33.4);
  if(sa>0){arrow(PX+PW/2,PY+PH+8,PX+PW/2,PY+PH+76,C.nodeHi,sa,sa);text('when the rule matches',PX+PW/2+16,PY+PH+50,15,C.muted,400,'left',sa);
    panel(PX+60,PY+PH+86,PW-120,92,sa,{fill:'#3A1214',stroke:C.red,lw:2});text('Sensitivity level',PX+PW/2,PY+PH+122,15,C.muted,400,'center',sa);text('Restricted',PX+PW/2,PY+PH+158,26,C.red,700,'center',sa);}
  const st=prog(t,34.6,35.4);
  if(st>0){ctx.save();ctx.translate(DOC.x+DOC.w-110,DOC.y+178);ctx.rotate(-.12);ctx.globalAlpha=st;rrect(-78,-24,156,48,10);ctx.strokeStyle=C.red;ctx.lineWidth=3;ctx.stroke();ctx.restore();ctx.globalAlpha=1;
    ctx.save();ctx.translate(DOC.x+DOC.w-110,DOC.y+178);ctx.rotate(-.12);text('RESTRICTED',0,8,20,C.red,700,'center',st);ctx.restore();}
  caption(t,[[.4,4.6,'Data elements. Names, IDs, tax file numbers.'],[4.8,8.4,'Described data. You say what it looks like.'],[8.6,12.6,'Exact data profiles. Records you registered.'],[12.8,16.4,'This name with this employee ID.'],
    [16.6,20.4,'Document types. What the file is for.'],[20.6,24.2,'A board paper needs no regulated data to be sensitive.'],[24.4,28.6,'Content profiles combine them with rules.'],[28.8,32.4,'Your framework, written as rules.'],
    [32.6,36.4,'A match sets the sensitivity level.'],[36.6,40,'That is what drives the label.']]);
};
F3.beats=[[0,'Data elements'],[8.4,'Exact data profiles'],[16.4,'Document types'],[24.2,'Content profiles'],[32.4,'Sensitivity labels']];

/* ---------------- Part four: Why it matters ---------------- */
const FN={x:700,y:390,w:200,h:140};
const PERSON=[290,460],AGENT=[1320,460],SHIELD=[1110,460];
const F4={dur:40};
F4.render=function(t){
  backdrop();
  const flow=win(t,16,25.4,.6);
  const gd=1-.6*flow;
  const fa=prog(t,.3,1)*gd;
  text('Operations team site',FN.x+FN.w/2,FN.y-60,17,C.muted,600,'center',fa);
  // access
  const aa=prog(t,2.4,3.2)*gd;
  drawEdge(PERSON[0]+40,PERSON[1],FN.x,FN.y+FN.h/2,C.amber,2.5,aa*.9,aa);
  personGlyph(PERSON[0],PERSON[1],34,C.amber,'#2A2410',aa);text('Everyone except',PERSON[0],PERSON[1]+66,17,C.ink,600,'center',aa);text('external users',PERSON[0],PERSON[1]+88,17,C.ink,600,'center',aa);
  // agent
  const ga=prog(t,8.6,9.4)*gd;
  const blocked=t>27.6;
  const ep=ease(clamp((t-9)/.8,0,1));
  if(!blocked)drawEdge(AGENT[0]-34,AGENT[1],FN.x+FN.w,FN.y+FN.h/2,C.nodeHi,2.5,ga*.9,ep);
  else{drawEdge(AGENT[0]-34,AGENT[1],SHIELD[0]+30,SHIELD[1],C.red,2.5,ga*.9);blockX(SHIELD[0]+52,SHIELD[1]-24,prog(t,27.6,28.2));}
  agentGlyph(AGENT[0],AGENT[1],30,C.green,'#0E2A1C',ga);text('Copilot',AGENT[0],AGENT[1]+62,18,C.ink,600,'center',ga);
  // the file, with what classification found
  docCard(FN.x,FN.y,FN.w,FN.h,'Project Atlas proposal',fa);
  pillC('HR Confidential',FN.x+FN.w/2,FN.y+FN.h+40,C.teal,'#04201F',prog(t,.8,1.4)*gd,15);
  // toxic combination
  const tx2=prog(t,11,11.8)*gd*(1-prog(t,25,25.8));
  if(tx2>0){ctx.save();ctx.setLineDash([8,8]);ctx.globalAlpha=tx2;rrect(PERSON[0]-110,FN.y-30,AGENT[0]-PERSON[0]+220,FN.h+110,22);ctx.strokeStyle=C.red;ctx.lineWidth=2;ctx.stroke();ctx.restore();ctx.globalAlpha=1;
    pillC('Toxic combination',800,FN.y-18,C.red,'#2A0A0B',tx2,16);}
  // policy flow
  if(flow>0){const y=700;
    panel(150,y-40,330,80,flow,{stroke:C.nodeHi});text('Policy',170,y-12,14,C.muted,400,'left',flow);text('Restricted data open to everyone',170,y+18,17,C.ink,600,'left',flow);
    arrow(482,y,602,y,C.nodeHi,flow,prog(t,17.4,18.2));
    ctx.globalAlpha=flow;ctx.beginPath();ctx.moveTo(690,y-62);ctx.lineTo(778,y);ctx.lineTo(690,y+62);ctx.lineTo(602,y);ctx.closePath();ctx.fillStyle='#2A2410';ctx.fill();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
    text('Auto-',690,y-4,16,C.amber,600,'center',flow);text('remediate?',690,y+18,16,C.amber,600,'center',flow);
    const ya=prog(t,19,19.8),no=prog(t,21,21.8);
    drawEdge(778,y,880,y-50,C.green,2,flow*ya,ya);text('Yes',822,y-42,14,C.green,600,'center',flow*ya);
    panel(884,y-86,560,64,flow*ya,{stroke:C.green});text('Remediated automatically, reported to the owner',904,y-46,17,C.ink,600,'left',flow*ya);
    drawEdge(778,y,880,y+50,C.amber,2,flow*no,no);text('No',822,y+58,14,C.amber,600,'center',flow*no);
    panel(884,y+22,560,64,flow*no,{stroke:C.amber});text('Sent to the data owner to review and act',904,y+62,17,C.ink,600,'left',flow*no);}
  // label, then block
  const lb=prog(t,25.8,26.6);
  if(lb>0){pillC('Restricted',FN.x+FN.w/2,FN.y+30,C.red,'#2A0A0B',lb,16);
    shieldGlyph(SHIELD[0],SHIELD[1],34,C.green,'#0E2A1C',prog(t,26.6,27.4));text('Purview DLP',SHIELD[0],SHIELD[1]+62,17,C.ink,600,'center',prog(t,26.6,27.4));}
  // a safe answer
  bubble(150,640,560,104,'A colleague asks','Are any Operations roles being held or cut?',prog(t,32.2,32.8));
  const an=prog(t,34,34.6);
  if(an>0){panel(860,640,600,150,an,{stroke:C.green,lw:2});text('Copilot answers',880,670,14,C.green,600,'left',an);
    wrapText("I couldn't find anything I can share on that. The People Team can help with questions about roles.",880,704,560,20,600,C.ink,an,27);}
  caption(t,[[.4,4.6,'Sensitive data on its own is fine.'],[4.8,8.4,'Sensitive and open to everyone is not.'],[8.6,12.8,'Add an agent that can reach it.'],[13,15.8,'That is a toxic combination.'],
    [16,20.6,'Policies look for toxic combinations.'],[20.8,25.2,'Act automatically, or ask the data owner.'],[25.4,29.6,'iResOps labels it. Purview DLP enforces it.'],[29.8,32,'Labelled content stays out of grounding.'],[32.2,40,'The agent answers safely.']]);
};
F4.beats=[[0,'Sensitive and overshared'],[8.4,'Plus an agent'],[16,'Policy finds it'],[25.4,'Label, then block'],[32,'A safe answer']];

/* ---------------- Summary: loops as an outro ---------------- */
const F5={dur:9};
const MINI=(()=>{const R=rng(23);const a=[];for(let i=0;i<32;i++){const r=R();a.push(r<.14?'Personal':r<.22?'Financial':r<.3?'Business-critical':null);}return a;})();
function vizFind(cx,cy,t,ap){const c=t%6,cols=8,s=26,g=8,x0=cx-(cols*(s+g)-g)/2,y0=cy-(4*(s+g)-g)/2;const bx=x0-20+clamp((c-.4)/2.6,0,1)*(cols*(s+g)+40);const fade=1-prog(c,5.2,5.8);
  MINI.forEach((k,i)=>{const x=x0+(i%cols)*(s+g),y=y0+Math.floor(i/cols)*(s+g);ctx.globalAlpha=ap;rrect(x,y,s,s,5);ctx.fillStyle=C.tile;ctx.fill();if(k&&bx>x+s/2&&c>.4){ctx.globalAlpha=ap*fade;ctx.fillStyle=CATCOL[k];ctx.fill();}ctx.globalAlpha=1;});
  const a=ap*win(c,.3,3.2,.3);if(a>0){ctx.globalAlpha=a;ctx.fillStyle='#7CF0A0';ctx.fillRect(bx-1,cy-76,2,152);ctx.globalAlpha=1;}}
function vizKnow(cx,cy,t,ap){const c=t%6;mono(NUM,cx,cy-14,30,C.ink,600,'center',ap);
  const sigs=['Header','Neighbours','Doc type'];sigs.forEach((s,k)=>{const a=ap*prog(c,.6+k*.5,1.1+k*.5)*(1-prog(c,5.2,5.8));const w=textW(s,13,600)+24;pill(s,cx-150+k*104+(96-w)/2,cy+30,'#16303F',C.ink,a,13);});
  pillC('Tax file number',cx,cy+82,C.teal,'#04201F',ap*prog(c,2.4,3)*(1-prog(c,5.2,5.8)),14);}
function vizAct(cx,cy,t,ap){const c=t%6;docCard(cx-120,cy-46,92,80,null,ap);pillC('Restricted',cx-74,cy+62,C.red,'#2A0A0B',ap*prog(c,.6,1.2)*(1-prog(c,5.2,5.8)),13);
  agentGlyph(cx+110,cy-6,20,C.green,'#0E2A1C',ap);const sh=prog(c,1.6,2.2)*(1-prog(c,5.2,5.8));
  drawEdge(cx+88,cy-6,cx-24,cy-6,sh>0?C.red:C.nodeHi,2,ap*.8,1);shieldGlyph(cx+30,cy-6,22,C.green,'#0E2A1C',ap*sh);if(sh>.9)blockX(cx+30,cy-44,ap);}
F5.render=function(t){backdrop();
  const cards=[{x:130,title:'Find it',lines:['SharePoint, OneDrive and Teams','Personal, financial, business-critical','Where it lives, who can reach it']},
    {x:590,title:'Know what it is',lines:['Context, not just patterns','Elements, records and document types','Your framework, as rules']},
    {x:1050,title:'Act on it',lines:['Toxic combinations found','Remediated, or routed to the owner','Labels that Purview can enforce']}];
  cards.forEach((c,k)=>{const ap=prog(t,.6+k*.5,1.4+k*.5);if(ap<=0)return;const dy=(1-ap)*16;const x=c.x,y=196+dy,w=420,h=448;const cx=x+w/2;
    panel(x,y,w,h,ap,{lw:1.5});
    ctx.save();rrect(x+20,y+20,w-40,220,12);ctx.clip();ctx.globalAlpha=ap;ctx.fillStyle='#0C2130';ctx.fillRect(x+20,y+20,w-40,220);ctx.globalAlpha=1;
    if(k===0)vizFind(cx,y+130,t,ap);else if(k===1)vizKnow(cx,y+130,t,ap);else vizAct(cx,y+130,t,ap);
    ctx.restore();
    text(c.title,x+28,y+290,26,C.ink,700,'left',ap);
    c.lines.forEach((l,i)=>{const ly=y+334+i*34;check(x+30,ly-6,14,C.green,ap);text(l,x+56,ly,17,C.muted,400,'left',ap);});});
  const fb=prog(t,2.2,3);
  if(fb>0){const x=130,y=672,w=1340,h=84;
    ctx.globalAlpha=fb;rrect(x,y,w,h,14);ctx.fillStyle='#0E2A1C';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.stroke();
    ctx.save();rrect(x,y,w,h,14);ctx.clip();const sx=x-300+frac(t/5)*(w+600);const gr=ctx.createLinearGradient(sx-220,0,sx+220,0);gr.addColorStop(0,'rgba(0,179,54,0)');gr.addColorStop(.5,'rgba(0,179,54,.22)');gr.addColorStop(1,'rgba(0,179,54,0)');ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);ctx.restore();ctx.globalAlpha=1;
    text('Veeam Intelligent ResOps for Microsoft 365',800,y+53,30,C.ink,700,'center',fb);}
  caption(t,[[.3,1e9,'Labels you can trust, for people and AI agents.']]);
};
F5.beats=[[0,'Labels you can trust']];

const PARTS=[F1,F2,F3,F4,F5];
const G=['Part one: Where is it','Part two: What is it','Part three: How it decides','Part four: Why it matters','Summary'];
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
