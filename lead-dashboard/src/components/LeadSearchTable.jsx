import { useState } from "react";
import { useLeadSearch } from "../hooks/useLeadSearch";

const FIELD_LABELS = {
  all: "All fields",
  lead_id: "Lead ID",
  lead_name: "Lead Name",
  form_completion_time_sec: "Form Time (s)",
  state: "State",
  pincode: "Pincode",
  phone_number: "Phone",
  carrier_acceptance_status: "Status",
};

const PAGE_SIZE = 15;

export default function LeadSearchTable({ rows }) {
  const {
    query, setQuery,
    field, setField,
    statusFilter, setStatusFilter,
    results, searchKeys,
  } = useLeadSearch(rows);

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleQuery = (v) => { setQuery(v); setPage(1); };
  const handleField = (v) => { setField(v); setPage(1); };
  const handleStatus = (v) => { setStatusFilter(v); setPage(1); };

  const highlight = (text) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: "#fde68a", borderRadius: 2, padding: "0 1px" }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div style={s.wrap}>
      {/* Search bar row */}
      <div style={s.controls}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search leads…"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
          />
          {query && (
            <button style={s.clearBtn} onClick={() => handleQuery("")}>✕</button>
          )}
        </div>

        <select style={s.select} value={field} onChange={(e) => handleField(e.target.value)}>
          {["all", ...searchKeys].map((k) => (
            <option key={k} value={k}>{FIELD_LABELS[k]}</option>
          ))}
        </select>

        <select style={s.select} value={statusFilter} onChange={(e) => handleStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Results count */}
      <div style={s.resultCount}>
        {results.length === rows.length
          ? `Showing all ${rows.length} leads`
          : `${results.length} of ${rows.length} leads match`}
        {query && <span style={s.queryChip}>"{query}"</span>}
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {Object.keys(FIELD_LABELS).filter(k => k !== "all").map((k) => (
                <th key={k} style={s.th}>{FIELD_LABELS[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} style={s.empty}>No leads match your search.</td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={row.lead_id + i} style={s.tr}>
                <td style={s.td}><span style={s.idChip}>{highlight(row.lead_id)}</span></td>
                <td style={s.td}>{highlight(row.lead_name)}</td>
                <td style={{ ...s.td, textAlign: "center" }}>{highlight(row.form_completion_time_sec)}</td>
                <td style={s.td}>{highlight(row.state)}</td>
                <td style={s.td}><code style={s.code}>{highlight(row.pincode)}</code></td>
                <td style={s.td}><code style={s.code}>{highlight(row.phone_number)}</code></td>
                <td style={s.td}>
                  <span style={{
                    ...s.statusPill,
                    background: row.carrier_acceptance_status === "Accepted" ? "#dcfce7" : "#fee2e2",
                    color:      row.carrier_acceptance_status === "Accepted" ? "#15803d" : "#b91c1c",
                    border:     `1px solid ${row.carrier_acceptance_status === "Accepted" ? "#86efac" : "#fca5a5"}`,
                  }}>
                    {row.carrier_acceptance_status === "Accepted" ? "✓" : "✕"} {highlight(row.carrier_acceptance_status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={s.pageBtn} disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button style={s.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return p <= totalPages ? (
              <button key={p} style={{ ...s.pageBtn, fontWeight: p === page ? 700 : 400,
                background: p === page ? "#0f172a" : "transparent", color: p === page ? "#fff" : "#374151" }}
                onClick={() => setPage(p)}>{p}</button>
            ) : null;
          })}
          <button style={s.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button style={s.pageBtn} disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
          <span style={s.pageInfo}>Page {page} of {totalPages}</span>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  controls: { display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" },
  searchWrap: {
    flex: 1, minWidth: 200, display: "flex", alignItems: "center",
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0 12px",
  },
  searchIcon: { fontSize: 14, marginRight: 8, color: "#9ca3af" },
  searchInput: {
    flex: 1, border: "none", outline: "none", fontSize: 13, color: "#111827",
    padding: "9px 0", background: "transparent",
  },
  clearBtn: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14 },
  select: {
    border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px",
    fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", outline: "none",
  },
  resultCount: { fontSize: 12, color: "#6b7280", marginBottom: 10 },
  queryChip: { background: "#fef9c3", color: "#854d0e", borderRadius: 4, padding: "1px 6px", marginLeft: 6, fontSize: 11 },
  tableWrap: { overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    background: "#f8fafc", padding: "10px 12px", textAlign: "left",
    fontWeight: 700, color: "#374151", fontSize: 11,
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background .1s" },
  td: { padding: "10px 12px", color: "#374151", verticalAlign: "middle" },
  idChip: { background: "#f1f5f9", color: "#334155", borderRadius: 4, padding: "2px 6px", fontFamily: "monospace", fontSize: 11 },
  code: { background: "#f1f5f9", color: "#334155", borderRadius: 4, padding: "2px 6px", fontFamily: "monospace", fontSize: 11 },
  statusPill: { fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20 },
  empty: { textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: 13 },
  pagination: { display: "flex", alignItems: "center", gap: 4, marginTop: 14, flexWrap: "wrap" },
  pageBtn: {
    border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 10px",
    cursor: "pointer", fontSize: 13, background: "transparent", color: "#374151",
    transition: "all .1s",
  },
  pageInfo: { fontSize: 12, color: "#9ca3af", marginLeft: 8 },
};
