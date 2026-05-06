import { useState, useCallback } from "react";
import UploadScreen from "./components/UploadScreen";
import Dashboard    from "./components/Dashboard";

export default function App() {
  const [appState, setAppState] = useState({
    rows:      null,
    sourceMap: null,
    filename:  null,
  });

  const onLoad = useCallback((rows, sourceMap, filename) => {
    setAppState({ rows, sourceMap, filename });
  }, []);

  const onReset = useCallback(() => {
    setAppState({ rows: null, sourceMap: null, filename: null });
  }, []);

  if (!appState.sourceMap) {
    return <UploadScreen onLoad={onLoad} />;
  }

  return (
    <Dashboard
      sourceMap={appState.sourceMap}
      rows={appState.rows}
      filename={appState.filename}
      onReset={onReset}
    />
  );
}
