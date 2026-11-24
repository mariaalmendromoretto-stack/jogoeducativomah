/ =========================================================
// FÓRMULA SECRETA - Lógica do Jogo (6 Rodadas)
// =========================================================

// Lista com as 6 equações em ordem crescente de dificuldade
const desafios = [
  {
    nivel: "Nível 1: Aquecimento",
    equacao: "x + 5 = 12",
    opcoes: [5, 7, 12, 17],
    correta: 7,
    explicacao: "Para deixar o x sozinho, passamos o +5 subtraindo: x = 12 - 5, então x = 7."
  },
  {
    nivel: "Nível 2: Equilíbrio Simples",
    equacao: "x - 8 = 10",
    opcoes: [2, 8, 18, 80],
    correta: 18,
    explicacao: "O -8 passa para o outro lado somando: x = 10 + 8, então x = 18."
  },
  {
    nivel: "Nível 3: Multiplicação",
    equacao: "3x = 21",
    opcoes: [6, 7, 18, 24],
    correta: 7,
    explicacao: "O 3 está multiplicando o x, então passa dividindo: x = 21 ÷ 3, então x = 7."
  },
  {
    nivel: "Nível 4: Duas Etapas",
    equacao: "2x + 4 = 14",
    opcoes: [5, 7, 9, 10],
    correta: 5,
    explicacao: "Primeiro tiramos 4: 2x = 14 - 4 (que dá 10). Depois dividimos por 2: x = 5."
  },
  {
    nivel: "Nível 5: Números Negativos",
    equacao: "4x - 6 = 10",
    opcoes: [1, 2, 4, 16],
    correta: 4,
    explicacao: "Passamos o -6 somando: 4x = 10 + 6 (que dá 16). Depois dividimos por 4: x = 4."
  },
  {
    nivel: "Nível 6: Desafio Final",
    equacao: "5x + 3 = 2x + 15",
    opcoes: [3, 4, 6, 12],
    correta: 4,
    explicacao: "Juntamos o x de um lado (5x - 2x = 3x) e os números do outro (15 - 3 = 12). Assim, 3x = 12, logo x = 4."
  }
];

// Variáveis que guardam o estado atual da partida
let rodadaAtual = 0;
let pontos = 0;
let vidas = 3;
let tempoInicio = 0;
let respondeuRodada = false;

const PONTOS_POR_ACERTO = 100;
const PONTUACAO_MAXIMA = desafios.length * PONTOS_POR_ACERTO;

// Pegando os elementos da tela (HTML) para poder mudar textos e esconder/mostrar telas
const telaInicio = document.getElementById("tela-inicio");
const telaJogo = document.getElementById("tela-jogo");
const telaFim = document.getElementById("tela-fim");

const textoRodada = document.getElementById("texto-rodada");
const textoPontos = document.getElementById("texto-pontos");
const textoVidas = document.getElementById("texto-vidas");

const textoNivel = document.getElementById("texto-nivel");
const textoEquacao = document.getElementById("texto-equacao");
const gradeOpcoes = document.getElementById("grade-opcoes");

const caixaFeedback = document.getElementById("caixa-feedback");
const textoFeedback = document.getElementById("texto-feedback");
const btnProxima = document.getElementById("btn-proxima");

const iconeFinal = document.getElementById("icone-final");
const tituloFinal = document.getElementById("titulo-final");
const mensagemFinal = document.getElementById("mensagem-final");
const finalPontos = document.getElementById("final-pontos");
const finalTempo = document.getElementById("final-tempo");

const btnTema = document.getElementById("btn-tema");
const btnIniciar = document.getElementById("btn-iniciar");
const btnReiniciar = document.getElementById("btn-reiniciar");

// =========================================================
// COMUNICAÇÃO COM O PORTAL (Contrato vrgame)
// =========================================================

// Avisa o portal que o jogo carregou e está pronto
function avisarPortalPronto() {
  window.parent.postMessage({ type: "vrgame:ready" }, "*");
  enviarAlturaParaPortal();
}

// Envia a altura atual da página para o portal ajustar a janela
function enviarAlturaParaPortal() {
  const altura = document.documentElement.scrollHeight;
  window.parent.postMessage({ type: "vrgame:resize", height: altura }, "*");
}

