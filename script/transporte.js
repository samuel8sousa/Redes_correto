export function criarObjetoTransporte(camadaAplicacao, sessionId) {
  const protocoloAplicacao = camadaAplicacao.protocolo;
  const entrada = camadaAplicacao.hostIP || camadaAplicacao.destinatario || camadaAplicacao.mensagem || camadaAplicacao.nome || '';

  const portas = definirPortas(protocoloAplicacao, entrada);

  return {
    camada: 'Transporte',
    sessionId: sessionId,
    packetId: crypto.randomUUID(),
    protocoloTransporte: 'TCP',
    portaOrigem: gerarPortaOrigem(),
    portaDestino: portas.portaDestino,
    servicoDestino: portas.servico,
    descricao: 'A camada de transporte define o protocolo TCP e as portas usadas na comunicação.'
  };
}

function definirPortas(protocoloAplicacao, entrada) {
  if (protocoloAplicacao.includes('HTTP Upload')) {
    return {
      portaDestino: 80,
      servico: 'Upload via HTTP'
    };
  }

  if (protocoloAplicacao.includes('HTTP')) {
    if (entrada.startsWith('https')) {
      return {
        portaDestino: 443,
        servico: 'HTTPS'
      };
    }

    return {
      portaDestino: 80,
      servico: 'HTTP'
    };
  }

  if (protocoloAplicacao.includes('SMTP')) {
    return {
      portaDestino: 587,
      servico: 'SMTP'
    };
  }

  if (protocoloAplicacao.includes('WebSocket')) {
    return {
      portaDestino: 80,
      servico: 'WebSocket'
    };
  }

  return {
    portaDestino: 80,
    servico: 'Serviço padrão TCP'
  };
}

function gerarPortaOrigem() {
  return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
}