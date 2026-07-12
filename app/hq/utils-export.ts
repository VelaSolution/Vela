/** 공용 엑셀 내보내기 — xlsx 라이브러리를 lazy import하여 번들 크기 최소화 */
export async function exportToExcel(data: Record<string, unknown>[], filename: string) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
