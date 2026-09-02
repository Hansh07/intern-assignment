export function formatDate(date) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (typeof date === "string") {
    const d = new Date(date.includes("T") ? date : `${date}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return date.slice(0, 10);
  }
  return String(date);
}

export function dateValue(date) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.getTime();
  }
  const timestamp = new Date(date).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
