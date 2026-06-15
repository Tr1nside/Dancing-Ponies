if (import.meta.env.DEV) {
	const eruda = await import("eruda");
	eruda.default.init();
}

import { init } from "@telegram-apps/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

init();
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
