const STORAGE_KEY = "shyara_portal_remember_device";

/** Default true so portal users stay signed in unless they opt out. */
export function getRememberDevicePreference(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* private mode / blocked storage */
  }
  return true;
}

export function setRememberDevicePreference(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}
