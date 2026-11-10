'use strict';
// Independent game rules; no existing progress, lives or tracks are modified.
(() => {
  const C = (x,y) => `${x},${y}`;
  const levels = [
    {name:'Primeiros passos',skill:'Chamadas de método',story:'Leve o professor até a saída. Ele já está olhando para a direita.',hint:'Chame Professor.andar() três vezes. Cada chamada avança uma casa.',start:[1,4],goal:[4,4]},
    {name:'A curva do corredor',skill:'Sequência e direção',story:'O caminho vira para cima. Faça a curva na hora certa.',hint:'Avance duas casas, vire à esquerda e avance duas.',start:[1,4],goal:[3,2]},
    {name:'O primeiro salto',skill:'Pular obstáculos',story:'Há uma caixa no corredor. Um salto atravessa uma casa.',hint:'Ande uma vez; de frente para a caixa, use Professor.pular(); depois ande.',start:[1,4],goal:[5,4],walls:[[3,4]]},
    {name:'O token perdido',skill:'Coleta e estado',story:'Passe pelo token dourado, colete e alcance a saída.',hint:'O token está na coluna 3. Use Professor.pegar() em cima dele antes de sair.',start:[1,4],goal:[4,2],gems:[[3,4]]},
    {name:'Caixa na esquina',skill:'Composição de ações',story:'Salte a caixa e depois vire para encontrar a saída.',hint:'Pule da casa inicial, vire à esquerda e avance uma casa.',start:[1,4],goal:[3,3],walls:[[2,4]]},
    {name:'Desvio inteligente',skill:'Desvio por percurso',story:'O corredor direto está bloqueado. Use a rota de cima.',hint:'Vire à esquerda, suba, vire à direita e avance três casas.',start:[1,4],goal:[4,3],walls:[[2,4],[3,4]]},
    {name:'Dois achados',skill:'Ordem das operações',story:'Pegue os dois tokens antes de chegar à saída.',hint:'Há tokens em (2,4) e (4,3). Pegue o primeiro, suba na coluna 4 e pegue o segundo.',start:[1,4],goal:[5,3],gems:[[2,4],[4,3]]},
    {name:'Ponte de código',skill:'Salto e laço for',story:'Uma caixa interrompe a ponte. Depois do salto, repita passos com um laço.',hint:'Ande, pule a caixa e repita Professor.andar() duas vezes com for.',start:[1,4],goal:[6,4],walls:[[3,4]]},
    {name:'Não pise no bug',skill:'Rotas seguras',story:'Os quadrados vermelhos são bugs. Contorne-os sem tocar neles.',hint:'Suba uma casa, ande três à direita, desça uma e alcance a saída.',start:[1,4],goal:[5,4],hazards:[[2,4],[3,4],[4,4]]},
    {name:'Entrega expressa',skill:'Laço e coleta',story:'Colete o token depois de atravessar o corredor. Use um laço se quiser.',hint:'Ande três casas até (4,4), pegue o token e vire para subir duas.',start:[1,4],goal:[4,2],gems:[[4,4]]},
    {name:'Circuito da equipe',skill:'Trajeto composto',story:'Duas entregas em pontos diferentes, com uma caixa no meio.',hint:'Pegue o token em (2,4), pule a caixa em (3,4), pegue o outro em (4,4) e suba duas.',start:[1,4],goal:[4,2],walls:[[3,4]],gems:[[2,4],[4,4]]},
    {name:'Grande final',skill:'Algoritmo completo',story:'Desvie dos bugs, salte o bloqueio, colete os tokens e leve o professor à saída.',hint:'Suba para (1,3), vá até (2,3), pule a caixa em (3,3), pegue o token em (4,3); depois suba até (4,1) e siga até (6,1).',start:[1,4],goal:[6,1],walls:[[3,3]],hazards:[[2,4],[3,4]],gems:[[4,3],[5,1]]},
    {name:'Portões da arena',skill:'Arena · saltos consecutivos',story:'A arena abriu! Salte as duas barreiras, recolha os cristais e alcance o portal.',hint:'Comece com um salto, pegue o cristal, salte de novo, pegue o segundo e ande até a saída.',start:[1,4],goal:[6,4],walls:[[2,4],[4,4]],gems:[[3,4],[5,4]],arena:true},
    {name:'Duas torres de bugs',skill:'Arena · rota segura',story:'Três casas da rota central estão sob ataque. Busque os dois cristais pela passagem superior.',hint:'Suba para (1,3), vire à direita, pegue em (2,3), siga até (5,3), pegue e suba.',start:[1,4],goal:[5,2],hazards:[[2,4],[3,4],[4,4]],gems:[[2,3],[5,3]],arena:true},
    {name:'Defesa do cristal',skill:'Arena · salto e coleta',story:'Uma caixa guarda o primeiro cristal; outra fecha o atalho. Combine salto e desvio.',hint:'Salte a primeira caixa para (3,4), pegue, avance para (4,4) e suba até o cristal em (4,2).',start:[1,4],goal:[5,1],walls:[[2,4],[3,3]],gems:[[3,4],[4,2]],arena:true},
    {name:'Rota em zigue-zague',skill:'Arena · precisão',story:'As torres cobrem a faixa de baixo. Suba, recolha os cristais e mude de faixa antes do bug.',hint:'Pegue em (2,3), avance até (3,3), suba para (3,2), pegue em (5,2) e alcance (6,1).',start:[1,4],goal:[6,1],hazards:[[2,4],[3,4],[4,4],[4,3],[5,3]],gems:[[2,3],[5,2]],arena:true},
    {name:'Laços contra a horda',skill:'Arena · laço for',story:'Uma muralha corta o campo. Suba pela lateral e percorra a faixa superior; use for para repetir passos.',hint:'Da casa (0,5), suba três, pegue o cristal, avance quatro, pegue o outro e siga até (6,2).',start:[0,5],goal:[6,1],walls:[[3,5],[3,4],[3,3]],gems:[[0,2],[4,2]],arena:true},
    {name:'Corredor do chefão',skill:'Arena · planejamento',story:'As torres vigiam o corredor inferior. Dois cristais abrem o caminho para o núcleo.',hint:'Suba até (1,3), pegue em (2,3), suba para (2,2), pegue em (4,2) e siga à direita.',start:[1,4],goal:[6,2],walls:[[3,3],[5,3]],hazards:[[2,4],[3,4],[4,4],[5,4]],gems:[[2,3],[4,2]],arena:true},
    {name:'Última defesa',skill:'Arena · múltiplas rotas',story:'O núcleo fortaleceu suas torres. Escolha a faixa segura e pegue os cristais em ordem.',hint:'Suba para (0,3), avance até (3,3), pegue; suba e vá até (5,2) para pegar o segundo.',start:[0,4],goal:[6,1],walls:[[2,4],[4,3]],hazards:[[3,4],[5,3]],gems:[[3,3],[5,2]],arena:true},
    {name:'Rei dos Bugs',skill:'Arena final · algoritmo completo',story:'O núcleo do Rei dos Bugs está protegido. Recolha os três cristais para derrubar o escudo e chegar até ele.',hint:'Pegue em (1,4). Suba para a faixa 2, pegue em (3,2). Depois suba até a faixa 0, pegue em (5,0) e avance até o núcleo.',start:[0,5],goal:[6,0],walls:[[2,5],[2,4],[4,3],[5,1]],hazards:[[3,5],[4,5],[5,5],[3,4],[5,4],[5,3]],gems:[[1,4],[3,2],[5,0]],arena:true,boss:true}
  ];
  const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
  // One Java routine must clear all three maps; only the crate position changes.
  const surpriseMaps = [2,3,4].map((column,i)=>({
    name:'Mapa surpresa '+(i+1),skill:'Condição e laço em Java',
    story:'O obstáculo muda de lugar. Escreva uma solução que se adapte aos três mapas.',
    hint:'Use temCaixaNaFrente() para desviar pela faixa de cima e chegou() para encerrar o laço.',
    start:[0,4],goal:[6,4],walls:[[column,4]]
  }));
  function initial(level) { return {x:level.start[0],y:level.start[1],dir:0,collected:[],moves:0,status:'playing',message:'Pronto para começar.'}; }
  function contains(cells,x,y) { return (cells||[]).some(([a,b])=>a===x&&b===y); }
  function apply(level,state,command) {
    if(state.status!=='playing')return state;
    let next={...state,collected:[...state.collected],moves:state.moves+1};
    const fail=message=>({...next,status:'failed',message});
    if(next.moves>100)return fail('Limite de 100 comandos por tentativa. Use um caminho mais curto.');
    if(command==='RIGHT'){next.dir=(next.dir+1)%4;next.message='Virou à direita.';}
    else if(command==='LEFT'){next.dir=(next.dir+3)%4;next.message='Virou à esquerda.';}
    else if(command==='STEP'||command==='JUMP'){
      const distance=command==='JUMP'?2:1;
      const [dx,dy]=dirs[next.dir];
      const x=next.x+dx*distance,y=next.y+dy*distance;
      if(x<0||x>6||y<0||y>5)return fail('O professor saiu do tabuleiro. Ajuste o caminho.');
      if(contains(level.walls,x,y))return fail('Uma caixa bloqueou o caminho. Tente desviar ou pular.');
      if(command==='JUMP'&&contains(level.hazards,next.x+dx,next.y+dy))return fail('Não é seguro saltar sobre um bug. Procure outra rota.');
      if(contains(level.hazards,x,y))return fail('O professor pisou em um bug. Tente outra rota.');
      if(level.boss&&x===level.goal[0]&&y===level.goal[1]&&next.collected.length<(level.gems||[]).length)return fail('O núcleo ainda tem escudo. Recolha todos os cristais antes de entrar.');
      next.x=x;next.y=y;next.message=command==='JUMP'?'Saltou duas casas.':'Avançou uma casa.';
    } else if(command==='PICK'){
      const key=C(next.x,next.y);
      if(!contains(level.gems,next.x,next.y)||next.collected.includes(key))return fail('Não há token para pegar nesta casa.');
      next.collected.push(key);next.message='Token coletado!';
    } else if(command.startsWith('SAY|')){next.message='Professor: '+command.slice(4,100);}
    else return fail('Comando desconhecido. Confira os métodos disponíveis.');
    if(next.x===level.goal[0]&&next.y===level.goal[1]&&next.collected.length===(level.gems||[]).length){next.status='won';next.message=level.boss?'Rei dos Bugs derrotado! Você conquistou a arena com seu código Java.':'Missão concluída! O professor chegou ao destino.';}
    return next;
  }
  function run(level,commands){let state=initial(level),frames=[];for(const c of commands){state=apply(level,state,c);frames.push(state);if(state.status!=='playing')break}return {state,frames};}
  const api={levels,surpriseMaps,initial,apply,run,contains};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.JavaProfessorGame=api;
})();
