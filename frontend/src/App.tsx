import { BrowserRouter, Route, Routes } from "react-router-dom";
import WishesPage from "./pages/WishesPage";
import WishlistsPage from "./pages/WishlistsPage";
import WishPage from "./pages/WishPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<WishlistsPage />} />
				<Route path="/wishlists/:wishlistId" element={<WishesPage />} />
				<Route path="/wishes/:wishId" element={<WishPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
