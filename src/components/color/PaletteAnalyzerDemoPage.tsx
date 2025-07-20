import React, { useState, useEffect } from "react";
import PaletteAnalyzer from "./PaletteAnalyzer";
import PaletteEditor from "./PaletteEditor";
import PaletteExport from "./PaletteExport";
import ColorBlindnessSimulation from "./ColorBlindnessSimulation";
import ThemeToggle from "../ui/ThemeToggle";
import {
  generateQualityRandomPalette,
  generateDarkVariant,
} from "../../lib/utils";
import { useTheme } from "../../contexts/ThemeContext";

interface PaletteVariants {
  light: string[];
  dark: string[];
}

const PaletteAnalyzerDemoPage: React.FC = () => {
  const [palette, setPalette] = useState<string[]>(
    generateQualityRandomPalette(6)
  );
  const [showVariants] = useState(true); // Always enabled
  const [paletteVariants, setPaletteVariants] = useState<PaletteVariants>({
    light: palette,
    dark: generateDarkVariant(palette),
  });

  const { isDarkMode } = useTheme();

  const activeVariant = isDarkMode ? "dark" : "light";

  // Update variants when base palette changes
  useEffect(() => {
    setPaletteVariants({
      light: palette,
      dark: generateDarkVariant(palette),
    });
  }, [palette]);

  const currentPalette = paletteVariants[activeVariant];

  // Simplified palette change handler that always updates the base palette
  const handlePaletteChange = (newPalette: string[] | ((prev: string[]) => string[])) => {
    const resolvedPalette = typeof newPalette === "function" ? newPalette(palette) : newPalette;
    setPalette(resolvedPalette);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      <header className="border-b border-surface-200 dark:border-surface-800 sticky top-0 bg-surface-50/95 dark:bg-surface-900/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
              ColorAudit
            </h1>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              Full Pro Features Demo
            </p>
          </div>
          <ThemeToggle className="ml-4" />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Editor & Export */}
          <div className="lg:col-span-5 space-y-6">
            <PaletteEditor
              palette={palette}
              setPalette={handlePaletteChange}
              showVariants={showVariants}
              paletteVariants={paletteVariants}
              setPaletteVariants={setPaletteVariants}
              activeVariant={activeVariant}
            />
            <PaletteExport
              key={`export-${showVariants}-${activeVariant}-${currentPalette.join(
                ","
              )}`}
              paletteVariants={paletteVariants}
            />
          </div>

          {/* Right Column - Analyzer & Simulations */}
          <div className="lg:col-span-7 space-y-6">
            <PaletteAnalyzer
              key={`analyzer-${palette.join(",")}`}
              palette={currentPalette}
              setPalette={handlePaletteChange}
            />
            <ColorBlindnessSimulation
              key={`colorblind-${activeVariant}-${currentPalette.join(
                ","
              )}`}
              palette={currentPalette}
            />
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center text-sm text-surface-500 dark:text-surface-400">
          ColorAudit Palette Analyzer Demo - Built with React & TailwindCSS
        </div>
      </footer>
    </div>
  );
};

export default PaletteAnalyzerDemoPage;
