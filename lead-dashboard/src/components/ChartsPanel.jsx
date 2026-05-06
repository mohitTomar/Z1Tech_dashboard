import { useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, ZAxis,
} from "recharts";
import { useDashboard } from "../context/DashboardContext";
import { shortName } from "../utils/dataProcessor";

/* ─── Tooltips ─────────────────────────────────────────────────────────────── */
const TrendTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tip.box}>
      <div style={tip.label}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ ...tip.row, color: p.color }}>
          <span>{shortName(p.dataKey)}</span>
          <b>{p.value?.toFixed(1)}%</b>
        </div>
      ))}
    </div>
  );
};

const BarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tip.box}>
      <div style={{ ...tip.label, color: "#fff" }}>{shortName(d.name)}</div>
      <div style={tip.row}><span>Accepted</span><b>{d.accepted}</b></div>
      <div style={tip.row}><span>Rejected</span><b>{d.rejected}</b></div>
      <div style={tip.row}><span>Rate</span><b>{d.acc_rate}%</b></div>
    </div>
  );
};

const MatrixTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tip.box}>
      <div style={{ ...tip.label, color: d.color }}>{shortName(d.name)}</div>
      <div style={tip.row}><span>Acceptance</span><b>{d.x}%</b></div>
      <div style={tip.row}><span>Trend</span><b>{d.y > 0 ? "+" : ""}{d.y}pp</b></div>
      <div style={tip.row}><span>Volume</span><b>{d.z} leads</b></div>
    </div>
  );
};

