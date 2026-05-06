import { useDashboard } from "../context/DashboardContext";
import { shortName } from "../utils/dataProcessor";
import { VERDICTS } from "../utils/constants";
import {
  LineChart, Line, ResponsiveContainer,
} from "recharts";

function MiniSparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
        <Line type="monotone" dataKey="rate" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function VerdictBadge({ verdict }) {
  const v = VERDICTS[verdict] || VERDICTS.watch;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: v.bg, color: v.text, border: `1px solid ${v.border}`,
    }}>{v.label}</span>
  );
}

export default function SourceCards({ selected, onSelect }) {
  const { sourceMap, cutoffs } = useDashboard();
  const sources = Object.keys(sourceMap);

  return (
    <div style={s.grid}>
      {sources.map((name) => {
        const d = sourceMap[name];
        const isSelected = selected === name;
        const trendUp = d.trend > cutoffs.trendCutoff;
        const trendDn = d.trend < cutoffs.trendCutoff;

        return (
          <div
            key={name}
            onClick={() => onSelect(isSelected ? null : name)}
            style={{
              ...s.card,
              border: isSelected ? `2px solid ${d.color}` : "1px solid #e5e7eb",
              boxShadow: isSelected ? `0 0 0 3px ${d.color}22` : "0 1px 3px #0001",
            }}
          >
            <div style={s.cardTop}>
              <div>
                <div style={s.srcName}>{shortName(name)}</div>
                <VerdictBadge verdict={d.verdict} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: d.color, lineHeight: 1 }}>
                  {d.acc_rate}%
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>acceptance</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={s.barWrap}>
              <div style={{ ...s.barFill, width: `${d.acc_rate}%`, background: d.color }} />
            </div>

            {/* Scale thresholds indicator */}
            <div style={s.thresholdRow}>
              <div style={{
                ...s.thresholdMark,
                left: `${cutoffs.growMin}%`,
                background: "#2563eb",
              }} />
              <div style={{
                ...s.thresholdMark,
                left: `${cutoffs.scaleMin}%`,
                background: "#16a34a",
              }} />
            </div>

            <div style={s.meta}>
              <span>{d.total} leads · {d.accepted} accepted</span>
              <span style={{ color: trendUp ? "#16a34a" : trendDn ? "#dc2626" : "#9ca3af", fontWeight: 600 }}>
                {d.trend > 0 ? "+" : ""}{d.trend}pp
              </span>
            </div>

            <MiniSparkline data={d.monthly} color={d.color} />

            <div style={s.foot}>
              <span>⏱ {d.avg_time}s avg</span>
              <span>📍 {d.topStates?.[0] || "—"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const s = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
    gap: 12, marginBottom: 24,
  },
  card: {
    background: "#fff", borderRadius: 14,
    padding: "14px 16px", cursor: "pointer",
    transition: "box-shadow .15s, border-color .15s",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    position: "relative",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  srcName: { fontWeight: 700, fontSize: 12, color: "#111827", marginBottom: 4 },
  barWrap: { height: 6, borderRadius: 4, background: "#f1f5f9", overflow: "visible", marginBottom: 2, position: "relative" },
  barFill: { height: "100%", borderRadius: 4, transition: "width .4s" },
  thresholdRow: { position: "relative", height: 8, marginBottom: 6 },
  thresholdMark: {
    position: "absolute", top: 0, width: 2, height: 10,
    borderRadius: 2, transform: "translateX(-50%)", opacity: 0.6,
  },
  meta: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 6 },
  foot: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginTop: 4 },
};
