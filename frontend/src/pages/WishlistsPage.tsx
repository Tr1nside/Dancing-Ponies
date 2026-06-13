import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Wishlist } from "../types";
import { getWishlists } from "../api/wishlists";

export default function WishlistsPage() {
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getWishlists().then(setWishlists);
    }, []);

    return (
        <div>
            <h1>Мои списки</h1>
            {wishlists.map((w) => (
                <div key={w.id} onClick={() => navigate(`/wishlists/${w.id}`)}>
                    {w.emoji} {w.title}
                </div>
            ))}
        </div>
    );
}
