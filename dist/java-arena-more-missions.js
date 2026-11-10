'use strict';
// Dezenove campanhas adicionais x quatro casos de teste: 76 missões de Java executável.
const ARENA_CASES=[
 {id:'somas',title:'Somas de dados',concept:'for e acumulador',story:'Some os números do lote sem fixar a resposta no código.',values:[[2,4,6],[3,7,11,1],[10,-4,9],[1,2,3,4,5]],
  starter:v=>`int[] valores = ${javaInts(v)};\n    int soma = 0;\n    // Percorra e acumule.`,task:'imprima Soma: seguida da soma',expected:v=>`Soma: ${v.reduce((a,b)=>a+b,0)}`,requires:/\bfor\s*\([\s\S]*\+=/,hint:'Use for-each e acrescente cada número à soma.'},
 {id:'maximos',title:'Maior valor',concept:'comparação em laço',story:'Encontre o maior valor de uma lista de medições.',values:[[3,9,4],[12,6,8,1],[-8,-2,-5],[7,7,2,6]],
  starter:v=>`int[] valores = ${javaInts(v)};\n    int maior = valores[0];\n    // Compare cada item.`,task:'imprima Maior: seguido do maior número',expected:v=>`Maior: ${Math.max(...v)}`,requires:/\bfor\s*\([\s\S]*\bif\s*\(/,hint:'Comece com valores[0] e atualize maior no if.'},
 {id:'minimos',title:'Menor valor',concept:'comparação em laço',story:'Encontre a menor temperatura de cada amostra.',values:[[8,5,12],[3,-1,9,2],[-4,-8,-2],[11,11,14]],
  starter:v=>`int[] valores = ${javaInts(v)};\n    int menor = valores[0];\n    // Compare cada item.`,task:'imprima Menor: seguido do menor número',expected:v=>`Menor: ${Math.min(...v)}`,requires:/\bfor\s*\([\s\S]*\bif\s*\(/,hint:'Atualize menor quando o item for menor do que o atual.'},
 {id:'pares',title:'Contagem de pares',concept:'módulo e laço',story:'Conte quantos valores pares chegaram.',values:[[1,2,3,4],[6,8,10,11],[3,5,7],[-4,0,1,2]],
  starter:v=>`int[] valores = ${javaInts(v)};\n    int pares = 0;\n    // Conte quando resto por 2 for zero.`,task:'imprima Pares: seguido da quantidade',expected:v=>`Pares: ${v.filter(n=>n%2===0).length}`,requires:/\bfor\s*\([\s\S]*%\s*2/,hint:'Dentro do for, teste n % 2 == 0 e incremente pares.'},
 {id:'acima',title:'Notas acima da meta',concept:'condição e contador',story:'Uma meta de 6 pontos separa resultados.',values:[[4,6,8],[7,9,2,5],[6,6,6],[1,8,10,9]],
  starter:v=>`int[] notas = ${javaInts(v)};\n    int aprovados = 0;\n    // Conte notas >= 6.`,task:'imprima Aprovados: seguido do total',expected:v=>`Aprovados: ${v.filter(n=>n>=6).length}`,requires:/\bfor\s*\([\s\S]*>=\s*6/,hint:'Faça aprovados++ quando nota >= 6.'},
 {id:'produtos',title:'Produto de fatores',concept:'multiplicação acumulada',story:'Multiplique todos os fatores do lote.',values:[[2,3,4],[1,5,6],[3,3,3],[4,0,8]],
  starter:v=>`int[] fatores = ${javaInts(v)};\n    int produto = 1;\n    // Multiplique em cada volta.`,task:'imprima Produto: seguido do resultado',expected:v=>`Produto: ${v.reduce((a,b)=>a*b,1)}`,requires:/\bfor\s*\([\s\S]*\*=|\bfor\s*\([\s\S]*produto\s*=\s*produto\s*\*/,hint:'Acumulador de produto começa em 1; use *= no laço.'},
 {id:'inverter',title:'Texto ao contrário',concept:'charAt e índices',story:'Leia a etiqueta de trás para frente.',values:['JAVA','Bito','codigo','ABCDE'],
  starter:v=>`String texto = ${JSON.stringify(v)};\n    String reverso = "";\n    // Percorra os índices em ordem inversa.`,task:'imprima Inverso: seguido do texto invertido',expected:v=>`Inverso: ${[...v].reverse().join('')}`,requires:/\bfor\s*\([\s\S]*charAt\s*\(/,hint:'Comece em texto.length() - 1 e use charAt(i).'},
 {id:'vogais',title:'Vogais no texto',concept:'String e laço',story:'Conte vogais ignorando maiúsculas.',values:['JAVA','Educacao','Bito','programar'],
  starter:v=>`String texto = ${JSON.stringify(v)};\n    int vogais = 0;\n    // Inspecione cada caractere.`,task:'imprima Vogais: seguido da contagem (a, e, i, o, u)',expected:v=>`Vogais: ${[...v.toLowerCase()].filter(c=>'aeiou'.includes(c)).length}`,requires:/\bfor\s*\([\s\S]*charAt\s*\(/,hint:'Converta para minúsculas e confira se "aeiou" contém o caractere.'},
 {id:'palindromos',title:'Palavras espelhadas',concept:'comparar posições',story:'Confira se a palavra se lê igual nos dois sentidos.',values:['arara','java','ovo','radar'],
  starter:v=>`String palavra = ${JSON.stringify(v)};\n    boolean igual = true;\n    // Compare a primeira e a última letra, e assim por diante.`,task:'imprima Palindromo: seguido de true ou false',expected:v=>`Palindromo: ${v===[...v].reverse().join('')}`,requires:/\bfor\s*\([\s\S]*charAt\s*\(/,hint:'Compare charAt(i) com charAt(length - 1 - i).'},
 {id:'fatoriais',title:'Fatorial passo a passo',concept:'laço e multiplicação',story:'Calcule o fatorial de um número não negativo.',values:[3,4,5,6],
  starter:v=>`int n = ${v};\n    int fatorial = 1;\n    // Multiplique 1 até n.`,task:'imprima Fatorial: seguido de n!',expected:v=>`Fatorial: ${Array.from({length:v},(_,i)=>i+1).reduce((a,b)=>a*b,1)}`,requires:/\bfor\s*\([\s\S]*\*/,hint:'Comece em 1; atualize fatorial *= i até n.'},
 {id:'fibonacci',title:'Sequência de Fibonacci',concept:'dois acumuladores',story:'A sequência começa em 0 e 1; imprima o termo na posição n (posição 0 é 0).',values:[5,6,7,8],
  starter:v=>`int n = ${v};\n    int a = 0, b = 1;\n    // Atualize a e b n vezes.`,task:'imprima Fibonacci: seguido do termo n',expected:v=>{let a=0,b=1;for(let i=0;i<v;i++)[a,b]=[b,a+b];return `Fibonacci: ${a}`},requires:/\bfor\s*\([\s\S]*\b(a|b)\s*=/,hint:'Guarde a soma em uma variável temporária antes de trocar a e b.'},
 {id:'primos',title:'Números primos',concept:'divisores e resto',story:'Decida se n é primo: maior que 1 e divisível apenas por 1 e por ele mesmo.',values:[7,9,17,21],
  starter:v=>`int n = ${v};\n    boolean primo = n > 1;\n    // Procure divisores de 2 até n-1.`,task:'imprima Primo: seguido de true ou false',expected:v=>`Primo: ${v>1&&Array.from({length:v-2},(_,i)=>i+2).every(d=>v%d!==0)}`,requires:/\bfor\s*\([\s\S]*%/,hint:'Se n % divisor == 0, marque primo como false.'},
 {id:'mdc',title:'Máximo divisor comum',concept:'algoritmo de Euclides',story:'Encontre o maior divisor comum de dois inteiros positivos.',values:[[12,18],[24,36],[21,14],[35,64]],
  starter:v=>`int a = ${v[0]}, b = ${v[1]};\n    // Repita a troca usando o resto enquanto b != 0.`,task:'imprima MDC: seguido do máximo divisor comum',expected:v=>{let [a,b]=v;while(b)[a,b]=[b,a%b];return `MDC: ${a}`},requires:/\bwhile\s*\([\s\S]*%/,hint:'Em cada passo: resto = a % b; a = b; b = resto.'},
 {id:'ordenar',title:'Ordenação manual',concept:'comparações em laços',story:'Ordene números sem usar Collections.sort.',values:[[3,1,2],[7,4,6,5],[0,-2,4],[9,9,1]],
  starter:v=>`int[] valores = ${javaInts(v)};\n    // Compare pares e troque fora de ordem.`,task:'imprima Ordenado: seguido dos números separados por vírgula e espaço',expected:v=>`Ordenado: ${[...v].sort((a,b)=>a-b).join(', ')}`,requires:/\bfor\s*\([\s\S]*\bfor\s*\([\s\S]*\bif\s*\(/,hint:'Use dois laços, compare valores[i] e valores[j] e troque.'},
 {id:'unicos',title:'Valores sem repetição',concept:'HashSet',story:'Conte os números distintos do lote.',values:[[2,2,3],[1,1,1,4],[5,4,5,4,3],[0,-1,0,2]],
  starter:v=>`int[] valores = ${javaInts(v)};\n    // Adicione em um Set<Integer>.`,task:'imprima Distintos: seguido da quantidade',expected:v=>`Distintos: ${new Set(v).size}`,requires:/\b(HashSet|Set)\s*<\s*Integer\s*>[\s\S]*\.add\s*\(/,hint:'Crie new HashSet<>() e use add no laço.'},
 {id:'frequencia',title:'Contagem por chave',concept:'HashMap',story:'Conte quantas vezes aparece um número específico.',values:[[[2,1,2,3],2],[[4,4,5],4],[[1,2,3],7],[[0,0,0,1],0]],
  starter:v=>`int[] valores = ${javaInts(v[0])};\n    int alvo = ${v[1]};\n    // Monte um Map<Integer,Integer> com as frequências.`,task:'imprima Frequencia: seguida da contagem do alvo',expected:v=>`Frequencia: ${v[0].filter(n=>n===v[1]).length}`,requires:/\b(HashMap|Map)\s*<\s*Integer\s*,\s*Integer\s*>[\s\S]*\.put\s*\(/,hint:'Some com getOrDefault(valor, 0) + 1 antes de consultar o alvo.'},
 {id:'stream',title:'Somar pares com Stream',concept:'filter, mapToInt e sum',story:'Use Stream para filtrar e somar números pares.',values:[[1,2,3,4],[6,7,8],[1,3,5],[-2,0,7,4]],
  starter:v=>`int[] valores = ${javaInts(v)};\n    // Use Arrays.stream e uma operação terminal.`,task:'imprima Soma dos pares: seguida da soma',expected:v=>`Soma dos pares: ${v.filter(n=>n%2===0).reduce((a,b)=>a+b,0)}`,requires:/\bArrays\.stream\s*\([\s\S]*\.filter\s*\([\s\S]*\.sum\s*\(/,hint:'Arrays.stream(valores).filter(n -> n % 2 == 0).sum().'},
 {id:'decimais',title:'Dinheiro com BigDecimal',concept:'BigDecimal sem double',story:'Some preços escritos como texto para manter o valor decimal.',values:[['0.10','0.20'],['1.25','2.30'],['9.90','0.10'],['3.05','4.15']],
  starter:v=>`String a = ${JSON.stringify(v[0])}, b = ${JSON.stringify(v[1])};\n    // Use BigDecimal(String) e add.`,task:'imprima Total: seguido da soma com duas casas',expected:v=>`Total: ${((Math.round(Number(v[0])*100)+Math.round(Number(v[1])*100))/100).toFixed(2)}`,requires:/\bBigDecimal\s*\([\s\S]*\.add\s*\(/,hint:'new BigDecimal(a).add(new BigDecimal(b)).toPlainString().'},
 {id:'datas',title:'Datas imutáveis',concept:'LocalDate.plusDays',story:'Avance a data inicial por um número de dias.',values:[['2026-01-01',1],['2026-02-27',2],['2024-02-28',1],['2026-12-30',3]],
  starter:v=>`String inicio = ${JSON.stringify(v[0])};\n    int dias = ${v[1]};\n    // Faça parse com LocalDate e some dias.`,task:'imprima Data: seguida da data ISO calculada',expected:v=>{let d=new Date(v[0]+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+v[1]);return `Data: ${d.toISOString().slice(0,10)}`},requires:/\bLocalDate\.parse\s*\([\s\S]*\.plusDays\s*\(/,hint:'LocalDate.parse(inicio).plusDays(dias).toString().'}
];
function javaInts(v){return `new int[]{${v.join(', ')}}`}
const ARENA_ROMANS=['I','II','III','IV'];
ARENA_CASES.forEach((campaign,i)=>MISSIONS.push({
  id:`arena-${campaign.id}`,title:campaign.title,en:campaign.title,
  summary:`Quatro situações para praticar ${campaign.concept}.`,summaryEn:`Four exercises: ${campaign.concept}.`,
  icon:['code','grid','layers','route','terminal'][i%5],color:['#e39a47','#65b9b3','#8796cf','#d99579'][i%4],
  steps:campaign.values.map((value,j)=>arenaStep(
    `${campaign.title} ${ARENA_ROMANS[j]}`,
    campaign.story,
    `Com os dados iniciais do editor, ${campaign.task}. Escreva a lógica em Java; não fixe a resposta no print.`,
    `import java.util.*;\nimport java.math.*;\nimport java.time.*;\npublic class Main {\n  public static void main(String[] args) {\n    ${campaign.starter(value)}\n    // Imprima o resultado pedido.\n  }\n}`,
    campaign.expected(value),campaign.requires,
    [campaign.hint,'Execute o programa e confira a saída esperada.','Mude os dados depois de concluir para verificar sua lógica.'],
    'Divida o problema em entrada, processamento e saída.'
  ))
}));
