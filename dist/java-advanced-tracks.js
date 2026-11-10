'use strict';
// Dez trilhas inéditas com exemplos curtos. Recursos de linguagem marcados JDK 17+.
const JAVA_ADVANCED=[
  ['Java moderno (JDK 17+)','Modern Java (JDK 17+)','spark','#8f82d2',[
    ['record básico','record cria um portador de dados imutável de superfície.','record Pessoa(String nome) {}','class Pessoa(String nome) {}','A sintaxe de cabeçalho de componentes pertence a record.'],
    ['acessor de record','O acessor de componente de record tem o próprio nome do componente.','pessoa.nome()','pessoa.getNome()','Um record gera nome(), não getNome() automaticamente.'],
    ['construtor compacto','O construtor compacto de record pode validar componentes.','record Id(int valor) { Id { if (valor < 0) throw new IllegalArgumentException(); } }','record Id(int valor) { Id() { } }','O construtor compacto não declara parâmetros novamente.'],
    ['equals em record','O equals gerado compara os componentes do record.','new Id(2).equals(new Id(2))','new Id(2) == new Id(2)','== compara as referências dos dois objetos.'],
    ['classe sealed','sealed restringe as subclasses diretas permitidas.','sealed interface Forma permits Circulo, Quadrado {}','sealed interface Forma extends Circulo, Quadrado {}','permits lista as implementações diretas autorizadas.'],
    ['subclasse final','Uma subclasse direta de sealed pode ser final.','final class Circulo implements Forma {}','class Circulo implements Forma {}','A subclasse direta deve declarar final, sealed ou non-sealed.'],
    ['instanceof com padrão','O padrão de instanceof cria variável após o teste de tipo.','if (obj instanceof String texto) System.out.println(texto.length());','if (obj instanceof String) System.out.println(texto.length());','Sem declarar texto, a variável não existe.'],
    ['switch como expressão','Um switch com seta pode produzir um valor.','int pontos = switch (nivel) { case 1 -> 10; default -> 0; };','int pontos = switch (nivel) { case 1: 10; default: 0; };','A expressão com setas usa -> e termina com ponto e vírgula.'],
    ['bloco com yield','yield devolve o valor de um bloco de switch expressão.','int x = switch (n) { default -> { yield n * 2; } };','int x = switch (n) { default -> { return n * 2; } };','yield devolve o valor do braço da expressão switch.'],
    ['text block','Três aspas duplas delimitam um text block multilinha.','String msg = """\nOlá\nJava\n""";','String msg = ""\nOlá\nJava\n"";','Text blocks usam três aspas duplas na abertura e no fecho.']
  ]],
  ['Datas e tempo','Date and time','book','#659fc0',[
    ['LocalDate.now','LocalDate representa data sem fuso nem horário.','LocalDate hoje = LocalDate.now();','LocalDate hoje = new LocalDate();','LocalDate é criada por fábricas como now ou of.'],
    ['LocalDate.of','LocalDate.of recebe ano, mês e dia nessa ordem.','LocalDate data = LocalDate.of(2026, 10, 1);','LocalDate data = LocalDate.of(1, 10, 2026);','A primeira posição é o ano.'],
    ['plusDays','Datas java.time são imutáveis: guarde o resultado de plusDays.','data = data.plusDays(1);','data.plusDays(1);','Sem guardar ou usar o retorno, data original não muda.'],
    ['Period.between','Period descreve anos, meses e dias entre datas.','Period idade = Period.between(nascimento, hoje);','Period idade = Period.between(hoje, nascimento);','A ordem das datas define o sinal do período.'],
    ['Duration.between','Duration mede um intervalo entre instantes.','Duration d = Duration.between(inicio, fim);','Duration d = Duration.of(inicio, fim);','A fábrica para calcular dois instantes é between.'],
    ['LocalTime.of','LocalTime guarda horário sem data ou fuso.','LocalTime aula = LocalTime.of(8, 30);','LocalTime aula = new LocalTime(8, 30);','Use a fábrica estática of.'],
    ['Instant.now','Instant aponta para um instante na linha do tempo.','Instant agora = Instant.now();','Instant agora = LocalDate.now();','LocalDate não pode ser atribuído a Instant.'],
    ['ZoneId','ZoneId identifica um fuso nomeado.','ZoneId zona = ZoneId.of("America/Sao_Paulo");','ZoneId zona = ZoneId.of("Sao Paulo");','Use um identificador reconhecido de fuso.'],
    ['ZonedDateTime','atZone associa fuso a uma data e hora locais.','ZonedDateTime z = local.atZone(zona);','ZonedDateTime z = local.atZone("Brasil");','atZone pede um ZoneId.'],
    ['DateTimeFormatter','Formatter formata uma data em padrão explícito.','String s = data.format(DateTimeFormatter.ofPattern("dd/MM/uuuu"));','String s = data.format("dd/MM/uuuu");','format recebe DateTimeFormatter, não String diretamente.']
  ]],
  ['Dinheiro e precisão','Money and precision','grid','#d5a46e',[
    ['BigDecimal de texto','Construir BigDecimal por String evita aproximação de literal double.','BigDecimal preco = new BigDecimal("0.10");','BigDecimal preco = new BigDecimal(0.10);','O literal double pode representar uma aproximação binária.'],
    ['BigDecimal.add','BigDecimal é imutável: add devolve outro valor.','total = total.add(preco);','total.add(preco);','Sem guardar o retorno, total não é alterado.'],
    ['BigDecimal.subtract','subtract devolve a diferença.','BigDecimal troco = pago.subtract(preco);','BigDecimal troco = pago - preco;','Objetos BigDecimal não usam o operador menos aritmético.'],
    ['BigDecimal.multiply','multiply calcula o produto de valores decimais.','BigDecimal x = preco.multiply(quantidade);','BigDecimal x = preco * quantidade;','Use o método multiply para BigDecimal.'],
    ['divide com escala','Divisão não exata deve especificar arredondamento.','BigDecimal x = total.divide(partes, 2, RoundingMode.HALF_UP);','BigDecimal x = total.divide(partes);','Uma divisão periódica sem modo de arredondamento pode lançar ArithmeticException.'],
    ['compareTo','compareTo compara valor numérico mesmo quando escalas diferem.','boolean igual = a.compareTo(b) == 0;','boolean igual = a == b;','== testa identidade dos objetos.'],
    ['setScale','setScale escolhe número de casas e modo de arredondar.','valor = valor.setScale(2, RoundingMode.HALF_UP);','valor.setScale(2);','Se for necessário descartar dígitos, informe modo de arredondamento.'],
    ['valueOf','valueOf(long) cria BigDecimal a partir de inteiro.','BigDecimal v = BigDecimal.valueOf(25);','BigDecimal v = BigDecimal.of(25);','A fábrica se chama valueOf.'],
    ['ZERO','BigDecimal.ZERO é uma constante útil como ponto inicial.','BigDecimal soma = BigDecimal.ZERO;','BigDecimal soma = 0;','Um int não pode ser atribuído diretamente a BigDecimal.'],
    ['movePointRight','movePointRight desloca a vírgula decimal.','BigDecimal centavos = valor.movePointRight(2);','BigDecimal centavos = valor << 2;','O operador de deslocamento não se aplica a BigDecimal.']
  ]],
  ['Streams e coletores','Streams and collectors','layers','#5da99b',[
    ['filter','filter mantém itens que passam num predicado.','lista.stream().filter(x -> x > 0)','lista.stream().map(x -> x > 0)','map transforma cada elemento em outro valor.'],
    ['map','map transforma cada item da sequência.','nomes.stream().map(String::length)','nomes.stream().filter(String::length)','filter precisa de um predicado booleano.'],
    ['distinct','distinct remove elementos repetidos por igualdade.','lista.stream().distinct()','lista.stream().unique()','A operação de Stream se chama distinct.'],
    ['sorted','sorted ordena pelo comparador natural quando disponível.','lista.stream().sorted()','lista.stream().sort()','A operação intermediária de Stream se chama sorted.'],
    ['limit','limit restringe a quantidade máxima de elementos.','lista.stream().limit(3)','lista.stream().take(3)','A operação limit aceita uma contagem long.'],
    ['count','count é operação terminal que devolve long.','long n = lista.stream().count();','int n = lista.stream().count();','count retorna long, que não cabe implicitamente em int.'],
    ['anyMatch','anyMatch verifica se algum elemento atende ao predicado.','boolean tem = lista.stream().anyMatch(x -> x > 10);','boolean tem = lista.stream().anyMatch(x > 10);','O argumento deve ser um predicado, como uma lambda.'],
    ['reduce','reduce acumula elementos com um operador.','int soma = lista.stream().reduce(0, Integer::sum);','int soma = lista.stream().reduce(Integer::sum, 0);','A versão com identidade recebe o zero antes do acumulador.'],
    ['Collectors.groupingBy','groupingBy forma grupos segundo uma chave.','Map<Integer,List<String>> grupos = nomes.stream().collect(Collectors.groupingBy(String::length));','nomes.stream().groupBy(String::length);','O agrupamento é um coletor, não método groupBy de Stream.'],
    ['toList','Stream.toList materializa lista não modificável.','List<String> copia = nomes.stream().toList();','List<String> copia = nomes.stream().list();','A operação terminal se chama toList.']
  ]],
  ['Concorrência cuidadosa','Safe concurrency','route','#7998d5',[
    ['Thread.start','start inicia execução em outra thread.','new Thread(tarefa).start();','new Thread(tarefa).run();','run chamado diretamente roda na thread atual.'],
    ['Thread.join','join espera outra thread terminar.','trabalhadora.join();','trabalhadora.wait();','wait exige posse do monitor e não substitui join.'],
    ['ExecutorService','Um executor gerencia tarefas em um pool.','ExecutorService pool = Executors.newFixedThreadPool(2);','ExecutorService pool = new ExecutorService(2);','ExecutorService é interface; use uma fábrica de Executors.'],
    ['submit','submit devolve um Future para a tarefa.','Future<Integer> f = pool.submit(() -> 3);','Future<Integer> f = pool.run(() -> 3);','O método do executor para tarefa com resultado é submit.'],
    ['Future.get','get espera o resultado de uma tarefa.','Integer valor = futuro.get();','Integer valor = futuro.value();','Future oferece get para acessar o resultado.'],
    ['shutdown','shutdown solicita que o executor pare de aceitar tarefas.','pool.shutdown();','pool.stop();','O método de encerramento ordenado se chama shutdown.'],
    ['AtomicInteger','incrementAndGet atualiza contador atomicamente.','int n = contador.incrementAndGet();','int n = contador.get() + 1;','Somar depois de get não atualiza o AtomicInteger.'],
    ['synchronized','synchronized protege uma seção usando um monitor.','synchronized (lock) { saldo++; }','synchronized { saldo++; }','O bloco synchronized precisa indicar o objeto monitor.'],
    ['CompletableFuture.supplyAsync','supplyAsync agenda cálculo com resultado.','CompletableFuture<Integer> f = CompletableFuture.supplyAsync(() -> 42);','CompletableFuture<Integer> f = CompletableFuture.runAsync(() -> 42);','runAsync é para Runnable sem resultado.'],
    ['thenApply','thenApply transforma o valor concluído de um futuro.','f.thenApply(n -> n * 2)','f.thenApply(n * 2)','thenApply recebe uma função.']
  ]],
  ['Arquivos NIO','NIO files','file','#74b4ad',[
    ['Path.of','Path.of cria um caminho do sistema de arquivos.','Path arquivo = Path.of("dados.txt");','Path arquivo = new Path("dados.txt");','Path é interface, criada por fábrica.'],
    ['resolve','resolve junta um caminho relativo a outro.','Path alvo = pasta.resolve("dados.txt");','Path alvo = pasta + "dados.txt";','Use resolve, não concatenação de Path com String.'],
    ['Files.exists','exists testa se um caminho existe.','boolean ok = Files.exists(arquivo);','boolean ok = arquivo.exists();','O teste está em Files.'],
    ['Files.createDirectories','createDirectories cria pastas intermediárias.','Files.createDirectories(pasta);','Files.createDirectory(pasta.getParent().resolve("a/b"));','createDirectory não cria automaticamente intermediárias faltantes.'],
    ['Files.writeString','writeString grava texto e pode lançar IOException.','Files.writeString(arquivo, "Olá");','Files.writeString("dados.txt", "Olá");','O primeiro argumento precisa ser Path.'],
    ['Files.readString','readString carrega texto de um Path.','String s = Files.readString(arquivo);','String s = Files.read(arquivo);','Files.readString é o método para obter uma String.'],
    ['Files.lines','lines produz Stream de linhas e requer fechamento.','try (Stream<String> linhas = Files.lines(arquivo)) { linhas.forEach(System.out::println); }','Stream<String> linhas = Files.lines(arquivo);','Feche o Stream associado ao arquivo com try-with-resources.'],
    ['Files.copy','copy transfere conteúdo de origem para destino.','Files.copy(origem, destino);','Files.copy(destino, origem);','A ordem é fonte e depois alvo.'],
    ['Files.move','move transfere ou renomeia um caminho.','Files.move(origem, destino);','Files.rename(origem, destino);','A operação de Files se chama move.'],
    ['Files.deleteIfExists','deleteIfExists informa se algo foi removido.','boolean apagou = Files.deleteIfExists(arquivo);','boolean apagou = Files.delete(arquivo);','Files.delete não retorna boolean.']
  ]],
  ['HTTP com Java','HTTP with Java','terminal','#d99579',[
    ['HttpClient.newHttpClient','HttpClient fornece cliente HTTP da biblioteca padrão.','HttpClient cliente = HttpClient.newHttpClient();','HttpClient cliente = new HttpClient();','Use a fábrica, pois HttpClient é abstrata.'],
    ['URI.create','URI.create transforma texto válido em URI.','URI uri = URI.create("https://example.org");','URI uri = new URI.create("https://example.org");','create é método estático, não construtor.'],
    ['HttpRequest.newBuilder','O builder monta uma requisição HTTP.','HttpRequest req = HttpRequest.newBuilder(uri).GET().build();','HttpRequest req = HttpRequest.newBuilder(uri).GET();','O builder precisa de build para produzir a requisição.'],
    ['GET','GET indica leitura de um recurso.','HttpRequest req = HttpRequest.newBuilder(uri).GET().build();','HttpRequest req = HttpRequest.GET(uri);','A requisição é construída pelo builder.'],
    ['POST de texto','BodyPublishers.ofString prepara corpo de texto.','HttpRequest.BodyPublishers.ofString("oi")','HttpRequest.BodyPublishers.ofText("oi")','A fábrica de corpo textual se chama ofString.'],
    ['header','header inclui um cabeçalho na requisição.','HttpRequest.newBuilder(uri).header("Accept", "application/json")','HttpRequest.newBuilder(uri).addHeader("Accept", "application/json")','O método do builder para incluir cabeçalho é header.'],
    ['send','send realiza requisição síncrona e pode lançar exceções.','HttpResponse<String> r = cliente.send(req, HttpResponse.BodyHandlers.ofString());','HttpResponse<String> r = cliente.send(req);','send precisa de um BodyHandler para a resposta.'],
    ['statusCode','statusCode informa o código HTTP da resposta.','int status = resposta.statusCode();','int status = resposta.status();','O método de HttpResponse se chama statusCode.'],
    ['body','body obtém conteúdo processado pelo BodyHandler.','String texto = resposta.body();','String texto = resposta.getBody();','HttpResponse expõe body().'],
    ['sendAsync','sendAsync retorna CompletableFuture da resposta.','CompletableFuture<HttpResponse<String>> f = cliente.sendAsync(req, HttpResponse.BodyHandlers.ofString());','HttpResponse<String> r = cliente.sendAsync(req, HttpResponse.BodyHandlers.ofString());','sendAsync não retorna resposta diretamente.']
  ]],
  ['JDBC e transações','JDBC and transactions','layers','#7ca7c1',[
    ['Connection','Connection representa sessão com o banco.','Connection c = DriverManager.getConnection(url, usuario, senha);','Connection c = new Connection(url);','Connection é interface; use a fábrica do driver.'],
    ['PreparedStatement','PreparedStatement parametriza SQL com marcadores ?.','PreparedStatement ps = c.prepareStatement("SELECT nome FROM aluno WHERE id = ?");','PreparedStatement ps = c.prepareStatement("SELECT nome FROM aluno WHERE id = " + id);','Concatenar entrada no SQL ignora parametrização.'],
    ['setInt','setInt vincula um int ao parâmetro de índice 1.','ps.setInt(1, id);','ps.setInt(0, id);','Índices de parâmetro JDBC começam em 1.'],
    ['executeQuery','executeQuery devolve ResultSet para SELECT.','ResultSet rs = ps.executeQuery();','int rs = ps.executeQuery();','Uma consulta devolve ResultSet, não int.'],
    ['ResultSet.next','next avança até a próxima linha, se existir.','while (rs.next()) { System.out.println(rs.getString("nome")); }','while (rs.hasNext()) { System.out.println(rs.getString("nome")); }','ResultSet percorre linhas com next.'],
    ['executeUpdate','executeUpdate devolve quantidade de linhas afetadas.','int linhas = ps.executeUpdate();','ResultSet linhas = ps.executeUpdate();','Atualização devolve int.'],
    ['try-with-resources JDBC','Connection e PreparedStatement devem ser fechados.','try (Connection c = DriverManager.getConnection(url); PreparedStatement ps = c.prepareStatement(sql)) { ps.executeUpdate(); }','Connection c = DriverManager.getConnection(url); c = null;','Atribuir null não fecha uma conexão.'],
    ['setAutoCommit','setAutoCommit(false) inicia controle explícito de transação.','c.setAutoCommit(false);','c.autoCommit(false);','O método de Connection se chama setAutoCommit.'],
    ['commit','commit confirma as alterações de uma transação.','c.commit();','c.save();','A operação para confirmar transação JDBC é commit.'],
    ['rollback','rollback desfaz alterações não confirmadas.','c.rollback();','c.undo();','A operação de JDBC para desfazer a transação é rollback.']
  ]],
  ['JVM e diagnóstico','JVM and diagnostics','search','#b895c2',[
    ['javac','javac compila arquivo-fonte em bytecode.','javac Main.java','java Main.java','java executa classe; javac compila o fonte.'],
    ['java','java inicia uma classe compilada pelo nome.','java Main','java Main.class','Informe o nome da classe sem a extensão .class.'],
    ['classpath','-cp informa onde procurar classes e dependências.','java -cp out Main','java -classpath Main out','A opção deve vir antes da classe principal.'],
    ['jar','jar pode criar um arquivo compactado de classes.','jar --create --file app.jar -C out .','java --create --file app.jar -C out .','O comando para criar o arquivo é jar.'],
    ['javap','javap inspeciona informações de uma classe.','javap -c Main','javac -c Main','javap exibe bytecode; javac é compilador.'],
    ['javadoc','javadoc gera referência a partir de comentários.','javadoc -d docs Main.java','java -d docs Main.java','A ferramenta de documentação é javadoc.'],
    ['jshell','jshell abre ambiente interativo Java.','jshell','javac shell','O utilitário de exploração se chama jshell.'],
    ['jcmd','jcmd consulta diagnósticos de um processo Java.','jcmd -l','javac -l','jcmd lista processos Java disponíveis.'],
    ['assert','assert verifica uma condição quando asserções estão ativadas.','assert total >= 0 : "total negativo";','assert(total >= 0, "total negativo");','Java usa assert condição : mensagem, se ativado com -ea.'],
    ['-ea','-ea ativa asserções ao executar.','java -ea Main','javac -ea Main.java','A opção de execução é passada a java.']
  ]],
  ['Genéricos e contratos','Generics and contracts','boxes','#79a7a0',[
    ['List<String>','O parâmetro genérico restringe o tipo dos elementos.','List<String> nomes = new ArrayList<>();','List<String> nomes = new ArrayList<Integer>();','Os argumentos de tipo precisam ser compatíveis.'],
    ['método genérico','Um método pode declarar seu próprio tipo T.','static <T> T primeiro(List<T> xs) { return xs.get(0); }','static T primeiro(List<T> xs) { return xs.get(0); }','T precisa ser declarado antes do tipo de retorno.'],
    ['? extends Number','Wildcard extends permite leitura como Number.','double x = numeros.get(0).doubleValue();','numeros.add(1);','Em List<? extends Number>, não há tipo concreto seguro para adicionar.'],
    ['? super Integer','Wildcard super Integer permite adicionar Integer.','destino.add(1);','Integer n = destino.get(0);','A leitura de List<? super Integer> só garante Object.'],
    ['Comparator.comparing','comparing cria comparador por uma chave.','Comparator<Pessoa> c = Comparator.comparing(Pessoa::nome);','Comparator<Pessoa> c = Comparator.compare(Pessoa::nome);','A fábrica de comparadores se chama comparing.'],
    ['Comparable','compareTo define ordem natural do próprio tipo.','public int compareTo(Pessoa outra) { return nome.compareTo(outra.nome); }','public boolean compareTo(Pessoa outra) { return nome.equals(outra.nome); }','Comparable espera retorno int.'],
    ['Objects.requireNonNull','requireNonNull falha cedo para referência nula.','this.nome = Objects.requireNonNull(nome);','this.nome = Objects.requireNonNull();','Informe a referência a verificar.'],
    ['Objects.equals','Objects.equals compara valores aceitando null.','boolean iguais = Objects.equals(a, b);','boolean iguais = a.equals(b);','a.equals(b) pode falhar se a for null.'],
    ['Optional.ofNullable','ofNullable produz Optional vazio para null.','Optional<String> o = Optional.ofNullable(nome);','Optional<String> o = Optional.of(nome);','of lança NullPointerException se nome for null.'],
    ['Map.getOrDefault','getOrDefault devolve valor alternativo para chave ausente.','int total = mapa.getOrDefault("ana", 0);','int total = mapa.get("ana") + 1;','get pode devolver null para uma chave ausente.']
  ]]
];
JAVA_ADVANCED.forEach(([title,enTitle,icon,color,items],i)=>{
  const rows=items.map(([name,desc,good,bad,why])=>[
    name,desc,`Pense neste recurso como uma ferramenta específica da caixa Java: ${desc}`,good,bad,why,
    `aplique ${name} em um exemplo próprio`,name,desc,why
  ].join('~'));
  const before=NEW_TRACKS.length;
  addTrack(`aprofundamento-${i+1}`,title,enTitle,icon,color,rows);
  TRACKS.push(NEW_TRACKS[before]);
});
