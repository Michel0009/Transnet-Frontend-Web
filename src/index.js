import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { theme } from "./Components/Colors";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
Object.keys(theme).forEach((key) => {
  document.documentElement.style.setProperty(`--${key}`, theme[key]);
});
root.render(
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
);

