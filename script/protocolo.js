export function identificarEntrada(texto) {
  const entrada = texto.trim().toLowerCase();

  if (entrada.includes('@')) {
    return 'email';
  }

  if (
    entrada.includes('http') ||
    entrada.includes('www') ||
    entrada.includes('.com') ||
    entrada.includes('.br') ||
    entrada.includes('.org')
  ) {
    return 'http_request';
  }

  return 'chat';
}

export function criarObjetoAplicacao(tipo, entrada, usuario) {
  if (tipo === 'email') {
    return {
      camada: 'Aplicação',
      tipo: 'email',
      remetente: usuario,
      destinatario: entrada,
      protocolo: 'SMTP/POP3/IMAP',
      descricao: 'Protocolos usados para envio, recebimento e sincronização de e-mails.',
      timestamp: new Date().toLocaleString('pt-BR')
    };
  }

  if (tipo === 'http_request') {
    return {
      camada: 'Aplicação',
      tipo: 'http_request',
      metodo: 'GET',
      hostIP: entrada,
      protocolo: 'HTTP/HTTPS',
      descricao: 'Protocolos usados para acessar páginas e serviços web.',
      usuario: usuario,
      timestamp: new Date().toLocaleString('pt-BR')
    };
  }

  return {
    camada: 'Aplicação',
    tipo: 'chat',
    usuario: usuario,
    mensagem: entrada,
    protocolo: 'WebSocket',
    descricao: 'Protocolo usado para comunicação em tempo real.',
    timestamp: new Date().toLocaleString('pt-BR')
  };
}

export function criarObjetoArquivo(file, usuario) {
  return {
    camada: 'Aplicação',
    tipo: 'arquivo',
    nome: file.name,
    tamanho: formatarTamanhoArquivo(file.size),
    formato: file.type || 'Formato desconhecido',
    remetente: usuario,
    protocolo: 'HTTP Upload',
    descricao: 'Simulação de envio de arquivo pela camada de aplicação.',
    timestamp: new Date().toLocaleString('pt-BR')
  };
}

function formatarTamanhoArquivo(bytes) {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}