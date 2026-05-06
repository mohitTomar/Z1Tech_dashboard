import { useDashboard } from "../context/DashboardContext";
import { shortName } from "../utils/dataProcessor";

export default function InsightStrip() {
  const { sourceMap } = useDashboard();
  const sources = Object.keys(sourceMap);
  if (!sources.length) return null;

  const sorted     = [...sources].sort((a, b) => sourceMap[b].acc_rate - sourceMap[a].acc_rate);
  const bestSrc    = sorted[0];
  const rising     = [...sources].sort((a, b) => sourceMap[b].trend - sourceMap[a].trend)[0];
  const cuts       = sources.filter((n) => sourceMap[n].verdict === "cut");
  const scaleSrcs  = sources.filter((n) => sourceMap[n].verdict === "scale");

  const totalLeads    = sources.reduce((s, n) => s + sourceMap[n].total, 0);
  const totalAccepted = sources.reduce((s, n) => s + sourceMap[n].accepted, 0);
  const blendedRate   = totalLeads ? ((totalAccepted / totalLeads) * 100).toFixed(1) : 0;

  const cutVolume  = cuts.reduce((s, n) => s + sourceMap[n].total, 0);
  const cutAccepted = cuts.reduce((s, n) => s + sourceMap[n].accepted, 0);
  const remainLeads    = totalLeads    - cutVolume;
  const remainAccepted = totalAccepted - cutAccepted;
  const projectedRate  = remainLeads ? ((remainAccepted / remainLeads) * 100).toFixed(1) : blendedRate;

  const insights = [
    {
      icon: "🌱",
      title: "Best quality source",
      bg: "#f0fdf4", border: "#86efac", titleColor: "#15803d",
      body: (
        <>
          <b>{shortName(bestSrc)}</b> leads quality at <b>{sourceMap[bestSrc].acc_rate}%</b> acceptance.
          {sourceMap[bestSrc].total < 120
            ? " Volume is low — invest to scale this channel."
            : " Protect and grow this budget."}
        </>
      ),
    },
    {
      icon: "⚡",
      title: "Strongest momentum",
      bg: "#f5f3ff", border: "#c4b5fd", titleColor: "#7c3aed",
      body: (
        <>
          <b>{shortName(rising)}</b> has the strongest positive trend at{" "}
          <b>+{sourceMap[rising].trend}pp</b>.
          {sourceMap[rising].verdict === "scale" || sourceMap[rising].verdict === "grow"
            ? " Increase spend to capitalise on momentum."
            : " Trend improving — validate before scaling."}
        </>
      ),
    },
    {
      icon: "🔪",
      title: "Cut candidates",
      bg: "#fef2f2", border: "#fca5a5", titleColor: "#dc2626",
      body: cuts.length ? (
        <>
          <b>{cuts.map(shortName).join(", ")}</b> ({cutVolume} leads, low acceptance).{" "}
          Cutting them could lift blended acceptance from <b>{blendedRate}%</b> → <b>{projectedRate}%</b>.
        </>
      ) : (
        "No clear cut candidates — all sources meet current thresholds."
      ),
    },
    {
      icon: "📈",
      title: "Scale sources",
      bg: "#eff6ff", border: "#93c5fd", titleColor: "#1d4ed8",
      body: scaleSrcs.length ? (
        <>
          <b>{scaleSrcs.map(shortName).join(", ")}</b>{" "}
          {scaleSrcs.length === 1 ? "meets" : "meet"} both quality and trend thresholds.
          Priority targets for budget reallocation.
        </>
      ) : (
        "No sources currently meet the scale threshold. Try adjusting the cutoff settings."
      ),
    },
  ];

  return (
    <div style={s.grid}>
      {insights.map((ins) => (
        <div key={ins.title} style={{ ...s.card, background: ins.bg, border: `1px solid ${ins.border}` }}>
          <div style={{ ...s.title, color: ins.titleColor }}>
            {ins.icon} {ins.title}
          </div>
          <div style={s.body}>{ins.body}</div>
        </div>
      ))}
    </div>
  );
}

const s = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12, marginTop: 16 },
  card: { borderRadius: 12, padding: "14px 16px", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  title: { fontSize: 13, fontWeight: 700, marginBottom: 6 },
  body:  { fontSize: 12, color: "#374151", lineHeight: 1.65 },
};
