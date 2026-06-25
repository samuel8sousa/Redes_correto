const STORAGE_KEY = 'historico_osi_lab';

export function salvarHistorico(pacote) {
  const historico = carregarHistorico();

  historico.push(pacote);

  if (historico.length > 10) {
    historico.shift();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
}

export function carregarHistorico() {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) {
    return [];
  }

  return JSON.parse(dados);
}

export function limparHistorico() {
  localStorage.removeItem(STORAGE_KEY);
}