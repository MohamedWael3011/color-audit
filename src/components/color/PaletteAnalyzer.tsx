import React, { useEffect, useState } from "react";
import {
  getContrastRatio,
  evaluateContrast,
  calculateHarmonyScore,
  getRecommendedColors,
  generateImprovedPalette,
  generateAccessibilityImprovedColors,
  generateColorHarmony,
} from "../../lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { getWCAGLevel, type WCAGLevel } from "../../lib/color-utils";
import { cn } from "../../lib/utils";
import chroma from "chroma-js";
import { Check } from "lucide-react";

interface PaletteAnalyzerProps {
  palette: string[];
  setPalette?: (palette: string[]) => void;
  className?: string;
}

interface AnalysisResult {
  contrastScores: {
    foregroundColor: string;
    backgroundColor: string;
    ratio: number;
    level: string;
    score: number;
  }[];
  harmonyScore: number;
  accessibilityScore: number;
  overallScore: number;
  recommendations: string[];
  improvedPalette: string[];
}

const ContrastGrid: React.FC<{ palette: string[] }> = ({ palette }) => {
  if (palette.length < 2) {
    return (
      <div className="text-center text-surface-500 py-10">
        <p>Add at least two colors to see contrast details.</p>
      </div>
    );
  }

  const getLevelStyle = (level: WCAGLevel) => {
    switch (level) {
      case "AAA":
        return "bg-success-500 text-white";
      case "AA":
        return "bg-success-400 text-white";
      case "AA Large":
        return "bg-warning-500 text-white";
      case "Fail":
        return "bg-error-500 text-white";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white dark:bg-surface-800 p-2 border-b border-r border-surface-200 dark:border-surface-700 w-12 z-10"></th>
            {palette.map((color, index) => (
              <th
                key={index}
                className="p-2 border-b border-surface-200 dark:border-surface-700"
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto"
                  style={{ backgroundColor: color }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {palette.map((rowColor, rowIndex) => (
            <tr key={rowIndex}>
              <td className="sticky left-0 bg-white dark:bg-surface-800 p-2 border-b border-r border-surface-200 dark:border-surface-700 w-12 z-10">
                <div
                  className="w-8 h-8 rounded-full mx-auto"
                  style={{ backgroundColor: rowColor }}
                />
              </td>
              {palette.map((colColor, colIndex) => {
                if (rowIndex === colIndex) {
                  return (
                    <td
                      key={colIndex}
                      className="p-2 border-b border-surface-200 dark:border-surface-700 text-center bg-surface-100 dark:bg-surface-700"
                    >
                      -
                    </td>
                  );
                }
                const ratio = getContrastRatio(rowColor, colColor);
                const level = getWCAGLevel(ratio);
                return (
                  <td
                    key={colIndex}
                    className="p-2 border-b border-surface-200 dark:border-surface-700 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{ratio.toFixed(2)}</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full mt-1",
                          getLevelStyle(level)
                        )}
                      >
                        {level}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PaletteAnalyzer: React.FC<PaletteAnalyzerProps> = ({
  palette,
  setPalette,
  className,
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeColors = () => {
    // Calculate contrast between each pair of colors
    const contrastScores = [];

    for (let i = 0; i < palette.length; i++) {
      for (let j = 0; j < palette.length; j++) {
        if (i === j) continue; // Don't compare a color with itself

        const ratio = getContrastRatio(palette[i], palette[j]);
        const { level, score } = evaluateContrast(ratio);

        contrastScores.push({
          foregroundColor: palette[i],
          backgroundColor: palette[j],
          ratio,
          level,
          score,
        });
      }
    }

    // Sort by contrast ratio (descending)
    contrastScores.sort((a, b) => b.ratio - a.ratio);

    // Calculate harmony score
    const harmonyScore = calculateHarmonyScore(palette);

    // Calculate accessibility score based on contrast scores
    let accessibilitySum = 0;
    contrastScores.forEach((score) => {
      accessibilitySum += score.score;
    });

    const accessibilityScore =
      contrastScores.length > 0
        ? Math.round(accessibilitySum / contrastScores.length)
        : 0;

    // Calculate overall score
    const overallScore = Math.round((harmonyScore + accessibilityScore) / 2);

    // Generate intelligent recommendations based on analysis
    const allRecommendations = [];

    // Accessibility-specific recommendations
    if (accessibilityScore < 60) {
      const failingCombos = contrastScores.filter(
        (score) => score.level === "fail"
      ).length;
      if (failingCombos > 0) {
        allRecommendations.push(
          `${failingCombos} color combinations fail WCAG standards - consider darkening or lightening some colors`
        );
      }
      allRecommendations.push(
        "Add high-contrast colors (very light or very dark) to improve readability"
      );
    } else if (accessibilityScore < 80) {
      allRecommendations.push(
        "Good accessibility! Consider testing with color vision simulators for complete coverage"
      );
    }

    // Harmony-specific recommendations
    if (harmonyScore < 50) {
      allRecommendations.push(
        "Colors appear to clash - try using complementary, analogous, or triadic color relationships"
      );
    } else if (harmonyScore < 70) {
      allRecommendations.push(
        "Color harmony can be improved by using more systematic color relationships"
      );
    }

    // Palette size recommendations
    if (palette.length < 3) {
      allRecommendations.push(
        "Consider adding 2-3 more colors for a more versatile palette"
      );
    } else if (palette.length > 8) {
      allRecommendations.push(
        "Large palettes can be overwhelming - consider focusing on 5-7 core colors"
      );
    }

    // Specific color analysis
    const veryLightColors = palette.filter((color) => {
      try {
        return chroma(color).luminance() > 0.8;
      } catch {
        return false;
      }
    });
    const veryDarkColors = palette.filter((color) => {
      try {
        return chroma(color).luminance() < 0.2;
      } catch {
        return false;
      }
    });

    if (veryLightColors.length > palette.length * 0.6) {
      allRecommendations.push(
        "Palette is mostly light colors - add some darker shades for better contrast"
      );
    }
    if (veryDarkColors.length > palette.length * 0.6) {
      allRecommendations.push(
        "Palette is mostly dark colors - add some lighter tones for better balance"
      );
    }

    // Saturation analysis
    const highSatColors = palette.filter((color) => {
      try {
        return (chroma(color).hsl()[1] || 0) > 0.8;
      } catch {
        return false;
      }
    });
    if (highSatColors.length === palette.length && palette.length > 2) {
      allRecommendations.push(
        "All colors are highly saturated - consider adding some muted tones for balance"
      );
    }

    // Success message if everything looks good
    if (
      accessibilityScore >= 80 &&
      harmonyScore >= 70 &&
      palette.length >= 3 &&
      palette.length <= 7
    ) {
      allRecommendations.push(
        "Excellent palette! Well-balanced colors with good accessibility and harmony"
      );
    }

    // For now, return all recommendations - we'll filter them in the component
    const recommendations = allRecommendations;

    // Generate improved palette suggestion based on analysis
    let improvedPalette: string[] = [];
    if (palette.length > 0) {
      // Use intelligent palette generation based on current scores
      if (accessibilityScore < 60) {
        // Focus on accessibility improvements
        improvedPalette = generateAccessibilityImprovedColors(palette).slice(
          0,
          6
        );
      } else {
        // Use general improvements based on palette analysis
        improvedPalette = generateImprovedPalette(
          palette,
          accessibilityScore,
          harmonyScore
        );
      }

      // If we don't have enough suggestions, fallback to basic recommendations
      if (improvedPalette.length < 3) {
        const basicSuggestions = getRecommendedColors(palette[0]);
        improvedPalette = [
          ...new Set([...improvedPalette, ...basicSuggestions]),
        ].slice(0, 6);
      }
    }

    setAnalysis({
      contrastScores,
      harmonyScore,
      accessibilityScore,
      overallScore,
      recommendations,
      improvedPalette,
    });
  };

  useEffect(() => {
    if (palette.length === 0) return;

    // Simulate analysis taking time
    setIsAnalyzing(true);

    const timeoutId = setTimeout(() => {
      analyzeColors();
      setIsAnalyzing(false);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [palette]);

  if (isAnalyzing) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full animate-pulse-soft">
                  <div className="absolute top-0 left-0 w-6 h-6 bg-primary-500 rounded-full"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 bg-secondary-500 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 bg-accent-500 rounded-full"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-warning-500 rounded-full"></div>
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-surface-700">
                Analyzing your palette...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Color Palette Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg className="w-32 h-32">
                    <circle
                      className="text-surface-200"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={`${
                        analysis.overallScore > 80
                          ? "text-success-500"
                          : analysis.overallScore > 60
                          ? "text-warning-500"
                          : "text-error-500"
                      }`}
                      strokeWidth="10"
                      strokeDasharray={360}
                      strokeDashoffset={
                        360 - (360 * analysis.overallScore) / 100
                      }
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold">
                    {analysis.overallScore}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">
                      Contrast & Accessibility
                    </span>
                    <span className="text-sm font-medium">
                      {analysis.accessibilityScore}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        analysis.accessibilityScore > 80
                          ? "bg-success-500"
                          : analysis.accessibilityScore > 60
                          ? "bg-warning-500"
                          : "bg-error-500"
                      }`}
                      style={{ width: `${analysis.accessibilityScore}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Color Harmony</span>
                    <span className="text-sm font-medium">
                      {analysis.harmonyScore}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        analysis.harmonyScore > 80
                          ? "bg-success-500"
                          : analysis.harmonyScore > 60
                          ? "bg-warning-500"
                          : "bg-error-500"
                      }`}
                      style={{ width: `${analysis.harmonyScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-0.5 text-warning-500">
                        <AlertTriangle size={16} />
                      </div>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-success-600">
                  <CheckCircle size={18} />
                  <span>Your palette looks great! No issues detected.</span>
                </div>
              )}

              {analysis.improvedPalette.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">
                      Suggested palette improvements:
                    </h4>
                    {setPalette && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPalette(analysis.improvedPalette)}
                        className="flex items-center gap-2"
                      >
                        <Check size={14} />
                        Apply Suggestions
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.improvedPalette.map((color, index) => (
                      <div
                        key={`improved-${index}`}
                        className="w-8 h-8 rounded-lg border border-surface-200 dark:border-surface-600 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={() => {
                          if (setPalette) {
                            const newPalette = [...palette];
                            if (newPalette.length > index) {
                              newPalette[index] = color;
                            } else {
                              newPalette.push(color);
                            }
                            setPalette(newPalette);
                          }
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-2 flex items-center gap-1">
                    <Info size={12} />
                    <span>
                      Click individual colors to replace or use "Apply
                      Suggestions" for the full palette
                    </span>
                  </p>
                </div>
              )}

              {palette.length > 0 && (
                <div className="mt-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Explore Color Harmonies:
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          type: "complementary" as const,
                          label: "Complementary",
                          description: "Opposite colors on the wheel",
                        },
                        {
                          type: "analogous" as const,
                          label: "Analogous",
                          description: "Adjacent colors",
                        },
                        {
                          type: "triadic" as const,
                          label: "Triadic",
                          description: "Three evenly spaced colors",
                        },
                        {
                          type: "monochromatic" as const,
                          label: "Monochromatic",
                          description: "Shades of the same hue",
                        },
                      ].map(({ type, label, description }) => {
                        const harmonyColors = generateColorHarmony(
                          palette[0],
                          type
                        );
                        return (
                          <div
                            key={type}
                            className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-sm font-medium">
                                  {label}
                                </span>
                                <span className="text-xs text-surface-500 dark:text-surface-400 ml-2">
                                  {description}
                                </span>
                              </div>
                              {setPalette && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setPalette(
                                      harmonyColors.slice(
                                        0,
                                        Math.min(harmonyColors.length, 6)
                                      )
                                    )
                                  }
                                  className="text-xs"
                                >
                                  Try This
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {harmonyColors.slice(0, 6).map((color, index) => (
                                <div
                                  key={`${type}-${index}`}
                                  className="w-6 h-6 rounded border border-surface-200 dark:border-surface-600"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contrast Samples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Best Combinations</h4>
                <div className="space-y-2">
                  {analysis.contrastScores.slice(0, 5).map((item, index) => (
                    <div
                      key={`best-${index}`}
                      className="p-4 rounded-lg text-center relative overflow-hidden"
                      style={{
                        backgroundColor: item.backgroundColor,
                        color: item.foregroundColor,
                      }}
                    >
                      Sample Text ({item.ratio.toFixed(2)})
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Worst Combinations</h4>
                <div className="space-y-2">
                  {analysis.contrastScores
                    .slice(-5)
                    .reverse()
                    .map((item, index) => (
                      <div
                        key={`worst-${index}`}
                        className="p-4 rounded-lg text-center relative overflow-hidden"
                        style={{
                          backgroundColor: item.backgroundColor,
                          color: item.foregroundColor,
                        }}
                      >
                        Sample Text ({item.ratio.toFixed(2)})
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contrast Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-surface-600 dark:text-surface-400">
              WCAG contrast ratios between every color combination in your
              palette. Higher numbers are better.
            </p>
            <ContrastGrid palette={palette} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>UI Components Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-surface-600 dark:text-surface-400">
              Showing all possible color combinations (excluding same-color
              combinations).
            </p>

            <div className="space-y-8">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Buttons</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {generateAllCombinations(palette)
                    .slice(0, 12)
                    .map((combo, index) => (
                      <button
                        key={`button-${index}`}
                        className="px-4 py-2 rounded-lg font-medium transition-colors text-center"
                        style={{
                          backgroundColor: combo.background,
                          color: combo.foreground,
                        }}
                      >
                        Button {index + 1}
                      </button>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Alerts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generateAllCombinations(palette)
                    .slice(0, 8)
                    .map((combo, index) => (
                      <div
                        key={`alert-${index}`}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: combo.background,
                          color: combo.foreground,
                        }}
                      >
                        <div className="font-medium">Alert {index + 1}</div>
                        <div className="text-sm">
                          This is a sample alert message
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Cards</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generateAllCombinations(palette)
                    .slice(0, 6)
                    .map((combo, index) => (
                      <div
                        key={`card-${index}`}
                        className="rounded-lg overflow-hidden shadow-sm"
                      >
                        <div
                          className="p-3 font-medium"
                          style={{
                            backgroundColor: combo.background,
                            color: combo.foreground,
                          }}
                        >
                          Card Header {index + 1}
                        </div>
                        <div
                          className="p-3 border border-t-0 rounded-b-lg"
                          style={{
                            borderColor: combo.background,
                            backgroundColor:
                              "rgba(var(--color-surface-50), 0.8)",
                          }}
                        >
                          <p>
                            Card content with color combination {index + 1}.
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Advanced Components</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
                    <h5 className="text-sm font-medium mb-2">Badges</h5>
                    <div className="flex gap-2 flex-wrap">
                      {generateAllCombinations(palette)
                        .slice(0, 10)
                        .map((combo, index) => (
                          <div
                            key={index}
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: combo.background,
                              color: combo.foreground,
                            }}
                          >
                            Badge {index + 1}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
                    <h5 className="text-sm font-medium mb-2">Navigation</h5>
                    <div className="flex gap-1 flex-wrap">
                      {generateAllCombinations(palette)
                        .slice(0, 5)
                        .map((combo, index) => (
                          <div
                            key={index}
                            className="px-3 py-1.5 rounded text-sm font-medium"
                            style={{
                              backgroundColor: combo.background,
                              color: combo.foreground,
                            }}
                          >
                            Tab {index + 1}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Helper function to generate all possible color combinations
const generateAllCombinations = (
  palette: string[]
): { background: string; foreground: string }[] => {
  const combinations: { background: string; foreground: string }[] = [];

  for (let i = 0; i < palette.length; i++) {
    for (let j = 0; j < palette.length; j++) {
      // Skip same-color combinations
      if (i !== j) {
        combinations.push({
          background: palette[i],
          foreground: palette[j],
        });
      }
    }
  }

  return combinations;
};

export default PaletteAnalyzer;
