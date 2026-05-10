export function clampPage(page: number, pageSize: number, total: number): number {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.max(1, Math.min(page, totalPages));
}
