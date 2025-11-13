/* ==========================================
   Morfis Medicament — Front Demo (localStorage)
   Ahora con: Clientes, Niveles, Promociones
========================================== */

const STORAGE_KEYS = {
  productos: "mm_productos",
  ventas: "mm_ventas",
  clientes: "mm_clientes",
  niveles: "mm_niveles",
  promos: "mm_promos",
};

const qs  = (sel, ctx=document) => ctx.querySelector(sel);
const qsa = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const money = n => Number(n||0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

/* ---------- Estado ---------- */
let productos = load(STORAGE_KEYS.productos, []) || [];
let ventas     = load(STORAGE_KEYS.ventas, []) || [];
let clientes   = load(STORAGE_KEYS.clientes, []) || [];
let niveles    = load(STORAGE_KEYS.niveles, []) || [];
let promos     = load(STORAGE_KEYS.promos, []) || [];

/* ---------- Semillas ---------- */
if (productos.length === 0) {
  productos = [
    { sku: "AMX250", nombre: "Amoxicilina 250mg", categoria: "Antibiótico", presentacion: "Tabletas", precio: 85.00, stock: 20, minimo: 5, notas: "Perros y gatos." },
    { sku: "IVR10", nombre: "Ivermectina 1%", categoria: "Antiparasitario", presentacion: "Inyectable 10ml", precio: 120.00, stock: 8, minimo: 5, notas: "Consultar dosis por kg." },
    { sku: "CARP150", nombre: "Carprofeno 150mg", categoria: "Analgésico", presentacion: "Tabletas masticables", precio: 230.00, stock: 4, minimo: 6, notas: "Uso bajo supervisión." },
  ];
  save(STORAGE_KEYS.productos, productos);
}
if (ventas.length === 0) {
  ventas = [
    { folio: "V-0001", fecha: new Date().toISOString().slice(0,10), clienteId: null, clienteNombre: "Mostrador", sku: "AMX250", cantidad: 2, total: 170.00 },
  ];
  save(STORAGE_KEYS.ventas, ventas);
}
if (niveles.length === 0) {
  niveles = [
    { id: uid(), nombre: "General", descuento: 0, descripcion: "Público en general" },
    { id: uid(), nombre: "Mayoreo", descuento: 8, descripcion: "Compras frecuentes" },
    { id: uid(), nombre: "VIP", descuento: 15, descripcion: "Preferencial" },
  ];
  save(STORAGE_KEYS.niveles, niveles);
}
if (clientes.length === 0) {
  clientes = [
    { id: uid(), nombre: "Juan Pérez", correo: "juan@example.com", nivel: niveles[0].id, direccion: "Av. Siempre Viva 123", telefono: "555-123-4567" },
  ];
  save(STORAGE_KEYS.clientes, clientes);
}
if (promos.length === 0) {
  const today = new Date().toISOString().slice(0,10);
  promos = [
    { id: uid(), nombre: "Lanzamiento AMX", descuento: 5, skus: ["AMX250"], desde: today, hasta: today }
  ];
  save(STORAGE_KEYS.promos, promos);
}

/* ---------- Utilidades de almacenamiento ---------- */
function load(key, fallback=null) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function uid() { return Math.random().toString(36).slice(2, 10); }
function escapeHtml(str="") { return str.replace(/[&<>"']/g, s => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[s])); }

/* ---------- Toast Bootstrap ---------- */
const toastContainer = qs(".toast-container");
const showToast = (msg, variant="primary") => {
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${variant} border-0`;
  el.role = "alert";
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  toastContainer.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2500 }); t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
};

/* ---------- Refs DOM ---------- */
const tbodyInventario = qs("#tbodyInventario");
const buscarProducto  = qs("#buscarProducto");
const tbodyVentas     = qs("#tbodyVentas");
const kpiProductos    = qs("#kpiProductos");
const kpiExistencia   = qs("#kpiExistencia");
const kpiVentasHoy    = qs("#kpiVentasHoy");
const kpiBajoStock    = qs("#kpiBajoStock");

const formProducto    = qs("#formProducto");
const modalProductoEl = qs("#modalProducto");
const btnEliminarProd = qs("#btnEliminarProducto");
const modalProducto   = new bootstrap.Modal(modalProductoEl);

const formVenta       = qs("#formVenta");
const modalVentaEl    = qs("#modalVenta");
const modalVenta      = new bootstrap.Modal(modalVentaEl);
const selectVentaSKU  = qs('select[name="sku"]', formVenta);
const selectVentaCli  = qs('select[name="clienteId"]', formVenta);
const ventaPrecioBase = qs("#ventaPrecioBase");
const ventaDescNivel  = qs("#ventaDescNivel");
const ventaDescPromo  = qs("#ventaDescPromo");
const ventaTotalEst   = qs("#ventaTotalEstimado");

/* Clientes */
const tbodyClientes   = qs("#tbodyClientes");
const buscarCliente   = qs("#buscarCliente");
const formCliente     = qs("#formCliente");
const modalClienteEl  = qs("#modalCliente");
const modalCliente    = new bootstrap.Modal(modalClienteEl);
const btnEliminarCliente = qs("#btnEliminarCliente");

/* Niveles */
const tbodyNiveles    = qs("#tbodyNiveles");
const formNivel       = qs("#formNivel");
const modalNivelEl    = qs("#modalNivel");
const modalNivel      = new bootstrap.Modal(modalNivelEl);
const btnEliminarNivel= qs("#btnEliminarNivel");

/* Promos */
const tbodyPromos     = qs("#tbodyPromos");
const formPromo       = qs("#formPromo");
const modalPromoEl    = qs("#modalPromo");
const modalPromo      = new bootstrap.Modal(modalPromoEl);
const btnEliminarPromo= qs("#btnEliminarPromo");

/* ---------- Render inicial ---------- */
renderInventario(productos);
renderVentas(ventas);
updateKpis();
fillVentaSelects();
renderClientes(clientes);
renderNiveles(niveles);
renderPromos(promos);

/* ======= INVENTARIO ======= */
buscarProducto?.addEventListener("input", e => {
  const term = e.target.value.trim().toLowerCase();
  renderInventario(productos.filter(p => [p.sku, p.nombre, p.categoria].some(v => String(v).toLowerCase().includes(term))));
});

qs("#btnExportCSV")?.addEventListener("click", () => {
  const csv = [
    ["SKU","Nombre","Categoría","Presentación","Precio","Stock","Mínimo","Notas"].join(","),
    ...productos.map(p => [p.sku,p.nombre,p.categoria,p.presentacion,p.precio,p.stock,p.minimo,(p.notas||"").replaceAll(","," ")].join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href:url, download:"inventario_morfis_medicament.csv" });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

modalProductoEl.addEventListener("show.bs.modal", (ev) => {
  const btn = ev.relatedTarget;
  const editSku = btn?.dataset?.sku ?? "";
  formProducto.reset();
  btnEliminarProd.classList.add("d-none");
  qs("#modalProductoLabel").innerHTML = `<i class="bi bi-capsule me-2"></i>${editSku ? "Editar producto" : "Nuevo producto"}`;
  if (editSku) {
    const prod = productos.find(p => p.sku === editSku);
    if (!prod) return;
    fillForm(formProducto, prod);
    btnEliminarProd.classList.remove("d-none");
    btnEliminarProd.dataset.sku = prod.sku;
  }
});

formProducto.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getFormData(formProducto);
  data.precio = Number(data.precio);
  data.stock  = Number(data.stock);
  data.minimo = Number(data.minimo);

  const idx = productos.findIndex(p => p.sku === data.sku);
  if (idx >= 0) { productos[idx] = { ...productos[idx], ...data }; showToast("Producto actualizado", "success"); }
  else { productos.push(data); showToast("Producto agregado", "success"); }
  save(STORAGE_KEYS.productos, productos);
  renderInventario(productos);
  updateKpis();
  fillVentaSelects();
  modalProducto.hide();
});

btnEliminarProd.addEventListener("click", () => {
  const sku = btnEliminarProd.dataset.sku;
  if (!sku) return;
  if (!confirm("¿Eliminar el producto seleccionado?")) return;
  // también remover SKU en promos
  promos = promos.map(pr => ({...pr, skus: pr.skus.filter(s => s !== sku)}));
  productos = productos.filter(p => p.sku !== sku);
  save(STORAGE_KEYS.productos, productos);
  save(STORAGE_KEYS.promos, promos);
  renderInventario(productos);
  renderPromos(promos);
  updateKpis();
  fillVentaSelects();
  modalProducto.hide();
  showToast("Producto eliminado", "warning");
});

function renderInventario(list) {
  tbodyInventario.innerHTML = "";
  list.forEach(p => {
    const low = p.stock <= (p.minimo ?? 0);
    const tr = document.createElement("tr");
    if (low) tr.classList.add("low-stock");
    tr.innerHTML = `
      <td><span class="fw-semibold">${p.sku}</span></td>
      <td>${escapeHtml(p.nombre)}<div class="small text-body-secondary">${escapeHtml(p.notas || "")}</div></td>
      <td>${escapeHtml(p.categoria || "-")}</td>
      <td>${escapeHtml(p.presentacion || "-")}</td>
      <td>${p.stock}</td>
      <td>${p.minimo ?? 0}</td>
      <td>${money(Number(p.precio||0))}</td>
      <td class="text-nowrap">
        ${low ? `<span class="badge badge-low me-2"><i class="bi bi-thermometer-half me-1"></i>Bajo</span>` : ""}
        <button class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#modalProducto" data-sku="${p.sku}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-success" data-action="venta-rapida" data-sku="${p.sku}">
          <i class="bi bi-cart-plus"></i>
        </button>
      </td>
    `;
    tbodyInventario.appendChild(tr);
  });

  qsa('button[data-action="venta-rapida"]', tbodyInventario).forEach(btn => {
    btn.addEventListener("click", () => {
      const sku = btn.dataset.sku;
      selectVentaSKU.value = sku;
      modalVenta.show();
      updateVentaPreview(); // refrescar totales estimados
    });
  });
}

/* ======= VENTAS ======= */
function fillVentaSelects() {
  // Productos
  selectVentaSKU.innerHTML = productos.map(p =>
    `<option value="${p.sku}">${p.nombre} (${p.sku}) — ${money(Number(p.precio||0))} — Stock: ${p.stock}</option>`
  ).join("");

  // Clientes
  const opts = clientes.map(c => {
    const nivel = niveles.find(n => n.id === c.nivel);
    const nTxt = nivel ? nivel.nombre : "General";
    return `<option value="${c.id}">${escapeHtml(c.nombre)} — ${escapeHtml(nTxt)}</option>`;
  });
  opts.unshift(`<option value="">Mostrador (sin registro)</option>`);
  selectVentaCli.innerHTML = opts.join("");
}

function renderVentas(list) {
  tbodyVentas.innerHTML = "";
  list.forEach(v => {
    const prod = productos.find(p => p.sku === v.sku);
    const nombreCli = v.clienteNombre || clientes.find(c => c.id === v.clienteId)?.nombre || "Mostrador";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="fw-semibold">${v.folio}</span></td>
      <td>${v.fecha}</td>
      <td>${escapeHtml(nombreCli)}</td>
      <td>${escapeHtml(prod?.nombre || v.sku)}</td>
      <td>${v.cantidad}</td>
      <td>${money(v.total)}</td>
    `;
    tbodyVentas.appendChild(tr);
  });
}

function updateKpis() {
  kpiProductos.textContent = productos.length;
  kpiExistencia.textContent = productos.reduce((a, p) => a + Number(p.stock || 0), 0);
  const today = new Date().toISOString().slice(0,10);
  const ventasHoy = ventas.filter(v => v.fecha === today).reduce((a,v)=>a+v.total, 0);
  kpiVentasHoy.textContent = money(ventasHoy);
  const bajoStock = productos.filter(p => (p.stock || 0) <= (p.minimo || 0)).length;
  kpiBajoStock.textContent = bajoStock;
}

/* Venta modal comportamiento */
modalVentaEl.addEventListener("show.bs.modal", () => {
  fillVentaSelects();
  const fechaInput = qs('input[name="fecha"]', formVenta);
  if (fechaInput && !fechaInput.value) fechaInput.value = new Date().toISOString().slice(0,10);
  updateVentaPreview();
});

["change","input"].forEach(evt => {
  selectVentaSKU.addEventListener(evt, updateVentaPreview);
  selectVentaCli.addEventListener(evt, updateVentaPreview);
  qs('input[name="cantidad"]', formVenta).addEventListener(evt, updateVentaPreview);
  qs('input[name="fecha"]', formVenta).addEventListener(evt, updateVentaPreview);
});

function updateVentaPreview() {
  const sku = selectVentaSKU.value;
  const cliId = selectVentaCli.value || null;
  const cantidad = Math.max(1, Number(qs('input[name="cantidad"]', formVenta).value || 1));
  const fecha = qs('input[name="fecha"]', formVenta).value || new Date().toISOString().slice(0,10);
  const prod = productos.find(p => p.sku === sku);
  if (!prod) { ventaPrecioBase.textContent = "$0.00"; ventaTotalEst.textContent = "$0.00"; return; }

  const base = Number(prod.precio || 0);
  const nivel = cliId ? niveles.find(n => n.id === (clientes.find(c => c.id === cliId)?.nivel)) : null;
  const descNivel = Number(nivel?.descuento || 0);

  const activePromo = getActivePromoForSku(sku, fecha);
  const descPromo = activePromo ? Number(activePromo.descuento || 0) : 0;

  const precioTrasNivel = base * (1 - descNivel/100);
  const precioFinal = precioTrasNivel * (1 - descPromo/100);

  ventaPrecioBase.textContent = money(base);
  ventaDescNivel.textContent = `${descNivel}%`;
  ventaDescPromo.textContent = `${descPromo}%`;
  ventaTotalEst.textContent = money(precioFinal * cantidad);
}

formVenta.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getFormData(formVenta);
  const cantidad = Math.max(1, Number(data.cantidad));
  const prod = productos.find(p => p.sku === data.sku);
  if (!prod) { showToast("Producto no encontrado", "danger"); return; }
  if (prod.stock < cantidad) { showToast("Stock insuficiente", "danger"); return; }

  const fecha = data.fecha || new Date().toISOString().slice(0,10);
  const clienteId = data.clienteId || null;
  const nivel = clienteId ? niveles.find(n => n.id === (clientes.find(c => c.id === clienteId)?.nivel)) : null;
  const descNivel = Number(nivel?.descuento || 0);
  const promo = getActivePromoForSku(prod.sku, fecha);
  const descPromo = Number(promo?.descuento || 0);

  const precio = Number(prod.precio || 0) * (1 - descNivel/100) * (1 - descPromo/100);
  const total = +(precio * cantidad).toFixed(2);

  prod.stock -= cantidad;
  const folio = nextFolio();
  const venta = {
    folio,
    fecha,
    clienteId,
    clienteNombre: clienteId ? null : "Mostrador",
    sku: prod.sku,
    cantidad,
    total
  };
  ventas.unshift(venta);

  save(STORAGE_KEYS.productos, productos);
  save(STORAGE_KEYS.ventas, ventas);

  renderInventario(productos);
  renderVentas(ventas);
  updateKpis();

  modalVenta.hide();
  showToast(`Venta registrada (${folio})`, "success");
});

