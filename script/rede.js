import { points } from './points.js';

export function criarObjetoRede(camadaAplicacao, camadaDNS = null) {
  const roteadorOrigemId = 'R1';

  const textoBase = obterTextoBase(camadaAplicacao);
  const roteadorDestinoId = escolherRoteadorDestino(textoBase, roteadorOrigemId);

  const rotaIds = encontrarRota(roteadorOrigemId, roteadorDestinoId);

  const rota = rotaIds.map(function (id) {
    const roteador = buscarRoteadorPorId(id);
    return roteador ? roteador.ip : null;
  }).filter(Boolean);

  const roteadorOrigem = buscarRoteadorPorId(roteadorOrigemId);
  const roteadorDestino = buscarRoteadorPorId(roteadorDestinoId);

  const ttlInicial = Math.max(6, rota.length + 2);
  const resultadoRota = simularRota(rota, ttlInicial);

  return {
    camada: 'Rede',
    ipOrigem: roteadorOrigem ? roteadorOrigem.ip : '10.0.0.1',
    ipDestino: roteadorDestino ? roteadorDestino.ip : '10.0.0.9',
    roteadorOrigem: roteadorOrigemId,
    roteadorDestino: roteadorDestinoId,
    rota: rota,
    rotaIds: rotaIds,
    ttlInicial: ttlInicial,
    ttlFinal: resultadoRota.ttlFinal,
    saltosPercorridos: resultadoRota.saltosPercorridos,
    entregue: resultadoRota.entregue,
    dnsResolvido: camadaDNS ? camadaDNS.ip : null,
    descricao: 'A camada de rede define os endereços IP, calcula a rota do pacote e controla o TTL.'
  };
}

function obterTextoBase(camadaAplicacao) {
  if (camadaAplicacao.tipo === 'http_request') {
    return camadaAplicacao.hostIP;
  }

  if (camadaAplicacao.tipo === 'email') {
    return camadaAplicacao.destinatario;
  }

  if (camadaAplicacao.tipo === 'arquivo') {
    return camadaAplicacao.nome;
  }

  if (camadaAplicacao.tipo === 'chat') {
    return camadaAplicacao.mensagem;
  }

  return 'rota-padrao';
}

function escolherRoteadorDestino(texto, roteadorOrigemId) {
  const roteadoresAtivos = points.filter(function (roteador) {
    return roteador.ativo && roteador.id !== roteadorOrigemId;
  });

  if (roteadoresAtivos.length === 0) {
    return 'R9';
  }

  const numero = gerarNumeroPorTexto(texto);
  const indice = numero % roteadoresAtivos.length;

  return roteadoresAtivos[indice].id;
}

function gerarNumeroPorTexto(texto) {
  let total = 0;

  for (let i = 0; i < texto.length; i++) {
    total += texto.charCodeAt(i);
  }

  return total;
}

function encontrarRota(origemId, destinoId) {
  const fila = [[origemId]];
  const visitados = new Set();

  while (fila.length > 0) {
    const caminhoAtual = fila.shift();
    const roteadorAtualId = caminhoAtual[caminhoAtual.length - 1];

    if (roteadorAtualId === destinoId) {
      return caminhoAtual;
    }

    if (visitados.has(roteadorAtualId)) {
      continue;
    }

    visitados.add(roteadorAtualId);

    const roteadorAtual = buscarRoteadorPorId(roteadorAtualId);

    if (!roteadorAtual || !roteadorAtual.ativo) {
      continue;
    }

    roteadorAtual.conexoes.forEach(function (vizinhoId) {
      const vizinho = buscarRoteadorPorId(vizinhoId);

      if (!vizinho || !vizinho.ativo) {
        return;
      }

      if (!visitados.has(vizinhoId)) {
        fila.push([...caminhoAtual, vizinhoId]);
      }
    });
  }

  return ['R1', 'R2', 'R5', 'R9'];
}

function buscarRoteadorPorId(id) {
  return points.find(function (roteador) {
    return roteador.id === id;
  });
}

function simularRota(rota, ttlInicial) {
  let ttl = ttlInicial;
  const saltosPercorridos = [];

  for (let i = 0; i < rota.length; i++) {
    if (ttl <= 0) {
      return {
        entregue: false,
        ttlFinal: ttl,
        saltosPercorridos: saltosPercorridos
      };
    }

    saltosPercorridos.push({
      salto: i + 1,
      ip: rota[i],
      ttlAntes: ttl,
      ttlDepois: ttl - 1
    });

    ttl--;
  }

  return {
    entregue: true,
    ttlFinal: ttl,
    saltosPercorridos: saltosPercorridos
  };
}