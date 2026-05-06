import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { validateCSV, normaliseRows } from "../utils/csvValidator";
import { buildSourceMap } from "../utils/dataProcessor";
import { DEFAULT_CUTOFFS } from "../utils/constants";

export default function UploadScreen({ onLoad }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState(null);
  const [extraInfo, setExtraInfo] = useState(null);
  const inputRef = useRef();

  const parse = useCallback((file) => {
    setError(null);
    setExtraInfo(null);
    if (!file || !file.name.endsWith(".csv")) {
      setError("Please upload a valid .csv file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors: parseErrors }) => {
        if (parseErrors.length) {
          setError("CSV parse error: " + parseErrors[0].message);
          return;
        }

        const { valid, missingFields, extraFields } = validateCSV(data);

        if (!valid) {
          setError(
            `Missing required columns: ${missingFields.map((f) => `"${f}"`).join(", ")}`
          );
          return;
        }

        if (extraFields.length) {
          setExtraInfo(`Extra columns ignored: ${extraFields.map((f) => `"${f}"`).join(", ")}`);
        }

        const normalised = normaliseRows(data);
        const sourceMap  = buildSourceMap(normalised, DEFAULT_CUTOFFS);
        onLoad(normalised, sourceMap, file.name);
      },
    });
  }, [onLoad]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    parse(e.dataTransfer.files[0]);
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Logo mark */}
        <div style={styles.logoWrap}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <rect width="40" height="40" rx="10" fill="#0f172a" />
            <rect x="8" y="22" width="5" height="10" rx="1.5" fill="#2563eb" />
            <rect x="16" y="16" width="5" height="16" rx="1.5" fill="#7c3aed" />
            <rect x="24" y="10" width="5" height="22" rx="1.5" fill="#16a34a" />
          </svg>
        </div>

        <h1 style={styles.title}>Lead Source Intelligence</h1>
        <p style={styles.subtitle}>Upload a leads CSV to generate your carrier account dashboard</p>

        {/* Drop zone */}
        <div
          style={{
            ...styles.dropzone,
            borderColor: dragging ? "#2563eb" : "#334155",
            background: dragging ? "#1e3a5f22" : "#0f172a",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
        >
          <div style={styles.dropIcon}>
            {dragging ? "📥" : "📂"}
          </div>
          <div style={styles.dropTitle}>{dragging ? "Release to upload" : "Drop your CSV here"}</div>
          <div style={styles.dropSub}>or click to browse</div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => parse(e.target.files[0])}
          />
        </div>

        {/* Extra fields info */}
        {extraInfo && (
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ️</span> {extraInfo}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <div style={styles.errorTitle}>❌ Upload failed</div>
            <div style={styles.errorMsg}>{error}</div>
          </div>
        )}

        {/* Required fields */}
        <div style={styles.fieldsBox}>
          <div style={styles.fieldsTitle}>Required columns</div>
          <div style={styles.fieldsList}>
            {["lead_id","lead_name","source","timestamp","form_completion_time_sec","state","pincode","phone_number","carrier_acceptance_status"].map((f) => (
              <code key={f} style={styles.fieldChip}>{f}</code>
            ))}
          </div>
          <div style={styles.fieldsNote}>Extra columns are automatically ignored.</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#020817",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  card: {
    maxWidth: 520,
    width: "100%",
    textAlign: "center",
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: "0 0 8px", letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 32 },
  dropzone: {
    border: "2px dashed #334155",
    borderRadius: 16,
    padding: "48px 24px",
    cursor: "pointer",
    transition: "all .2s",
    marginBottom: 16,
  },
  dropIcon: { fontSize: 40, marginBottom: 12 },
  dropTitle: { fontWeight: 700, color: "#e2e8f0", marginBottom: 4, fontSize: 15 },
  dropSub: { fontSize: 13, color: "#475569" },
  infoBox: {
    background: "#1e3a5f",
    border: "1px solid #2563eb55",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 12,
    color: "#93c5fd",
    marginBottom: 12,
    textAlign: "left",
  },
  infoIcon: { marginRight: 6 },
  errorBox: {
    background: "#1f0a0a",
    border: "1px solid #dc262655",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 16,
    textAlign: "left",
  },
  errorTitle: { fontWeight: 700, color: "#f87171", marginBottom: 4, fontSize: 13 },
  errorMsg: { fontSize: 12, color: "#fca5a5", lineHeight: 1.6 },
  fieldsBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: "16px 18px",
    textAlign: "left",
  },
  fieldsTitle: { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 },
  fieldsList: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  fieldChip: {
    fontSize: 11,
    background: "#1e293b",
    color: "#94a3b8",
    padding: "3px 8px",
    borderRadius: 6,
    fontFamily: "monospace",
  },
  fieldsNote: { fontSize: 11, color: "#334155" },
};
