import { PALETTE, DEFAULT_CUTOFFS } from "./constants";

/**
 * Derives a verdict label based on acceptance rate, trend, and user cutoffs.
 */
export function deriveVerdict(rate, trend, cutoffs = DEFAULT_CUTOFFS) {
  const { scaleMin, growMin, trendCutoff } = cutoffs;
  if (rate >= scaleMin && trend >= trendCutoff) return "scale";
  if (rate >= growMin  && trend >= trendCutoff) return "grow";
  if (rate >= growMin  && trend <  trendCutoff) return "watch";
  if (rate < growMin   && trend >= trendCutoff) return "grow";
  return "cut";
}

/**
 * Builds the aggregated source-level map from normalised rows.
 * Re-runs verdict derivation whenever cutoffs change.
 */
export function buildSourceMap(rows, cutoffs = DEFAULT_CUTOFFS) {
  const map = {};

  rows.forEach((row) => {
    const src = row.source?.trim();
    if (!src) return;
    if (!map[src]) map[src] = { total: 0, accepted: 0, times: [], monthly: {}, states: {} };
    const d = map[src];
    d.total += 1;
    if (row.carrier_acceptance_status === "Accepted") d.accepted += 1;
    const t = parseFloat(row.form_completion_time_sec);
    if (!isNaN(t)) d.times.push(t);
    const state = row.state;
    if (state) d.states[state] = (d.states[state] || 0) + 1;
    const ts = row.timestamp;
    if (ts) {
      const parts = ts.split(" ")[0].split("/");
      const month = parts[1] && parts[2] ? `${parts[1]}/${parts[2]}` : "??";
      if (!d.monthly[month]) d.monthly[month] = { t: 0, a: 0 };
      d.monthly[month].t += 1;
      if (row.carrier_acceptance_status === "Accepted") d.monthly[month].a += 1;
    }
  });

  let ci = 0;
  return Object.fromEntries(
    Object.entries(map).map(([name, d]) => {
      const color = PALETTE[ci++ % PALETTE.length];
      const acc_rate = d.total ? +((d.accepted / d.total) * 100).toFixed(1) : 0;
      const avg_time = d.times.length
        ? +(d.times.reduce((a, b) => a + b, 0) / d.times.length).toFixed(1)
        : 0;
      const sortedMonths = Object.keys(d.monthly).sort();
      const monthly = sortedMonths.map((m) => ({
        month: m,
        rate: d.monthly[m].t ? +((d.monthly[m].a / d.monthly[m].t) * 100).toFixed(1) : 0,
        total: d.monthly[m].t,
        accepted: d.monthly[m].a,
      }));
      const early = sortedMonths.slice(0, 2).map((m) => d.monthly[m]);
      const late  = sortedMonths.slice(-2).map((m) => d.monthly[m]);
      const earlyRate = early.reduce((s, x) => s + x.a, 0) / Math.max(early.reduce((s, x) => s + x.t, 0), 1) * 100;
      const lateRate  = late.reduce((s, x) => s + x.a, 0)  / Math.max(late.reduce((s, x) => s + x.t, 0), 1)  * 100;
      const trend = +(lateRate - earlyRate).toFixed(1);
      const topStates = Object.entries(d.states).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);

      return [name, {
        total: d.total, accepted: d.accepted, acc_rate, avg_time, trend,
        verdict: deriveVerdict(acc_rate, trend, cutoffs),
        monthly, topStates, color,
      }];
    })
  );
}

/**
 * Re-applies verdicts to an existing sourceMap with new cutoffs (no re-aggregation).
 */
export function reapplyVerdicts(sourceMap, cutoffs) {
  return Object.fromEntries(
    Object.entries(sourceMap).map(([name, d]) => [
      name,
      { ...d, verdict: deriveVerdict(d.acc_rate, d.trend, cutoffs) },
    ])
  );
}

export const shortName = (name) =>
  name.replace(/_/g, " ").replace("src quality tier", "Tier-");
