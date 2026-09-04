import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BetweenUsApp } from "@/components/between-us-app";
import "@/styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

createRoot(container).render(
  <StrictMode>
    <BetweenUsApp />
  </StrictMode>,
);
