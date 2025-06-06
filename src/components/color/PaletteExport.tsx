import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Copy, Check, FileText, Code, Sun, Moon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import Button from "../ui/Button";
import {
  exportFormats,
  type ExportFormat,
  downloadFile,
  copyToClipboard,
} from "../../lib/color-utils";

interface PaletteVariants {
  light: string[];
  dark: string[];
}

interface PaletteExportProps {
  paletteVariants: PaletteVariants;
  paletteName?: string;
  className?: string;
}

type ExportVariant = "light" | "dark" | "both";

const PaletteExport: React.FC<PaletteExportProps> = ({
  paletteVariants,
  paletteName = "myPalette",
  className,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(
    exportFormats[0]
  );
  const [selectedVariant, setSelectedVariant] = useState<ExportVariant>("both");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [customName, setCustomName] = useState(paletteName);

  // Generate code based on selected variant
  const generateCode = (variant: ExportVariant) => {
    if (variant === "both") {
      // Create a combined export with both variants
      const lightCode = selectedFormat.generate(
        paletteVariants.light,
        `${customName}Light`
      );
      const darkCode = selectedFormat.generate(
        paletteVariants.dark,
        `${customName}Dark`
      );
      return `// Light variant\n${lightCode}\n\n// Dark variant\n${darkCode}`;
    } else {
      return selectedFormat.generate(paletteVariants[variant], customName);
    }
  };

  const generatedCode = generateCode(selectedVariant);

  const handleCopy = async (formatName: string, content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopiedStates({ ...copiedStates, [formatName]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [formatName]: false });
      }, 2000);
    }
  };

  const handleDownload = (
    format: ExportFormat,
    content: string,
    variant: ExportVariant
  ) => {
    const suffix =
      variant === "both" ? "Variants" : variant === "light" ? "Light" : "Dark";
    const filename = `${customName}${suffix}.${format.extension}`;
    const mimeType =
      format.extension === "json" ? "application/json" : "text/plain";
    downloadFile(content, filename, mimeType);
  };

  if (paletteVariants.light.length === 0 && paletteVariants.dark.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="py-12 text-center">
            <FileText size={48} className="mx-auto text-surface-300 mb-4" />
            <p className="text-surface-500">
              Add colors to your palette to enable export
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Export Palette Variants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Palette Name Input */}
          <div>
            <label
              htmlFor="palette-name"
              className="block text-sm font-medium mb-2"
            >
              Palette Name
            </label>
            <input
              id="palette-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="input w-full"
              placeholder="Enter palette name"
            />
          </div>

          {/* Variant Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Export Variant
            </label>
            <div className="flex gap-2">
              <Button
                variant={selectedVariant === "light" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedVariant("light")}
                className="flex items-center gap-2"
              >
                <Sun size={14} />
                Light Only
              </Button>
              <Button
                variant={selectedVariant === "dark" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedVariant("dark")}
                className="flex items-center gap-2"
              >
                <Moon size={14} />
                Dark Only
              </Button>
              <Button
                variant={selectedVariant === "both" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedVariant("both")}
                className="flex items-center gap-2"
              >
                <Sun size={14} />
                <Moon size={14} />
                Both Variants
              </Button>
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label
              htmlFor="export-format"
              className="block text-sm font-medium mb-2"
            >
              Export Format
            </label>
            <select
              id="export-format"
              value={selectedFormat.name}
              onChange={(e) => {
                const format = exportFormats.find(
                  (f) => f.name === e.target.value
                );
                if (format) setSelectedFormat(format);
              }}
              className="input w-full"
            >
              {exportFormats.map((format) => (
                <option key={format.name} value={format.name}>
                  {format.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Previews */}
          <div className="space-y-4">
            {/* Light Variant Preview */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sun size={16} />
                Light Variant ({paletteVariants.light.length} colors)
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {paletteVariants.light.map((color, index) => (
                  <motion.div
                    key={`light-${index}`}
                    className="aspect-square rounded-lg border border-surface-200 dark:border-surface-600 relative group"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        {color}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dark Variant Preview */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Moon size={16} />
                Dark Variant ({paletteVariants.dark.length} colors)
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {paletteVariants.dark.map((color, index) => (
                  <motion.div
                    key={`dark-${index}`}
                    className="aspect-square rounded-lg border border-surface-200 dark:border-surface-600 relative group"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        {color}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Code Preview</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(selectedFormat.name, generatedCode)}
                  className="flex items-center gap-2"
                >
                  {copiedStates[selectedFormat.name] ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      selectedFormat,
                      generatedCode,
                      selectedVariant
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <Download size={14} />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
              <pre className="text-sm text-surface-700 dark:text-surface-300 overflow-x-auto whitespace-pre-wrap">
                <code>{generatedCode}</code>
              </pre>
            </div>
          </div>

          {/* Quick Export Options */}
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Export</h4>
            <div className="space-y-3">
              {/* Light variant quick exports */}
              <div>
                <h5 className="text-xs font-medium mb-2 flex items-center gap-2 text-surface-600 dark:text-surface-400">
                  <Sun size={12} />
                  Light Variant
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {exportFormats.slice(0, 4).map((format) => {
                    const content = format.generate(
                      paletteVariants.light,
                      `${customName}Light`
                    );
                    const key = `light-${format.name}`;
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(key, content)}
                        className="flex items-center justify-between p-3 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <Code size={16} />
                          <span>{format.name}</span>
                        </div>
                        {copiedStates[key] ? (
                          <Check size={14} className="text-success-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Dark variant quick exports */}
              <div>
                <h5 className="text-xs font-medium mb-2 flex items-center gap-2 text-surface-600 dark:text-surface-400">
                  <Moon size={12} />
                  Dark Variant
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {exportFormats.slice(0, 4).map((format) => {
                    const content = format.generate(
                      paletteVariants.dark,
                      `${customName}Dark`
                    );
                    const key = `dark-${format.name}`;
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(key, content)}
                        className="flex items-center justify-between p-3 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <Code size={16} />
                          <span>{format.name}</span>
                        </div>
                        {copiedStates[key] ? (
                          <Check size={14} className="text-success-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
            <h5 className="text-sm font-medium mb-2">Usage Example</h5>
            <div className="text-xs text-surface-600 dark:text-surface-400">
              {selectedFormat.name === "CSS Variables" && (
                <div>
                  <p>Import this CSS file and use variables like:</p>
                  {selectedVariant === "both" ? (
                    <div className="space-y-1 mt-1">
                      <code className="bg-white dark:bg-surface-700 px-2 py-1 rounded block">
                        color: var(--{customName}Light-1);
                      </code>
                      <code className="bg-white dark:bg-surface-700 px-2 py-1 rounded block">
                        color: var(--{customName}Dark-1);
                      </code>
                    </div>
                  ) : (
                    <code className="bg-white dark:bg-surface-700 px-2 py-1 rounded mt-1 inline-block">
                      color: var(--{customName}-1);
                    </code>
                  )}
                </div>
              )}
              {selectedFormat.name === "Tailwind Config" && (
                <div>
                  <p>Add to your tailwind.config.js and use like:</p>
                  {selectedVariant === "both" ? (
                    <div className="space-y-1 mt-1">
                      <code className="bg-white dark:bg-surface-700 px-2 py-1 rounded block">
                        bg-{customName}Light-1 dark:bg-{customName}Dark-1
                      </code>
                    </div>
                  ) : (
                    <code className="bg-white dark:bg-surface-700 px-2 py-1 rounded mt-1 inline-block">
                      bg-{customName}-1
                    </code>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaletteExport;
