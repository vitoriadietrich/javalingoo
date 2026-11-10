'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const heroArt = Array.from({length:10}, (_,i) => {
    const img = new Image(); img.src = 'assets/royale-hero-'+(i+1)+'.webp'; return img;
  });
  const teacher = new Image(); teacher.src = 'assets/professor-mascote.png?v=2';
  const scenes = [
    'arena-campus-dusk.png','arena-circuit-neon.webp','arena-solar-valley.webp','arena-tidal-harbor.webp','arena-jungle-temple.webp',
    'arena-volcanic-forge.webp','arena-glacial-outpost.webp','arena-lunar-base.webp','arena-sakura-garden.webp','arena-skyport-dawn.webp',
    'royale-new-scene-1.webp','royale-new-scene-2.webp','royale-new-scene-3.webp','royale-new-scene-4.webp','royale-new-scene-5.webp'
  ];
  const roles = ['Assalto','Guardião','Veloz'];
  const bosses = ['Colosso Null','Leviatã Loop','Bug Supremo'];
  const puzzles = [
    {q:'Qual declaração cria uma variável inteira em Java?', choices:['integer vidas = 3;','int vidas = 3;','var int vidas = 3;']},
    {q:'Qual laço repete três vezes?', choices:['for (i < 3)','while (3)','for (int i = 0; i < 3; i++)']},
    {q:'Que palavra indica herança entre classes?', choices:['extends','implements','inherits']},
  ];
  let config, credential, state, image, frame = 0, timer = 0, last = 0, busy = false, keys = new Set();
  let local = {x:400,y:430}, joy = {x:0,y:0}, firing = false, action = {}, flash = [], lastPhase = '';
  let canvas, ctx, stage, noticeTimeout;

  function notice(message, bad = false) {
    const el = $('#jsqNotice'); if (!el) return;
    el.textContent = message; el.classList.toggle('bad',bad);
    clearTimeout(noticeTimeout); noticeTimeout = setTimeout(() => { if(el) el.textContent=''; },4800);
  }
  async function api(route, payload) {
    const response = await fetch('/api/squad/'+route,{
      method:'POST', headers:{'content-type':'application/json'},
      body:JSON.stringify({...credential,...payload}), cache:'no-store'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Sem conexão com a sala.');
    return result;
  }
  function stop() {
    cancelAnimationFrame(frame); clearInterval(timer); clearTimeout(noticeTimeout);
    controller?.abort();
    window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup);
    keys.clear(); firing=false; busy=false; state=null;
  }
  function leave() {
    if (credential) api('leave',{}).catch(()=>{});
    credential=null; sessionStorage.removeItem('java-squad-session');
    stop(); navigate('battle');
  }
  function page() {
    const app = $('#app');
    app.innerHTML = `<div class="jsq-page"><header class="jsq-header"><div><span class="jsq-eyebrow">JAVA ROYALE · COOPERATIVO ONLINE</span><h1>Esquadrão da Turma</h1><p>Quatro alunos, uma arena, três chefes. O professor luta com vocês.</p></div><button type="button" class="jsq-back" data-jsq-back>← Voltar ao Java Royale</button></header>
      <div class="jsq-body"><section class="jsq-arena"><div class="jsq-stage" id="jsqStage"><canvas id="jsqCanvas" width="960" height="600" aria-label="Arena online com jogadores, professor e chefe"></canvas><div class="jsq-center" id="jsqCenter"></div><div class="jsq-count" id="jsqCount"></div></div>
      <div class="jsq-controls" id="jsqControls" hidden><div class="jsq-stick" id="jsqStick"><div class="jsq-knob" id="jsqKnob"></div></div><div class="jsq-buttons"><button type="button" data-jsq-fire>Atirar</button><button type="button" data-jsq-power>Poder E</button><button type="button" data-jsq-revive>Resgatar F</button><button type="button" data-jsq-reload>Recarregar R</button></div></div>
      <p class="jsq-help">Setas ou W/A/X/D movem · Segure S ou Shift para atirar · E usa o poder · F resgata um aliado próximo · R recarrega. No celular, use o controle e os botões.</p></section>
      <aside class="jsq-side"><div class="jsq-card jsq-room" id="jsqRoom"></div><div class="jsq-card jsq-team"><h2>Equipe em tempo real <span id="jsqOnline">0/4</span></h2><div id="jsqPlayers"></div></div><div class="jsq-card jsq-lesson" id="jsqLesson" hidden></div><div class="jsq-card jsq-tips"><h2>Plano da turma</h2><p>Trabalhem juntos para vencer cada chefe. Uma resposta certa ao desafio Java fortalece toda a equipe. O professor ataca e recupera vida a cada poucos segundos.</p></div></aside></div><div id="jsqNotice" class="jsq-notice" role="status"></div></div>`;
    $('#breadcrumb').textContent='Java Royale · Esquadrão';
    canvas=$('#jsqCanvas');ctx=canvas.getContext('2d');stage=$('#jsqStage');
    image=new Image();image.src=config.arena.src;
    app.addEventListener('click', click, {signal:controller.signal});
    const stick=$('#jsqStick'),knob=$('#jsqKnob');
    const move=e=>{const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,m=Math.max(1,Math.hypot(dx,dy));joy={x:dx/m*Math.min(1,m/42),y:dy/m*Math.min(1,m/42)};knob.style.transform=`translate(${joy.x*30}px,${joy.y*30}px)`};
    stick.addEventListener('pointerdown',e=>{stick.setPointerCapture(e.pointerId);move(e)});
    stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))move(e)});
    const reset=()=>{joy={x:0,y:0};knob.style.transform=''};
    stick.addEventListener('pointerup',reset);stick.addEventListener('pointercancel',reset);
    app.querySelector('[data-jsq-fire]').addEventListener('pointerdown',e=>{e.currentTarget.setPointerCapture(e.pointerId);firing=true});
    for(const type of ['pointerup','pointercancel'])app.querySelector('[data-jsq-fire]').addEventListener(type,()=>firing=false);
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
    frame=requestAnimationFrame(draw);
  }
  let controller;
  function lobby() {
    $('#jsqCenter').innerHTML=`<div class="jsq-lobby"><span class="jsq-eyebrow">CONVOQUE SEU ESQUADRÃO</span><h2>Entrar na mesma partida é simples.</h2><p>Escolha um nome, crie a sala e compartilhe o código. Até quatro pessoas podem jogar em aparelhos diferentes.</p>
      <label>Seu nome no jogo<input id="jsqName" maxlength="18" autocomplete="nickname" placeholder="Ex.: Vitória"></label>
      <div class="jsq-lobby-actions"><button type="button" class="jsq-primary" data-jsq-create>Criar sala</button><span>ou</span><input id="jsqCode" maxlength="6" aria-label="Código da sala" placeholder="CÓDIGO"><button type="button" data-jsq-join>Entrar</button></div>
      <small>Personagem: ${escape(config.hero.name)} · Cenário ao criar: ${escape(config.arena.name)}</small></div>`;
    $('#jsqRoom').innerHTML='<h2>Esquadrão da Turma</h2><p>Uma sala privada por código, sem cadastro. Compartilhe o código apenas com quem vai jogar.</p>';
  }
  async function connect(kind) {
    const name=$('#jsqName')?.value.trim();
    if (!name) { notice('Escreva seu nome no jogo.',true); $('#jsqName')?.focus(); return; }
    const code=$('#jsqCode')?.value.trim().toUpperCase();
    try {
      const result=await api(kind,{name,code,hero:config.hero.baseIndex+config.hero.roleIndex*10,arena:config.arenaIndex});
      credential={code:result.code,id:result.id,token:result.token};
      sessionStorage.setItem('java-squad-session',JSON.stringify(credential));
      state=result.state; const me=state.players.find(p=>p.id===credential.id);local={x:me?.x||400,y:me?.y||430};
      refresh(); timer=setInterval(sync,300); notice('Sala conectada. Convide sua turma!');
    } catch(e) { notice(e.message,true); }
  }
  function click(e) {
    const b=e.target.closest('[data-jsq-create],[data-jsq-join],[data-jsq-start],[data-jsq-copy],[data-jsq-answer],[data-jsq-power],[data-jsq-revive],[data-jsq-reload],[data-jsq-fire],[data-jsq-back]');
    if (!b) return;
    if (b.hasAttribute('data-jsq-back')) {leave();return;}
    if (b.hasAttribute('data-jsq-create')) connect('create');
    if (b.hasAttribute('data-jsq-join')) connect('join');
    if (b.hasAttribute('data-jsq-start')) { action.start=true; sync(); }
    if (b.hasAttribute('data-jsq-copy')) navigator.clipboard?.writeText(credential.code).then(()=>notice('Código copiado.')).catch(()=>notice('Código: '+credential.code));
    if (b.hasAttribute('data-jsq-answer')) {action.answer=Number(b.dataset.jsqAnswer);sync();}
    if (b.hasAttribute('data-jsq-power')) {action.power=true;sync();}
    if (b.hasAttribute('data-jsq-revive')) revive();
    if (b.hasAttribute('data-jsq-reload')) {action.reload=true;sync();}
    if (b.hasAttribute('data-jsq-fire')) {firing=true;setTimeout(()=>firing=false,210);}
  }
  function revive() {
    const ally=state?.players.filter(p=>p.id!==credential?.id&&p.hp===0).sort((a,b)=>Math.hypot(a.x-local.x,a.y-local.y)-Math.hypot(b.x-local.x,b.y-local.y))[0];
    if (!ally || Math.hypot(ally.x-local.x,ally.y-local.y)>110) {notice('Aproxime-se de um colega caído para resgatá-lo.');return;}
    action.revive=ally.id;sync();
  }
  function keydown(e) {
    if (screen!=='squad'||/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')) return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
    if (e.repeat) return;
    if (e.key.toLowerCase()==='e') {action.power=true;sync();}
    if (e.key.toLowerCase()==='f') revive();
    if (e.key.toLowerCase()==='r') {action.reload=true;sync();}
  }
  function keyup(e) {keys.delete(e.key.toLowerCase())}
  async function sync() {
    if (!credential||busy||screen!=='squad')return;
    busy=true;
    const pending=action;action={};
    const me=state?.players.find(p=>p.id===credential.id);
    try {
      const result=await api('state',{...pending,x:local.x,y:local.y,fire:firing||keys.has('s')||keys.has('shift')});
      const previous=state?.room;state=result.state;
      if (!state) throw new Error('Sala encerrada.');
      const current=state.players.find(p=>p.id===credential.id);
      if (current && Math.hypot(local.x-current.x,local.y-current.y)>100) local={x:current.x,y:current.y};
      if (current && me && current.hp<me.hp) flash.push({x:local.x,y:local.y,t:performance.now(),type:'hit'});
      if (previous && state.room.wave>previous.wave) notice('Onda '+state.room.wave+'! O professor trouxe suprimentos.');
      refresh();
    } catch(e) {
      action={...pending,...action};
      notice(e.message,true);
      if (/Sessão|expirada|encerrada/.test(e.message)) {credential=null;sessionStorage.removeItem('java-squad-session');clearInterval(timer);lobby();}
    } finally {busy=false}
  }
  function refresh() {
    if (!state||!credential) return;
    const {room,players}=state,me=players.find(p=>p.id===credential.id);
    const arenaSrc='assets/'+scenes[room.arena%15];
    if(image.src!==new URL(arenaSrc,location.href).href)image.src=arenaSrc;
    $('#jsqOnline').textContent=players.length+'/4';
    $('#jsqPlayers').innerHTML=players.map(p=>`<div class="jsq-player ${p.hp?'':'down'}"><img src="assets/royale-hero-${(p.hero%10)+1}.webp" alt=""><div><strong>${escape(p.name)} ${p.id===room.host_id?'♛':''}</strong><small>${roles[p.role]} · ${p.hp?'Vida '+p.hp:'Precisa de resgate'}</small><span><i style="width:${p.hp}%"></i></span></div></div>`).join('')+'<div class="jsq-prof"><img src="assets/professor-mascote.png?v=2" alt=""><span><strong>Professor Javi</strong><small>Apoio automático · cura e ataque</small></span></div>';
    $('#jsqRoom').innerHTML=`<span class="jsq-eyebrow">SALA ${escape(room.code)}</span><h2>${room.phase==='lobby'?'Aguardando equipe':room.phase==='playing'?'Onda '+room.wave+' · '+bosses[room.wave-1]:room.phase==='won'?'Vitória da turma!':'Equipe derrotada'}</h2><p>${room.phase==='lobby'?'Compartilhe o código para chamar mais alunos.':'Munição '+(me?.ammo??0)+'/28 · Poder '+(me?.power??0)+'% · Pontos '+(me?.score??0)}</p><button type="button" data-jsq-copy>Copiar código</button>`;
    const center=$('#jsqCenter');
    if (room.phase==='lobby') center.innerHTML=`<div class="jsq-lobby waiting"><span class="jsq-eyebrow">SALA ${escape(room.code)}</span><h2>Prontos para o desafio?</h2><p>${players.length} de 4 alunos conectados. Cada pessoa vê os colegas na mesma arena.</p>${me?.id===room.host_id?'<button type="button" class="jsq-primary" data-jsq-start>Começar partida</button>':'<p>A pessoa que criou a sala inicia a partida.</p>'}</div>`;
    else if (room.phase==='playing') center.innerHTML='';
    else center.innerHTML=`<div class="jsq-lobby waiting"><span class="jsq-eyebrow">${room.phase==='won'?'MISSÃO CUMPRIDA':'TENTEM DE NOVO'}</span><h2>${room.phase==='won'?'A turma venceu os três chefes!':'O chefe venceu esta rodada.'}</h2><p>${room.phase==='won'?'Cada aluno contribuiu para a vitória.':'Formem outra sala e combinem os poderes para voltar à arena.'}</p><button type="button" class="jsq-primary" data-jsq-back>Voltar ao Java Royale</button></div>`;
    $('#jsqControls').hidden=room.phase!=='playing';
    const lesson=$('#jsqLesson');
    if (room.phase==='playing'&&me&&me.answer_wave!==room.wave) {
      const puzzle=puzzles[room.wave-1];
      lesson.hidden=false;
      lesson.innerHTML=`<span class="jsq-eyebrow">DESAFIO JAVA · ONDA ${room.wave}</span><h2>${puzzle.q}</h2><p>Acertar causa dano no chefe e fortalece o esquadrão.</p><div class="jsq-answers">${puzzle.choices.map((choice,i)=>`<button type="button" data-jsq-answer="${i}">${escape(choice)}</button>`).join('')}</div>`;
    } else {lesson.hidden=true;lesson.innerHTML='';}
    $('#jsqCount').textContent=room.phase==='playing'?bosses[room.wave-1]+' · '+room.boss_hp+'/'+room.boss_max+' PV':'';
    if (lastPhase!==room.phase) {lastPhase=room.phase;if(room.phase==='won')notice('Vitória! A equipe derrotou o Bug Supremo.');}
  }
  function draw(now) {
    if(screen!=='squad'){stop();return}
    frame=requestAnimationFrame(draw);
    const dt=Math.min(.05,(now-last)/1000||0);last=now;
    if (state?.room.phase==='playing') {
      const dx=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0)+joy.x;
      const dy=(keys.has('arrowdown')||keys.has('x')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0)+joy.y;
      const size=Math.max(1,Math.hypot(dx,dy));
      const me=state.players.find(p=>p.id===credential?.id);
      if (me?.hp) {local.x=Math.max(24,Math.min(936,local.x+dx/size*250*dt));local.y=Math.max(35,Math.min(565,local.y+dy/size*250*dt));}
    }
    ctx.clearRect(0,0,960,600);
    if (image?.complete&&image.naturalWidth) {ctx.drawImage(image,0,0,960,600);ctx.fillStyle='rgba(7,12,35,.38)';ctx.fillRect(0,0,960,600);}
    else {const g=ctx.createLinearGradient(0,0,960,600);g.addColorStop(0,'#143c66');g.addColorStop(1,'#261553');ctx.fillStyle=g;ctx.fillRect(0,0,960,600);}
    ctx.strokeStyle='rgba(125,236,255,.2)';ctx.lineWidth=2;
    for(let x=0;x<960;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,600);ctx.stroke()}
    for(let y=0;y<600;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke()}
    if (!state||state.room.phase==='lobby')return;
    const {room,players}=state,t=room.server_time+(Date.now()-room.server_time);
    const bx=480+Math.sin(t/1800)*170,by=155+Math.cos(t/2400)*40;
    ctx.save();ctx.shadowColor='#f678e8';ctx.shadowBlur=34;ctx.fillStyle='#7922b7';ctx.beginPath();ctx.arc(bx,by,64+Math.sin(now/260)*4,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.fillStyle='#221140';ctx.beginPath();ctx.arc(bx,by,48,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffa6f2';ctx.font='bold 46px system-ui';ctx.textAlign='center';ctx.fillText(['∅','∞','!'][room.wave-1],bx,by+17);
    ctx.fillStyle='#0d1030';ctx.fillRect(bx-85,by-89,170,13);ctx.fillStyle='#f36ac8';ctx.fillRect(bx-84,by-88,168*Math.max(0,room.boss_hp/room.boss_max),11);
    ctx.fillStyle='#fff';ctx.font='bold 17px system-ui';ctx.fillText(bosses[room.wave-1],bx,by-102);
    const tx=535+Math.sin(now/850)*18,ty=354+Math.cos(now/1100)*14;
    ctx.fillStyle='rgba(255,223,131,.35)';ctx.beginPath();ctx.arc(tx,ty,39,0,Math.PI*2);ctx.fill();
    if(teacher.complete&&teacher.naturalWidth)ctx.drawImage(teacher,tx-34,ty-43,68,68);
    ctx.font='bold 14px system-ui';ctx.fillStyle='#ffe49a';ctx.fillText('Professor Javi',tx,ty+42);
    for(const p of players) {
      const self=p.id===credential?.id,x=self?local.x:p.x,y=self?local.y:p.y;
      ctx.fillStyle=self?'rgba(94,225,255,.28)':'rgba(204,161,255,.24)';ctx.beginPath();ctx.ellipse(x,y+31,31,10,0,0,Math.PI*2);ctx.fill();
      if(self){ctx.strokeStyle='#8df4ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.stroke()}
      const art=heroArt[p.hero%10];if(art.complete&&art.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(x,y,28,0,Math.PI*2);ctx.clip();ctx.drawImage(art,x-30,y-33,60,66);ctx.restore()}
      else{ctx.fillStyle='#75d6ed';ctx.beginPath();ctx.arc(x,y,26,0,Math.PI*2);ctx.fill()}
      if(!p.hp){ctx.fillStyle='#ff738a';ctx.font='bold 27px system-ui';ctx.fillText('✚',x,y+9)}
      ctx.fillStyle='#101d32';ctx.fillRect(x-27,y-45,54,7);ctx.fillStyle=p.hp?'#6df3b6':'#fb7185';ctx.fillRect(x-26,y-44,52*p.hp/100,5);
      ctx.font='bold 14px system-ui';ctx.fillStyle='#fff';ctx.fillText(p.name,x,y-52);
      if(self&&state.room.phase==='playing'&&(firing||keys.has('s')||keys.has('shift'))&&p.ammo>0) {
        ctx.strokeStyle='rgba(255,224,131,.72)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y-17);ctx.lineTo(bx+(Math.random()-.5)*19,by+35);ctx.stroke();
      }
    }
    flash=flash.filter(f=>now-f.t<500);
    for(const f of flash){ctx.strokeStyle='#ff7896';ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.x,f.y,35+(now-f.t)/12,0,Math.PI*2);ctx.stroke()}
    if (room.buff_until>Date.now()) {ctx.fillStyle='#a5ffcd';ctx.font='bold 18px system-ui';ctx.fillText('BÔNUS JAVA ATIVO · EQUIPE FORTALECIDA',480,576)}
  }
  window.JavaSquad={open(options) {
    if(screen==='squad')return;
    config=options;credential=null;state=null;lastPhase='';action={};local={x:400,y:430};last=0;
    controller=new AbortController();screen='squad';page();lobby();
    const saved=JSON.parse(sessionStorage.getItem('java-squad-session')||'null');
    if(saved?.code&&saved?.token) {credential=saved;api('state',{x:400,y:430}).then(r=>{state=r.state;const me=state?.players.find(p=>p.id===credential.id);if(me)local={x:me.x,y:me.y};refresh();timer=setInterval(sync,300)}).catch(()=>{credential=null;sessionStorage.removeItem('java-squad-session');lobby()})}
  }};
})();
