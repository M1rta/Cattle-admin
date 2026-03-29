/* =======================================
   LÓGICA PARA CAMBIAR ENTRE PANELES
   ======================================= */
function cambiarPanel(panelDestino) {
  // 1. Ocultamos todos los paneles de la derecha
  document.querySelectorAll('.right-pane').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // 2. Mostramos solo el que el usuario pidió
  document.getElementById('panel-' + panelDestino).classList.add('active');
}

/* =======================================
   CONEXIÓN CON EL API DE FLASK
   ======================================= */
const API = window.location.origin;

async function procesarLogin() {
  // Aquí debes pegar el fetch que ya tenías para iniciar sesión
  // y que guardaba el token en el localStorage.
  
  alert("Aquí va la conexión de Login con Python");
  // window.location.href = "/index"; 
}

async function procesarRegistro() {
  // Aquí debes pegar el fetch que ya tenías para registrar un usuario nuevo
  
  alert("Aquí va la conexión de Registro con Python");
}