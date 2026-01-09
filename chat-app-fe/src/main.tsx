import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Room from "./Room.tsx";
import { Route, Routes, BrowserRouter } from "react-router-dom";
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={<App />}
				/>
				<Route
					path="/room/:roomCode"
					element={<Room />}
				/>
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
