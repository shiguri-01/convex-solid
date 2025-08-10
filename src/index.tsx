/* @refresh reload */

import { ConvexClient } from "convex/browser";
import { render } from "solid-js/web";
import App from "./App";
import { ConvexProvider } from "./lib/convex";

import "./index.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL);

render(
	() => (
		<ConvexProvider client={convex}>
			<App />
		</ConvexProvider>
	),
	root!,
);
