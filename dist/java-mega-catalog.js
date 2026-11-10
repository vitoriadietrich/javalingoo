'use strict';
(() => {
  const PAGE_SIZE=24;
  let query='',area='all',page=0,mainQuery='',mainArea='all',mainPage=0;
  const isEnglish=()=>settings.language==='en';
  const t=(pt,en)=>isEnglish()?en:pt;
  const focusFor=value=>{const m=/^focus-(\d+)$/.exec(value);return m?JAVA_FOCUS_AREAS[Number(m[1])]||null:null};
  const focusNameMatches=(value,needle)=>{const f=focusFor(value);return !!f&&`${f.title} ${f.en}`.toLocaleLowerCase().includes(needle)};
  const matchesArea=(value,index)=>value==='all'||(focusFor(value)?focusFor(value).groups.includes(index):Number(value)===index);
  const matchesRoute=(value,number,main)=>{
    const index=main?javaMainArea(number):javaMegaArea(number);
    return matchesArea(value,index)&&(!focusFor(value)||javaRouteHasFocus(number,main,focusFor(value)));
  };
  function areaOptions(value){
    return `<option value="all">${t('Todas as áreas','All areas')}</option><optgroup label="${t('Áreas gerais','Main areas')}">${JAVA_MEGA_AREAS.map((a,i)=>`<option value="${i}" ${value===String(i)?'selected':''}>${esc(isEnglish()?a.en:a.title)}</option>`).join('')}</optgroup><optgroup label="${t('Assuntos específicos','Focused topics')}">${JAVA_FOCUS_AREAS.map((a,i)=>`<option value="focus-${i}" ${value===`focus-${i}`?'selected':''}>${esc(isEnglish()?a.en:a.title)}</option>`).join('')}</optgroup>`;
  }
  function areaText(a){return [a.title,a.en,...a.ids.flatMap(id=>{
    const tr=JAVA_CORE_TRACKS.get(id);
    return [tr.title,...tr.topics.map(topic=>topic[0])];
  })].join(' ').toLocaleLowerCase()}
  const searchable=JAVA_MEGA_AREAS.map(areaText);
  function matchingNumbers(){
    const needle=query.trim().toLocaleLowerCase();
    const number=needle.match(/^(?:#|trilha\s*|rota\s*|track\s*|route\s*)?(\d{3,6})$/);
    if(number){const n=Number(number[1]);return n>=JAVA_MEGA_FIRST&&n<=JAVA_MEGA_LAST&&matchesRoute(area,n,false)?[n]:[]}
    const numbers=[];
    JAVA_MEGA_AREAS.forEach((a,i)=>{
      if(!matchesArea(area,i))return;
      if(needle&&!searchable[i].includes(needle)&&!focusNameMatches(area,needle))return;
      const first=JAVA_MEGA_FIRST+i*JAVA_MEGA_PER_AREA;
      for(let n=first;n<first+JAVA_MEGA_PER_AREA+(i===9?100:0);n++)if(matchesRoute(area,n,false))numbers.push(n);
      for(let n=10101+i*1000;n<10101+(i+1)*1000;n++)if(matchesRoute(area,n,false))numbers.push(n);
      for(let n=20101+i*8000;n<20101+(i+1)*8000;n++)if(matchesRoute(area,n,false))numbers.push(n);
    });
    return numbers;
  }
  function card(route){
    const done=javaMegaCompleted(route.id),number=javaMegaNumber(route.id)||javaMainNumber(route.id);
    return `<button type="button" class="mega-route-card" data-mega-track="${route.id}" style="--accent:${route.color}"><span class="mega-route-number">#${String(number).padStart(5,'0')} · ${esc(isEnglish()?JAVA_MEGA_AREAS[route.catalogTier==='main'?javaMainArea(number):javaMegaArea(number)].en:route.group)}</span><strong>${esc(isEnglish()?route.enTitle:route.title)}</strong><small>${route.catalogTier==='main'?t('10 tópicos · trilha orientada','10 topics · guided track'):t('10 tópicos · revisão integrada','10 topics · integrated review')} · ${done}/100 ${t('práticas','practices')}</small><span class="progress-line"><span style="width:${Math.min(done,100)}%"></span></span></button>`;
  }
  function drawCatalog(){
    const mount=app.querySelector('#javaMegaCatalog');if(!mount)return;
    const matches=matchingNumbers(),pages=Math.max(1,Math.ceil(matches.length/PAGE_SIZE));page=Math.max(0,Math.min(page,pages-1));
    const slice=matches.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
    const day=new Date(),daySeed=Number(`${day.getFullYear()}${String(day.getMonth()+1).padStart(2,'0')}${String(day.getDate()).padStart(2,'0')}`);
    const today=JAVA_MEGA_FIRST+daySeed%100000;
    mount.innerHTML=`<div class="mega-heading"><span class="eyebrow">JAVA SE · ${t('ROTAS DE PRÁTICA','PRACTICE ROUTES')}</span><h2>${t('Explore 100.000 percursos combinados','Explore 100,000 combined routes')}</h2><p>${t('Cada percurso reúne 10 tópicos reais das trilhas de Java em outra sequência para revisar e fixar. As trilhas de conteúdo preservadas formam a base dessas revisões.','Each route combines 10 real Java topics in a different sequence for review. The preserved content tracks provide the base for these reviews.')}</p></div><div class="mega-actions"><button type="button" class="button button-secondary" data-mega-track="java-rota-${today}">${t('Trilha de hoje','Today’s route')} #${today}</button><button type="button" class="button button-secondary" data-mega-random>${t('Me surpreenda','Surprise me')}</button></div><div class="mega-controls"><label>${t('Buscar assunto ou número da trilha','Search topic or route number')}<input id="megaSearch" type="search" value="${esc(query)}" placeholder="${t('Ex.: Streams ou 4250','E.g. Streams or 4250')}" autocomplete="off"></label><label>${t('Área de Java','Java area')}<select id="megaArea">${areaOptions(area)}</select></label></div><p class="mega-result-count" role="status">${matches.length.toLocaleString(isEnglish()?'en-US':'pt-BR')} ${t('percursos encontrados','routes found')}</p>${slice.length?`<div class="mega-route-grid">${slice.map(n=>card(javaMegaRoute(n))).join('')}</div>`:`<div class="mega-empty">${t('Nenhuma trilha encontrada. Tente outra área ou palavra.','No route found. Try another area or word.')}</div>`}<div class="mega-pages"><button type="button" class="button button-secondary" data-mega-page="prev" ${page===0?'disabled':''}>${t('Anterior','Previous')}</button><span>${t('Página','Page')} ${page+1} ${t('de','of')} ${pages}</span><button type="button" class="button button-secondary" data-mega-page="next" ${page>=pages-1?'disabled':''}>${t('Próxima','Next')}</button></div>`;
  }
  function matchingMainNumbers(){
    const needle=mainQuery.trim().toLocaleLowerCase();
    const number=needle.match(/^(?:#|trilha\s*|track\s*)?(\d{3,6})$/);
    if(number){const n=Number(number[1]);return n>=101&&n<=JAVA_MAIN_LAST&&matchesRoute(mainArea,n,true)?[n]:[]}
    const numbers=[];
    JAVA_MEGA_AREAS.forEach((a,i)=>{
      if(!matchesArea(mainArea,i))return;
      if(needle&&!searchable[i].includes(needle)&&!focusNameMatches(mainArea,needle))return;
      for(let n=101+i*90;n<101+(i+1)*90;n++)if(matchesRoute(mainArea,n,true))numbers.push(n);
      for(let n=1001+i*900;n<1001+(i+1)*900;n++)if(matchesRoute(mainArea,n,true))numbers.push(n);
      for(let n=10001+i*9000;n<10001+(i+1)*9000;n++)if(matchesRoute(mainArea,n,true))numbers.push(n);
    });
    return numbers;
  }
  function drawMainCatalog(){
    const mount=app.querySelector('#javaMainCatalog');if(!mount)return;
    const matches=matchingMainNumbers(),pages=Math.max(1,Math.ceil(matches.length/PAGE_SIZE));
    mainPage=Math.max(0,Math.min(mainPage,pages-1));
    const slice=matches.slice(mainPage*PAGE_SIZE,(mainPage+1)*PAGE_SIZE);
    mount.innerHTML=`<div class="mega-heading"><span class="eyebrow">JAVA · ${t('CATÁLOGO PRINCIPAL','MAIN CATALOG')}</span><h2>${t('100.000 trilhas de Java','100,000 Java tracks')}</h2><p>${t('As 100 trilhas que você já conhece continuam logo abaixo. Aqui estão mais 99.900 trilhas orientadas, com sequências distintas dos tópicos de Java para praticar sem se perder.','The 100 tracks you already know remain below. Here are 99,900 more guided tracks with different Java topic sequences.')}</p></div><div class="mega-controls"><label>${t('Buscar tema ou número','Search topic or number')}<input id="mainTrackSearch" type="search" value="${esc(mainQuery)}" placeholder="${t('Ex.: classes ou 280','E.g. classes or 280')}" autocomplete="off"></label><label>${t('Área de Java','Java area')}<select id="mainTrackArea">${areaOptions(mainArea)}</select></label></div><p class="mega-result-count" role="status">${matches.length.toLocaleString(isEnglish()?'en-US':'pt-BR')} ${t('trilhas adicionais encontradas','additional tracks found')}</p>${slice.length?`<div class="mega-route-grid">${slice.map(n=>card(javaMainRoute(n))).join('')}</div>`:`<div class="mega-empty">${t('Nenhuma trilha encontrada. Tente outra busca.','No track found. Try another search.')}</div>`}<div class="mega-pages"><button type="button" class="button button-secondary" data-main-page="prev" ${mainPage===0?'disabled':''}>${t('Anterior','Previous')}</button><span>${t('Página','Page')} ${mainPage+1} ${t('de','of')} ${pages}</span><button type="button" class="button button-secondary" data-main-page="next" ${mainPage>=pages-1?'disabled':''}>${t('Próxima','Next')}</button></div>`;
  }
  const oldHome=renderHome;
  renderHome=function(){
    oldHome();
    const tags=app.querySelector('.home-hero .hero-tags');
    if(tags)tags.innerHTML=`<span>${t('200.000 percursos ao todo','200,000 total routes')}</span><span>${t('100.000 principais','100,000 main tracks')}</span><span>${t('100.000 revisões','100,000 reviews')}</span><span>${t('100.000 simulados','100,000 mock exams')}</span>`;
    const anchor=app.querySelector('.section-heading');
    if(anchor){anchor.insertAdjacentHTML('beforebegin','<section id="javaMegaCatalog" class="mega-catalog" aria-label="Catálogo de percursos de Java"></section><section id="javaMainCatalog" class="mega-catalog" aria-label="Trilhas orientadas de Java"></section>');drawMainCatalog();drawCatalog();
      const h=anchor.querySelector('h2');if(h)h.textContent=t('Continue nas trilhas que você já conhecia','Continue with the tracks you know');
    }
  };
  app.addEventListener('input',event=>{
    if(event.target.id==='megaSearch'){
      const cursor=event.target.selectionStart;query=event.target.value;page=0;drawCatalog();
      const input=app.querySelector('#megaSearch');input.focus();input.setSelectionRange(cursor,cursor);
    }
    if(event.target.id==='mainTrackSearch'){
      const cursor=event.target.selectionStart;mainQuery=event.target.value;mainPage=0;drawMainCatalog();
      const input=app.querySelector('#mainTrackSearch');input.focus();input.setSelectionRange(cursor,cursor);
    }
  });
  app.addEventListener('change',event=>{
    if(event.target.id==='megaArea'){area=event.target.value;page=0;drawCatalog()}
    if(event.target.id==='mainTrackArea'){mainArea=event.target.value;mainPage=0;drawMainCatalog()}
  });
  app.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.megaPage){page+=button.dataset.megaPage==='next'?1:-1;drawCatalog();app.querySelector('#javaMegaCatalog')?.scrollIntoView({block:'start'});return}
    if(button.dataset.mainPage){mainPage+=button.dataset.mainPage==='next'?1:-1;drawMainCatalog();app.querySelector('#javaMainCatalog')?.scrollIntoView({block:'start'});return}
    if(button.hasAttribute('data-mega-random')){const n=JAVA_MEGA_FIRST+Math.floor(Math.random()*100000);openRoute(`java-rota-${n}`);return}
    if(button.dataset.megaTrack){openRoute(button.dataset.megaTrack);return}
  });
  function openRoute(id){
    track=findJavaTrack(id);if(!track)return;
    screen='track';render();window.scrollTo(0,0);
  }
  if(screen==='home')render();
})();
