'use strict';
// Teacher reactions are additive: original questions, feedback, progress and lessons stay intact.
const TEACHER_STICKERS=[
 {id:1,group:'success',motion:'cheer',pt:'Isso! Mandou bem!',en:'Yes! Well done!'},
 {id:2,group:'retry',motion:'think',pt:'Vamos olhar com calma.',en:'Let’s take another look.'},
 {id:3,group:'start',motion:'wave',pt:'Bora praticar!',en:'Let’s practice!'},
 {id:4,group:'retry',motion:'nod',pt:'Ainda não? A gente descobre.',en:'Not yet? We’ll figure it out.'},
 {id:5,group:'retry',motion:'think',pt:'Que pista está faltando?',en:'Which clue is missing?'},
 {id:6,group:'retry',motion:'think',pt:'Pensa no próximo passo.',en:'Think about the next step.'},
 {id:7,group:'retry',motion:'pop',pt:'Ops! Vamos entender.',en:'Oops! Let’s understand.'},
 {id:8,group:'start',motion:'wave',pt:'Vamos nessa?',en:'Ready to go?'},
 {id:9,group:'success',motion:'nod',pt:'Marcha! Você avançou.',en:'Keep going! You improved.'},
 {id:10,group:'success',motion:'cheer',pt:'Agora foi!',en:'You got it!'},
 {id:11,group:'success',motion:'pop',pt:'Aí sim, conquista merecida!',en:'Yes, you earned this!'},
 {id:12,group:'retry',motion:'nod',pt:'Errar faz parte de aprender.',en:'Mistakes are part of learning.'},
 {id:13,group:'success',motion:'cheer',pt:'Olha esse progresso!',en:'Look at that progress!'},
 {id:'climao',group:'gallery',motion:'think',pt:'Climão, hein?',en:'Awkward moment, huh?'},
 {id:'aula',group:'gallery',motion:'cheer',pt:'O professor em aula',en:'The teacher in class'},
 {id:'nao-grita',group:'gallery',motion:'nod',pt:'Não grita!',en:'No shouting!'}
];
const TEACHER_KEY='javalingo-professor-reactions-v1';
let teacherTurns=readLocal(TEACHER_KEY,{success:0,retry:0});
if(!teacherTurns||typeof teacherTurns!=='object')teacherTurns={success:0,retry:0};
const teacherCopy=(pt,en)=>settings.language==='en'?en:pt;
const stickerSrc=id=>typeof id==='number'?`assets/reacoes/professor-${String(id).padStart(2,'0')}.webp`:`assets/professor-figurinha-${id}.png`;
const teacherImageCache=new Map();
function warmTeacherSticker(id,priority='low'){if(typeof Image==='undefined'||teacherImageCache.has(id))return;const img=new Image();img.decoding='async';img.fetchPriority=priority;img.src=stickerSrc(id);teacherImageCache.set(id,img);img.decode?.().catch(()=>{})}
function preloadTeacherStickers(){if(typeof Image==='undefined')return;for(const s of TEACHER_STICKERS.filter(x=>x.group==='start'))warmTeacherSticker(s.id,'high');for(const group of ['success','retry']){let choices=TEACHER_STICKERS.filter(x=>x.group===group),next=Number(teacherTurns[group])||0;warmTeacherSticker(choices[next%choices.length].id,'high')}
 const rest=()=>TEACHER_STICKERS.forEach(s=>warmTeacherSticker(s.id));if(typeof requestIdleCallback==='function')requestIdleCallback(rest,{timeout:2200});else setTimeout(rest,700)}
