export function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Korean Excel compatibility
  const csv = BOM + [
    headers.join(","),
    ...rows.map(row => row.map(cell => {
      const str = String(cell);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
