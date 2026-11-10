'use strict';
// Glossário didático autoral + índice de símbolos públicos da API Java 17.
const JAVA_CONCEPTS=`algoritmo|Lógica|Passos finitos para transformar dados em um resultado.|int soma = a + b;
variável|Fundamentos|Nome que referencia um valor durante a execução.|int idade = 18;
constante|Fundamentos|Valor que não pode ser reatribuído depois da inicialização.|final int LIMITE = 10;
int|Tipos|Número inteiro de 32 bits com sinal.|int pontos = 42;
long|Tipos|Número inteiro de 64 bits com sinal.|long habitantes = 8000000000L;
double|Tipos|Número de ponto flutuante com aproximação binária.|double taxa = 0.15;
boolean|Tipos|Valor lógico true ou false.|boolean ativo = true;
char|Tipos|Uma unidade UTF-16 escrita entre aspas simples.|char letra = 'A';
String|Texto|Classe imutável que representa texto.|String nome = "Ana";
var|Tipos|Inferência do tipo de uma variável local, mantendo tipagem estática.|var nome = "Ana";
casting|Tipos|Conversão explícita de um tipo para outro.|int inteiro = (int) 3.9;
autoboxing|Tipos|Conversão automática de primitivo para wrapper.|Integer caixa = 7;
operador %|Operadores|Obtém o resto de uma divisão inteira.|int resto = 17 % 5;
operador &&|Operadores|E lógico com avaliação curta.|if (idade >= 18 && ativo) {}
operador OU (||)|Operadores|OU lógico com avaliação curta.|if (admin || autor) {}
if/else|Decisões|Escolhe qual bloco executar a partir de uma condição.|if (nota >= 6) passou(); else revisou();
switch|Decisões|Seleciona uma alternativa por valor; pode ser expressão.|int pontos = switch (nivel) { case 1 -> 10; default -> 0; };
operador ternário|Decisões|Expressão que escolhe entre dois valores.|String r = ok ? "sim" : "não";
for|Laços|Repete um bloco com inicialização, condição e avanço.|for (int i=0; i<3; i++) {}
while|Laços|Repete enquanto uma condição for verdadeira.|while (fila.temProximo()) {}
do/while|Laços|Executa o bloco pelo menos uma vez antes do teste.|do { x++; } while (x < 3);
for-each|Laços|Percorre elementos de um array ou Iterable.|for (int n : numeros) {}
break|Laços|Encerra o laço ou switch mais próximo.|if (achou) break;
continue|Laços|Pula para a próxima iteração do laço.|if (n < 0) continue;
array|Estruturas|Sequência de tamanho fixo de valores do mesmo tipo.|int[] notas = {7, 8, 9};
índice|Estruturas|Posição que começa em zero para acessar um array ou lista.|int primeira = notas[0];
matriz|Estruturas|Array com mais de uma dimensão, útil para tabelas.|int[][] grade = {{1,2},{3,4}};
busca linear|Algoritmos|Percorre elementos até localizar um valor.|for (int x : dados) if (x == alvo) break;
busca binária|Algoritmos|Descarta metade de uma sequência ordenada a cada passo.|Arrays.binarySearch(ordenados, alvo);
ordenação|Algoritmos|Organiza elementos segundo uma comparação.|Arrays.sort(valores);
complexidade O(n)|Algoritmos|O trabalho cresce aproximadamente junto ao tamanho da entrada.|for (int x : dados) processar(x);
complexidade O(log n)|Algoritmos|O trabalho cresce lentamente ao dividir a busca repetidamente.|Arrays.binarySearch(ordenados, alvo);
método|Métodos|Bloco nomeado que recebe parâmetros e pode retornar um valor.|static int dobro(int n) { return n * 2; }
parâmetro|Métodos|Variável declarada na assinatura do método.|int dobro(int numero) { return numero * 2; }
argumento|Métodos|Valor passado na chamada de um método.|dobro(7);
return|Métodos|Termina a chamada do método e devolve um valor quando previsto.|return total;
void|Métodos|Indica que o método não devolve um valor.|void avisar() { System.out.println("Oi"); }
sobrecarga|Métodos|Métodos com mesmo nome e listas de parâmetros diferentes.|int somar(int a,int b); double somar(double a,double b);
recursão|Métodos|Método que chama a si mesmo até atingir um caso base.|int f(int n) { return n <= 1 ? 1 : n * f(n-1); }
varargs|Métodos|Parâmetro que aceita quantidade variável de argumentos.|static int soma(int... valores) { return 0; }
passagem por valor|Métodos|Java copia o valor passado; para objetos, copia a referência.|void mudar(int x) { x = 9; }
escopo|Métodos|Região do código em que um nome pode ser acessado.|{ int local = 1; }
classe|Objetos|Molde que reúne estado e comportamento.|class Conta { private int saldo; }
objeto|Objetos|Instância de uma classe com identidade e estado.|Conta conta = new Conta();
construtor|Objetos|Rotina chamada ao criar um objeto, para iniciar seu estado.|Conta(int saldo) { this.saldo = saldo; }
this|Objetos|Referência à instância atual dentro de uma classe.|this.nome = nome;
encapsulamento|Objetos|Protege o estado interno e expõe operações controladas.|private int saldo;
imutabilidade|Objetos|Estado que não muda depois de criado.|record Ponto(int x,int y) {}
herança|Objetos|Classe filha estende uma classe base.|class Gato extends Animal {}
polimorfismo|Objetos|Uma chamada pode ter comportamentos diferentes conforme a instância.|Animal a = new Gato(); a.falar();
sobrescrita|Objetos|Subclasse redefine um método herdado com mesma assinatura.|@Override public String toString() { return nome; }
interface|Objetos|Contrato de métodos que classes podem implementar.|interface Salvavel { void salvar(); }
classe abstrata|Objetos|Base não instanciável que pode deixar métodos para subclasses.|abstract class Forma { abstract int area(); }
composição|Objetos|Um objeto contém e coordena outros objetos.|class Pedido { private List<Item> itens; }
record|Objetos|Forma concisa para portadores de dados imutáveis.|record Pessoa(String nome) {}
sealed class|Objetos|Restringe quais classes podem estender uma hierarquia.|sealed interface Pagamento permits Pix, Cartao {}
enum|Objetos|Conjunto tipado de valores constantes.|enum Status { NOVO, FEITO }
package|Organização|Agrupa classes em um espaço de nomes.|package br.edu.curso;
import|Organização|Permite usar um tipo de outro pacote pelo nome simples.|import java.util.List;
Javadoc|Organização|Comentário de documentação para tipos e métodos.|/** Calcula a soma. */
generics|Coleções|Parâmetros de tipo que dão segurança à API.|List<String> nomes = new ArrayList<>();
ArrayList|Coleções|Lista redimensionável com acesso por índice.|List<String> nomes = new ArrayList<>();
HashSet|Coleções|Conjunto sem duplicatas, sem garantir ordem de iteração.|Set<Integer> ids = new HashSet<>();
LinkedHashSet|Coleções|Conjunto sem duplicatas que preserva ordem de inserção.|Set<String> nomes = new LinkedHashSet<>();
HashMap|Coleções|Associa chaves a valores para consulta por chave.|Map<String,Integer> notas = new HashMap<>();
Stream|Coleções|Pipeline para transformar, filtrar e reduzir dados.|lista.stream().filter(x -> x > 0).count();
lambda|Coleções|Expressão curta para implementar uma interface funcional.|x -> x * 2
Optional|Coleções|Contêiner que explicita a possibilidade de ausência.|Optional<String> valor = Optional.empty();
exceção|Erros|Objeto que representa falha ou situação anormal.|throw new IllegalArgumentException("inválido");
try/catch|Erros|Executa código e trata exceções capturadas.|try { ler(); } catch (IOException e) { avisar(); }
finally|Erros|Bloco executado após try/catch, mesmo quando ocorre erro.|finally { liberar(); }
try-with-resources|Erros|Fecha automaticamente recursos que implementam AutoCloseable.|try (var in = Files.newInputStream(p)) { }
checked exception|Erros|Exceção que precisa ser capturada ou declarada.|void ler() throws IOException {}
Path|Arquivos|Representa caminho no sistema de arquivos.|Path p = Path.of("dados.txt");
Files|Arquivos|Utilitários para ler, escrever e gerenciar arquivos.|Files.writeString(p, "Olá");
JDBC|Banco de dados|API Java para conexão e instruções SQL.|Connection c = DriverManager.getConnection(url);
PreparedStatement|Banco de dados|Comando SQL parametrizado para não concatenar dados na consulta.|ps.setString(1, nome);
transação|Banco de dados|Grupo de operações confirmado junto ou revertido.|conexao.commit();
Thread|Concorrência|Linha de execução que pode rodar em paralelo.|new Thread(() -> tarefa()).start();
ExecutorService|Concorrência|Gerencia a execução e o ciclo de vida de tarefas.|ExecutorService pool = Executors.newFixedThreadPool(2);
synchronized|Concorrência|Coordena acesso a uma seção crítica por monitor.|synchronized (lock) { contador++; }
JUnit|Testes|Biblioteca externa para testes automatizados em Java.|@Test void somaFunciona() { assertEquals(4, soma(2,2)); }
Maven|Build|Ferramenta externa para dependências e ciclo de build.|mvn test
Gradle|Build|Ferramenta externa para configurar e executar builds.|gradle test
logger|Observabilidade|Registra eventos e erros sem depender de prints dispersos.|logger.info("Pedido criado");
Math.pow|Matemática|Calcula potência com resultado double.|Math.pow(2, 3)
Math.sqrt|Matemática|Calcula raiz quadrada com resultado double.|Math.sqrt(25)
Math.random|Matemática|Produz double pseudoaleatório em [0.0, 1.0).|Math.random()
BigDecimal|Matemática|Decimal com precisão controlada para valores como dinheiro.|new BigDecimal("0.10")
LocalDate|Datas|Data de calendário sem hora ou fuso horário.|LocalDate.now()
JFrame|Swing/AWT|Janela principal de uma interface Swing desktop.|JFrame janela = new JFrame("Título");
JPanel|Swing/AWT|Contêiner para agrupar componentes Swing.|JPanel painel = new JPanel();
JButton|Swing/AWT|Botão Swing que dispara ações quando clicado.|JButton salvar = new JButton("Salvar");
JLabel|Swing/AWT|Componente Swing que mostra texto ou imagem.|JLabel titulo = new JLabel("Olá");
JTextField|Swing/AWT|Campo Swing para digitar uma linha de texto.|JTextField nome = new JTextField(20);
ActionListener|Swing/AWT|Listener acionado por eventos de ação, como clique.|botao.addActionListener(e -> salvar());
Event Dispatch Thread|Swing/AWT|Thread em que operações de interface Swing devem acontecer.|SwingUtilities.invokeLater(() -> criarTela());
layout manager|Swing/AWT|Organiza tamanho e posição de componentes na interface.|painel.setLayout(new BorderLayout());
Spring Boot|Ecossistema|Framework externo para criar aplicações Java configuradas rapidamente.|@SpringBootApplication
Spring Security|Ecossistema|Módulo externo para autenticação e autorização.|SecurityFilterChain
JWT|Ecossistema|Token assinado usado como credencial; seu conteúdo não é criptografado por padrão.|Authorization: Bearer token
OAuth2/OIDC|Ecossistema|Protocolos para autorização e identidade federada.|openid profile email
OpenAPI|Ecossistema|Especificação para descrever contratos de APIs HTTP.|/v3/api-docs
Docker|Ecossistema|Empacota a aplicação e suas dependências em imagem de contêiner.|docker build .
Testcontainers|Ecossistema|Sobe infraestrutura de teste em contêineres.|@Testcontainers
Kafka|Ecossistema|Plataforma de eventos para mensagens entre serviços.|ProducerRecord
Redis|Ecossistema|Armazenamento em memória usado também para cache.|cache.get("chave")
CI/CD|Ecossistema|Automatiza testes, build e entrega a cada mudança.|mvn test && mvn package`.split('\n').map(line=>line.split('|'));
JAVA_CONCEPTS.push(['operador ||','Operadores','OU lógico com avaliação curta.','if (admin || autor) {}']);