function nextFolio() {
  const last = ventas[0]?.folio;
  if (!last) return "V-0001";
  const num = parseInt(last.split("-")[1], 10) + 1;
  return `V-${String(num).padStart(4,"0")}`;
}

/* ======= CLIENTES ======= */
function renderClientes(list) {
  tbodyClientes.innerHTML = "";
  list.forEach(c => {
    const n = niveles.find(nv => nv.id === c.nivel);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(c.nombre)}</td>
      <td>${escapeHtml(c.correo || "-")}</td>
      <td>${escapeHtml(n?.nombre || "General")}</td>
      <td>${escapeHtml(c.direccion || "-")}</td>
      <td>${escapeHtml(c.telefono || "-")}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#modalCliente" data-id="${c.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="del-cliente" data-id="${c.id}">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    `;
    tbodyClientes.appendChild(tr);
  });

  // Delegación eliminar
  tbodyClientes.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='del-cliente']");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!confirm("¿Eliminar cliente?")) return;
    clientes = clientes.filter(c => c.id !== id);
    save(STORAGE_KEYS.clientes, clientes);
    renderClientes(clientes);
    fillVentaSelects();
    showToast("Cliente eliminado", "warning");
  }, { once: true });
}

modalClienteEl.addEventListener("show.bs.modal", (ev) => {
  const btn = ev.relatedTarget;
  const id = btn?.dataset?.id ?? "";
  formCliente.reset();
  btnEliminarCliente.classList.add("d-none");
  qs("#modalClienteLabel").innerHTML = `<i class="bi bi-person-plus me-2"></i>${id ? "Editar cliente" : "Nuevo cliente"}`;

  // llenar niveles
  const selNivel = qs('select[name="nivel"]', formCliente);
  selNivel.innerHTML = niveles.map(n => `<option value="${n.id}">${escapeHtml(n.nombre)} — ${n.descuento}%</option>`).join("");

  if (id) {
    const cli = clientes.find(c => c.id === id);
    if (!cli) return;
    fillForm(formCliente, cli);
    btnEliminarCliente.classList.remove("d-none");
    btnEliminarCliente.dataset.id = cli.id;
  }
});

