import { gerarHashMD5 } from './enlace.js';

export function processarCamadaFisica(frameEnlace) {
  const dadosString = JSON.stringify(frameEnlace.dados);

  const crcCalculado = gerarHashMD5(dadosString);

  const integridadeOk = crcCalculado === frameEnlace.crc;

  const objetoString = JSON.stringify(frameEnlace, null, 2);

  const camadaFisica = {
    camada: 'Física',
    objetoRecebido: frameEnlace,
    crcRecebido: frameEnlace.crc,
    crcCalculado: crcCalculado,
    integridadeOk: integridadeOk,
    status: integridadeOk
      ? 'Mensagem íntegra. Nenhum frame foi perdido ou alterado.'
      : 'Erro de integridade. Os dados recebidos foram alterados.',
    binario: converterTextoParaBinario(objetoString),
    descricao: 'A camada física valida a integridade dos dados e converte o frame em uma sequência binária para transmissão pelo meio físico.'
  };

  return camadaFisica;
}

function converterTextoParaBinario(texto) {
  return texto
    .split('')
    .map(function (caractere) {
      return caractere
        .charCodeAt(0)
        .toString(2)
        .padStart(8, '0');
    })
    .join(' ');
}