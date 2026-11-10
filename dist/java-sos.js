'use strict';
// Self-contained addition. Existing tracks, practice, progress and teacher reactions are unchanged.
(() => {
  const core=window.JavaSOSCore,KEY='javalingo-sos-draft-v1';
  const t=(pt,en)=>settings.language==='en'?en:pt;
  const label=pair=>pair[settings.language==='en'?1:0];
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {code:typeof x.code==='string'?x.code.slice(0,40000):'',error:typeof x.error==='string'?x.error.slice(0,10000):''}}catch{return {code:'',error:''}}}
  let draft=load(),ownDraft=null,sample=false,issues=[],active=0,hint=0,choice=null,review='',pendingRunNote='',analyzed=null,editorCode='',editorResult=null,editorReady=false,saveTimer=null;
  function save(){if(sample)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(draft))}catch{}},450)}
  function homeCard(){return '<section class="sos-entry"><div class="sos-entry-symbol" aria-hidden="true">'+icon('spark')+'</div><div><span class="eyebrow">'+t('SEU CÓDIGO REAL, UMA PISTA DE CADA VEZ','YOUR REAL CODE, ONE CLUE AT A TIME')+'</span><h2>SOS Java</h2><p>'+t('Travou num erro? Traga o código, entenda a pista e volte a tentar.','Stuck on an error? Bring your code, follow clues, and try again.')+'</p></div><button type="button" data-sos-open>'+t('Abrir SOS Java','Open Java SOS')+'</button></section>'}
  const previousHome=renderHome;
  renderHome=function(){previousHome();app.querySelector('.home-hero')?.insertAdjacentHTML('afterend',homeCard())};
  const previousNav=setNav;
  setNav=function(){previousNav();if(screen==='sos')$('#breadcrumb').textContent='SOS Java'};
  const previousRender=render;
  render=function(){if(screen==='sos'){setNav();updateStats();renderSOS();return}previousRender()};
  function renderSOS(){
    app.innerHTML='<div class="sos-page"><button class="back-link" data-sos-home>'+icon('back')+' '+t('Todas as trilhas','All tracks')+'</button>'+
      '<header class="sos-hero"><div><span class="eyebrow">'+t('OBSERVE · ENTENDA · TENTE DE NOVO','OBSERVE · UNDERSTAND · TRY AGAIN')+'</span><h1>SOS Java</h1><p>'+t('Seu código é o ponto de partida. Encontre a pista, faça uma prática curta e teste a sua correção.','Your code is the starting point. Find a clue, do a short exercise, then test your fix.')+'</p><div class="sos-steps"><span>01 '+t('Código','Code')+'</span><span>02 '+t('Pistas','Clues')+'</span><span>03 '+t('Microprática','Quick practice')+'</span><span>04 '+t('Reteste','Retest')+'</span></div></div><img src="assets/professor-nao-grita.webp" alt="" loading="lazy"></header>'+
      '<div class="sos-workspace"><section class="sos-input-card"><div class="sos-card-head"><span class="eyebrow">'+t('SEU CASO','YOUR CASE')+'</span><h2>'+t('Onde você travou?','Where did you get stuck?')+'</h2><p>'+t('Cole um trecho de Java e, se tiver, a mensagem exata do compilador ou do console.','Paste a Java snippet and, if available, the exact compiler or console message.')+'</p></div>'+
      '<label class="sos-field" for="sosCode"><span>Java · '+t('seu código','your code')+'</span><textarea id="sosCode" spellcheck="false" maxlength="40000" placeholder="public class Main {&#10;  public static void main(String[] args) {&#10;    // seu código aqui&#10;  }&#10;}">'+esc(draft.code)+'</textarea></label>'+
      '<label class="sos-field" for="sosError"><span>'+t('Erro ou saída obtida (opcional)','Error or actual output (optional)')+'</span><textarea id="sosError" spellcheck="false" maxlength="10000" placeholder="Main.java:4: error: cannot find symbol">'+esc(draft.error)+'</textarea></label>'+
      '<div class="sos-actions"><button type="button" class="button button-primary" data-sos-analyze>'+icon('search')+' '+t('Encontrar pistas','Find clues')+'</button><button type="button" class="button button-plain" data-sos-clear>'+t('Limpar rascunho','Clear draft')+'</button></div><p class="sos-local-note">'+t('O rascunho fica só neste aparelho. Esta análise reconhece padrões e não compila Java.','The draft stays on this device. This analysis recognizes patterns and does not compile Java.')+'</p></section>'+
      '<aside class="sos-samples"><span class="eyebrow">'+t('EXPERIMENTE','TRY IT')+'</span><h2>'+t('Casos de teste','Sample cases')+'</h2><p>'+t('Abra um caso para conhecer o SOS antes de usar seu próprio código.','Open a case to explore SOS before using your own code.')+'</p><div class="sos-sample-list">'+core.SAMPLES.map((s,i)=>'<button type="button" data-sos-sample="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(label(s.name))+icon('arrow')+'</button>').join('')+'</div><div id="sosRestore"></div></aside></div>'+
      '<section id="sosFindings" class="sos-findings" aria-live="polite"></section>'+
      '<section class="sos-run-card"><div><span class="eyebrow">'+t('TESTE DE VERDADE','REAL EXECUTION')+'</span><h2>'+t('Confira no editor Java','Check in the Java editor')+'</h2><p>'+t('O editor abaixo executa Java no OneCompiler, como a prática de código existente. Ao abrir, seu código é enviado para esse serviço. Você também pode compilar no seu computador e colar o erro acima.','The editor below runs Java on OneCompiler, as the existing coding practice does. Opening it sends your code to that service. You can also compile on your computer and paste the error above.')+'</p></div><button type="button" class="button button-secondary" data-sos-run>'+icon('terminal')+' '+t('Abrir editor executável','Open runnable editor')+'</button><div id="sosRunPanel"></div></section>'+
      '<p class="sos-footer-note">'+t('Pistas são orientações de estudo. Um erro pode ter outras causas; confirme a correção executando seu programa e testando entradas diferentes.','Clues are study guidance. An error may have other causes; confirm a fix by running your program with different inputs.')+'</p></div>';
    if(sample&&ownDraft)app.querySelector('#sosRestore').innerHTML='<button type="button" data-sos-restore>'+t('Voltar ao meu rascunho','Return to my draft')+'</button>';
    if(issues.length)renderFindings();
  }
  function readInputs(){draft={code:(app.querySelector('#sosCode')?.value||'').slice(0,40000),error:(app.querySelector('#sosError')?.value||'').slice(0,10000)}}
  function analyzeCase(){
    readInputs();if(!draft.code.trim()&&!draft.error.trim()){toast(t('Cole seu código ou uma mensagem de erro.','Paste code or an error message.'));return}
    const before=analyzed,changed=before&&(before.code!==draft.code||before.error!==draft.error);
    issues=core.analyze(draft.code,draft.error);active=0;hint=0;choice=null;
    review=pendingRunNote||(changed&&before.issues.length&&!issues.some(x=>before.issues.includes(x.id))?t('A pista anterior não apareceu nesta leitura. Compile de novo para confirmar que foi corrigida.','The earlier clue did not appear this time. Compile again to confirm the fix.'):'' );pendingRunNote='';
    analyzed={...draft,issues:issues.map(x=>x.id)};renderFindings();save();
    app.querySelector('#sosFindings')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderFindings(){
    const box=app.querySelector('#sosFindings');if(!box)return;
    if(!issues.length){box.innerHTML='';return}
    const issue=issues[active],data=core.ISSUES[issue.id],quiz=data.quiz;
    box.innerHTML='<div class="sos-result-title"><div><span class="eyebrow">'+t('DIAGNÓSTICO GUIADO','GUIDED DIAGNOSIS')+'</span><h2>'+t('Uma pista de cada vez','One clue at a time')+'</h2><p>'+t('Há '+issues.length+' caminho(s) para investigar. As pistas vieram do texto informado e de sinais no código.','There are '+issues.length+' path(s) to investigate. Clues come from the supplied message and code patterns.')+'</p></div><span class="sos-result-count">'+String(active+1).padStart(2,'0')+' / '+String(issues.length).padStart(2,'0')+'</span></div>'+
      (review?'<p class="sos-review-note" role="status">'+esc(review)+'</p>':'')+
      '<div class="sos-issue-tabs" role="group" aria-label="'+t('Pistas encontradas','Found clues')+'">'+issues.map((x,i)=>'<button type="button" data-sos-issue="'+i+'" class="'+(i===active?'active':'')+'">'+String(i+1).padStart(2,'0')+' '+esc(label(core.ISSUES[x.id].title))+'</button>').join('')+'</div>'+
      '<article class="sos-diagnosis"><div class="sos-diagnosis-tag">'+(issue.origin==='error'?t('SINAL DA MENSAGEM DE ERRO','ERROR MESSAGE CLUE'):issue.origin==='code'?t('SINAL DO CÓDIGO','CODE CLUE'):t('ROTEIRO DE INVESTIGAÇÃO','INVESTIGATION ROUTE'))+'</div><h3>'+esc(label(data.title))+'</h3><p>'+esc(label(data.why))+'</p>'+
      (issue.line?'<div class="sos-evidence"><strong>'+t('Linha para conferir','Line to check')+' '+issue.line+'</strong>'+(issue.evidence?'<code>'+esc(issue.evidence)+'</code>':'')+'</div>':'')+
      '<div class="sos-hint-ladder"><strong>'+t('Pistas graduais','Gradual clues')+'</strong><ol>'+data.hints.slice(0,hint).map(x=>'<li>'+esc(label(x))+'</li>').join('')+'</ol>'+(hint<3?'<button type="button" class="button button-secondary" data-sos-hint>'+t(hint?'Próxima pista':'Revelar primeira pista',hint?'Next clue':'Reveal first clue')+'</button>':'<small>'+t('Agora tente ajustar seu código ao lado.','Now try adjusting your code above.')+'</small>')+'</div></article>'+
      '<article class="sos-quiz"><div><span class="eyebrow">'+t('MICROPRÁTICA','QUICK PRACTICE')+'</span><h3>'+esc(t(quiz[0],quiz[1]))+'</h3></div><div class="sos-quiz-options">'+quiz[2].map((option,i)=>'<button type="button" data-sos-option="'+i+'" class="'+(choice===i?(i===quiz[3]?'correct':'incorrect'):'')+'"><span>'+String.fromCharCode(65+i)+'</span><code>'+esc(option)+'</code></button>').join('')+'</div>'+(choice!==null?'<p class="sos-quiz-feedback '+(choice===quiz[3]?'ok':'retry')+'" role="status">'+(choice===quiz[3]?t('Isso! ','Yes! '):t('Ainda não. ','Not yet. '))+esc(t(quiz[4],quiz[5]))+'</p>':'')+'</article>'+
      '<div class="sos-return"><div><strong>'+t('Volte ao seu código','Return to your code')+'</strong><p>'+t('Faça o ajuste no campo acima e peça uma nova leitura. Se tiver outro erro do compilador, substitua a mensagem antiga.','Edit the code above and analyze again. If the compiler gives a new error, replace the old message.')+'</p></div><button type="button" class="button button-primary" data-sos-top>'+t('Editar e tentar de novo','Edit and try again')+'</button></div>';
  }
  function showRun(){
    readInputs();if(!draft.code.trim()){toast(t('Cole o código antes de abrir o editor.','Paste code before opening the editor.'));return}
    const panel=app.querySelector('#sosRunPanel');if(!panel)return;
    if(panel.querySelector('iframe')){panel.scrollIntoView({behavior:'smooth',block:'center'});return}
    editorCode=draft.code;editorResult=null;editorReady=false;
    panel.innerHTML='<div class="sos-editor-bar"><strong>Java · Main.java</strong><span>'+t('Execute no quadro e veja a saída','Run in the frame and inspect the output')+'</span></div><iframe id="sosEditor" title="'+t('Editor Java executável','Runnable Java editor')+'" src="https://onecompiler.com/embed/java?listenToEvents=true&codeChangeEvent=true&hideLanguageSelection=true&hideNew=true&hideTitle=true&theme='+(settings.theme==='dark'?'dark':'light')+'" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe><div id="sosLiveResult" class="sos-live-result" role="status">'+t('Aguardando execução. Se o editor não carregar, compile no seu computador e cole o erro acima.','Waiting for execution. If the editor does not load, compile on your computer and paste the error above.')+'</div><button type="button" class="button button-secondary" data-sos-use>'+t('Trazer código e resultado para o SOS','Bring code and result into SOS')+'</button>';
    panel.scrollIntoView({behavior:'smooth',block:'center'});
  }
  app.addEventListener('input',e=>{if(screen!=='sos'||!['sosCode','sosError'].includes(e.target.id))return;if(sample){sample=false;ownDraft=null;app.querySelector('#sosRestore').innerHTML=''}readInputs();save()});
  app.addEventListener('click',e=>{
    if(e.target.closest('[data-sos-open]')){navigate('sos');return}
    if(screen!=='sos')return;
    const b=e.target.closest('[data-sos-home],[data-sos-analyze],[data-sos-clear],[data-sos-sample],[data-sos-restore],[data-sos-issue],[data-sos-hint],[data-sos-option],[data-sos-top],[data-sos-run],[data-sos-use]');if(!b)return;
    if(b.hasAttribute('data-sos-home')){navigate('home');return}
    if(b.hasAttribute('data-sos-analyze')){analyzeCase();return}
    if(b.hasAttribute('data-sos-clear')){draft={code:'',error:''};sample=false;ownDraft=null;issues=[];review='';editorResult=null;clearTimeout(saveTimer);try{localStorage.removeItem(KEY)}catch{}renderSOS();app.querySelector('#sosCode')?.focus();return}
    if(b.hasAttribute('data-sos-sample')){const s=core.SAMPLES[Number(b.dataset.sosSample)];if(!s)return;if(!sample){readInputs();ownDraft={...draft}}sample=true;draft={code:s.code,error:s.error};app.querySelector('#sosCode').value=draft.code;app.querySelector('#sosError').value=draft.error;app.querySelector('#sosRestore').innerHTML='<button type="button" data-sos-restore>'+t('Voltar ao meu rascunho','Return to my draft')+'</button>';analyzeCase();return}
    if(b.hasAttribute('data-sos-restore')){draft=ownDraft||load();sample=false;ownDraft=null;issues=[];review='';renderSOS();return}
    if(b.hasAttribute('data-sos-issue')){active=Number(b.dataset.sosIssue);hint=0;choice=null;renderFindings();return}
    if(b.hasAttribute('data-sos-hint')){hint=Math.min(3,hint+1);renderFindings();return}
    if(b.hasAttribute('data-sos-option')){choice=Number(b.dataset.sosOption);renderFindings();return}
    if(b.hasAttribute('data-sos-top')){app.querySelector('#sosCode')?.scrollIntoView({behavior:'smooth',block:'center'});app.querySelector('#sosCode')?.focus();return}
    if(b.hasAttribute('data-sos-run')){showRun();return}
    if(b.hasAttribute('data-sos-use')){const code=editorCode||draft.code;if(code)app.querySelector('#sosCode').value=code;if(editorResult){app.querySelector('#sosError').value=editorResult.error||'';pendingRunNote=editorResult.error?t('O erro do editor foi trazido para a análise.','The editor error was brought into the analysis.'):t('O editor retornou uma saída sem erro reportado. Confira se ela é a esperada.','The editor returned output without a reported error. Check whether it is the expected output.')}sample=false;ownDraft=null;readInputs();analyzeCase();return}
  });
  app.addEventListener('load',e=>{if(screen!=='sos'||e.target.id!=='sosEditor')return;const frame=e.target;setTimeout(()=>{if(screen==='sos'&&app.querySelector('#sosEditor')===frame){frame.contentWindow?.postMessage({eventType:'populateCode',language:'java',files:[{name:'Main.java',content:editorCode}]},'https://onecompiler.com');editorReady=true}},450)},true);
  window.addEventListener('message',e=>{const frame=app.querySelector('#sosEditor');if(screen!=='sos'||e.origin!=='https://onecompiler.com'||e.source!==frame?.contentWindow)return;let data=e.data;if(typeof data==='string'){try{data=JSON.parse(data)}catch{return}}if(!data||typeof data!=='object'||data.language&&String(data.language).toLowerCase()!=='java')return;const files=Array.isArray(data.files)?data.files:[],code=files.find(f=>/\.java$/i.test(f.name||''))?.content||files[0]?.content;if(editorReady&&typeof code==='string'&&code.length<=40000)editorCode=code;const result=parseResult(data);if(result){editorResult=result;const box=app.querySelector('#sosLiveResult');if(box)box.innerHTML='<strong>'+(result.error?t('Erro recebido','Error received'):t('Saída recebida','Output received'))+'</strong><pre>'+esc((result.error||result.output||'').slice(0,4000))+'</pre><small>'+t('Confira o resultado no editor. Use o botão abaixo para analisar este retorno.','Check the result in the editor. Use the button below to analyze it.')+'</small>'}});
  if(screen==='home')app.querySelector('.home-hero')?.insertAdjacentHTML('afterend',homeCard());
})();
