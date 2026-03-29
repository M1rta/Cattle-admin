let vacaEditando = null;

/* =========================
   AUTH (TOKEN)
   ========================= */
const token = localStorage.getItem("token");
if (!token) window.location.href = "/login";

/* =========================
   API CONFIGURADA PARA VERCEL/LOCAL
   ========================= */
const API = window.location.origin;

function headersAuth(extraHeaders = {}) {
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

/* Helper: siempre manda Authorization */
function apiFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const needsJson = method !== "GET" && method !== "HEAD";

  const headers = {
    ...(needsJson ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  return fetch(url, { ...options, headers });
}

/* ====== PUNTOS POR FINCA ====== */
const fincas = {
  A: [[8.876252, -83.069089], [8.875804, -83.068800], [8.875367, -83.069395], [8.876471, -83.068528], [8.874840, -83.069937], [8.875060, -83.068725], [8.874546, -83.069723]],
  B: [[8.872358, -83.070536], [8.872296, -83.070112], [8.872339, -83.068964], [8.871851, -83.068400], [8.871387, -83.068394]],
  C: [[8.871106, -83.071544], [8.870968, -83.072222], [8.870736, -83.071272], [8.871187, -83.070955]],
  D: [[8.869740, -83.073832], [8.868701, -83.074086], [8.869765, -83.073389], [8.869371, -83.074568]],
  E: [[8.869461, -83.072277], [8.869506, -83.071687], [8.869215, -83.072765], [8.869679, -83.070608]],
  F: [[8.8744, -83.0669], [8.8741, -83.0665], [8.8737, -83.0668], [8.8740, -83.0672]],
  L: [[8.8763, -83.0669], [8.8761, -83.0665], [8.8757, -83.0668], [8.8760, -83.0672]]
};

/* ====== UI BINDING ====== */
function bindUI() {
  const tipo = document.getElementById("tipo");
  if (tipo) tipo.addEventListener("change", toggleCampoCria);

  const editTipo = document.getElementById("edit-tipo");
  if (editTipo) editTipo.addEventListener("change", toggleCampoCriaEditar);

  const btnAsignar = document.getElementById("btn-asignar-vacuna");
  if (btnAsignar) {
    btnAsignar.type = "button";
    btnAsignar.onclick = asignarVacuna;
  }

  const btnCancelar = document.getElementById("btn-cancelar");
  if (btnCancelar) btnCancelar.onclick = cerrarModal;

  const btnActualizar = document.getElementById("btn-actualizar");
  if (btnActualizar) btnActualizar.onclick = actualizarVaca;

  toggleCampoCria();
  toggleCampoCriaEditar();
}

function toggleCampoCria() {
  const tipo = document.getElementById("tipo");
  const contenedorCria = document.getElementById("contenedor-cria");
  const cria = document.getElementById("cria");
  if (!tipo || !contenedorCria || !cria) return;
  contenedorCria.style.display = (tipo.value || "").toLowerCase() === "vaca" ? "block" : "none";
}

function toggleCampoCriaEditar() {
  const tipo = document.getElementById("edit-tipo");
  const contenedorCria = document.getElementById("contenedor-edit-cria");
  const cria = document.getElementById("edit-cria");
  if (!tipo || !contenedorCria || !cria) return;
  contenedorCria.style.display = (tipo.value || "").toLowerCase() === "vaca" ? "block" : "none";
}

/* ====== MAPA ====== */
let map = L.map("map").setView([8.875710, -83.067468], 15);
L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Tiles © Esri" }).addTo(map);
let markers = [];

function mostrarEnMapa(ganado) {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
  
  // Si tu Python devuelve un objeto, extraemos la lista
  const lista = Array.isArray(ganado) ? ganado : (ganado.ganado || []);

  lista.forEach((vaca) => {
    // Si no hay lat o lng, no puede poner el signo de ubicación
    if (!vaca.lat || !vaca.lng) return;

    const marker = L.marker([vaca.lat, vaca.lng]).addTo(map);
    
    // IMPORTANTE: Usamos vaca.id porque así lo definiste en ganado_service.py
    marker.bindPopup(`
      <b>${vaca.nombre}</b><br>
      Tipo: ${vaca.tipo || "N/A"}<br>
      Finca: ${vaca.finca_actual}<br><br>
      <button type="button" onclick='abrirModal(${JSON.stringify(vaca)})'>Editar</button>
    `);
    markers.push(marker);
  });
}

function obtenerPuntoLibre(finca, ganadoActual) {
  const puntos = fincas[finca];
  if (!puntos) return null;
  const usados = (ganadoActual || []).filter((v) => (v.finca_actual || "").toUpperCase() === finca && v.lat && v.lng).map((v) => `${v.lat},${v.lng}`);
  for (let p of puntos) {
    if (!usados.includes(`${p[0]},${p[1]}`)) return { lat: p[0], lng: p[1] };
  }
  return { lat: puntos[0][0], lng: puntos[0][1] };
}

/* ====== CARGAR GANADO ====== */
function cargarGanado() {
  apiFetch(`${API}/ganado`)
    .then((res) => res.json())
    .then((data) => {
      // Tu Python devuelve una lista directamente o un objeto con la lista
      window.ganadoGlobal = Array.isArray(data) ? data : data.ganado || [];
      mostrarEnMapa(window.ganadoGlobal);
      actualizarContadoresPanel();
    })
    .catch(err => console.error("Error cargando ganado:", err));
}

/* ====== AGREGAR GANADO (Ajustado a ganado_service.py) ====== */
function agregarGanado() {
  const finca = (document.getElementById("finca").value || "").toUpperCase();
  const tipo = document.getElementById("tipo").value;
  const nombre = document.getElementById("nombre").value;
  const color = document.getElementById("color").value;
  const edad = document.getElementById("edad").value;
  const criaValue = document.getElementById("cria").value;

  const punto = obtenerPuntoLibre(finca, window.ganadoGlobal || []);

const data = {
    nombre: nombre,
    tipo: tipo,
    color: color,
    edad: parseInt(edad) || 0, // Asegura que sea número
    tiene_cria: parseInt(criaValue) || 0,
    finca_actual: finca,
    lat: parseFloat(punto.lat), // Asegura que sea número decimal
    lng: parseFloat(punto.lng)  // Asegura que sea número decimal
};

  // Validaciones para evitar el Error 400 de tu Python
  if (!data.nombre || !data.tipo || !data.color || isNaN(data.edad) || !data.finca_actual) {
    return alert("Faltan campos obligatorios");
  }

  apiFetch(`${API}/ganado`, {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(async (res) => {
      const resData = await res.json();
      if(!res.ok) throw new Error(resData.error || "Error al guardar");
      return resData;
  })
  .then((resData) => {
    limpiarFormulario();
    cargarGanado();
    alert(resData.message || "Ganado guardado correctamente");
  })
  .catch(err => alert("Error: " + err.message));
}

function limpiarFormulario() {

  ["nombre", "edad", "color", "cria"].forEach((id) => {
      const el = document.getElementById(id);
      if(el) el.value = "";
  });

  const selectTipo = document.getElementById("tipo");
  if (selectTipo) selectTipo.selectedIndex = 0;

  const selectFinca = document.getElementById("finca");
  if (selectFinca) selectFinca.selectedIndex = 0;

  toggleCampoCria();
}

/* ====== ELIMINAR (Ajustado a g.id) ====== */
function eliminarGanado(id) {
  if(!confirm("¿Seguro que quieres eliminar este animal?")) return;
  apiFetch(`${API}/ganado/${id}`, { method: "DELETE" })
    .then(async (res) => {
        const resData = await res.json();
        if(!res.ok) throw new Error(resData.error || "No se pudo eliminar");
        alert(resData.message || "Eliminado");
        cargarGanado();
    })
    .catch(err => alert(err.message));
}

/* ====== MODAL EDITAR ====== */
function abrirModal(vaca) {
  vacaEditando = vaca;
  document.getElementById("edit-nombre").value = vaca.nombre || "";
  document.getElementById("edit-color").value = vaca.color || "";
  document.getElementById("edit-edad").value = vaca.edad || "";
  document.getElementById("edit-cria").value = vaca.tiene_cria ?? 0;
  document.getElementById("edit-finca").value = (vaca.finca_actual || "A").toUpperCase();
  document.getElementById("edit-tipo").value = vaca.tipo || "Vaca";
  toggleCampoCriaEditar();
  document.getElementById("modal").classList.add("activo");
}

function cerrarModal() {
  document.getElementById("modal").classList.remove("activo");
  vacaEditando = null;
}

function actualizarVaca() {
  if (!vacaEditando) return;
  const id = vacaEditando.id; // Tu Python envía 'id'
  
  const data = {
    nombre: document.getElementById("edit-nombre").value,
    tipo: document.getElementById("edit-tipo").value,
    color: document.getElementById("edit-color").value,
    edad: parseInt(document.getElementById("edit-edad").value) || 0,
    tiene_cria: parseInt(document.getElementById("edit-cria").value) || 0,
    finca_actual: document.getElementById("edit-finca").value.toUpperCase()
  };

  apiFetch(`${API}/ganado/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
  .then(async (res) => {
      const resData = await res.json();
      if(!res.ok) throw new Error(resData.error || "Error al actualizar");
      alert(resData.message || "Actualizado correctamente");
      cerrarModal();
      cargarGanado();
  })
  .catch(err => alert(err.message));
}

/* ====== PANEL LATERAL ====== */
function abrirPanel() {
  document.getElementById("panel-ganado").classList.remove("hidden");
  volverResumen();
}

function cerrarPanel() {
  document.getElementById("panel-ganado").classList.add("hidden");
}

function volverResumen() {
  document.getElementById("panel-titulo").innerText = "Ganado";
  document.getElementById("panel-resumen").classList.remove("hidden");
  document.getElementById("panel-lista-ganado").classList.add("hidden");
  document.getElementById("panel-vacunas").classList.add("hidden");
}

function actualizarContadoresPanel() {
  const data = window.ganadoGlobal || [];
  const totalEl = document.getElementById("count-total");
  if(totalEl) totalEl.innerText = data.length;
  // Puedes agregar más contadores aquí filtrando data
}

function abrirListaGanado() {
  document.getElementById("panel-lista-ganado").classList.remove("hidden");
  document.getElementById("panel-resumen").classList.add("hidden");
  renderListaPanel(window.ganadoGlobal || []);
}

function renderListaPanel(items) {
  const cont = document.getElementById("lista-panel-ganado");
  if(!cont) return;
  cont.innerHTML = "";
  items.forEach((g) => {
    const div = document.createElement("div");
    div.className = "item-animal";
    div.innerHTML = `
      <b>${g.nombre}</b><br>
      <span style="font-size:12px;">Finca: ${g.finca_actual} | Tipo: ${g.tipo}</span>
      <div class="item-row">
        <button type="button" class="btn-delete" onclick="eliminarGanado('${g.id}')">Eliminar</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

/* ====== VACUNAS ====== */
function abrirVacunas() {
  document.getElementById("panel-vacunas").classList.remove("hidden");
  document.getElementById("panel-resumen").classList.add("hidden");
  llenarSelectAnimalesVacunas();
  cargarCatalogoVacunas();
}

function llenarSelectAnimalesVacunas() {
  const sel = document.getElementById("vac-animal");
  if(!sel) return;
  sel.innerHTML = `<option value="">Seleccione un animal</option>`;
  (window.ganadoGlobal || []).forEach((g) => {
    sel.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
  });
}

function cargarCatalogoVacunas() {
  apiFetch(`${API}/vacunas`)
    .then(res => res.json())
    .then(vacs => {
      const sel = document.getElementById("vac-select");
      if(!sel) return;
      sel.innerHTML = `<option value="">Seleccione vacuna</option>`;
      vacs.forEach(v => sel.innerHTML += `<option value="${v.id}">${v.nombre}</option>`);
    });
}

async function asignarVacuna() {
  const animalId = document.getElementById("vac-animal").value;
  const vacunaId = document.getElementById("vac-select").value;
  const fecha = document.getElementById("vacuna-fecha").value;

  if (!animalId || !vacunaId) return alert("Selecciona animal y vacuna");

  try {
    const res = await apiFetch(`${API}/ganado/${animalId}/vacunas`, {
      method: "POST",
      body: JSON.stringify({ vacuna_ids: [vacunaId], fecha })
    });
    const resData = await res.json();
    if(!res.ok) throw new Error(resData.error || "Error");
    alert(resData.message || "Vacuna asignada");
    document.getElementById("vac-select").value = "";
  } catch (err) {
    alert(err.message);
  }
}

/* ====== INIT ====== */
(function init() {
  bindUI();
  cargarGanado();
})();

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}