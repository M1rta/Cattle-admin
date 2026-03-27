let vacaEditando = null;

/* =========================
   AUTH (TOKEN)
   ========================= */
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

/* =========================
   API
   ========================= */
const API = "http://127.0.0.1:5000";

function headersAuth(extraHeaders = {}) {
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

//Console log to trace refresh
window.addEventListener("beforeunload", () => {
  console.trace("Page is navigating / reloading");
});

//Console log to trace hidden property being triggered
const panelGanado = document.getElementById("panel-ganado");
const panelVac = document.getElementById("panel-vacunas");

function logPanels(tag) {
  console.log(tag, {
    panelGanadoHidden: panelGanado?.classList.contains("hidden"),
    panelVacHidden: panelVac?.classList.contains("hidden"),
  });
}

document.addEventListener("visibilitychange", () => console.log("visibilitychange", document.visibilityState));
window.addEventListener("pageshow", () => console.log("pageshow"));

//Console log to trace who changes panel visibility
function panelState(tag) {
  console.log(tag, {
    panelGanadoHidden: panelGanado?.classList.contains("hidden"),
    panelVacHidden: panelVac?.classList.contains("hidden"),
  });
}

// Log whenever class changes on either panel
const obs = new MutationObserver((mutations) => {
  for (const m of mutations) {
    console.log("MUTATION", m.target.id, m.attributeName, m.target.getAttribute(m.attributeName));
  }
});

if (panelGanado) obs.observe(panelGanado, { attributes: true, attributeFilter: ["class", "style", "hidden"] });
if (panelVac) obs.observe(panelVac, { attributes: true, attributeFilter: ["class", "style", "hidden"] });

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

/* ====== PUNTOS POR FINCA (los tuyos) ====== */
const fincas = {
  A: [
    [8.876252, -83.069089],
    [8.875804, -83.068800],
    [8.875367, -83.069395],
    [8.876471, -83.068528],
    [8.874840, -83.069937],
    [8.875060, -83.068725],
    [8.874546, -83.069723]
  ],
  B: [
    [8.872358, -83.070536],
    [8.872296, -83.070112],
    [8.872339, -83.068964],
    [8.871851, -83.068400],
    [8.871387, -83.068394]
  ],
  C: [
    [8.871106, -83.071544],
    [8.870968, -83.072222],
    [8.870736, -83.071272],
    [8.871187, -83.070955]
  ],
  D: [
    [8.869740, -83.073832],
    [8.868701, -83.074086],
    [8.869765, -83.073389],
    [8.869371, -83.074568]
  ],
  E: [
    [8.869461, -83.072277],
    [8.869506, -83.071687],
    [8.869215, -83.072765],
    [8.869679, -83.070608]
  ],
  F: [
    [8.8744, -83.0669],
    [8.8741, -83.0665],
    [8.8737, -83.0668],
    [8.8740, -83.0672]
  ],
  L: [
    [8.8763, -83.0669],
    [8.8761, -83.0665],
    [8.8757, -83.0668],
    [8.8760, -83.0672]
  ]
};

/* =========================
   BLINDAJE ANTI-RECARGA
   ========================= */

// 1) Evita submits dentro del panel vacunas
document.addEventListener(
  "submit",
  (ev) => {
    const panelVac = document.getElementById("panel-vacunas");
    if (panelVac && panelVac.contains(ev.target)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  },
  true
);

// 2) Evita Enter dentro del panel vacunas (dispara submit en algunos casos)
document.addEventListener(
  "keydown",
  (ev) => {
    if (ev.key !== "Enter") return;
    const panelVac = document.getElementById("panel-vacunas");
    if (panelVac && !panelVac.classList.contains("hidden") && panelVac.contains(ev.target)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  },
  true
);

// 3) Fuerza todos los botones dentro del panel a type="button"
function forzarBotonesPanelAButton() {
  const panel = document.getElementById("panel-ganado");
  if (!panel) return;
  panel.querySelectorAll("button").forEach((b) => (b.type = "button"));
}

//Function for click listener
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

  const btnSalir = document.getElementById("salir");
  if (btnSalir) btnSalir.type = "button";

  const btnCancelar = document.getElementById("btn-cancelar");
  if (btnCancelar) btnCancelar.onclick = cerrarModal;

  const btnActualizar = document.getElementById("btn-actualizar");
  if (btnActualizar) btnActualizar.onclick = actualizarVaca;

  toggleCampoCria();
  toggleCampoCriaEditar();
}

//funcion despliegue de cria
function toggleCampoCria() {
  const tipo = document.getElementById("tipo");
  const contenedorCria = document.getElementById("contenedor-cria");
  const cria = document.getElementById("cria");

  if (!tipo || !contenedorCria || !cria) return;

  if ((tipo.value || "").toLowerCase() === "vaca") {
    contenedorCria.style.display = "block";
  } else {
    contenedorCria.style.display = "none";
    cria.value = "";
  }
}

function toggleCampoCriaEditar() {
  const tipo = document.getElementById("edit-tipo");
  const contenedorCria = document.getElementById("contenedor-edit-cria");
  const cria = document.getElementById("edit-cria");

  if (!tipo || !contenedorCria || !cria) return;

  if ((tipo.value || "").toLowerCase() === "vaca") {
    contenedorCria.style.display = "block";
  } else {
    contenedorCria.style.display = "none";
    cria.value = "";
  }
}

/* ====== MAPA ====== */
let map = L.map("map").setView([8.875710, -83.067468], 15);

L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19, attribution: "Tiles © Esri" }
).addTo(map);

