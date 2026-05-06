import { useState, useMemo } from "react";

const SEARCH_KEYS = [
  "lead_id",
  "lead_name",
  "form_completion_time_sec",
  "state",
  "pincode",
  "phone_number",
  "carrier_acceptance_status",
];

/**
 * Filters rows by a query string across all searchable fields.
 * Also supports filtering by a specific field key.
 */
export function useLeadSearch(rows) {
  const [query, setQuery]     = useState("");
  const [field, setField]     = useState("all"); // "all" or one of SEARCH_KEYS
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "Accepted" | "Rejected"

  const results = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      // Status filter
      if (statusFilter !== "all" && row.carrier_acceptance_status !== statusFilter) return false;
      // Text search
      if (!q) return true;
      if (field === "all") {
        return SEARCH_KEYS.some((k) => (row[k] || "").toLowerCase().includes(q));
      }
      return (row[field] || "").toLowerCase().includes(q);
    });
  }, [rows, query, field, statusFilter]);

  return { query, setQuery, field, setField, statusFilter, setStatusFilter, results, searchKeys: SEARCH_KEYS };
}
