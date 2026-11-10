'use strict';
// Questões autorais de Java. Cada simulado tem doze itens e correção comentada.
const JAVA_ARENA_EXAMS=[
  {id:'base',title:'Fundamentos em ação',subtitle:'Sintaxe, decisões, laços, arrays e métodos',minutes:12,questions:[
    ['Tipos','O que o programa imprime?',['3','3.5','4','Erro de compilação'],0,'Divisão entre dois int descarta a parte decimal.','System.out.println(7 / 2);'],
    ['Tipos','Qual declaração guarda um preço com casas decimais?',['int preco = 9.90;','double preco = 9.90;','char preco = 9.90;','boolean preco = 9.90;'],1,'double aceita números com parte decimal.'],
    ['Strings','Qual é a saída?',['J','a','v','4'],1,'Os índices de uma String começam em zero.','System.out.println("Java".charAt(1));'],
    ['Strings','Como comparar o conteúdo de duas Strings?',['a == b','a.equals(b)','a = b','a.compare(b) == true'],1,'equals compara os caracteres; == compara as referências dos objetos.'],
    ['Condições','O que aparece para idade 17?',['Maior','Menor','17','Nada'],1,'17 não satisfaz a condição idade >= 18.','int idade = 17;\nif (idade >= 18) System.out.println("Maior");\nelse System.out.println("Menor");'],
    ['Condições','Qual operador exige que as duas condições sejam verdadeiras?',['||','!','&&','=='],2,'&& representa o E lógico.'],
    ['Laços','Qual é a saída?',['0 1 2','1 2 3','0 1 2 3','1 2'],0,'O for começa em zero e termina antes de i chegar a 3.','for (int i = 0; i < 3; i++) System.out.print(i + " ");'],
    ['Laços','Qual palavra pula apenas a iteração atual do laço?',['break','continue','return','switch'],1,'continue passa para a próxima iteração; break encerra o laço.'],
    ['Arrays','Qual é o último elemento?',['2','4','8','Erro'],2,'Um array de três posições tem índices 0, 1 e 2.','int[] n = {2, 4, 8};\nSystem.out.println(n[n.length - 1]);'],
    ['Arrays','Como obter a quantidade de elementos de int[] valores?',['valores.size()','valores.length()','valores.length','valores.count'],2,'Arrays usam o atributo length, sem parênteses.'],
    ['Métodos','Qual retorno combina com este método?',['void','String','boolean','int'],3,'A expressão a + b produz int.','static int somar(int a, int b) { return a + b; }'],
    ['Métodos','Em qual caso há sobrecarga válida?',['Mesmo nome e parâmetros diferentes','Mesmo nome e só retorno diferente','Mesmo nome e mesmos parâmetros','Método sem nome'],0,'Sobrecarga distingue métodos pela lista de parâmetros, não apenas pelo retorno.']
  ]},
  {id:'projeto',title:'Java de projeto',subtitle:'POO, coleções, exceções e boas decisões',minutes:12,questions:[
    ['POO','Qual modificador protege um atributo de acesso direto fora da classe?',['public','private','static','final'],1,'private restringe o acesso à própria classe.'],
    ['POO','Qual método é chamado na criação com new Aluno()?',['main','construtor Aluno()','toString','finalize'],1,'O construtor inicializa o objeto quando new é usado.'],
    ['POO','Qual palavra estabelece herança entre classes?',['implements','extends','super','import'],1,'Uma classe herda de outra usando extends.'],
    ['POO','O que @Override ajuda a detectar?',['Erro ao sobrescrever assinatura inexistente','Variável sem inicialização','Import não usado','Laço infinito'],0,'A anotação pede ao compilador que confira se há um método herdado para sobrescrever.'],
    ['POO','Qual método roda?',['Animal.falar','Cachorro.falar','Ambos','Erro'],1,'O método sobrescrito do objeto real é chamado em tempo de execução.','Animal a = new Cachorro();\na.falar(); // Cachorro sobrescreve falar()'],
    ['Coleções','Qual estrutura guarda elementos em ordem e aceita repetidos?',['HashSet','ArrayList','HashMap','Optional'],1,'ArrayList mantém uma lista ordenada por posição e permite valores repetidos.'],
    ['Coleções','O que imprime?',['3','2','1','Erro'],1,'HashSet elimina a repetição de "A".','Set<String> s = new HashSet<>();\ns.add("A"); s.add("A"); s.add("B");\nSystem.out.println(s.size());'],
    ['Coleções','Como buscar o valor associado à chave "ana" em um Map?',['map.get("ana")','map[0]','map.value("ana")','map.find(0)'],0,'Map recupera por chave com get.'],
    ['Coleções','O que significa List<String>?',['Lista restrita a Strings','Lista com apenas um item','Lista de caracteres','Lista imutável'],0,'O parâmetro genérico limita o tipo de elemento esperado.'],
    ['Exceções','Qual bloco captura uma NumberFormatException de parseInt?',['finally','catch','switch','throws'],1,'catch trata a exceção lançada pelo código em try.'],
    ['Exceções','Quando o finally normalmente é executado?',['Só sem erro','Após try/catch, com ou sem exceção','Antes do try','Só se catch falhar'],1,'finally é usado para uma ação final mesmo após exceção, salvo interrupções anormais do processo.'],
    ['Exceções','Qual recurso fecha automaticamente um BufferedReader ao sair do bloco?',['try-with-resources','break','static','continue'],0,'try-with-resources fecha recursos AutoCloseable.']
  ]},
  {id:'avancado',title:'Java no mundo real',subtitle:'Streams, arquivos, Swing e concorrência',minutes:12,questions:[
    ['Streams','Qual operação seleciona apenas os números pares?',['map(n -> n % 2 == 0)','filter(n -> n % 2 == 0)','forEach(n -> n % 2 == 0)','sorted(n -> n % 2 == 0)'],1,'filter mantém os elementos que satisfazem um predicado.'],
    ['Streams','O que map(String::length) produz?',['Comprimentos das Strings','Uma String concatenada','Uma lista mutável automaticamente','Apenas Strings vazias'],0,'map transforma cada elemento, aqui em seu comprimento.'],
    ['Streams','Por que usar collect ou toList() após um stream?',['Para materializar o resultado','Para criar uma thread','Para abrir um arquivo','Para tratar IOException'],0,'Um stream descreve uma sequência de operações; a operação terminal produz o resultado.'],
    ['Optional','O que orElse("visitante") devolve quando o Optional está vazio?',['null','visitante','Optional.empty','Exceção'],1,'orElse fornece um valor padrão se não houver valor.'],
    ['Arquivos','Qual classe moderna representa um caminho de arquivo?',['Path','Scanner','JPanel','Thread'],0,'Path representa o caminho; Files oferece operações de leitura e escrita.'],
    ['Arquivos','Que exceção verificada pode ocorrer ao ler um arquivo com Files.readString?',['IOException','ArithmeticException','NullPointerException','NumberFormatException'],0,'Operações de entrada e saída podem lançar IOException.'],
    ['Swing','Onde mudanças na interface Swing devem ocorrer?',['Na Event Dispatch Thread','Em qualquer thread sem cuidados','Dentro do garbage collector','No construtor de Thread'],0,'A Event Dispatch Thread coordena os eventos e atualizações da interface.'],
    ['Swing','O que um ActionListener normalmente trata?',['Clique/ação de botão','Leitura de arquivo','Memória cheia','Herança'],0,'ActionListener reage a eventos de ação, como clicar em um JButton.'],
    ['Swing','Para que serve pack() em um JFrame?',['Ajustar a janela ao tamanho preferido dos componentes','Fechar a janela','Criar uma thread','Salvar o layout em arquivo'],0,'pack calcula o tamanho da janela com base nos componentes.'],
    ['Threads','Qual método inicia uma nova thread?',['run()','start()','join()','sleep()'],1,'start agenda a execução em outra thread; chamar run diretamente é uma chamada comum de método.'],
    ['Threads','O que join() faz para a thread chamadora?',['Espera a outra thread terminar','Interrompe a JVM','Duplica a thread','Libera o monitor'],0,'join bloqueia a thread atual até a outra terminar, ou ocorrer uma interrupção.'],
    ['Threads','O que synchronized ajuda a proteger?',['Acesso concorrente a estado compartilhado','Sintaxe do pacote','A criação de arrays','A aparência de uma janela'],0,'A exclusão mútua evita interferência entre threads no trecho protegido.']
  ]}
];

