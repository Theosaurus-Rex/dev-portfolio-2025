/**
 * WCAG 2.1 contrast ratio maths, used by the demo components so a post can
 * never claim a ratio that disagrees with the colours it is actually rendering.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

/** Minimum contrast ratio for AA-conformant text, by text size. */
const AA = { normal: 4.5, large: 3 } as const;
/** Minimum contrast ratio for AAA-conformant text, by text size. */
const AAA = { normal: 7, large: 4.5 } as const;

export type ContrastResult = {
  /** Contrast ratio, rounded to two decimal places (1 to 21). */
  ratio: number;
  /** Ratio formatted the way WCAG docs write it, e.g. "3.45:1". */
  label: string;
  /** The AA threshold this pair was measured against. */
  threshold: number;
  passesAA: boolean;
  passesAAA: boolean;
};

/** Expands #abc to #aabbcc and returns the three channels as 0-255 integers. */
function parseHex(hex: string): [number, number, number] {
  const raw = hex.trim().replace(/^#/, '');
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map(char => char + char)
          .join('')
      : raw;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    throw new Error(`Not a hex colour: "${hex}"`);
  }

  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

/** Relative luminance of a hex colour, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(channel => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Whether WCAG counts text at this size and weight as "large", which is held to
 * a lower contrast bar (3:1 rather than 4.5:1 for AA).
 *
 * WCAG defines large as 18pt, or 14pt bold. At the 96dpi the spec assumes, that
 * is 24px and 18.66px respectively — a cliff edge, so 18px bold is *not* large
 * and needs the full 4.5:1 despite looking heavier than text that does qualify.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-large-scale
 */
export function isLargeText(fontSizePx: number, fontWeight = 400): boolean {
  return fontWeight >= 700 ? fontSizePx >= 18.66 : fontSizePx >= 24;
}

/**
 * Contrast between two hex colours, plus whether it clears the WCAG minimums.
 *
 * `large` marks text that is at least 18.66px bold or 24px regular, which WCAG
 * holds to a lower bar.
 */
export function contrast(foreground: string, background: string, large = false): ContrastResult {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  const ratio = Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
  const size = large ? 'large' : 'normal';

  return {
    ratio,
    label: `${ratio.toFixed(2)}:1`,
    threshold: AA[size],
    passesAA: ratio >= AA[size],
    passesAAA: ratio >= AAA[size],
  };
}
