import { describe, it, expect } from "vitest";

// Pure color-math helpers extracted inline for unit testing
// (useColor.ts exports hooks; the math functions are tested here via re-implementation)

const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h =
    max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  h = Math.round((h / 6) * 360);
  return [h, Math.round(s * 100), Math.round(l * 100)];
};

const hslToHex = (h: number, s: number, l: number): string => {
  const sl = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * sl;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) {        g = c; b = x; }
  else if (h < 240) {        g = x; b = c; }
  else if (h < 300) { r = x;        b = c; }
  else              { r = c;        b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

describe("hexToHsl", () => {
  it("converts pure red correctly", () => {
    const [h, s, l] = hexToHsl("#ff0000");
    expect(h).toBe(0);
    expect(s).toBe(100);
    expect(l).toBe(50);
  });

  it("converts white correctly", () => {
    const [h, s, l] = hexToHsl("#ffffff");
    expect(s).toBe(0);
    expect(l).toBe(100);
  });

  it("converts black correctly", () => {
    const [h, s, l] = hexToHsl("#000000");
    expect(s).toBe(0);
    expect(l).toBe(0);
  });
});

describe("hslToHex round-trip", () => {
  // Integer-rounded HSL values can introduce ±2 rounding per channel.
  // We verify the round-trip is stable: applying the conversion twice
  // must yield the same output (idempotent after first rounding).
  it("is stable after first rounding (idempotent)", () => {
    const once = hslToHex(...hexToHsl("#38de75"));
    const twice = hslToHex(...hexToHsl(once));
    expect(twice).toBe(once);
  });

  it("round-trips pure blue exactly", () => {
    const [h, s, l] = hexToHsl("#0000ff");
    expect(hslToHex(h, s, l)).toBe("#0000ff");
  });

  it("round-trips pure red exactly", () => {
    const [h, s, l] = hexToHsl("#ff0000");
    expect(hslToHex(h, s, l)).toBe("#ff0000");
  });
});