// Caça a bugs: identificar o problema e a correção, não apenas decorar saída.
const JAVA_ARENA_DEBUG=[
  ['Sintaxe','Por que não compila?','int total = 10\nSystem.out.println(total);',['Falta ; depois de 10','int deveria ser double','println exige return','total precisa ser static'],0,'Declarações Java terminam com ponto e vírgula.'],
  ['Tipos','Qual correção evita a perda da parte decimal?','double media = 5 / 2;',['double media = 5.0 / 2;','int media = 5 / 2;','double media = (int)(5 / 2);','double media = 5 % 2;'],0,'A divisão ocorre antes da atribuição: ao usar 5.0, ela já será decimal.'],
  ['Strings','Por que esta comparação pode falhar?','String a = new String("oi");\nString b = new String("oi");\nSystem.out.println(a == b);',['Use a.equals(b)','Use a = b','Use a + b','Troque String por char'],0,'== compara referências; equals compara o conteúdo das Strings.'],
  ['Condições','Como corrigir a condição que sempre aceita a idade?','if (idade >= 18 || idade <= 60) { ... }',['Troque || por &&','Troque if por for','Use idade = 18','Retire as duas comparações'],0,'Para estar entre 18 e 60, as duas condições precisam ser verdadeiras.'],
  ['Laços','Como impedir o laço infinito?','int i = 0;\nwhile (i < 5) { System.out.println(i); }',['Inclua i++ no corpo','Troque while por if','Comece em 5','Use i--'],0,'Sem atualizar i, a condição i < 5 permanece verdadeira.'],
  ['Arrays','Como evitar ArrayIndexOutOfBoundsException?','int[] a = {4, 8, 12};\nSystem.out.println(a[3]);',['Use a[2] para o último item','Use a[4]','Troque int por double','Use a.length como índice'],0,'Três elementos têm índices 0, 1 e 2.'],
  ['Métodos','O que falta para o método compilar?','static int dobro(int n) {\n  int resultado = n * 2;\n}',['return resultado;','break;','new resultado;','System.out.println(resultado);'],0,'Um método que declara retorno int precisa devolver um valor.'],
  ['Escopo','Por que a variável não é encontrada?','if (ativo) { int pontos = 10; }\nSystem.out.println(pontos);',['Declare pontos antes do if','Use pontos como String','Adicione final','Chame pontos()'],0,'Uma variável criada dentro das chaves do if fica restrita àquele bloco.'],
  ['POO','Por que o atributo privado não pode ser acessado?','class Conta { private int saldo; }\n// Em outra classe: conta.saldo = 10;',['Crie método público de acesso/alteração com regras','Retire a classe Conta','Use saldo() sem método','Troque int por Integer'],0,'Encapsulamento protege o estado; forneça métodos controlados.'],
  ['Herança','Qual erro aparece nesta sobrescrita?','class Animal { void falar() {} }\nclass Gato extends Animal {\n  @Override int falar() { return 1; }\n}',['O retorno int é incompatível com void','Falta new','extends não existe','@Override só funciona com static'],0,'A assinatura do método sobrescrito precisa ter retorno compatível.'],
  ['Coleções','Por que add não funciona?','List<String> nomes = new ArrayList<>();\nnomes.add(10);',['Adicione uma String ou mude o tipo da lista','Use nomes.push(10)','Tire os parênteses do add','A lista está cheia'],0,'List<String> aceita Strings, e 10 é int.'],
  ['Map','Por que a soma pode lançar NullPointerException?','int total = mapa.get("ana") + 1;',['Use getOrDefault("ana", 0)','Use mapa[0]','Mude total para char','Use remove("ana")'],0,'get pode retornar null quando a chave não existe; getOrDefault fornece zero.'],
  ['Exceções','Qual exceção é esperada para a entrada "abc"?','int n = Integer.parseInt("abc");',['NumberFormatException','IOException','InterruptedException','ArrayIndexOutOfBoundsException'],0,'O texto não representa um inteiro válido.'],
  ['Recursos','O que ajuda a fechar o leitor mesmo se a leitura falhar?','BufferedReader r = Files.newBufferedReader(path);\nString s = r.readLine();',['try-with-resources','continue','@Override','break'],0,'try-with-resources fecha o BufferedReader ao sair do bloco.'],
  ['Streams','Por que esta linha não imprime os pares?','numeros.stream().filter(n -> n % 2 == 0);',['Adicione operação terminal, como forEach(System.out::println)','Troque filter por new','Use return no final do arquivo','Remova stream()'],0,'Sem uma operação terminal, o pipeline não é consumido.'],
  ['Optional','Por que get() é perigoso aqui?','Optional<String> nome = Optional.empty();\nSystem.out.println(nome.get());',['Use orElse ou verifique isPresent','Use nome[0]','Troque String por char','Adicione static'],0,'get em um Optional vazio lança NoSuchElementException.'],
  ['Swing','Como criar a janela na thread apropriada?','new MinhaJanela().setVisible(true);',['SwingUtilities.invokeLater(() -> new MinhaJanela().setVisible(true));','Thread.sleep(1000)','System.out.println(new MinhaJanela())','Use final no JFrame'],0,'invokeLater agenda a criação da interface na Event Dispatch Thread.'],
  ['Threads','Por que não houve uma nova thread?','Thread t = new Thread(() -> tarefa());\nt.run();',['Chame t.start()','Chame t.join() antes','Use t = null','Chame Thread.sleep(0)'],0,'run executa na thread atual; start cria uma execução concorrente.']
];