formCliente.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getFormData(formCliente);
  if (!data.id) data.id = uid();

  const idx = clientes.findIndex(c => c.id === data.id);
  if (idx >= 0) { clientes[idx] = { ...clientes[idx], ...data }; showToast("Cliente actualizado", "success"); }
  else { clientes.push(data); showToast("Cliente agregado", "success"); }

  save(STORAGE_KEYS.clientes, clientes);
  renderClientes(clientes);
  fillVentaSelects();
  modalCliente.hide();
});

btnEliminarCliente.addEventListener("click", () => {
  const id = btnEliminarCliente.dataset.id;
  if (!id) return;
  if (!confirm("¿Eliminar el cliente seleccionado?")) return;
  clientes = clientes.filter(c => c.id !== id);
  save(STORAGE_KEYS.clientes, clientes);
  renderClientes(clientes);
  fillVentaSelects();
  modalCliente.hide();
  showToast("Cliente eliminado", "warning");
});

buscarCliente?.addEventListener("input", e => {
  const term = e.target.value.trim().toLowerCase();
  renderClientes(clientes.filter(c =>
    [c.nombre, c.correo, c.telefono].some(v => String(v||"").toLowerCase().includes(term))
  ));
});

/* ======= NIVELES ======= */
function renderNiveles(list) {
  tbodyNiveles.innerHTML = "";
  list.forEach(nv => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(nv.nombre)}</td>
      <td>${Number(nv.descuento||0)}%</td>
      <td>${escapeHtml(nv.descripcion||"-")}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#modalNivel" data-id="${nv.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="del-nivel" data-id="${nv.id}">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    `;
    tbodyNiveles.appendChild(tr);
  });

  tbodyNiveles.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='del-nivel']");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!confirm("¿Eliminar nivel? Los clientes quedarán sin nivel asignado.")) return;
    // Quitar referencia en clientes
    clientes = clientes.map(c => c.nivel === id ? { ...c, nivel: null } : c);
    niveles = niveles.filter(n => n.id !== id);
    save(STORAGE_KEYS.niveles, niveles);
    save(STORAGE_KEYS.clientes, clientes);
    renderNiveles(niveles);
    renderClientes(clientes);
    fillVentaSelects();
    showToast("Nivel eliminado", "warning");
  }, { once: true });
}

