// =============================================================
// CSV 내보내기 유틸 — Excel 에서 한글이 깨지지 않도록 UTF-8 BOM 포함
// =============================================================

function escapeCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // 쉼표/따옴표/개행이 있으면 따옴표로 감싸고 내부 따옴표는 이스케이프
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// headers: 열 제목 배열, rows: 각 행(문자열/숫자 배열)
export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const lines = [headers, ...rows].map((r) => r.map(escapeCell).join(","));
  const csv = "﻿" + lines.join("\r\n"); // BOM + CRLF
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
