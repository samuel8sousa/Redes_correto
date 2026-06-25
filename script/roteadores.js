import { criarObjetoRede } from './rede.js';

document.addEventListener('DOMContentLoaded', function () {
  const preview = document.getElementById('network-preview');
  const voltarBtn = document.getElementById('voltar-btn');

  const camadaRede = criarObjetoRede(
    {
      protocolo: 'HTTP/HTTPS',
      hostIP: 'https://ifpe.edu.br'
    },
    {
      ip: '10.0.0.9'
    }
  );

  if (preview) {
    preview.textContent = JSON.stringify(camadaRede, null, 2);
  }

  if (voltarBtn) {
    voltarBtn.addEventListener('click', function () {
      window.location.href = './index.html';
    });
  }
});

import { points } from './points.js';

document.addEventListener('DOMContentLoaded', function () {
  const networkMap = document.getElementById('network-map');
  const networkLines = document.getElementById('network-lines');
  const routeList = document.getElementById('route-list');
  const networkJson = document.getElementById('network-json');
  const packet = document.getElementById('packet');
  const voltarBtn = document.getElementById('voltar-btn');
  const animarBtn = document.getElementById('animar-rota-btn');

  const pacoteSalvo = JSON.parse(localStorage.getItem('ultimaRotaOsi'));

  const camadaRede = pacoteSalvo?.camadaRede || {
    camada: 'Rede',
    ipOrigem: '10.0.0.1',
    ipDestino: '10.0.0.9',
    rota: ['10.0.0.1', '10.0.0.2', '10.0.0.5', '10.0.0.9'],
    ttlInicial: 6,
    ttlFinal: 2
  };

  const rotaIPs = camadaRede.rota || [];

  renderizarMapa(networkMap, networkLines, rotaIPs);
  renderizarLista(routeList, rotaIPs);
  renderizarJson(networkJson, camadaRede);

  if (animarBtn) {
    animarBtn.addEventListener('click', function () {
      animarPacote(packet, rotaIPs);
    });
  }

  if (voltarBtn) {
    voltarBtn.addEventListener('click', function () {
      window.location.href = './index.html';
    });
  }
});

function renderizarMapa(networkMap, networkLines, rotaIPs) {
  if (!networkMap || !networkLines) return;

  networkMap.querySelectorAll('.router-node').forEach(node => node.remove());

  const largura = networkMap.clientWidth;
  const altura = networkMap.clientHeight;

  networkLines.setAttribute('width', largura);
  networkLines.setAttribute('height', altura);
  networkLines.innerHTML = '';

  const rotaPontos = [];

  points.forEach(point => {
    const node = document.createElement('div');
    node.className = 'router-node';

    if (!point.ativo) {
      node.classList.add('inativo');
    }

    if (rotaIPs.includes(point.ip)) {
      node.classList.add('na-rota');
    }

    node.style.left = `${point.x}px`;
    node.style.top = `${point.y}px`;

    const img = document.createElement('img');
    img.src = './assets/router.png';
    img.alt = point.nome;

    const nome = document.createElement('span');
    nome.className = 'router-label';
    nome.textContent = `${point.id} - ${point.ip}`;

    node.appendChild(img);
    node.appendChild(nome);

    if (rotaIPs.includes(point.ip)) {
      const indice = rotaIPs.indexOf(point.ip) + 1;
      const badge = document.createElement('span');
      badge.className = 'step-badge';
      badge.textContent = indice;
      node.appendChild(badge);

      rotaPontos.push(point);
    }

    networkMap.appendChild(node);
  });

  for (let i = 0; i < rotaIPs.length - 1; i++) {
    const origem = points.find(p => p.ip === rotaIPs[i]);
    const destino = points.find(p => p.ip === rotaIPs[i + 1]);

    if (!origem || !destino) continue;

    desenharLinha(networkLines, origem, destino);
  }
}

function desenharLinha(svg, origem, destino) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

  line.setAttribute('x1', origem.x);
  line.setAttribute('y1', origem.y);
  line.setAttribute('x2', destino.x);
  line.setAttribute('y2', destino.y);
  line.setAttribute('class', 'route-line');

  svg.appendChild(line);
}

function renderizarLista(routeList, rotaIPs) {
  if (!routeList) return;

  routeList.innerHTML = '';

  rotaIPs.forEach((ip, index) => {
    const point = points.find(p => p.ip === ip);

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Salto ${index + 1}:</strong>
      ${point ? point.nome : 'Roteador'} - ${ip}
    `;

    routeList.appendChild(li);
  });
}

function renderizarJson(networkJson, camadaRede) {
  if (!networkJson) return;

  networkJson.textContent = JSON.stringify(camadaRede, null, 2);
}

async function animarPacote(packet, rotaIPs) {
  if (!packet || !rotaIPs.length) return;

  const rotaPontos = rotaIPs
    .map(ip => points.find(p => p.ip === ip))
    .filter(Boolean);

  if (!rotaPontos.length) return;

  packet.classList.remove('escondido');
  packet.style.left = `${rotaPontos[0].x}px`;
  packet.style.top = `${rotaPontos[0].y}px`;

  await esperar(300);

  for (let i = 0; i < rotaPontos.length; i++) {
    const ponto = rotaPontos[i];

    packet.style.left = `${ponto.x}px`;
    packet.style.top = `${ponto.y}px`;

    await esperar(900);
  }
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}