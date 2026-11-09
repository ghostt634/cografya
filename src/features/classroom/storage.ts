import type { Capability } from "./types";
export function loadCap(key: string): Capability | null {
  try {
    const v = localStorage.getItem(`arena-${key}`);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
export function saveCap(key: string, c: Capability) {
  localStorage.setItem(`arena-${key}`, JSON.stringify(c));
}
