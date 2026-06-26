document.addEventListener('DOMContentLoaded', function () {
  configurarBotaoVoltar();
  configurarFormularioEmail();
});

function configurarBotaoVoltar() {
  const voltarBtn = document.getElementById('voltar-btn');

  if (!voltarBtn) return;

  voltarBtn.addEventListener('click', function () {
    window.location.href = './index.html';
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
        descricao: 'Cada letra é deslocada 3 posições no alfabeto.'
      },

      dadosOriginais: {
        remetente: remetenteDigitado,
        destinatario: destinatarioDigitado,
        assunto: assuntoDigitado,
        corpo: corpoDigitado
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

    mostrarAlerta('Objeto criptografado gerado com sucesso!', 'sucesso');

    emailForm.reset();
  });
}

function encriptar(texto, chave) {
  const alfabetoMinusculo = 'abcdefghijklmnopqrstuvwxyz';
  const alfabetoMaiusculo = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let resultado = '';

  for (let i = 0; i < texto.length; i++) {
    const caractere = texto[i];

    if (alfabetoMinusculo.includes(caractere)) {
      const posicaoAtual = alfabetoMinusculo.indexOf(caractere);
      const novaPosicao = (posicaoAtual + chave) % alfabetoMinusculo.length;
      resultado += alfabetoMinusculo[novaPosicao];
    } else if (alfabetoMaiusculo.includes(caractere)) {
      const posicaoAtual = alfabetoMaiusculo.indexOf(caractere);
      const novaPosicao = (posicaoAtual + chave) % alfabetoMaiusculo.length;
      resultado += alfabetoMaiusculo[novaPosicao];
    } else {
      resultado += caractere;
    }
  }

  return resultado;
}

function mostrarAlerta(mensagem, tipo = 'sucesso') {
  const alerta = document.getElementById('alerta');

  if (!alerta) {
    console.log(mensagem);
    return;
  }

  alerta.textContent = mensagem;
  alerta.className = `alerta ${tipo}`;

  setTimeout(function () {
    alerta.className = 'alerta escondido';
  }, 3000);
}