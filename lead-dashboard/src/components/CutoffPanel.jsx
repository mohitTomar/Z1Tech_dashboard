import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";

export default function CutoffPanel({ onClose }) {
  const { cutoffs, updateCutoffs } = useDashboard();
  const [local, setLocal] = useState({ ...cutoffs });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setLocal((p) => ({ ...p, [key]: Math.min(100, Math.max(-100, num)) }));
    setSaved(false);
  };

  const apply = () => {
    updateCutoffs(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const reset = () => {
    const def = { scaleMin: 55, growMin: 40, trendCutoff: 0 };
    setLocal(def);
    updateCutoffs(def);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>⚙️ Cutoff Settings</div>
            <div style={styles.sub}>Adjust how sources are classified</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Visualiser */}
          <div style={styles.barWrap}>
            <div style={styles.barLabel}>Acceptance Rate Scale</div>
            <div style={styles.bar}>
              <div style={{ ...styles.seg, background: "#fee2e2", width: `${local.growMin}%` }}>
                <span style={{ ...styles.segLabel, color: "#b91c1c" }}>Cut</span>
              </div>
              <div style={{ ...styles.seg, background: "#dbeafe", width: `${local.scaleMin - local.growMin}%` }}>
                <span style={{ ...styles.segLabel, color: "#1d4ed8" }}>Grow</span>
              </div>
              <div style={{ ...styles.seg, background: "#dcfce7", width: `${100 - local.scaleMin}%`, borderRadius: "0 6px 6px 0" }}>
                <span style={{ ...styles.segLabel, color: "#15803d" }}>Scale</span>
              </div>
            </div>
            <div style={styles.barScale}>
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <Slider label="Scale threshold" sublabel="Acceptance rate ≥ this → Scale ↑"
            value={local.scaleMin} min={local.growMin + 1} max={100}
            color="#16a34a" onChange={(v) => set("scaleMin", v)} />

          <Slider label="Grow threshold" sublabel="Acceptance rate ≥ this → Grow / Watch"
            value={local.growMin} min={1} max={local.scaleMin - 1}
            color="#2563eb" onChange={(v) => set("growMin", v)} />

          <Slider label="Trend cutoff" sublabel="Trend ≥ this pp → positive momentum"
            value={local.trendCutoff} min={-20} max={20}
            color="#7c3aed" onChange={(v) => set("trendCutoff", v)} suffix="pp" />

          {/* Matrix preview */}
          <div style={styles.matrixPreview}>
            <div style={styles.matrixTitle}>Resulting classification</div>
            <div style={styles.matrix}>
              {[
                { label: "Scale ↑", bg: "#dcfce7", text: "#15803d", cond: `rate ≥ ${local.scaleMin}% & trend ≥ ${local.trendCutoff}pp` },
                { label: "Grow →",  bg: "#dbeafe", text: "#1d4ed8", cond: `rate ≥ ${local.growMin}% & trend ≥ ${local.trendCutoff}pp` },
                { label: "Watch ⚠", bg: "#fef3c7", text: "#b45309", cond: `rate ≥ ${local.growMin}% & trend < ${local.trendCutoff}pp` },
                { label: "Cut ✕",   bg: "#fee2e2", text: "#b91c1c", cond: `rate < ${local.growMin}% & trend < ${local.trendCutoff}pp` },
              ].map((v) => (
                <div key={v.label} style={{ ...styles.matrixCell, background: v.bg }}>
                  <span style={{ fontWeight: 700, color: v.text, fontSize: 12 }}>{v.label}</span>
                  <span style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{v.cond}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.resetBtn} onClick={reset}>Reset defaults</button>
          <button style={{ ...styles.applyBtn, background: saved ? "#16a34a" : "#2563eb" }} onClick={apply}>
            {saved ? "✓ Applied!" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, sublabel, value, min, max, color, onChange, suffix = "%" }) {
  return (
    <div style={slStyles.wrap}>
      <div style={slStyles.row}>
        <div>
          <div style={slStyles.label}>{label}</div>
          <div style={slStyles.sub}>{sublabel}</div>
        </div>
        <div style={{ ...slStyles.val, color }}>{value}{suffix}</div>
      </div>
      <input
        type="range" min={min} max={max} value={value} step={1}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...slStyles.range, accentColor: color }}
      />
      <div style={slStyles.minmax}>
        <span>{min}{suffix}</span><span>{max}{suffix}</span>
      </div>
    </div>
  );
}

const slStyles = {
  wrap: { marginBottom: 20 },
  row:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  label:{ fontSize: 13, fontWeight: 600, color: "#1e293b" },
  sub:  { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  val:  { fontSize: 22, fontWeight: 800, minWidth: 50, textAlign: "right" },
  range:{ width: "100%", cursor: "pointer", height: 4 },
  minmax:{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#94a3b8", marginTop:2 },
};

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "#00000066", zIndex: 1000,
    display: "flex", justifyContent: "flex-end",
  },
  panel: {
    width: 400, maxWidth: "100vw", background: "#fff",
    boxShadow: "-8px 0 40px #0003",
    display: "flex", flexDirection: "column",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    maxHeight: "100vh", overflowY: "auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "24px 24px 0",
  },
  title: { fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 2 },
  sub:   { fontSize: 12, color: "#64748b" },
  closeBtn: {
    background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", padding: 4,
  },
  body: { padding: "20px 24px", flex: 1 },
  footer: {
    padding: "16px 24px", borderTop: "1px solid #e5e7eb",
    display: "flex", gap: 10, justifyContent: "flex-end",
  },
  resetBtn: {
    fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 8,
    border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: "pointer",
  },
  applyBtn: {
    fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 8,
    border: "none", color: "#fff", cursor: "pointer", transition: "background .3s",
  },
  barWrap: { marginBottom: 24 },
  barLabel: { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 },
  bar: { display: "flex", height: 28, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb" },
  seg: { display: "flex", alignItems: "center", justifyContent: "center", transition: "width .2s", minWidth: 20 },
  segLabel: { fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" },
  barScale: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 4 },
  matrixPreview: { background: "#f8fafc", borderRadius: 12, padding: "14px 16px" },
  matrixTitle: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 },
  matrix: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  matrixCell: {
    borderRadius: 8, padding: "8px 10px",
    display: "flex", flexDirection: "column",
  },
};
