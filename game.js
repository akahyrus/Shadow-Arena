const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=1;function resize(){DPR=1;W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);if(player){player.x=Math.max(25,Math.min(W-25,player.x));player.y=Math.max(25,Math.min(H-25,player.y))}}addEventListener('resize',resize);
const $=id=>document.getElementById(id),rand=(a,b)=>Math.random()*(b-a)+a,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const assetImages={characters:{},weapons:{},effects:{}};
function loadAssetGroup(group,names){for(const n of names){const im=new Image();im.src=`assets/${group}/${n}.svg`;assetImages[group][n]=im}}
loadAssetGroup('characters',['cosmic_paladin','void_stalker','volt','solar_nova']);
loadAssetGroup('weapons',['gravity_saber','star_launcher','nebula_cannon','quantum_rifle','dual_ion_daggers','black_hole_scythe','asteroid_rings','gamma_staff']);
loadAssetGroup('effects',['pulse_slam','cluster_shot','vortex_blast','targeting_matrix','speed_dance','singularity_pull','asteroid_shower','gamma_shield']);
const charAsset={paladin:'cosmic_paladin',stalker:'void_stalker',volt:'volt',solar:'solar_nova'};
const weaponAsset={gravitySaber:'gravity_saber',starLauncher:'star_launcher',nebulaCannon:'nebula_cannon',quantumRifle:'quantum_rifle',ionDaggers:'dual_ion_daggers',blackHoleScythe:'black_hole_scythe',asteroidRings:'asteroid_rings',gammaStaff:'gamma_staff'};
const specialAsset={pulseSlam:'pulse_slam',gammaShield:'gamma_shield',voidBarrage:'cluster_shot',singularityPull:'singularity_pull',chainLightning:'speed_dance',targetingMatrix:'targeting_matrix',meteorShower:'asteroid_shower',solarFlare:'gamma_shield'};
const modes={easy:{name:'EASY',enemyHp:.72,enemySpeed:.82,spawn:.72,damage:.75,maxEnemies:12},medium:{name:'MEDIUM',enemyHp:1,enemySpeed:1,spawn:1,damage:1,maxEnemies:16},hard:{name:'HARD',enemyHp:1.42,enemySpeed:1.15,spawn:1.2,damage:1.3,maxEnemies:22},extreme:{name:'EXTREME',enemyHp:2.1,enemySpeed:1.38,spawn:1.5,damage:1.7,maxEnemies:28}};
const characters={
  paladin:{name:'COSMIC PALADIN',desc:'Heavy galactic defender',icon:'🛡️',speed:.9,damage:1.08,hp:120,crit:.06,color:'#48c7ff',accent:'#ffd36a',specials:['pulseSlam','gammaShield']},
  stalker:{name:'VOID STALKER',desc:'Stealth space hunter',icon:'🕶️',speed:1.15,damage:1.04,hp:82,crit:.16,color:'#9b6cff',accent:'#e7c8ff',specials:['voidBarrage','singularityPull']},
  volt:{name:'VOLT',desc:'Advanced energy soldier',icon:'⚡',speed:1.04,damage:1.02,hp:94,crit:.1,color:'#55e7ff',accent:'#ff63d8',specials:['chainLightning','targetingMatrix']},
  solar:{name:'SOLAR NOVA',desc:'Plasma assault astronaut',icon:'☀️',speed:1,damage:1.18,hp:92,crit:.08,color:'#ff7048',accent:'#ffd166',specials:['meteorShower','solarFlare']}
};
const weapons={
  gravitySaber:{name:'GRAVITY SABER',icon:'⚔️',desc:'Weighted energy blade',type:'melee',damage:38,rate:.34,range:88,shots:1},
  starLauncher:{name:'STAR-LAUNCHER',icon:'🚀',desc:'High-velocity plasma bolts',type:'projectile',damage:24,rate:.22,range:620,shots:1,projSpeed:1050},
  nebulaCannon:{name:'NEBULA CANNON',icon:'🌌',desc:'Slow explosive rounds',type:'projectile',damage:48,rate:.72,range:540,shots:1,projSpeed:610,blast:78},
  quantumRifle:{name:'QUANTUM RIFLE',icon:'🎯',desc:'Long-range phase beam',type:'laser',damage:52,rate:.68,range:760,shots:1,projSpeed:1250,pierce:4},
  ionDaggers:{name:'DUAL ION DAGGERS',icon:'🗡️',desc:'Rapid ion-charged cuts',type:'melee',damage:20,rate:.18,range:76,shots:2},
  blackHoleScythe:{name:'BLACK HOLE SCYTHE',icon:'☄️',desc:'Wide dark-matter sweep',type:'melee',damage:56,rate:.7,range:118,shots:1},
  asteroidRings:{name:'ASTEROID RINGS',icon:'🪐',desc:'Guided orbital projectiles',type:'projectile',damage:28,rate:.4,range:520,shots:3,projSpeed:700,pierce:1},
  gammaStaff:{name:'GAMMA STAFF',icon:'☢️',desc:'Area-effect gamma burst',type:'projectile',damage:34,rate:.52,range:500,shots:1,projSpeed:680,blast:62}
};
const specials={
  pulseSlam:{name:'PULSE SLAM',char:'paladin',icon:'💥',desc:'Smash the ground and blast every nearby enemy outward.',color:'#7fe7ff'},
  gammaShield:{name:'GAMMA SHIELD',char:'paladin',icon:'🛡️',desc:'Become invulnerable and damage enemies that touch the shield.',color:'#65eaff'},
  voidBarrage:{name:'VOID BARRAGE',char:'stalker',icon:'➤',desc:'Fire a dense volley of phase bolts in one direction.',color:'#b98cff'},
  singularityPull:{name:'SINGULARITY PULL',char:'stalker',icon:'🌀',desc:'Create a black hole at the aim point that drags enemies inward.',color:'#d6a6ff'},
  chainLightning:{name:'CHAIN LIGHTNING',char:'volt',icon:'⚡',desc:'Arc electricity through multiple enemies one after another.',color:'#63f6ff'},
  targetingMatrix:{name:'TARGETING MATRIX',char:'volt',icon:'⌖',desc:'Lock every enemy in range, then fire a synchronized strike.',color:'#ff66dc'},
  meteorShower:{name:'METEOR SHOWER',char:'solar',icon:'☄️',desc:'Call a storm of burning meteors onto the aim area.',color:'#ff9a4d'},
  solarFlare:{name:'SOLAR FLARE',char:'solar',icon:'☀️',desc:'Release a giant expanding plasma ring across the arena.',color:'#ffd166'}
};
let selectedMode='medium',selectedChar='paladin',selectedWeapon='gravitySaber',selectedSpecial='pulseSlam';
function buildChoices(){
  const mr=$('modeRow');mr.innerHTML='';
  Object.entries(modes).forEach(([k,v])=>{let b=document.createElement('button');b.className='modeBtn '+(k===selectedMode?'selected':'');b.textContent=v.name;b.onclick=()=>{selectedMode=k;document.querySelectorAll('.modeBtn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};mr.appendChild(b)});
  const cc=$('characterChoices');cc.innerHTML='';
  Object.entries(characters).forEach(([k,v])=>{let d=document.createElement('button');d.className='choice '+(k===selectedChar?'selected':'');d.innerHTML=`<span class="assetThumb charThumb"><img src="assets/characters/${charAsset[k]}.svg" alt=""></span><strong>${v.name}</strong><small>${v.desc}</small>`;d.onclick=()=>{selectedChar=k;selectedSpecial=characters[k].specials[0];refreshSelections()};cc.appendChild(d)});
  const wc=$('weaponChoices');wc.innerHTML='';
  Object.entries(weapons).forEach(([k,v])=>{let d=document.createElement('button');d.className='choice '+(k===selectedWeapon?'selected':'');d.innerHTML=`<span class="assetThumb weaponThumb"><img src="assets/weapons/${weaponAsset[k]}.svg" alt=""></span><strong>${v.name}</strong><small>${v.desc}</small>`;d.onclick=()=>{selectedWeapon=k;refreshSelections()};wc.appendChild(d)});
  const sc=$('specialChoices');sc.innerHTML='';
  Object.entries(specials).forEach(([k,v])=>{let c=characters[v.char];let d=document.createElement('button');d.className='choice specialChoice '+(k===selectedSpecial?'selected':'');d.dataset.char=v.char;d.innerHTML=`<span class="assetThumb effectThumb"><img src="assets/effects/${specialAsset[k]}.svg" alt=""></span><strong>${v.name}</strong><small>${c.name} · ${v.desc}</small>`;d.onclick=()=>{selectedSpecial=k;selectedChar=v.char;refreshSelections()};sc.appendChild(d)});
}
function refreshSelections(){
  document.querySelectorAll('#characterChoices .choice').forEach(x=>x.classList.toggle('selected',x.querySelector('strong')?.textContent===characters[selectedChar].name));
  document.querySelectorAll('#weaponChoices .choice').forEach((x,i)=>x.classList.toggle('selected',Object.keys(weapons)[i]===selectedWeapon));
  document.querySelectorAll('#specialChoices .choice').forEach(x=>x.classList.toggle('selected',x.dataset.char===selectedChar && x.querySelector('strong')?.textContent===specials[selectedSpecial].name));
}
buildChoices();
const keys={},mouse={x:W/2,y:H/2,down:false};addEventListener('keydown',e=>{if(state==='upgrade'&&['1','2','3'].includes(e.key)){selectUpgrade(Number(e.key)-1);return;}keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()===' ')special();if(e.key.toLowerCase()==='shift')dash();});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);canvas.onmousemove=e=>{mouse.x=e.clientX;mouse.y=e.clientY};canvas.onmousedown=e=>{if(state==='playing'&&e.button===0){mouse.down=true;attack();}};addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
let state='menu',player=null,enemies=[],shots=[],particles=[],slashes=[],floats=[],timeAlive=0,wave=1,kills=0,xp=0,xpNeed=55,spawnTimer=.2,shake=0,last=performance.now(),toastTimer=0,toastText='',upgradeOpening=false;let stars=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),s:rand(.4,1.8),a:rand(.12,.55)}));
let audioCtx=null,musicTimer=null,musicOn=true,musicMaster=null,sfxMaster=null,musicStep=0,runToken=0;
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
function weaponSound(){const w=player?.weapon; if(!w)return; if(w==='gravitySaber'){sound(145,.08,'sawtooth',.09);setTimeout(()=>sound(310,.05,'triangle',.045),25);}
else if(w==='starLauncher'){sound(220,.07,'triangle',.07);setTimeout(()=>sound(720,.045,'sine',.045),35);}
else if(w==='nebulaCannon'){sound(95,.055,'square',.08);sound(430,.045,'square',.055);}
else if(w==='quantumRifle'){sound(80,.18,'sawtooth',.07);setTimeout(()=>sound(900,.12,'sine',.08),35);}
else if(w==='ionDaggers'){sound(180,.045,'square',.07);setTimeout(()=>sound(250,.045,'square',.06),55);}
else if(w==='blackHoleScythe'){sound(75,.16,'sawtooth',.11);setTimeout(()=>sound(170,.1,'triangle',.07),60);noiseBurst(.08,.025);}
else if(w==='asteroidRings'){sound(360,.1,'triangle',.06);sound(720,.07,'sine',.04);}
else if(w==='gammaStaff'){sound(180,.12,'sine',.07);setTimeout(()=>sound(520,.16,'triangle',.07),45);noiseBurst(.12,.02);}}
function hitSound(){sound(90+Math.random()*80,.045,'sawtooth',.045);}
function startGame(){runToken++;startMusic();const c=characters[selectedChar],w=weapons[selectedWeapon];state='playing';upgradeOpening=false;$('upgrade').classList.add('hidden');timeAlive=0;wave=1;kills=0;xp=0;xpNeed=55;spawnTimer=.1;enemies=[];shots=[];particles=[];slashes=[];floats=[];player={x:W/2,y:H/2,r:17,hp:c.hp,maxHp:c.hp,speed:240*c.speed,damage:w.damage*c.damage,range:w.range,attackRate:w.rate,attackCd:0,dashCd:0,special:0,crit:c.crit,specialId:selectedSpecial,size:1,weapon:selectedWeapon,char:selectedChar,damageMult:1,shots:w.shots,aoe:1,specialPower:1,inv:0,level:1,projSpeed:w.projSpeed||720,specialEffect:null};$('heroName').textContent=c.name+' · '+w.name; $('specialText').textContent='0%'; $('specialHintText') && ($('specialHintText').innerHTML='Press <b>SPACE</b> · '+specials[selectedSpecial].name);$('menu').classList.add('hidden');$('gameover').classList.add('hidden');$('hud').classList.remove('hidden');$('hud').classList.remove('specialReady');toast('WAVE 1 · SPACE = SPECIAL',1);}
$('startBtn').onclick=startGame;$('againBtn').onclick=()=>{$('gameover').classList.add('hidden');$('menu').classList.remove('hidden');$('hud').classList.add('hidden');state='menu'};
function toast(t,d=1){toastText=t;toastTimer=d;$('toast').textContent=t;$('toast').classList.remove('hidden')}
function burst(x,y,n,color){n=Math.min(n,12);if(particles.length>180)particles.splice(0,particles.length-180);for(let i=0;i<n;i++){let a=rand(0,Math.PI*2),s=rand(35,250);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.2,.65),max:.65,size:rand(1,4),color})}}
function spawnEnemy(){if(enemies.length>=modes[selectedMode].maxEnemies)return;let side=Math.floor(Math.random()*4),m=70,x=side===1?W+m:side===3?-m:rand(-m,W+m),y=side===0?-m:side===2?H+m:rand(-m,H+m);let r=Math.random(),type=r<.5?'grunt':r<.72?'runner':r<.9?'shooter':'brute';let model=type==='grunt'?(Math.random()<.5?'alien':'astronaut') : type==='runner'?'scoutship':type==='shooter'?'drone':'asteroid';let md=modes[selectedMode],s=1+wave*.055;let e={x,y,type,model,r:type==='brute'?25:type==='runner'?15:16,hp:32*s*md.enemyHp,maxHp:0,speed:(type==='runner'?155:type==='brute'?52:82)*md.enemySpeed,hit:0,shoot:rand(.8,1.8),freeze:0,rot:rand(0,6.28)};if(type==='brute')e.hp*=4;if(type==='shooter')e.hp*=1.25;e.maxHp=e.hp;enemies.push(e)}
function nearest(){let best=null,bd=1e9;for(const e of enemies){let d=Math.hypot(e.x-player.x,e.y-player.y);if(d<bd){bd=d;best=e}}return best}
function attack(){if(state!=='playing'||player.attackCd>0)return;player.attackCd=player.attackRate;weaponSound();let w=weapons[player.weapon],c=characters[player.char],a=Math.atan2(mouse.y-player.y,mouse.x-player.x),damage=player.damage*player.damageMult*(Math.random()<player.crit?2.2:1);if(w.type==='melee'){for(let i=0;i<player.shots;i++){let aa=a+(i-(player.shots-1)/2)*.25;slashes.push({x:player.x,y:player.y,a:aa,life:.16,max:.16,range:player.range*player.size,damage});for(const e of enemies){let dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy),da=Math.atan2(dy,dx),diff=Math.atan2(Math.sin(da-aa),Math.cos(da-aa));if(d<player.range*player.size+e.r&&Math.abs(diff)<.72){if(hitEnemy(e,damage))return}}}burst(player.x+Math.cos(a)*35,player.y+Math.sin(a)*35,8,c.color)}else{for(let i=0;i<player.shots;i++){let aa=a+(i-(player.shots-1)/2)*.12;const speed=player.projSpeed; const travelRange=player.range; shots.push({x:player.x,y:player.y,vx:Math.cos(aa)*speed,vy:Math.sin(aa)*speed,life:travelRange/speed,damage,kind:player.weapon,rad:player.weapon==='quantumRifle'?5:5,pierce:w.pierce||0,blast:w.blast||0,maxTravel:travelRange});}burst(player.x,player.y,4,c.accent)}}
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
    ['💥','SIZE',weapons[player.weapon].type==='melee'?'Attack arc size +18%':'Projectile size +18%','size',.18],
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
function damageRadius(cx,cy,radius,dmg,extra={}){
  for(const e of [...enemies]){const dist=Math.hypot(e.x-cx,e.y-cy);if(dist<=radius+e.r){if(extra.freeze)e.freeze=Math.max(e.freeze,extra.freeze);if(extra.vortex)e.vortex=Math.max(e.vortex,extra.vortex);hitEnemy(e,dmg);}}
}
function special(){
  if(state!=='playing'||player.special<100)return;
  player.special=0;const thisRun=runToken,id=player.specialId,d=player.damage*player.specialPower,a=Math.atan2(mouse.y-player.y,mouse.x-player.x),c=characters[player.char];
  shake=18;player.specialEffect={id,life:1.05,max:1.05,x:mouse.x,y:mouse.y};burst(player.x,player.y,24,specials[id].color);toast(specials[id].name+'!',.9);
  if(id==='pulseSlam'){
    sound(65,.28,'sawtooth',.16);noiseBurst(.2,.07);damageRadius(player.x,player.y,250,d*2.4);for(const e of enemies){let dx=e.x-player.x,dy=e.y-player.y,l=Math.hypot(dx,dy)||1;e.x+=dx/l*90;e.y+=dy/l*90;}burst(player.x,player.y,55,'#7fe7ff');
  }else if(id==='gammaShield'){
    sound(180,.3,'sine',.13);sound(760,.35,'triangle',.08);player.inv=4;player.shield=4;player.shieldRadius=92;player.shieldTimer=4;damageRadius(player.x,player.y,100,d*1.5);burst(player.x,player.y,45,'#65eaff');
  }else if(id==='voidBarrage'){
    sound(95,.3,'sawtooth',.12);for(let i=-4;i<=4;i++){let aa=a+i*.075;shots.push({x:player.x,y:player.y,vx:Math.cos(aa)*1100,vy:Math.sin(aa)*1100,life:.78,damage:d*1.55,kind:'voidBarrage',rad:6,pierce:3,maxTravel:850});}burst(player.x,player.y,22,'#b98cff');
  }else if(id==='singularityPull'){
    sound(55,.5,'sine',.14);player.singularity={x:clamp(mouse.x,50,W-50),y:clamp(mouse.y,50,H-50),life:3,radius:260};burst(player.singularity.x,player.singularity.y,45,'#d6a6ff');
  }else if(id==='chainLightning'){
    sound(520,.2,'square',.13);let current=nearest(),used=new Set(),from={x:player.x,y:player.y};for(let n=0;n<8&&current;n++){used.add(current);current.chainHit=true;hitEnemy(current,d*(1.6-n*.08));slashes.push({x:(from.x+current.x)/2,y:(from.y+current.y)/2,a:Math.atan2(current.y-from.y,current.x-from.x),life:.18,max:.18,range:Math.hypot(current.x-from.x,current.y-from.y),lightning:true});from={x:current.x,y:current.y};let best=null,bd=99999;for(const e of enemies)if(!used.has(e)){let dd=Math.hypot(e.x-current.x,e.y-current.y);if(dd<bd&&dd<220){bd=dd;best=e}}current=best;}burst(player.x,player.y,35,'#63f6ff');
  }else if(id==='targetingMatrix'){
    sound(880,.15,'sine',.12);sound(440,.25,'square',.08);const targets=enemies.filter(e=>Math.hypot(e.x-player.x,e.y-player.y)<520).slice(0,18);targets.forEach((e,i)=>{e.marked=1.1;setTimeout(()=>{if(thisRun===runToken&&state==='playing'&&enemies.includes(e)){hitEnemy(e,d*2.4);burst(e.x,e.y,12,'#ff66dc');}},180+i*35)});burst(player.x,player.y,30,'#ff66dc');
  }else if(id==='meteorShower'){
    sound(70,.4,'sawtooth',.14);for(let i=0;i<14;i++){let tx=clamp(mouse.x+rand(-260,260),40,W-40),ty=clamp(mouse.y+rand(-190,190),40,H-40);shots.push({x:tx+rand(-30,30),y:ty-430,vx:rand(-35,35),vy:850,life:.55,damage:d*2.2,kind:'meteor',rad:18,pierce:5,maxTravel:500,targetX:tx,targetY:ty});}burst(mouse.x,mouse.y,28,'#ff9a4d');
  }else if(id==='solarFlare'){
    sound(42,.55,'sawtooth',.16);sound(220,.5,'triangle',.1);const start=55;for(let k=0;k<5;k++)setTimeout(()=>{if(thisRun===runToken&&state==='playing'){damageRadius(player.x,player.y,start+k*95,d*1.15);slashes.push({x:player.x,y:player.y,a:0,life:.3,max:.3,range:start+k*95,flare:true});}},k*100);player.inv=1.2;burst(player.x,player.y,70,'#ffd166');
  }
}
function hurt(d){if(player.inv>0||player.shieldTimer>0)return;player.hp-=d;sound(70,.18,'sawtooth',.13);modes[selectedMode];player.inv=.45;shake=14;burst(player.x,player.y,10,'#ff527f');if(player.hp<=0)endGame()}
function endGame(){state='gameover';$('hud').classList.add('hidden');$('gameover').classList.remove('hidden');$('finalWave').textContent=wave;$('finalKills').textContent=kills;$('finalTime').textContent=fmt(timeAlive)}
function fmt(t){let m=Math.floor(t/60).toString().padStart(2,'0'),s=Math.floor(t%60).toString().padStart(2,'0');return m+':'+s}
function update(dt){if(state!=='playing')return;timeAlive+=dt;player.attackCd-=dt;player.dashCd-=dt;player.inv-=dt;spawnTimer-=dt;shake*=.88;if(player.specialEffect){player.specialEffect.life-=dt;if(player.specialEffect.life<=0)player.specialEffect=null}if(spawnTimer<=0){spawnTimer=Math.max(.08,.62/modes[selectedMode].spawn/(1+wave*.035));spawnEnemy();if(Math.random()<Math.min(.45,wave*.012))spawnEnemy()}if(waveKillsForNext())nextWave();let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),len=Math.hypot(dx,dy)||1;player.x=clamp(player.x+dx/len*player.speed*dt,25,W-25);player.y=clamp(player.y+dy/len*player.speed*dt,25,H-25);if(mouse.down)attack();if(player.shieldTimer>0){player.shieldTimer-=dt;player.inv=.12;if(player.shieldTimer<=0)player.shield=0}if(player.singularity){player.singularity.life-=dt;if(player.singularity.life<=0)player.singularity=null}for(const e of enemies){e.freeze=Math.max(0,(e.freeze||0)-dt);let a=Math.atan2(player.y-e.y,player.x-e.x),d=Math.hypot(player.x-e.x,player.y-e.y);let slow=e.freeze>0?.12:1;if(player.singularity){let sx=player.singularity.x-e.x,sy=player.singularity.y-e.y,sd=Math.hypot(sx,sy);if(sd<player.singularity.radius){let pull=(1-sd/player.singularity.radius)*360*dt/(sd||1);e.x+=sx*pull;e.y+=sy*pull;e.vortex=.2}}if(e.vortex>0){e.vortex-=dt;let pull=Math.max(0,1-d/420);e.x+=(player.x-e.x)*pull*.9*dt;e.y+=(player.y-e.y)*pull*.9*dt}if(e.type==='shooter'){e.shoot-=dt;if(d>270){e.x+=Math.cos(a)*e.speed*dt*slow;e.y+=Math.sin(a)*e.speed*dt*slow}if(e.shoot<=0&&e.freeze<=0){e.shoot=1.7;e.hitShot=true;if(shots.length<70)shots.push({x:e.x,y:e.y,vx:Math.cos(a)*250,vy:Math.sin(a)*250,life:2,damage:9*modes[selectedMode].damage,kind:'enemy',rad:5,pierce:0})}}else{e.x+=Math.cos(a)*e.speed*dt*slow;e.y+=Math.sin(a)*e.speed*dt*slow}if(d<e.r+player.r){hurt((e.type==='brute'?20:8)*modes[selectedMode].damage);e.x-=Math.cos(a)*18;e.y-=Math.sin(a)*18}}for(let i=shots.length-1;i>=0;i--){let s=shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;let rem=false;if(s.kind==='enemy'&&Math.hypot(s.x-player.x,s.y-player.y)<player.r+s.rad){hurt(s.damage);rem=true}else if(s.kind!=='enemy'){for(const e of [...enemies]){if(Math.hypot(s.x-e.x,s.y-e.y)<s.rad+e.r){if(s.blast){damageRadius(s.x,s.y,s.blast,s.damage*.72);rem=true;break}if(hitEnemy(e,s.damage)){rem=true;break}if(s.pierce>0)s.pierce--;else{rem=true;break}}}}if(rem||s.life<=0||s.x<-50||s.x>W+50||s.y<-50||s.y>H+50)shots.splice(i,1);if(state==='upgrade')break}if(state==='upgrade'){syncHud();return}for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;if(p.life<=0)particles.splice(i,1)}for(let i=slashes.length-1;i>=0;i--){slashes[i].life-=dt;if(slashes[i].life<=0)slashes.splice(i,1)}for(let i=floats.length-1;i>=0;i--){floats[i].y-=20*dt;floats[i].life-=dt;if(floats[i].life<=0)floats.splice(i,1)}if(particles.length>180)particles.length=180;if(shots.length>80)shots.length=80;if(floats.length>60)floats.length=60;syncHud();if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.add('hidden')}}
function syncHud(){if(!player)return;$('hud').classList.toggle('specialReady',player.special>=100);$('hpFill').style.width=clamp(player.hp/player.maxHp*100,0,100)+'%';$('xpFill').style.width=clamp(xp/xpNeed*100,0,100)+'%';$('specialFill').style.width=player.special+'%';$('specialText').textContent=player.special>=100?'READY · '+specials[player.specialId].name:Math.floor(player.special)+'%';$('wave').textContent=wave;$('kills').textContent=kills;$('time').textContent=fmt(timeAlive)}
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
    if(s.kind==='starLauncher'){ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(12,0);ctx.stroke();ctx.fillRect(6,-3,7,6)}
    else if(s.kind==='nebulaCannon'){ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.stroke()}
    else if(s.kind==='quantumRifle'){ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(14,0);ctx.stroke()}
    else if(s.kind==='asteroidRings'){ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.arc(0,0,5,0,Math.PI*2);ctx.stroke()}
    else if(s.kind==='gammaStaff'){ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();ctx.fillRect(-2,-12,4,24)}
    else if(s.kind==='bow'){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(8,0);ctx.stroke();ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(2,-5);ctx.moveTo(8,0);ctx.lineTo(2,5);ctx.stroke()}
    else if(s.kind==='chakram'){ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.stroke()}
    else if(s.kind==='laser'){ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(9,0);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-10,-3);ctx.lineTo(10,-3);ctx.moveTo(-10,3);ctx.lineTo(10,3);ctx.stroke()}
    else if(s.kind==='arrowRain'){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-3,-14);ctx.lineTo(0,12);ctx.stroke();ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(-5,5);ctx.moveTo(0,12);ctx.lineTo(5,5);ctx.stroke()}
    else if(s.kind==='meteor'){ctx.fillStyle='#ff8c42';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-28,0);ctx.stroke()}
    else if(s.kind==='phantom'){ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-11,-6);ctx.lineTo(11,6);ctx.moveTo(-11,6);ctx.lineTo(11,-6);ctx.stroke()}
    else if(s.kind==='voidBarrage'){ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(12,0);ctx.stroke();ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(4,-6);ctx.moveTo(12,0);ctx.lineTo(4,6);ctx.stroke()}
    else if(s.kind==='special'){ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(12,0);ctx.stroke();ctx.beginPath();ctx.arc(4,0,5,0,Math.PI*2);ctx.stroke()}
    else {ctx.lineWidth=s.rad*1.7;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(10,0);ctx.stroke();ctx.beginPath();ctx.arc(10,0,2,0,Math.PI*2);ctx.fill()}
    ctx.restore()}
  for(const e of enemies)drawEnemy(e);if(player?.singularity){ctx.save();ctx.globalAlpha=.8;ctx.strokeStyle='#d6a6ff';ctx.shadowColor='#a96cff';ctx.shadowBlur=30;ctx.lineWidth=4;ctx.beginPath();ctx.arc(player.singularity.x,player.singularity.y,player.singularity.radius*(.92+.08*Math.sin(performance.now()/120)),0,Math.PI*2);ctx.stroke();ctx.fillStyle='#090014';ctx.beginPath();ctx.arc(player.singularity.x,player.singularity.y,42,0,Math.PI*2);ctx.fill();ctx.restore()}if(player?.shieldTimer>0){ctx.save();ctx.strokeStyle='#65eaff';ctx.shadowColor='#65eaff';ctx.shadowBlur=25;ctx.lineWidth=4;ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(player.x,player.y,player.shieldRadius+8*Math.sin(performance.now()/100),0,Math.PI*2);ctx.stroke();ctx.restore()}if(player)drawPlayer();
  for(const f of floats){ctx.globalAlpha=f.life/.55;ctx.fillStyle='#fff';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText(f.text,f.x,f.y)}ctx.restore()}
