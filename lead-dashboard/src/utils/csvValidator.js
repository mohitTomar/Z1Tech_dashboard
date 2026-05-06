import { REQUIRED_FIELDS } from "./constants";

/**
 * Validates parsed CSV rows.
 * Returns { valid: bool, missingFields: [], extraFields: [] }
 */
export function validateCSV(rows) {
  if (!rows || rows.length === 0) {
    return { valid: false, missingFields: REQUIRED_FIELDS, extraFields: [] };
  }

  const cols = Object.keys(rows[0]).map((c) => c.trim());
  const missingFields = REQUIRED_FIELDS.filter((f) => !cols.includes(f));
  const extraFields = cols.filter((c) => !REQUIRED_FIELDS.includes(c));

  return {
    valid: missingFields.length === 0,
    missingFields,
    extraFields,
  };
}

/**
 * Strips any extra columns from rows, keeping only REQUIRED_FIELDS.
 */
export function normaliseRows(rows) {
  return rows.map((row) => {
    const clean = {};
    REQUIRED_FIELDS.forEach((f) => {
      clean[f] = (row[f] ?? "").toString().trim();
    });
    return clean;
  });
}
