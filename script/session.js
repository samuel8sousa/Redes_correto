import { SignJWT, decodeJwt } from 'https://cdn.jsdelivr.net/npm/jose@6/+esm';

export async function criarSessaoJWT(mensagem) {
  const payload = {
    camada: 'Sessão',
    sessionId: crypto.randomUUID(),
    message: mensagem
  };

  const secret = new TextEncoder().encode('chave-teste');

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret);

  const dadosDecodificados = decodeJwt(token);

  return {
    camada: 'Sessão',
    sessionId: payload.sessionId,
    token: token,
    payload: dadosDecodificados,
    descricao: 'A camada de sessão organiza e identifica a comunicação entre cliente e servidor.'
  };
}

export async function consultarDNS(dominio) {
  try {
    const resposta = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(dominio)}&type=A`
    );

    const dados = await resposta.json();

    const respostaDNS = dados.Answer?.find(item => item.type === 1);

    return {
      camada: 'Aplicação',
      protocolo: 'DNS',
      dominio: dominio,
      ip: respostaDNS ? respostaDNS.data : 'IP não encontrado',
      descricao: 'O DNS converte o nome de domínio em um endereço IP.'
    };

  } catch (erro) {
    return {
      camada: 'Aplicação',
      protocolo: 'DNS',
      dominio: dominio,
      ip: 'Erro ao consultar DNS',
      erro: erro.message
    };
  }
}

export function extrairDominio(texto) {
  let dominio = texto.trim().toLowerCase();

  dominio = dominio.replace('https://', '');
  dominio = dominio.replace('http://', '');
  dominio = dominio.replace('www.', '');

  dominio = dominio.split('/')[0];

  return dominio;
}