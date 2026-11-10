'use strict';
// Simulados vinculados aos tópicos da trilha aberta. Usa o conteúdo existente,
// sem alterar a Arena Java, as atividades ou o progresso anterior.
(() => {
  const KEY='javalingo-track-sim-v1';
  const facetNames=[['Conceito','Concept'],['Sintaxe','Syntax'],['Depuração','Debugging'],['Aplicação','Application']];
  const tx=(pt,en)=>settings.language==='en'?en:pt;
  const fmt=n=>String(n).padStart(2,'0');
  const promptFor=(v,facet)=>facet===3?tx('Qual conceito corresponde a esta tarefa: ','Which concept matches this task: ')+v.t[6]+'?':v.prompt;
  const trackName=tr=>settings.language==='en'?(tr.enTitle||EN_TRACK_NAMES[tr.id]||tr.title):tr.title;
  const topicText=(tr,i)=>{const row=tr.topics[i],en=settings.language==='en'?EN_TOPIC_TEXT[tr.id]?.[i]:null;return en?[en[0],en[1],row[3],en[3],en[4]]:[row[0],row[1],row[3],row[5],row[6]]};
  let record={};try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))record=x}catch{}
  let current=null;
  function store(){try{localStorage.setItem(KEY,JSON.stringify(record))}catch{}}
  const recordKey=(id,topic)=>id+'::'+(topic===null?'all':'topic-'+topic);
  function resultFor(id,topic){return record[recordKey(id,topic)]||null}
  function mapHTML(tr){
    const best=resultFor(tr.id,null);
    return `<section class="jts-map" aria-labelledby="jtsMapTitle"><div class="jts-map-head"><div><span class="eyebrow">${tx('MAPA DA TRILHA','TRACK MAP')}</span><h2 id="jtsMapTitle">${tx('Do tópico ao simulado','From topics to your mock exam')}</h2><p>${tx('Cada tópico reúne quatro frentes de estudo. O simulado completo visita os dez tópicos; você também pode treinar um deles por vez.','Each topic has four study angles. The full exam covers all ten topics; you can also practice one topic at a time.')}</p></div><div class="jts-map-action"><button type="button" class="button button-primary" data-jts-start="all">${icon('spark')} ${tx('Simular esta trilha','Take this track exam')}</button><small>${tx('20 questões · 2 por tópico','20 questions · 2 per topic')}${best?' · '+tx('melhor','best')+' '+best.best+'/20':''}</small>${current&&current.trackId===tr.id&&!current.finished?`<button type="button" class="button button-secondary" data-jts-continue>${tx('Continuar simulado','Continue exam')}</button>`:''}</div></div><div class="jts-topic-map">${tr.topics.map((topic,i)=>{
      const result=resultFor(tr.id,i),view=topicText(tr,i);
      return `<details class="jts-topic"><summary><span class="jts-topic-number">${fmt(i+1)}</span><strong>${esc(view[0])}</strong><span>${tx('Ver subtópicos','View subtopics')}</span></summary><div class="jts-topic-body"><div class="jts-facets"><div><b>${tx('Conceito','Concept')}</b><p>${esc(view[1])}</p></div><div><b>${tx('Sintaxe','Syntax')}</b><code>${esc(view[2])}</code></div><div><b>${tx('Erro comum','Common mistake')}</b><p>${esc(view[3])}</p></div><div><b>${tx('Aplicação','Application')}</b><p>${esc(view[4])}</p></div></div><button type="button" class="button button-secondary" data-jts-start="${i}">${tx('Simular este tópico','Take this topic exam')} · 4 ${tx('questões','questions')}</button>${result?`<small>${tx('Melhor resultado','Best result')}: ${result.best}/4</small>`:''}</div></details>`}).join('')}</div><p class="jts-method">${tx('As perguntas são montadas com as quatro atividades de escolha já existentes em cada tópico. Ao refazer, o simulado completo alterna os aspectos cobrados; não cria conteúdo novo por IA.','Questions use the four existing multiple-choice activities in each topic. Retakes of the full exam rotate the angles covered; no AI-generated content is added.')}</p></section>`;
  }
  const oldTrack=renderTrack;
  renderTrack=function(){oldTrack();if(track&&screen==='track')app.querySelector('.track-header')?.insertAdjacentHTML('afterend',mapHTML(track))};
  const oldNav=setNav;
  setNav=function(){oldNav();if(screen==='track-sim')$('#breadcrumb').textContent=tx('Simulado da trilha','Track exam')};
  const oldRender=render;
  render=function(){if(screen==='track-sim'){setNav();updateStats();draw();return}oldRender()};
  function begin(topic){
    if(!track)return;
    const isTopic=Number.isInteger(topic)&&topic>=0&&topic<track.topics.length;
    const focus=isTopic?topic:null;
    const attempted=resultFor(track.id,focus)?.attempts||0;
    const items=isTopic?[0,1,2,3].map(facet=>({topic,facet})):track.topics.flatMap((_,i)=>[{topic:i,facet:(i+attempted)%4},{topic:i,facet:(i+attempted+2)%4}]);
    current={trackId:track.id,focus,mode:'exam',items,answers:Array(items.length).fill(null),index:0,started:Date.now(),finished:false};
    screen='track-sim';render();window.scrollTo(0,0);
  }
  function draw(){
    if(!track||!current||current.trackId!==track.id){screen='track';render();return}
    if(current.finished)return drawResult();
    const {items,index,answers}=current,item=items[index],v=getQuestion(track,item.topic,item.facet),answer=answers[index];
    app.innerHTML=`<div class="jts-page"><button type="button" class="back-link" data-jts-back>${icon('back')} ${tx('Voltar à trilha','Back to track')}</button><header class="jts-hero"><span class="eyebrow">${current.mode==='review'?tx('REVISÃO DOS ERROS','REVIEW MISTAKES'):tx('SIMULADO DA SUA TRILHA','YOUR TRACK EXAM')}</span><h1>${esc(trackName(track))}</h1><p>${current.focus===null?tx('Todos os tópicos da trilha','All topics in this track'):tx('Foco em','Focus on')+' '+esc(topicText(track,current.focus)[0])} · ${items.length} ${tx('questões','questions')}</p><div class="jts-progress" role="progressbar" aria-label="${tx('Progresso do simulado','Exam progress')}" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${index}"><span style="width:${index/items.length*100}%"></span></div></header><section class="jts-question"><div class="jts-question-meta"><span>${fmt(index+1)} / ${fmt(items.length)}</span><span>${esc(topicText(track,item.topic)[0])} · ${tx(...facetNames[item.facet])}</span></div><h2>${esc(promptFor(v,item.facet))}</h2><p>${esc(v.description)}</p>${v.snippet?`<pre class="jts-code"><code>${esc(v.snippet)}</code></pre>`:''}<div class="jts-options" role="group" aria-label="${tx('Alternativas','Options')}">${v.options.map((option,i)=>`<button type="button" data-jts-choice="${i}" class="${answer===i?'selected':''}" aria-pressed="${answer===i}"><b>${'ABCD'[i]}</b><span>${esc(option)}</span></button>`).join('')}</div><div class="jts-controls"><button type="button" class="button button-plain" data-jts-prev ${index===0?'disabled':''}>${tx('Anterior','Previous')}</button><button type="button" class="button button-primary" data-jts-next>${index===items.length-1?tx('Finalizar e corrigir','Finish and review'):tx('Próxima','Next')} ${icon('arrow')}</button></div><small>${tx('Pode deixar uma questão sem resposta e voltar antes de finalizar. Seus acertos aqui não gastam vidas nem alteram o progresso das práticas.','You may skip a question and return before finishing. These answers do not use lives or change practice progress.')}</small></section></div>`;
  }
  function finish(){
    current.finished=true;
    current.seconds=Math.round((Date.now()-current.started)/1000);
    current.score=current.items.reduce((sum,item,i)=>sum+(current.answers[i]===getQuestion(track,item.topic,item.facet).correct?1:0),0);
    if(current.mode==='exam'){
      const key=recordKey(track.id,current.focus),old=record[key]||{attempts:0,best:0};
      record[key]={attempts:old.attempts+1,best:Math.max(old.best,current.score),last:current.score,at:Date.now()};
      // Keep the most recent tracks to avoid unbounded localStorage growth.
      const keys=Object.keys(record);if(keys.length>250)keys.sort((a,b)=>(record[a].at||0)-(record[b].at||0)).slice(0,keys.length-250).forEach(k=>delete record[k]);
      store();
    }
    drawResult();window.scrollTo(0,0);
  }
  function drawResult(){
    const wrong=current.items.map((item,i)=>({...item,original:i})).filter(({topic,facet,original})=>current.answers[original]!==getQuestion(track,topic,facet).correct);
    const byTopic=new Map();wrong.forEach(item=>{const row=byTopic.get(item.topic)||[];row.push(item.facet);byTopic.set(item.topic,row)});
    app.innerHTML=`<div class="jts-page"><button type="button" class="back-link" data-jts-back>${icon('back')} ${tx('Voltar à trilha','Back to track')}</button><section class="jts-result"><span class="eyebrow">${tx('SIMULADO CORRIGIDO','EXAM REVIEWED')}</span><h1>${current.score} / ${current.items.length}</h1><p>${tx('Tempo de estudo','Study time')}: ${Math.floor(current.seconds/60)} min ${current.seconds%60} s · ${wrong.length?tx('Revise os pontos abaixo e tente outra vez.','Review the points below and try again.'):tx('Você acertou tudo! Continue praticando código.','All correct! Keep practicing code.')}</p><div class="jts-result-actions"><button type="button" class="button button-primary" data-jts-retry>${tx('Novo simulado','New exam')}</button>${wrong.length?`<button type="button" class="button button-secondary" data-jts-review>${tx('Refazer só os erros','Retry mistakes')} (${wrong.length})</button>`:''}</div></section>${wrong.length?`<section class="jts-recommend"><span class="eyebrow">${tx('PRÓXIMOS PASSOS','NEXT STEPS')}</span><h2>${tx('O que revisar na trilha','What to review in the track')}</h2>${[...byTopic].map(([i,facets])=>`<div><strong>${esc(topicText(track,i)[0])}</strong><span>${facets.map(f=>tx(...facetNames[f])).join(' · ')}</span><button type="button" data-jts-study="${i}">${tx('Estudar tópico','Study topic')} ${icon('arrow')}</button></div>`).join('')}</section>`:''}<section class="jts-corrections"><h2>${tx('Correção comentada','Explained answers')}</h2>${current.items.map((item,i)=>{const v=getQuestion(track,item.topic,item.facet),right=current.answers[i]===v.correct;
      return `<details class="jts-correction ${right?'right':'wrong'}" ${right?'':'open'}><summary><b>${fmt(i+1)}</b><span>${esc(promptFor(v,item.facet))}<small>${esc(topicText(track,item.topic)[0])} · ${tx(...facetNames[item.facet])}</small></span><strong>${right?tx('Acertou','Correct'):tx('Revisar','Review')}</strong></summary><div><p>${tx('Sua resposta','Your answer')}: ${current.answers[i]===null?tx('Sem resposta','Unanswered'):esc(v.options[current.answers[i]])}</p><p><strong>${tx('Resposta correta','Correct answer')}:</strong> ${esc(v.options[v.correct])}</p><p>${esc(item.facet===2?v.t[5]:v.t[1])}</p>${item.facet===1||item.facet===2?`<code>${esc(v.t[3])}</code>`:''}<button type="button" data-jts-study="${item.topic}">${tx('Revisar as práticas deste tópico','Review this topic’s practices')}</button></div></details>`}).join('')}</section></div>`;
  }
  app.addEventListener('click',e=>{
    const b=e.target.closest('[data-jts-start],[data-jts-continue],[data-jts-choice],[data-jts-prev],[data-jts-next],[data-jts-back],[data-jts-study],[data-jts-retry],[data-jts-review]');if(!b)return;
    if(b.hasAttribute('data-jts-start')){if(screen!=='track')return;begin(b.dataset.jtsStart==='all'?null:Number(b.dataset.jtsStart));return}
    if(b.hasAttribute('data-jts-continue')){if(current&&current.trackId===track?.id){screen='track-sim';render()}return}
    if(screen!=='track-sim'||!current)return;
    if(b.hasAttribute('data-jts-back')){screen='track';render();window.scrollTo(0,0);return}
    if(b.hasAttribute('data-jts-study')){startLesson(Number(b.dataset.jtsStudy));return}
    if(b.hasAttribute('data-jts-retry')){begin(current.focus);return}
    if(b.hasAttribute('data-jts-review')){const wrong=current.items.filter((item,i)=>current.answers[i]!==getQuestion(track,item.topic,item.facet).correct);if(!wrong.length)return;current={...current,mode:'review',items:wrong,answers:Array(wrong.length).fill(null),index:0,started:Date.now(),finished:false};render();window.scrollTo(0,0);return}
    if(current.finished)return;
    if(b.hasAttribute('data-jts-choice')){current.answers[current.index]=Number(b.dataset.jtsChoice);draw();return}
    if(b.hasAttribute('data-jts-prev')){current.index=Math.max(0,current.index-1);draw();return}
    if(b.hasAttribute('data-jts-next')){if(current.index<current.items.length-1){current.index++;draw()}else finish()}
  });
})();
