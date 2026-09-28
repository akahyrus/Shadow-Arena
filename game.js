const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
let W,H,DPR;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)} addEventListener("resize",resize);resize();

const $=id=>document.getElementById(id);
const keys={}, mouse={x:W/2,y:H/2,down:false};
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase()))e.preventDefault()});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener("mousemove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
canvas.addEventListener("mousedown",()=>mouse.down=true);addEventListener("mouseup",()=>mouse.down=false);

const rand=(a,b)=>Math.random()*(b-a)+a, pick=a=>a[Math.floor(Math.random()*a.length)];
let state="menu",last=0,timeAlive=0,wave=1,kills=0,spawnTimer=0,waveKills=0,shake=0,level=1,xp=0,xpNeed=50;
let player={x:innerWidth/2,y:innerHeight/2,r:18,hp:100,maxHp:100,speed:235,damage:28,attackCd:0,attackRate:.34,range:78,dashCd:0,dashMax:1.3,special:0,level:1,crit:.08,regen:0,inv:0},enemies=[],particles=[],slashes=[],projectiles=[],floats=[],stars=[];
let best=JSON.parse(localStorage.getItem("shadowArenaBest")||'{"wave":0,"kills":0,"time":0}');
for(let i=0;i<180;i++)stars.push({x:Math.random(),y:Math.random(),s:Math.random()*2+.3,a:Math.random()*.6+.15});

function reset(){
 player={x:W/2,y:H/2,r:18,hp:100,maxHp:100,speed:235,damage:28,attackCd:0,attackRate:.34,range:78,dashCd:0,dashMax:1.3,special:0,level:1,crit:.08,regen:0,inv:0};
 enemies=[];particles=[];slashes=[];projectiles=[];floats=[];timeAlive=0;wave=1;kills=0;waveKills=0;spawnTimer=.2;shake=0;level=1;xp=0;xpNeed=50;state="playing";$("startScreen").classList.add("hidden");$("gameOver").classList.add("hidden");$("upgradeScreen").classList.add("hidden");
}
function spawnEnemy(){
 const side=Math.floor(Math.random()*4),m=70;
 let x=side===0?rand(-m,W+m):side===1?W+ m:side===2?rand(-m,W+m):-m;
 let y=side===0?-m:side===1?rand(-m,H+m):side===2?H+m:rand(-m,H+m);
 const r=Math.random(), base=1+wave*.045;
 let type=r<.62?"grunt":r<.82?"runner":r<.94?"brute":"ranged";
 let e={x,y,type,r:type==="brute"?25:type==="runner"?14:17,hp:30*base*(type==="brute"?3.5:type==="runner"?.65:1),maxHp:0,speed: type==="runner"?145+wave*2:type==="brute"?45:75+wave*1.3,hit:0,shoot:rand(1,2.5),angle:0};
 e.maxHp=e.hp; if(type==="ranged")e.speed=55;e.hp*=1.2;e.maxHp=e.hp;enemies.push(e);
}
function burst(x,y,n,life=.5,size=3,kind="hit"){
 for(let i=0;i<n;i++){let a=rand(0,Math.PI*2),sp=rand(30,230);particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(.2,life),max:life,size:rand(1,size),kind})}
}
function floatText(x,y,t){floats.push({x,y,t,life:1})}
function gainXP(n){xp+=n;while(xp>=xpNeed){xp-=xpNeed;xpNeed=Math.floor(xpNeed*1.28);level++;showUpgrade()}}
function showUpgrade(){state="upgrade";const pool=[
 ["Sharp Edge","+20% sword damage",()=>player.damage*=1.2],
 ["Shadow Step","-15% dash cooldown",()=>player.dashMax*=.85],
 ["Dark Vitality","+25 maximum HP and heal",()=>{player.maxHp+=25;player.hp=Math.min(player.maxHp,player.hp+25)}],
 ["Swift Blade","+15% attack speed",()=>player.attackRate*=.85],
 ["Long Reach","+18 sword range",()=>player.range+=18],
 ["Soul Drain","+2 HP per kill",()=>player.regen+=2],
 ["Critical Shadow","+8% critical chance",()=>player.crit+=.08],
 ["Void Energy","+25 special energy per kill",()=>player.special=Math.min(100,player.special+25)]
];let choices=[];while(choices.length<3){let u=pick(pool);if(!choices.includes(u))choices.push(u)}
$("upgradeChoices").innerHTML=choices.map((u,i)=>`<button class="upgrade" data-i="${i}"><strong>${u[0]}</strong><span>${u[1]}</span></button>`).join("");
document.querySelectorAll(".upgrade").forEach((b,i)=>b.onclick=()=>{choices[i][2]();$("upgradeScreen").classList.add("hidden");state="playing";});
$("upgradeScreen").classList.remove("hidden");
}
function attack(){
 if(player.attackCd>0)return;player.attackCd=player.attackRate;
 let dx=mouse.x-player.x,dy=mouse.y-player.y,len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
 const ang=Math.atan2(dy,dx);slashes.push({x:player.x,y:player.y,ang,life:.16,max:.16});
 burst(player.x+dx*28,player.y+dy*28,8,.25,3,"slash");shake=4;
 for(const e of enemies){let ex=e.x-player.x,ey=e.y-player.y,d=Math.hypot(ex,ey),ea=Math.atan2(ey,ex),diff=Math.atan2(Math.sin(ea-ang),Math.cos(ea-ang));if(d<player.range+e.r&&Math.abs(diff)<1.05){
  let dmg=player.damage*(Math.random()<player.crit?2.2:1);e.hp-=dmg;e.hit=.12;floatText(e.x,e.y-22,"-"+Math.round(dmg));burst(e.x,e.y,7,.25,3);
  if(e.hp<=0)killEnemy(e);
 }}
}
function killEnemy(e){let i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1);kills++;waveKills++;gainXP(e.type==="brute"?22:12);player.hp=Math.min(player.maxHp,player.hp+player.regen);player.special=Math.min(100,player.special+8);burst(e.x,e.y,18,.7,5,"death");}
function dash(){
 if(player.dashCd>0||state!=="playing")return;
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(!dx&&!dy){dx=mouse.x-player.x;dy=mouse.y-player.y}
 let l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;player.x+=dx*145;player.y+=dy*145;player.x=Math.max(25,Math.min(W-25,player.x));player.y=Math.max(25,Math.min(H-25,player.y));player.dashCd=player.dashMax;player.inv=.22;burst(player.x,player.y,28,.45,5,"dash");shake=10;
}
function special(){
 if(player.special<100||state!=="playing")return;player.special=0;shake=18;burst(player.x,player.y,100,1,8,"special");
 for(const e of [...enemies]){let d=Math.hypot(e.x-player.x,e.y-player.y);if(d<260){e.hp-=150+wave*8;floatText(e.x,e.y-20,"VOID!");if(e.hp<=0)killEnemy(e)}}
}
function hurt(n){if(player.inv>0)return;player.hp-=n;player.inv=.3;shake=9;burst(player.x,player.y,18,.35,4);if(player.hp<=0)endGame()}
function endGame(){state="over";best.wave=Math.max(best.wave,wave);best.kills=Math.max(best.kills,kills);best.time=Math.max(best.time,timeAlive);localStorage.setItem("shadowArenaBest",JSON.stringify(best));$("finalWave").textContent=wave;$("finalKills").textContent=kills;$("finalTime").textContent=formatTime(timeAlive);$("gameOver").classList.remove("hidden")}
function formatTime(t){let m=Math.floor(t/60),s=Math.floor(t%60);return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}
function update(dt){
 if(state!=="playing")return;timeAlive+=dt;player.attackCd=Math.max(0,player.attackCd-dt);player.dashCd=Math.max(0,player.dashCd-dt);player.inv=Math.max(0,player.inv-dt);
 let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 let ml=Math.hypot(mx,my);if(ml){mx/=ml;my/=ml;player.x+=mx*player.speed*dt;player.y+=my*player.speed*dt}
 player.x=Math.max(20,Math.min(W-20,player.x));player.y=Math.max(20,Math.min(H-20,player.y));
 if(mouse.down)attack();
 if(keys[" "]||keys.shift){keys[" "]=false;keys.shift=false;dash()} if(keys.q){keys.q=false;special()}
 spawnTimer-=dt;let interval=Math.max(.22,1.25-wave*.025);if(spawnTimer<=0){let count=wave>15&&Math.random()<.18?2:1;for(let i=0;i<count;i++)spawnEnemy();spawnTimer=interval}
 for(const e of enemies){
  e.hit=Math.max(0,e.hit-dt);e.shoot-=dt;let dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;
  if(e.type==="ranged"&&d<300){e.angle=Math.atan2(dy,dx);if(e.shoot<=0){projectiles.push({x:e.x,y:e.y,vx:dx/d*180,vy:dy/d*180,life:2,damage:8+wave*.4});e.shoot=1.8}}
  else {e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt}
  if(d<e.r+player.r+4)hurt((e.type==="brute"?18:7)*dt*8);
 }
 for(const p of projectiles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(Math.hypot(p.x-player.x,p.y-player.y)<player.r+6) {p.life=0;hurt(p.damage)}}
 projectiles=projectiles.filter(p=>p.life>0);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.02,dt);p.vy*=Math.pow(.02,dt);p.life-=dt}
 particles=particles.filter(p=>p.life>0);slashes.forEach(s=>s.life-=dt);slashes=slashes.filter(s=>s.life>0);floats.forEach(f=>{f.y-=25*dt;f.life-=dt});floats=floats.filter(f=>f.life>0);
 if(waveKills>=8+wave*2){wave++;waveKills=0;showWave();if(wave%10===0)spawnBoss()}
 updateHUD();
}
function spawnBoss(){let e={x:W/2,y:-70,type:"boss",r:45,hp:1000+wave*180,maxHp:1000+wave*180,speed:38+wave*.3,hit:0,shoot:1};enemies.push(e);message("BOSS INCOMING",1.5)}
function showWave(){message("WAVE "+wave,1)}
let msgTimer=0;function message(t,d){$("message").textContent=t;$("message").style.opacity=1;msgTimer=d}
function updateHUD(){ $("wave").textContent=wave;$("kills").textContent=kills;$("time").textContent=formatTime(timeAlive);$("hpBar").style.width=Math.max(0,player.hp/player.maxHp*100)+"%";$("xpBar").style.width=Math.min(100,xp/xpNeed*100)+"%";$("specialBar").style.width=player.special+"%" }
function draw(){
 ctx.clearRect(0,0,W,H);ctx.save();let sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;shake*=.88;ctx.translate(sx,sy);
 let g=ctx.createRadialGradient(W/2,H/2,50,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,"#151329");g.addColorStop(1,"#030409");ctx.fillStyle=g;ctx.fillRect(-30,-30,W+60,H+60);
 ctx.globalAlpha=.5;for(const s of stars){ctx.fillStyle="#9b7cff";ctx.globalAlpha=s.a;ctx.fillRect(s.x*W,s.y*H,s.s,s.s)}ctx.globalAlpha=1;
 ctx.strokeStyle="rgba(150,90,230,.07)";ctx.lineWidth=1;let grid=70;for(let x=0;x<W;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 for(const p of projectiles){ctx.beginPath();ctx.arc(p.x,p.y,5,0,7);ctx.fillStyle="#ff5d8f";ctx.shadowBlur=15;ctx.shadowColor="#ff5d8f";ctx.fill();ctx.shadowBlur=0}
 for(const e of enemies)drawEnemy(e);
 for(const s of slashes){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.ang);ctx.globalAlpha=s.life/s.max;ctx.strokeStyle="#fff";ctx.shadowBlur=20;ctx.shadowColor="#b967ff";ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,0,55,-.9,.9);ctx.stroke();ctx.restore()}
 drawPlayer();
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.kind==="special"?"#3a86ff":p.kind==="dash"?"#b967ff":"#fff";ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill()}ctx.globalAlpha=1;
 for(const f of floats){ctx.globalAlpha=f.life;ctx.fillStyle="#fff";ctx.font="bold 14px Arial";ctx.textAlign="center";ctx.fillText(f.t,f.x,f.y)}ctx.restore();
 if(msgTimer>0){msgTimer-=.016;if(msgTimer<=0)$("message").style.opacity=0}
}
function drawPlayer(){if(!player)return;let p=player;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(mouse.y-p.y,mouse.x-p.x));ctx.globalAlpha=p.inv>0&&Math.floor(p.inv*20)%2===0?.35:1;
 ctx.shadowBlur=28;ctx.shadowColor="#9d4edd";ctx.fillStyle="#151322";ctx.beginPath();ctx.arc(0,0,p.r,0,7);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle="#b967ff";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(5,-6,3,0,7);ctx.arc(5,6,3,0,7);ctx.fill();
 ctx.strokeStyle="#ddd";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(48,0);ctx.stroke();ctx.strokeStyle="#b967ff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(18,-3);ctx.lineTo(50,-3);ctx.stroke();ctx.restore()}
