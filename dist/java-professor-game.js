'use strict';
(() => {
  const game=window.JavaProfessorGame;
  if(!game)return;
  const KEY='javalingo-professor-game-v1';
  const tx=(pt,en)=>settings.language==='en'?en:pt;
  const max=game.levels.length;
  let saved={unlocked:0,finished:[],drafts:{}};
  try {const raw=JSON.parse(localStorage.getItem(KEY)||'{}');if(raw&&typeof raw==='object')saved={...saved,...raw,finished:Array.isArray(raw.finished)?raw.finished:[],drafts:raw.drafts&&typeof raw.drafts==='object'?raw.drafts:{}};}catch{}
  // Preserve the path of players who completed the former twelve-phase finale.
  saved.unlocked=Math.min(max-1,Math.max(0,Number(saved.unlocked)||0,saved.finished.includes(11)?12:0));
  const CUSTOM_KEY='javalingo-professor-custom-v1';
  const blank=()=>({name:'Minha fase',skill:'Criação de fases',story:'Teste sua fase com Java de verdade.',hint:'Planeje a rota, evite os bugs e pegue os tokens antes de chegar à saída.',start:[0,4],goal:[6,4],walls:[],hazards:[],gems:[]});
  const validCell=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isInteger)&&p[0]>=0&&p[0]<7&&p[1]>=0&&p[1]<6;
  function validLevel(raw){
    if(!raw||!validCell(raw.start)||!validCell(raw.goal))return null;
    const level={...blank(),name:String(raw.name||'Fase compartilhada').slice(0,60),start:raw.start,goal:raw.goal};
    for(const key of ['walls','hazards','gems']){
      if(!Array.isArray(raw[key])||raw[key].length>20||!raw[key].every(validCell))return null;
      level[key]=raw[key];
    }
    const all=[level.start,level.goal,...level.walls,...level.hazards,...level.gems].map(p=>p.join(','));
    if(new Set(all).size!==all.length)return null;
    level.skill='Criação de fases';level.story='Teste sua fase com Java de verdade.';level.hint='Planeje a rota, evite os bugs e pegue os tokens antes de chegar à saída.';
    return level;
  }
  let custom=blank(),brush='walls',mode='campaign',variant=0;
  try{custom=validLevel(JSON.parse(localStorage.getItem(CUSTOM_KEY)||'null'))||blank()}catch{}
  try{
    const encoded=new URLSearchParams(location.search).get('jpg');
    if(encoded&&encoded.length<1400){
      const shared=validLevel(JSON.parse(decodeURIComponent(escape(atob(encoded.replace(/-/g,'+').replace(/_/g,'/'))))));
      if(shared){custom=shared;mode='custom';}
    }
  }catch{}
  let index=Math.min(saved.unlocked,Math.max(0,Number(saved.last)||0)),position=game.initial(game.levels[index]),trace=[],cursor=0,animation=null,editorReady=false,awaiting=false,attempt=0,showHint=false;
  const levelNow=()=>mode==='surprise'?game.surpriseMaps[variant]:mode==='custom'?custom:game.levels[index];
  const saveCustom=()=>{try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(custom))}catch{}};
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}};
  const title=level=>level.name;
  const emptyCode=i=>`public class Main {
    public static void main(String[] args) {
        Professor.inicio(${i+1});

        // Escreva seus comandos Java aqui.
        // Exemplo: Professor.andar();

        Professor.fim(${i+1});
    }
}

// Motor do jogo: edite apenas os comandos dentro de main.
class Professor {
    static void inicio(int fase) { System.out.println("JLG|" + fase + "|BEGIN"); }
    static void fim(int fase) { System.out.println("JLG|" + fase + "|END"); }
    static void andar() { System.out.println("JLG|STEP"); }
    static void virarDireita() { System.out.println("JLG|RIGHT"); }
    static void virarEsquerda() { System.out.println("JLG|LEFT"); }
    static void pular() { System.out.println("JLG|JUMP"); }
    static void pegar() { System.out.println("JLG|PICK"); }
    static void falar(String texto) {
        System.out.println("JLG|SAY|" + texto.replace("\\n", " "));
    }
}`;
  const surpriseCode=()=>`public class Main {
    public static void main(String[] args) {
        for (int mapa = 1; mapa <= 3; mapa++) {
            Professor.inicio(mapa);
            // A mesma solução roda nos três mapas. O obstáculo muda de lugar.
            // Use Professor.temCaixaNaFrente() e Professor.chegou().
            while (!Professor.chegou()) {
                if (Professor.temCaixaNaFrente()) {
                    // Há uma caixa à frente. Programe um desvio seguro.
                }
                Professor.andar();
            }
            Professor.fim(mapa);
        }
    }
}

class Professor {
    static int x, y, dir;
    static final int[] caixas = {2, 3, 4};
    static final int[] dx = {1, 0, -1, 0};
    static final int[] dy = {0, 1, 0, -1};
    static int caixa;
    static void inicio(int mapa) {
        x=0; y=4; dir=0; caixa=caixas[mapa-1];
        System.out.println("JLG|S" + mapa + "|BEGIN");
    }
    static void fim(int mapa) { System.out.println("JLG|S" + mapa + "|END"); }
    static boolean temCaixaNaFrente() { return x+dx[dir]==caixa && y+dy[dir]==4; }
    static boolean chegou() { return x==6 && y==4; }
    static void andar() { x+=dx[dir]; y+=dy[dir]; System.out.println("JLG|STEP"); }
    static void virarDireita() { dir=(dir+1)%4; System.out.println("JLG|RIGHT"); }
    static void virarEsquerda() { dir=(dir+3)%4; System.out.println("JLG|LEFT"); }
    static void pular() { x+=2*dx[dir]; y+=2*dy[dir]; System.out.println("JLG|JUMP"); }
    static void pegar() { System.out.println("JLG|PICK"); }
    static void falar(String texto) { System.out.println("JLG|SAY|" + texto.replace("\\n", " ")); }
}`;
  const codeKey=()=>mode==='campaign'?String(index):mode;
  const template=()=>mode==='surprise'?surpriseCode():emptyCode(index);
  const currentCode=()=>saved.drafts[codeKey()]||template();
  function stop(){clearTimeout(animation);animation=null;trace=[];cursor=0;awaiting=false;}
  function stage(i){if(i<0||i>=max||i>saved.unlocked)return;stop();mode='campaign';index=i;saved.last=i;persist();position=game.initial(game.levels[i]);editorReady=false;attempt=0;showHint=false;renderGame();window.scrollTo(0,0);}
  function switchMode(next){stop();mode=next;variant=0;position=game.initial(levelNow());editorReady=false;showHint=false;renderGame();}
  function board(){
    const level=levelNow();
    const cells=[];
    for(let y=0;y<6;y++)for(let x=0;x<7;x++){
      const isProfessor=position.x===x&&position.y===y;
      const wall=game.contains(level.walls,x,y),hazard=game.contains(level.hazards,x,y),gem=game.contains(level.gems,x,y)&&!position.collected.includes(`${x},${y}`);
      const goal=level.goal[0]===x&&level.goal[1]===y,shield=!!(level.boss&&position.collected.length<(level.gems||[]).length);
      cells.push(`<div class="jpg-cell ${wall?'wall':''} ${hazard?'hazard':''} ${goal?'goal':''} ${goal&&level.boss?'boss':''} ${goal&&shield?'shielded':''}" aria-label="${isProfessor?'Professor, ':''}${wall?'obstáculo':hazard?'bug':gem?'token':goal?level.boss?(shield?'núcleo protegido':'núcleo liberado'):'saída':'caminho'}">${goal?`<span class="jpg-goal-mark" aria-hidden="true">${level.boss?'◈':'◆'}</span>`:''}${wall?'<span aria-hidden="true">▣</span>':''}${hazard?'<span aria-hidden="true">✕</span>':''}${gem?'<span class="jpg-gem" aria-hidden="true">✦</span>':''}${isProfessor?`<span class="jpg-professor" style="--turn:${position.dir*90}deg"><img src="assets/professor-mascote.png?v=2" alt="Professor"></span>`:''}</div>`);
    }
    return cells.join('');
  }
  function stages(){return game.levels.map((level,i)=>`<button type="button" class="jpg-stage ${level.arena?'arena':''} ${i===index?'active':''} ${saved.finished.includes(i)?'done':''}" data-jpg-stage="${i}" ${i>saved.unlocked?'disabled':''} aria-label="Fase ${i+1}, ${esc(level.name)}${i>saved.unlocked?', bloqueada':''}" aria-current="${i===index?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(level.name)}</b><em>${i>saved.unlocked?'⌁':saved.finished.includes(i)?'✓':'→'}</em></button>`).join('');}
  function modeTabs(){return `<nav class="jpg-mode-tabs" aria-label="Modos do jogo"><button type="button" data-jpg-mode="campaign" ${mode==='campaign'?'aria-current="page"':''}>Campanha · 20 fases</button><button type="button" data-jpg-mode="surprise" ${mode==='surprise'?'aria-current="page"':''}>Mapas surpresa</button><button type="button" data-jpg-mode="builder" ${mode==='builder'||mode==='custom'?'aria-current="page"':''}>Criador de fases</button></nav>`;}
  function builderCells(){let html='';for(let y=0;y<6;y++)for(let x=0;x<7;x++){
    const key=x+','+y, type=custom.start.join(',')===key?'start':custom.goal.join(',')===key?'goal':['walls','hazards','gems'].find(k=>game.contains(custom[k],x,y));
    const labels={start:'Início',goal:'Saída',walls:'Caixa',hazards:'Bug',gems:'Cristal'};
    const symbols={start:'P',goal:'◆',walls:'▣',hazards:'✕',gems:'✦'};
    html+=`<button type="button" class="jpg-build-cell ${type||''}" data-jpg-cell="${x},${y}" aria-label="Coluna ${x+1}, linha ${y+1}: ${labels[type]||'vazio'}">${symbols[type]||''}</button>`;
  }return html}
  function renderBuilder(){
    app.innerHTML=`<div class="jpg-page"><header class="jpg-builder-head"><button class="jpg-back" type="button" data-jpg-home>${icon('back')} Voltar às trilhas</button><span class="jpg-eyebrow">OPERAÇÃO PROFESSOR · CRIADOR</span><h1>Desenhe sua própria missão</h1><p>Escolha uma peça e toque no tabuleiro. Depois teste a fase escrevendo Java ou envie o link para um colega.</p></header>${modeTabs()}<section class="jpg-builder"><div class="jpg-build-toolbar"><label>Nome da fase<input id="jpgCustomName" maxlength="60" value="${esc(custom.name)}" aria-label="Nome da fase"></label><div class="jpg-brushes" role="group" aria-label="Peças do tabuleiro">${[['start','Professor'],['goal','Saída'],['walls','Caixa'],['hazards','Bug'],['gems','Cristal'],['erase','Apagar']].map(([key,label])=>`<button type="button" data-jpg-brush="${key}" ${brush===key?'aria-pressed="true"':'aria-pressed="false"'}>${label}</button>`).join('')}</div><p>O professor começa olhando para a direita. O tabuleiro tem 7 colunas e 6 linhas. Peças não podem ocupar a mesma casa.</p><div class="jpg-build-actions"><button type="button" data-jpg-test>▶ Testar com Java</button><button type="button" data-jpg-share>Copiar link da fase</button><button type="button" data-jpg-clear>Limpar peças</button></div><p class="jpg-build-message" id="jpgBuildMessage" role="status">Sua fase é salva neste aparelho. O link inclui o mapa para abrir em outro aparelho.</p><input id="jpgShareLink" class="jpg-share-link" readonly hidden aria-label="Link para compartilhar"></div><div class="jpg-build-board" role="group" aria-label="Editor do tabuleiro">${builderCells()}</div></section></div>`;
  }
  function builderMessage(msg){const el=app.querySelector('#jpgBuildMessage');if(el)el.textContent=msg}
  function reachable(level){
    const todo=[level.start],seen=new Set([level.start.join(',')]);
    for(let i=0;i<todo.length;i++){const [x,y]=todo[i];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(nx<0||nx>6||ny<0||ny>5||seen.has(key)||game.contains(level.walls,nx,ny)||game.contains(level.hazards,nx,ny))continue;seen.add(key);todo.push([nx,ny]);}
    }return seen.has(level.goal.join(','))&&level.gems.every(gem=>seen.has(gem.join(',')));
  }
  function editCell(x,y){
    const key=x+','+y;
    if(brush==='erase'){if(custom.start.join(',')===key||custom.goal.join(',')===key){builderMessage('Mova o início ou a saída para outra casa antes de apagar.');return}for(const group of ['walls','hazards','gems'])custom[group]=custom[group].filter(p=>p.join(',')!==key)}
    else{
      for(const group of ['walls','hazards','gems'])custom[group]=custom[group].filter(p=>p.join(',')!==key);
      if(brush==='start'){if(custom.goal.join(',')===key){builderMessage('A saída já está nesta casa.');return}custom.start=[x,y]}
      else if(brush==='goal'){if(custom.start.join(',')===key){builderMessage('O professor já está nesta casa.');return}custom.goal=[x,y]}
      else if(custom.start.join(',')===key||custom.goal.join(',')===key){builderMessage('Mova o início ou a saída antes de colocar outra peça.');return}
      else if(custom[brush].length<20)custom[brush].push([x,y]);else {builderMessage('Limite de 20 peças desse tipo.');return}
    }
    saveCustom();app.querySelector('.jpg-build-board').innerHTML=builderCells();builderMessage('Mapa atualizado. Teste quando estiver pronto.');
  }
  function shareURL(){
    const payload={name:custom.name,start:custom.start,goal:custom.goal,walls:custom.walls,hazards:custom.hazards,gems:custom.gems};
    return location.origin+location.pathname+'?jpg='+btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function renderGame(){
    const level=levelNow();
    if(mode==='builder'){renderBuilder();return}
    app.innerHTML=`<div class="jpg-page"><header class="jpg-hero"><div><button class="jpg-back" type="button" data-jpg-home>${icon('back')} ${tx('Voltar às trilhas','Back to tracks')}</button><span class="jpg-eyebrow">JAVA · JOGO DE CÓDIGO</span><h1>Operação <i>Professor</i></h1><p>${tx('Escreva Java de verdade. Execute no editor e veja o professor cumprir seus comandos, casa por casa.','Write real Java. Run it in the editor and watch the professor follow your commands, tile by tile.')}</p><div class="jpg-hero-stats"><span><b id="jpgHeroProgress">${saved.finished.length}</b> / ${max} fases concluídas</span><span>Java executável</span><span>Seu progresso neste aparelho</span></div></div><div class="jpg-hero-portrait"><img src="assets/professor-mascote.png?v=2" alt="Ilustração do professor do JavaLingo"><span>Missão aceita ✓</span></div></header>
    ${modeTabs()}<div class="jpg-shell"><aside class="jpg-sidebar" ${mode==='campaign'?'':'hidden'}><div class="jpg-sidebar-head"><span class="jpg-eyebrow">MAPA DE MISSÕES</span><strong>Do primeiro passo ao algoritmo final</strong></div><div class="jpg-stage-list" id="jpgStages">${stages()}</div><p>Conclua uma fase para abrir a próxima. Aqui você pode tentar quantas vezes quiser, sem gastar vidas.</p></aside>
    <section class="jpg-workspace"><div class="jpg-level-head"><div><span class="jpg-eyebrow">${mode==='campaign'?'FASE '+String(index+1).padStart(2,'0')+' / '+max:mode==='surprise'?'DESAFIO ADAPTATIVO · MAPA '+(variant+1)+'/3':'FASE CRIADA'} · ${esc(level.skill)}</span><h2>${esc(title(level))}</h2><p>${esc(level.story)}</p></div>${mode==='campaign'?'<span class="jpg-counter">'+String(index+1).padStart(2,'0')+'<small>/'+max+'</small></span>':''}</div>
    <div class="jpg-play"><div class="jpg-scene"><div class="jpg-scene-top"><span><i></i> ${level.arena?'ARENA DE JAVA':'TABULEIRO ATIVO'}</span><span id="jpgSteps">0 comandos</span></div><div class="jpg-board" id="jpgBoard" role="img" aria-label="Tabuleiro com professor, obstáculos e saída">${board()}</div><div class="jpg-legend"><span><b class="jpg-sample exit">${level.boss?'◈':'◆'}</b> ${level.boss?'Núcleo':'Saída'}</span><span><b class="jpg-sample token">✦</b> ${level.arena?'Cristal':'Token'}</span><span><b class="jpg-sample block">▣</b> Caixa</span><span><b class="jpg-sample bug">✕</b> Bug</span></div>${level.boss?'<div class="jpg-boss-meter" id="jpgBossMeter" role="status">Escudo do núcleo · 0/3 cristais</div>':''}<p class="jpg-feedback" id="jpgFeedback" role="status" aria-live="polite">Escreva o código e clique em Executar Java.</p><div class="jpg-actions"><button type="button" class="jpg-run" data-jpg-run>▶ Executar Java</button><button type="button" data-jpg-reset>↺ Reiniciar tabuleiro</button><button type="button" data-jpg-hint>✧ ${showHint?'Esconder pista':'Ver uma pista'}</button><button type="button" data-jpg-next id="jpgNext" ${mode==='campaign'&&position.status==='won'&&index<max-1?'':'hidden'}>Próxima fase →</button></div><div class="jpg-debug"><strong>Depuração visual</strong><span id="jpgTrace">Execute Java para acompanhar os comandos.</span><div><button type="button" data-jpg-prev disabled aria-label="Voltar um comando">← Voltar</button><button type="button" data-jpg-pause disabled>⏸ Pausar</button><button type="button" data-jpg-forward disabled aria-label="Avançar um comando">Avançar →</button></div></div><div class="jpg-hint" id="jpgHint" ${showHint?'':'hidden'}>${esc(level.hint)}</div></div>
    <div class="jpg-editor-wrap"><div class="jpg-editor-title"><span><b>01</b> SEU CÓDIGO <small>Main.java</small></span><span class="jpg-editor-indicator">● JAVA</span></div><div class="jpg-editor-guide"><strong>Você programa; o professor executa.</strong><p>${mode==='surprise'?'Edite uma única solução em Java. O mesmo trecho será executado nos três mapas. Use temCaixaNaFrente() e chegou() para decidir o caminho.':'Edite os comandos dentro de main e clique em Executar Java ao lado do tabuleiro. O resultado do Java compilado vira movimento.'}</p><div class="jpg-methods"><code>Professor.andar();</code><code>Professor.virarDireita();</code><code>Professor.virarEsquerda();</code><code>Professor.pular();</code><code>Professor.pegar();</code>${mode==='surprise'?'<code>Professor.temCaixaNaFrente()</code><code>Professor.chegou()</code>':'<code>Professor.falar("Olá!");</code>'}</div></div><iframe id="jpgEditor" title="Editor Java executável para movimentar o professor" src="https://onecompiler.com/embed/java?listenToEvents=true&codeChangeEvent=true&hideLanguageSelection=true&hideNew=true&hideTitle=true&hideResult=true&theme=${settings.theme==='dark'?'dark':'light'}" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="jpg-editor-footer"><button type="button" data-jpg-template>Restaurar código inicial</button><span>Salvo neste aparelho</span></div><div class="jpg-console" id="jpgConsole" role="status">Aguardando o editor Java. A execução requer conexão com a internet.</div><small class="jpg-privacy">O código executado é processado pelo OneCompiler. Apenas o progresso e o rascunho ficam neste aparelho.</small></div></div></section></div></div>`;
  }
  function status(message,kind=''){const el=app.querySelector('#jpgFeedback');if(el){el.textContent=message;el.dataset.kind=kind;}}
  function consoleText(message,kind=''){const el=app.querySelector('#jpgConsole');if(el){el.textContent=message;el.dataset.kind=kind;}}
  function refresh(){const b=app.querySelector('#jpgBoard');if(b)b.innerHTML=board();const count=app.querySelector('#jpgSteps');if(count)count.textContent=`${position.moves} comando${position.moves===1?'':'s'}`;const meter=app.querySelector('#jpgBossMeter');if(meter){meter.textContent=position.collected.length===3?'Escudo derrubado · avance até o núcleo!':`Escudo do núcleo · ${position.collected.length}/3 cristais`;meter.classList.toggle('open',position.collected.length===3)}status(position.message,position.status);}
  function finish(){if(!saved.finished.includes(index))saved.finished.push(index);saved.unlocked=Math.max(saved.unlocked,Math.min(max-1,index+1));persist();const progress=app.querySelector('#jpgHeroProgress');if(progress)progress.textContent=saved.finished.length;const rail=app.querySelector('#jpgStages');if(rail)rail.innerHTML=stages();const btn=app.querySelector('#jpgNext');if(btn&&index<max-1)btn.hidden=false;consoleText(index===max-1?'Todas as fases concluídas! Você construiu um algoritmo completo em Java.':'Fase concluída! A próxima missão foi desbloqueada.','won');}
  const commandNames={STEP:'andar()',RIGHT:'virarDireita()',LEFT:'virarEsquerda()',JUMP:'pular()',PICK:'pegar()'};
  function traceView(){
    const current=trace[cursor-1],label=current?(commandNames[current.command]||'falar(...)'):'posição inicial';
    const info=app.querySelector('#jpgTrace');if(info)info.textContent=`Comando ${cursor} de ${trace.length} · ${label}${mode==='surprise'?' · mapa '+(variant+1)+'/3':''}`;
    for(const [selector,disabled] of [['[data-jpg-prev]',cursor===0],['[data-jpg-forward]',cursor>=trace.length],['[data-jpg-pause]',!trace.length]]){const el=app.querySelector(selector);if(el)el.disabled=disabled}
    const pause=app.querySelector('[data-jpg-pause]');if(pause)pause.textContent=animation?'⏸ Pausar':'▶ Reproduzir';
  }
  function seek(step){
    cursor=Math.max(0,Math.min(trace.length,step));
    variant=cursor?trace[cursor-1].map:0;
    position=cursor?trace[cursor-1].state:game.initial(levelNow());
    refresh();traceView();
    if(cursor===trace.length){
      if(position.status==='failed')consoleText(position.message,'failed');
      else if(position.status==='won'){
        if(mode==='campaign')finish();
        else consoleText(mode==='surprise'?'Os três mapas foram resolvidos pelo mesmo programa Java!':'Fase criada concluída! Você pode compartilhar o link com um colega.','won');
      }else consoleText('O código terminou antes da saída. Revise a rota ou os tokens e execute novamente.');
    }
  }
  function animate(){animation=null;if(screen!=='professor-game'||!trace.length||cursor>=trace.length)return;seek(cursor+1);if(cursor<trace.length)animation=setTimeout(animate,450);traceView();}
  function processResult(data){
    const result=parseResult(data);if(!result||!awaiting)return;
    stop();variant=0;position=game.initial(levelNow());refresh();
    if(result.error){consoleText(result.error.slice(0,2200),'failed');status('O Java não compilou ou teve um erro. Confira a mensagem no editor.','failed');return;}
    const lines=(result.output||'').split(/\r?\n/).map(x=>x.trim());
    const count=mode==='surprise'?3:1;
    for(let map=0;map<count;map++){
      const id=mode==='surprise'?'S'+(map+1):String(index+1);
      const a=lines.indexOf(`JLG|${id}|BEGIN`),b=lines.indexOf(`JLG|${id}|END`,a+1);
      if(a<0||b<0){consoleText(mode==='surprise'?'Mantenha o laço dos três mapas com Professor.inicio(mapa) e Professor.fim(mapa).':'Mantenha Professor.inicio(...) e Professor.fim(...) no código.','failed');return;}
      const commands=lines.slice(a+1,b).filter(x=>/^JLG\|(STEP|RIGHT|LEFT|JUMP|PICK|SAY\|)/.test(x)).map(x=>x.slice(4));
      if(!commands.length){consoleText('O programa rodou, mas não enviou comandos. Escreva chamadas a Professor.andar() e execute novamente.');return;}
      if(commands.length>100){consoleText('Limite de 100 comandos por mapa. Ajuste o laço ou reduza a sequência.','failed');return;}
      const simulation=game.run(mode==='surprise'?game.surpriseMaps[map]:levelNow(),commands);
      trace.push(...simulation.frames.map((state,i)=>({state,command:commands[i],map})));
      if(simulation.state.status!=='won')break;
    }
    attempt++;cursor=0;variant=0;position=game.initial(levelNow());
    consoleText(`Java executado · tentativa ${attempt} · ${trace.length} comando${trace.length===1?'':'s'}. Use os controles para depurar.`);
    traceView();animation=setTimeout(animate,350);traceView();
  }
  const oldHome=renderHome;
  renderHome=function(){oldHome();const hero=app.querySelector('.home-hero');hero?.insertAdjacentHTML('afterend',`<button class="jpg-home-card" type="button" data-jpg-open><span class="jpg-home-art"><img src="assets/professor-mascote.png?v=2" alt=""></span><span class="jpg-home-copy"><small>NOVO JOGO · JAVA EXECUTÁVEL</small><strong>Operação Professor</strong><span>Escreva Java e conduza o professor por ${max} fases de lógica, saltos e desafios.</span></span><span class="jpg-home-arrow">Jogar agora ${icon('arrow')}</span></button>`)};
  const oldRender=render;
  render=function(){if(screen==='professor-game'){setNav();updateStats();renderGame();return}oldRender()};
  const oldNav=setNav;
  setNav=function(){oldNav();if(screen==='professor-game')$('#breadcrumb').textContent='Operação Professor'};
  const nav=document.createElement('button');nav.type='button';nav.className='nav-item';nav.dataset.nav='professor-game';nav.innerHTML=`${icon('route')} Operação Professor`;nav.addEventListener('click',()=>{stop();navigate('professor-game')});document.querySelector('.sidebar nav [data-nav="practice"]')?.after(nav);
  app.addEventListener('click',e=>{
    if(e.target.closest('[data-jpg-open]')){stop();navigate('professor-game');return}
    if(screen!=='professor-game')return;
    const b=e.target.closest('[data-jpg-home],[data-jpg-stage],[data-jpg-reset],[data-jpg-hint],[data-jpg-next],[data-jpg-run],[data-jpg-template],[data-jpg-mode],[data-jpg-brush],[data-jpg-cell],[data-jpg-test],[data-jpg-share],[data-jpg-clear],[data-jpg-prev],[data-jpg-forward],[data-jpg-pause]');if(!b)return;
    if(b.hasAttribute('data-jpg-home')){stop();navigate('home');return}
    if(b.hasAttribute('data-jpg-mode')){switchMode(b.dataset.jpgMode);return}
    if(b.hasAttribute('data-jpg-brush')){brush=b.dataset.jpgBrush;app.querySelectorAll('[data-jpg-brush]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));return}
    if(b.hasAttribute('data-jpg-cell')){const [x,y]=b.dataset.jpgCell.split(',').map(Number);editCell(x,y);return}
    if(b.hasAttribute('data-jpg-clear')){custom=blank();saveCustom();renderBuilder();return}
    if(b.hasAttribute('data-jpg-test')){if(!reachable(custom)){builderMessage('Não existe um caminho seguro entre o início e a saída. Ajuste as peças.');return}saveCustom();switchMode('custom');return}
    if(b.hasAttribute('data-jpg-share')){
      if(!reachable(custom)){builderMessage('Crie um caminho seguro antes de compartilhar a fase.');return}
      const url=shareURL(),field=app.querySelector('#jpgShareLink');field.hidden=false;field.value=url;field.focus();field.select();
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>builderMessage('Link copiado! Seu colega pode abrir a fase e jogar com Java.')).catch(()=>builderMessage('Selecione e copie o link exibido abaixo.'));
      else builderMessage('Selecione e copie o link exibido abaixo.');
      return;
    }
    if(b.hasAttribute('data-jpg-stage')){stage(Number(b.dataset.jpgStage));return}
    if(b.hasAttribute('data-jpg-prev')||b.hasAttribute('data-jpg-forward')){clearTimeout(animation);animation=null;seek(cursor+(b.hasAttribute('data-jpg-prev')?-1:1));return}
    if(b.hasAttribute('data-jpg-pause')){if(animation){clearTimeout(animation);animation=null;traceView()}else if(cursor<trace.length){animation=setTimeout(animate,350);traceView()}return}
    if(b.hasAttribute('data-jpg-reset')){stop();variant=0;position=game.initial(levelNow());refresh();traceView();consoleText('Tabuleiro reiniciado. Edite e execute o código para tentar novamente.');return}
    if(b.hasAttribute('data-jpg-run')){const frame=app.querySelector('#jpgEditor');if(!editorReady||!frame?.contentWindow){consoleText('Aguarde o editor Java carregar para executar.');return}stop();variant=0;position=game.initial(levelNow());refresh();traceView();awaiting=true;consoleText('Compilando e executando Java...');frame.contentWindow.postMessage({eventType:'triggerRun'},'https://onecompiler.com');return}
    if(b.hasAttribute('data-jpg-template')){delete saved.drafts[codeKey()];persist();const frame=app.querySelector('#jpgEditor');frame?.contentWindow?.postMessage({eventType:'populateCode',language:'java',files:[{name:'Main.java',content:template()}]},'https://onecompiler.com');stop();variant=0;position=game.initial(levelNow());refresh();traceView();consoleText('Código inicial restaurado. Escreva seus comandos em main.');return}
    if(b.hasAttribute('data-jpg-hint')){showHint=!showHint;app.querySelector('#jpgHint').hidden=!showHint;b.textContent=showHint?'✧ Esconder pista':'✧ Ver uma pista';return}
    if(b.hasAttribute('data-jpg-next')){stage(index+1);return}
  });
  app.addEventListener('input',e=>{if(e.target.id==='jpgCustomName'){custom.name=e.target.value.slice(0,60)||'Minha fase';saveCustom()}});
  app.addEventListener('load',e=>{
    if(e.target.id!=='jpgEditor'||screen!=='professor-game')return;
    const frame=e.target,forStage=index,forMode=mode;
    setTimeout(()=>{if(screen!=='professor-game'||index!==forStage||mode!==forMode||frame!==app.querySelector('#jpgEditor'))return;frame.contentWindow?.postMessage({eventType:'populateCode',language:'java',files:[{name:'Main.java',content:currentCode()}]},'https://onecompiler.com');editorReady=true;consoleText('Editor pronto. Digite comandos Java em main e clique em Executar Java.');},600);
  },true);
  window.addEventListener('message',e=>{
    if(screen!=='professor-game'||e.origin!=='https://onecompiler.com'||e.source!==app.querySelector('#jpgEditor')?.contentWindow)return;
    let data=e.data;if(typeof data==='string'){try{data=JSON.parse(data)}catch{return}}
    if(!data||typeof data!=='object'||data.language&&String(data.language).toLowerCase()!=='java')return;
    const files=Array.isArray(data.files)?data.files:[],code=files.find(f=>/\.java$/i.test(f.name||''))?.content||files[0]?.content;
    if(editorReady&&typeof code==='string'&&code.length<50000&&code.includes('Professor.inicio(')){saved.drafts[codeKey()]=code;persist();}
    if(parseResult(data))processResult(data);
  });
  if(new URLSearchParams(location.search).has('jpg')&&mode==='custom'){position=game.initial(custom);navigate('professor-game')}
  else if(screen==='home')render();
})();
