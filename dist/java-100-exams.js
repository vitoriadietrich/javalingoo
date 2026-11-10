'use strict';
// Os primeiros 200 simulados conservam conteúdo e IDs. Simulados posteriores
// são gerados sob demanda a partir do banco comentado, sem ocupar a memória
// do celular com 100 mil objetos de prova.
const JAVA_EXAM_BANK=[...JAVA_ARENA_EXAMS.flatMap(exam=>exam.questions)];
ARENA_ADVANCED_ITEMS.slice(64).forEach(({area,item},i)=>{
  const [name,desc,good,bad,why]=item;
  const other=ARENA_ADVANCED_ITEMS[(i+71)%ARENA_ADVANCED_ITEMS.length].item[2];
  const another=ARENA_ADVANCED_ITEMS[(i+87)%ARENA_ADVANCED_ITEMS.length].item[2];
  JAVA_EXAM_BANK.push([area,`Qual trecho aplica ${name}?`,[good,bad,other,another],0,`${desc} ${why}`]);
});
const JAVA_OLD_EXAM_BANK_LENGTH=JAVA_EXAM_BANK.length;
JAVA_EXAM_BANK.push(...JAVA_EXTRA_EXAM_ITEMS);
function javaExamIndices(seed,limit=JAVA_EXAM_BANK.length){
  const chosen=new Set();let state=(seed*2246822519)>>>0;
  while(chosen.size<10){state^=state<<13;state^=state>>>17;state^=state<<5;chosen.add((state>>>0)%limit)}
  return [...chosen];
}
for(let n=12;n<=200;n++){
  JAVA_ARENA_EXAMS.push({
    id:`maratona-${n}`,title:`Maratona Java · simulado ${String(n).padStart(3,'0')}`,
    subtitle:'Dez questões comentadas do banco de Java, em uma combinação diferente.',minutes:12,
    questions:javaExamIndices(n,n<=100?JAVA_OLD_EXAM_BANK_LENGTH:JAVA_EXAM_BANK.length).map(i=>JAVA_EXAM_BANK[i])
  });
}
const JAVA_EXAM_COUNT=100000;
function getJavaExam(index){
  if(!Number.isInteger(index)||index<0||index>=JAVA_EXAM_COUNT)return null;
  if(index<JAVA_ARENA_EXAMS.length)return JAVA_ARENA_EXAMS[index];
  const n=index+1;
  return {
    id:`maratona-${n}`,title:`Maratona Java · simulado ${String(n).padStart(6,'0')}`,
    subtitle:'Dez questões comentadas do banco de Java, em uma combinação diferente.',minutes:12,
    questions:javaExamIndices(n).map(i=>JAVA_EXAM_BANK[i])
  };
}
