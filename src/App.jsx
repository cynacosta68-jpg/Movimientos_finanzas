import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, CartesianGrid
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   STORAGE HELPERS  (localStorage wrapper)
   ═══════════════════════════════════════════════════════════════ */
const storage = {
  get(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { cod: 2, name: "Anticipo a profesionales médicos", type: "Egreso" },
  { cod: 3, name: "Anticipo de Haberes", type: "Egreso" },
  { cod: 4, name: "ARCA", type: "Egreso" },
  { cod: 5, name: "Cobranzas de Obras sociales", type: "Ingreso" },
  { cod: 6, name: "Cobranzas de profesionales", type: "Ingreso" },
  { cod: 7, name: "Cobranzas por Salones", type: "Ingreso" },
  { cod: 8, name: "Compensaciones", type: "Ingreso" },
  { cod: 9, name: "Debito Automatico Servicios", type: "Egreso" },
  { cod: 10, name: "Embargos", type: "Egreso" },
  { cod: 11, name: "F.A.S.", type: "Egreso" },
  { cod: 12, name: "Gastos Bancarios", type: "Egreso" },
  { cod: 13, name: "Honorarios miembros de la comision", type: "Egreso" },
  { cod: 14, name: "Inversiones", type: "Egreso" },
  { cod: 15, name: "Liquidaciones a profesionales", type: "Egreso" },
  { cod: 16, name: "Medicina prepaga profesionales OSDE", type: "Egreso" },
  { cod: 17, name: "Medicina prepaga profesionales OSDIPP", type: "Egreso" },
  { cod: 18, name: "Medicina prepaga profesionales SMG", type: "Egreso" },
  { cod: 19, name: "Otros gastos", type: "Egreso" },
  { cod: 20, name: "Pase de Fondos", type: "Ingreso" },
  { cod: 21, name: "Proveedores", type: "Egreso" },
  { cod: 22, name: "Recupero de Gastos", type: "Ingreso" },
  { cod: 23, name: "Seguros", type: "Egreso" },
  { cod: 24, name: "Sueldos y Jornales", type: "Egreso" },
  { cod: 25, name: "Tarjeta Precargada", type: "Egreso" },
  { cod: 26, name: "Cuota Sociedad de Ginecologia", type: "Egreso" },
  { cod: 27, name: "Cuota Sociedad de Pediatria", type: "Egreso" },
];

const OBRAS_SOCIALES = [
  "I.N.S.S.J.P.", "O.S.D.E. (I.V.A.) 2-210 / 2-310", "O.S.P.E.(Obra Social de Petroleros)",
  "O.S.P.y G. CHUBUT", "SWISS MEDICAL S.A. (I.V.A.)", "MEDIFE ASOCIACION CIVIL (I.V.A.)",
  "O.S.D.I.P.P.", "S.E.R.O.S.", "ASOCIACION MUTUAL SANCOR", "GALENO Argentina S.A.",
  "A.C.A. SALUD", "SWISS MEDICAL S.A.", "MEDIFE ASOCIACION CIVIL",
  "PREVENCION SALUD S.A.", "OBRA SOCIAL DE COND.CAMIONEROS", "JERARQUICOS SALUD",
  "D.A.S.U.(I.V.A.)", "CORTE SUPREMA DE JUSTICIA O. S. DEL PODER JUDICIAL",
  "SUPERINTENDENCIA DE BIENESTAR POLICIA FEDERAL ARG.", "VISITAR SRL"
];

const COMP_TYPES = ["Factura", "Nota de debito", "Refacturación"];

const SAMPLE_INVOICES = [
  { id: "FA X 0004-00000727", os: "I.N.S.S.J.P.", total: 710230900, saldo: 0, status: "Cancelada", fecha: "2026-02-03", periodo: "2025-12" },
  { id: "FA X 0088-00000295", os: "O.S.D.E. (I.V.A.) 2-210 / 2-310", total: 357919600, saldo: 0, status: "Cancelada", fecha: "2026-03-30", periodo: "2026-02" },
  { id: "FA C 0005-00001148", os: "O.S.P.E.(Obra Social de Petroleros)", total: 271761500, saldo: 0, status: "Cancelada", fecha: "2026-02-04", periodo: "2026-01" },
  { id: "FA C 0005-00004187", os: "O.S.P.y G. CHUBUT", total: 264131600, saldo: 1856495, status: "Pendiente", fecha: "2026-01-09", periodo: "2025-12" },
  { id: "FA X 0088-00000278", os: "MEDIFE ASOCIACION CIVIL (I.V.A.)", total: 139774100, saldo: 4584090, status: "Pendiente", fecha: "2026-02-02", periodo: "2026-01" },
  { id: "FA C 0005-00001150", os: "O.S.D.I.P.P.", total: 136648100, saldo: 0, status: "Cancelada", fecha: "2026-02-04", periodo: "2026-01" },
  { id: "FA X 0004-00000730", os: "I.N.S.S.J.P.", total: 98450000, saldo: 98450000, status: "Pendiente", fecha: "2026-03-15", periodo: "2026-02" },
  { id: "FA C 0005-00004200", os: "S.E.R.O.S.", total: 45670000, saldo: 45670000, status: "Pendiente", fecha: "2026-03-20", periodo: "2026-02" },
  { id: "FA X 0088-00000300", os: "SWISS MEDICAL S.A. (I.V.A.)", total: 67890000, saldo: 67890000, status: "Pendiente", fecha: "2026-04-01", periodo: "2026-03" },
  { id: "FA C 0005-00004210", os: "GALENO Argentina S.A.", total: 34560000, saldo: 34560000, status: "Pendiente", fecha: "2026-04-05", periodo: "2026-03" },
];

/* ═══════════════════════════════════════════════════════════════
   FORMAT HELPERS
   ═══════════════════════════════════════════════════════════════ */
const fmt = (n) => {
  if (n == null || isNaN(n)) return "$0,00";
  return "$" + Math.abs(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtShort = (n) => {
  if (Math.abs(n) >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + n.toFixed(0);
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  navy: "#0A2540", blue: "#1B5E9E", blueLight: "#3B82C4", blueAccent: "#4DA3E8",
  grayDark: "#374151", gray: "#6B7280", grayMid: "#9CA3AF", grayLight: "#D1D5DB",
  grayBg: "#F3F4F6", white: "#FFFFFF", green: "#059669", red: "#DC2626",
  amber: "#D97706", surface: "#F8FAFC", border: "#E5E7EB",
};
const baseBtn = { border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, padding: "8px 16px", transition: "all .15s" };
const primaryBtn = { ...baseBtn, background: C.blue, color: C.white };
const secondaryBtn = { ...baseBtn, background: C.grayBg, color: C.grayDark, border: `1px solid ${C.grayLight}` };
const inputStyle = { width: "100%", padding: "8px 12px", border: `1px solid ${C.grayLight}`, borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const selectStyle = { ...inputStyle, background: C.white };
const labelStyle = { fontSize: 11, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "block" };
const cardStyle = { background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16 };

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState("movimientos");
  const [movements, setMovements] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [loginPass, setLoginPass] = useState("");
  const [loading, setLoading] = useState(true);

  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");

  // ── Load ──
  useEffect(() => {
    const m = storage.get("fin_movements");
    const p = storage.get("fin_pending");
    const s = storage.get("fin_settlements");
    if (m) setMovements(m);
    if (p) setPendingItems(p);
    if (s) setSettlements(s);
    setLoading(false);
  }, []);

  // ── Save ──
  const saveAll = useCallback((mv, pn, st) => {
    storage.set("fin_movements", mv);
    storage.set("fin_pending", pn);
    storage.set("fin_settlements", st);
  }, []);

  const updateMovements = (mv) => { setMovements(mv); saveAll(mv, pendingItems, settlements); };
  const updatePending = (pn) => { setPendingItems(pn); saveAll(movements, pn, settlements); };
  const updateSettlements = (st) => { setSettlements(st); saveAll(movements, pendingItems, st); };

  // ── Filtered ──
  const filtered = useMemo(() => {
    return movements.filter(m => {
      if (filterFrom && m.fecha < filterFrom) return false;
      if (filterTo && m.fecha > filterTo) return false;
      if (filterType && m.tipo !== filterType) return false;
      if (filterCat && m.categoria !== filterCat) return false;
      return true;
    });
  }, [movements, filterFrom, filterTo, filterType, filterCat]);

  const totalIngresos = useMemo(() => filtered.filter(m => m.tipo === "Ingreso").reduce((s, m) => s + (parseFloat(m.monto) || 0), 0), [filtered]);
  const totalEgresos = useMemo(() => filtered.filter(m => m.tipo === "Egreso").reduce((s, m) => s + (parseFloat(m.monto) || 0), 0), [filtered]);
  const disponibilidad = totalIngresos - totalEgresos;

  const tabs = [
    { id: "movimientos", label: "Movimientos", icon: "📋" },
    { id: "ingreso", label: "Ingreso de Datos", icon: "📝" },
    { id: "liquidacion", label: "Planificar Liquidación", icon: "📅" },
    { id: "reportes", label: "Reportes", icon: "📊" },
  ];

  /* ── Loading screen ── */
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.surface }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.grayLight}`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: C.gray }}>Cargando sistema financiero...</p>
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: C.surface, minHeight: "100vh", color: C.grayDark }}>

      {/* ─── Header ─── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`, padding: "20px 24px 16px", color: C.white }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💰</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Sistema de Gestión Financiera</h1>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Control integral de ingresos, egresos y liquidaciones</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: isAdmin ? "rgba(5,150,105,0.3)" : "rgba(255,255,255,0.15)" }}>
              {isAdmin ? "🔓 Admin" : "👤 Lectura"}
            </span>
            <button onClick={() => isAdmin ? setIsAdmin(false) : setLoginModal(true)} style={{ ...baseBtn, background: "rgba(255,255,255,0.15)", color: C.white, fontSize: 11, padding: "5px 12px" }}>
              {isAdmin ? "Cerrar sesión" : "Acceso Admin"}
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "Total Ingresos", value: totalIngresos, color: "#34D399", icon: "↑" },
            { label: "Total Egresos", value: totalEgresos, color: "#F87171", icon: "↓" },
            { label: "Disponibilidad", value: disponibilidad, color: disponibilidad >= 0 ? "#60A5FA" : "#F87171", icon: "≡" },
          ].map((kpi, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16, width: 24, height: 24, borderRadius: 6, background: `${kpi.color}33`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color }}>{kpi.icon}</span>
                <span style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: kpi.color }}>{fmtShort(kpi.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "10px 24px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.gray, textTransform: "uppercase" }}>Filtros:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <label style={{ fontSize: 11, color: C.gray }}>Desde</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={{ ...inputStyle, width: 140, padding: "5px 8px" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <label style={{ fontSize: 11, color: C.gray }}>Hasta</label>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={{ ...inputStyle, width: 140, padding: "5px 8px" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...selectStyle, width: 130, padding: "5px 8px" }}>
          <option value="">Todos los tipos</option>
          <option value="Ingreso">Ingreso</option>
          <option value="Egreso">Egreso</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...selectStyle, width: 200, padding: "5px 8px" }}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c.cod} value={c.name}>{c.name}</option>)}
        </select>
        {(filterFrom || filterTo || filterType || filterCat) && (
          <button onClick={() => { setFilterFrom(""); setFilterTo(""); setFilterType(""); setFilterCat(""); }} style={{ ...baseBtn, fontSize: 11, padding: "5px 10px", background: C.grayBg, color: C.gray }}>✕ Limpiar</button>
        )}
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ ...baseBtn, background: "transparent", color: activeTab === t.id ? C.blue : C.gray, borderRadius: 0, borderBottom: activeTab === t.id ? `2px solid ${C.blue}` : "2px solid transparent", padding: "12px 18px", fontWeight: activeTab === t.id ? 700 : 500, whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── Content ─── */}
      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        {activeTab === "movimientos" && <Movimientos movements={filtered} allMovements={movements} updateMovements={updateMovements} isAdmin={isAdmin} />}
        {activeTab === "ingreso" && <IngresoTab movements={movements} updateMovements={updateMovements} pendingItems={pendingItems} updatePending={updatePending} isAdmin={isAdmin} />}
        {activeTab === "liquidacion" && <LiquidacionTab movements={movements} updateMovements={updateMovements} settlements={settlements} updateSettlements={updateSettlements} isAdmin={isAdmin} />}
        {activeTab === "reportes" && <ReportesTab movements={movements} />}
      </div>

      {/* ─── Login Modal ─── */}
      {loginModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ ...cardStyle, width: 340, padding: 28 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: C.navy }}>🔐 Acceso Administrador</h3>
            <input type="password" placeholder="Contraseña" value={loginPass} onChange={e => setLoginPass(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { if (loginPass === "admin2026") { setIsAdmin(true); setLoginModal(false); setLoginPass(""); } else { alert("Contraseña incorrecta"); } } }}
              style={{ ...inputStyle, marginBottom: 12 }} autoFocus />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setLoginModal(false); setLoginPass(""); }} style={secondaryBtn}>Cancelar</button>
              <button onClick={() => { if (loginPass === "admin2026") { setIsAdmin(true); setLoginModal(false); setLoginPass(""); } else { alert("Contraseña incorrecta"); } }} style={primaryBtn}>Ingresar</button>
            </div>
            <p style={{ fontSize: 10, color: C.grayMid, margin: "12px 0 0", textAlign: "center" }}>Contraseña por defecto: admin2026</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOVIMIENTOS
   ═══════════════════════════════════════════════════════════════ */