let markers = [];

function mostrarEnMapa(ganado) {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  (ganado || []).forEach((vaca) => {
    if (!vaca.lat || !vaca.lng) return;

    const marker = L.marker([vaca.lat, vaca.lng]).addTo(map);
    marker.bindPopup(`
      <b>${vaca.nombre}</b><br>
      Tipo: ${vaca.tipo || "N/A"}<br>
      Color: ${vaca.color}<br>
      Edad: ${vaca.edad}<br>
      Finca: ${vaca.finca_actual}<br><br>
      <button type="button" onclick='abrirModal(${JSON.stringify(vaca)})'>Editar</button>
    `);

    markers.push(marker);
  });
}

/* ====== UTILIDAD: PUNTO LIBRE EN FINCA ====== */
function obtenerPuntoLibre(finca, ganadoActual) {
  const puntos = fincas[finca];
  if (!puntos || puntos.length === 0) return null;

  const usados = (ganadoActual || [])
    .filter((v) => (v.finca_actual || "").toUpperCase() === finca && v.lat && v.lng)
    .map((v) => `${v.lat},${v.lng}`);

  for (let p of puntos) {
    const clave = `${p[0]},${p[1]}`;
    if (!usados.includes(clave)) return { lat: p[0], lng: p[1] };
  }

  const random = puntos[Math.floor(Math.random() * puntos.length)];
  return { lat: random[0], lng: random[1] };
}

/* ====== CARGAR GANADO ====== */
function cargarGanado() {
  apiFetch(`${API}/ganado`)
    .then((res) => res.json())
    .then((data) => {
      window.ganadoGlobal = data || [];
      mostrarEnMapa(window.ganadoGlobal);
      actualizarContadoresPanel();

      // si vacunas está abierto, refresca sin cerrar
      const panelVac = document.getElementById("panel-vacunas");
      if (panelVac && !panelVac.classList.contains("hidden")) {
        llenarSelectAnimalesVacunas();
        cargarVacunasAsignadas();
      }
    })
    .catch(() => {
      window.ganadoGlobal = [];
      actualizarContadoresPanel();
    });
}

