import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import chroma from "chroma-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert hex to RGB
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate relative luminance for WCAG contrast
export function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Evaluate contrast against WCAG standards
export function evaluateContrast(ratio: number): {
  level: "fail" | "AA large" | "AA" | "AAA";
  score: number;
} {
  let level: "fail" | "AA large" | "AA" | "AAA" = "fail";
  let score = 0;

  if (ratio >= 7) {
    level = "AAA";
    score = 100;
  } else if (ratio >= 4.5) {
    level = "AA";
    score = 80;
  } else if (ratio >= 3) {
    level = "AA large";
    score = 50;
  } else {
    score = (ratio / 3) * 50; // Scale for scores below AA large
  }

  return { level, score };
}

// Get the best text color (black or white) for a background
export function getTextColor(backgroundColor: string): string {
  try {
    return chroma.contrast(backgroundColor, "white") > 4.5 ? "white" : "black";
  } catch {
    return "black"; // Default to black on error
  }
}

// Check if a color is valid hex
export function isValidHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Generate a random hex color
export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

// Format colors consistently
export function formatHexColor(color: string): string {
  if (!color) return "";
  // Ensure it starts with #
  if (!color.startsWith("#")) {
    color = "#" + color;
  }
  // Convert 3-digit hex to 6-digit
  if (color.length === 4) {
    color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color;
}

// Calculate color harmony score (simplified version)
export function calculateHarmonyScore(colors: string[]): number {
  if (colors.length < 2) return 100; // Perfect harmony for a single color

  // This is a simplified calculation - a real implementation would
  // consider color theory principles like complementary, analogous, etc.
  let score = 100;

  // Check if colors are too similar (penalize slightly)
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const rgb1 = hexToRgb(colors[i]);
      const rgb2 = hexToRgb(colors[j]);

      if (!rgb1 || !rgb2) continue;

      // Calculate simple Euclidean distance in RGB space
      const distance = Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
          Math.pow(rgb1.g - rgb2.g, 2) +
          Math.pow(rgb1.b - rgb2.b, 2)
      );

      // Penalize if colors are too similar
      if (distance < 30) {
        score -= 5;
      }

      // Penalize if colors are extremely different (potential clash)
      if (distance > 440) {
        // sqrt(255^2 * 3) ~= 442 is max distance
        score -= 5;
      }
    }
  }

  return Math.max(0, score);
}

// Get recommended colors based on a primary color
export function getRecommendedColors(primaryColor: string): string[] {
  try {
    const chromaColor = chroma(primaryColor);
    const hsl = chromaColor.hsl();
    const suggestions: string[] = [];

    // Always include the original color
    suggestions.push(primaryColor);

    // Generate complementary color (180 degrees opposite)
    const complementary = chroma
      .hsl((hsl[0] + 180) % 360, hsl[1] || 0.5, hsl[2] || 0.5)
      .hex();
    suggestions.push(complementary);

    // Generate triadic colors (120 degrees apart)
    const triadic1 = chroma
      .hsl((hsl[0] + 120) % 360, hsl[1] || 0.5, hsl[2] || 0.5)
      .hex();
    const triadic2 = chroma
      .hsl((hsl[0] + 240) % 360, hsl[1] || 0.5, hsl[2] || 0.5)
      .hex();
    suggestions.push(triadic1, triadic2);

    // Generate analogous colors (30 degrees apart)
    const analogous1 = chroma
      .hsl((hsl[0] + 30) % 360, hsl[1] || 0.5, hsl[2] || 0.5)
      .hex();
    const analogous2 = chroma
      .hsl((hsl[0] - 30 + 360) % 360, hsl[1] || 0.5, hsl[2] || 0.5)
      .hex();
    suggestions.push(analogous1, analogous2);

    return suggestions.slice(0, 6); // Return top 6 suggestions
  } catch (error) {
    console.error("Error generating recommended colors:", error);
    return [primaryColor];
  }
}

