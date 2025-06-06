import React, { useState, useEffect } from "react";
import { RgbaColorPicker } from "react-colorful";
import {
  X,
  Plus,
  Trash2,
  Clipboard,
  Check,
  AlertCircle,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  cn,
  parseColorsFromText,
  generateQualityRandomPalette,
  generatePaletteVariants,
  generateDarkVariant,
} from "../../lib/utils";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../ui/Button";
import chroma from "chroma-js";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

interface PaletteEditorProps {
  palette: string[];
  setPalette: React.Dispatch<React.SetStateAction<string[]>>;
  showVariants?: boolean;
  paletteVariants?: PaletteVariants;
  setPaletteVariants?: React.Dispatch<React.SetStateAction<PaletteVariants>>;
  activeVariant?: "light" | "dark";
}

interface PaletteVariants {
  light: string[];
  dark: string[];
}

const PaletteEditor: React.FC<PaletteEditorProps> = ({
  palette,
  setPalette,
  showVariants: externalShowVariants,
  paletteVariants: externalPaletteVariants,
  setPaletteVariants: externalSetPaletteVariants,
  activeVariant: externalActiveVariant,
}) => {
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [pasteStatus, setPasteStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [pasteMessage, setPasteMessage] = useState("");

  // Use external state if provided, otherwise use internal state
  const { isDarkMode } = useTheme();
  const [internalShowVariants] = useState(true); // Always enabled for internal use
  const [internalPaletteVariants, setInternalPaletteVariants] =
    useState<PaletteVariants>({
      light: palette,
      dark: generateDarkVariant(palette),
    });
  const [internalActiveVariant, setInternalActiveVariant] = useState<
    "light" | "dark"
  >(isDarkMode ? "dark" : "light");

  const showVariants = externalShowVariants ?? internalShowVariants;
  const paletteVariants = externalPaletteVariants ?? internalPaletteVariants;
  const setPaletteVariants =
    externalSetPaletteVariants ?? setInternalPaletteVariants;
  const activeVariant = externalActiveVariant ?? internalActiveVariant;

  const handleColorChange = (color: string, index: number) => {
    const newPalette = [...palette];
    newPalette[index] = color;
    setPalette(newPalette);
  };

  const addColor = () => {
    if (palette.length < 10) {
      setPalette([...palette, "#CCCCCC"]);
    }
  };

  const removeColor = (index: number) => {
    const newPalette = palette.filter((_, i) => i !== index);
    setPalette(newPalette);
    if (activeColorIndex === index) {
      setActiveColorIndex(null);
    } else if (activeColorIndex !== null && activeColorIndex > index) {
      setActiveColorIndex(activeColorIndex - 1);
    }
  };

  const toRgba = (color: string) => {
    const [r, g, b, a] = chroma(color).rgba();
    return { r, g, b, a };
  };

  const pasteColors = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsedColors = parseColorsFromText(text);
      if (parsedColors.length === 0) {
        setPasteStatus("error");
        setPasteMessage("No valid colors found in clipboard");
        setTimeout(() => setPasteStatus("idle"), 3000);
        return;
      }
      const maxNewColors = Math.min(parsedColors.length, 10 - palette.length);
      const colorsToAdd = parsedColors.slice(0, maxNewColors);
      const newPalette = [...palette, ...colorsToAdd].slice(0, 10);
      setPalette(newPalette);
      setPasteStatus("success");
      setPasteMessage(
        `Added ${colorsToAdd.length} color${
          colorsToAdd.length !== 1 ? "s" : ""
        } from clipboard`
      );
      setTimeout(() => setPasteStatus("idle"), 3000);
    } catch {
      setPasteStatus("error");
      setPasteMessage("Failed to read from clipboard");
      setTimeout(() => setPasteStatus("idle"), 3000);
    }
  };

  const replaceWithPastedColors = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsedColors = parseColorsFromText(text);
      if (parsedColors.length === 0) {
        setPasteStatus("error");
        setPasteMessage("No valid colors found in clipboard");
        setTimeout(() => setPasteStatus("idle"), 3000);
        return;
      }
      const colorsToUse = parsedColors.slice(0, 10);
      setPalette(colorsToUse);
      setPasteStatus("success");
      setPasteMessage(
        `Replaced palette with ${colorsToUse.length} color${
          colorsToUse.length !== 1 ? "s" : ""
        } from clipboard`
      );
      setTimeout(() => setPasteStatus("idle"), 3000);
    } catch {
      setPasteStatus("error");
      setPasteMessage("Failed to read from clipboard");
      setTimeout(() => setPasteStatus("idle"), 3000);
    }
  };

  const generateGoodPalette = () => {
    const newPalette = generateQualityRandomPalette(5);
    setPalette(newPalette);
    // Only update variants if we're currently showing variants
    if (showVariants) {
      const variants = generatePaletteVariants(newPalette);
      setPaletteVariants(variants);
    }
  };

  const handleVariantColorChange = (
    color: string,
    index: number,
    variant: "light" | "dark"
  ) => {
    const newVariants = { ...paletteVariants };
    newVariants[variant][index] = color;
    setPaletteVariants(newVariants);

    // Update main palette if editing the light variant
    if (variant === "light") {
      setPalette(newVariants.light);
    }
  };

  // Update internal variants when palette changes (if using internal state)
  useEffect(() => {
    if (!externalPaletteVariants) {
      setInternalPaletteVariants({
        light: palette,
        dark: generateDarkVariant(palette),
      });
    }
  }, [palette, externalPaletteVariants]);

  // Sync internal active variant with theme when not externally controlled
  useEffect(() => {
    if (!externalActiveVariant) {
      setInternalActiveVariant(isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode, externalActiveVariant]);

  const currentPalette = showVariants
    ? paletteVariants[activeVariant]
    : palette;

  return (
    <Card className="shadow-lg border border-surface-200 dark:border-surface-700">
      <CardHeader className="flex flex-row items-center justify-between pb-0 pt-4 px-6">
        <CardTitle className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Edit Palette
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateGoodPalette}
            className="flex items-center gap-2"
          >
            <Palette size={16} />
            Generate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-3 mx-auto w-full max-w-xs md:max-w-none">
            <AnimatePresence>
              {currentPalette.map((color, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg cursor-pointer border-2 transition-all duration-150",
                      activeColorIndex === index
                        ? "border-primary-500 ring-2 ring-primary-500"
                        : "border-surface-300"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColorIndex(index)}
                  />
                  {currentPalette.length > 2 && (
                    <button
                      onClick={() => removeColor(index)}
                      className="absolute -top-2 -right-2 bg-surface-200 dark:bg-surface-700 rounded-full p-0.5 text-surface-500 dark:text-surface-400 hover:bg-error-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow"
                    >
                      <X size={12} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {currentPalette.length < 10 && (
              <button
                onClick={addColor}
                className="w-12 h-12 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center text-surface-400 dark:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:border-primary-500 transition-colors"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          {activeColorIndex !== null &&
            activeColorIndex < currentPalette.length &&
            currentPalette[activeColorIndex] && (
              <div className="space-y-3 mx-auto w-full max-w-xs md:max-w-none">
                <RgbaColorPicker
                  color={toRgba(currentPalette[activeColorIndex])}
                  onChange={(color) => {
                    const newColor = chroma
                      .rgb(color.r, color.g, color.b, color.a)
                      .css();
                    if (showVariants) {
                      handleVariantColorChange(
                        newColor,
                        activeColorIndex,
                        activeVariant
                      );
                    } else {
                      handleColorChange(newColor, activeColorIndex);
                    }
                  }}
                />
                <input
                  type="text"
                  className="input w-full"
                  value={currentPalette[activeColorIndex]}
                  onChange={(e) => {
                    if (showVariants) {
                      handleVariantColorChange(
                        e.target.value,
                        activeColorIndex,
                        activeVariant
                      );
                    } else {
                      handleColorChange(e.target.value, activeColorIndex);
                    }
                  }}
                />
              </div>
            )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={pasteColors}
              disabled={palette.length >= 10}
              className="flex-1"
            >
              <Clipboard size={14} className="mr-2" />
              Add from Clipboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={replaceWithPastedColors}
              className="flex-1"
            >
              <Clipboard size={14} className="mr-2" />
              Replace with Clipboard
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={generateGoodPalette}
            fullWidth
            className="flex items-center justify-center gap-2 mt-1"
          >
            <Palette size={14} />
            Generate Good Palette
          </Button>

          <AnimatePresence>
            {pasteStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg text-sm mt-1",
                  pasteStatus === "success"
                    ? "bg-success-50 text-success-700 border border-success-200"
                    : "bg-error-50 text-error-700 border border-error-200"
                )}
              >
                {pasteStatus === "success" ? (
                  <Check size={16} className="text-success-600" />
                ) : (
                  <AlertCircle size={16} className="text-error-600" />
                )}
                <span>{pasteMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-xs text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-lg p-3 mt-1">
            <p className="font-semibold mb-1">Supported formats:</p>
            <ul className="ml-2 space-y-0.5">
              <li>• Hex: #ff0000, #f00, ff0000, f00</li>
              <li>• RGB: rgb(255, 0, 0)</li>
              <li>• RGBA: rgba(255, 0, 0, 0.5)</li>
              <li>• HSL: hsl(0, 100%, 50%)</li>
              <li>• HSLA: hsla(0, 100%, 50%, 0.5)</li>
            </ul>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => setPalette([])}
          disabled={palette.length === 0}
          className="mt-2"
        >
          <Trash2 size={14} className="mr-2" />
          Clear Palette
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaletteEditor;
