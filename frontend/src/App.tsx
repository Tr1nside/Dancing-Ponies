import { BrowserRouter, Routes, Route } from "react-router-dom";
import WishlistsPage from "./pages/WishlistsPage";
import WishesPage from "./pages/WishesPage";
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
