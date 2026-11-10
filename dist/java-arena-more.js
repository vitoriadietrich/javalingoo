'use strict';
// Questões e diagnóstico têm origem nos exemplos comentados das trilhas inéditas.
// Mantemos os três simulados originais e seus resultados salvos.
const ARENA_ADVANCED_ITEMS=JAVA_ADVANCED.flatMap(([area,,,,items])=>items.map(item=>({area,item})));
const ARENA_EXAM_NAMES=[
  ['Java moderno I','Records e tipos selados'],
  ['Java moderno II','Padrões e controle de fluxo'],
  ['Tempo e calendário','Datas, duração e fusos'],
  ['Precisão decimal','Operações monetárias sem arredondamento implícito'],
  ['Streams I','Seleção, transformação e ordenação'],
  ['Streams II','Reduções, predicados e coletores'],
  ['Concorrência I','Threads e execução em pool'],
  ['Concorrência II','Estado compartilhado e tarefas futuras']
];
const arenaExtraQuestions=ARENA_ADVANCED_ITEMS.slice(0,64).map(({area,item},i)=>{
  const [name,desc,good,bad,why]=item;
  const other=ARENA_ADVANCED_ITEMS[(i+3)%ARENA_ADVANCED_ITEMS.length].item[2];
  const another=ARENA_ADVANCED_ITEMS[(i+11)%ARENA_ADVANCED_ITEMS.length].item[2];
  return [area,`Qual trecho demonstra ${name} corretamente?`,[good,bad,other,another],0,`${desc} ${why}`];
});
ARENA_EXAM_NAMES.forEach(([title,subtitle],i)=>JAVA_ARENA_EXAMS.push({
  id:`aprofundamento-${i+1}`,title,subtitle,minutes:10,
  questions:arenaExtraQuestions.slice(i*8,i*8+8)
}));
ARENA_ADVANCED_ITEMS.slice(0,82).forEach(({area,item},i)=>{
  const [name,desc,good,bad,why]=item;
  const other=ARENA_ADVANCED_ITEMS[(i+4)%ARENA_ADVANCED_ITEMS.length].item[2];
  const another=ARENA_ADVANCED_ITEMS[(i+17)%ARENA_ADVANCED_ITEMS.length].item[2];
  JAVA_ARENA_DEBUG.push([area,`Como corrigir o trecho de ${name}?`,bad,[good,other,another,'Remova a instrução sem substituí-la'],0,`${desc} ${why}`]);
});
