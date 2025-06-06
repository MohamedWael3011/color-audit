import chroma from 'chroma-js';

/**
 * Calculates the contrast ratio between two hex colors.
 * @param color1 - The first color in hex format (e.g., '#RRGGBB').
 * @param color2 - The second color in hex format (e.g., '#RRGGBB').
 * @returns The contrast ratio.
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  return chroma.contrast(color1, color2);
};

/**
 * Defines WCAG 2.1 accessibility levels for text contrast.
 */
export type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/**
 * Gets the WCAG 2.1 accessibility level for a given contrast ratio.
 * @param ratio - The contrast ratio.
 * @returns The WCAG level.
 */
export const getWCAGLevel = (ratio: number): WCAGLevel => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
};

// Color blindness simulation functions
export type ColorBlindnessType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia' | 'achromatomaly';

/**
 * Simulates color blindness for a given color
 */
export const simulateColorBlindness = (color: string, type: ColorBlindnessType): string => {
  try {
    const rgb = chroma(color).rgb();
    let [r, g, b] = rgb;
    
    // Normalize RGB values to 0-1 range
    r /= 255;
    g /= 255;
    b /= 255;
    
    // Apply color blindness transformation matrices
    let newR, newG, newB;
    
    switch (type) {
      case 'protanopia': // Red-blind
        newR = 0.567 * r + 0.433 * g + 0.000 * b;
        newG = 0.558 * r + 0.442 * g + 0.000 * b;
        newB = 0.000 * r + 0.242 * g + 0.758 * b;
        break;
      case 'protanomaly': // Red-weak
        newR = 0.817 * r + 0.183 * g + 0.000 * b;
        newG = 0.333 * r + 0.667 * g + 0.000 * b;
        newB = 0.000 * r + 0.125 * g + 0.875 * b;
        break;
      case 'deuteranopia': // Green-blind
        newR = 0.625 * r + 0.375 * g + 0.000 * b;
        newG = 0.700 * r + 0.300 * g + 0.000 * b;
        newB = 0.000 * r + 0.300 * g + 0.700 * b;
        break;
      case 'deuteranomaly': // Green-weak
        newR = 0.800 * r + 0.200 * g + 0.000 * b;
        newG = 0.258 * r + 0.742 * g + 0.000 * b;
        newB = 0.000 * r + 0.142 * g + 0.858 * b;
        break;
      case 'tritanopia': // Blue-blind
        newR = 0.950 * r + 0.050 * g + 0.000 * b;
        newG = 0.000 * r + 0.433 * g + 0.567 * b;
        newB = 0.000 * r + 0.475 * g + 0.525 * b;
        break;
      case 'tritanomaly': // Blue-weak
        newR = 0.967 * r + 0.033 * g + 0.000 * b;
        newG = 0.000 * r + 0.733 * g + 0.267 * b;
        newB = 0.000 * r + 0.183 * g + 0.817 * b;
        break;
      case 'achromatopsia': // Complete color blindness
        { const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        newR = newG = newB = gray;
        break; }
      case 'achromatomaly': // Partial color blindness
        { const grayPartial = 0.299 * r + 0.587 * g + 0.114 * b;
        newR = 0.618 * r + 0.320 * grayPartial + 0.062 * b;
        newG = 0.163 * r + 0.775 * g + 0.062 * b;
        newB = 0.163 * r + 0.320 * grayPartial + 0.516 * b;
        break; }
      default:
        return color;
    }
    
    // Convert back to 0-255 range and ensure valid values
    const finalR = Math.max(0, Math.min(255, Math.round(newR * 255)));
    const finalG = Math.max(0, Math.min(255, Math.round(newG * 255)));
    const finalB = Math.max(0, Math.min(255, Math.round(newB * 255)));
    
    return chroma.rgb(finalR, finalG, finalB).hex();
  } catch (error) {
    console.error('Error simulating color blindness:', error);
    return color;
  }
};

/**
 * Simulates color blindness for an entire palette
 */
export const simulatePaletteColorBlindness = (palette: string[], type: ColorBlindnessType): string[] => {
  return palette.map(color => simulateColorBlindness(color, type));
};

// Palette export utilities
export interface ExportFormat {
  name: string;
  extension: string;
  generate: (palette: string[], name?: string) => string;
}

export const exportFormats: ExportFormat[] = [
  {
    name: 'CSS Variables',
    extension: 'css',
    generate: (palette: string[], name = 'palette') => {
      const cssVars = palette.map((color, index) => `  --${name}-${index + 1}: ${color};`).join('\n');
      return `:root {\n${cssVars}\n}`;
    }
  },
  {
    name: 'SCSS Variables',
    extension: 'scss',
    generate: (palette: string[], name = 'palette') => {
      return palette.map((color, index) => `$${name}-${index + 1}: ${color};`).join('\n');
    }
  },
  {
    name: 'JavaScript Array',
    extension: 'js',
    generate: (palette: string[], name = 'palette') => {
      return `const ${name} = ${JSON.stringify(palette, null, 2)};`;
    }
  },
  {
    name: 'JSON',
    extension: 'json',
    generate: (palette: string[], name = 'palette') => {
      return JSON.stringify({ [name]: palette }, null, 2);
    }
  },
  {
    name: 'Tailwind Config',
    extension: 'js',
    generate: (palette: string[], name = 'palette') => {
      const colors = palette.reduce((acc, color, index) => {
        acc[`${name}-${index + 1}`] = color;
        return acc;
      }, {} as Record<string, string>);
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colors, null, 8)}\n    }\n  }\n}`;
    }
  },
  {
    name: 'Adobe Swatch Exchange (ASE)',
    extension: 'ase',
    generate: (palette: string[], name = 'palette') => {
      // This would need a proper ASE file generator, for now return hex values
      return palette.map((color, index) => `${name}-${index + 1}: ${color}`).join('\n');
    }
  }
];

/**
 * Downloads a file with the given content
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copies text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}; 