import { describe, expect, it, beforeEach } from "vitest";
import {
  getRememberDevicePreference,
  setRememberDevicePreference
} from "./rememberDevice";

describe("rememberDevice preference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to true when unset", () => {
    expect(getRememberDevicePreference()).toBe(true);
  });

  it("persists opt-out", () => {
    setRememberDevicePreference(false);
    expect(getRememberDevicePreference()).toBe(false);
  });
});
