import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import Button from "../ui/Button";
import {
  simulatePaletteColorBlindness,
  type ColorBlindnessType,
} from "../../lib/color-utils";

interface ColorBlindnessSimulationProps {
  palette: string[];
  className?: string;
}

const colorBlindnessTypes: {
  type: ColorBlindnessType;
  name: string;
  description: string;
}[] = [
  {
    type: "protanopia",
    name: "Protanopia",
    description: "Red-blind (1% of males)",
  },
  {
    type: "protanomaly",
    name: "Protanomaly",
    description: "Red-weak (1% of males)",
  },
  {
    type: "deuteranopia",
    name: "Deuteranopia",
    description: "Green-blind (1% of males)",
  },
  {
    type: "deuteranomaly",
    name: "Deuteranomaly",
    description: "Green-weak (5% of males)",
  },
  { type: "tritanopia", name: "Tritanopia", description: "Blue-blind (rare)" },
  { type: "tritanomaly", name: "Tritanomaly", description: "Blue-weak (rare)" },
  {
    type: "achromatopsia",
    name: "Achromatopsia",
    description: "Complete color blindness",
  },
  {
    type: "achromatomaly",
    name: "Achromatomaly",
    description: "Partial color blindness",
  },
];

const ColorBlindnessSimulation: React.FC<ColorBlindnessSimulationProps> = ({
  palette,
  className,
}) => {
  const [selectedType, setSelectedType] =
    useState<ColorBlindnessType>("deuteranopia");
  const [showComparison, setShowComparison] = useState(true);

  const simulatedPalette = simulatePaletteColorBlindness(palette, selectedType);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Color Blindness Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Color Vision Deficiency Type
            </label>
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as ColorBlindnessType)
              }
              className="input w-full"
            >
              {colorBlindnessTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Comparison View */}
          <div className="flex items-center gap-2">
            <Button
              variant={showComparison ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? "Side-by-Side" : "Simulated Only"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedType("deuteranopia")}
            >
              <RotateCcw size={14} className="mr-1" />
              Reset
            </Button>
          </div>

          {/* Palette Comparison */}
          <div className="space-y-4">
            {showComparison ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Palette */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Original Palette</h4>
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {palette.map((color, index) => (
                        <motion.div
                          key={`original-${index}`}
                          className="flex-1 h-16 rounded-lg border border-surface-200"
                          style={{ backgroundColor: color }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-surface-500 text-center">
                      Normal color vision
                    </div>
                  </div>
                </div>

                {/* Simulated Palette */}
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    {
                      colorBlindnessTypes.find((t) => t.type === selectedType)
                        ?.name
                    }{" "}
                    View
                  </h4>
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {simulatedPalette.map((color, index) => (
                        <motion.div
                          key={`simulated-${index}`}
                          className="flex-1 h-16 rounded-lg border border-surface-200"
                          style={{ backgroundColor: color }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          title={`${palette[index]} → ${color}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-surface-500 text-center">
                      {
                        colorBlindnessTypes.find((t) => t.type === selectedType)
                          ?.description
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Simulated Only View */
              <div>
                <h4 className="text-sm font-medium mb-3">
                  {
                    colorBlindnessTypes.find((t) => t.type === selectedType)
                      ?.name
                  }{" "}
                  View
                </h4>
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {simulatedPalette.map((color, index) => (
                      <motion.div
                        key={`simulated-only-${index}`}
                        className="flex-1 h-20 rounded-lg border border-surface-200"
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        title={`${palette[index]} → ${color}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-surface-500 text-center">
                    {
                      colorBlindnessTypes.find((t) => t.type === selectedType)
                        ?.description
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* UI Component Previews with Simulation */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              Component Preview (All Combinations)
            </h4>
            <p className="text-xs text-surface-500 mb-3">
              Showing how different color combinations would appear to users
              with{" "}
              {colorBlindnessTypes.find((t) => t.type === selectedType)?.name}.
            </p>

            <div className="space-y-4">
              {/* Buttons Preview */}
              <div>
                <div className="text-xs text-surface-500 mb-2">Buttons</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {generateAllCombinations(simulatedPalette)
                    .slice(0, 9)
                    .map((combo, index) => (
                      <button
                        key={`btn-${index}`}
                        className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
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

              {/* Alert Preview */}
              <div>
                <div className="text-xs text-surface-500 mb-2">
                  Alert Messages
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {generateAllCombinations(simulatedPalette)
                    .slice(0, 6)
                    .map((combo, index) => (
                      <div
                        key={`alert-${index}`}
                        className="p-3 rounded-lg text-sm"
                        style={{
                          backgroundColor: combo.background,
                          color: combo.foreground,
                        }}
                      >
                        <div className="font-medium">Alert {index + 1}</div>
                        <div>
                          This is how alerts would appear with{" "}
                          {
                            colorBlindnessTypes.find(
                              (t) => t.type === selectedType
                            )?.name
                          }
                          .
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Badges Preview */}
              <div>
                <div className="text-xs text-surface-500 mb-2">Badges</div>
                <div className="flex flex-wrap gap-2">
                  {generateAllCombinations(simulatedPalette)
                    .slice(0, 12)
                    .map((combo, index) => (
                      <div
                        key={`badge-${index}`}
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
            </div>
          </div>

          {/* Accessibility Tips */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
            <h5 className="text-sm font-medium mb-2">Accessibility Tips</h5>
            <ul className="text-xs text-surface-600 dark:text-surface-400 space-y-1">
              <li>• Use patterns, shapes, or text labels alongside colors</li>
              <li>
                • Ensure sufficient contrast ratios (4.5:1 for normal text)
              </li>
              <li>• Avoid using only red and green to convey information</li>
              <li>
                • Test your design with multiple color vision deficiencies
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
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

export default ColorBlindnessSimulation;
