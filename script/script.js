import { criarSessaoJWT, consultarDNS, extrairDominio } from './session.js';
import { identificarEntrada, criarObjetoAplicacao, criarObjetoArquivo } from './protocolo.js';
import { mostrarAlerta } from './alerts.js';
import { salvarHistorico, carregarHistorico, limparHistorico } from './storage.js';
import { criarObjetoTransporte } from './transporte.js';
import { criarObjetoRede } from './rede.js';

document.addEventListener('DOMContentLoaded', function () {
  const USER_NAME = 'Samuel8Oliveira';

  carregarUsuario(USER_NAME);
  configurarRequisicao(USER_NAME);
  configurarArquivo(USER_NAME);
  configurarFormularioEmail();
  configurarNavegacao();
  configurarHistorico();
  renderizarHistorico();
});

function carregarUsuario(USER_NAME) {
  const user = document.querySelector('.user');

  if (user) {
    user.textContent = `Usuário: ${USER_NAME}`;
  }
}

function configurarRequisicao(USER_NAME) {
  const reqBtn = document.getElementById('btn-requisicao');

  if (!reqBtn) return;

  reqBtn.addEventListener('click', async function (event) {
    event.preventDefault();

    const reqText = document.querySelector('.text-input');
    const protocolName = document.querySelector('.protocol-name');

    if (!reqText) return;

    const entrada = limparEntradaUsuario(reqText.value);

    if (entrada === '') {
      if (protocolName) {
        protocolName.textContent = 'Digite uma requisição primeiro';
      }

      mostrarAlerta('Digite um e-mail, site ou mensagem.', 'erro');
      return;
    }

    try {
      const tipo = identificarEntrada(entrada);

      const camadaAplicacao = criarObjetoAplicacao(tipo, entrada, USER_NAME);

      const camadaSessao = await criarSessaoJWT(camadaAplicacao);

      let camadaDNS = null;

      if (tipo === 'http_request') {
        const dominio = extrairDominio(entrada);
        camadaDNS = await consultarDNS(dominio);
      }

      const camadaTransporte = criarObjetoTransporte(
        camadaAplicacao,
        camadaSessao.sessionId
      );

      const camadaRede = criarObjetoRede(
        camadaAplicacao,
        camadaDNS
      );

      const pacoteFinal = {
        titulo: 'Pacote de comunicação gerado',
        camadaAplicacao: camadaAplicacao,
        camadaSessao: camadaSessao,
        camadaTransporte: camadaTransporte,
        camadaRede: camadaRede,
        camadaDNS: camadaDNS
      };

      localStorage.setItem('ultimaRotaOsi', JSON.stringify(pacoteFinal));

      if (protocolName) {
        protocolName.textContent = `Protocolo identificado: ${camadaAplicacao.protocolo}`;
      }

      renderizarResultado(
        pacoteFinal,
        'Dados da Requisição',
        'Objeto gerado com camada de aplicação, sessão, transporte, rede e DNS'
      );

      salvarHistorico(pacoteFinal);
      renderizarHistorico();

      mostrarAlerta('Requisição processada com sucesso!', 'sucesso');

      reqText.value = '';

    } catch (erro) {
      console.error(erro);
      mostrarAlerta('Erro ao processar a requisição.', 'erro');
    }
  });
}

function configurarArquivo(USER_NAME) {
  const inputFile = document.getElementById('arquivo');

  if (!inputFile) return;

  inputFile.addEventListener('change', async function () {
    if (inputFile.files.length === 0) return;

    const file = inputFile.files[0];

    try {
      const camadaAplicacao = criarObjetoArquivo(file, USER_NAME);

      const camadaSessao = await criarSessaoJWT(camadaAplicacao);

      const camadaTransporte = criarObjetoTransporte(
        camadaAplicacao,
        camadaSessao.sessionId
      );

      const camadaRede = criarObjetoRede(
        camadaAplicacao,
        null
      );

      const pacoteFinal = {
        titulo: 'Pacote de upload gerado',
        camadaAplicacao: camadaAplicacao,
        camadaSessao: camadaSessao,
        camadaTransporte: camadaTransporte,
        camadaRede: camadaRede,
        camadaDNS: null
      };

      localStorage.setItem('ultimaRotaOsi', JSON.stringify(pacoteFinal));

      const protocolName = document.querySelector('.protocol-name');

      if (protocolName) {
        protocolName.textContent = 'Protocolo identificado: HTTP Upload';
      }

      renderizarResultado(
        pacoteFinal,
        'Dados do Arquivo',
        'Objeto gerado com aplicação, sessão, transporte e rede'
      );

      salvarHistorico(pacoteFinal);
      renderizarHistorico();

      mostrarAlerta('Arquivo processado com sucesso!', 'sucesso');

      inputFile.value = '';

    } catch (erro) {
      console.error(erro);
      mostrarAlerta('Erro ao processar o arquivo.', 'erro');
    }
  });
}

