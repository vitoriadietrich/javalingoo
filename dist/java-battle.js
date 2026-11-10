'use strict';
(() => {
  const W=960,H=600,STORE='javalingo-battle-v1';
  const weapons=[
    {name:'Rifle Aurora',mag:28,reserve:168,damage:19,rate:.14,speed:710,pellets:1,spread:.035,reload:1.25,color:'#ffd383'},
    {name:'Dispersor',mag:8,reserve:56,damage:13,rate:.64,speed:590,pellets:5,spread:.23,reload:1.65,color:'#ff9985'},
    {name:'Precisão Vértice',mag:6,reserve:42,damage:75,rate:.85,speed:940,pellets:1,spread:.008,reload:1.8,color:'#9fe8ff'}
  ];
  const covers=[
    {x:242,y:88,w:102,h:49},{x:655,y:81,w:112,h:48},
    {x:72,y:219,w:89,h:62},{x:786,y:218,w:105,h:67},
    {x:137,y:465,w:100,h:52},{x:738,y:467,w:114,h:55},
    {x:425,y:256,w:110,h:53}
  ];
  const events=[
    {id:'supplies',name:'Chuva de suprimentos',time:8,description:'Itens extras surgiram pelo mapa.'},
    {id:'invasion',name:'Invasão relâmpago',time:9,description:'Novos rivais chegaram à arena.'},
    {id:'shields',name:'Escudos para todos',time:10,description:'Você e os rivais receberam proteção.'},
    {id:'teacher',name:'Professor turbinado',time:11,description:'O professor ataca mais rápido e mais forte.'},
    {id:'chest',name:'Caçada ao baú raro',time:15,description:'Encontre o baú dourado antes que desapareça.'},
    {id:'turbo',name:'Velocidade máxima',time:10,description:'Sua movimentação ficou mais rápida.'},
    {id:'double',name:'Festival de combos',time:12,description:'Eliminações rendem pontos em dobro.'}
  ];
  const arenas=[
    {name:'Campus Crepúsculo',src:'assets/arena-campus-dusk.png',desc:'Luzes douradas e rotas abertas'},
    {name:'Circuito Neon',src:'assets/arena-circuit-neon.webp',desc:'Noite elétrica e reflexos azuis'},
    {name:'Vale Solar',src:'assets/arena-solar-valley.webp',desc:'Pedra, areia e sol intenso'},
    {name:'Porto das Marés',src:'assets/arena-tidal-harbor.webp',desc:'Docas e caminhos sobre a água'},
    {name:'Templo Selvagem',src:'assets/arena-jungle-temple.webp',desc:'Ruínas entre árvores e cascatas'},
    {name:'Forja Vulcânica',src:'assets/arena-volcanic-forge.webp',desc:'Pedra escura e lava brilhante'},
    {name:'Glaciar Polar',src:'assets/arena-glacial-outpost.webp',desc:'Neve, gelo e luzes frias'},
    {name:'Base Lunar',src:'assets/arena-lunar-base.webp',desc:'Crateras e estação espacial'},
    {name:'Jardim Sakura',src:'assets/arena-sakura-garden.webp',desc:'Flores, canais e luz suave'},
    {name:'Porto Celeste',src:'assets/arena-skyport-dawn.webp',desc:'Arena suspensa acima das nuvens'},
    {name:'Cidadela das Dunas',src:'assets/royale-new-scene-1.webp',desc:'Pontes e muralhas no deserto'},
    {name:'Domo Abissal',src:'assets/royale-new-scene-2.webp',desc:'Corais e vidro sob o oceano'},
    {name:'Telhados Neon',src:'assets/royale-new-scene-3.webp',desc:'Cidade futurista sob a chuva'},
    {name:'Ruínas Celestiais',src:'assets/royale-new-scene-4.webp',desc:'Cristais sobre as nuvens'},
    {name:'Circo Mecânico',src:'assets/royale-new-scene-5.webp',desc:'Engrenagens e luzes de festival'}
  ];
  const nightNames=['Campus Tempestade','Circuito Noturno','Vale Miragem','Porto da Névoa','Templo Lunar','Forja da Meia-noite','Glaciar Aurora','Base Eclipse','Sakura ao Luar','Porto das Estrelas','Dunas do Crepúsculo','Abismo Bioluminescente','Neon da Madrugada','Ruínas Sombrias','Circo Encantado'];
  arenas.push(...arenas.map((arena,i)=>({...arena,name:nightNames[i],desc:'Versão noturna · atmosfera dinâmica',variant:true})));

  const backgrounds=arenas.map(()=>null);
  const getBackground=index=>{
    if(!backgrounds[index]){const img=new Image();img.src=arenas[index].src;img.onload=()=>{if(screen==='battle')draw()};backgrounds[index]=img}
    return backgrounds[index];
  };
  const heroBases=[
    {name:'Aurora',src:'assets/royale-hero-1.webp'}, {name:'Maré',src:'assets/royale-hero-2.webp'},
    {name:'Violeta',src:'assets/royale-hero-3.webp'}, {name:'Selva',src:'assets/royale-hero-4.webp'},
    {name:'Órbita',src:'assets/royale-hero-5.webp'}, {name:'Prisma',src:'assets/royale-hero-6.webp'},
    {name:'Vértice',src:'assets/royale-hero-7.webp'}, {name:'Duna',src:'assets/royale-hero-8.webp'},
    {name:'Pulso',src:'assets/royale-hero-9.webp'}, {name:'Sombra',src:'assets/royale-hero-10.webp'}
  ];
  const roles=[
    {name:'Assalto',power:'Rajada estelar',desc:'Munição extra · rajada em área',color:'#ffc56e',filter:'none'},
    {name:'Guardião',power:'Domo protetor',desc:'Mais escudo · proteção temporária',color:'#8de8f5',filter:'hue-rotate(55deg) saturate(1.15)'},
    {name:'Veloz',power:'Salto relâmpago',desc:'Movimento rápido · impulso especial',color:'#cfadff',filter:'hue-rotate(175deg) saturate(1.2)'}
  ];
  const heroes=roles.flatMap((role,roleIndex)=>heroBases.map((base,baseIndex)=>({name:base.name+' · '+role.name,src:base.src,baseIndex,roleIndex})));
  const heroImages=heroBases.map(h=>{const img=new Image();img.src=h.src;img.onload=()=>{if(screen==='battle')draw()};return img});
  const teacher=new Image();
  teacher.src='assets/professor-mascote.png?v=2';
  let best=0,wins=0,soundOn=true,arenaIndex=0,peerNames=[],rotateMaps=false,heroIndex=0,startWeapon=0,immersive=false,heroPage=0,mapPage=0;
  try{
    const s=JSON.parse(localStorage.getItem(STORE)||'{}');
    best=Math.max(0,Number(s.best)||0);wins=Math.max(0,Number(s.wins)||0);soundOn=s.sound!==false;
    arenaIndex=Math.max(0,Math.min(arenas.length-1,Number(s.arena)||0));
    rotateMaps=s.rotateMaps===true;heroIndex=Math.max(0,Math.min(heroes.length-1,Number(s.hero)||0));startWeapon=Math.max(0,Math.min(weapons.length-1,Number(s.startWeapon)||0));immersive=s.immersive===true;
    peerNames=Array.isArray(s.peers)?s.peers.filter(x=>typeof x==='string'&&x.trim()).slice(0,8).map(x=>x.trim().slice(0,18)):[];
  }catch{}
  let canvas=null,ctx=null,raf=0,last=0,game=null,photo=null,photoUrl=null,audio=null,rivalPhotos=[],rivalPhotoUrls=[];
  let pressed=new Set(),firing=false,keyboardFiring=false,joy={x:0,y:0},aim={x:750,y:300},view={x:0,y:0,w:W,h:H},notice='',noticeUntil=0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const random=(min,max)=>min+Math.random()*(max-min);
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify({best,wins,sound:soundOn,arena:arenaIndex,peers:peerNames,rotateMaps,hero:heroIndex,startWeapon,immersive}))}catch{}};
  function selectArena(index){
    arenaIndex=(index+arenas.length)%arenas.length;save();
    app.querySelectorAll('[data-jba-map]').forEach(el=>{const chosen=Number(el.dataset.jbaMap)===arenaIndex;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen))});
    const button=app.querySelector('[data-jba-map-next]');if(button)button.textContent='Cenário: '+arenas[arenaIndex].name;
    putNotice('Cenário selecionado: '+arenas[arenaIndex].name);draw();
  }
  const portrait=(img,x,y,r,isTeacher=false)=>{
    if(!img||!img.complete||!img.naturalWidth)return;
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
    const s=isTeacher?img.naturalWidth*.42:Math.min(img.naturalWidth,img.naturalHeight);
    const sx=isTeacher?img.naturalWidth*.25:(img.naturalWidth-s)/2;
    const sy=isTeacher?img.naturalHeight*.005:Math.max(0,(img.naturalHeight-s)*.16);
    ctx.drawImage(img,sx,sy,s,s,x-r,y-r,r*2,r*2);ctx.restore();
  };
  function beep(kind){
    if(!soundOn)return;
    try{
      audio=audio||new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume();
      const t=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain(),filter=audio.createBiquadFilter();
      const f=kind==='shot'?155:kind==='ally'?205:kind==='hit'?310:kind==='power'?520:kind==='win'?660:190;
      const length=kind==='win'?.45:kind==='shot'||kind==='ally'?.11:.19;
      osc.type=kind==='shot'?'sawtooth':'triangle';osc.frequency.setValueAtTime(f,t);osc.frequency.exponentialRampToValueAtTime(Math.max(60,f*.38),t+length);
      filter.type='lowpass';filter.frequency.value=kind==='shot'?950:1600;
      gain.gain.setValueAtTime(kind==='shot'?.07:kind==='ally'?.026:.06,t);gain.gain.exponentialRampToValueAtTime(.001,t+length);
      osc.connect(filter);filter.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+length);
    }catch{}
  }
  function putNotice(message){notice=message;noticeUntil=performance.now()+2600;const el=app.querySelector('#jbaStatus');if(el)el.textContent=message}
  function makeState(){
    return {status:'ready',elapsed:0,wave:1,waveDelay:0,kills:0,score:0,zone:560,bullets:[],enemies:[],particles:[],combo:0,comboTime:0,pulses:2,rescueAvailable:1,rescueTime:0,rescued:0,contractKills:0,contractGoal:3,contractDone:false,contractsCompleted:0,
      event:null,eventTime:0,nextEvent:14,eventBag:[],eventCount:0,chest:null,chestsFound:0,ultimate:0,ultimateTime:0,ultimateUses:0,
      pickups:[{x:295,y:340,type:'shield'},{x:710,y:360,type:'ammo'},{x:465,y:515,type:'health'},{x:610,y:148,type:'pulse'}],
      player:{x:480,y:380,hp:100,shield:heroes[heroIndex].roleIndex===1?75:55,weapon:startWeapon,ammo:weapons.map(w=>w.mag),reserve:weapons.map(w=>w.reserve+(heroes[heroIndex].roleIndex===0?w.mag:0)),cool:0,reload:0,dash:0,inv:0,angle:0},
      teacher:{x:430,y:400,cool:.6,angle:0}};
  }
  function isBlocked(x,y,r=15){return covers.some(c=>x+r>c.x&&x-r<c.x+c.w&&y+r>c.y&&y-r<c.y+c.h)}
  function move(entity,dx,dy,r=16){
    const nx=clamp(entity.x+dx,r,W-r),ny=clamp(entity.y+dy,r,H-r);
    if(!isBlocked(nx,entity.y,r))entity.x=nx;
    if(!isBlocked(entity.x,ny,r))entity.y=ny;
  }
  function spawnWave(){
    const n=game.wave===1?5:game.wave===2?7:9;
    game.contractKills=0;game.contractGoal=game.wave===1?3:game.wave===2?4:5;game.contractDone=false;
    const rivalCallsigns=['Bug Ninja','Loop Veloz','Byte Bravo','Cache Feroz','Debug Max','Erro 404','Piloto Stack','Rainha Array','Null Zero'];
    game.enemies=[];
    for(let i=0;i<n;i++){
      let x=0,y=0,tries=0;
      do{x=random(35,W-35);y=random(35,H-35);tries++}while((Math.hypot(x-game.player.x,y-game.player.y)<255||isBlocked(x,y,28))&&tries<120);
      const boss=game.wave===3&&i===0,health=boss?190:game.wave===3?76:game.wave===2?58:42;
      game.enemies.push({x,y,hp:health,max:health,boss,name:boss?'Líder da arena':peerNames.length?peerNames[i%peerNames.length]:rivalCallsigns[i],image:rivalPhotos.length?rivalPhotos[i%rivalPhotos.length]:null,
        speed:boss?65:game.wave===3?84:game.wave===2?72:61,cool:random(.5,2.2),angle:0,side:Math.random()<.5?-1:1});
    }
    putNotice('Onda '+game.wave+' iniciada · contrato: '+game.contractGoal+' eliminações em equipe');
  }
  function openSpot(away=0){
    const far=Math.min(away,Math.max(80,game.zone*.7));
    for(let i=0;i<100;i++){
      const spot={x:random(40,W-40),y:random(40,H-40)};
      if(!isBlocked(spot.x,spot.y,30)&&distance(spot,game.player)>far&&Math.hypot(spot.x-W/2,spot.y-H/2)<game.zone-26)return spot;
    }
    return {x:W/2+100,y:H/2+40};
  }
  function endSurprise(){
    if(!game?.event)return;
    const missed=game.event==='chest'&&!!game.chest;
    game.event=null;game.eventTime=0;game.chest=null;game.nextEvent=random(12,17);
    if(missed)putNotice('O baú raro desapareceu. Outro evento vem aí!');
    updateHud();
  }
  function startSurprise(){
    if(!game||game.status!=='running'||game.event)return;
    if(!game.eventBag.length)game.eventBag=events.map(e=>e.id);
    const index=Math.floor(Math.random()*game.eventBag.length),id=game.eventBag.splice(index,1)[0],event=events.find(e=>e.id===id);
    game.event=id;game.eventTime=event.time;game.eventCount++;
    if(id==='supplies')for(let i=0;i<8;i++)game.pickups.push({...openSpot(75),type:['health','shield','ammo','pulse'][i%4],drop:true,fall:random(.2,1.3)});
    if(id==='invasion')for(let i=0;i<3;i++){
      const spot=openSpot(230),name=peerNames.length?peerNames[i%peerNames.length]:['Rival Turbo','Rival Caos','Rival Flash'][i];
      game.enemies.push({...spot,hp:52+game.wave*8,max:52+game.wave*8,speed:88+game.wave*5,cool:random(.6,1.3),angle:0,side:i%2?1:-1,shield:0,boss:false,name,image:rivalPhotos.length?rivalPhotos[i%rivalPhotos.length]:null});
      for(let j=0;j<13;j++)game.particles.push({x:spot.x,y:spot.y,vx:random(-90,90),vy:random(-90,90),life:random(.2,.55),size:random(2,5),color:'#ff8d8a'});
    }
    if(id==='shields'){
      game.player.shield=Math.min(75,game.player.shield+30);
      game.enemies.forEach(e=>{e.shield=(e.shield||0)+18});
    }
    if(id==='chest')game.chest={...openSpot(210)};
    const announcement=app.querySelector('#jbaEventAnnounce');if(announcement)announcement.textContent='Evento surpresa: '+event.name+'. '+event.description;
    beep(id==='invasion'?'hit':'power');putNotice('EVENTO SURPRESA · '+event.name+' · '+event.description);updateHud();
  }
  function updateHud(){
    if(!game)return;
    const p=game.player,w=weapons[p.weapon];
    const set=(id,value)=>{const el=app.querySelector(id);if(el)el.textContent=value};
    set('#jbaLife',Math.ceil(p.hp));set('#jbaShield',Math.ceil(p.shield));
    set('#jbaWave',game.wave+'/3');set('#jbaKills',game.kills);set('#jbaContract',game.contractDone?'Concluído':game.contractKills+'/'+game.contractGoal);
    set('#jbaZone',Math.ceil(game.zone));set('#jbaWeapon',w.name);
    set('#jbaCombo',game.combo>1?'×'+game.combo:'—');set('#jbaUltimate',game.ultimate>=100?'PRONTO':Math.floor(game.ultimate)+'%');set('#jbaPowerName',roles[heroes[heroIndex].roleIndex].power);const ultimateButton=app.querySelectorAll('[data-jba-ultimate]');ultimateButton.forEach(b=>{b.disabled=game.status!=='running'||game.ultimate<100;b.textContent=game.ultimate>=100?roles[heroes[heroIndex].roleIndex].power:'Poder '+Math.floor(game.ultimate)+'%'});set('#jbaPulse',game.pulses+' cargas');set('#jbaRescue',game.rescueAvailable?'Pronto':'Usado');
    const eventCard=app.querySelector('#jbaEvent');
    if(eventCard){
      eventCard.hidden=!game.event&&!game.waveDelay&&!game.rescueTime;
      eventCard.dataset.kind=game.rescueTime?'rescue':game.waveDelay?'wave':game.event||'';
      if(game.rescueTime){set('#jbaEventLabel','SEGUNDA CHANCE');set('#jbaEventName','O professor te salvou!');set('#jbaEventTime','Proteção por '+Math.ceil(game.player.inv)+'s')}
      else if(game.waveDelay){set('#jbaEventLabel','ONDA CONCLUÍDA');set('#jbaEventName','Prepare-se para a próxima');set('#jbaEventTime','Começa em '+Math.ceil(game.waveDelay)+'s')}
      else if(game.event){set('#jbaEventLabel','EVENTO SURPRESA');set('#jbaEventName',events.find(e=>e.id===game.event).name);set('#jbaEventTime',Math.ceil(game.eventTime)+'s restantes')}
    }
    set('#jbaAmmo',p.reload>0?'RECARREGANDO':p.ammo[p.weapon]+' / '+p.reserve[p.weapon]);
    const hp=app.querySelector('#jbaLifeBar'),shield=app.querySelector('#jbaShieldBar');
    if(hp)hp.style.width=clamp(p.hp,0,100)+'%';
    if(shield)shield.style.width=clamp(p.shield/75*100,0,100)+'%';
    const dash=app.querySelector('#jbaDash');if(dash)dash.textContent=p.dash>0?'Impulso '+Math.ceil(p.dash)+'s':'Impulso pronto';
  }
  function shot(owner,x,y,angle,damage,speed,color,spread=0,pellets=1){
    for(let i=0;i<pellets;i++){
      const a=angle+(pellets>1?(i-(pellets-1)/2)*spread:random(-spread,spread));
      game.bullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,damage,owner,life:1.1,color});
    }
    game.particles.push({x,y,life:.14,size:11,color});
    if(owner==='player')beep('shot');else if(owner==='teacher')beep('ally');
  }
  function reload(){
    if(!game||game.status!=='running')return;
    const p=game.player,w=weapons[p.weapon],i=p.weapon;
    if(p.reload<=0&&p.ammo[i]<w.mag&&p.reserve[i]>0){p.reload=w.reload;putNotice('Recarregando '+w.name+'...')}
  }
  function swapWeapon(){
    if(!game||game.status!=='running')return;
    const p=game.player;p.weapon=(p.weapon+1)%weapons.length;p.reload=0;
    putNotice('Arma equipada: '+weapons[p.weapon].name);updateHud();beep('power');
  }
  function fire(auto=false){
    if(!game||game.status!=='running'||game.waveDelay>0)return;
    const p=game.player,w=weapons[p.weapon],i=p.weapon;
    if(p.reload>0||p.cool>0)return;
    if(p.ammo[i]<=0){reload();return}
    let angle=Math.atan2(aim.y-p.y,aim.x-p.x);
    if(auto){
      const target=nearestEnemy();
      if(target)angle=Math.atan2(target.y-p.y,target.x-p.x);
    }
    p.angle=angle;p.cool=w.rate;p.ammo[i]--;
    shot('player',p.x+Math.cos(angle)*22,p.y+Math.sin(angle)*22,angle,w.damage,w.speed,w.color,w.spread,w.pellets);
    if(p.ammo[i]===0&&p.reserve[i]>0)reload();
    updateHud();
  }
  function nearestEnemy(){
    if(!game)return null;
    const p=game.player;
    return game.enemies.reduce((a,b)=>!a||distance(b,p)<distance(a,p)?b:a,null);
  }
  function dash(){
    if(!game||game.status!=='running')return;
    const p=game.player;if(p.dash>0)return;
    let dx=(pressed.has('d')||pressed.has('arrowright')?1:0)-(pressed.has('a')||pressed.has('arrowleft')?1:0)+joy.x;
    let dy=(pressed.has('x')||pressed.has('arrowdown')?1:0)-(pressed.has('w')||pressed.has('arrowup')?1:0)+joy.y;
    if(Math.hypot(dx,dy)<.1){dx=Math.cos(p.angle);dy=Math.sin(p.angle)}
    const len=Math.hypot(dx,dy)||1;
    for(let i=0;i<7;i++)move(p,dx/len*12,dy/len*12);
    p.dash=5;p.inv=.45;beep('power');putNotice('Impulso ativado');updateHud();
  }
  function pulse(){
    if(!game||game.status!=='running'||game.waveDelay>0||game.pulses<=0)return;
    const p=game.player;game.pulses--;p.inv=Math.max(p.inv,.55);
    for(let i=0;i<38;i++){const a=i*Math.PI*2/38;game.particles.push({x:p.x,y:p.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,life:.55,size:random(3,7),color:'#8defff'})}
    for(const e of [...game.enemies])if(game.status==='running'&&distance(e,p)<145)damageEnemy(e,85);
    beep('power');putNotice('Pulso Java ativado · área protegida');updateHud();
  }
  function activateUltimate(){
    if(!game||game.status!=='running'||game.waveDelay>0||game.ultimate<100)return;
    const role=heroes[heroIndex].roleIndex,p=game.player;game.ultimate=0;game.ultimateUses++;
    if(role===0){
      p.reserve[p.weapon]+=weapons[p.weapon].mag;
      for(let i=0;i<32;i++){const a=i*Math.PI*2/32;game.particles.push({x:p.x,y:p.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:.5,size:5,color:'#ffd183'})}
      for(const enemy of [...game.enemies])if(game.status==='running'&&distance(enemy,p)<225)damageEnemy(enemy,110);
    }else if(role===1){p.shield=75;p.inv=Math.max(p.inv,4);game.ultimateTime=4;
      for(let i=0;i<32;i++){const a=i*Math.PI*2/32;game.particles.push({x:p.x,y:p.y,vx:Math.cos(a)*155,vy:Math.sin(a)*155,life:.8,size:5,color:'#91ebff'})}
    }else{p.dash=0;p.inv=Math.max(p.inv,1.5);game.ultimateTime=7;
      for(let i=0;i<32;i++){const a=i*Math.PI*2/32;game.particles.push({x:p.x,y:p.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,life:.5,size:5,color:'#d4b0ff'})}
    }
    beep('power');putNotice('PODER ESPECIAL · '+roles[role].power);updateHud();
  }
  function killEnemy(enemy){
    game.enemies.splice(game.enemies.indexOf(enemy),1);game.kills++;game.ultimate=Math.min(100,game.ultimate+25+(enemy.boss?25:0));game.combo=game.comboTime>0?game.combo+1:1;game.comboTime=5;
    if(!game.contractDone){
      game.contractKills++;
      if(game.contractKills>=game.contractGoal){
        game.contractDone=true;game.contractsCompleted++;game.score+=250;
        const p=game.player;p.shield=Math.min(75,p.shield+15);p.reserve[p.weapon]+=weapons[p.weapon].mag;game.ultimate=Math.min(100,game.ultimate+20);
        putNotice('CONTRATO CUMPRIDO · +250 pontos, escudo, munição e poder');beep('power');
      }
    }
    game.score+=(120+Math.min(8,game.combo-1)*25+(enemy.boss?300:0))*(game.event==='double'?2:1);
    for(let i=0;i<11;i++)game.particles.push({x:enemy.x,y:enemy.y,vx:random(-110,110),vy:random(-110,110),life:random(.25,.65),size:random(2,5),color:'#fa9573'});
    if(Math.random()<.58||enemy.boss)game.pickups.push({x:enemy.x,y:enemy.y,type:enemy.boss?'pulse':['ammo','shield','health','pulse'][Math.floor(Math.random()*4)]});
    beep('hit');updateHud();
    if(!game.enemies.length){
      endSurprise();
      if(game.wave===3){endMatch(true);return}
      game.status='between';game.waveDelay=3;game.bullets=[];firing=false;keyboardFiring=false;
      game.nextEvent=Math.max(game.nextEvent,8);
      const announcement=app.querySelector('#jbaEventAnnounce');if(announcement)announcement.textContent='Onda '+game.wave+' concluída. Próxima onda em três segundos.';
      beep('win');putNotice('Onda '+game.wave+' concluída · próxima onda em 3s');updateHud();
    }
  }
  function damageEnemy(enemy,damage){
    const absorbed=Math.min(enemy.shield||0,damage);
    enemy.shield=Math.max(0,(enemy.shield||0)-absorbed);enemy.hp-=damage-absorbed;
    if(enemy.hp<=0)killEnemy(enemy);else beep('hit');
  }
  function rescuePlayer(){
    if(!game.rescueAvailable)return false;
    const p=game.player;game.rescueAvailable=0;game.rescued++;game.rescueTime=3;
    p.x=580;p.y=340;p.hp=65;p.shield=Math.max(p.shield,35);p.inv=3;
    game.bullets=game.bullets.filter(b=>b.owner!=='enemy');
    const announcement=app.querySelector('#jbaEventAnnounce');if(announcement)announcement.textContent='O professor te resgatou! Você ganhou uma segunda chance.';
    beep('win');putNotice('O professor te salvou! Segunda chance ativada.');updateHud();return true;
  }
  function endMatch(win){
    if(!game||game.status==='won'||game.status==='lost')return;
    game.status=win?'won':'lost';firing=false;keyboardFiring=false;
    if(win){game.score+=Math.max(0,Math.round(220-game.elapsed))*4;wins++;beep('win')}
    if(game.score>best)best=game.score;
    save();updateHud();
    const overlay=app.querySelector('#jbaCover');overlay.hidden=false;
    overlay.innerHTML='<div class="jba-dialog"><span class="jba-kicker">'+(win?'MISSÃO CONCLUÍDA':'FIM DA PARTIDA')+'</span><h2>'+(win?'Você e o professor dominaram a arena!':'A equipe precisa de outra estratégia')+'</h2><p>'+game.kills+' adversários eliminados · '+game.score+' pontos · '+Math.ceil(game.elapsed)+'s de partida.</p><p>'+game.eventCount+' eventos surpresa · '+game.chestsFound+' baús raros encontrados · '+game.contractsCompleted+' contratos concluídos · '+game.rescued+' '+(game.rescued===1?'resgate':'resgates')+' do professor.</p><p>Seu recorde: '+best+' pontos · Vitórias: '+wins+'.</p><div class="jba-dialog-actions"><button type="button" data-jba-start>Jogar novamente</button><button type="button" class="jba-secondary" data-jba-leave>Voltar às trilhas</button></div></div>';
  }
  function advanceWave(){
    if(!game||game.status!=='between')return;
    game.wave++;game.waveDelay=0;game.status='running';
    if(rotateMaps)selectArena(arenaIndex+1);
    const p=game.player;p.hp=Math.min(100,p.hp+12);p.shield=Math.min(75,p.shield+20);p.reserve[p.weapon]+=weapons[p.weapon].mag;
    spawnWave();putNotice('Onda '+game.wave+' iniciada · reforço automático de vida, escudo e munição');updateHud();
  }
  function update(dt){
    const p=game.player,t=game.teacher;
    const previousCountdown=Math.ceil(game.waveDelay);
    if(game.status==='between'){
      game.waveDelay=Math.max(0,game.waveDelay-dt);
      if(!game.waveDelay)advanceWave();
      else if(Math.ceil(game.waveDelay)!==previousCountdown)updateHud();
    }
    const between=game.status==='between';
    game.rescueTime=Math.max(0,game.rescueTime-dt);
    if(!between){
      game.elapsed+=dt;game.zone=Math.max(145,560-game.elapsed*2.25);
      if(game.event){game.eventTime-=dt;if(game.eventTime<=0)endSurprise()}
      else {game.nextEvent-=dt;if(game.nextEvent<=0)startSurprise()}
    }
    game.ultimateTime=Math.max(0,game.ultimateTime-dt);game.comboTime=Math.max(0,game.comboTime-dt);if(!game.comboTime)game.combo=0;
    p.cool=Math.max(0,p.cool-dt);p.dash=Math.max(0,p.dash-dt);p.inv=Math.max(0,p.inv-dt);
    if(p.reload>0){p.reload-=dt;if(p.reload<=0){const w=weapons[p.weapon],i=p.weapon,amount=Math.min(w.mag-p.ammo[i],p.reserve[i]);p.ammo[i]+=amount;p.reserve[i]-=amount;putNotice('Recarregado · '+w.name);updateHud()}}
    let mx=(pressed.has('d')||pressed.has('arrowright')?1:0)-(pressed.has('a')||pressed.has('arrowleft')?1:0)+joy.x;
    let my=(pressed.has('x')||pressed.has('arrowdown')?1:0)-(pressed.has('w')||pressed.has('arrowup')?1:0)+joy.y;
    const length=Math.hypot(mx,my);p.moving=length>.05;if(length>.05){const speed=game.event==='turbo'||heroes[heroIndex].roleIndex===2&&game.ultimateTime>0?278:heroes[heroIndex].roleIndex===2?212:188;move(p,mx/Math.max(1,length)*speed*dt,my/Math.max(1,length)*speed*dt);if(game.event==='turbo'&&Math.random()<.35)game.particles.push({x:p.x,y:p.y,vx:random(-30,30),vy:random(-30,30),life:.25,size:3,color:'#c5adff'})}
    if(firing)fire(!matchMedia('(pointer:fine)').matches);
    if(keyboardFiring)fire(true);
    const follow=Math.hypot(p.x-t.x,p.y-t.y);
    if(follow>75)move(t,(p.x-t.x)/follow*143*dt,(p.y-t.y)/follow*143*dt,15);
    t.cool-=dt;
    const nearest=game.enemies.reduce((a,b)=>!a||distance(b,t)<distance(a,t)?b:a,null);
    if(nearest&&distance(nearest,t)<350){t.angle=Math.atan2(nearest.y-t.y,nearest.x-t.x);if(t.cool<=0){const boosted=game.event==='teacher';shot('teacher',t.x+Math.cos(t.angle)*21,t.y+Math.sin(t.angle)*21,t.angle,boosted?27:11,boosted?740:600,boosted?'#ffd875':'#9bf4ed');t.cool=boosted?.32:.78}}
    for(const e of game.enemies){
      const d=distance(e,p),a=Math.atan2(p.y-e.y,p.x-e.x);e.angle=a;
      const go=d>170?1:d<115?-.7:0;
      move(e,(Math.cos(a)*go+Math.cos(a+Math.PI/2)*.28*e.side)*e.speed*dt,(Math.sin(a)*go+Math.sin(a+Math.PI/2)*.28*e.side)*e.speed*dt,17);
      e.cool-=dt;if(e.cool<=0&&d<390){shot('enemy',e.x+Math.cos(a)*18,e.y+Math.sin(a)*18,a,5+game.wave*2,300,'#ff765f',.16);e.cool=random(1.25,2.3)}
    }
    for(let i=game.bullets.length-1;i>=0;i--){
      const b=game.bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.life<=0||b.x<0||b.x>W||b.y<0||b.y>H||isBlocked(b.x,b.y,3)){game.bullets.splice(i,1);continue}
      if(b.owner==='enemy'){if(distance(b,p)<19&&p.inv<=0){let damage=b.damage;const absorbed=Math.min(p.shield,damage);p.shield-=absorbed;damage-=absorbed;p.hp=Math.max(0,p.hp-damage);p.inv=.2;beep('hit');game.bullets.splice(i,1);updateHud();if(p.hp<=0){if(!rescuePlayer())endMatch(false);return}}}
      else {const target=game.enemies.find(e=>distance(e,b)<19);if(target){game.bullets.splice(i,1);damageEnemy(target,b.damage);if(game.status!=='running')return}}
    }
    if(game.chest&&distance(p,game.chest)<38){
      const spot=game.chest;game.chest=null;game.chestsFound++;game.score+=500;
      p.hp=Math.min(100,p.hp+25);p.shield=Math.min(75,p.shield+30);game.pulses=Math.min(3,game.pulses+1);
      for(let i=0;i<30;i++)game.particles.push({x:spot.x,y:spot.y,vx:random(-180,180),vy:random(-180,180),life:random(.3,.8),size:random(3,6),color:'#ffe390'});
      endSurprise();beep('win');putNotice('BAÚ RARO! +500 pontos, vida, escudo e Pulso Java.');updateHud();
    }
    for(let i=game.pickups.length-1;i>=0;i--){
      const item=game.pickups[i];if(item.fall>0){item.fall=Math.max(0,item.fall-dt);continue}if(distance(p,item)>30)continue;
      if(item.type==='health'){p.hp=Math.min(100,p.hp+32);putNotice('Kit coletado · +32 de vida')}
      if(item.type==='shield'){p.shield=Math.min(75,p.shield+28);putNotice('Escudo coletado · +28')}
      if(item.type==='ammo'){p.reserve=p.reserve.map((v,j)=>v+weapons[j].mag);putNotice('Munição extra coletada')}
      if(item.type==='pulse'){game.pulses=Math.min(3,game.pulses+1);putNotice('Energia coletada · +1 Pulso Java')}
      game.pickups.splice(i,1);beep('power');updateHud();
    }
    if(!between&&Math.hypot(p.x-W/2,p.y-H/2)>game.zone){p.hp=Math.max(0,p.hp-12*dt);if(p.hp<=0){if(!rescuePlayer())endMatch(false);return}}
    game.particles=game.particles.filter(s=>{s.life-=dt;s.x+=(s.vx||0)*dt;s.y+=(s.vy||0)*dt;return s.life>0});
    if(Math.floor(game.elapsed*4)!==Math.floor((game.elapsed-dt)*4))updateHud();
  }
  function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
  function actor(entity,color,img,label){
    ctx.save();ctx.translate(entity.x,entity.y);
    ctx.shadowColor='#000';ctx.shadowBlur=13;ctx.shadowOffsetY=7;circle(0,5,21,'#0b1622c7');ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.rotate(entity.angle||0);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(11,-13);ctx.lineTo(29,-5);ctx.lineTo(29,5);ctx.lineTo(11,13);ctx.closePath();ctx.fill();
    circle(0,0,19,color);circle(0,0,15,'#122132');ctx.rotate(-(entity.angle||0));
    if(img&&img.complete&&img.naturalWidth)portrait(img,0,0,14,label==='PROFESSOR');else {circle(0,0,13,'#63778b');ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText((label||'B').charAt(0).toUpperCase(),0,0)}
    ctx.restore();
    ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.shadowColor='#06101d';ctx.shadowBlur=5;ctx.fillText(label,entity.x,entity.y-26);ctx.shadowBlur=0;
  }
  function drawHero(entity,img,label,face,filter='none'){
    const moving=entity.moving&&game?.status==='running';
    const stride=moving?Math.sin(game.elapsed*13)*2.5:0;
    const faceLeft=Math.cos(entity.angle||0)<-.2;
    ctx.save();ctx.translate(entity.x,entity.y);
    ctx.fillStyle='#071320a6';ctx.beginPath();ctx.ellipse(0,18,22,7,0,0,Math.PI*2);ctx.fill();
    if(faceLeft)ctx.scale(-1,1);
    if(img?.complete&&img.naturalWidth){
      const ratio=img.naturalWidth/img.naturalHeight,w=Math.min(68,79*ratio),h=w/ratio;
      ctx.translate(0,stride);ctx.rotate(moving?Math.sin(game.elapsed*13)*.035:0);
      ctx.filter=filter;ctx.drawImage(img,-w*.48,-h*.71,w,h);ctx.filter='none';
      if(face?.complete&&face.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(-w*.13,-h*.53,9,0,Math.PI*2);ctx.clip();portrait(face,-w*.13,-h*.53,9);ctx.restore();ctx.strokeStyle='#f9dca9';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-w*.13,-h*.53,9,0,Math.PI*2);ctx.stroke()}
    }else actor(entity,'#f2b25f',face,label);
    ctx.restore();
    ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.shadowColor='#06101d';ctx.shadowBlur=5;ctx.fillText(label,entity.x,entity.y-43);ctx.shadowBlur=0;
  }
  function draw(){
    if(!canvas||!ctx)return;
    const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const dpr=Math.min(devicePixelRatio||1,2),cw=Math.round(rect.width*dpr),ch=Math.round(rect.height*dpr);
    if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
    const zoom=immersive?0.68:1,vw=Math.min(W,H*rect.width/rect.height)*zoom,vh=H*zoom;
    const camera=game?clamp(game.player.x-vw/2,0,W-vw):clamp(W/2-vw/2,0,W-vw);
    const cameraY=game?clamp(game.player.y-vh*.6,0,H-vh):clamp(H/2-vh/2,0,H-vh);
    view={x:camera,y:cameraY,w:vw,h:vh};
    ctx.setTransform(cw/vw,0,0,ch/vh,-camera*cw/vw,-cameraY*ch/vh);ctx.clearRect(camera,cameraY,vw,vh);
    const background=getBackground(arenaIndex);
    if(background.complete&&background.naturalWidth)ctx.drawImage(background,0,0,W,H);
    else {ctx.fillStyle='#243943';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#3d555e';for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}}
    if(arenas[arenaIndex].variant){
      ctx.fillStyle='#11132e9c';ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#a8c8ff55';ctx.lineWidth=2;
      for(let i=0;i<24;i++){const x=(i*97+(game?.elapsed||0)*80)%W,y=(i*131+(game?.elapsed||0)*140)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+19);ctx.stroke()}
    }
    ctx.fillStyle='#06142050';ctx.fillRect(0,0,W,H);
    const radius=game?game.zone:560;
    ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(W/2,H/2,radius,0,Math.PI*2,true);ctx.fillStyle='#48367a6e';ctx.fill('evenodd');ctx.restore();
    ctx.beginPath();ctx.arc(W/2,H/2,radius,0,Math.PI*2);ctx.strokeStyle='#b9a7ff';ctx.lineWidth=4;ctx.setLineDash([13,10]);ctx.stroke();ctx.setLineDash([]);
    for(const c of covers){
      ctx.fillStyle='#0a1722a9';ctx.fillRect(c.x+5,c.y+8,c.w,c.h);
      ctx.fillStyle='#4d6572';ctx.fillRect(c.x,c.y,c.w,c.h);ctx.strokeStyle='#a9bdba';ctx.lineWidth=2;ctx.strokeRect(c.x+2,c.y+2,c.w-4,c.h-4);
      ctx.fillStyle='#263e4e';ctx.fillRect(c.x+9,c.y+9,c.w-18,c.h-18);
      ctx.strokeStyle='#c69665';ctx.beginPath();ctx.moveTo(c.x+12,c.y+c.h-12);ctx.lineTo(c.x+c.w-12,c.y+12);ctx.stroke();
    }
    if(game){
      for(const item of game.pickups){const color=item.type==='health'?'#ff7890':item.type==='shield'?'#8ceeff':item.type==='pulse'?'#bba4ff':'#ffd888';if(item.drop){ctx.beginPath();ctx.arc(item.x,item.y,18+Math.sin(game.elapsed*5)*3,0,Math.PI*2);ctx.strokeStyle='#ffe0ad';ctx.lineWidth=2;ctx.stroke()}if(item.fall>0){ctx.beginPath();ctx.moveTo(item.x,item.y-95*item.fall);ctx.lineTo(item.x,item.y-12);ctx.strokeStyle='#ffe4ab';ctx.lineWidth=3;ctx.stroke();circle(item.x,item.y-95*item.fall,9,color);continue}circle(item.x,item.y,14,'#0a172acc');circle(item.x,item.y,11,color);ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillStyle='#1b2532';ctx.fillText(item.type==='health'?'+':item.type==='shield'?'◆':item.type==='pulse'?'✦':'●',item.x,item.y+5)}
      if(game.chest){
        const c=game.chest;ctx.beginPath();ctx.arc(c.x,c.y,28+Math.sin(game.elapsed*6)*3,0,Math.PI*2);ctx.fillStyle='#ffd66a55';ctx.fill();
        ctx.fillStyle='#7d481c';ctx.fillRect(c.x-18,c.y-12,36,25);ctx.strokeStyle='#ffe495';ctx.lineWidth=3;ctx.strokeRect(c.x-18,c.y-12,36,25);
        ctx.fillStyle='#fff2b5';ctx.fillRect(c.x-3,c.y-12,6,25);ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff4c5';ctx.fillText('BAÚ RARO',c.x,c.y-34);
        const a=Math.atan2(c.y-game.player.y,c.x-game.player.x);ctx.save();ctx.translate(game.player.x,game.player.y-62);ctx.rotate(a+Math.PI/2);ctx.fillStyle='#ffe077';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(-7,7);ctx.lineTo(7,7);ctx.closePath();ctx.fill();ctx.restore();
      }
      for(const b of game.bullets){circle(b.x,b.y,b.owner==='enemy'?4:5,b.color)}
      for(const e of game.enemies){actor(e,e.boss?'#a971e3':'#dc6871',e.image,e.name);if(e.shield>0){ctx.beginPath();ctx.arc(e.x,e.y,24,0,Math.PI*2);ctx.strokeStyle='#8defff';ctx.lineWidth=3;ctx.stroke()}ctx.fillStyle='#1d2636';ctx.fillRect(e.x-22,e.y-43,44,5);ctx.fillStyle=e.boss?'#cfa1ff':'#f48b78';ctx.fillRect(e.x-22,e.y-43,44*Math.max(0,e.hp/e.max),5)}
      if(keyboardFiring){const target=nearestEnemy();if(target){const radius=28+Math.sin(game.elapsed*10)*2;ctx.beginPath();ctx.arc(target.x,target.y,radius,0,Math.PI*2);ctx.strokeStyle='#ffe59a';ctx.lineWidth=2.5;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffe59a';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('ALVO',target.x,target.y-radius-6)}}
      drawHero(game.teacher,teacher,'PROFESSOR',null);
      if(game.event==='teacher'){ctx.beginPath();ctx.arc(game.teacher.x,game.teacher.y,28+Math.sin(game.elapsed*10)*2,0,Math.PI*2);ctx.strokeStyle='#ffe28b';ctx.lineWidth=4;ctx.stroke()}
      ctx.save();ctx.beginPath();ctx.arc(game.player.x,game.player.y,29,0,Math.PI*2);ctx.strokeStyle=roles[heroes[heroIndex].roleIndex].color;ctx.lineWidth=2;ctx.stroke();ctx.restore();
      drawHero(game.player,heroImages[heroes[heroIndex].baseIndex],'ALUNO',photo,roles[heroes[heroIndex].roleIndex].filter);
      if(game.event==='shields'){ctx.beginPath();ctx.arc(game.player.x,game.player.y,27,0,Math.PI*2);ctx.strokeStyle='#8defff';ctx.lineWidth=3;ctx.stroke()}
      for(const s of game.particles){ctx.globalAlpha=clamp(s.life/.4,0,1);circle(s.x,s.y,s.size,s.color);ctx.globalAlpha=1}
      if(Math.hypot(game.player.x-W/2,game.player.y-H/2)>radius){ctx.font='bold 19px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffb0d0';ctx.fillText('VOLTE PARA A ZONA SEGURA',game.player.x,game.player.y-52)}
      const mapX=camera+vw-148,mapY=cameraY+13;
      ctx.fillStyle='#0b1a2bcc';ctx.fillRect(mapX,mapY,135,91);ctx.strokeStyle='#9bafbf';ctx.strokeRect(mapX,mapY,135,91);
      for(const e of game.enemies)circle(mapX+e.x/W*135,mapY+e.y/H*91,2,'#ff847d');
      circle(mapX+game.player.x/W*135,mapY+game.player.y/H*91,3.5,'#ffd78e');
      if(game.chest)circle(mapX+game.chest.x/W*135,mapY+game.chest.y/H*91,4,'#ffe36b');
    }else{drawHero({x:480,y:380,angle:0},heroImages[heroes[heroIndex].baseIndex],'ALUNO',photo,roles[heroes[heroIndex].roleIndex].filter);drawHero({x:430,y:400,angle:0},teacher,'PROFESSOR',null)}
  }
  function tick(now){
    if(screen!=='battle')return;
    const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    if(game?.status==='running'||game?.status==='between')update(dt);
    draw();raf=requestAnimationFrame(tick);
  }
  function startGame(){
    game=makeState();game.status='running';pressed.clear();firing=false;keyboardFiring=false;joy={x:0,y:0};
    app.querySelector('#jbaCover').hidden=true;spawnWave();updateHud();
    audio=audio||null;if(soundOn)beep('power');
  }
  function pauseGame(){
    if(!game)return;
    const overlay=app.querySelector('#jbaCover');
    if(game.status==='paused'){game.status=game.resumeStatus||'running';overlay.hidden=true;putNotice('Partida retomada')}
    else if(game.status==='running'||game.status==='between'){
      game.resumeStatus=game.status;game.status='paused';firing=false;keyboardFiring=false;overlay.hidden=false;
      overlay.innerHTML='<div class="jba-dialog"><span class="jba-kicker">PAUSA</span><h2>Respira, a arena espera.</h2><p>Seu progresso nesta partida permanece até você voltar ou reiniciar.</p><div class="jba-dialog-actions"><button type="button" data-jba-resume>Continuar partida</button><button type="button" class="jba-secondary" data-jba-start>Recomeçar</button></div></div>';
    }
  }
  function renderGallery(kind){
    const isHero=kind==='hero',items=isHero?heroes:arenas,page=isHero?heroPage:mapPage,chosen=isHero?heroIndex:arenaIndex;
    const target=app.querySelector(isHero?'#jbaHeroes':'#jbaMaps');if(!target)return;
    target.innerHTML=items.slice(page*6,page*6+6).map((item,offset)=>{
      const i=page*6+offset,selected=i===chosen;
      return isHero?`<button type="button" class="jba-hero ${selected?'selected':''}" data-jba-hero="${i}" aria-pressed="${selected}"><img src="${item.src}" alt="" loading="lazy" style="filter:${roles[item.roleIndex].filter}"><span><b>${item.name}</b><small>${roles[item.roleIndex].desc}</small></span></button>`
        :`<button type="button" class="jba-map ${selected?'selected':''}" data-jba-map="${i}" aria-pressed="${selected}"><img src="${item.src}" alt="" loading="lazy" decoding="async" style="filter:${item.variant?'brightness(.65) saturate(1.1) hue-rotate(18deg)':'none'}"><strong>${item.name}</strong><small>${item.desc}</small></button>`;
    }).join('');
    const range=app.querySelector(isHero?'#jbaHeroRange':'#jbaMapRange');if(range)range.textContent=(page*6+1)+'–'+Math.min(items.length,page*6+6)+' de '+items.length;
    const selected=app.querySelector(isHero?'#jbaHeroSelected':'#jbaMapSelected');if(selected)selected.textContent='Selecionado: '+items[chosen].name;
  }
  function toggleCamera(){
    immersive=!immersive;save();app.querySelector('#jbaStage')?.classList.toggle('immersive',immersive);
    const b=app.querySelector('[data-jba-camera]');if(b){b.textContent=immersive?'Visão próxima':'Visão clássica';b.setAttribute('aria-pressed',String(immersive))}
    const input=app.querySelector('#jbaCameraStart');if(input)input.checked=immersive;
    draw();putNotice(immersive?'Visão próxima ativada':'Visão clássica ativada');
  }
  function showIntro(){
    const overlay=app.querySelector('#jbaCover');overlay.hidden=false;
    overlay.innerHTML=`<div class="jba-dialog jba-intro"><span class="jba-kicker">JAVA ROYALE · ARENA JAVA</span><h2>Escolha sua equipe e entre na arena.</h2><p>Três ondas com o professor, armas, suprimentos, eventos surpresa e um poder especial que carrega com eliminações.</p><div class="jba-customize"><strong>Personagens · 30 opções</strong><span id="jbaHeroSelected" class="jba-current"></span><div class="jba-heroes" id="jbaHeroes"></div><div class="jba-pages"><button type="button" data-jba-page="hero:-1">Anterior</button><span id="jbaHeroRange"></span><button type="button" data-jba-page="hero:1">Próximos</button></div><strong>Arma inicial</strong><div class="jba-loadout">${weapons.map((weapon,i)=>`<button type="button" class="${startWeapon===i?'selected':''}" data-jba-weapon="${i}" aria-pressed="${startWeapon===i}">${weapon.name}</button>`).join('')}</div><small>Assalto: munição e rajada · Guardião: escudo e domo · Veloz: velocidade e impulso. A arma pode ser trocada durante a partida.</small></div><div class="jba-map-header"><strong>Cenários · 30 opções</strong><span>15 locais em duas atmosferas</span></div><span id="jbaMapSelected" class="jba-current"></span><div class="jba-maps" id="jbaMaps"></div><div class="jba-pages"><button type="button" data-jba-page="map:-1">Anterior</button><span id="jbaMapRange"></span><button type="button" data-jba-page="map:1">Próximos</button></div><label class="jba-rotation"><input id="jbaRotateMaps" type="checkbox" ${rotateMaps?'checked':''}>Trocar cenário automaticamente a cada onda</label><label class="jba-rotation"><input id="jbaCameraStart" type="checkbox" ${immersive?'checked':''}>Visão próxima · câmera acompanha o personagem</label><label class="jba-face-picker"><img id="jbaPhotoPreview" src="assets/professor-cartoon-portrait.webp" alt="Prévia do seu personagem"><span>Escolher uma foto para o personagem<br><small>Fica somente neste aparelho, nesta partida.</small></span><input id="jbaPhoto" type="file" accept="image/*" aria-label="Escolher foto do personagem"></label><details class="jba-rivals"><summary>Personalizar rivais da turma</summary><label for="jbaPeers">Nomes dos colegas (separados por vírgula)</label><input id="jbaPeers" type="text" maxlength="190" placeholder="Ex.: Ana, Gui, Bia" value="${esc(peerNames.join(', '))}"><label for="jbaPeerPhotos">Fotos dos rivais (opcional, até 8)</label><input id="jbaPeerPhotos" type="file" accept="image/*" multiple><small id="jbaRivalCount">${rivalPhotos.length?rivalPhotos.length+' fotos prontas':'Sem fotos: rivais ilustrados'}</small><p>Use fotos com permissão. As imagens ficam só nesta sessão neste aparelho; os nomes são lembrados neste navegador.</p></details><p>As ondas avançam sozinhas após uma contagem breve. O professor pode te salvar uma vez por partida.</p><div class="jba-dialog-actions"><button type="button" data-jba-start>Entrar na arena</button></div></div>`;
    overlay.querySelector('.jba-dialog-actions').insertAdjacentHTML('beforeend','<button type="button" class="jba-squad-entry" data-jba-squad>Esquadrão da Turma · jogar online com até 4 alunos</button>');
    heroPage=Math.floor(heroIndex/6);mapPage=Math.floor(arenaIndex/6);renderGallery('hero');renderGallery('map');
    if(photo?.src)app.querySelector('#jbaPhotoPreview').src=photo.src;
  }
  function renderBattle(){
    app.innerHTML='<div class="jba-page"><header class="jba-top"><div class="jba-title"><span class="jba-titlemark">J</span><div><small>JAVALINGO · JOGO DE AÇÃO</small><h1>Java Royale</h1></div></div><div class="jba-top-actions"><button type="button" data-jba-map-next>Cenário: '+arenas[arenaIndex].name+'</button><button type="button" data-jba-camera aria-pressed="'+immersive+'">'+(immersive?'Visão próxima':'Visão clássica')+'</button><button type="button" data-jba-sound aria-pressed="'+soundOn+'">'+(soundOn?'Som ligado':'Som desligado')+'</button><button type="button" data-jba-full>Tela cheia</button><button type="button" data-jba-pause>Pausar</button><button type="button" data-jba-leave>Voltar</button></div></header><div class="jba-shell"><div class="jba-hud"><span class="jba-hud-card"><img class="jba-hud-face" id="jbaHudPhoto" src="assets/professor-cartoon-portrait.webp" alt="">Você</span><span class="jba-hud-card">Vida <span class="jba-healthbar"><i id="jbaLifeBar"></i></span><strong id="jbaLife">100</strong></span><span class="jba-hud-card">Escudo <span class="jba-healthbar shield"><i id="jbaShieldBar"></i></span><strong id="jbaShield">55</strong></span><span class="jba-hud-card">Onda <strong id="jbaWave">1/3</strong></span><span class="jba-hud-card">Eliminações <strong id="jbaKills">0</strong></span><span class="jba-hud-card">Combo <strong id="jbaCombo">—</strong></span><span class="jba-hud-card jba-contract">Contrato <strong id="jbaContract">0/3</strong></span><span class="jba-hud-card jba-hud-power"><span id="jbaPowerName">Poder</span> <strong id="jbaUltimate">0%</strong></span><span class="jba-hud-card">Pulso <strong id="jbaPulse">2 cargas</strong></span><span class="jba-hud-card">Resgate <strong id="jbaRescue">Pronto</strong></span><span class="jba-hud-card">Zona <strong id="jbaZone">560</strong></span><span class="jba-hud-card jba-weapon"><strong id="jbaWeapon">Rifle Aurora</strong><span id="jbaAmmo">28 / 168</span></span></div><div class="jba-stage '+(immersive?'immersive':'')+'" id="jbaStage"><canvas class="jba-canvas" id="jbaCanvas" aria-label="Arena de batalha com o aluno, o professor, adversários e zona segura"></canvas><div class="jba-event" id="jbaEvent" hidden aria-live="off"><span id="jbaEventLabel">EVENTO SURPRESA</span><strong id="jbaEventName"></strong><small id="jbaEventTime"></small></div><span class="jba-visually-hidden" id="jbaEventAnnounce" role="status"></span><div class="jba-cover" id="jbaCover"></div></div><div class="jba-touch"><div class="jba-stick" id="jbaStick" role="group" aria-label="Controle de movimento"><div class="jba-knob" id="jbaKnob"></div></div><div class="jba-touch-actions"><button type="button" class="fire" data-jba-fire>Atirar</button><button type="button" data-jba-dash>Impulso</button><button type="button" data-jba-switch>Arma</button><button type="button" data-jba-reload>Recarregar</button><button type="button" data-jba-pulse>Pulso Java</button><button type="button" class="jba-ultimate" data-jba-ultimate disabled>Poder 0%</button></div></div><div class="jba-controls"><button type="button" class="jba-primary" data-jba-fire>Atirar</button><button type="button" data-jba-switch>Trocar arma</button><button type="button" data-jba-reload>Recarregar</button><button type="button" data-jba-dash id="jbaDash">Impulso pronto</button><button type="button" class="jba-pulse" data-jba-pulse>Pulso Java</button><button type="button" class="jba-ultimate" data-jba-ultimate disabled>Poder 0%</button></div><p class="jba-help"><span class="desktop-only">Setas ou W/A/X/D para andar · Segure S ou Shift para atirar com mira automática · Mouse para mirar manualmente · Clique para atirar manualmente · R recarrega · Q troca arma · Espaço dá impulso · F ativa Pulso Java · E usa o poder especial · V muda a câmera. </span>No celular, use o controle de movimento e o botão Atirar (mira automática). O professor ajuda você.</p><div class="jba-status" id="jbaStatus" role="status"></div><p class="jba-footnote">Partida individual contra adversários controlados pelo jogo. Fotos escolhidas não são enviadas nem salvas pelo JavaLingo.</p></div></div>';
    canvas=app.querySelector('#jbaCanvas');ctx=canvas.getContext('2d');
    game=null;showIntro();if(photo?.src)app.querySelector('#jbaHudPhoto').src=photo.src;draw();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();aim={x:view.x+(e.clientX-r.left)/r.width*view.w,y:view.y+(e.clientY-r.top)/r.height*view.h}});
    canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){firing=true;fire(false)}});
    canvas.addEventListener('pointerup',()=>{firing=false});
    canvas.addEventListener('pointerleave',()=>{firing=false});
    const stick=app.querySelector('#jbaStick'),knob=app.querySelector('#jbaKnob');
    function setStick(e){const r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),m=Math.max(1,Math.hypot(dx,dy)),power=Math.min(1,m/42);joy={x:dx/m*power,y:dy/m*power};knob.style.left=(50+joy.x*28)+'%';knob.style.top=(50+joy.y*28)+'%'}
    stick.addEventListener('pointerdown',e=>{stick.setPointerCapture(e.pointerId);setStick(e)});
    stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))setStick(e)});
    const release=()=>{joy={x:0,y:0};knob.style.left='50%';knob.style.top='50%'};
    stick.addEventListener('pointerup',release);stick.addEventListener('pointercancel',release);
  }
  function cleanup(){cancelAnimationFrame(raf);raf=0;canvas=null;ctx=null;game=null;firing=false;keyboardFiring=false;pressed.clear();joy={x:0,y:0}}
  const previousHome=renderHome;
  renderHome=function(){previousHome();const card='<button type="button" class="jba-entry" data-jba-open><span class="jba-entry-badge"><img src="assets/royale-hero-1.webp" alt="" aria-hidden="true"></span><span class="jba-entry-text"><small>JOGO · AÇÃO EM JAVA</small><strong>Java Royale</strong><span>Entre na arena com o professor, escolha o cenário e viva eventos surpresa a cada partida.</span></span><span class="jba-entry-go">Jogar agora →</span></button>';const anchor=app.querySelector('.jpg-home-card')||app.querySelector('.home-hero');anchor?.insertAdjacentHTML('afterend',card)};
  const previousRender=render;
  render=function(){if(screen==='battle'){setNav();updateStats();renderBattle()}else{if(canvas)cleanup();previousRender()}};
  const previousNav=setNav;
  setNav=function(){previousNav();if(screen==='battle')$('#breadcrumb').textContent='Java Royale'};
  const nav=document.createElement('button');nav.type='button';nav.className='nav-item';nav.dataset.nav='battle';nav.innerHTML=icon('spark')+' Java Royale';nav.addEventListener('click',()=>navigate('battle'));document.querySelector('.sidebar nav [data-nav="professor-game"]')?.after(nav);
  app.addEventListener('click',e=>{
    const b=e.target.closest('[data-jba-open],[data-jba-start],[data-jba-squad],[data-jba-resume],[data-jba-leave],[data-jba-pause],[data-jba-full],[data-jba-sound],[data-jba-switch],[data-jba-reload],[data-jba-dash],[data-jba-fire],[data-jba-map],[data-jba-map-next],[data-jba-pulse],[data-jba-hero],[data-jba-weapon],[data-jba-page],[data-jba-camera],[data-jba-ultimate]');
    if(!b)return;
    if(b.hasAttribute('data-jba-open')){navigate('battle');return}
    if(screen!=='battle')return;
    if(b.hasAttribute('data-jba-squad')){window.JavaSquad?.open({hero:heroes[heroIndex],arena:arenas[arenaIndex],arenaIndex});return}
    if(b.hasAttribute('data-jba-page')){const [kind,delta]=b.dataset.jbaPage.split(':');if(kind==='hero')heroPage=(heroPage+Number(delta)+5)%5;else mapPage=(mapPage+Number(delta)+5)%5;renderGallery(kind);return}
    if(b.hasAttribute('data-jba-camera')){toggleCamera();return}
    if(b.hasAttribute('data-jba-ultimate')){activateUltimate();return}
    if(b.hasAttribute('data-jba-map')||b.hasAttribute('data-jba-map-next')){
      selectArena(b.hasAttribute('data-jba-map-next')?arenaIndex+1:Number(b.dataset.jbaMap));renderGallery('map');return;
    }
    if(b.hasAttribute('data-jba-hero')){heroIndex=Number(b.dataset.jbaHero);save();renderGallery('hero');draw();return}
    if(b.hasAttribute('data-jba-weapon')){startWeapon=Number(b.dataset.jbaWeapon);save();app.querySelectorAll('[data-jba-weapon]').forEach(el=>{const chosen=Number(el.dataset.jbaWeapon)===startWeapon;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen))});return}
    if(b.hasAttribute('data-jba-start')){startGame();return}
    if(b.hasAttribute('data-jba-resume')||b.hasAttribute('data-jba-pause')){pauseGame();return}
    if(b.hasAttribute('data-jba-leave')){navigate('home');return}
    if(b.hasAttribute('data-jba-full')){const page=app.querySelector('.jba-page');if(document.fullscreenElement)document.exitFullscreen();else page?.requestFullscreen?.().catch(()=>putNotice('Tela cheia indisponível neste aparelho.'));return}
    if(b.hasAttribute('data-jba-sound')){soundOn=!soundOn;save();b.textContent=soundOn?'Som ligado':'Som desligado';b.setAttribute('aria-pressed',String(soundOn));if(soundOn)beep('power');return}
    if(b.hasAttribute('data-jba-switch')){swapWeapon();return}
    if(b.hasAttribute('data-jba-reload')){reload();return}
    if(b.hasAttribute('data-jba-dash')){dash();return}
    if(b.hasAttribute('data-jba-pulse')){pulse();return}
    if(b.hasAttribute('data-jba-fire')){fire(true);return}
  });
  app.addEventListener('pointerdown',e=>{if(screen==='battle'&&e.target.closest('[data-jba-fire]')){firing=true;fire(true)}});
  app.addEventListener('pointerup',e=>{if(screen==='battle'&&e.target.closest('[data-jba-fire]'))firing=false});
  app.addEventListener('pointercancel',()=>{firing=false});
  app.addEventListener('change',e=>{
    if(e.target.id==='jbaCameraStart'){toggleCamera();return}
    if(e.target.id==='jbaRotateMaps'){rotateMaps=e.target.checked;save();putNotice(rotateMaps?'Rotação de cenários ligada':'Rotação de cenários desligada');return}
    if(e.target.id==='jbaPeerPhotos'){
      const files=[...(e.target.files||[])].slice(0,8).filter(file=>file.type.startsWith('image/')&&file.size<=8*1024*1024);
      rivalPhotoUrls.forEach(url=>URL.revokeObjectURL(url));rivalPhotoUrls=[];rivalPhotos=[];
      for(const file of files){const url=URL.createObjectURL(file),img=new Image();img.src=url;rivalPhotoUrls.push(url);rivalPhotos.push(img)}
      const count=app.querySelector('#jbaRivalCount');if(count)count.textContent=files.length?files.length+' fotos prontas para os rivais':'Sem fotos: rivais ilustrados';
      if((e.target.files?.length||0)>files.length)putNotice('Use até 8 imagens, com até 8 MB cada.');return;
    }
    if(e.target.id!=='jbaPhoto')return;
    const file=e.target.files?.[0];if(!file)return;
    if(!file.type.startsWith('image/')||file.size>8*1024*1024){putNotice('Escolha uma imagem de até 8 MB.');return}
    if(photoUrl)URL.revokeObjectURL(photoUrl);
    photoUrl=URL.createObjectURL(file);photo=new Image();
    photo.onload=()=>{const preview=app.querySelector('#jbaPhotoPreview'),hud=app.querySelector('#jbaHudPhoto');if(preview)preview.src=photoUrl;if(hud)hud.src=photoUrl;draw()};
    photo.onerror=()=>putNotice('Não foi possível abrir esta foto.');
    photo.src=photoUrl;
  });
  app.addEventListener('input',e=>{
    if(e.target.id!=='jbaPeers')return;
    peerNames=e.target.value.split(',').map(s=>s.trim().slice(0,18)).filter(Boolean).slice(0,8);save();
  });
  window.addEventListener('keydown',e=>{
    if(screen!=='battle')return;
    if(e.target.closest?.('input,textarea,[contenteditable]'))return;
    const key=e.key.toLowerCase();
    if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','x','r','q','f','e','v','shift','escape'].includes(key))e.preventDefault();
    pressed.add(key);
    if(key==='s'||key==='shift'){keyboardFiring=true;if(!e.repeat)fire(true);return}
    if(e.repeat)return;
    if(key==='r')reload();if(key==='q')swapWeapon();if(key===' ')dash();if(key==='f')pulse();if(key==='e')activateUltimate();if(key==='v')toggleCamera();if(key==='escape')pauseGame();
  });
  window.addEventListener('keyup',e=>{pressed.delete(e.key.toLowerCase());keyboardFiring=pressed.has('s')||pressed.has('shift')});
  window.addEventListener('blur',()=>{pressed.clear();firing=false;keyboardFiring=false;if(screen==='battle'&&['running','between'].includes(game?.status))pauseGame()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='battle'&&['running','between'].includes(game?.status))pauseGame()});
  if(screen==='home')render();
})();
