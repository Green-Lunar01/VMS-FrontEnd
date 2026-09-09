/**
 * There is no export endpoint on the backend — the guide says to build the CSV
 * client-side from the already-filtered list.
 */
export type CsvColumn<T> = [header: string, value: (row: T) => string | number];

function escapeCell(value: string | number) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportRowsToCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const header = columns.map(([h]) => escapeCell(h)).join(",");
  const body = rows.map((row) => columns.map(([, get]) => escapeCell(get(row))).join(",")).join("\n");
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