/* ====== AGREGAR ====== */
function agregarGanado() {
  const finca = (document.getElementById("finca").value || "").toUpperCase();
  const tipo = document.getElementById("tipo").value;
  const criaValue = document.getElementById("cria").value;

  const punto = obtenerPuntoLibre(finca, window.ganadoGlobal || []);
  if (!punto) return alert("Esa finca no tiene puntos definidos");

  const data = {
    nombre: document.getElementById("nombre").value,
    tipo: tipo,
    color: document.getElementById("color").value,
    edad: parseInt(document.getElementById("edad").value),
    tiene_cria: tipo.toLowerCase() === "vaca" ? parseInt(criaValue || 0) : 0,
    finca_actual: finca,
    lat: punto.lat,
    lng: punto.lng
  };

  if (!data.nombre || !data.tipo || !data.color || !data.edad || !data.finca_actual) {
    return alert("Completa todos los campos");
  }

  if (tipo.toLowerCase() === "vaca" && criaValue === "") {
    return alert("Debes indicar si la vaca tiene cría o no");
  }

  apiFetch(`${API}/ganado`, {
    method: "POST",
    headers: headersAuth(),
    body: JSON.stringify(data)
  }).then(() => {
    limpiarFormulario();
    toggleCampoCria();
    cargarGanado();
  });
}

function limpiarFormulario() {
  ["nombre", "edad"].forEach((id) => (document.getElementById(id).value = ""));
  ["tipo", "color", "cria", "finca"].forEach((id) => (document.getElementById(id).value = ""));
  toggleCampoCria();
}

/* ====== ELIMINAR ====== */
function eliminarGanado(id) {
  apiFetch(`${API}/ganado/${id}`, { method: "DELETE", headers: headersAuth() })
    .then(() => cargarGanado());
}

/* ====== MOVER FINCA ====== */
function moverFinca(id, inputId) {
  const nuevaFinca = (document.getElementById(inputId).value || "").toUpperCase();
  const punto = obtenerPuntoLibre(nuevaFinca, window.ganadoGlobal || []);
  if (!punto) return alert("Esa finca no tiene puntos definidos");

  apiFetch(`${API}/ganado/${id}`, {
    method: "PUT",
    headers: headersAuth(),
    body: JSON.stringify({ finca_actual: nuevaFinca, lat: punto.lat, lng: punto.lng })
  }).then(() => cargarGanado());
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

  const modal = document.getElementById("modal");

  requestAnimationFrame(() => {
    modal.classList.add("activo");
    document.body.style.overflow = "hidden";
  });
}

function cerrarModal() {
  document.getElementById("modal").classList.remove("activo");
  document.body.style.overflow = "";
  vacaEditando = null;
}

function actualizarVaca() {
  if (!vacaEditando) return;

  const nuevaFinca = (document.getElementById("edit-finca").value || "").toUpperCase();
  const tipo = document.getElementById("edit-tipo").value;
  const criaValue = document.getElementById("edit-cria").value;

  const punto = obtenerPuntoLibre(nuevaFinca, window.ganadoGlobal || []);
  if (!punto) return alert("Esa finca no tiene puntos definidos");

  const data = {
    nombre: document.getElementById("edit-nombre").value,
    tipo: tipo,
    color: document.getElementById("edit-color").value,
    edad: parseInt(document.getElementById("edit-edad").value),
    tiene_cria: tipo.toLowerCase() === "vaca" ? parseInt(criaValue || 0) : 0,
    finca_actual: nuevaFinca,
    lat: punto.lat,
    lng: punto.lng
  };

  if (tipo.toLowerCase() === "vaca" && criaValue === "") {
    return alert("Debes indicar si la vaca tiene cría o no");
  }

  apiFetch(`${API}/ganado/${vacaEditando.id}`, {
    method: "PUT",
    headers: headersAuth(),
    body: JSON.stringify(data)
  }).then(() => {
    cerrarModal();
    cargarGanado();
  });
}

