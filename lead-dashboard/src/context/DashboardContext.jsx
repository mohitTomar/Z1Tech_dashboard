import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { DEFAULT_CUTOFFS } from "../utils/constants";
import { reapplyVerdicts } from "../utils/dataProcessor";

const DashboardContext = createContext(null);

export function DashboardProvider({ sourceMap: initialSourceMap, rows, filename, onReset, children }) {
  const [cutoffs, setCutoffs] = useState(DEFAULT_CUTOFFS);
  const [sourceMap, setSourceMap] = useState(initialSourceMap);

  const updateCutoffs = useCallback((next) => {
    setCutoffs(next);
    setSourceMap((prev) => reapplyVerdicts(prev, next));
  }, []);

  const value = useMemo(() => ({
    sourceMap, rows, filename, cutoffs, updateCutoffs, onReset,
  }), [sourceMap, rows, filename, cutoffs, updateCutoffs, onReset]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
};
