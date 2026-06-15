import { init } from "@telegram-apps/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import eruda from "eruda";
import App from "./App.tsx";

eruda.init();
init();
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
