const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=1;function resize(){DPR=1;W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);if(player){player.x=Math.max(25,Math.min(W-25,player.x));player.y=Math.max(25,Math.min(H-25,player.y))}}addEventListener('resize',resize);
const $=id=>document.getElementById(id),rand=(a,b)=>Math.random()*(b-a)+a,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const modes={easy:{name:'EASY',enemyHp:.72,enemySpeed:.82,spawn:.72,damage:.75,maxEnemies:12},medium:{name:'MEDIUM',enemyHp:1,enemySpeed:1,spawn:1,damage:1,maxEnemies:16},hard:{name:'HARD',enemyHp:1.42,enemySpeed:1.15,spawn:1.2,damage:1.3,maxEnemies:22},extreme:{name:'EXTREME',enemyHp:2.1,enemySpeed:1.38,spawn:1.5,damage:1.7,maxEnemies:28}};
const characters={ronin:{name:'RONIN',desc:'Armored astronaut swordsman · Blade Storm',icon:'⚔️',specialName:'BLADE STORM',speed:1,damage:1.12,hp:95,crit:.08,color:'#9b6cff',accent:'#61d8ff'},archer:{name:'KAZE',desc:'Scout astronaut · Arrow Rain',icon:'🏹',specialName:'ARROW RAIN',speed:1.12,damage:.9,hp:82,crit:.14,color:'#53d8ff',accent:'#a9ffdf'},cyber:{name:'VOLT',desc:'Tech astronaut · EMP Nova',icon:'⚡',specialName:'EMP NOVA',speed:.98,damage:1.02,hp:88,crit:.1,color:'#ff5bd6',accent:'#ffb45b'},shade:{name:'SHADE',desc:'Stealth astronaut · Shadow Blink',icon:'🗡️',specialName:'SHADOW BLINK',speed:1.18,damage:.96,hp:76,crit:.2,color:'#8d9cff',accent:'#fff'},ember:{name:'EMBER',desc:'Solar astronaut · Meteor Burst',icon:'🔥',specialName:'METEOR BURST',speed:1.04,damage:1.16,hp:86,crit:.07,color:'#ff7048',accent:'#ffd166'},frost:{name:'FROST',desc:'Cryo astronaut · Freeze Field',icon:'❄️',specialName:'FREEZE FIELD',speed:.9,damage:1.05,hp:112,crit:.06,color:'#72e7ff',accent:'#d9fbff'},luna:{name:'LUNA',desc:'Gravity astronaut · Vortex',icon:'🌙',specialName:'GRAVITY VORTEX',speed:1.08,damage:1.04,hp:84,crit:.12,color:'#c58cff',accent:'#ffe6ff'},ronin2:{name:'AKIRA',desc:'Twin-blade astronaut · Phantom Blades',icon:'🌸',specialName:'PHANTOM BLADES',speed:1.24,damage:.9,hp:78,crit:.16,color:'#ff77b7',accent:'#fff0f7'}};
const weapons={katana:{name:'KATANA',icon:'⚔️',desc:'Wide melee arc',type:'melee',damage:32,rate:.3,range:82,shots:1},bow:{name:'LONGBOW',icon:'🏹',desc:'Long-range piercing arrows',type:'projectile',damage:26,rate:.45,range:600,shots:1,projSpeed:900},blaster:{name:'BLASTER',icon:'🔫',desc:'Rapid energy bolts',type:'projectile',damage:14,rate:.12,range:620,shots:1,projSpeed:980},laser:{name:'LASER',icon:'🔴',desc:'Charged beam burst',type:'laser',damage:44,rate:.7,range:500,shots:1,projSpeed:1100},twin:{name:'TWIN BLADES',icon:'🗡️',desc:'Two fast slashes',type:'melee',damage:19,rate:.22,range:72,shots:2},scythe:{name:'VOID SCYTHE',icon:'☠️',desc:'Huge sweeping arc',type:'melee',damage:48,rate:.65,range:110,shots:1},chakram:{name:'CHAKRAM',icon:'☯️',desc:'Returning spinning blade',type:'projectile',damage:22,rate:.35,range:440,shots:1,projSpeed:760},staff:{name:'ARC STAFF',icon:'✨',desc:'Explosive magic orb',type:'projectile',damage:37,rate:.58,range:500,shots:1,projSpeed:720}};
let selectedMode='medium',selectedChar='ronin',selectedWeapon='katana';
function buildChoices(){const mr=$('modeRow');Object.entries(modes).forEach(([k,v])=>{let b=document.createElement('button');b.className='modeBtn '+(k===selectedMode?'selected':'');b.textContent=v.name;b.onclick=()=>{selectedMode=k;document.querySelectorAll('.modeBtn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};mr.appendChild(b)});const cc=$('characterChoices');Object.entries(characters).forEach(([k,v])=>{let d=document.createElement('button');d.className='choice '+(k===selectedChar?'selected':'');d.innerHTML=`<span class="icon">${v.icon}</span><strong>${v.name}</strong><small>${v.desc}</small>`;d.onclick=()=>{selectedChar=k;document.querySelectorAll('#characterChoices .choice').forEach(x=>x.classList.remove('selected'));d.classList.add('selected')};cc.appendChild(d)});const wc=$('weaponChoices');Object.entries(weapons).forEach(([k,v])=>{let d=document.createElement('button');d.className='choice '+(k===selectedWeapon?'selected':'');d.innerHTML=`<span class="icon">${v.icon}</span><strong>${v.name}</strong><small>${v.desc}</small>`;d.onclick=()=>{selectedWeapon=k;document.querySelectorAll('#weaponChoices .choice').forEach(x=>x.classList.remove('selected'));d.classList.add('selected')};wc.appendChild(d)})}buildChoices();
const keys={},mouse={x:W/2,y:H/2,down:false};addEventListener('keydown',e=>{if(state==='upgrade'&&['1','2','3'].includes(e.key)){selectUpgrade(Number(e.key)-1);return;}keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()===' ')special();if(e.key.toLowerCase()==='shift')dash();});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);canvas.onmousemove=e=>{mouse.x=e.clientX;mouse.y=e.clientY};canvas.onmousedown=e=>{if(state==='playing'&&e.button===0){mouse.down=true;attack();}};addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
let state='menu',player=null,enemies=[],shots=[],particles=[],slashes=[],floats=[],timeAlive=0,wave=1,kills=0,xp=0,xpNeed=55,spawnTimer=.2,shake=0,last=performance.now(),toastTimer=0,toastText='',upgradeOpening=false;let stars=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),s:rand(.4,1.8),a:rand(.12,.55)}));
let audioCtx=null,musicTimer=null,musicOn=true,musicMaster=null,sfxMaster=null,musicStep=0;
function ensureAudio(){
  if(!audioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    audioCtx=new AC();
    musicMaster=audioCtx.createGain(); musicMaster.gain.value=0; musicMaster.connect(audioCtx.destination);
    sfxMaster=audioCtx.createGain(); sfxMaster.gain.value=.14; sfxMaster.connect(audioCtx.destination);
  }
  if(audioCtx.state==='suspended')audioCtx.resume();
  return audioCtx;
}
function startMusic(){
  if(!musicOn)return;
  const ac=ensureAudio(); if(!ac)return;
  if(musicTimer)return;
  musicMaster.gain.cancelScheduledValues(ac.currentTime);
  musicMaster.gain.setTargetAtTime(.055,ac.currentTime,.08);
  const notes=[110,138.59,164.81,196,220,164.81,146.83,196,130.81,164.81,196,246.94];
  function tick(){
    if(!audioCtx||!musicOn)return;
    const o=ac.createOscillator(),g=ac.createGain();
    o.type='triangle'; o.frequency.value=notes[musicStep++%notes.length];
    g.gain.setValueAtTime(.0001,ac.currentTime); g.gain.exponentialRampToValueAtTime(.11,ac.currentTime+.025); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.48);
    o.connect(g);g.connect(musicMaster);o.start();o.stop(ac.currentTime+.5);
    musicTimer=setTimeout(()=>{musicTimer=null;tick()},500);
  }
  tick();
}
function stopMusic(){
  musicOn=false;
  if(musicTimer){clearTimeout(musicTimer);musicTimer=null;}
  if(audioCtx&&musicMaster){musicMaster.gain.cancelScheduledValues(audioCtx.currentTime);musicMaster.gain.setTargetAtTime(.0001,audioCtx.currentTime,.04);}
}
function sound(freq,duration=.08,type='sine',volume=.12){
  const ac=ensureAudio(); if(!ac||!sfxMaster)return;
  const o=ac.createOscillator(),g=ac.createGain(); o.type=type;o.frequency.setValueAtTime(freq,ac.currentTime);
  g.gain.setValueAtTime(.0001,ac.currentTime);g.gain.exponentialRampToValueAtTime(volume,ac.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);
  o.connect(g);g.connect(sfxMaster);o.start();o.stop(ac.currentTime+duration+.02);
}
function noiseBurst(duration=.06,volume=.05){const ac=ensureAudio();if(!ac||!sfxMaster)return;const n=Math.max(1,Math.floor(ac.sampleRate*duration)),buf=ac.createBuffer(1,n,ac.sampleRate),data=buf.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);const src=ac.createBufferSource(),g=ac.createGain();g.gain.value=volume;src.buffer=buf;src.connect(g);g.connect(sfxMaster);src.start();}
function weaponSound(){const w=player?.weapon; if(!w)return; if(w==='katana'){sound(145,.08,'sawtooth',.09);setTimeout(()=>sound(310,.05,'triangle',.045),25);}
else if(w==='bow'){sound(220,.07,'triangle',.07);setTimeout(()=>sound(720,.045,'sine',.045),35);}
else if(w==='blaster'){sound(95,.055,'square',.08);sound(430,.045,'square',.055);}
else if(w==='laser'){sound(80,.18,'sawtooth',.07);setTimeout(()=>sound(900,.12,'sine',.08),35);}
else if(w==='twin'){sound(180,.045,'square',.07);setTimeout(()=>sound(250,.045,'square',.06),55);}
else if(w==='scythe'){sound(75,.16,'sawtooth',.11);setTimeout(()=>sound(170,.1,'triangle',.07),60);noiseBurst(.08,.025);}
else if(w==='chakram'){sound(360,.1,'triangle',.06);sound(720,.07,'sine',.04);}
else if(w==='staff'){sound(180,.12,'sine',.07);setTimeout(()=>sound(520,.16,'triangle',.07),45);noiseBurst(.12,.02);}}
function hitSound(){sound(90+Math.random()*80,.045,'sawtooth',.045);}
function startGame(){startMusic();const c=characters[selectedChar],w=weapons[selectedWeapon];state='playing';upgradeOpening=false;$('upgrade').classList.add('hidden');timeAlive=0;wave=1;kills=0;xp=0;xpNeed=55;spawnTimer=.1;enemies=[];shots=[];particles=[];slashes=[];floats=[];player={x:W/2,y:H/2,r:17,hp:c.hp,maxHp:c.hp,speed:240*c.speed,damage:w.damage*c.damage,range:w.range,attackRate:w.rate,attackCd:0,dashCd:0,special:0,crit:c.crit,size:1,weapon:selectedWeapon,char:selectedChar,damageMult:1,shots:w.shots,aoe:1,specialPower:1,inv:0,level:1,projSpeed:w.projSpeed||720};$('heroName').textContent=c.name+' · '+w.name; $('specialText').textContent='0%'; $('specialHintText') && ($('specialHintText').innerHTML='Press <b>SPACE</b> · '+c.specialName);$('menu').classList.add('hidden');$('gameover').classList.add('hidden');$('hud').classList.remove('hidden');$('hud').classList.remove('specialReady');toast('WAVE 1 · SPACE = SPECIAL',1);}
$('startBtn').onclick=startGame;$('againBtn').onclick=()=>{$('gameover').classList.add('hidden');$('menu').classList.remove('hidden');$('hud').classList.add('hidden');state='menu'};
function toast(t,d=1){toastText=t;toastTimer=d;$('toast').textContent=t;$('toast').classList.remove('hidden')}
function burst(x,y,n,color){n=Math.min(n,12);if(particles.length>180)particles.splice(0,particles.length-180);for(let i=0;i<n;i++){let a=rand(0,Math.PI*2),s=rand(35,250);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.2,.65),max:.65,size:rand(1,4),color})}}
function spawnEnemy(){if(enemies.length>=modes[selectedMode].maxEnemies)return;let side=Math.floor(Math.random()*4),m=70,x=side===1?W+m:side===3?-m:rand(-m,W+m),y=side===0?-m:side===2?H+m:rand(-m,H+m);let r=Math.random(),type=r<.5?'grunt':r<.72?'runner':r<.9?'shooter':'brute';let model=type==='grunt'?(Math.random()<.5?'alien':'astronaut') : type==='runner'?'scoutship':type==='shooter'?'drone':'asteroid';let md=modes[selectedMode],s=1+wave*.055;let e={x,y,type,model,r:type==='brute'?25:type==='runner'?15:16,hp:32*s*md.enemyHp,maxHp:0,speed:(type==='runner'?155:type==='brute'?52:82)*md.enemySpeed,hit:0,shoot:rand(.8,1.8),freeze:0,rot:rand(0,6.28)};if(type==='brute')e.hp*=4;if(type==='shooter')e.hp*=1.25;e.maxHp=e.hp;enemies.push(e)}
function nearest(){let best=null,bd=1e9;for(const e of enemies){let d=Math.hypot(e.x-player.x,e.y-player.y);if(d<bd){bd=d;best=e}}return best}
function attack(){if(state!=='playing'||player.attackCd>0)return;player.attackCd=player.attackRate;weaponSound();let w=weapons[player.weapon],c=characters[player.char],a=Math.atan2(mouse.y-player.y,mouse.x-player.x),damage=player.damage*player.damageMult*(Math.random()<player.crit?2.2:1);if(w.type==='melee'){for(let i=0;i<player.shots;i++){let aa=a+(i-(player.shots-1)/2)*.25;slashes.push({x:player.x,y:player.y,a:aa,life:.16,max:.16,range:player.range*player.size,damage});for(const e of enemies){let dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy),da=Math.atan2(dy,dx),diff=Math.atan2(Math.sin(da-aa),Math.cos(da-aa));if(d<player.range*player.size+e.r&&Math.abs(diff)<.72){if(hitEnemy(e,damage))return}}}burst(player.x+Math.cos(a)*35,player.y+Math.sin(a)*35,8,c.color)}else{for(let i=0;i<player.shots;i++){let aa=a+(i-(player.shots-1)/2)*.12;const speed=player.projSpeed; const travelRange=player.range; shots.push({x:player.x,y:player.y,vx:Math.cos(aa)*speed,vy:Math.sin(aa)*speed,life:travelRange/speed,damage,kind:player.weapon,rad:player.weapon==='laser'?5:4,pierce:player.weapon==='chakram'?2:0,maxTravel:travelRange});}burst(player.x,player.y,4,c.accent)}}
function hitEnemy(e,dmg){e.hp-=dmg;hitSound();e.hit=.09;floats.push({x:e.x,y:e.y-20,text:Math.round(dmg),life:.55});burst(e.x,e.y,5,characters[player.char].accent);shake=Math.min(12,shake+3);if(e.hp<=0)return killEnemy(e);return false}
function killEnemy(e){
  let i=enemies.indexOf(e);
  if(i<0)return false;
  enemies.splice(i,1);
  kills++;
  sound(e.type==='boss'?65:130,.12,'square',e.type==='boss'?.14:.06);
  xp+=e.type==='brute'||e.type==='boss'?18:7;
  player.special=clamp(player.special+(e.type==='brute'||e.type==='boss'?20:7)*player.specialPower,0,100);
  burst(e.x,e.y,8,e.type==='brute'||e.type==='boss'?'#ff5bcb':characters[player.char].color);
  if(xp>=xpNeed && !upgradeOpening){
    xp-=xpNeed;
    xpNeed=Math.floor(xpNeed*1.18);
    player.level++;
    upgradeOpening=true;
    openUpgrade();
    return true;
  }
  return false;
}
function openUpgrade(){
  if(state!=='playing' || !player)return;
  state='upgrade';
  $('upgrade').classList.remove('hidden');
  const box=$('upgradeChoices');
  box.innerHTML='';
  const pool=[
    ['⚔️','POWER','Damage +18%','damageMult',.18],
    ['🎯','CRIT','Critical chance +8%','crit',.08],
    ['💥','SIZE',player.weapon==='katana'||player.weapon==='twin'||player.weapon==='scythe'?'Attack arc size +18%':'Projectile size +18%','size',.18],
    ['⚡','RAPID','Attack speed +14%','attackRate',-.14],
    ['💙','VITALITY','Max HP +18','maxHp',18],
    ['💨','MOBILITY','Move speed +12%','speed',.12],
    ['✨','SPECIAL','Special damage +20%','specialPower',.2]
  ];
  // RANGE is useful for melee arcs, but ranged weapons already have a defined firing distance.
  // For ranged weapons, offer projectile speed instead so every upgrade has a visible effect.
  if(weapons[player.weapon].type==='melee') pool.push(['📡','ARC REACH','Attack arc range +12%','range',.12]);
  else pool.push(['🚀','VELOCITY','Projectile speed +12%','projSpeed',.12]);
  pool.sort(()=>Math.random()-.5).slice(0,3).forEach(u=>{
    let d=document.createElement('div');
    d.className='upgradeCard';
    d.dataset.index=box.children.length;
    d.innerHTML=`<div class="keyBadge">${box.children.length+1}</div><div class="uicon">${u[0]}</div><h3>${u[1]}</h3><p>${u[2]}</p><small>PRESS ${box.children.length+1}</small>`;
    d._upgrade=u;
    box.appendChild(d);
  });
  // Force the browser to paint the upgrade screen before gameplay can continue.
  requestAnimationFrame(()=>{
    if(state==='upgrade')$('upgrade').classList.remove('hidden');
  });
}
function selectUpgrade(index){if(state!=='upgrade')return;const cards=document.querySelectorAll('#upgradeChoices .upgradeCard');const card=cards[index];if(!card)return;const u=card._upgrade;if(!u)return;applyUpgrade(u);mouse.down=false;$('upgrade').classList.add('hidden');upgradeOpening=false;state='playing';toast('UPGRADE ACQUIRED',.8)}
function dash(){if(state!=='playing'||!player||player.dashCd>0)return;let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),len=Math.hypot(dx,dy);if(!len)return;dx/=len;dy/=len;player.dashCd=1.05;player.inv=.25;player.x=clamp(player.x+dx*115,25,W-25);player.y=clamp(player.y+dy*115,25,H-25);burst(player.x,player.y,8,'#77e0ff');sound(190,.12,'sawtooth',.11);sound(380,.08,'triangle',.07)}
function applyUpgrade(u){let p=player;if(u[3]==='damageMult')p.damageMult+=u[4];else if(u[3]==='crit')p.crit=clamp(p.crit+u[4],0,.65);else if(u[3]==='range')p.range*=1+u[4];else if(u[3]==='size')p.size*=1+u[4];else if(u[3]==='attackRate')p.attackRate=Math.max(.06,p.attackRate*(1+u[4]));else if(u[3]==='maxHp'){p.maxHp+=u[4];p.hp=Math.min(p.maxHp,p.hp+u[4])}else if(u[3]==='speed')p.speed*=1+u[4];else if(u[3]==='specialPower')p.specialPower+=u[4];else if(u[3]==='projSpeed')p.projSpeed*=1+u[4]}
function special(){if(state!=='playing'||player.special<100)return;player.special=0;const c=characters[player.char],d=player.damage*player.specialPower,a=Math.atan2(mouse.y-player.y,mouse.x-player.x);shake=18;burst(player.x,player.y,24,c.color);toast(c.specialName+'!',.9);
if(player.char==='ronin'){sound(110,.2,'sawtooth',.13);for(let k=0;k<3;k++){setTimeout(()=>{slashes.push({x:player.x,y:player.y,a:a+k*2.1,life:.45,max:.45,range:210*player.size,damage:d*2.2});for(const e of [...enemies]){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<220*player.size)hitEnemy(e,d*1.7)}},k*90)}}
else if(player.char==='archer'){sound(680,.12,'triangle',.1);for(let i=0;i<26;i++){let aa=rand(0,Math.PI*2),dist=rand(70,380);shots.push({x:player.x+Math.cos(aa)*dist,y:player.y+Math.sin(aa)*dist-260,vx:0,vy:900,life:.7,damage:d*2.1,kind:'arrowRain',rad:6,pierce:2,maxTravel:700})}}
else if(player.char==='cyber'){sound(70,.3,'square',.13);sound(420,.24,'sine',.09);for(const e of [...enemies]){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<260){hitEnemy(e,d*2.8);e.freeze=.8}}burst(player.x,player.y,45,c.accent)}
else if(player.char==='shade'){sound(260,.08,'triangle',.1);let nx=clamp(player.x+Math.cos(a)*190,35,W-35),ny=clamp(player.y+Math.sin(a)*190,35,H-35);burst(player.x,player.y,20,'#ffffff');player.x=nx;player.y=ny;player.inv=.7;for(const e of [...enemies]){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<150)hitEnemy(e,d*3.8)}slashes.push({x:player.x,y:player.y,a,life:.45,max:.45,range:150,damage:d*3})}
else if(player.char==='ember'){sound(55,.24,'sawtooth',.12);for(let i=0;i<8;i++){let tx=clamp(mouse.x+rand(-180,180),30,W-30),ty=clamp(mouse.y+rand(-180,180),30,H-30);shots.push({x:tx,y:ty-380,vx:0,vy:780,life:.6,damage:d*3,kind:'meteor',rad:16,pierce:4,maxTravel:500})}}
else if(player.char==='frost'){sound(210,.3,'sine',.12);sound(840,.18,'triangle',.08);for(const e of enemies){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<300){e.freeze=3;hitEnemy(e,d*1.9)}}burst(player.x,player.y,55,'#9ff7ff')}
else if(player.char==='luna'){sound(120,.35,'sine',.12);for(const e of enemies){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<360){e.vortex=2.2;hitEnemy(e,d*2.4)}}burst(player.x,player.y,40,'#d6b7ff')}
else {sound(300,.12,'square',.1);for(let k=0;k<2;k++){let aa=a+(k?Math.PI/2:-Math.PI/2);shots.push({x:player.x,y:player.y,vx:Math.cos(aa)*650,vy:Math.sin(aa)*650,life:1.1,damage:d*2.6,kind:'phantom',rad:10,pierce:6,maxTravel:700})}}
}
function hurt(d){if(player.inv>0)return;player.hp-=d;sound(70,.18,'sawtooth',.13);modes[selectedMode];player.inv=.45;shake=14;burst(player.x,player.y,10,'#ff527f');if(player.hp<=0)endGame()}
function endGame(){state='gameover';$('hud').classList.add('hidden');$('gameover').classList.remove('hidden');$('finalWave').textContent=wave;$('finalKills').textContent=kills;$('finalTime').textContent=fmt(timeAlive)}
function fmt(t){let m=Math.floor(t/60).toString().padStart(2,'0'),s=Math.floor(t%60).toString().padStart(2,'0');return m+':'+s}
function update(dt){if(state!=='playing')return;timeAlive+=dt;player.attackCd-=dt;player.dashCd-=dt;player.inv-=dt;spawnTimer-=dt;shake*=.88;if(spawnTimer<=0){spawnTimer=Math.max(.08,.62/modes[selectedMode].spawn/(1+wave*.035));spawnEnemy();if(Math.random()<Math.min(.45,wave*.012))spawnEnemy()}if(waveKillsForNext())nextWave();let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),len=Math.hypot(dx,dy)||1;player.x=clamp(player.x+dx/len*player.speed*dt,25,W-25);player.y=clamp(player.y+dy/len*player.speed*dt,25,H-25);if(mouse.down)attack();for(const e of enemies){e.freeze=Math.max(0,(e.freeze||0)-dt);let a=Math.atan2(player.y-e.y,player.x-e.x),d=Math.hypot(player.x-e.x,player.y-e.y);let slow=e.freeze>0?.12:1;if(e.vortex>0){e.vortex-=dt;let pull=Math.max(0,1-d/420);e.x+=(player.x-e.x)*pull*.9*dt;e.y+=(player.y-e.y)*pull*.9*dt}if(e.type==='shooter'){e.shoot-=dt;if(d>270){e.x+=Math.cos(a)*e.speed*dt*slow;e.y+=Math.sin(a)*e.speed*dt*slow}if(e.shoot<=0&&e.freeze<=0){e.shoot=1.7;e.hitShot=true;if(shots.length<70)shots.push({x:e.x,y:e.y,vx:Math.cos(a)*250,vy:Math.sin(a)*250,life:2,damage:9*modes[selectedMode].damage,kind:'enemy',rad:5,pierce:0})}}else{e.x+=Math.cos(a)*e.speed*dt*slow;e.y+=Math.sin(a)*e.speed*dt*slow}if(d<e.r+player.r){hurt((e.type==='brute'?20:8)*modes[selectedMode].damage);e.x-=Math.cos(a)*18;e.y-=Math.sin(a)*18}}for(let i=shots.length-1;i>=0;i--){let s=shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;let rem=false;if(s.kind==='enemy'&&Math.hypot(s.x-player.x,s.y-player.y)<player.r+s.rad){hurt(s.damage);rem=true}else if(s.kind!=='enemy'){for(const e of [...enemies]){if(Math.hypot(s.x-e.x,s.y-e.y)<s.rad+e.r){if(hitEnemy(e,s.damage)){rem=true;break}if(s.pierce>0)s.pierce--;else{rem=true;break}}}}if(rem||s.life<=0||s.x<-50||s.x>W+50||s.y<-50||s.y>H+50)shots.splice(i,1);if(state==='upgrade')break}if(state==='upgrade'){syncHud();return}for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;if(p.life<=0)particles.splice(i,1)}for(let i=slashes.length-1;i>=0;i--){slashes[i].life-=dt;if(slashes[i].life<=0)slashes.splice(i,1)}for(let i=floats.length-1;i>=0;i--){floats[i].y-=20*dt;floats[i].life-=dt;if(floats[i].life<=0)floats.splice(i,1)}if(particles.length>180)particles.length=180;if(shots.length>80)shots.length=80;if(floats.length>60)floats.length=60;syncHud();if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.add('hidden')}}
function syncHud(){if(!player)return;$('hud').classList.toggle('specialReady',player.special>=100);$('hpFill').style.width=clamp(player.hp/player.maxHp*100,0,100)+'%';$('xpFill').style.width=clamp(xp/xpNeed*100,0,100)+'%';$('specialFill').style.width=player.special+'%';$('specialText').textContent=player.special>=100?'READY · '+characters[player.char].specialName:Math.floor(player.special)+'%';$('wave').textContent=wave;$('kills').textContent=kills;$('time').textContent=fmt(timeAlive)}
function waveKillsForNext(){let target=12+wave*4;return kills>=target}
function nextWave(){wave++;toast('WAVE '+wave,1);for(let i=0;i<Math.min(3+Math.floor(wave/4),8);i++)spawnEnemy();if(wave%5===0)spawnBoss()}
function spawnBoss(){let side=Math.floor(Math.random()*4),x=side===1?W+80:side===3?-80:rand(0,W),y=side===0?-80:side===2?H+80:rand(0,H);let hp=(700+wave*110)*modes[selectedMode].enemyHp;enemies.push({x,y,type:'boss',r:52,hp,maxHp:hp,speed:42*modes[selectedMode].enemySpeed,hit:0,shoot:1.2});toast('BOSS INCOMING',1.5)}
function glowCircle(x,y,r,color,alpha=.16){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=r*.55;ctx.beginPath();ctx.arc(x,y,r*.55,0,Math.PI*2);ctx.fill();ctx.restore()}
function draw(){ctx.save();let sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;ctx.translate(sx,sy);
  ctx.fillStyle='#050611';ctx.fillRect(-30,-30,W+60,H+60);
  const grd=ctx.createRadialGradient(W*.5,H*.52,40,W*.5,H*.52,Math.max(W,H)*.7);grd.addColorStop(0,'#0d1025');grd.addColorStop(1,'#04050e');ctx.fillStyle=grd;ctx.fillRect(-30,-30,W+60,H+60);
  ctx.strokeStyle='rgba(111,92,255,.08)';ctx.lineWidth=1;let gs=54;for(let x=(Math.floor(-sx/gs)-1)*gs;x<W+gs;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=(Math.floor(-sy/gs)-1)*gs;y<H+gs;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  for(const st of stars){ctx.fillStyle=`rgba(180,170,255,${st.a})`;ctx.fillRect(st.x*W,st.y*H,st.s,st.s)}
  // subtle arena rings
  ctx.save();ctx.translate(W/2,H/2);ctx.strokeStyle='rgba(115,95,255,.045)';for(let r=150;r<Math.max(W,H);r+=170){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke()}ctx.restore();
  for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=Math.min(12,p.size*3);ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.shadowBlur=0;
  for(const s of shots){let col=s.kind==='enemy'?'#ff527f':s.kind==='special'?'#e5d6ff':characters[player?.char||'ronin'].accent;ctx.save();ctx.translate(s.x,s.y);let ang=Math.atan2(s.vy,s.vx);ctx.rotate(ang);ctx.strokeStyle=col;ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=14;
    if(s.kind==='bow'){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(8,0);ctx.stroke();ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(2,-5);ctx.moveTo(8,0);ctx.lineTo(2,5);ctx.stroke()}
    else if(s.kind==='chakram'){ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.stroke()}
    else if(s.kind==='laser'){ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(9,0);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-10,-3);ctx.lineTo(10,-3);ctx.moveTo(-10,3);ctx.lineTo(10,3);ctx.stroke()}
    else if(s.kind==='arrowRain'){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-3,-14);ctx.lineTo(0,12);ctx.stroke();ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(-5,5);ctx.moveTo(0,12);ctx.lineTo(5,5);ctx.stroke()}
    else if(s.kind==='meteor'){ctx.fillStyle='#ff8c42';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-28,0);ctx.stroke()}
    else if(s.kind==='phantom'){ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-11,-6);ctx.lineTo(11,6);ctx.moveTo(-11,6);ctx.lineTo(11,-6);ctx.stroke()}
    else if(s.kind==='special'){ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(12,0);ctx.stroke();ctx.beginPath();ctx.arc(4,0,5,0,Math.PI*2);ctx.stroke()}
    else {ctx.lineWidth=s.rad*1.7;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(10,0);ctx.stroke();ctx.beginPath();ctx.arc(10,0,2,0,Math.PI*2);ctx.fill()}
    ctx.restore()}
  for(const e of enemies)drawEnemy(e);if(player)drawPlayer();
  for(const f of floats){ctx.globalAlpha=f.life/.55;ctx.fillStyle='#fff';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText(f.text,f.x,f.y)}ctx.restore()}
