from pathlib import Path
import re
p=Path('/mnt/data/shadow-v4-work/game.js')
s=p.read_text()
# character metadata: add special names
old="const characters={ronin:{name:'RONIN',desc:'Balanced blade master',icon:'⚔️',speed:1,damage:1.12,hp:95,crit:.08,color:'#9b6cff',accent:'#61d8ff'},archer:{name:'KAZE',desc:'Fast ranged hunter',icon:'🏹',speed:1.12,damage:.9,hp:82,crit:.14,color:'#53d8ff',accent:'#a9ffdf'},cyber:{name:'VOLT',desc:'Energy weapon specialist',icon:'⚡',speed:.98,damage:1.02,hp:88,crit:.1,color:'#ff5bd6',accent:'#ffb45b'},shade:{name:'SHADE',desc:'Assassin with high crit',icon:'🗡️',speed:1.18,damage:.96,hp:76,crit:.2,color:'#8d9cff',accent:'#fff'},ember:{name:'EMBER',desc:'Aggressive fire striker',icon:'🔥',speed:1.04,damage:1.16,hp:86,crit:.07,color:'#ff7048',accent:'#ffd166'},frost:{name:'FROST',desc:'Defensive ice warrior',icon:'❄️',speed:.9,damage:1.05,hp:112,crit:.06,color:'#72e7ff',accent:'#d9fbff'},luna:{name:'LUNA',desc:'Mystic ranged caster',icon:'🌙',speed:1.08,damage:1.04,hp:84,crit:.12,color:'#c58cff',accent:'#ffe6ff'},ronin2:{name:'AKIRA',desc:'Rapid twin-blade fighter',icon:'🌸',speed:1.24,damage:.9,hp:78,crit:.16,color:'#ff77b7',accent:'#fff0f7'}};"
new="const characters={ronin:{name:'RONIN',desc:'Armored astronaut swordsman · Blade Storm',icon:'⚔️',specialName:'BLADE STORM',speed:1,damage:1.12,hp:95,crit:.08,color:'#9b6cff',accent:'#61d8ff'},archer:{name:'KAZE',desc:'Scout astronaut · Arrow Rain',icon:'🏹',specialName:'ARROW RAIN',speed:1.12,damage:.9,hp:82,crit:.14,color:'#53d8ff',accent:'#a9ffdf'},cyber:{name:'VOLT',desc:'Tech astronaut · EMP Nova',icon:'⚡',specialName:'EMP NOVA',speed:.98,damage:1.02,hp:88,crit:.1,color:'#ff5bd6',accent:'#ffb45b'},shade:{name:'SHADE',desc:'Stealth astronaut · Shadow Blink',icon:'🗡️',specialName:'SHADOW BLINK',speed:1.18,damage:.96,hp:76,crit:.2,color:'#8d9cff',accent:'#fff'},ember:{name:'EMBER',desc:'Solar astronaut · Meteor Burst',icon:'🔥',specialName:'METEOR BURST',speed:1.04,damage:1.16,hp:86,crit:.07,color:'#ff7048',accent:'#ffd166'},frost:{name:'FROST',desc:'Cryo astronaut · Freeze Field',icon:'❄️',specialName:'FREEZE FIELD',speed:.9,damage:1.05,hp:112,crit:.06,color:'#72e7ff',accent:'#d9fbff'},luna:{name:'LUNA',desc:'Gravity astronaut · Vortex',icon:'🌙',specialName:'GRAVITY VORTEX',speed:1.08,damage:1.04,hp:84,crit:.12,color:'#c58cff',accent:'#ffe6ff'},ronin2:{name:'AKIRA',desc:'Twin-blade astronaut · Phantom Blades',icon:'🌸',specialName:'PHANTOM BLADES',speed:1.24,damage:.9,hp:78,crit:.16,color:'#ff77b7',accent:'#fff0f7'}};"
s=s.replace(old,new)
# Replace audio attackSound section
pattern=r"function attackSound\(\)\{.*?function hitSound\(\).*?\n"
replacement="""function noiseBurst(duration=.06,volume=.05){const ac=ensureAudio();if(!ac||!sfxMaster)return;const n=Math.max(1,Math.floor(ac.sampleRate*duration)),buf=ac.createBuffer(1,n,ac.sampleRate),data=buf.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);const src=ac.createBufferSource(),g=ac.createGain();g.gain.value=volume;src.buffer=buf;src.connect(g);g.connect(sfxMaster);src.start();}
function weaponSound(){const w=player?.weapon; if(!w)return; if(w==='katana'){sound(145,.08,'sawtooth',.09);setTimeout(()=>sound(310,.05,'triangle',.045),25);}
else if(w==='bow'){sound(220,.07,'triangle',.07);setTimeout(()=>sound(720,.045,'sine',.045),35);}
else if(w==='blaster'){sound(95,.055,'square',.08);sound(430,.045,'square',.055);}
else if(w==='laser'){sound(80,.18,'sawtooth',.07);setTimeout(()=>sound(900,.12,'sine',.08),35);}
else if(w==='twin'){sound(180,.045,'square',.07);setTimeout(()=>sound(250,.045,'square',.06),55);}
else if(w==='scythe'){sound(75,.16,'sawtooth',.11);setTimeout(()=>sound(170,.1,'triangle',.07),60);noiseBurst(.08,.025);}
else if(w==='chakram'){sound(360,.1,'triangle',.06);sound(720,.07,'sine',.04);}
else if(w==='staff'){sound(180,.12,'sine',.07);setTimeout(()=>sound(520,.16,'triangle',.07),45);noiseBurst(.12,.02);}}
function hitSound(){sound(90+Math.random()*80,.045,'sawtooth',.045);}
"""
s=re.sub(pattern,replacement,s,count=1,flags=re.S)
s=s.replace("startGame(){startMusic();", "startGame(){startMusic();")
s=s.replace("attackSound();let w=weapons[player.weapon]", "weaponSound();let w=weapons[player.weapon]")
# Replace spawnEnemy
pattern=r"function spawnEnemy\(\)\{.*?\nfunction nearest"
replacement="""function spawnEnemy(){if(enemies.length>=modes[selectedMode].maxEnemies)return;let side=Math.floor(Math.random()*4),m=70,x=side===1?W+m:side===3?-m:rand(-m,W+m),y=side===0?-m:side===2?H+m:rand(-m,H+m);let r=Math.random(),type=r<.5?'grunt':r<.72?'runner':r<.9?'shooter':'brute';let model=type==='grunt'?(Math.random()<.5?'alien':'astronaut') : type==='runner'?'scoutship':type==='shooter'?'drone':'asteroid';let md=modes[selectedMode],s=1+wave*.055;let e={x,y,type,model,r:type==='brute'?25:type==='runner'?15:16,hp:32*s*md.enemyHp,maxHp:0,speed:(type==='runner'?155:type==='brute'?52:82)*md.enemySpeed,hit:0,shoot:rand(.8,1.8),freeze:0,rot:rand(0,6.28)};if(type==='brute')e.hp*=4;if(type==='shooter')e.hp*=1.25;e.maxHp=e.hp;enemies.push(e)}
function nearest"""
s=re.sub(pattern,replacement,s,count=1,flags=re.S)
# Replace special
pattern=r"function special\(\)\{.*?\nfunction hurt"
replacement="""function special(){if(state!=='playing'||player.special<100)return;player.special=0;const c=characters[player.char],d=player.damage*player.specialPower,a=Math.atan2(mouse.y-player.y,mouse.x-player.x);shake=18;burst(player.x,player.y,24,c.color);toast(c.specialName+'!',.9);
if(player.char==='ronin'){sound(110,.2,'sawtooth',.13);for(let k=0;k<3;k++){setTimeout(()=>{slashes.push({x:player.x,y:player.y,a:a+k*2.1,life:.45,max:.45,range:210*player.size,damage:d*2.2});for(const e of [...enemies]){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<220*player.size)hitEnemy(e,d*1.7)}},k*90)}}
else if(player.char==='archer'){sound(680,.12,'triangle',.1);for(let i=0;i<26;i++){let aa=rand(0,Math.PI*2),dist=rand(70,380);shots.push({x:player.x+Math.cos(aa)*dist,y:player.y+Math.sin(aa)*dist-260,vx:0,vy:900,life:.7,damage:d*2.1,kind:'arrowRain',rad:6,pierce:2,maxTravel:700})}}
else if(player.char==='cyber'){sound(70,.3,'square',.13);sound(420,.24,'sine',.09);for(const e of [...enemies]){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<260){hitEnemy(e,d*2.8);e.freeze=.8}}burst(player.x,player.y,45,c.accent)}
else if(player.char==='shade'){sound(260,.08,'triangle',.1);let nx=clamp(player.x+Math.cos(a)*190,35,W-35),ny=clamp(player.y+Math.sin(a)*190,35,H-35);burst(player.x,player.y,20,'#ffffff');player.x=nx;player.y=ny;player.inv=.7;for(const e of [...enemies]){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<150)hitEnemy(e,d*3.8)}slashes.push({x:player.x,y:player.y,a,life:.45,max:.45,range:150,damage:d*3})}
else if(player.char==='ember'){sound(55,.24,'sawtooth',.12);for(let i=0;i<8;i++){let tx=clamp(mouse.x+rand(-180,180),30,W-30),ty=clamp(mouse.y+rand(-180,180),30,H-30);shots.push({x:tx,y:ty-380,vx:0,vy:780,life:.6,damage:d*3,kind:'meteor',rad:16,pierce:4,maxTravel:500})}}
else if(player.char==='frost'){sound(210,.3,'sine',.12);sound(840,.18,'triangle',.08);for(const e of enemies){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<300){e.freeze=3;hitEnemy(e,d*1.9)}}burst(player.x,player.y,55,'#9ff7ff')}
else if(player.char==='luna'){sound(120,.35,'sine',.12);for(const e of enemies){let dist=Math.hypot(e.x-player.x,e.y-player.y);if(dist<360){e.vortex=2.2;hitEnemy(e,d*2.4)}}burst(player.x,player.y,40,'#d6b7ff')}
else {sound(300,.12,'square',.1);for(let k=0;k<2;k++){let aa=a+(k?Math.PI/2:-Math.PI/2);shots.push({x:player.x,y:player.y,vx:Math.cos(aa)*650,vy:Math.sin(aa)*650,life:1.1,damage:d*2.6,kind:'phantom',rad:10,pierce:6,maxTravel:700})}}
}
function hurt"""
s=re.sub(pattern,replacement,s,count=1,flags=re.S)
# Replace update enemy loop with freeze/vortex and preserve
old="for(const e of enemies){let a=Math.atan2(player.y-e.y,player.x-e.x),d=Math.hypot(player.x-e.x,player.y-e.y);if(e.type==='shooter'){e.shoot-=dt;if(d>270){e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt}if(e.shoot<=0){e.shoot=1.7;e.hitShot=true;if(shots.length<70)shots.push({x:e.x,y:e.y,vx:Math.cos(a)*250,vy:Math.sin(a)*250,life:2,damage:9*modes[selectedMode].damage,kind:'enemy',rad:5,pierce:0})}}else{e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt}if(d<e.r+player.r){hurt((e.type==='brute'?20:8)*modes[selectedMode].damage);e.x-=Math.cos(a)*18;e.y-=Math.sin(a)*18}}"
new="for(const e of enemies){e.freeze=Math.max(0,(e.freeze||0)-dt);let a=Math.atan2(player.y-e.y,player.x-e.x),d=Math.hypot(player.x-e.x,player.y-e.y);let slow=e.freeze>0?.12:1;if(e.vortex>0){e.vortex-=dt;let pull=Math.max(0,1-d/420);e.x+=(player.x-e.x)*pull*.9*dt;e.y+=(player.y-e.y)*pull*.9*dt}if(e.type==='shooter'){e.shoot-=dt;if(d>270){e.x+=Math.cos(a)*e.speed*dt*slow;e.y+=Math.sin(a)*e.speed*dt*slow}if(e.shoot<=0&&e.freeze<=0){e.shoot=1.7;e.hitShot=true;if(shots.length<70)shots.push({x:e.x,y:e.y,vx:Math.cos(a)*250,vy:Math.sin(a)*250,life:2,damage:9*modes[selectedMode].damage,kind:'enemy',rad:5,pierce:0})}}else{e.x+=Math.cos(a)*e.speed*dt*slow;e.y+=Math.sin(a)*e.speed*dt*slow}if(d<e.r+player.r){hurt((e.type==='brute'?20:8)*modes[selectedMode].damage);e.x-=Math.cos(a)*18;e.y-=Math.sin(a)*18}}"
s=s.replace(old,new)
# Extend shot collision for arrowRain/meteor/phantom works same, but draw custom. Add kind in enemy drawing later.
# Replace drawEnemy entirely
pattern=r"function drawEnemy\(e\)\{.*?\nfunction drawPlayer"
replacement="""function drawEnemy(e){let col=e.type==='boss'?'#ff3fcf':e.type==='brute'?'#ff784f':e.type==='runner'?'#56d8ff':e.type==='shooter'?'#ffbf55':e.model==='astronaut'?'#8e73ff':'#62e6a8';let hit=e.hit>0;ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=hit?.82:1;ctx.shadowColor=col;ctx.shadowBlur=e.type==='boss'?28:14;ctx.fillStyle='#070b15';ctx.strokeStyle=col;ctx.lineWidth=e.type==='boss'?4:2;
if(e.type==='boss'){ctx.rotate(performance.now()/1300);ctx.beginPath();for(let i=0;i<12;i++){let a=i*Math.PI/6,r=i%2?e.r*.62:e.r;let x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-performance.now()/1300);ctx.fillStyle='#ff8fe4';ctx.beginPath();ctx.arc(0,0,e.r*.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 9px system-ui';ctx.textAlign='center';ctx.fillText('MOTHERSHIP',0,4)}
else if(e.model==='scoutship'){ctx.rotate(Math.atan2(player.y-e.y,player.x-e.x));ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(3,-10);ctx.lineTo(-20,-7);ctx.lineTo(-12,0);ctx.lineTo(-20,7);ctx.lineTo(3,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(2,0,7,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(8,-1,5,2)}
else if(e.model==='drone'){ctx.rotate(e.rot+performance.now()/1000);ctx.beginPath();ctx.arc(0,0,e.r*.75,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){let a=i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*e.r*.75,Math.sin(a)*e.r*.75,5,0,Math.PI*2);ctx.fill();ctx.stroke()}ctx.fillStyle='#ff5b75';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill()}
else if(e.model==='asteroid'){ctx.rotate(e.rot);ctx.beginPath();for(let i=0;i<9;i++){let a=i*Math.PI*2/9,r=e.r*(.72+((i*7)%4)/10);let x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ff9c61';ctx.beginPath();ctx.arc(-6,-5,3,0,Math.PI*2);ctx.arc(7,5,2,0,Math.PI*2);ctx.fill()}
else if(e.model==='astronaut'){ctx.beginPath();ctx.arc(0,-4,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ccefff';ctx.beginPath();ctx.ellipse(2,-5,7,5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.stroke();ctx.fillStyle='#141a2a';ctx.fillRect(-10,7,20,12);ctx.strokeRect(-10,7,20,12);ctx.fillStyle=col;ctx.fillRect(-15,9,5,10);ctx.fillRect(10,9,5,10);ctx.fillStyle='#ff5b77';ctx.beginPath();ctx.arc(0,12,2,0,Math.PI*2);ctx.fill()}
else {ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(-5,-2,2.5,0,Math.PI*2);ctx.arc(5,-2,2.5,0,Math.PI*2);ctx.fill()}
ctx.restore();if(e.hp<e.maxHp){ctx.fillStyle='#0009';ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2,4);ctx.fillStyle=col;ctx.fillRect(e.x-e.r,e.y-e.r-10,e.r*2*clamp(e.hp/e.maxHp,0,1),4)}if(e.freeze>0){ctx.strokeStyle='#b8f7ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+5,0,Math.PI*2);ctx.stroke()}}
function drawPlayer"""
s=re.sub(pattern,replacement,s,count=1,flags=re.S)
# Replace drawPlayer entire until loop
pattern=r"function drawPlayer\(\).*?\nfunction loop"
replacement="""function drawPlayer(){let c=characters[player.char],a=Math.atan2(mouse.y-player.y,mouse.x-player.x),t=performance.now()/1000;ctx.save();ctx.translate(player.x,player.y);ctx.rotate(a);ctx.globalAlpha=player.inv>0?.55:1;glowCircle(0,0,player.r*2.8,c.color,.13);ctx.shadowColor=c.color;ctx.shadowBlur=18;
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
function loop"""
s=re.sub(pattern,replacement,s,count=1,flags=re.S)
# Replace shot draw block custom cases by adding cases before special
needle="else if(s.kind==='special'){ctx.lineWidth=5;"
insert="""else if(s.kind==='arrowRain'){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-3,-14);ctx.lineTo(0,12);ctx.stroke();ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(-5,5);ctx.moveTo(0,12);ctx.lineTo(5,5);ctx.stroke()}
    else if(s.kind==='meteor'){ctx.fillStyle='#ff8c42';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-28,0);ctx.stroke()}
    else if(s.kind==='phantom'){ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-11,-6);ctx.lineTo(11,6);ctx.moveTo(-11,6);ctx.lineTo(11,-6);ctx.stroke()}
    """+needle
s=s.replace(needle,insert)
# Update hero HUD special text to show character special
s=s.replace("$('heroName').textContent=c.name+' · '+w.name;", "$('heroName').textContent=c.name+' · '+w.name; $('specialText').textContent='0%'; $('specialHintText') && ($('specialHintText').innerHTML='Press <b>SPACE</b> · '+c.specialName);")
# HTML currently no specialHintText id; we'll add via CSS/HTML separately, and this guard is safe.
p.write_text(s)
