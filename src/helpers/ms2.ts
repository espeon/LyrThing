export function s2t(seconds: number, displayMs = false, msPrecision = 3): string {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();
    if (hh) {
      return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(
        2,
        "0",
      )}`;
    }
    return `${mm}:${String(ss).padStart(2, "0")}${ms > 0 && displayMs ? `.${String(ms).padStart(msPrecision, "0") || "0".padStart(msPrecision, "0")}` : ""}`;
  }

export function s2d(seconds): Date {
  return new Date(seconds * 1000);
}