// Generate an intelligent improved palette based on current palette analysis
export function generateImprovedPalette(
  currentPalette: string[],
  accessibilityScore: number,
  harmonyScore: number
): string[] {
  if (currentPalette.length === 0) return [];

  try {
    const improvedPalette: string[] = [];
    const primaryColor = currentPalette[0];
    const chromaPrimary = chroma(primaryColor);

    // Always keep the primary color as base
    improvedPalette.push(primaryColor);

    // If accessibility is poor, generate high contrast colors
    if (accessibilityScore < 60) {
      // Add a high contrast color (very light or very dark)
      const primaryLuminance = chromaPrimary.luminance();
      const highContrastColor =
        primaryLuminance > 0.5
          ? chroma.hsl(chromaPrimary.hsl()[0], 0.3, 0.1).hex() // Dark color
          : chroma.hsl(chromaPrimary.hsl()[0], 0.3, 0.9).hex(); // Light color
      improvedPalette.push(highContrastColor);
    }

    // If harmony is poor, use color theory to improve relationships
    if (harmonyScore < 70) {
      const hsl = chromaPrimary.hsl();

      // Add complementary color for balance
      const complementary = chroma
        .hsl(
          (hsl[0] + 180) % 360,
          Math.min(hsl[1] || 0.6, 0.7), // Slightly reduce saturation
          hsl[2] || 0.5
        )
        .hex();
      improvedPalette.push(complementary);

      // Add split-complementary colors for more sophisticated harmony
      const splitComp1 = chroma
        .hsl((hsl[0] + 150) % 360, (hsl[1] || 0.6) * 0.8, hsl[2] || 0.5)
        .hex();
      const splitComp2 = chroma
        .hsl((hsl[0] + 210) % 360, (hsl[1] || 0.6) * 0.8, hsl[2] || 0.5)
        .hex();
      improvedPalette.push(splitComp1, splitComp2);
    } else {
      // If harmony is good, add subtle variations
      const hsl = chromaPrimary.hsl();

      // Add lighter and darker variants
      const lighter = chroma
        .hsl(
          hsl[0],
          (hsl[1] || 0.6) * 0.7,
          Math.min((hsl[2] || 0.5) + 0.3, 0.9)
        )
        .hex();
      const darker = chroma
        .hsl(hsl[0], hsl[1] || 0.6, Math.max((hsl[2] || 0.5) - 0.3, 0.1))
        .hex();
      improvedPalette.push(lighter, darker);

      // Add analogous color for warmth
      const analogous = chroma
        .hsl((hsl[0] + 30) % 360, hsl[1] || 0.6, hsl[2] || 0.5)
        .hex();
      improvedPalette.push(analogous);
    }

    // Ensure we have neutral colors for balance
    const hasNeutral = improvedPalette.some((color) => {
      const saturation = chroma(color).hsl()[1] || 0;
      return saturation < 0.2;
    });

    if (!hasNeutral) {
      // Add a neutral color
      const neutral = chroma.hsl(chromaPrimary.hsl()[0], 0.1, 0.7).hex();
      improvedPalette.push(neutral);
    }

    // Remove duplicates and ensure contrast
    const uniquePalette = removeSimilarColors(improvedPalette);
    return ensureAccessiblePalette(uniquePalette);
  } catch (error) {
    console.error("Error generating improved palette:", error);
    return currentPalette;
  }
}

// Remove colors that are too similar to each other
function removeSimilarColors(
  colors: string[],
  threshold: number = 25
): string[] {
  const filtered: string[] = [];

  for (const color of colors) {
    let isSimilar = false;

    for (const existingColor of filtered) {
      try {
        const distance = chroma.deltaE(color, existingColor);
        if (distance < threshold) {
          isSimilar = true;
          break;
        }
      } catch {
        // If deltaE fails, use RGB distance as fallback
        const rgb1 = chroma(color).rgb();
        const rgb2 = chroma(existingColor).rgb();
        const distance = Math.sqrt(
          Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
        );
        if (distance < 50) {
          isSimilar = true;
          break;
        }
      }
    }

    if (!isSimilar) {
      filtered.push(color);
    }
  }

  return filtered;
}

