import type { ApiErrorBody } from "../types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiOrigin(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  return base;
}

function apiUrl(path: string): string {
  const origin = getApiOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!origin) return `/api${p}`;
  return `${origin}/api${p}`;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function apiJson<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(apiUrl(path), {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(method === "GET" ? { cache: "no-store" as RequestCache } : {})
  });

  if (!res.ok) {
    const parsed = (await parseJsonSafe(res)) as ApiErrorBody | null;
    const err = parsed?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "UNKNOWN",
      (err?.message ?? res.statusText) || "Request failed",
      err?.details
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiBlob(
  path: string
): Promise<{ blob: Blob; filename: string | undefined }> {
  const res = await fetch(apiUrl(path), {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    const parsed = (await parseJsonSafe(res)) as ApiErrorBody | null;
    const err = parsed?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "UNKNOWN",
      (err?.message ?? res.statusText) || "Request failed",
      err?.details
    );
  }

  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename: string | undefined;
  if (cd) {
    const m = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(cd);
    if (m) filename = decodeURIComponent(m[1].replace(/["']/g, ""));
  }
  return { blob, filename };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