const tip = {
  box:   { background: "#1f2937", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#f9fafb", minWidth: 140 },
  label: { color: "#9ca3af", marginBottom: 4, fontSize: 11 },
  row:   { display: "flex", justifyContent: "space-between", gap: 12, color: "#e5e7eb" },
};

/* ─── Main component ────────────────────────────────────────────────────────── */
const TABS = [
  { id: "trend",  label: "📈 Monthly Trend" },
  { id: "volume", label: "📊 Volume Breakdown" },
  { id: "matrix", label: "🧭 Quality Matrix" },
];

export default function ChartsPanel({ selected, onSelect }) {
  const { sourceMap, cutoffs } = useDashboard();
  const [activeTab, setActiveTab] = useState("trend");
  const SOURCES = useMemo(() => Object.keys(sourceMap), [sourceMap]);

  const allMonths = useMemo(() => {
    const ms = new Set();
    SOURCES.forEach((s) => sourceMap[s].monthly.forEach((m) => ms.add(m.month)));
    return [...ms].sort();
  }, [SOURCES, sourceMap]);

  const trendData = useMemo(() =>
    allMonths.map((month) => {
      const row = { month };
      SOURCES.forEach((src) => {
        const m = sourceMap[src].monthly.find((x) => x.month === month);
        row[src] = m ? m.rate : null;
      });
      return row;
    }), [allMonths, SOURCES, sourceMap]);

  const barData = useMemo(() =>
    SOURCES.map((name) => ({
      name,
      accepted: sourceMap[name].accepted,
      rejected: sourceMap[name].total - sourceMap[name].accepted,
      acc_rate: sourceMap[name].acc_rate,
    })).sort((a, b) => b.acc_rate - a.acc_rate), [SOURCES, sourceMap]);

  const matrixData = useMemo(() =>
    SOURCES.map((name) => ({
      name, x: sourceMap[name].acc_rate,
      y: sourceMap[name].trend,
      z: sourceMap[name].total,
      color: sourceMap[name].color,
    })), [SOURCES, sourceMap]);

  return (
    <div style={s.panel}>
      {/* Tabs */}
      <div style={s.tabRow}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            ...s.tab,
            background: activeTab === t.id ? "#0f172a" : "#fff",
            color:      activeTab === t.id ? "#fff"    : "#6b7280",
            border:     activeTab === t.id ? "1.5px solid #0f172a" : "1px solid #e5e7eb",
          }}>{t.label}</button>
        ))}
        {selected && (
          <span style={s.filterChip}>
            Filtered: <b style={{ color: sourceMap[selected]?.color }}>{shortName(selected)}</b>
            <button onClick={() => onSelect(null)} style={s.clearFilter}>✕</button>
          </span>
        )}
      </div>

      {/* ── Trend ── */}
      {activeTab === "trend" && (
        <>
          <div style={s.chartSub}>Carrier acceptance rate (%) by month — click legend to filter</div>
          <div style={s.legend}>
            {SOURCES.map((name) => (
              <div key={name} onClick={() => onSelect(selected === name ? null : name)}
                style={{ ...s.legendItem, opacity: !selected || selected === name ? 1 : 0.3 }}>
                <div style={{ width: 12, height: 3, borderRadius: 2, background: sourceMap[name].color }} />
                <span>{shortName(name)}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v + "%"} domain={[0, 100]} />
              <ReferenceLine y={cutoffs.scaleMin} stroke="#16a34a" strokeDasharray="4 3" strokeOpacity={0.5}
                label={{ value: `Scale ≥${cutoffs.scaleMin}%`, position: "right", fontSize: 9, fill: "#16a34a" }} />
              <ReferenceLine y={cutoffs.growMin} stroke="#2563eb" strokeDasharray="4 3" strokeOpacity={0.5}
                label={{ value: `Grow ≥${cutoffs.growMin}%`, position: "right", fontSize: 9, fill: "#2563eb" }} />
              <Tooltip content={<TrendTip />} />
              {SOURCES.map((name) => (
                <Line key={name} type="monotone" dataKey={name}
                  stroke={sourceMap[name].color}
                  strokeWidth={!selected || selected === name ? 2.5 : 1}
                  opacity={!selected || selected === name ? 1 : 0.15}
                  dot={{ r: !selected || selected === name ? 3 : 0 }}
                  activeDot={{ r: 5 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* ── Volume ── */}
      {activeTab === "volume" && (
        <>
          <div style={s.chartSub}>Accepted vs rejected leads per source (sorted by acceptance rate)</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tickFormatter={shortName} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarTip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="accepted" stackId="a">
                {barData.map((d) => <Cell key={d.name} fill={sourceMap[d.name].color} />)}
              </Bar>
              <Bar dataKey="rejected" stackId="a" radius={[4, 4, 0, 0]} fill="#e5e7eb" />
            </BarChart>
          </ResponsiveContainer>
          <div style={s.volLegend}>
            <span><span style={{ ...s.dot, background: "#16a34a" }} /> Accepted (colour = source)</span>
            <span><span style={{ ...s.dot, background: "#e5e7eb" }} /> Rejected</span>
          </div>
        </>
      )}

      {/* ── Matrix ── */}
      {activeTab === "matrix" && (
        <>
          <div style={s.chartSub}>Acceptance rate vs trend momentum — bubble size = lead volume</div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 16, right: 40, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" domain={[0, 100]} tickFormatter={(v) => v + "%"}
                tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false}
                label={{ value: "Acceptance rate (%)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#9ca3af" }} />
              <YAxis type="number" dataKey="y"
                tickFormatter={(v) => (v > 0 ? "+" : "") + v + "pp"}
                tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="z" range={[300, 900]} />
              <ReferenceLine x={cutoffs.scaleMin} stroke="#16a34a" strokeDasharray="4 3" strokeOpacity={0.6} />
              <ReferenceLine x={cutoffs.growMin}  stroke="#2563eb" strokeDasharray="4 3" strokeOpacity={0.6} />
              <ReferenceLine y={cutoffs.trendCutoff} stroke="#7c3aed" strokeDasharray="4 3" strokeOpacity={0.6} />
              <Tooltip content={<MatrixTip />} />
              <Scatter data={matrixData}>
                {matrixData.map((d) => (
                  <Cell key={d.name} fill={d.color + "bb"} stroke={d.color} strokeWidth={1.5} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={s.quadrants}>
            {[
              { bg: "#dcfce7", text: "#15803d", label: "↗ Scale zone", desc: `rate ≥ ${cutoffs.scaleMin}% & trend ≥ ${cutoffs.trendCutoff}pp` },
              { bg: "#dbeafe", text: "#1d4ed8", label: "→ Grow zone",  desc: `rate ≥ ${cutoffs.growMin}% & trend ≥ ${cutoffs.trendCutoff}pp` },
              { bg: "#fef3c7", text: "#b45309", label: "⚠ Watch zone", desc: `rate ≥ ${cutoffs.growMin}% & trend < ${cutoffs.trendCutoff}pp` },
              { bg: "#fee2e2", text: "#b91c1c", label: "✕ Cut zone",   desc: `rate < ${cutoffs.growMin}% & trend < ${cutoffs.trendCutoff}pp` },
            ].map((q) => (
              <div key={q.label} style={{ background: q.bg, borderRadius: 8, padding: "6px 10px" }}>
                <span style={{ fontWeight: 700, color: q.text, fontSize: 11 }}>{q.label}</span>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{q.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "20px 24px", marginBottom: 16 },
  tabRow: { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  tab: { fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer", transition: "all .15s" },
  filterChip: { marginLeft: "auto", fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 },
  clearFilter: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: 0 },
  chartSub: { fontSize: 12, color: "#6b7280", marginBottom: 12 },
  legend: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  legendItem: { display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 11, color: "#374151", transition: "opacity .2s" },
  volLegend: { display: "flex", gap: 16, fontSize: 11, color: "#6b7280", marginTop: 8, alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 2, display: "inline-block", marginRight: 4 },
  quadrants: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 },
};
