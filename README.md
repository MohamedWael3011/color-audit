# ColorAudit

A comprehensive color palette evaluation platform built with React, TypeScript, and Vite. ColorAudit helps designers and developers create accessible, harmonious color palettes with advanced analysis tools and real-time feedback.

## ✨ Features

### 🎨 Palette Creation & Editing

- **Interactive Color Editor**: Intuitive interface for creating and modifying color palettes
- **Random Palette Generation**: Generate high-quality color combinations with a single click
- **Theme Variants**: Automatic light and dark mode palette generation
- **Real-time Preview**: See changes instantly as you edit

### 📊 Advanced Analysis

- **Color Harmony Analysis**: Evaluate color relationships and harmony scores
- **Accessibility Auditing**: WCAG compliance checking with contrast ratio analysis
- **Color Distribution**: Visual representation of color relationships and balance
- **Quality Metrics**: Comprehensive scoring system for palette evaluation

### ♿ Accessibility Tools

- **Color Blindness Simulation**: Preview palettes through different types of color vision deficiency
- **Contrast Checking**: Ensure sufficient contrast for text readability
- **WCAG Compliance**: Built-in accessibility guidelines validation

### 💾 Export & Integration

- **Multiple Format Support**: Export palettes in various formats (CSS, SCSS, JSON, etc.)
- **Code Generation**: Ready-to-use code snippets for different platforms
- **Theme Variables**: Generate CSS custom properties and design tokens

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd color-audit
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

### Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **Color Processing**: Chroma.js for color manipulation
- **UI Components**: Custom component library with Lucide React icons
- **Animation**: Framer Motion for smooth interactions
- **Color Picker**: React Colorful for color selection

## 📁 Project Structure

```
src/
├── components/
│   ├── color/              # Color-related components
│   │   ├── PaletteAnalyzer.tsx
│   │   ├── PaletteEditor.tsx
│   │   ├── PaletteExport.tsx
│   │   └── ColorBlindnessSimulation.tsx
│   └── ui/                 # Reusable UI components
├── contexts/               # React contexts
├── lib/                    # Utility functions
│   ├── utils.ts           # General utilities
│   └── color-utils.ts     # Color processing functions
└── assets/                 # Static assets
```

## 🎯 Usage

### Creating a Palette

1. Use the palette editor to add or modify colors
2. Utilize the random generation feature for inspiration
3. Toggle between light and dark variants
4. Monitor real-time analysis feedback

### Analyzing Accessibility

1. Review the accessibility scores in the analyzer
2. Check contrast ratios for text combinations
3. Use color blindness simulation to ensure inclusivity
4. Address any flagged accessibility issues

### Exporting Your Work

1. Navigate to the export section
2. Choose your preferred format (CSS, SCSS, JSON, etc.)
3. Copy the generated code or download files
4. Integrate into your project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Inspired by the need for better color accessibility tools
- Thanks to the open-source community for the amazing libraries used

---

Made with ❤️ for designers and developers who care about accessible design.