function configurarFormularioEmail() {
  const emailForm = document.getElementById('email-form');
  const emailPreview = document.getElementById('email-preview');

  if (!emailForm || !emailPreview) return;

  emailForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const chave = 3;

    const remetenteDigitado = document.getElementById('remetente').value;
    const destinatarioDigitado = document.getElementById('destinatario').value;
    const assuntoDigitado = document.getElementById('assunto').value;
    const corpoDigitado = document.getElementById('corpo').value;
    const protocoloDigitado = document.getElementById('protocolo').value;

    const emailCriptografado = {
      camada: 'Aplicação',
      tipo: 'email_formulario',
      protocolo: protocoloDigitado,
      criptografia: {
        algoritmo: 'Cifra de César',
        chave: chave,
        descricao: 'Cada letra do texto é deslocada 3 posições no alfabeto.'
      },
      dadosCriptografados: {
        remetente: encriptar(remetenteDigitado, chave),
        destinatario: encriptar(destinatarioDigitado, chave),
        assunto: encriptar(assuntoDigitado, chave),
        corpo: encriptar(corpoDigitado, chave)
      },
      timestamp: new Date().toLocaleString('pt-BR')
    };

    emailPreview.textContent = JSON.stringify(emailCriptografado, null, 2);

    mostrarAlerta('Objeto de e-mail criptografado gerado com sucesso!', 'sucesso');

    emailForm.reset();
  });
}

function configurarNavegacao() {
  const abrirFormularioBtn = document.getElementById('abrir-formulario');

  if (abrirFormularioBtn) {
    abrirFormularioBtn.addEventListener('click', function () {
      window.location.href = './gmail.html';
    });
  }

  const abrirRoteadoresBtn = document.getElementById('abrir-roteadores');

  if (abrirRoteadoresBtn) {
    abrirRoteadoresBtn.addEventListener('click', function () {
      window.location.href = './roteadores.html';
    });
  }

  const voltarBtn = document.getElementById('voltar-btn');

  if (voltarBtn) {
    voltarBtn.addEventListener('click', function () {
      window.location.href = './index.html';
    });
  }
}

function configurarHistorico() {
  const limparBtn = document.getElementById('limpar-historico');

  if (!limparBtn) return;

  limparBtn.addEventListener('click', function () {
    limparHistorico();
    renderizarHistorico();
    mostrarAlerta('Histórico limpo com sucesso!', 'aviso');
  });
}

function renderizarResultado(dados, titulo, subtitulo) {
  const resultCard = document.getElementById('result-card');
  const resultTitle = document.getElementById('result-title');
  const resultSubtitle = document.getElementById('result-subtitle');
  const objetoPreview = document.getElementById('objeto-preview');
  const resumoCamadas = document.getElementById('resumo-camadas');

  if (resultTitle) {
    resultTitle.textContent = titulo;
  }

  if (resultSubtitle) {
    resultSubtitle.textContent = subtitulo;
  }

  if (resumoCamadas) {
    resumoCamadas.innerHTML = '';

    const aplicacao = dados.camadaAplicacao;
    const sessao = dados.camadaSessao;
    const transporte = dados.camadaTransporte;
    const rede = dados.camadaRede;
    const dns = dados.camadaDNS;

    resumoCamadas.appendChild(
      criarCardCamada(
        'Camada de Aplicação',
        aplicacao.protocolo,
        aplicacao.descricao || 'Representa o serviço usado pelo usuário.'
      )
    );

    resumoCamadas.appendChild(
      criarCardCamada(
        'Camada de Sessão',
        encurtarTexto(sessao.sessionId, 18),
        'Cria uma identificação única para organizar a comunicação.'
      )
    );

    if (transporte) {
      resumoCamadas.appendChild(
        criarCardCamada(
          'Camada de Transporte',
          `${transporte.protocoloTransporte} - Porta ${transporte.portaDestino}`,
          `Serviço identificado: ${transporte.servicoDestino}`
        )
      );
    }

    if (rede) {
      resumoCamadas.appendChild(
        criarCardCamada(
          'Camada de Rede',
          `${rede.ipOrigem} → ${rede.ipDestino}`,
          `Rota com ${rede.rota.length} saltos. TTL final: ${rede.ttlFinal}`
        )
      );
    }

    if (dns) {
      resumoCamadas.appendChild(
        criarCardCamada(
          'DNS',
          dns.ip,
          `Converte o domínio ${dns.dominio} em endereço IP.`
        )
      );
    }
  }

  const dadosParaExibir = prepararJsonParaTela(dados);

  if (objetoPreview) {
    objetoPreview.textContent = JSON.stringify(dadosParaExibir, null, 2);
  }

  if (resultCard) {
    resultCard.classList.add('ativo');
  }
}