function Movimientos({ movements, allMovements, updateMovements, isAdmin }) {
  const [sortField, setSortField] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    return [...movements].sort((a, b) => {
      let va = a[sortField] || "", vb = b[sortField] || "";
      if (sortField === "monto") { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [movements, sortField, sortDir]);

  const toggleSort = (f) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const del = (id) => { if (window.confirm("¿Eliminar este movimiento?")) updateMovements(allMovements.filter(m => m.id !== id)); };

  const downloadCSV = () => {
    if (sorted.length === 0) { alert("No hay movimientos para descargar"); return; }
    const headers = ["Fecha", "Tipo", "Categoría", "Razón Social", "CUIT/DNI", "Monto", "Ref. Banco", "F. Registración", "Imputación", "F. Liquidación", "Tipo Comprobante", "Tipo Gasto", "Proveedor Habitual"];
    const rows = sorted.map(m => [
      m.fecha || "", m.tipo || "", m.categoria || "", m.razonSocial || "", m.cuit || "",
      m.monto || "", m.referencia || "", m.fechaRegistracion || "", m.imputacion || "",
      m.fechaLiquidacion || "", m.tipoComprobante || "", m.tipoGasto || "", m.proveedorHabitual ? "Sí" : "No"
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers.join(";"), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `movimientos_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const cols = [
    { key: "fecha", label: "Fecha", w: 95 },
    { key: "tipo", label: "Tipo", w: 70 },
    { key: "categoria", label: "Categoría", w: 160 },
    { key: "razonSocial", label: "Razón Social", w: 150 },
    { key: "monto", label: "Monto", w: 110 },
    { key: "referencia", label: "Ref. Banco", w: 90 },
    { key: "fechaRegistracion", label: "F. Registración", w: 100 },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, color: C.navy }}>Movimientos ({movements.length})</h2>
        <button onClick={downloadCSV} style={{ ...primaryBtn, display: "flex", alignItems: "center", gap: 6, background: C.green }}>📥 Descargar Movimientos</button>
      </div>
      <div style={{ ...cardStyle, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.grayBg }}>
              {cols.map(c => (
                <th key={c.key} onClick={() => toggleSort(c.key)}
                  style={{ padding: "10px 12px", textAlign: "left", cursor: "pointer", fontWeight: 600, color: C.gray, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", width: c.w }}>
                  {c.label} {sortField === c.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              {isAdmin && <th style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, width: 80 }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={cols.length + 1} style={{ padding: 40, textAlign: "center", color: C.grayMid }}>No hay movimientos registrados. Use "Ingreso de Datos" para agregar.</td></tr>
            ) : sorted.map(m => (
              <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseOver={e => e.currentTarget.style.background = C.grayBg}
                onMouseOut={e => e.currentTarget.style.background = ""}>
                <td style={{ padding: "8px 12px" }}>{m.fecha}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, background: m.tipo === "Ingreso" ? "#D1FAE5" : "#FEE2E2", color: m.tipo === "Ingreso" ? C.green : C.red }}>{m.tipo}</span>
                </td>
                <td style={{ padding: "8px 12px", fontSize: 11 }}>{m.categoria}</td>
                <td style={{ padding: "8px 12px", fontSize: 11 }}>{m.razonSocial}</td>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: m.tipo === "Ingreso" ? C.green : C.red }}>{fmt(parseFloat(m.monto) || 0)}</td>
                <td style={{ padding: "8px 12px", fontSize: 11, color: C.grayMid }}>{m.referencia}</td>
                <td style={{ padding: "8px 12px", fontSize: 11 }}>{m.fechaRegistracion}</td>
                {isAdmin && (
                  <td style={{ padding: "8px 12px" }}>
                    <button onClick={() => del(m.id)} style={{ ...baseBtn, background: "transparent", color: C.red, padding: "2px 6px", fontSize: 11 }}>🗑</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INGRESO DE DATOS
   ═══════════════════════════════════════════════════════════════ */
function IngresoTab({ movements, updateMovements, pendingItems, updatePending, isAdmin }) {
  const [subTab, setSubTab] = useState("manual");
  const emptyForm = { fecha: "", tipo: "", categoria: "", razonSocial: "", cuit: "", referencia: "", fechaRegistracion: "", imputacion: "", fechaLiquidacion: "", tipoComprobante: "", facturaImputar: [], tipoGasto: "", proveedorHabitual: false, monto: "" };
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [editingPendingId, setEditingPendingId] = useState(null);
  const [pendingForm, setPendingForm] = useState(null);

  const isCobranzaOS = form.categoria === "Cobranzas de Obras sociales";
  const isProveedor = form.categoria === "Proveedores";
  const isLiquidacion = form.categoria === "Liquidaciones a profesionales";

  const filteredInvoices = useMemo(() => {
    if (!isCobranzaOS) return [];
    const os = form.razonSocial || "";
    return SAMPLE_INVOICES.filter(inv => !os || inv.os.toLowerCase().includes(os.toLowerCase()));
  }, [isCobranzaOS, form.razonSocial]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.fecha || !form.tipo || !form.categoria || !form.monto) {
      alert("Complete los campos obligatorios: Fecha, Tipo, Categoría y Monto");
      return;
    }
    if (editingId) {
      updateMovements(movements.map(m => m.id === editingId ? { ...form, id: editingId } : m));
      setEditingId(null);
    } else {
      if (isCobranzaOS && form.facturaImputar.length > 1) {
        const newMvs = form.facturaImputar.map(fid => ({ ...form, id: uid(), imputacion: fid }));
        updateMovements([...movements, ...newMvs]);
      } else {
        updateMovements([...movements, { ...form, id: uid() }]);
      }
    }
    setForm({ ...emptyForm });
  };

  const handleDuplicate = () => { setForm(f => ({ ...f })); setEditingId(null); };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    alert("Archivo importado. Los movimientos sin categoría asignada aparecerán en 'Partidas Pendientes'. En esta demo se simulan 5 líneas importadas.");
    const sampleImported = [
      { id: uid(), fecha: "2026-03-03", tipo: "", categoria: "", razonSocial: "PEREZ AGUIRRE, FACUNDO", cuit: "20-43282647-4", referencia: "667567", monto: 954071.12, concepto: "Transf.Inmediata", fechaRegistracion: "", imputacion: "" },
      { id: uid(), fecha: "2026-03-03", tipo: "", categoria: "", razonSocial: "RIOS LEONE, ALEJO", cuit: "20-50525822-4", referencia: "667576", monto: 4856797.07, concepto: "Transf.Inmediata", fechaRegistracion: "", imputacion: "" },
      { id: uid(), fecha: "2026-03-03", tipo: "", categoria: "", razonSocial: "SEGURA MARTA INES", cuit: "23-20238390-4", referencia: "653378", monto: 4586358.35, concepto: "Transf.Inmediata", fechaRegistracion: "", imputacion: "" },
      { id: uid(), fecha: "2026-02-10", tipo: "", categoria: "", razonSocial: "O.S.D.E.", cuit: "", referencia: "501234", monto: 35791960, concepto: "Cobro factura", fechaRegistracion: "", imputacion: "" },
      { id: uid(), fecha: "2026-02-15", tipo: "", categoria: "", razonSocial: "GALENO S.A.", cuit: "", referencia: "501890", monto: 12500000, concepto: "Cobro factura", fechaRegistracion: "", imputacion: "" },
    ];
    updatePending([...pendingItems, ...sampleImported]);
    e.target.value = "";
  };

  const savePending = (item) => {
    if (!item.tipo || !item.categoria) { alert("Debe asignar Tipo y Categoría"); return; }
    updateMovements([...movements, { ...item }]);
    updatePending(pendingItems.filter(p => p.id !== item.id));
    setEditingPendingId(null);
    setPendingForm(null);
  };

  const deletePending = (id) => { updatePending(pendingItems.filter(p => p.id !== id)); };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setSubTab("manual")} style={{ ...baseBtn, background: subTab === "manual" ? C.blue : C.grayBg, color: subTab === "manual" ? C.white : C.gray }}>📝 Carga Manual</button>
        <button onClick={() => setSubTab("import")} style={{ ...baseBtn, background: subTab === "import" ? C.blue : C.grayBg, color: subTab === "import" ? C.white : C.gray }}>📥 Importar Template</button>
        {pendingItems.length > 0 && <button onClick={() => setSubTab("pending")} style={{ ...baseBtn, background: subTab === "pending" ? C.amber : "#FEF3C7", color: subTab === "pending" ? C.white : C.amber }}>⚠️ Partidas Pendientes ({pendingItems.length})</button>}
      </div>

      {/* ── Manual ── */}
      {subTab === "manual" && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.navy }}>
            {editingId ? "✏️ Editar Movimiento" : "➕ Nuevo Movimiento"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <div><label style={labelStyle}>Fecha del movimiento *</label><input type="date" value={form.fecha} onChange={e => setField("fecha", e.target.value)} style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Tipo de movimiento *</label>
              <select value={form.tipo} onChange={e => { setField("tipo", e.target.value); setField("categoria", ""); }} style={selectStyle}>
                <option value="">Seleccione...</option>
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Categoría *</label>
              <select value={form.categoria} onChange={e => setField("categoria", e.target.value)} style={selectStyle}>
                <option value="">Seleccione...</option>
                {CATEGORIES.filter(c => !form.tipo || c.type === form.tipo).map(c => <option key={c.cod} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Monto *</label><input type="number" value={form.monto || ""} onChange={e => setField("monto", e.target.value)} style={inputStyle} placeholder="0.00" /></div>
            <div><label style={labelStyle}>Razón Social</label><input value={form.razonSocial} onChange={e => setField("razonSocial", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>CUIT / DNI</label><input value={form.cuit} onChange={e => setField("cuit", e.target.value)} style={inputStyle} placeholder="XX-XXXXXXXX-X" /></div>
            <div><label style={labelStyle}>Referencia del Banco</label><input value={form.referencia} onChange={e => setField("referencia", e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Fecha de Registración</label><input type="date" value={form.fechaRegistracion} onChange={e => setField("fechaRegistracion", e.target.value)} style={inputStyle} /></div>

            {isCobranzaOS && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de Comprobante</label>
                  <select value={form.tipoComprobante} onChange={e => setField("tipoComprobante", e.target.value)} style={selectStyle}>
                    <option value="">Seleccione...</option>
                    {COMP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Imputar a Factura(s)</label>
                  <div style={{ maxHeight: 140, overflow: "auto", border: `1px solid ${C.grayLight}`, borderRadius: 6, padding: 8 }}>
                    {filteredInvoices.length === 0 ? <p style={{ fontSize: 11, color: C.grayMid }}>Ingrese Razón Social para filtrar facturas</p> :
                      filteredInvoices.map(inv => (
                        <label key={inv.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 11, cursor: "pointer" }}>
                          <input type="checkbox" checked={(form.facturaImputar || []).includes(inv.id)} onChange={e => {
                            const arr = form.facturaImputar || [];
                            setField("facturaImputar", e.target.checked ? [...arr, inv.id] : arr.filter(x => x !== inv.id));
                          }} />
                          <span style={{ fontWeight: 600 }}>{inv.id}</span>
                          <span style={{ color: C.gray }}>{inv.os}</span>
                          <span style={{ color: inv.status === "Pendiente" ? C.amber : C.green, fontWeight: 600 }}>{fmt(inv.saldo)}</span>
                          <span style={{ fontSize: 9, padding: "1px 6px", background: C.grayBg, borderRadius: 4, color: C.grayMid }}>{inv.status}</span>
                        </label>
                      ))}
                  </div>
                </div>
              </>
            )}

            {isLiquidacion && (
              <div><label style={labelStyle}>Fecha de Liquidación</label><input type="date" value={form.fechaLiquidacion} onChange={e => setField("fechaLiquidacion", e.target.value)} style={inputStyle} /></div>
            )}

            {isProveedor && (
              <>
                <div><label style={labelStyle}>Tipo de Gasto</label><input value={form.tipoGasto} onChange={e => setField("tipoGasto", e.target.value)} style={inputStyle} placeholder="Ej: Insumos médicos" /></div>
                <div><label style={labelStyle}>Razón Social del Proveedor</label><input value={form.razonSocial} onChange={e => setField("razonSocial", e.target.value)} style={inputStyle} /></div>
                <div style={{ display: "flex", alignItems: "end", paddingBottom: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.proveedorHabitual} onChange={e => setField("proveedorHabitual", e.target.checked)} />
                    Proveedor habitual
                  </label>
                </div>
              </>
            )}

            <div><label style={labelStyle}>Imputación</label><input value={form.imputacion} onChange={e => setField("imputacion", e.target.value)} style={inputStyle} /></div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {editingId && <button onClick={() => { setForm({ ...emptyForm }); setEditingId(null); }} style={secondaryBtn}>Cancelar</button>}
            <button onClick={handleDuplicate} style={secondaryBtn}>📋 Duplicar en Nuevo</button>
            <button onClick={handleSave} style={primaryBtn}>{editingId ? "💾 Actualizar" : "💾 Guardar"}</button>
          </div>
        </div>
      )}

      {/* ── Import ── */}
      {subTab === "import" && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: C.navy }}>📥 Importar desde Template de Movimientos Bancarios</h3>
          <p style={{ fontSize: 12, color: C.gray, marginBottom: 16 }}>Seleccione el archivo Excel con el formato del template de movimientos bancarios. Los registros sin categoría se enviarán a "Partidas Pendientes" para su edición.</p>
          <div style={{ border: `2px dashed ${C.grayLight}`, borderRadius: 10, padding: 40, textAlign: "center", background: C.grayBg }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: C.gray }}>Arrastre su archivo aquí o haga clic para seleccionar</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{ fontSize: 12 }} />
          </div>
        </div>
      )}

      {/* ── Pending ── */}
      {subTab === "pending" && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: C.navy }}>⚠️ Partidas Pendientes de Clasificación ({pendingItems.length})</h3>
          <p style={{ fontSize: 12, color: C.gray, marginBottom: 12 }}>Estos movimientos fueron importados y requieren asignación de tipo y categoría.</p>
          {pendingItems.map(p => (
            <div key={p.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 8, background: editingPendingId === p.id ? "#FFFBEB" : C.white }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap" }}>
                  <span><strong>Fecha:</strong> {p.fecha}</span>
                  <span><strong>Monto:</strong> {fmt(p.monto)}</span>
                  <span><strong>Razón Social:</strong> {p.razonSocial}</span>
                  <span><strong>Ref:</strong> {p.referencia}</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => { setEditingPendingId(p.id); setPendingForm({ ...p }); }} style={{ ...baseBtn, fontSize: 11, padding: "4px 10px", background: C.blueAccent, color: C.white }}>✏️ Editar</button>
                  <button onClick={() => deletePending(p.id)} style={{ ...baseBtn, fontSize: 11, padding: "4px 10px", background: "#FEE2E2", color: C.red }}>🗑</button>
                </div>
              </div>
              {editingPendingId === p.id && pendingForm && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                  <div>
                    <label style={labelStyle}>Tipo *</label>
                    <select value={pendingForm.tipo} onChange={e => setPendingForm(f => ({ ...f, tipo: e.target.value, categoria: "" }))} style={selectStyle}>
                      <option value="">Seleccione...</option>
                      <option value="Ingreso">Ingreso</option>
                      <option value="Egreso">Egreso</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Categoría *</label>
                    <select value={pendingForm.categoria} onChange={e => setPendingForm(f => ({ ...f, categoria: e.target.value }))} style={selectStyle}>
                      <option value="">Seleccione...</option>
                      {CATEGORIES.filter(c => !pendingForm.tipo || c.type === pendingForm.tipo).map(c => <option key={c.cod} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div><label style={labelStyle}>F. Registración</label><input type="date" value={pendingForm.fechaRegistracion || ""} onChange={e => setPendingForm(f => ({ ...f, fechaRegistracion: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Imputación</label><input value={pendingForm.imputacion || ""} onChange={e => setPendingForm(f => ({ ...f, imputacion: e.target.value }))} style={inputStyle} /></div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => { setEditingPendingId(null); setPendingForm(null); }} style={secondaryBtn}>Cancelar</button>
                    <button onClick={() => savePending(pendingForm)} style={primaryBtn}>✅ Confirmar y Mover a Movimientos</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLANIFICAR LIQUIDACIÓN
   ═══════════════════════════════════════════════════════════════ */
function LiquidacionTab({ movements, updateMovements, settlements, updateSettlements, isAdmin }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSet, setNewSet] = useState({ obraSocial: "", facturaId: "", ordenPago: "", fechaEstimada: "", monto: 0 });
  const [downloadFrom, setDownloadFrom] = useState("");
  const [downloadTo, setDownloadTo] = useState("");

  const cobranzasOS = movements.filter(m => m.categoria === "Cobranzas de Obras sociales");
  const assignedIds = settlements.map(s => s.movementId);
  const unassigned = cobranzasOS.filter(c => !assignedIds.includes(c.id));
  const filteredSettlements = statusFilter ? settlements.filter(s => s.status === statusFilter) : settlements;

  const addSettlement = () => {
    if (!newSet.obraSocial || !newSet.facturaId || !newSet.fechaEstimada) { alert("Complete Obra Social, Factura y Fecha"); return; }
    updateSettlements([...settlements, { id: uid(), ...newSet, status: "PLANIFICADO", movementId: "", fechaCreacion: new Date().toISOString().slice(0, 10) }]);
    setNewSet({ obraSocial: "", facturaId: "", ordenPago: "", fechaEstimada: "", monto: 0 });
    setShowNewForm(false);
  };

  const assignCobranza = (movId, facturaId) => {
    const mov = movements.find(m => m.id === movId);
    updateSettlements([...settlements, {
      id: uid(), obraSocial: mov?.razonSocial || "", facturaId, ordenPago: "",
      fechaEstimada: "", monto: parseFloat(mov?.monto) || 0, status: "SIN ASIGNAR",
      movementId: movId, fechaCreacion: new Date().toISOString().slice(0, 10)
    }]);
  };

  const updateStatus = (id, newStatus, newDate) => {
    updateSettlements(settlements.map(s => s.id === id ? { ...s, status: newStatus, ...(newDate ? { fechaEstimada: newDate } : {}) } : s));
  };

  const confirmLiquidacion = (id) => updateStatus(id, "LIQUIDADO");
  const reprogramar = (id) => {
    const newDate = prompt("Ingrese nueva fecha (AAAA-MM-DD):");
    if (newDate) updateStatus(id, "PLANIFICADO", newDate);
  };

  const exportFiltered = () => {
    const data = settlements.filter(s => {
      if (downloadFrom && s.fechaEstimada < downloadFrom) return false;
      if (downloadTo && s.fechaEstimada > downloadTo) return false;
      return true;
    });
    const bom = "\uFEFF";
    const csv = bom + "Obra Social;Factura;Orden de Pago;Fecha Estimada;Monto;Status\n" +
      data.map(s => `"${s.obraSocial}";"${s.facturaId}";"${s.ordenPago}";"${s.fechaEstimada}";${s.monto};"${s.status}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "liquidaciones.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const sendEmail = () => {
    const subject = encodeURIComponent("Liquidaciones planificadas");
    const body = encodeURIComponent("Adjunto el detalle de liquidaciones planificadas. Favor revisar y confirmar.");
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  };

  const statusColors = { PLANIFICADO: { bg: "#DBEAFE", color: C.blue }, LIQUIDADO: { bg: "#D1FAE5", color: C.green }, "SIN ASIGNAR": { bg: "#FEF3C7", color: C.amber } };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16, color: C.navy }}>📅 Planificación de Liquidaciones</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["", "PLANIFICADO", "LIQUIDADO", "SIN ASIGNAR"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ ...baseBtn, fontSize: 11, padding: "5px 12px", background: statusFilter === s ? C.blue : C.grayBg, color: statusFilter === s ? C.white : C.gray }}>
              {s || "Todos"}
            </button>
          ))}
        </div>
      </div>

      {unassigned.length > 0 && (
        <div style={{ ...cardStyle, borderLeft: `4px solid ${C.amber}` }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: C.amber }}>⚠️ Cobranzas sin asignar ({unassigned.length})</h4>
          {unassigned.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12, flexWrap: "wrap", gap: 8 }}>
              <div><strong>{c.razonSocial}</strong> — {c.fecha} — {fmt(parseFloat(c.monto) || 0)}</div>
              <select onChange={e => { if (e.target.value) assignCobranza(c.id, e.target.value); }} style={{ ...selectStyle, width: 220, padding: "4px 8px", fontSize: 11 }}>
                <option value="">Imputar a factura...</option>
                {SAMPLE_INVOICES.filter(i => i.status === "Pendiente").map(inv => <option key={inv.id} value={inv.id}>{inv.id} - {inv.os} ({fmt(inv.saldo)})</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowNewForm(!showNewForm)} style={primaryBtn}>+ Nueva Liquidación</button>
      </div>

      {showNewForm && (
        <div style={{ ...cardStyle, borderLeft: `4px solid ${C.blue}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            <div>
              <label style={labelStyle}>Obra Social</label>
              <select value={newSet.obraSocial} onChange={e => setNewSet(s => ({ ...s, obraSocial: e.target.value }))} style={selectStyle}>
                <option value="">Seleccione...</option>
                {OBRAS_SOCIALES.map(os => <option key={os} value={os}>{os}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Factura</label>
              <select value={newSet.facturaId} onChange={e => setNewSet(s => ({ ...s, facturaId: e.target.value }))} style={selectStyle}>
                <option value="">Seleccione...</option>
                {SAMPLE_INVOICES.filter(i => !newSet.obraSocial || i.os.includes(newSet.obraSocial.split(" ")[0])).filter(i => i.status === "Pendiente").map(inv => <option key={inv.id} value={inv.id}>{inv.id} ({fmt(inv.saldo)})</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Orden de Pago</label><input value={newSet.ordenPago} onChange={e => setNewSet(s => ({ ...s, ordenPago: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Fecha Estimada</label><input type="date" value={newSet.fechaEstimada} onChange={e => setNewSet(s => ({ ...s, fechaEstimada: e.target.value }))} style={inputStyle} /></div>
            <div><label style={labelStyle}>Monto</label><input type="number" value={newSet.monto} onChange={e => setNewSet(s => ({ ...s, monto: parseFloat(e.target.value) || 0 }))} style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <button onClick={() => setShowNewForm(false)} style={secondaryBtn}>Cancelar</button>
            <button onClick={addSettlement} style={primaryBtn}>Guardar</button>
          </div>
        </div>
      )}

      <div style={{ ...cardStyle, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.grayBg }}>
              {["Status", "Obra Social", "Factura", "Orden Pago", "Fecha Estimada", "Monto", "Acciones"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.gray, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSettlements.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 30, textAlign: "center", color: C.grayMid }}>No hay liquidaciones registradas</td></tr>
            ) : filteredSettlements.map(s => {
              const sc = statusColors[s.status] || statusColors.PLANIFICADO;
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "8px 12px" }}><span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, background: sc.bg, color: sc.color }}>{s.status}</span></td>
                  <td style={{ padding: "8px 12px" }}>{s.obraSocial}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 600, fontSize: 11 }}>{s.facturaId}</td>
                  <td style={{ padding: "8px 12px" }}>{s.ordenPago}</td>
                  <td style={{ padding: "8px 12px" }}>{s.fechaEstimada}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{fmt(s.monto)}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {s.status === "PLANIFICADO" && <button onClick={() => confirmLiquidacion(s.id)} style={{ ...baseBtn, fontSize: 10, padding: "3px 8px", background: "#D1FAE5", color: C.green }}>✅ Confirmar</button>}
                      {s.status === "PLANIFICADO" && <button onClick={() => reprogramar(s.id)} style={{ ...baseBtn, fontSize: 10, padding: "3px 8px", background: "#FEF3C7", color: C.amber }}>🔄 Reprogramar</button>}
                      {s.status === "SIN ASIGNAR" && (
                        <input type="date" onChange={e => { if (e.target.value) updateStatus(s.id, "PLANIFICADO", e.target.value); }} style={{ ...inputStyle, width: 130, padding: "3px 6px", fontSize: 10 }} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.gray }}>Descargar por rango:</span>
          <input type="date" value={downloadFrom} onChange={e => setDownloadFrom(e.target.value)} style={{ ...inputStyle, width: 140, padding: "5px 8px" }} />
          <input type="date" value={downloadTo} onChange={e => setDownloadTo(e.target.value)} style={{ ...inputStyle, width: 140, padding: "5px 8px" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportFiltered} style={{ ...primaryBtn, background: C.green }}>📥 Descargar Excel</button>
          <button onClick={sendEmail} style={{ ...primaryBtn, background: "#EA4335" }}>📧 Enviar por Gmail</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REPORTES
   ═══════════════════════════════════════════════════════════════ */
function ReportesTab({ movements }) {
  const [reportTab, setReportTab] = useState("ingresos");
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ id: "ingresos", label: "📈 Ingresos", color: C.green }, { id: "egresos", label: "📉 Egresos", color: C.red }, { id: "cobranzas", label: "🏥 Cobranzas", color: C.blue }].map(r => (
          <button key={r.id} onClick={() => setReportTab(r.id)} style={{ ...baseBtn, background: reportTab === r.id ? r.color : C.grayBg, color: reportTab === r.id ? C.white : C.gray }}>{r.label}</button>
        ))}
      </div>
      {reportTab === "ingresos" && <ReporteIngresos movements={movements} />}
      {reportTab === "egresos" && <ReporteEgresos movements={movements} />}
      {reportTab === "cobranzas" && <ReporteCobranzas movements={movements} />}
    </div>
  );
}

/* ─── Reporte Ingresos ─── */
function ReporteIngresos({ movements }) {
  const ingresos = movements.filter(m => m.tipo === "Ingreso");
  const byCategory = {};
  ingresos.forEach(m => { byCategory[m.categoria] = (byCategory[m.categoria] || 0) + (parseFloat(m.monto) || 0); });
  const catData = Object.entries(byCategory).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, value }));
  const byMonth = {};
  ingresos.forEach(m => { const month = (m.fecha || "").slice(0, 7); if (month) byMonth[month] = (byMonth[month] || 0) + (parseFloat(m.monto) || 0); });
  const monthData = Object.entries(byMonth).sort().map(([m, v]) => ({ month: m, total: v }));
  const total = ingresos.reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
  const COLORS = ["#1B5E9E", "#3B82C4", "#4DA3E8", "#059669", "#34D399", "#D97706", "#F59E0B", "#6366F1"];

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, color: C.navy }}>Tablero de Ingresos</h3>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{fmtShort(total)}</div>
      </div>
      {catData.length === 0 ? <p style={{ color: C.grayMid, textAlign: "center", padding: 30 }}>Sin datos de ingresos. Agregue movimientos para ver el tablero.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>Por Categoría</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>Tendencia Mensual</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtShort(v)} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="total" fill={C.green} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reporte Egresos ─── */
function ReporteEgresos({ movements }) {
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [tipoEgreso, setTipoEgreso] = useState("");

  const egresos = movements.filter(m => {
    if (m.tipo !== "Egreso") return false;
    if (rangeFrom && m.fecha < rangeFrom) return false;
    if (rangeTo && m.fecha > rangeTo) return false;
    if (tipoEgreso && m.categoria !== tipoEgreso) return false;
    return true;
  });
  const ingresos = movements.filter(m => m.tipo === "Ingreso").reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
  const totalEgresos = egresos.reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
  const relacion = ingresos > 0 ? ((totalEgresos / ingresos) * 100).toFixed(2) : 0;
  const byCategory = {};
  egresos.forEach(m => { byCategory[m.categoria] = (byCategory[m.categoria] || 0) + (parseFloat(m.monto) || 0); });
  const ranking = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 25) + "…" : name, value }));
  const byMonth = {};
  egresos.forEach(m => { const mo = (m.fecha || "").slice(0, 7); if (mo) byMonth[mo] = (byMonth[mo] || 0) + (parseFloat(m.monto) || 0); });
  const trendData = Object.entries(byMonth).sort().map(([m, v]) => ({ month: m, total: v }));
  const COLORS = ["#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#1B5E9E", "#3B82C4", "#D97706", "#9CA3AF"];

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div><label style={labelStyle}>Desde</label><input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} style={{ ...inputStyle, width: 140 }} /></div>
        <div><label style={labelStyle}>Hasta</label><input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)} style={{ ...inputStyle, width: 140 }} /></div>
        <div>
          <label style={labelStyle}>Categoría de Egreso</label>
          <select value={tipoEgreso} onChange={e => setTipoEgreso(e.target.value)} style={{ ...selectStyle, width: 200 }}>
            <option value="">Todas</option>
            {CATEGORIES.filter(c => c.type === "Egreso").map(c => <option key={c.cod} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#FEF2F2", borderRadius: 8, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>Total Egresos</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.red }}>{fmtShort(totalEgresos)}</div>
        </div>
        <div style={{ background: "#EFF6FF", borderRadius: 8, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>Relación Egresos / Ingresos</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.blue }}>{relacion}%</div>
        </div>
        <div style={{ background: "#FFF7ED", borderRadius: 8, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>Top Concepto</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>{ranking[0]?.name || "—"}</div>
        </div>
      </div>
      {ranking.length === 0 ? <p style={{ color: C.grayMid, textAlign: "center", padding: 30 }}>Sin datos de egresos para el rango seleccionado.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>Top Ranking por Concepto</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ranking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmtShort(v)} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 9 }} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {ranking.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>Tendencia Mensual</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtShort(v)} />
                <Tooltip formatter={v => fmt(v)} />
                <Line type="monotone" dataKey="total" stroke={C.red} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reporte Cobranzas ─── */
function ReporteCobranzas({ movements }) {
  const [periodo, setPeriodo] = useState("2026-03");
  const [rangeFrom, setRangeFrom] = useState("2026-01");
  const [rangeTo, setRangeTo] = useState("2026-05");
  const [viewMode, setViewMode] = useState("periodo");

  const invoices = SAMPLE_INVOICES;
  const totalFacturado = invoices.reduce((s, i) => s + i.total, 0);
  const totalCobrado = invoices.reduce((s, i) => s + (i.total - i.saldo), 0);
  const totalPendiente = invoices.reduce((s, i) => s + i.saldo, 0);
  const deudaVencida = invoices.filter(i => i.status === "Pendiente").reduce((s, i) => s + i.saldo, 0);

  const cobranzasMes = movements.filter(m => m.tipo === "Ingreso" && m.categoria === "Cobranzas de Obras sociales" && (m.fecha || "").startsWith(periodo));
  const totalCobranzasMes = cobranzasMes.reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
  const facturacionMes = invoices.filter(i => i.periodo === periodo.slice(0, 7)).reduce((s, i) => s + i.total, 0);

  const indicadorMes = facturacionMes > 0 ? ((totalCobranzasMes / facturacionMes) * 100).toFixed(2) : "0.00";
  const indicadorRango = totalFacturado > 0 ? ((totalCobrado / totalFacturado) * 100).toFixed(2) : "0.00";
  const moraPromedio = invoices.length > 0 ? (invoices.reduce((s) => s + 37, 0) / invoices.length).toFixed(0) : 0;
  const riesgoGlobal = totalPendiente > 0 ? ((37 * totalPendiente) / totalPendiente).toFixed(2) : "0.00";

  const buckets = [
    { name: "No vencido", value: invoices.filter(i => i.status === "Cancelada" || i.saldo === 0).length },
    { name: "1-30 días", value: 2 }, { name: "31-60 días", value: 3 },
    { name: "61-90 días", value: 1 }, { name: "+90 días", value: invoices.filter(i => i.status === "Pendiente").length },
  ];
  const deudaPie = [
    { name: "Deuda Vencida", value: Math.max(deudaVencida, 1) },
    { name: "Deuda No Vencida", value: Math.max((totalPendiente - deudaVencida) || totalPendiente * 0.3, 1) },
  ];
  const cobranzaPie = [
    { name: "Cancelada", value: totalCobrado || 1 },
    { name: "Pendiente", value: totalPendiente || 1 },
  ];

  const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
  const compData = months.map(m => ({
    month: m,
    facturacion: invoices.filter(i => i.periodo === m).reduce((s, i) => s + i.total, 0),
    cobranzas: movements.filter(mv => mv.tipo === "Ingreso" && mv.categoria === "Cobranzas de Obras sociales" && (mv.fecha || "").startsWith(m)).reduce((s, mv) => s + (parseFloat(mv.monto) || 0), 0),
  }));

  const COLORS_PIE1 = ["#DC2626", "#3B82C4"];
  const COLORS_PIE2 = ["#059669", "#D97706"];

  return (
    <div>
      <div style={{ ...cardStyle, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["periodo", "comparativo"].map(v => (
            <button key={v} onClick={() => setViewMode(v)} style={{ ...baseBtn, fontSize: 11, padding: "5px 12px", background: viewMode === v ? C.blue : C.grayBg, color: viewMode === v ? C.white : C.gray }}>
              {v === "periodo" ? "Por Período" : "Comparativo"}
            </button>
          ))}
        </div>
        {viewMode === "periodo" && (
          <div><label style={labelStyle}>Mes</label><input type="month" value={periodo} onChange={e => setPeriodo(e.target.value)} style={{ ...inputStyle, width: 160 }} /></div>
        )}
        {viewMode === "comparativo" && (
          <>
            <div><label style={labelStyle}>Desde</label><input type="month" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} style={{ ...inputStyle, width: 140 }} /></div>
            <div><label style={labelStyle}>Hasta</label><input type="month" value={rangeTo} onChange={e => setRangeTo(e.target.value)} style={{ ...inputStyle, width: 140 }} /></div>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Cobranzas/Facturación Mes", value: `${indicadorMes}%`, color: C.blue },
          { label: "Cobranzas/Facturación Rango", value: `${indicadorRango}%`, color: C.blueAccent },
          { label: "Mora Promedio (días)", value: `${moraPromedio} días`, color: C.amber },
          { label: "Riesgo Global", value: riesgoGlobal, color: C.red },
        ].map((kpi, i) => (
          <div key={i} style={{ ...cardStyle, textAlign: "center", padding: 16, marginBottom: 0 }}>
            <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={cardStyle}>
          <h4 style={{ fontSize: 12, color: C.gray, margin: "0 0 8px" }}>Deuda Vencida vs No Vencida</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={deudaPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} style={{ fontSize: 10 }}>
              {deudaPie.map((_, i) => <Cell key={i} fill={COLORS_PIE1[i]} />)}
            </Pie><Tooltip formatter={v => fmt(v)} /><Legend wrapperStyle={{ fontSize: 10 }} /></PieChart>
          </ResponsiveContainer>
        </div>
        <div style={cardStyle}>
          <h4 style={{ fontSize: 12, color: C.gray, margin: "0 0 8px" }}>Bucket de Deuda</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={buckets}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="name" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill={C.blue} radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div style={cardStyle}>
          <h4 style={{ fontSize: 12, color: C.gray, margin: "0 0 8px" }}>Deuda Cancelada vs Pendiente</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={cobranzaPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} style={{ fontSize: 10 }}>
              {cobranzaPie.map((_, i) => <Cell key={i} fill={COLORS_PIE2[i]} />)}
            </Pie><Tooltip formatter={v => fmt(v)} /><Legend wrapperStyle={{ fontSize: 10 }} /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <h4 style={{ fontSize: 12, color: C.gray, margin: "0 0 12px" }}>Facturación Mensual vs Cobranzas Mensuales</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={compData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtShort(v)} />
            <Tooltip formatter={v => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="facturacion" name="Facturación" fill={C.blue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="cobranzas" name="Cobranzas" fill={C.green} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize: 10, color: C.grayMid, marginTop: 8, textAlign: "center" }}>
          Facturación por tipo de comprobante (Factura, ND, Refacturación) vs Cobranzas de Obras Sociales
        </p>
      </div>
    </div>
  );
}
