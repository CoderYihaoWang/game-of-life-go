import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import CssBaseLine from "@mui/material/CssBaseline";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material";

declare module "@mui/material/styles" {
  interface PaletteOptions {
    player1?: PaletteOptions["primary"];
    player2?: PaletteOptions["primary"];
  }
}

const theme = createTheme({
  palette: {
    player1: {
      main: "#ffbff9",
      light: "#ffe0fc",
      dark: "#f7edf6",
    },
    player2: {
      main: "#a3ffd7",
      light: "#d1ffeb",
      dark: "#e4f5ed",
    },
    primary: {
      main: "#8ff2ff",
      light: "#bdf7ff",
      dark: "#a1e4ed",
    },
    info: {
      main: "#bdbdbd",
      light: "#f7f7f7",
      dark: "#cfcfcf",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: "0.8em",
        },
      },
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <CssBaseLine />
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
