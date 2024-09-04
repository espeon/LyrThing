export default function s2t(seconds: number, displayMs = false) {
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
    return `${mm}:${String(ss).padStart(2, "0")}${ms > 0 && displayMs ? `.${String(ms).padStart(3, "0")}` : ""}`;
  }