function drawEnemy(e){let col=e.type==='boss'?'#ff3fcf':e.type==='brute'?'#ff784f':e.type==='runner'?'#56d8ff':e.type==='shooter'?'#ffbf55':e.model==='astronaut'?'#8e73ff':'#62e6a8';let hit=e.hit>0;ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=hit?.82:1;ctx.shadowColor=col;ctx.shadowBlur=e.type==='boss'?28:14;ctx.fillStyle='#070b15';ctx.strokeStyle=col;ctx.lineWidth=e.type==='boss'?4:2;
if(e.type==='boss'){ctx.rotate(performance.now()/1300);ctx.beginPath();for(let i=0;i<12;i++){let a=i*Math.PI/6,r=i%2?e.r*.62:e.r;let x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-performance.now()/1300);ctx.fillStyle='#ff8fe4';ctx.beginPath();ctx.arc(0,0,e.r*.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 9px system-ui';ctx.textAlign='center';ctx.fillText('MOTHERSHIP',0,4)}
else if(e.model==='scoutship'){ctx.rotate(Math.atan2(player.y-e.y,player.x-e.x));ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(3,-10);ctx.lineTo(-20,-7);ctx.lineTo(-12,0);ctx.lineTo(-20,7);ctx.lineTo(3,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(2,0,7,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(8,-1,5,2)}
else if(e.model==='drone'){ctx.rotate(e.rot+performance.now()/1000);ctx.beginPath();ctx.arc(0,0,e.r*.75,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){let a=i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*e.r*.75,Math.sin(a)*e.r*.75,5,0,Math.PI*2);ctx.fill();ctx.stroke()}ctx.fillStyle='#ff5b75';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill()}
else if(e.model==='asteroid'){ctx.rotate(e.rot);ctx.beginPath();for(let i=0;i<9;i++){let a=i*Math.PI*2/9,r=e.r*(.72+((i*7)%4)/10);let x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ff9c61';ctx.beginPath();ctx.arc(-6,-5,3,0,Math.PI*2);ctx.arc(7,5,2,0,Math.PI*2);ctx.fill()}
else if(e.model==='astronaut'){ctx.beginPath();ctx.arc(0,-4,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ccefff';ctx.beginPath();ctx.ellipse(2,-5,7,5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.stroke();ctx.fillStyle='#141a2a';ctx.fillRect(-10,7,20,12);ctx.strokeRect(-10,7,20,12);ctx.fillStyle=col;ctx.fillRect(-15,9,5,10);ctx.fillRect(10,9,5,10);ctx.fillStyle='#ff5b77';ctx.beginPath();ctx.arc(0,12,2,0,Math.PI*2);ctx.fill()}
else {ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(-5,-2,2.5,0,Math.PI*2);ctx.arc(5,-2,2.5,0,Math.PI*2);ctx.fill()}
ctx.restore();if(e.hp<e.maxHp){ctx.fillStyle='#0009';ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2,4);ctx.fillStyle=col;ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2*clamp(e.hp/e.maxHp,0,1),4)}if(e.freeze>0){ctx.strokeStyle='#b8f7ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+5,0,Math.PI*2);ctx.stroke()}}
function drawSpecialAsset(id,x,y,size=210,alpha=.8,rot=0){const key=specialAsset[id],im=assetImages.effects[key];if(!im||!im.complete)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=alpha;ctx.shadowColor=specials[id]?.color||'#b98cff';ctx.shadowBlur=18;ctx.drawImage(im,-size/2,-size/2,size,size);ctx.restore()}
function drawPlayer(){
  const c=characters[player.char],a=Math.atan2(mouse.y-player.y,mouse.x-player.x),t=performance.now()/1000;
  const cim=assetImages.characters[charAsset[player.char]],wim=assetImages.weapons[weaponAsset[player.weapon]];
  ctx.save();ctx.translate(player.x,player.y);ctx.globalAlpha=player.inv>0?.62:1;
  glowCircle(0,0,player.r*3.2,c.color,.16);
  // Weapon is kept separate from the astronaut so the artwork stays upright while aiming.
  if(wim&&wim.complete){ctx.save();ctx.rotate(a);ctx.globalAlpha=player.inv>0?.62:1;ctx.shadowColor=c.accent;ctx.shadowBlur=18;const ww=86*player.size,wh=86*player.size;ctx.drawImage(wim,30,-wh/2,ww,wh);ctx.restore()}
  if(cim&&cim.complete){ctx.save();ctx.shadowColor=c.color;ctx.shadowBlur=18;const size=92*player.size;ctx.drawImage(cim,-size/2,-size/2,size,size);ctx.restore()}
  ctx.restore();
  // Approved special artwork overlays.
  if(player.specialEffect){const f=player.specialEffect.life/player.specialEffect.max;const id=player.specialEffect.id;let px=player.specialEffect.x,py=player.specialEffect.y;let size=250*(1+(1-f)*.25);if(id==='gammaShield'||id==='solarFlare'){px=player.x;py=player.y;size=300*(1+(1-f)*.18)}drawSpecialAsset(id,px,py,size,.18+.68*f,t*(id==='voidBarrage'?-.4:.25));}
  if(player.singularity)drawSpecialAsset('singularityPull',player.singularity.x,player.singularity.y,Math.max(220,player.singularity.radius*1.05),.42,t*.35);
  if(player.shieldTimer>0)drawSpecialAsset('gammaShield',player.x,player.y,235,.34,t*.2);
  for(const s of slashes){ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=s.life/s.max;ctx.strokeStyle=characters[player.char].accent;ctx.shadowColor=characters[player.char].accent;ctx.shadowBlur=18;ctx.lineWidth=s.lightning?3:7;if(s.flare){ctx.beginPath();ctx.arc(0,0,s.range,0,Math.PI*2);ctx.stroke()}else if(s.lightning){ctx.beginPath();let ex=Math.cos(s.a)*s.range,ey=Math.sin(s.a)*s.range;ctx.moveTo(-ex/2,-ey/2);for(let q=1;q<6;q++){let xx=-ex/2+ex*q/5+rand(-8,8),yy=-ey/2+ey*q/5+rand(-8,8);ctx.lineTo(xx,yy)}ctx.stroke()}else{ctx.rotate(s.a);ctx.beginPath();ctx.arc(0,0,s.range,-.78,.78);ctx.stroke()}ctx.restore()}
}
function loop(t){let dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;update(dt);draw();requestAnimationFrame(loop)}resize();requestAnimationFrame(loop);