/* ====== PANEL ====== */
function abrirPanel() {
  const p = document.getElementById("panel-ganado");
  p.classList.remove("hidden");
  forzarBotonesPanelAButton();
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

/* ====== CONTADORES ====== */
function actualizarContadoresPanel() {
  const data = window.ganadoGlobal || [];

  const total = data.length;
  const vacas = data.filter((x) => (x.tipo || "").toLowerCase() === "vaca").length;
  const toros = data.filter((x) => (x.tipo || "").toLowerCase() === "toro").length;
  const terneras = data.filter((x) => (x.tipo || "").toLowerCase() === "ternera").length;
  const terneros = data.filter((x) => (x.tipo || "").toLowerCase() === "ternero").length;
  const destetados = data.filter((x) => (x.tipo || "").toLowerCase() === "destetado").length;

  document.getElementById("count-total").innerText = total;
  document.getElementById("count-vacas").innerText = vacas;
  document.getElementById("count-toros").innerText = toros;
  document.getElementById("count-terneras").innerText = terneras;
  document.getElementById("count-terneros").innerText = terneros;
  document.getElementById("count-destetados").innerText = destetados;
}

/* ====== LISTA EN PANEL ====== */
function abrirListaGanado() {
  document.getElementById("panel-titulo").innerText = "Ganado";
  document.getElementById("panel-resumen").classList.add("hidden");
  document.getElementById("panel-vacunas").classList.add("hidden");
  document.getElementById("panel-lista-ganado").classList.remove("hidden");
  renderListaPanel(window.ganadoGlobal || []);
}

function abrirListaFiltrada(tipo) {
  document.getElementById("panel-titulo").innerText = tipo;
  document.getElementById("panel-resumen").classList.add("hidden");
  document.getElementById("panel-vacunas").classList.add("hidden");
  document.getElementById("panel-lista-ganado").classList.remove("hidden");

  const lista = (window.ganadoGlobal || []).filter((x) => (x.tipo || "") === tipo);
  renderListaPanel(lista);
}

function renderListaPanel(items) {
  const cont = document.getElementById("lista-panel-ganado");
  cont.innerHTML = "";

  if (!items.length) {
    cont.innerHTML = `<div style="opacity:.7; padding:10px;">No hay animales aquí.</div>`;
    return;
  }

  items.forEach((g) => {
    const inputId = `mover-${g.id}`;
    const div = document.createElement("div");
    div.className = "item-animal";

    div.innerHTML = `
      <b>${g.nombre}</b><br>
      <span style="opacity:.75; font-size:12px;">
        Tipo: ${g.tipo || "N/A"} • Finca: ${g.finca_actual || "?"} • Edad: ${g.edad || "?"}
      </span>

      <div class="item-row">
        <input id="${inputId}" placeholder="Mover a finca (A,B,C...)" aria-label="Mover a finca" />
        <button type="button" onclick="moverFinca(${g.id}, '${inputId}')">Mover</button>
        <button type="button" class="btn-delete" onclick="eliminarGanado(${g.id})">Eliminar</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

/* ====== VACUNAS ====== */
function abrirVacunas() {
  document.getElementById("panel-titulo").innerText = "Vacunas";
  document.getElementById("panel-resumen").classList.add("hidden");
  document.getElementById("panel-lista-ganado").classList.add("hidden");
  document.getElementById("panel-vacunas").classList.remove("hidden");

  forzarBotonesPanelAButton();

  const fechaInput = document.getElementById("vacuna-fecha");
  if (fechaInput && !fechaInput.value) fechaInput.value = new Date().toISOString().slice(0, 10);

  llenarSelectAnimalesVacunas();
  cargarCatalogoVacunas();
  cargarVacunasAsignadas();
}

function llenarSelectAnimalesVacunas() {
  const sel = document.getElementById("vac-animal");
  sel.innerHTML = `<option value="">Seleccione un animal</option>`;

  (window.ganadoGlobal || []).forEach((g) => {
    sel.innerHTML += `<option value="${g.id}">${g.nombre} (Tipo: ${g.tipo || "N/A"} / Finca: ${g.finca_actual || "?"})</option>`;
  });

  sel.onchange = () => cargarVacunasAsignadas();
}

function cargarCatalogoVacunas() {
  const sel = document.getElementById("vac-select");
  sel.innerHTML = `<option value="">Cargando vacunas...</option>`;

  apiFetch(`${API}/vacunas`)
    .then((res) => res.json())
    .then((vacs) => {
      sel.innerHTML = `<option value="">Seleccione vacuna</option>`;
      (vacs || []).forEach((v) => {
        sel.innerHTML += `<option value="${v.id}">${v.nombre}</option>`;
      });
    })
    .catch(() => {
      sel.innerHTML = `<option value="">(Falta GET /vacunas en backend)</option>`;
    });
}

/* ✅ NO recarga ni cierra panel */
async function asignarVacuna(ev) {
  if (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  const animalId = document.getElementById("vac-animal").value;
  const vacunaId = document.getElementById("vac-select").value;
  const fecha = document.getElementById("vacuna-fecha")?.value || null;

  if (!animalId || !vacunaId) return alert("Selecciona animal y vacuna");

  logPanels("BEFORE asignarVacuna");
  try {
    const res = await apiFetch(`${API}/ganado/${animalId}/vacunas`, {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({
        vacuna_ids: [parseInt(vacunaId)],
        fecha: fecha
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Error asignando vacuna");
    }

    await res.json();

    await cargarVacunasAsignadas();
    logPanels("AFTER cargarVacunasAsignadas");

    document.getElementById("vac-select").value = "";
  } catch (err) {
    console.error(err);
    alert("No se pudo asignar. Revisa consola / backend.");
  }
}

function cargarVacunasAsignadas() {
  const animalId = document.getElementById("vac-animal").value;
  const cont = document.getElementById("vac-asignadas");

  if (!animalId) {
    cont.innerHTML = `<div style="opacity:.7;">Selecciona un animal para ver sus vacunas.</div>`;
    return Promise.resolve();
  }

  cont.innerHTML = "Cargando...";

  return apiFetch(`${API}/ganado/${animalId}/vacunas`)
    .then((res) => res.json())
    .then((items) => {
      if (!items || !items.length) {
        cont.innerHTML = `<div style="opacity:.7;">No hay vacunas asignadas.</div>`;
        return;
      }

      cont.innerHTML = items
        .map(
          (v) => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px; border:1px solid #e5e7eb; border-radius:14px; margin-bottom:8px;">
          <div>
            <b>${v.nombre}</b><br>
            <span style="opacity:.7; font-size:12px;">Fecha: ${v.fecha || "N/A"}</span>
          </div>
          <button type="button" class="btn-delete" style="padding:8px 10px;"
            onclick="eliminarVacunaAsignada(${animalId}, ${v.asignacion_id})"
            aria-label="Eliminar vacuna">✖</button>
        </div>
      `
        )
        .join("");
    })
    .catch(() => {
      cont.innerHTML = `<div style="color:#b91c1c;">Falta implementar GET /ganado/&lt;id&gt;/vacunas en backend.</div>`;
    });
}

function eliminarVacunaAsignada(ganadoId, asignacionId) {
  apiFetch(`${API}/ganado/${ganadoId}/vacunas/${asignacionId}`, { method: "DELETE", headers: headersAuth() })
    .then(() => cargarVacunasAsignadas())
    .catch(() => alert("Falta implementar DELETE /ganado/<id>/vacunas/<asignacion_id> en backend"));
}

/* ====== INIT ====== */
(function init() {
  bindUI();
  forzarBotonesPanelAButton();
  cargarGanado();
})();

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
