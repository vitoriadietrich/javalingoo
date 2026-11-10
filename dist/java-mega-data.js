'use strict';
// Catálogo de 200.000 percursos: 100 trilhas anteriores, 99.900 orientadas
// e 100.000 revisões combinadas. IDs anteriores conservam conteúdo e progresso.
// As combinações revisitam os tópicos autorais; não são assuntos inéditos.
const JAVA_MAIN_LAST=100000;
const JAVA_MEGA_LAST=100100;
const JAVA_TOTAL_TRACKS=200000;
const JAVA_MEGA_FIRST=101;
const JAVA_MEGA_PER_AREA=990;
const JAVA_MEGA_PROGRESS_KEY='javalingo-mega-progress-v1';
let javaMegaProgress={};
try {javaMegaProgress=JSON.parse(localStorage.getItem(JAVA_MEGA_PROGRESS_KEY)||'{}')||{}} catch {}
const JAVA_HEX_BITS=[0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4];
const JAVA_MEGA_AREAS=[
  {title:'Fundamentos e sintaxe',en:'Foundations and syntax',icon:'terminal',color:'#5eafc3',ids:['inicio','tutorial','dados','logica','decisoes2']},
  {title:'Lógica e algoritmos',en:'Logic and algorithms',icon:'route',color:'#e39a47',ids:['logica','lacos','metodos','metodos2','mapas2']},
  {title:'Classes e objetos',en:'Classes and objects',icon:'boxes',color:'#ab85bd',ids:['poo','classes2','poo2','metodos2','aprofundamento-10']},
  {title:'Coleções e genéricos',en:'Collections and generics',icon:'layers',color:'#56b3a2',ids:['colecoes','listas2','mapas2','aprofundamento-10','aprofundamento-4']},
  {title:'Strings e números',en:'Strings and numbers',icon:'grid',color:'#d5a46e',ids:['texto','dados','referencias2','aprofundamento-3','aprofundamento-2']},
  {title:'Erros e arquivos',en:'Errors and files',icon:'file',color:'#d88279',ids:['erros','arquivos2','fluxos2','aprofundamento-6']},
  {title:'Java moderno',en:'Modern Java',icon:'spark',color:'#8f82d2',ids:['avancado2','aprofundamento-1','aprofundamento-4','aprofundamento-10']},
  {title:'Concorrência',en:'Concurrency',icon:'route',color:'#7998d5',ids:['aprofundamento-5','avancado2','erros','metodos2']},
  {title:'Biblioteca padrão e JVM',en:'Standard library and JVM',icon:'book',color:'#74b4ad',ids:['aprofundamento-2','aprofundamento-3','aprofundamento-6','aprofundamento-7','aprofundamento-8','aprofundamento-9']},
  {title:'Swing e aplicações',en:'Swing and applications',icon:'window',color:'#c08dab',ids:['swing','poo2','classes2','referencias2','aprofundamento-1']}
];
// Filtros temáticos adicionais. Uma rota aparece somente se contém pelo menos
// um tópico da fonte indicada; as áreas originais e seus IDs permanecem iguais.
const JAVA_FOCUS_AREAS=[
  {title:'JDK, sintaxe e primeiro programa',en:'JDK, syntax and first program',groups:[0,8],ids:['inicio','tutorial','aprofundamento-9']},
  {title:'Variáveis e tipos',en:'Variables and types',groups:[0,4],ids:['dados']},
  {title:'Operadores e decisões',en:'Operators and decisions',groups:[0,1],ids:['logica','decisoes2']},
  {title:'Laços, arrays e matrizes',en:'Loops and arrays',groups:[1],ids:['lacos']},
  {title:'Métodos e recursão',en:'Methods and recursion',groups:[1,2],ids:['metodos','metodos2']},
  {title:'Classes, objetos e construtores',en:'Classes, objects and constructors',groups:[2,9],ids:['poo','classes2'],topics:{poo:[0,1,2,3,4],classes2:[0,1,2,3,4,5,6,7,8]}},
  {title:'Herança, interfaces e polimorfismo',en:'Inheritance, interfaces and polymorphism',groups:[2,9],ids:['poo','poo2'],topics:{poo:[5,6,7],poo2:[0,1,2,4,5]}},
  {title:'Listas e conjuntos',en:'Lists and sets',groups:[3],ids:['colecoes','listas2']},
  {title:'Mapas, busca e ordenação',en:'Maps, search and sorting',groups:[1,3],ids:['mapas2']},
  {title:'Genéricos e contratos',en:'Generics and contracts',groups:[2,3,6],ids:['aprofundamento-10']},
  {title:'Strings e Math',en:'Strings and Math',groups:[4],ids:['texto','referencias2'],topics:{texto:[0,1,2,3,4,5,6,7,8,9],referencias2:[1,2]}},
  {title:'Expressões regulares',en:'Regular expressions',groups:[6],ids:['avancado2'],topics:{avancado2:[3]}},
  {title:'Datas, horas e fusos',en:'Dates, times and zones',groups:[4,8],ids:['aprofundamento-2']},
  {title:'BigDecimal e precisão',en:'BigDecimal and precision',groups:[4,8],ids:['aprofundamento-3']},
  {title:'Exceções e depuração',en:'Exceptions and debugging',groups:[5,7],ids:['erros'],topics:{erros:[2,3,4,7,8]}},
  {title:'Entrada, saída e charset',en:'Input, output and charsets',groups:[5],ids:['fluxos2']},
  {title:'Arquivos e NIO',en:'Files and NIO',groups:[5,8],ids:['aprofundamento-6']},
  {title:'Streams e coletores',en:'Streams and collectors',groups:[3,6],ids:['aprofundamento-4']},
  {title:'Records, sealed e switch moderno',en:'Records, sealed types and modern switch',groups:[6,9],ids:['aprofundamento-1']},
  {title:'Optional e imutabilidade',en:'Optional and immutability',groups:[3,6],ids:['aprofundamento-10','avancado2'],topics:{'aprofundamento-10':[8],avancado2:[7,8]}},
  {title:'Threads e tarefas assíncronas',en:'Threads and async tasks',groups:[7],ids:['aprofundamento-5']},
  {title:'HTTP com Java',en:'HTTP with Java',groups:[8],ids:['aprofundamento-7']},
  {title:'JDBC e transações',en:'JDBC and transactions',groups:[8],ids:['aprofundamento-8']},
  {title:'JVM e ferramentas do JDK',en:'JVM and JDK tools',groups:[8],ids:['aprofundamento-9']},
  {title:'Interfaces gráficas Swing',en:'Swing user interfaces',groups:[9],ids:['swing']},
  {title:'APIs da biblioteca padrão',en:'Standard library APIs',groups:[4,9],ids:['referencias2']}
];
const JAVA_CORE_TRACKS=new Map(TRACKS.map(tr=>[tr.id,tr]));
const JAVA_ROUTE_POOLS=JAVA_MEGA_AREAS.map(area=>area.ids.flatMap(id=>JAVA_CORE_TRACKS.get(id).topics.map((_,index)=>({id,index}))));
function parseJavaPracticeId(id){
  const parts=String(id||'').split('-');
  if(parts.length<3)return {trackId:'',topicId:'',questionId:''};
  return {trackId:parts.slice(0,-2).join('-'),topicId:parts.at(-2),questionId:parts.at(-1)};
}
function javaMegaNumber(id){const match=/^java-rota-(\d{3,6})$/.exec(String(id));if(!match)return 0;const n=Number(match[1]);return n>=JAVA_MEGA_FIRST&&n<=JAVA_MEGA_LAST?n:0}
function javaMainNumber(id){const match=/^java-principal-(\d{3,6})$/.exec(String(id));if(!match)return 0;const n=Number(match[1]);return n>=101&&n<=JAVA_MAIN_LAST?n:0}
function javaMegaBit(id){
  const {trackId,topicId,questionId}=parseJavaPracticeId(id);
  const topic=Number(topicId),question=Number(questionId);
  if(!(javaMegaNumber(trackId)||javaMainNumber(trackId))||!Number.isInteger(topic)||topic<0||topic>9||!Number.isInteger(question)||question<0||question>9)return null;
  return {trackId,bit:topic*10+question};
}
function isJavaDone(id){
  const item=javaMegaBit(id);if(!item)return !!progress.done[id];
  const digits=javaMegaProgress[item.trackId]||'';
  return !!(parseInt(digits[Math.floor(item.bit/4)]||'0',16)&(1<<(item.bit%4)));
}
function markJavaDone(id){
  const item=javaMegaBit(id);if(!item)return false;
  const digits=(javaMegaProgress[item.trackId]||'').padEnd(25,'0').split('');
  const i=Math.floor(item.bit/4),value=parseInt(digits[i],16)|(1<<(item.bit%4));
  digits[i]=value.toString(16);javaMegaProgress[item.trackId]=digits.join('');
  try {localStorage.setItem(JAVA_MEGA_PROGRESS_KEY,JSON.stringify(javaMegaProgress))} catch {}
  return true;
}
function javaMegaCompleted(id){
  const digits=javaMegaProgress[id]||'';
  return [...digits].reduce((total,digit)=>total+JAVA_HEX_BITS[parseInt(digit,16)],0);
}
function javaMegaArea(number){return number>20100?Math.floor((number-20101)/8000):number>10100?Math.floor((number-10101)/1000):number>10000?9:Math.floor((number-JAVA_MEGA_FIRST)/JAVA_MEGA_PER_AREA)}
function javaMainArea(number){return number>10000?Math.floor((number-10001)/9000):number>1000?Math.floor((number-1001)/900):Math.floor((number-101)/90)}
function javaRouteRefs(number,main){
  const areaIndex=main?javaMainArea(number):javaMegaArea(number),pool=JAVA_ROUTE_POOLS[areaIndex];
  const selected=[],seen=new Set();let state=main?((number+1847)*1597334677)>>>0:(number*2654435761)>>>0;
  while(selected.length<10){state^=state<<13;state^=state>>>17;state^=state<<5;const idx=(state>>>0)%pool.length;if(seen.has(idx))continue;seen.add(idx);selected.push(pool[idx])}
  return selected;
}
function javaRouteHasFocus(number,main,focus){
  const areaIndex=main?javaMainArea(number):javaMegaArea(number);
  return focus.groups.includes(areaIndex)&&javaRouteRefs(number,main).some(ref=>focus.topics?(focus.topics[ref.id]||[]).includes(ref.index):focus.ids.includes(ref.id));
}
function javaMegaRoute(number){
  if(!Number.isInteger(number)||number<JAVA_MEGA_FIRST||number>JAVA_MEGA_LAST)return null;
  const areaIndex=javaMegaArea(number),area=JAVA_MEGA_AREAS[areaIndex],serial=number>20100?2091+(number-20101)%8000:number>10100?1091+(number-10101)%1000:number-JAVA_MEGA_FIRST-areaIndex*JAVA_MEGA_PER_AREA+1;
  const selected=javaRouteRefs(number,false);
  const topics=selected.map(({id,index})=>[...JAVA_CORE_TRACKS.get(id).topics[index]]);
  const tr={id:`java-rota-${number}`,title:`${area.title} · percurso ${String(serial).padStart(3,'0')}`,enTitle:`${area.en} · route ${String(serial).padStart(3,'0')}`,icon:area.icon,color:area.color,group:area.title,practicePath:true,sourceRefs:selected,topics};
  return tr;
}
function javaMainRoute(number){
  if(!Number.isInteger(number)||number<101||number>JAVA_MAIN_LAST)return null;
  const areaIndex=javaMainArea(number),area=JAVA_MEGA_AREAS[areaIndex];
  const selected=javaRouteRefs(number,true);
  return {id:`java-principal-${number}`,title:`${area.title} · trilha ${String(number).padStart(4,'0')}`,enTitle:`${area.en} · track ${String(number).padStart(4,'0')}`,icon:area.icon,color:area.color,group:area.title,practicePath:true,catalogTier:'main',sourceRefs:selected,topics:selected.map(({id,index})=>[...JAVA_CORE_TRACKS.get(id).topics[index]])};
}
function findJavaTrack(id){
  if(JAVA_CORE_TRACKS.has(id))return JAVA_CORE_TRACKS.get(id);
  const tr=javaMainRoute(javaMainNumber(id))||javaMegaRoute(javaMegaNumber(id));if(!tr)return null;
  // Só registra traduções da trilha aberta; a listagem não ocupa memória extra.
  try {EN_TRACK_NAMES[tr.id]=tr.enTitle;EN_TOPIC_TEXT[tr.id]=tr.sourceRefs.map(({id,index})=>EN_TOPIC_TEXT[id][index])} catch {}
  return tr;
}
