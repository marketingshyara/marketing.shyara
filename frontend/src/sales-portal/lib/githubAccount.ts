import { z } from "zod";

export const githubUsernameSchema = z
  .string()
  .trim()
  .min(1, "Enter the client's GitHub username.")
  .max(39, "GitHub username is too long.")
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
    "Enter a valid GitHub username (letters, numbers, hyphens)."
  );

export const githubAccountEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter the email used for the client's GitHub account.")
  .email("Enter a valid email address.")
  .max(320);

export const accountsReadyPatchSchema = z.object({
  clientGithubId: githubUsernameSchema,
  clientGithubEmail: githubAccountEmailSchema,
  markAccountsReady: z.literal(true)
});

export function githubProfileUrl(username: string): string {
  const trimmed = username.trim();
  return `https://github.com/${trimmed}`;
}

export function prepareAccountsReadyPatch(githubId: string, githubEmail: string) {
  return accountsReadyPatchSchema.parse({
    clientGithubId: githubId,
    clientGithubEmail: githubEmail,
    markAccountsReady: true
  });
}
