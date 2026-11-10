'use strict';
(() => {
  const KEY='javalingo-arena-v1';
  let record={exams:{},debugDone:{}};
  try {
    const parsed=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(parsed&&typeof parsed==='object')record={exams:parsed.exams||{},debugDone:parsed.debugDone||{}};
  } catch {}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(record))}catch{}};
  let mode='hub',examIndex=0,questionIndex=0,answers=[],deadline=0,started=0,result=null;
  let debugIndex=0,debugChoice=null,examPage=0;
  const EXAMS_PER_PAGE=12;
  const root=()=>document.querySelector('#app');
  const order=(index,salt=0)=>[(index+salt)%4,(index+salt+2)%4,(index+salt+1)%4,(index+salt+3)%4];
  const elapsed=()=>Math.max(0,Math.round((Date.now()-started)/1000));
  const clock=()=>{const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')};
  const codeProgress=()=>Object.keys(missionState.done).filter(k=>k.startsWith('arena-')).length;
  const summary=()=>`<div class="ja-heading"><span class="eyebrow">TREINO COMPLEMENTAR DE JAVA</span><h1>Arena Java</h1><p>Faça um simulado, encontre um bug e depois escreva código que você pode executar. Cada tentativa ajuda a descobrir o próximo assunto para estudar.</p></div>`;
  const top=()=>`<button type="button" class="back-link" data-ja-home>${icon('back')} ${mode==='hub'?'Voltar às trilhas':'Voltar à Arena'}</button>`;
  function drawHub(){
    const nextBug=JAVA_ARENA_DEBUG.findIndex((_,i)=>!record.debugDone[i]);
    const best=Array.from({length:Math.min(EXAMS_PER_PAGE,JAVA_EXAM_COUNT-examPage*EXAMS_PER_PAGE)},(_,j)=>getJavaExam(examPage*EXAMS_PER_PAGE+j)).map((exam,j)=>{
      const i=examPage*EXAMS_PER_PAGE+j;
      const results=record.exams[exam.id]||[];
      const score=results.length?Math.max(...results.map(r=>r.score)):null;
      return `<button type="button" class="ja-card ja-exam" data-ja-exam="${i}"><span class="ja-card-icon">${icon('book')}</span><span class="ja-card-kicker">SIMULADO ${i+1} · ${exam.questions.length} QUESTÕES · ${exam.minutes} MIN</span><strong>${esc(exam.title)}</strong><small>${esc(exam.subtitle)}</small><span class="ja-card-foot">${score===null?'Começar agora':`Melhor resultado: ${score}/${exam.questions.length}`} ${icon('arrow')}</span></button>`;
    }).join('');
    root().innerHTML=`<div class="ja-root">${top()}<section class="ja-hero"><div>${summary()}<div class="ja-pills"><span>${JAVA_EXAM_COUNT.toLocaleString('pt-BR')} simulados · ${JAVA_EXAM_BANK.length} questões-base</span><span>${JAVA_ARENA_DEBUG.length} bugs</span><span>${MISSIONS.filter(m=>m.id.startsWith('arena-')).reduce((n,m)=>n+m.steps.length,0)} missões de código</span></div></div><img src="assets/professor-mascote.png?v=2" alt="Professor do JavaLingo"></section><div class="ja-section-title"><div><span class="eyebrow">PENSE, TESTE, EXPLIQUE</span><h2>Escolha seu treino</h2></div></div><div class="ja-exam-jump"><label for="jaExamJump">Ir direto ao simulado</label><input id="jaExamJump" type="number" inputmode="numeric" min="1" max="100000" placeholder="1 a 100.000"><button type="button" class="button button-secondary" data-ja-exam-jump>Abrir</button><span id="jaExamJumpStatus" role="status"></span></div><div class="ja-grid">${best}</div><div class="ja-exam-pages"><button type="button" class="button button-secondary" data-ja-exam-page="prev" ${examPage===0?'disabled':''}>Anterior</button><span>Página ${examPage+1} de ${Math.ceil(JAVA_EXAM_COUNT/EXAMS_PER_PAGE)}</span><button type="button" class="button button-secondary" data-ja-exam-page="next" ${examPage>=Math.ceil(JAVA_EXAM_COUNT/EXAMS_PER_PAGE)-1?'disabled':''}>Próxima</button></div><div class="ja-grid ja-extra"><button type="button" class="ja-card ja-debug" data-ja-debug="${nextBug<0?0:nextBug}"><span class="ja-card-icon">${icon('search')}</span><span class="ja-card-kicker">ENCONTRE O PROBLEMA</span><strong>Caça aos bugs</strong><small>Leia pequenos trechos de Java e escolha a correção com explicação.</small><span class="ja-card-foot">${Object.keys(record.debugDone).length}/${JAVA_ARENA_DEBUG.length} resolvidos ${icon('arrow')}</span></button><button type="button" class="ja-card ja-code" data-ja-code><span class="ja-card-icon">${icon('terminal')}</span><span class="ja-card-kicker">ESCREVA E EXECUTE</span><strong>Missões de código</strong><small>Campanhas progressivas de Java no editor executável.</small><span class="ja-card-foot">${codeProgress()}/${MISSIONS.filter(m=>m.id.startsWith('arena-')).reduce((n,m)=>n+m.steps.length,0)} concluídas ${icon('arrow')}</span></button></div><p class="ja-note">Os 100.000 simulados recombinam questões de um banco comentado; uma questão pode aparecer em mais de um. Simulados e bugs são corrigidos aqui. Nas missões, o Java roda no editor incorporado do OneCompiler e a verificação compara a saída com os casos propostos. Testes adicionais ainda são importantes.</p></div>`;
  }
  function drawExam(){
    const exam=getJavaExam(examIndex),q=exam.questions[questionIndex],chosen=answers[questionIndex];
    root().innerHTML=`<div class="ja-root">${top()}<div class="ja-question-head"><div><span class="eyebrow">${esc(exam.title)}</span><h1>Questão ${questionIndex+1} de ${exam.questions.length}</h1></div><div class="ja-timer" role="timer" aria-label="Tempo restante">Tempo <strong id="jaClock">${clock()}</strong></div></div><div class="ja-progress"><span style="width:${(questionIndex+1)/exam.questions.length*100}%"></span></div><section class="ja-question"><span class="ja-topic">${esc(q[0])}</span><h2>${esc(q[1])}</h2>${q[5]?`<pre class="ja-code-sample"><code>${esc(q[5])}</code></pre>`:''}<div class="ja-options" role="group" aria-label="Alternativas">${order(questionIndex,examIndex).map((original,i)=>`<button type="button" class="ja-option ${chosen===original?'chosen':''}" data-ja-choice="${original}" aria-pressed="${chosen===original}"><b>${'ABCD'[i]}</b><span>${esc(q[2][original])}</span></button>`).join('')}</div><div class="ja-actions"><button type="button" class="button button-primary" data-ja-next>${questionIndex===exam.questions.length-1?'Finalizar simulado':'Próxima questão'} ${icon('arrow')}</button><span>Você pode avançar e deixar uma questão sem resposta.</span></div></section></div>`;
  }
  function finishExam(){
    if(mode!=='exam')return;
    const exam=getJavaExam(examIndex);
    const score=exam.questions.reduce((total,q,i)=>total+(answers[i]===q[3]?1:0),0);
    result={score,answers:[...answers],seconds:Math.min(exam.minutes*60,elapsed()),at:Date.now()};
    (record.exams[exam.id]??=[]).push(result);
    record.exams[exam.id]=record.exams[exam.id].slice(-20);
    save();mode='result';draw();
  }
  function drawResult(){
    const exam=getJavaExam(examIndex),wrong=exam.questions.filter((q,i)=>result.answers[i]!==q[3]),topics=[...new Set(wrong.map(q=>q[0]))];
    root().innerHTML=`<div class="ja-root">${top()}<section class="ja-result"><span class="eyebrow">SIMULADO FINALIZADO</span><h1>${result.score} de ${exam.questions.length} acertos</h1><p>Tempo: ${Math.floor(result.seconds/60)} min ${result.seconds%60} s · ${result.score/exam.questions.length>=.83?'Excelente domínio dos temas!':result.score/exam.questions.length>=.58?'Bom caminho. Revise os pontos abaixo.':'Vamos praticar os temas abaixo e tentar de novo.'}</p><div class="ja-scorebar"><span style="width:${result.score/exam.questions.length*100}%"></span></div>${topics.length?`<div class="ja-review-topics"><strong>Vale revisar nas trilhas:</strong> ${topics.map(esc).join(' · ')}</div>`:'<div class="ja-review-topics"><strong>Você acertou todas!</strong> Experimente outro simulado ou escreva código nas missões.</div>'}<div class="ja-actions"><button type="button" class="button button-primary" data-ja-exam="${examIndex}">Refazer simulado</button><button type="button" class="button button-secondary" data-ja-code>Treinar codando</button></div></section><div class="ja-section-title"><h2>Correção comentada</h2></div><div class="ja-review-list">${exam.questions.map((q,i)=>{const right=result.answers[i]===q[3];return `<details class="ja-review ${right?'right':'wrong'}" ${right?'':'open'}><summary><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(q[1])}</strong><b>${right?'Acertou':'Revisar'}</b></summary><div><p>Sua resposta: ${result.answers[i]===null?'Não respondida':esc(q[2][result.answers[i]])}</p><p><strong>Correta:</strong> ${esc(q[2][q[3]])}</p><p>${esc(q[4])}</p></div></details>`}).join('')}</div></div>`;
  }
  function drawDebug(){
    const q=JAVA_ARENA_DEBUG[debugIndex],solved=!!record.debugDone[debugIndex],answered=debugChoice!==null,right=debugChoice===q[4];
    root().innerHTML=`<div class="ja-root">${top()}<div class="ja-question-head"><div><span class="eyebrow">CAÇA AOS BUGS · ${esc(q[0])}</span><h1>Bug ${debugIndex+1} de ${JAVA_ARENA_DEBUG.length}</h1></div><span class="ja-small-count">${Object.keys(record.debugDone).length}/${JAVA_ARENA_DEBUG.length} resolvidos</span></div><div class="ja-progress"><span style="width:${(debugIndex+1)/JAVA_ARENA_DEBUG.length*100}%"></span></div><section class="ja-question"><h2>${esc(q[1])}</h2><pre class="ja-code-sample"><code>${esc(q[2])}</code></pre><div class="ja-options" role="group" aria-label="Correções possíveis">${order(debugIndex,2).map((original,i)=>`<button type="button" class="ja-option ${answered&&original===q[4]?'correct':''} ${answered&&original===debugChoice&&original!==q[4]?'incorrect':''}" data-ja-debug-choice="${original}" ${answered?'disabled':''}><b>${'ABCD'[i]}</b><span>${esc(q[3][original])}</span></button>`).join('')}</div>${answered?`<div class="ja-feedback ${right?'success':'retry'}" role="status"><strong>${right?'Isso! Você encontrou o bug.':'Quase! Olhe a correção destacada.'}</strong><p>${esc(q[5])}</p>${solved?'<small>Já faz parte dos seus bugs resolvidos.</small>':''}</div>`:''}<div class="ja-actions">${answered&&!right?'<button type="button" class="button button-secondary" data-ja-debug-retry>Tentar novamente</button>':''}<button type="button" class="button button-primary" data-ja-debug-next ${!answered?'disabled':''}>${debugIndex===JAVA_ARENA_DEBUG.length-1?'Voltar à Arena':'Próximo bug'} ${icon('arrow')}</button></div></section></div>`;
  }
  function draw(){if(screen!=='arena')return;if(mode==='hub')drawHub();else if(mode==='exam')drawExam();else if(mode==='result')drawResult();else drawDebug()}
  const nav=document.createElement('button');
  nav.type='button';nav.className='nav-item';nav.dataset.nav='arena';nav.innerHTML=`${icon('terminal')} Arena Java`;
  document.querySelector('.sidebar nav').append(nav);
  nav.addEventListener('click',()=>{mode='hub';navigate('arena')});
  const oldHome=renderHome;
  renderHome=function(){
    oldHome();
    app.querySelector('.home-hero')?.insertAdjacentHTML('afterend',`<button type="button" class="ja-home-entry" data-ja-open><span class="ja-home-icon">${icon('terminal')}</span><span><strong>Arena Java: novos jeitos de praticar</strong><small>${JAVA_EXAM_COUNT.toLocaleString('pt-BR')} simulados · ${JAVA_EXAM_BANK.length} questões-base · ${JAVA_ARENA_DEBUG.length} bugs · ${MISSIONS.filter(m=>m.id.startsWith('arena-')).reduce((n,m)=>n+m.steps.length,0)} missões</small></span>${icon('arrow')}</button>`);
    const grid=app.querySelector('.tracks-grid');
    if(grid){
      const en=settings.language==='en';
      grid.insertAdjacentHTML('beforebegin',`<div class="java-track-tools"><label for="javaTrackSearch">${en?'Find a Java track':'Encontre uma trilha de Java'}</label><div><input id="javaTrackSearch" type="search" placeholder="${en?'Search a topic, e.g. Streams':'Buscar tema, por exemplo Streams'}" autocomplete="off"><select id="javaTrackKind" aria-label="${en?'Track type':'Tipo de trilha'}"><option value="all">${en?'All tracks':'Todas as trilhas'}</option><option value="base">${en?'Original tracks':'Trilhas originais'}</option><option value="new">${en?'New deep dives':'Aprofundamento novo'}</option><option value="review">${en?'Integrated review':'Revisão integrada'}</option></select></div><small id="javaTrackCount">${en?'Original collection preserved · 99,900 guided tracks added above':'Coleção original preservada · 99.900 trilhas orientadas acrescentadas acima'}</small></div>`);
      grid.querySelectorAll('[data-track]').forEach(card=>{
        const tr=TRACKS.find(t=>t.id===card.dataset.track);
        card.dataset.kind=tr.practicePath?'review':tr.id.startsWith('aprofundamento-')?'new':'base';
        if(tr.practicePath)card.querySelector('.track-body small').append(en?' · Integrated review':' · Revisão integrada');
      });
    }
  };
  function filterTracks(){
    const grid=app.querySelector('.tracks-grid');if(!grid)return;
    const term=(app.querySelector('#javaTrackSearch')?.value||'').trim().toLocaleLowerCase();
    const kind=app.querySelector('#javaTrackKind')?.value||'all';let shown=0;
    grid.querySelectorAll('[data-track]').forEach(card=>{
      const visible=(kind==='all'||card.dataset.kind===kind)&&card.querySelector('strong').textContent.toLocaleLowerCase().includes(term);
      card.hidden=!visible;if(visible)shown++;
    });
    app.querySelector('#javaTrackCount').textContent=settings.language==='en'?`${shown} ${shown===1?'track':'tracks'} found · Review routes revisit earlier topics in a new sequence.`:`${shown} ${shown===1?'trilha encontrada':'trilhas encontradas'} · As rotas de revisão retomam temas de outras trilhas em nova sequência.`;
  }
  app.addEventListener('input',e=>{if(e.target.id==='javaTrackSearch')filterTracks()});
  app.addEventListener('change',e=>{if(e.target.id==='javaTrackKind')filterTracks()});
  const oldRender=render;
  render=function(){
    if(screen==='arena'){setNav();updateStats();$('#breadcrumb').textContent='Arena Java';draw();return}
    oldRender();
  };
  function startExam(index){const exam=getJavaExam(index);if(!exam)return;examIndex=index;questionIndex=0;answers=Array(exam.questions.length).fill(null);started=Date.now();deadline=started+exam.minutes*60000;result=null;mode='exam';draw()}
  app.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-ja-open')){mode='hub';navigate('arena');return}
    if(screen!=='arena')return;
    if(button.hasAttribute('data-ja-home')){if(mode==='hub')navigate('home');else{mode='hub';draw()}return}
    if(button.dataset.jaExamPage){examPage+=button.dataset.jaExamPage==='next'?1:-1;examPage=Math.max(0,Math.min(examPage,Math.ceil(JAVA_EXAM_COUNT/EXAMS_PER_PAGE)-1));draw();return}
    if(button.hasAttribute('data-ja-code')){selectMission(MISSIONS.findIndex(m=>m.id==='arena-logica'),0);return}
    if(button.hasAttribute('data-ja-exam-jump')){const value=app.querySelector('#jaExamJump')?.value||'';const n=Number(value);if(!value||!Number.isInteger(n)||n<1||n>JAVA_EXAM_COUNT){app.querySelector('#jaExamJumpStatus').textContent='Informe um número de 1 a 100.000.';return}examPage=Math.floor((n-1)/EXAMS_PER_PAGE);startExam(n-1);return}
    if(button.dataset.jaExam!==undefined){startExam(Number(button.dataset.jaExam));return}
    if(button.dataset.jaChoice!==undefined&&mode==='exam'){answers[questionIndex]=Number(button.dataset.jaChoice);draw();return}
    if(button.hasAttribute('data-ja-next')&&mode==='exam'){if(questionIndex<getJavaExam(examIndex).questions.length-1){questionIndex++;draw()}else finishExam();return}
    if(button.dataset.jaDebug!==undefined){mode='debug';debugIndex=Number(button.dataset.jaDebug);debugChoice=null;draw();return}
    if(button.dataset.jaDebugChoice!==undefined&&mode==='debug'&&debugChoice===null){debugChoice=Number(button.dataset.jaDebugChoice);if(debugChoice===JAVA_ARENA_DEBUG[debugIndex][4]){record.debugDone[debugIndex]=Date.now();save()}draw();return}
    if(button.hasAttribute('data-ja-debug-retry')){debugChoice=null;draw();return}
    if(button.hasAttribute('data-ja-debug-next')){if(debugIndex<JAVA_ARENA_DEBUG.length-1){debugIndex++;debugChoice=null;draw()}else{mode='hub';draw()}}
  });
  setInterval(()=>{
    if(screen!=='arena'||mode!=='exam')return;
    if(Date.now()>=deadline){finishExam();return}
    const el=document.querySelector('#jaClock');if(el)el.textContent=clock();
  },1000);
  if(screen==='home')render();
})();
