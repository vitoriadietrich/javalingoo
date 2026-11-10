'use strict';
// Percursos integrados: combinam tópicos reais das trilhas-base em uma sequência
// nova. O aluno pode revisar a mesma habilidade em contextos de estudo diferentes.
const JAVA_ROUTE_GROUPS=[
  {name:'Fundamentos',icon:'terminal',color:'#5eafc3',routes:[
    ['Primeiro programa e ambiente','inicio','tutorial'],
    ['Sintaxe e valores','tutorial','dados'],
    ['Do texto ao console','inicio','texto'],
    ['Variáveis no programa','dados','tutorial'],
    ['Entrada e saída','inicio','erros'],
    ['Operações e tipos','dados','logica'],
    ['Palavras e números','texto','dados'],
    ['Primeiras funções','inicio','metodos'],
    ['Construindo instruções','tutorial','decisoes2'],
    ['Preparação do código','inicio','estudo2'],
    ['Base para projetos','dados','aplicacoes2']
  ]},
  {name:'Lógica',icon:'route',color:'#e39a47',routes:[
    ['Decisões e verificações','logica','decisoes2'],
    ['Repetição e contagem','lacos','decisoes2'],
    ['Condições e métodos','logica','metodos'],
    ['Arrays e processamento','lacos','texto'],
    ['Laços e coleções','lacos','listas2'],
    ['Texto com decisões','texto','logica'],
    ['Matrizes e lógica','lacos','decisoes2'],
    ['Cálculos e funções','logica','metodos2'],
    ['Índices e depuração','lacos','erros'],
    ['Predicados e filtros','logica','avancado2'],
    ['Algoritmos do cotidiano','lacos','mapas2']
  ]},
  {name:'Objetos',icon:'boxes',color:'#ab85bd',routes:[
    ['Objetos e estado','poo','classes2'],
    ['Métodos do objeto','metodos','classes2'],
    ['Construtores e regras','classes2','poo'],
    ['Herança em ação','poo','poo2'],
    ['Interfaces e contratos','poo2','poo'],
    ['Encapsulamento prático','classes2','aplicacoes2'],
    ['Tipos e polimorfismo','poo','avancado2'],
    ['Abstração com métodos','poo2','metodos2'],
    ['Classes e coleções','classes2','colecoes'],
    ['Pacotes e APIs','classes2','referencias2'],
    ['Objetos e teste','poo2','estudo2']
  ]},
  {name:'Dados',icon:'layers',color:'#56b3a2',routes:[
    ['Listas e ordenação','colecoes','listas2'],
    ['Conjuntos e identidade','listas2','poo'],
    ['Mapas por chave','colecoes','mapas2'],
    ['Iteração segura','colecoes','mapas2'],
    ['Busca e comparação','mapas2','logica'],
    ['Dados em matrizes','lacos','colecoes'],
    ['Estruturas genéricas','avancado2','listas2'],
    ['Coleções imutáveis','avancado2','colecoes'],
    ['Texto em listas','texto','listas2'],
    ['APIs de coleções','referencias2','colecoes'],
    ['Dados no projeto','mapas2','aplicacoes2']
  ]},
  {name:'APIs Java',icon:'book',color:'#7395df',routes:[
    ['Strings no cotidiano','texto','referencias2'],
    ['Matemática da biblioteca','texto','referencias2'],
    ['Datas e formatos','poo2','texto'],
    ['Expressões e validação','avancado2','aplicacoes2'],
    ['Classes auxiliares','avancado2','referencias2'],
    ['Streams e lambdas','avancado2','colecoes'],
    ['Optional e segurança','avancado2','erros'],
    ['Entrada com Scanner','erros','referencias2'],
    ['APIs para objetos','classes2','referencias2'],
    ['Biblioteca aplicada','avancado2','estudo2'],
    ['JDK de ponta a ponta','inicio','referencias2']
  ]},
  {name:'Robustez',icon:'search',color:'#d88279',routes:[
    ['Erros e diagnóstico','erros','arquivos2'],
    ['Leitura com recursos','erros','fluxos2'],
    ['Escrita em arquivos','arquivos2','fluxos2'],
    ['Caminhos e texto','arquivos2','texto'],
    ['Bytes e caracteres','fluxos2','dados'],
    ['Exceções e validação','erros','aplicacoes2'],
    ['Recursos sob controle','fluxos2','arquivos2'],
    ['Tratamento no projeto','erros','estudo2'],
    ['Depuração de laços','erros','lacos'],
    ['Concorrência inicial','avancado2','poo2'],
    ['Código confiável','arquivos2','aplicacoes2']
  ]},
  {name:'Aplicações',icon:'window',color:'#c08dab',routes:[
    ['Interface Swing inicial','swing','poo'],
    ['Eventos e métodos','swing','metodos'],
    ['Layout e componentes','swing','classes2'],
    ['Formulários e texto','swing','texto'],
    ['Interface e validação','swing','aplicacoes2'],
    ['Projeto com arquivos','estudo2','arquivos2'],
    ['Projeto com dados','aplicacoes2','mapas2'],
    ['Servidor e rotas','aplicacoes2','texto'],
    ['Projeto orientado a objetos','aplicacoes2','poo2'],
    ['Revisão para entrevistas','estudo2','avancado2'],
    ['Desafio Java completo','estudo2','aplicacoes2']
  ]}
];
const routeSource=new Map(TRACKS.map(t=>[t.id,t]));
JAVA_ROUTE_GROUPS.forEach((group,groupIndex)=>group.routes.forEach(([title,left,right],routeIndex)=>{
  if(routeIndex===10 || (groupIndex<3 && routeIndex===9))return;
  const a=routeSource.get(left),b=routeSource.get(right);
  if(!a||!b)throw Error(`Fonte não encontrada para ${title}`);
  const offset=(routeIndex*3+groupIndex*2)%10;
  const refs=[...Array.from({length:5},(_,i)=>({id:left,index:(offset+i)%10})),...Array.from({length:5},(_,i)=>({id:right,index:(offset+i+5)%10}))];
  const topics=refs.map(({id,index})=>[...routeSource.get(id).topics[index]]);
  const tr={id:`rota-${groupIndex+1}-${routeIndex+1}`,title,enTitle:`${group.name}: ${title}`,icon:group.icon,color:group.color,group:group.name,practicePath:true,sourceRefs:refs,topics};
  NEW_TRACKS.push(tr);TRACKS.push(tr);
}));
