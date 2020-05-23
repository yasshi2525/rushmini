const MAX_DURATION_MSEC = 8000; // 計算時間がこれを超えたならばロールバック
const ENTRY_KEY = "route";
const ENTRY_START = "routingStart";
const ENTRY_MID = "routing";

export const startMeasure = () => {
  performance.mark(ENTRY_START);
};
export const shouldBreak = () => {
  // Operaは以下のPerfomance APIが使えないので常にfalseを返す
  if (
    performance.clearMeasures === undefined ||
    performance.getEntriesByName === undefined
  )
    return false;
  performance.clearMeasures(ENTRY_KEY);
  performance.mark(ENTRY_MID);
  performance.measure(ENTRY_KEY, ENTRY_START, ENTRY_MID);
  return (
    performance.getEntriesByName(ENTRY_KEY)[0].duration > MAX_DURATION_MSEC
  );
};