function nextTeacherSticker(group){const choices=TEACHER_STICKERS.filter(x=>x.group===group),n=Number(teacherTurns[group])||0;teacherTurns[group]=n+1;try{localStorage.setItem(TEACHER_KEY,JSON.stringify(teacherTurns))}catch{}warmTeacherSticker(choices[(n+1)%choices.length].id,'high');return choices[n%choices.length]}
function startTeacherSticker(index){const starts=TEACHER_STICKERS.filter(x=>x.group==='start');return starts[Math.abs(index)%starts.length]}
function teacherStart(index){const s=startTeacherSticker(index);return `<aside class="teacher-start" aria-label="${teacherCopy('Convite do professor','Teacher invitation')}"><span class="teacher-sticker teacher-${s.motion}"><img src="${stickerSrc(s.id)}" alt="${teacherCopy('Professor convidando para a atividade','Teacher inviting you to start')}" loading="eager" decoding="async"></span><span><strong>Vem comigo!!!</strong><small>${teacherCopy('Leia com calma, tente uma ideia e veja o que acontece.','Read the task, try an idea and see what happens.')}</small></span><span class="teacher-start-mark" aria-hidden="true">${icon('arrow')}</span></aside>`}
function teacherReaction(group){const s=nextTeacherSticker(group);return `<aside class="teacher-reaction ${group}" role="status" aria-label="${teacherCopy('Reação do professor','Teacher reaction')}"><span class="teacher-sticker teacher-${s.motion}"><img src="${stickerSrc(s.id)}" alt="${teacherCopy('Expressão do professor','Teacher expression')}" loading="eager" decoding="async"></span><span><span class="teacher-reaction-tag">${group==='success'?teacherCopy('BOA!','NICE!'):teacherCopy('VAMOS JUNTOS','LET’S TRY')}</span><strong>${teacherCopy(s.pt,s.en)}</strong><small>${group==='success'?teacherCopy('Entender o motivo vale mais do que só acertar.','Understanding why matters more than guessing right.'):teacherCopy('Use a explicação e a analogia acima para tentar outra vez.','Use the explanation and analogy above, then try again.')}</small></span></aside>`}
const renderLessonBeforeTeacher=renderLesson;
renderLesson=function(){renderLessonBeforeTeacher();if(screen!=='lesson'||!lesson||lesson.q>=10||answered)return;let card=app.querySelector('.exercise-card');if(card)card.insertAdjacentHTML('afterbegin',teacherStart(lesson.topic*10+lesson.q))};
const feedbackBeforeTeacher=feedbackHTML;
feedbackHTML=function(v){let html=feedbackBeforeTeacher(v);if(v.kind==='choice')return html+teacherReaction(selected===v.correct?'success':'retry');return html};
const renderHomeBeforeTeacher=renderHome;
renderHome=function(){renderHomeBeforeTeacher();let hero=app.querySelector('.home-hero .hero-tags');if(hero)hero.insertAdjacentHTML('beforebegin',`<span class="teacher-hero-quote"><span aria-hidden="true">${icon('spark')}</span> Vem comigo!!!</span>`)};
const renderFinishedBeforeTeacher=renderFinished;
renderFinished=function(){renderFinishedBeforeTeacher();let box=app.querySelector('.lesson-finished .exercise-actions');if(box)box.insertAdjacentHTML('beforebegin',teacherReaction('success'))};
const renderMissionsBeforeTeacher=renderMissions;
renderMissions=function(){renderMissionsBeforeTeacher();let head=app.querySelector('.mission-workspace-head');if(head)head.insertAdjacentHTML('afterbegin',teacherStart(missionSelection.mi*4+missionSelection.si));if(missionFeedback){let el=app.querySelector('.mission-feedback');if(el)el.insertAdjacentHTML('afterend',teacherReaction(missionFeedback.ok?'success':'retry'))}};
const renderMissionFeedbackBeforeTeacher=renderMissionFeedback;
renderMissionFeedback=function(){renderMissionFeedbackBeforeTeacher();let el=app.querySelector('.mission-feedback');if(el){app.querySelector('.mission-code > .teacher-reaction')?.remove();el.insertAdjacentHTML('afterend',teacherReaction(missionFeedback.ok?'success':'retry'))}};
const renderAboutBeforeTeacher=renderAbout;
renderAbout=function(){renderAboutBeforeTeacher();app.insertAdjacentHTML('beforeend',`<section class="teacher-gallery"><div class="section-heading"><div><span class="eyebrow">${teacherCopy('VEM COMIGO!!!','VEM COMIGO!!!')}</span><h2>${teacherCopy('As reações do professor','The teacher’s reactions')}</h2></div><small>${teacherCopy(`${TEACHER_STICKERS.length} figurinhas em movimento`,`${TEACHER_STICKERS.length} moving stickers`)}</small></div><p>${teacherCopy('As reações acompanham as atividades, e as três novas figurinhas estão aqui junto das demais.','Reactions appear in the activities, and the three new stickers join the others here.')}</p><div class="teacher-gallery-grid">${TEACHER_STICKERS.map(s=>`<article class="teacher-gallery-card"><span class="teacher-sticker teacher-${s.motion}"><img src="${stickerSrc(s.id)}" alt="${teacherCopy(s.pt,s.en)}" loading="lazy"></span><strong>${teacherCopy(s.pt,s.en)}</strong></article>`).join('')}</div></section>`)};
app.addEventListener('click',e=>{let action=e.target.closest('button[data-action]')?.dataset.action;if(action==='self-correct'||action==='self-review'){let prior=app.querySelector('.teacher-reaction');prior?.remove();let feedback=app.querySelector('.feedback');if(feedback)feedback.insertAdjacentHTML('afterend',teacherReaction(action==='self-correct'?'success':'retry'))}});
preloadTeacherStickers();
render();
