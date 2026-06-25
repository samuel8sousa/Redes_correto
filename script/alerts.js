export function mostrarAlerta(mensagem, tipo = 'sucesso') {
  const alerta = document.getElementById('alerta');

  if (!alerta) return;

  alerta.textContent = mensagem;
  alerta.className = `alerta ${tipo}`;

  setTimeout(function () {
    alerta.className = 'alerta escondido';
  }, 3000);
}