// Mapa de cobertura temática dos doze materiais enviados. Exercícios e explicações no app são originais.
const JAVA_STUDY_REFERENCES=[
  ['Java Básico: Guia Didático Universitário','tipos, conversões, operadores, texto, decisões e laços'],
  ['Java Básico: Parte 2','break/continue, arrays, parâmetros, retorno, sobrecarga e recursão'],
  ['Java Básico: Parte 3','métodos, contratos, escopo, generics, refatoração e recursão'],
  ['Java Básico: Parte 4','classes, construtores, encapsulamento, herança, interfaces, records e SOLID'],
  ['Java Básico: Parte 5','exceptions, collections, generics, lambdas e Streams'],
  ['Java Básico: Parte 6','I/O, JDBC, concorrência, testes, build, logging e Spring Boot'],
  ['Java Básico: Parte 7','segurança, JWT/OAuth2, OpenAPI, Docker, mensageria, cache, microsserviços e CI/CD'],
  ['Java Math, AWT e Swing · Faculdade Flamingo','Math, arredondamento, AWT e componentes Swing'],
  ['Guia Completo · Java Swing','componentes, layouts, eventos e boas práticas de interface'],
  ['Java Swing · Guia de Interfaces','interfaces, controles, composição visual e interação'],
  ['Estudo Dirigido: Algoritmos · Manzano','lógica, estruturas de decisão, repetição, vetores, busca, matrizes e funções'],
  ['Apostila Faccat · Lógica de Programação','raciocínio, entrada/processamento/saída, decisões, laços e exercícios de lógica']
];

function javaDescriptor(s){let i=0;function type(){let code=s[i++],m={B:'byte',C:'char',D:'double',F:'float',I:'int',J:'long',S:'short',Z:'boolean',V:'void'};if(m[code])return m[code];if(code==='[')return type()+'[]';if(code==='L'){let e=s.indexOf(';',i),v=s.slice(i,e).replaceAll('/','.');i=e+1;return v}return '?'}if(s[0]!=='(')return type();i=1;let args=[];while(i<s.length&&s[i]!==')')args.push(type());i++;return `(${args.join(', ')}) : ${type()}`}