modalNivelEl.addEventListener("show.bs.modal", (ev) => {
  const btn = ev.relatedTarget;
  const id = btn?.dataset?.id ?? "";
  formNivel.reset();
  btnEliminarNivel.classList.add("d-none");
  qs("#modalNivelLabel").innerHTML = `<i class="bi bi-tag me-2"></i>${id ? "Editar nivel" : "Nuevo nivel"}`;

  if (id) {
    const n = niveles.find(nv => nv.id === id);
    if (!n) return;
    fillForm(formNivel, n);
    btnEliminarNivel.classList.remove("d-none");
    btnEliminarNivel.dataset.id = n.id;
  }
});

formNivel.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getFormData(formNivel);
  data.descuento = Number(data.descuento || 0);
  if (!data.id) data.id = uid();

  const idx = niveles.findIndex(n => n.id === data.id);
  if (idx >= 0) { niveles[idx] = { ...niveles[idx], ...data }; showToast("Nivel actualizado", "success"); }
  else { niveles.push(data); showToast("Nivel agregado", "success"); }

  save(STORAGE_KEYS.niveles, niveles);
  renderNiveles(niveles);
  fillVentaSelects();
  modalNivel.hide();
});

btnEliminarNivel.addEventListener("click", () => {
  const id = btnEliminarNivel.dataset.id;
  if (!id) return;
  if (!confirm("¿Eliminar el nivel de precio seleccionado?")) return;
  clientes = clientes.map(c => c.nivel === id ? { ...c, nivel: null } : c);
  niveles = niveles.filter(n => n.id !== id);
  save(STORAGE_KEYS.niveles, niveles);
  save(STORAGE_KEYS.clientes, clientes);
  renderNiveles(niveles);
  renderClientes(clientes);
  fillVentaSelects();
  modalNivel.hide();
  showToast("Nivel eliminado", "warning");
});

