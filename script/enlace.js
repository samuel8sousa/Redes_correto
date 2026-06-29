import CryptoJS from 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/+esm';

export function criarFrameEnlace(dadosRecebidos) {
  const dadosString = JSON.stringify(dadosRecebidos);

  const frame = {
    camada: 'Enlace',
    frameId: gerarFrameId(),
    macOrigem: obterMacOrigemSimulado(),
    macDestino: gerarMacFicticio(),
    tipo: 'IPv4',
    dados: dadosRecebidos,
    crc: gerarHashMD5(dadosString),
    descricao: 'A camada de enlace organiza os dados em frames, define endereços MAC e adiciona um CRC para verificação de integridade.'
  };

  return frame;
}

export function gerarHashMD5(texto) {
  return CryptoJS.MD5(texto).toString();
}

function gerarFrameId() {
  const contadorAtual = Number(localStorage.getItem('contadorFrameOsi')) || 1;

  const frameId = `F${String(contadorAtual).padStart(3, '0')}`;

  localStorage.setItem('contadorFrameOsi', contadorAtual + 1);

  return frameId;
}

function obterMacOrigemSimulado() {
  let macOrigem = localStorage.getItem('macOrigemOsi');

  if (!macOrigem) {
    macOrigem = gerarMacFicticio();
    localStorage.setItem('macOrigemOsi', macOrigem);
  }

  return macOrigem;
}

function gerarMacFicticio() {
  const partes = [];

  for (let i = 0; i < 6; i++) {
    const numero = Math.floor(Math.random() * 256);
    const hexadecimal = numero.toString(16).padStart(2, '0').toUpperCase();

    partes.push(hexadecimal);
  }

  return partes.join(':');
}