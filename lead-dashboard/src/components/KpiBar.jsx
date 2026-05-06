import { useDashboard } from "../context/DashboardContext";
import { VERDICTS } from "../utils/constants";

function KpiCard({ label, value, sub, accent, pill }) {
  return (
    <div style={s.card}>
      <div style={s.label}>{label}</div>
      <div style={{ ...s.value, color: accent || "#111827" }}>{value}</div>
      {pill && (
        <span style={{ ...s.pill, background: pill.bg, color: pill.text }}>{pill.label}</span>
      )}
      {sub && !pill && <div style={s.sub}>{sub}</div>}
    </div>
  );
}

export default function KpiBar() {
  const { sourceMap } = useDashboard();
  const sources = Object.keys(sourceMap);
  if (!sources.length) return null;

  const totalLeads    = sources.reduce((s, n) => s + sourceMap[n].total, 0);
  const totalAccepted = sources.reduce((s, n) => s + sourceMap[n].accepted, 0);
  const overallRate   = totalLeads ? ((totalAccepted / totalLeads) * 100).toFixed(1) : 0;
  const bestSrc       = [...sources].sort((a, b) => sourceMap[b].acc_rate - sourceMap[a].acc_rate)[0];
  const worstSrc      = [...sources].sort((a, b) => sourceMap[a].acc_rate - sourceMap[b].acc_rate)[0];
  const rising        = [...sources].sort((a, b) => sourceMap[b].trend - sourceMap[a].trend)[0];
  const cutCount      = sources.filter((n) => sourceMap[n].verdict === "cut").length;
  const scaleCount    = sources.filter((n) => sourceMap[n].verdict === "scale").length;

  const bestVerdict   = VERDICTS[sourceMap[bestSrc]?.verdict];

  return (
    <div style={s.bar}>
      <KpiCard label="Total Leads"     value={totalLeads.toLocaleString()} sub={`${sources.length} sources`} />
      <KpiCard label="Accepted"        value={totalAccepted.toLocaleString()} sub={`${overallRate}% blended rate`} accent="#16a34a" />
      <KpiCard label="Best Source"     value={bestSrc?.replace(/_/g, " ")}
        sub={`${sourceMap[bestSrc]?.acc_rate}% acceptance`}
        accent={sourceMap[bestSrc]?.color}
        pill={bestVerdict ? { bg: bestVerdict.bg, text: bestVerdict.text, label: bestVerdict.label } : null} />
      <KpiCard label="Rising Star"     value={rising?.replace(/_/g, " ")} sub={`+${sourceMap[rising]?.trend}pp trend`} accent="#7c3aed" />
      <KpiCard label="Scale Candidates" value={scaleCount} sub="meet quality + trend bar" accent="#16a34a" />
      <KpiCard label="Cut Candidates"  value={cutCount} sub="low rate + poor trend" accent={cutCount > 0 ? "#dc2626" : "#9ca3af"} />
    </div>
  );
}

const s = {
  bar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  card: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
    padding: "14px 18px", flex: 1, minWidth: 130,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
  },
  label: { fontSize: 11, color: "#6b7280", marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" },
  value: { fontSize: 18, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  sub:   { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  pill:  { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, display: "inline-block", marginTop: 4 },
};