/* ======= PROMOCIONES ======= */
function renderPromos(list) {
  tbodyPromos.innerHTML = "";
  list.forEach(pr => {
    const niceProducts = pr.skus.map(s => productos.find(p => p.sku === s)?.nombre || s).join(", ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(pr.nombre)}</td>
      <td>${escapeHtml(niceProducts) || "-"}</td>
      <td>${Number(pr.descuento||0)}%</td>
      <td>${pr.desde}</td>
      <td>${pr.hasta}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#modalPromo" data-id="${pr.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="del-promo" data-id="${pr.id}">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    `;
    tbodyPromos.appendChild(tr);
  });

  tbodyPromos.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='del-promo']");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!confirm("¿Eliminar promoción?")) return;
    promos = promos.filter(p => p.id !== id);
    save(STORAGE_KEYS.promos, promos);
    renderPromos(promos);
    showToast("Promoción eliminada", "warning");
  }, { once: true });
}

modalPromoEl.addEventListener("show.bs.modal", (ev) => {
  const btn = ev.relatedTarget;
  const id = btn?.dataset?.id ?? "";
  formPromo.reset();
  btnEliminarPromo.classList.add("d-none");
  qs("#modalPromoLabel").innerHTML = `<i class="bi bi-ticket-perforated me-2"></i>${id ? "Editar promoción" : "Nueva promoción"}`;

  // llenar multi-select de productos
  const sel = qs('select[name="skus"]', formPromo);
  sel.innerHTML = productos.map(p => `<option value="${p.sku}">${p.nombre} (${p.sku})</option>`).join("");

  if (id) {
    const pr = promos.find(p => p.id === id);
    if (!pr) return;
    fillForm(formPromo, { ...pr, skus: pr.skus });
    // seleccionar múltiples
    [...sel.options].forEach(o => { o.selected = pr.skus.includes(o.value); });
    btnEliminarPromo.classList.remove("d-none");
    btnEliminarPromo.dataset.id = pr.id;
  }
});

