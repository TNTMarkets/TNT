import { QueryClient } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "#app/App.tsx";
import { createBrowserI18n } from "#app/i18n.ts";
import { createAppRouter } from "#app/router.tsx";
import "#app/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root element is missing in index.html");

const queryClient = new QueryClient();
const router = createAppRouter({ queryClient });
const i18n = createBrowserI18n();

createRoot(root).render(
  <StrictMode>
    <App queryClient={queryClient} router={router} i18n={i18n} />
  </StrictMode>,
);
