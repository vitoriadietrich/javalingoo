'use strict';
// Daily streak and a quiet, in-app reminder. Nothing here requests OS notifications.
const STREAK_REMINDER_KEY='javalingo-daily-reminder-v1';
document.querySelector('.svg-defs')?.insertAdjacentHTML('beforeend','<symbol id="i-bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-2 8-2 9h16c0-1-2-2-2-9ZM10 21h4"/></symbol>');
let streakReminder=readLocal(STREAK_REMINDER_KEY,{enabled:true,lastShown:''});
if(!streakReminder||typeof streakReminder!=='object')streakReminder={enabled:true,lastShown:''};
streakReminder.enabled=streakReminder.enabled!==false;
const saveStreakReminder=()=>{try{localStorage.setItem(STREAK_REMINDER_KEY,JSON.stringify(streakReminder))}catch{}};
const streakWords=(pt,en)=>settings.language==='en'?en:pt;
const streakDate=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const streakYesterday=()=>{let d=new Date();d.setDate(d.getDate()-1);return streakDate(d)};
const streakCurrent=()=>missionState.lastDaily===dayKey()||missionState.lastDaily===streakYesterday()?Math.max(0,Number(missionState.streak)||0):0;
const recordedDays=Array.isArray(missionState.completedDays)?missionState.completedDays.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)):[];
const completedDays=new Set(recordedDays);
if(/^\d{4}-\d{2}-\d{2}$/.test(missionState.lastDaily||'')){
 if(!recordedDays.length){
  const [year,month,day]=missionState.lastDaily.split('-').map(Number);
  const last=new Date(year,month-1,day,12);
  for(let i=0;i<Math.min(365,Math.max(1,Number(missionState.streak)||1));i++){
   const date=new Date(last);date.setDate(date.getDate()-i);completedDays.add(streakDate(date))
  }
 }else completedDays.add(missionState.lastDaily)
}
missionState.completedDays=[...completedDays].sort().slice(-365);
saveMission();

function streakWeek(){
 const names=new Intl.DateTimeFormat(settings.language==='en'?'en-US':'pt-BR',{weekday:'short'});
 return Array.from({length:7},(_,i)=>{
  let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);
  const key=streakDate(d),today=key===dayKey(),done=completedDays.has(key);
  const label=names.format(d).replace('.',''),status=done?streakWords('concluído','complete'):today?streakWords('hoje, pendente','today, pending'):streakWords('não concluído','not complete');
  return `<span class="streak-day ${done?'is-done':''} ${today?'is-today':''}" aria-label="${esc(label+' '+d.getDate()+': '+status)}"><small>${esc(label)}</small><span>${done?icon('check'):d.getDate()}</span></span>`
 }).join('')
}
function streakPanel(){
 const daily=currentDaily(),count=streakCurrent(),remaining=3-Object.values(daily.done).filter(Boolean).length,active=streakReminder.enabled;
 const headline=remaining===0?streakWords('Dia de estudo garantido!','Study day secured!'):count?streakWords(`${count} ${count===1?'dia seguido':'dias seguidos'}`,`${count} ${count===1?'day':'days'} in a row`):streakWords('Seu próximo dia começa aqui','Your next day starts here');
 const detail=remaining===0?streakWords('Volte amanhã para continuar a sequência.','Come back tomorrow to keep it going.'):streakWords(`Faltam ${remaining} ${remaining===1?'etapa':'etapas'} da Missão do Dia para marcar hoje.`,`${remaining} Daily Mission ${remaining===1?'step':'steps'} left to complete today.`);
 return `<section class="streak-panel" aria-label="${streakWords('Sua sequência de estudos','Your study streak')}"><div class="streak-panel-top"><span class="streak-emblem" aria-hidden="true">${icon('spark')}</span><div><span class="streak-eyebrow">${streakWords('SEQUÊNCIA DE ESTUDOS','STUDY STREAK')}</span><h2>${headline}</h2><p>${detail}</p></div><strong class="streak-number" aria-label="${count} ${streakWords('dias seguidos','days in a row')}">${count}<small>${streakWords('dias','days')}</small></strong></div><div class="streak-week" role="group" aria-label="${streakWords('Últimos sete dias','Last seven days')}">${streakWeek()}</div><div class="streak-panel-foot"><span>${streakWords('Um dia conta após as três etapas. O aviso aparece aqui ao abrir.','A day counts after three steps. Reminders appear here on open.')}</span><button type="button" data-streak-toggle aria-pressed="${active}">${icon('bell')} ${active?streakWords('Aviso ao abrir ligado','On-open reminder on'):streakWords('Ativar aviso ao abrir','Enable on-open reminder')}</button></div></section>`
}
const renderHomeBeforeStreak=renderHome;
renderHome=function(){
 renderHomeBeforeStreak();
 app.querySelector('.daily-banner')?.insertAdjacentHTML('afterend',streakPanel());
 queueStreakReminder()
};
const renderMissionsBeforeStreak=renderMissions;
renderMissions=function(){
 renderMissionsBeforeStreak();
 app.querySelector('.mission-daily')?.insertAdjacentHTML('afterend',streakPanel())
};