function criarCardCamada(titulo, valor, descricao) {
  const card = document.createElement('div');
  card.classList.add('camada-card');

  const h3 = document.createElement('h3');
  h3.textContent = titulo;

  const pValor = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = 'Valor: ';

  pValor.appendChild(strong);
  pValor.appendChild(document.createTextNode(valor));

  const pDescricao = document.createElement('p');
  pDescricao.textContent = descricao;

  card.appendChild(h3);
  card.appendChild(pValor);
  card.appendChild(pDescricao);

  return card;
}

function prepararJsonParaTela(dados) {
  const copia = structuredClone(dados);

  if (copia.camadaSessao && copia.camadaSessao.token) {
    copia.camadaSessao.token =
      copia.camadaSessao.token.substring(0, 40) + '... token reduzido para visualização';
  }

  if (
    copia.camadaSessao &&
    copia.camadaSessao.payload &&
    copia.camadaSessao.payload.message
  ) {
    copia.camadaSessao.payload.message = 'Mensagem original armazenada no token';
  }

  return copia;
}

function renderizarHistorico() {
  const lista = document.getElementById('historico-lista');

  if (!lista) return;

  const historico = carregarHistorico();

  lista.innerHTML = '';

  if (historico.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'Nenhuma requisição registrada ainda.';
    lista.appendChild(item);
    return;
  }

  historico.slice().reverse().forEach(function (pacote) {
    const camada = pacote.camadaAplicacao;

    const item = document.createElement('li');

    const protocolo = document.createElement('strong');
    protocolo.textContent = camada.protocolo;

    const resumo = document.createElement('span');
    resumo.textContent = gerarResumoHistorico(camada);

    item.appendChild(protocolo);
    item.appendChild(resumo);

    lista.appendChild(item);
  });
}

function gerarResumoHistorico(camada) {
  if (camada.tipo === 'http_request') {
    return `Acesso ao endereço: ${camada.hostIP} pela camada de aplicação`;
  }

  if (camada.tipo === 'email') {
    return `E-mail para: ${camada.destinatario}`;
  }

  if (camada.tipo === 'arquivo') {
    return `Arquivo enviado: ${camada.nome}`;
  }

  if (camada.tipo === 'chat') {
    return `Mensagem enviada: ${camada.mensagem}`;
  }

  return 'Requisição registrada';
}

function encriptar(texto, chave) {
  const alfabeto = 'abcdefghijklmnopqrstuvwxyz';
  let resultado = '';

  texto = texto.toLowerCase();

  for (let i = 0; i < texto.length; i++) {
    const caractere = texto[i];

    if (alfabeto.includes(caractere)) {
      const posicaoAtual = alfabeto.indexOf(caractere);
      const novaPosicao = (posicaoAtual + chave) % alfabeto.length;
      resultado += alfabeto[novaPosicao];
    } else {
      resultado += caractere;
    }
  }

  return resultado;
}

function limparEntradaUsuario(texto) {
  return texto
    .trim()
    .replace(/^digite:/i, '')
    .trim();
}

function encurtarTexto(texto, tamanho = 20) {
  if (!texto) return '';

  if (texto.length <= tamanho) {
    return texto;
  }

  return texto.substring(0, tamanho) + '...';
}