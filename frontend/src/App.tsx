import { BrowserRouter, Routes, Route } from "react-router-dom";
import WishlistsPage from "./pages/WishlistsPage";
import WishesPage from "./pages/WishesPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<WishlistsPage />} />
                <Route path="/wishlists/:wishlistId" element={<WishesPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