function drawEnemy(e){ctx.save();ctx.translate(e.x,e.y);let c=e.type==="boss"?"#ff3d6e":e.type==="brute"?"#d94cff":e.type==="runner"?"#ffb84d":"#8d65ff";ctx.shadowBlur=e.type==="boss"?30:15;ctx.shadowColor=c;ctx.fillStyle="#100d19";ctx.beginPath();ctx.arc(0,0,e.r,0,7);ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=e.type==="boss"?4:2;ctx.stroke();ctx.shadowBlur=0;
 ctx.fillStyle=c;ctx.beginPath();ctx.arc(-e.r*.35,-3,3,0,7);ctx.arc(e.r*.35,-3,3,0,7);ctx.fill();
 if(e.type==="boss"){ctx.strokeStyle="#ff3d6e";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.r+8,0,7);ctx.stroke()}
 ctx.restore();if(e.type==="boss"||e.hp<e.maxHp){ctx.fillStyle="rgba(0,0,0,.5)";ctx.fillRect(e.x-e.r,e.y-e.r-12,e.r*2,4);ctx.fillStyle=e.type==="boss"?"#ff3d6e":"#b967ff";ctx.fillRect(e.x-e.r,e.y-e.r-12,e.r*2*Math.max(0,e.hp/e.maxHp),4)}}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);

$("startBtn").onclick=()=>reset();$("restartBtn").onclick=()=>reset();
addEventListener("keydown",e=>{if(state==="menu"&&e.key==="Enter")reset();if(state==="over"&&e.key==="Enter")reset()});
$("dashBtn").onclick=dash;$("specialBtn").onclick=special;
let touch={active:false,id:null,sx:0,sy:0};
$("stick").addEventListener("pointerdown",e=>{touch.active=true;touch.id=e.pointerId;touch.sx=e.clientX;touch.sy=e.clientY;$("stick").setPointerCapture(e.pointerId)});
$("stick").addEventListener("pointermove",e=>{if(!touch.active)return;let dx=e.clientX-touch.sx,dy=e.clientY-touch.sy,l=Math.min(45,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);let k=$("knob");k.style.transform=`translate(${Math.cos(a)*l}px,${Math.sin(a)*l}px)`;keys.w=dy<-10;keys.s=dy>10;keys.a=dx<-10;keys.d=dx>10});
$("stick").addEventListener("pointerup",()=>{touch.active=false;keys.w=keys.s=keys.a=keys.d=false;$("knob").style.transform="translate(0,0)"});
