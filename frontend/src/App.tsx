import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import InvitePage from "./pages/InvitePage";
import WishesPage from "./pages/WishesPage";
import WishlistsPage from "./pages/WishlistsPage";
import WishPage from "./pages/WishPage";

function Navigator() {
	const navigate = useNavigate();

	useEffect(() => {
		let startParam: string | undefined;
		try {
			startParam = retrieveLaunchParams().startParam;
		} catch {
			startParam = import.meta.env.VITE_DEBUG_START_PARAM;
		}

		if (startParam) {
			navigate(`/invite/${startParam}`);
		}
	}, [navigate]);

	return null;
}

function App() {
	return (
		<BrowserRouter>
			<Navigator />
			<Routes>
				<Route path="/invite/:token" element={<InvitePage />} />
				<Route path="/" element={<WishlistsPage />} />
				<Route path="/wishlists/:wishlistId" element={<WishesPage />} />
				<Route path="/wishes/:wishId" element={<WishPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