function refreshStreakPanels(){
 app.querySelectorAll('.streak-panel').forEach(panel=>panel.outerHTML=streakPanel());
 const d=currentDaily(),total=Object.values(d.done).filter(Boolean).length;
 const meter=app.querySelector('.daily-banner .daily-meter');
 if(meter)meter.innerHTML=`${total}/3 ${icon('arrow')}`;
 const foot=app.querySelector('.daily-foot');
 if(foot)foot.innerHTML=`${streakWords('Sequência de dias completos','Completed-day streak')}: <strong>${streakCurrent()}</strong> · ${total}/3 ${streakWords('etapas hoje','steps today')}`;
 for(const part of ['review','concept','code']){
  const button=app.querySelector(`.daily-task[data-daily="${part}"]`);
  if(button&&d.done[part]){button.classList.add('done');const index=button.querySelector('span');if(index)index.innerHTML=icon('check');const label=button.querySelector('small');if(label)label.textContent=streakWords('Feito','Done')}
 }
}
function removeStreakNotice(){document.querySelector('#streak-notice')?.remove()}
function showStreakNotice(complete=false){
 removeStreakNotice();
 const count=streakCurrent(),left=3-Object.values(currentDaily().done).filter(Boolean).length;
 const title=complete?streakWords(`Presença confirmada: ${count} ${count===1?'dia seguido':'dias seguidos'}!`,`Checked in: ${count} ${count===1?'day':'days'} in a row!`):streakWords('Sua Missão do Dia está esperando','Your Daily Mission is waiting');
 const detail=complete?streakWords('Você fechou as três etapas e ganhou 25 XP. O professor ia chamar presença, mas você já chegou!','Three steps done and 25 XP earned. You got here before roll call!'):count?streakWords(`Mais ${left} ${left===1?'etapa':'etapas'} hoje para manter seus ${count} ${count===1?'dia':'dias'} de sequência.`,`${left} more ${left===1?'step':'steps'} today to keep your ${count}-day streak.`):streakWords(`Complete as três etapas para começar sua sequência. Faltam ${left}.`,`Complete all three steps to start your streak. ${left} to go.`);
 const note=document.createElement('aside');note.id='streak-notice';note.className=`streak-notice ${complete?'is-celebration':''}`;
 note.setAttribute('role','status');note.setAttribute('aria-live','polite');
 note.innerHTML=`<div class="streak-notice-head"><span class="streak-notice-icon" aria-hidden="true">${icon(complete?'check':'bell')}</span><strong>JavaLingo</strong><small>${streakWords('agora','now')}</small><button type="button" data-streak-close aria-label="${streakWords('Fechar lembrete','Close reminder')}">${icon('close')}</button></div><h2>${title}</h2><p>${detail}</p>${complete?'':`<button class="streak-notice-cta" type="button" data-streak-start>${streakWords('Abrir minha missão','Open my mission')} ${icon('arrow')}</button>`}`;
 document.body.append(note)
}
let streakReminderTimer=null;
function queueStreakReminder(){
 clearTimeout(streakReminderTimer);
 streakReminderTimer=setTimeout(()=>{
  if(screen!=='home'||document.visibilityState!=='visible'||!streakReminder.enabled||streakReminder.lastShown===dayKey())return;
  if(Object.values(currentDaily().done).every(Boolean))return;
  streakReminder.lastShown=dayKey();saveStreakReminder();showStreakNotice()
 },1100)
}
const finishDailyPartBeforeStreak=finishDailyPart;
finishDailyPart=function(part){
 const previousDate=missionState.lastDaily;
 finishDailyPartBeforeStreak(part);
 if(missionState.lastDaily!==previousDate){
  completedDays.add(missionState.lastDaily);
  missionState.completedDays=[...completedDays].sort().slice(-365);saveMission();
  refreshStreakPanels();showStreakNotice(true)
 }else refreshStreakPanels()
};
document.addEventListener('click',event=>{
 if(event.target.closest('[data-streak-close]')){removeStreakNotice();return}
 if(event.target.closest('[data-streak-start]')){removeStreakNotice();navigate('missions');return}
 if(event.target.closest('[data-streak-toggle]')){
  streakReminder.enabled=!streakReminder.enabled;saveStreakReminder();
  if(!streakReminder.enabled)removeStreakNotice();
  refreshStreakPanels();
  if(streakReminder.enabled)queueStreakReminder()
 }
});
let lastStreakDate=dayKey();
setInterval(()=>{
 if(dayKey()!==lastStreakDate){
  lastStreakDate=dayKey();if(screen==='home')renderHome()
 }
},60000);
render();