formPromo.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getFormData(formPromo);
  const selected = [...qs('select[name="skus"]', formPromo).selectedOptions].map(o => o.value);
  data.skus = selected;
  data.descuento = Number(data.descuento || 0);
  if (!data.id) data.id = uid();

  // Validaciones básicas
  if (data.hasta < data.desde) { showToast("Rango de fechas inválido", "danger"); return; }

  const idx = promos.findIndex(p => p.id === data.id);
  if (idx >= 0) { promos[idx] = { ...promos[idx], ...data }; showToast("Promoción actualizada", "success"); }
  else { promos.push(data); showToast("Promoción agregada", "success"); }

  save(STORAGE_KEYS.promos, promos);
  renderPromos(promos);
  modalPromo.hide();
});

btnEliminarPromo.addEventListener("click", () => {
  const id = btnEliminarPromo.dataset.id;
  if (!id) return;
  if (!confirm("¿Eliminar la promoción seleccionada?")) return;
  promos = promos.filter(p => p.id !== id);
  save(STORAGE_KEYS.promos, promos);
  renderPromos(promos);
  modalPromo.hide();
  showToast("Promoción eliminada", "warning");
});

function getActivePromoForSku(sku, fechaISO) {
  return promos.find(pr => pr.skus.includes(sku) && fechaISO >= pr.desde && fechaISO <= pr.hasta) || null;
}

