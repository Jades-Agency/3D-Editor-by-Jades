export type ColorFormat = "hex" | "rgb" | "hsl";
export type Hsl = { h: number; s: number; l: number };

function expandHex(hex: string): string {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length === 3) return h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return h;
}

export function hexToHsl(hex: string): Hsl {
  const h = expandHex(hex);
  const ri = parseInt(h.slice(0, 2), 16);
  const gi = parseInt(h.slice(2, 4), 16);
  const bi = parseInt(h.slice(4, 6), 16);
  if (isNaN(ri) || isNaN(gi) || isNaN(bi)) return { h: 0, s: 0, l: 0 };

  const r = ri / 255;
  const g = gi / 255;
  const b = bi / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  const s = delta / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (max === r) hue = 60 * (((g - b) / delta) % 6);
  else if (max === g) hue = 60 * ((b - r) / delta + 2);
  else hue = 60 * ((r - g) / delta + 4);
  hue = ((hue % 360) + 360) % 360;

  return { h: Math.round(hue), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
  };
  return { r: f(0), g: f(8), b: f(4) };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = expandHex(hex);
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

export function formatColor(h: number, s: number, l: number, format: ColorFormat): string {
  if (format === "hex") return hslToHex(h, s, l);
  if (format === "rgb") {
    const { r, g, b } = hslToRgb(h, s, l);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function parseColorToHsl(value: string): Hsl | null {
  const v = value.trim().toLowerCase();

  // 6-char hex
  if (/^#[0-9a-f]{6}$/.test(v)) return hexToHsl(v);

  // 3-char hex
  if (/^#[0-9a-f]{3}$/.test(v)) return hexToHsl(v);

  // rgb(r, g, b)
  const rgbMatch = v.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    return hexToHsl(hex);
  }

  // hsl(h, s%, l%)
  const hslMatch = v.match(
    /^hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$/
  );
  if (hslMatch) {
    const h = ((parseFloat(hslMatch[1]) % 360) + 360) % 360;
    const s = Math.min(100, Math.max(0, parseFloat(hslMatch[2])));
    const l = Math.min(100, Math.max(0, parseFloat(hslMatch[3])));
    if (isNaN(h) || isNaN(s) || isNaN(l)) return null;
    return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
  }

  return null;
}
