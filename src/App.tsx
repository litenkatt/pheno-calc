import { lime, purple } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PhenoCalculator from "./components/PhenoCalculator";

// Define your custom theme
const theme = createTheme({
  typography: {
    fontFamily: ["Roboto", '"Helvetica Neue"', "Arial", "sans-serif"].join(","),
  },
  palette: {
    primary: lime,
    secondary: purple,
    background: { default: "#000000" },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PhenoCalculator />
    </ThemeProvider>
  );
}