// Aplica o tema claro ("light") ou escuro ("dark")
function aplicarTema(tema) {
  if (tema === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  enviarAlturaParaPortal();
}

// Escuta mensagens vindas do portal (mudança de tema ou tela cheia)
window.addEventListener("message", (evento) => {
  const dados = evento.data;
  if (!dados || typeof dados !== "object") return;

  if (dados.type === "vrgame:theme" && dados.theme) {
    aplicarTema(dados.theme);
  }

  if (dados.type === "vrgame:fullscreen") {
    enviarAlturaParaPortal();
  }
});

// Atualiza a altura sempre que o tamanho da janela mudar
window.addEventListener("resize", enviarAlturaParaPortal);

// =========================================================
// FUNÇÕES PRINCIPAIS DO JOGO
// =========================================================

// Alterna entre tema claro e escuro quando o jogador clica no botão
btnTema.addEventListener("click", () => {
  const estaEscuro = document.documentElement.getAttribute("data-theme") === "dark";
  aplicarTema(estaEscuro ? "light" : "dark");
});

// Atualiza o painel superior com rodada, pontos e corações de vida
function atualizarPainelStatus() {
  const numeroExibido = Math.min(rodadaAtual + 1, desafios.length);
  textoRodada.textContent = `${numeroExibido} / ${desafios.length}`;
  textoPontos.textContent = pontos;

  // Mostra corações cheios para vidas restantes e vazios para perdidas
  const coracoesCheios = "❤️".repeat(Math.max(0, vidas));
  const coracoesVazios = "🖤".repeat(Math.max(0, 3 - vidas));
  textoVidas.textContent = coracoesCheios + coracoesVazios;
  textoVidas.setAttribute("aria-label", `${vidas} vidas restantes`);
}

// Mostra apenas a tela desejada e esconde as outras
function mostrarTela(telaParaMostrar) {
  telaInicio.hidden = true;
  telaJogo.hidden = true;
  telaFim.hidden = true;

  telaParaMostrar.hidden = false;
  enviarAlturaParaPortal();
}

// Inicia ou reinicia uma partida do zero
function iniciarPartida() {
  rodadaAtual = 0;
  pontos = 0;
  vidas = 3;
  tempoInicio = Date.now();

  atualizarPainelStatus();
  mostrarTela(telaJogo);
  carregarRodada();
}

// Monta a equação e os botões da rodada atual
function carregarRodada() {
  respondeuRodada = false;
  caixaFeedback.hidden = true;
  caixaFeedback.className = "feedback";

  const desafio = desafios[rodadaAtual];
  textoNivel.textContent = desafio.nivel;
  textoEquacao.textContent = desafio.equacao;

  // Limpa os botões antigos e cria os novos
  gradeOpcoes.innerHTML = "";
  desafio.opcoes.forEach((valor) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn-opcao";
    botao.textContent = `x = ${valor}`;
    botao.addEventListener("click", () => verificarResposta(valor, botao));
    gradeOpcoes.appendChild(botao);
  });

  atualizarPainelStatus();
  enviarAlturaParaPortal();
}

// Verifica se o valor clicado pelo jogador está certo ou errado
function verificarResposta(valorEscolhido, botaoClicado) {
  if (respondeuRodada) return;
  respondeuRodada = true;

  const desafio = desafios[rodadaAtual];
  const todosBotoes = gradeOpcoes.querySelectorAll(".btn-opcao");

  // Desativa todos os botões para evitar cliques repetidos
  todosBotoes.forEach((btn) => {
    btn.disabled = true;
    const numeroBotao = Number(btn.textContent.replace("x = ", ""));
    if (numeroBotao === desafio.correta) {
      btn.classList.add("correta");
    }
  });

  if (valorEscolhido === desafio.correta) {
    pontos += PONTOS_POR_ACERTO;
    caixaFeedback.classList.add("acerto");
    textoFeedback.innerHTML = `<strong>✅ Fórmula estabilizada!</strong> ${desafio.explicacao}`;
  } else {
    vidas -= 1;
    botaoClicado.classList.add("errada");
    caixaFeedback.classList.add("erro");
    textoFeedback.innerHTML = `<strong>❌ Reação instável!</strong> ${desafio.explicacao}`;
  }

  atualizarPainelStatus();

  // Ajusta o texto do botão conforme o estado do jogo
  if (vidas <= 0) {
    btnProxima.textContent = "Ver Resultado ➔";
  } else if (rodadaAtual + 1 >= desafios.length) {
    btnProxima.textContent = "Concluir Experimento 🏆";
  } else {
    btnProxima.textContent = "Próxima Fórmula ➔";
  }

  caixaFeedback.hidden = false;
  enviarAlturaParaPortal();
}

// Avança para a próxima rodada ou encerra o jogo
function avancarJogo() {
  if (vidas <= 0) {
    finalizarPartida(false);
    return;
  }

  rodadaAtual += 1;

  if (rodadaAtual >= desafios.length) {
    finalizarPartida(true);
  } else {
    carregarRodada();
  }
}

// Mostra a tela final e envia a pontuação para o portal
function finalizarPartida(venceu) {
  const tempoTotalMs = Date.now() - tempoInicio;
  const segundos = Math.max(1, Math.round(tempoTotalMs / 1000));

  if (venceu) {
    iconeFinal.textContent = "🏆";
    tituloFinal.textContent = "Experimento Concluído!";
    mensagemFinal.textContent = "Parabéns! Você descobriu todos os valores de x e estabilizou o laboratório.";
  } else {
    iconeFinal.textContent = "💥";
    tituloFinal.textContent = "As 3 vidas acabaram!";
    mensagemFinal.textContent = "A mistura ficou instável, mas você pode tentar novamente e treinar mais!";
  }

  finalPontos.textContent = `${pontos} / ${PONTUACAO_MAXIMA}`;
  finalTempo.textContent = `${segundos}s`;

  mostrarTela(telaFim);

  // Envia o resultado final para o portal conforme o contrato
  window.parent.postMessage(
    {
      type: "vrgame:finish",
      score: pontos,
      maxScore: PONTUACAO_MAXIMA,
      timeMs: tempoTotalMs,
      detail: { jogo: "formula-secreta" }
    },
    "*"
  );
}

// Liga os cliques dos botões principais
btnIniciar.addEventListener("click", iniciarPartida);
btnProxima.addEventListener("click", avancarJogo);
btnReiniciar.addEventListener("click", iniciarPartida);

// Inicializa o jogo ao carregar a página
window.addEventListener("DOMContentLoaded", avisarPortalPronto);