/* ======= Reportes rápidos ======= */
qs("#btnReporteDia")?.addEventListener("click", () => renderReporte("day"));
qs("#btnReporteSemana")?.addEventListener("click", () => renderReporte("week"));
qs("#btnReporteMes")?.addEventListener("click", () => renderReporte("month"));

function renderReporte(range="day") {
  const now = new Date();
  let from = new Date(now);

  if (range === "week") {
    const day = now.getDay(); // 0 dom - 6 sab
    const diff = (day === 0 ? 6 : day - 1);
    from.setDate(now.getDate() - diff);
  } else if (range === "month") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const startStr = from.toISOString().slice(0,10);
  const endStr   = now.toISOString().slice(0,10);

  const filtered = ventas.filter(v => v.fecha >= startStr && v.fecha <= endStr);
  const ingresos = filtered.reduce((a,v)=>a+v.total, 0);
  const vendidos = filtered.reduce((a,v)=>a+v.cantidad, 0);

  qs("#reporteIngresos").textContent = money(ingresos);
  qs("#reporteProductos").textContent = vendidos;
  showToast("Reporte actualizado", "info");
}

/* ======= Modo oscuro ======= */
qs("#btnDarkMode")?.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("mm_dark", document.documentElement.classList.contains("dark") ? "1" : "0");
});
if (localStorage.getItem("mm_dark") === "1") {
  document.documentElement.classList.add("dark");
}

/* ======= Utilidades de formularios ======= */
function getFormData(form) {
  const data = {};
  new FormData(form).forEach((val, key) => {
    if (data[key] !== undefined) {
      // multivalor
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(val);
    } else {
      data[key] = typeof val === "string" ? val.trim() : val;
    }
  });
  return data;
}
function fillForm(form, obj) {
  Object.entries(obj).forEach(([k,v]) => {
    const el = qs(`[name="${k}"]`, form);
    if (!el) return;
    if (el.tagName === "SELECT" && el.multiple && Array.isArray(v)) {
      [...el.options].forEach(o => o.selected = v.includes(o.value));
    } else if (el.type === "number") el.value = Number(v);
    else el.value = v ?? "";
  });
}

/* ======= Delegaciones menores ======= */
tbodyInventario.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-sku]");
  if (!btn) return;
  // Edición gestionada en show.bs.modal
});
