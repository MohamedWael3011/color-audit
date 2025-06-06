import PaletteAnalyzerDemoPage from "./components/color/PaletteAnalyzerDemoPage";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <PaletteAnalyzerDemoPage />
    </ThemeProvider>
  );
}

export default App;