// Ensure the palette has good accessibility by adjusting colors if needed
function ensureAccessiblePalette(colors: string[]): string[] {
  const accessiblePalette: string[] = [];

  for (let i = 0; i < colors.length; i++) {
    let color = colors[i];

    // Check if this color has good contrast with others
    let hasGoodContrast = false;
    for (let j = 0; j < colors.length; j++) {
      if (i !== j) {
        const contrast = chroma.contrast(color, colors[j]);
        if (contrast >= 4.5) {
          hasGoodContrast = true;
          break;
        }
      }
    }

    // If no good contrast, adjust the color
    if (!hasGoodContrast && colors.length > 1) {
      const hsl = chroma(color).hsl();
      const lightness = hsl[2] || 0.5;

      // Make it lighter or darker to improve contrast
      const adjustedColor = chroma
        .hsl(
          hsl[0],
          hsl[1] || 0.6,
          lightness > 0.5
            ? Math.max(lightness - 0.4, 0.1)
            : Math.min(lightness + 0.4, 0.9)
        )
        .hex();

      color = adjustedColor;
    }

    accessiblePalette.push(color);
  }

  return accessiblePalette;
}

// Generate color suggestions based on specific color harmony types
export function generateColorHarmony(
  baseColor: string,
  harmonyType:
    | "monochromatic"
    | "analogous"
    | "complementary"
    | "triadic"
    | "tetradic"
    | "splitComplementary"
): string[] {
  try {
    const chromaColor = chroma(baseColor);
    const hsl = chromaColor.hsl();
    const colors: string[] = [];

    colors.push(baseColor); // Always include the base color

    switch (harmonyType) {
      case "monochromatic":
        // Generate different shades and tints of the same hue
        for (let i = 1; i <= 4; i++) {
          const lightnessVariation = (hsl[2] || 0.5) + (i * 0.15 - 0.3);
          const saturationVariation = (hsl[1] || 0.6) * (1 - i * 0.1);
          colors.push(
            chroma
              .hsl(
                hsl[0],
                Math.max(0.1, Math.min(1, saturationVariation)),
                Math.max(0.1, Math.min(0.9, lightnessVariation))
              )
              .hex()
          );
        }
        break;

      case "analogous":
        // Colors adjacent on the color wheel (30 degrees apart)
        for (let i = 1; i <= 4; i++) {
          const hueShift = i * 30;
          colors.push(
            chroma
              .hsl((hsl[0] + hueShift) % 360, hsl[1] || 0.6, hsl[2] || 0.5)
              .hex()
          );
        }
        break;

      case "complementary":
        // Color opposite on the color wheel
        colors.push(
          chroma.hsl((hsl[0] + 180) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        // Add variations of both colors
        colors.push(
          chroma
            .hsl(
              hsl[0],
              (hsl[1] || 0.6) * 0.7,
              Math.min((hsl[2] || 0.5) + 0.2, 0.9)
            )
            .hex()
        );
        colors.push(
          chroma
            .hsl(
              (hsl[0] + 180) % 360,
              (hsl[1] || 0.6) * 0.7,
              Math.min((hsl[2] || 0.5) + 0.2, 0.9)
            )
            .hex()
        );
        break;

      case "triadic":
        // Three colors evenly spaced on the color wheel
        colors.push(
          chroma.hsl((hsl[0] + 120) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        colors.push(
          chroma.hsl((hsl[0] + 240) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        break;

      case "tetradic":
        // Four colors forming a rectangle on the color wheel
        colors.push(
          chroma.hsl((hsl[0] + 90) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        colors.push(
          chroma.hsl((hsl[0] + 180) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        colors.push(
          chroma.hsl((hsl[0] + 270) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        break;

      case "splitComplementary":
        // Base color plus two colors adjacent to its complement
        colors.push(
          chroma.hsl((hsl[0] + 150) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        colors.push(
          chroma.hsl((hsl[0] + 210) % 360, hsl[1] || 0.6, hsl[2] || 0.5).hex()
        );
        break;
    }

    return removeSimilarColors(colors);
  } catch (error) {
    console.error("Error generating color harmony:", error);
    return [baseColor];
  }
}

// Parse multiple colors from pasted text
export function parseColorsFromText(text: string): string[] {
  const colors: string[] = [];

  // Regular expressions for different color formats
  const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
  const hexWithoutHashRegex = /\b(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  const rgbaRegex =
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9]*\.?[0-9]+)\s*\)/g;
  const hslRegex = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/g;
  const hslaRegex =
    /hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([0-9]*\.?[0-9]+)\s*\)/g;

  // Extract hex colors with #
  const hexMatches = text.match(hexRegex);
  if (hexMatches) {
    hexMatches.forEach((hex) => {
      try {
        const validHex = chroma(hex).hex();
        colors.push(validHex);
      } catch {
        // Invalid hex, skip
      }
    });
  }

  // Extract hex colors without # and add the # prefix
  const hexWithoutHashMatches = text.match(hexWithoutHashRegex);
  if (hexWithoutHashMatches) {
    hexWithoutHashMatches.forEach((hex) => {
      // Skip if it's already been processed as a hex with #
      if (colors.includes(`#${hex}`)) return;

      // Skip if it's a number that's too short or too long
      if (hex.length !== 3 && hex.length !== 6) return;

      // Skip if it contains only numbers (likely not a hex color)
      if (/^\d+$/.test(hex)) return;

      try {
        const validHex = chroma(`#${hex}`).hex();
        colors.push(validHex);
      } catch {
        // Invalid hex, skip
      }
    });
  }

  // Extract RGB colors
  let rgbMatch;
  while ((rgbMatch = rgbRegex.exec(text)) !== null) {
    try {
      const [, r, g, b] = rgbMatch;
      const color = chroma.rgb(parseInt(r), parseInt(g), parseInt(b)).hex();
      colors.push(color);
    } catch {
      // Invalid RGB, skip
    }
  }

  // Extract RGBA colors
  let rgbaMatch;
  while ((rgbaMatch = rgbaRegex.exec(text)) !== null) {
    try {
      const [, r, g, b, a] = rgbaMatch;
      const color = chroma
        .rgb(parseInt(r), parseInt(g), parseInt(b), parseFloat(a))
        .hex();
      colors.push(color);
    } catch {
      // Invalid RGBA, skip
    }
  }

  // Extract HSL colors
  let hslMatch;
  while ((hslMatch = hslRegex.exec(text)) !== null) {
    try {
      const [, h, s, l] = hslMatch;
      const color = chroma
        .hsl(parseInt(h), parseInt(s) / 100, parseInt(l) / 100)
        .hex();
      colors.push(color);
    } catch {
      // Invalid HSL, skip
    }
  }

  // Extract HSLA colors
  let hslaMatch;
  while ((hslaMatch = hslaRegex.exec(text)) !== null) {
    try {
      const [, h, s, l, a] = hslaMatch;
      const color = chroma
        .hsl(parseInt(h), parseInt(s) / 100, parseInt(l) / 100)
        .alpha(parseFloat(a))
        .hex();
      colors.push(color);
    } catch {
      // Invalid HSLA, skip
    }
  }

  // Remove duplicates and return
  return [...new Set(colors)];
}

// Generate suggestions specifically for improving accessibility
export function generateAccessibilityImprovedColors(
  currentPalette: string[]
): string[] {
  if (currentPalette.length === 0) return [];

  try {
    const improvedColors: string[] = [];

    // For each color in the palette, try to find a high-contrast companion
    for (const color of currentPalette) {
      const chromaColor = chroma(color);
      const luminance = chromaColor.luminance();

      // Add the original color
      improvedColors.push(color);

      // Generate a high-contrast color
      if (luminance > 0.5) {
        // If the color is light, add a dark color
        const darkColor = chroma
          .hsl(
            chromaColor.hsl()[0],
            Math.min((chromaColor.hsl()[1] || 0.6) + 0.2, 1),
            0.15
          )
          .hex();
        improvedColors.push(darkColor);
      } else {
        // If the color is dark, add a light color
        const lightColor = chroma
          .hsl(
            chromaColor.hsl()[0],
            Math.max((chromaColor.hsl()[1] || 0.6) - 0.3, 0.3),
            0.85
          )
          .hex();
        improvedColors.push(lightColor);
      }
    }

    // Add neutral colors for better accessibility
    improvedColors.push("#ffffff"); // Pure white
    improvedColors.push("#000000"); // Pure black
    improvedColors.push("#6b7280"); // Neutral gray

    return removeSimilarColors(improvedColors, 15); // More strict similarity threshold
  } catch (error) {
    console.error("Error generating accessibility improved colors:", error);
    return currentPalette;
  }
}

// Generate a random color palette
export function generateRandomPalette(size: number = 5): string[] {
  const palette: string[] = [];

  for (let i = 0; i < size; i++) {
    palette.push(generateRandomColor());
  }

  return palette;
}

// Generate a high-quality random palette using color harmony
export function generateQualityRandomPalette(size: number = 5): string[] {
  // Start with a random base color
  const baseColor = generateRandomColor();

  // Choose a random harmony type
  const harmonyTypes: Array<
    | "monochromatic"
    | "analogous"
    | "complementary"
    | "triadic"
    | "tetradic"
    | "splitComplementary"
  > = [
    "monochromatic",
    "analogous",
    "complementary",
    "triadic",
    "tetradic",
    "splitComplementary",
  ];

  const randomHarmony =
    harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];

  // Generate harmony-based colors
  const harmonyColors = generateColorHarmony(baseColor, randomHarmony);

  // If we need more colors than the harmony provides, add some variations
  while (harmonyColors.length < size) {
    try {
      const existingColor =
        harmonyColors[Math.floor(Math.random() * harmonyColors.length)];
      const chromaColor = chroma(existingColor);
      const hsl = chromaColor.hsl();

      // Create a variation by adjusting lightness slightly
      const variation = chroma
        .hsl(
          hsl[0],
          hsl[1] || 0.6,
          Math.max(
            0.1,
            Math.min(0.9, (hsl[2] || 0.5) + (Math.random() - 0.5) * 0.3)
          )
        )
        .hex();

      if (!harmonyColors.includes(variation)) {
        harmonyColors.push(variation);
      }
    } catch {
      // If variation fails, add a random color
      harmonyColors.push(generateRandomColor());
    }
  }

  // Return the requested number of colors
  return harmonyColors.slice(0, size);
}

// Generate dark variant of a color palette
export function generateDarkVariant(lightPalette: string[]): string[] {
  try {
    return lightPalette.map((color) => {
      const chromaColor = chroma(color);
      const hsl = chromaColor.hsl();

      // For dark mode, we generally want to:
      // 1. Reduce lightness significantly
      // 2. Slightly increase saturation for vibrant colors
      // 3. Maintain the hue

      const currentLightness = hsl[2] || 0.5;
      const currentSaturation = hsl[1] || 0.5;

      // Calculate new lightness - darker but not too dark
      let newLightness: number;
      if (currentLightness > 0.7) {
        // Very light colors become medium-dark
        newLightness = 0.2 + (currentLightness - 0.7) * 0.3;
      } else if (currentLightness > 0.4) {
        // Medium colors become darker
        newLightness = 0.15 + (currentLightness - 0.4) * 0.2;
      } else {
        // Already dark colors become lighter for visibility
        newLightness = Math.min(0.6, currentLightness + 0.3);
      }

      // Slightly boost saturation for more vibrant dark colors
      const newSaturation = Math.min(1, currentSaturation * 1.1);

      return chroma.hsl(hsl[0], newSaturation, newLightness).hex();
    });
  } catch (error) {
    console.error("Error generating dark variant:", error);
    return lightPalette;
  }
}

// Generate light variant of a color palette
export function generateLightVariant(darkPalette: string[]): string[] {
  try {
    return darkPalette.map((color) => {
      const chromaColor = chroma(color);
      const hsl = chromaColor.hsl();

      const currentLightness = hsl[2] || 0.5;
      const currentSaturation = hsl[1] || 0.5;

      // Calculate new lightness - lighter but not washed out
      let newLightness: number;
      if (currentLightness < 0.3) {
        // Very dark colors become medium-light
        newLightness = 0.6 + (0.3 - currentLightness) * 0.5;
      } else if (currentLightness < 0.6) {
        // Medium colors become lighter
        newLightness = 0.7 + (currentLightness - 0.3) * 0.4;
      } else {
        // Already light colors become darker for contrast
        newLightness = Math.max(0.3, currentLightness - 0.2);
      }

      // Slightly reduce saturation for softer light colors
      const newSaturation = Math.max(0.2, currentSaturation * 0.9);

      return chroma.hsl(hsl[0], newSaturation, newLightness).hex();
    });
  } catch (error) {
    console.error("Error generating light variant:", error);
    return darkPalette;
  }
}

// Generate both light and dark variants of a palette
export function generatePaletteVariants(basePalette: string[]): {
  light: string[];
  dark: string[];
} {
  return {
    light: basePalette,
    dark: generateDarkVariant(basePalette),
  };
}