function drawEnemy(e){let col=e.type==='boss'?'#ff3fcf':e.type==='brute'?'#ff784f':e.type==='runner'?'#56d8ff':e.type==='shooter'?'#ffbf55':e.model==='astronaut'?'#8e73ff':'#62e6a8';let hit=e.hit>0;ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=hit?.82:1;ctx.shadowColor=col;ctx.shadowBlur=e.type==='boss'?28:14;ctx.fillStyle='#070b15';ctx.strokeStyle=col;ctx.lineWidth=e.type==='boss'?4:2;
if(e.type==='boss'){ctx.rotate(performance.now()/1300);ctx.beginPath();for(let i=0;i<12;i++){let a=i*Math.PI/6,r=i%2?e.r*.62:e.r;let x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-performance.now()/1300);ctx.fillStyle='#ff8fe4';ctx.beginPath();ctx.arc(0,0,e.r*.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 9px system-ui';ctx.textAlign='center';ctx.fillText('MOTHERSHIP',0,4)}
else if(e.model==='scoutship'){ctx.rotate(Math.atan2(player.y-e.y,player.x-e.x));ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(3,-10);ctx.lineTo(-20,-7);ctx.lineTo(-12,0);ctx.lineTo(-20,7);ctx.lineTo(3,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(2,0,7,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(8,-1,5,2)}
else if(e.model==='drone'){ctx.rotate(e.rot+performance.now()/1000);ctx.beginPath();ctx.arc(0,0,e.r*.75,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){let a=i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*e.r*.75,Math.sin(a)*e.r*.75,5,0,Math.PI*2);ctx.fill();ctx.stroke()}ctx.fillStyle='#ff5b75';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill()}
else if(e.model==='asteroid'){ctx.rotate(e.rot);ctx.beginPath();for(let i=0;i<9;i++){let a=i*Math.PI*2/9,r=e.r*(.72+((i*7)%4)/10);let x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ff9c61';ctx.beginPath();ctx.arc(-6,-5,3,0,Math.PI*2);ctx.arc(7,5,2,0,Math.PI*2);ctx.fill()}
else if(e.model==='astronaut'){ctx.beginPath();ctx.arc(0,-4,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ccefff';ctx.beginPath();ctx.ellipse(2,-5,7,5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.stroke();ctx.fillStyle='#141a2a';ctx.fillRect(-10,7,20,12);ctx.strokeRect(-10,7,20,12);ctx.fillStyle=col;ctx.fillRect(-15,9,5,10);ctx.fillRect(10,9,5,10);ctx.fillStyle='#ff5b77';ctx.beginPath();ctx.arc(0,12,2,0,Math.PI*2);ctx.fill()}
else {ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(-5,-2,2.5,0,Math.PI*2);ctx.arc(5,-2,2.5,0,Math.PI*2);ctx.fill()}
ctx.restore();if(e.hp<e.maxHp){ctx.fillStyle='#0009';ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2,4);ctx.fillStyle=col;ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2*clamp(e.hp/e.maxHp,0,1),4)}if(e.freeze>0){ctx.strokeStyle='#b8f7ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+5,0,Math.PI*2);ctx.stroke()}}
function drawPlayer(){let c=characters[player.char],a=Math.atan2(mouse.y-player.y,mouse.x-player.x),t=performance.now()/1000;ctx.save();ctx.translate(player.x,player.y);ctx.rotate(a);ctx.globalAlpha=player.inv>0?.55:1;glowCircle(0,0,player.r*2.8,c.color,.13);ctx.shadowColor=c.color;ctx.shadowBlur=18;
// Astronaut suit
ctx.fillStyle='#0a1020';ctx.strokeStyle=c.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(-13,0,26,22,7);ctx.fill();ctx.stroke();
// life-support backpack
ctx.fillStyle='#18253a';ctx.fillRect(-18,3,5,16);ctx.fillRect(13,3,5,16);ctx.strokeStyle='#5f7fa5';ctx.lineWidth=1;ctx.strokeRect(-18,3,5,16);ctx.strokeRect(13,3,5,16);
// helmet
ctx.fillStyle='#10182a';ctx.strokeStyle=c.accent;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,-8,13,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#bfefff';ctx.globalAlpha*=.9;ctx.beginPath();ctx.ellipse(3,-9,9,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=player.inv>0?.55:1;
// visor tint / identity
if(player.char==='ronin'){ctx.fillStyle=c.color;ctx.fillRect(-9,-11,18,3);ctx.strokeStyle=c.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(7,5);ctx.lineTo(34,5);ctx.stroke();}
else if(player.char==='archer'){ctx.strokeStyle=c.accent;ctx.lineWidth=2;ctx.beginPath();ctx.arc(14,3,14,-1.05,1.05);ctx.stroke();ctx.beginPath();ctx.moveTo(2,3);ctx.lineTo(29,3);ctx.stroke();}
else if(player.char==='cyber'){ctx.fillStyle=c.accent;ctx.fillRect(6,-2,23,6);ctx.fillStyle='#fff';ctx.fillRect(17,-1,5,2);ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(-14,8,4,0,Math.PI*2);ctx.fill();}
else if(player.char==='shade'){ctx.fillStyle='#080b18';ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(12,8);ctx.lineTo(0,13);ctx.lineTo(-12,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(9,5);ctx.lineTo(33,-5);ctx.stroke();}
else if(player.char==='ember'){ctx.fillStyle='#ffb23e';ctx.beginPath();ctx.moveTo(0,12);ctx.quadraticCurveTo(-9,2,0,-5);ctx.quadraticCurveTo(9,2,0,12);ctx.fill();ctx.strokeStyle=c.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(9,4);ctx.lineTo(31,4);ctx.stroke();}
else if(player.char==='frost'){ctx.strokeStyle=c.accent;ctx.lineWidth=2;for(let i=0;i<6;i++){let aa=i*Math.PI/3;ctx.beginPath();ctx.moveTo(Math.cos(aa)*4,10+Math.sin(aa)*4);ctx.lineTo(Math.cos(aa)*22,10+Math.sin(aa)*4);ctx.stroke();}}
else if(player.char==='luna'){ctx.fillStyle='#11152c';ctx.beginPath();ctx.arc(5,-11,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle=c.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(10,7);ctx.lineTo(31,-13);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(31,-13,4,0,Math.PI*2);ctx.fill();}
else {ctx.strokeStyle=c.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(8,4);ctx.lineTo(31,12);ctx.moveTo(8,8);ctx.lineTo(28,-4);ctx.stroke();}
ctx.rotate(-a);ctx.fillStyle=c.accent;ctx.shadowColor=c.accent;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(0,8,3,0,Math.PI*2);ctx.fill();ctx.restore();
for(const s of slashes){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);ctx.globalAlpha=s.life/s.max;ctx.strokeStyle=characters[player.char].accent;ctx.shadowColor=characters[player.char].accent;ctx.shadowBlur=18;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,s.range,-.78,.78);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,s.range-6,-.65,.65);ctx.stroke();ctx.restore()}}
function loop(t){let dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;update(dt);draw();requestAnimationFrame(loop)}resize();requestAnimationFrame(loop);
