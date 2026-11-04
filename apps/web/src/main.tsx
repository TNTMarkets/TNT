import { QueryClient } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "#app/App.tsx";
import { createAppRouter } from "#app/router.tsx";
import "#app/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root element is missing in index.html");

const queryClient = new QueryClient();
const router = createAppRouter({ queryClient });

createRoot(root).render(
  <StrictMode>
    <App queryClient={queryClient} router={router} />
  </StrictMode>,
);
