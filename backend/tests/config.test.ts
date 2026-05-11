import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

const ORIGINAL_ENV = { ...process.env };

function withRequiredEnv() {
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/test";
  process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-session-secret";
}

describe("loadConfig numeric parsing", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws for non-integer PORT", () => {
    withRequiredEnv();
    process.env.PORT = "abc";
    expect(() => loadConfig()).toThrow(/PORT/);
  });

  it("throws for too-small SESSION_MAX_AGE_SECONDS", () => {
    withRequiredEnv();
    process.env.SESSION_MAX_AGE_SECONDS = "0";
    expect(() => loadConfig()).toThrow(/SESSION_MAX_AGE_SECONDS/);
  });

  it("throws for non-integer BCRYPT_ROUNDS", () => {
    withRequiredEnv();
    process.env.BCRYPT_ROUNDS = "10.5";
    expect(() => loadConfig()).toThrow(/BCRYPT_ROUNDS/);
  });

  it("throws when SESSION_REMEMBER_ME_MAX_AGE_SECONDS is below SESSION_MAX_AGE_SECONDS", () => {
    withRequiredEnv();
    process.env.SESSION_MAX_AGE_SECONDS = "7200";
    process.env.SESSION_REMEMBER_ME_MAX_AGE_SECONDS = "3600";
    expect(() => loadConfig()).toThrow(/SESSION_REMEMBER_ME_MAX_AGE_SECONDS/);
  });
});
