import { z } from "zod";

const GITHUB_HOST = "github.com";

/** Normalize a github.com/owner/repo URL; returns canonical https href or null. */
export function tryNormalizeGithubRepoUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    if (u.hostname.toLowerCase() !== GITHUB_HOST) return null;
    const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repoName = parts[1].replace(/\.git$/i, "");
    if (!owner || !repoName) return null;
    const segment = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
    if (!segment.test(owner) || !segment.test(repoName)) return null;
    return `https://github.com/${owner}/${repoName}`;
  } catch {
    return null;
  }
}

export const githubRepoUrlSchema = z.preprocess((v) => {
  if (typeof v !== "string") return v;
  return tryNormalizeGithubRepoUrl(v);
}, z.string().url().max(2000));
