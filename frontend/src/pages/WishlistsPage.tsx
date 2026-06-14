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
            <div className="new-wishlist-dib">
                <input type="text" name="" id="emoji-input" />
                <input type="text" name="" id="title-input" />
                <input type="button" value="Создать+" />

            </div>
            {wishlists.map((w) => (
                <div className="wishlist-div" key={w.id} onClick={() => navigate(`/wishlists/${w.id}`)}>
                    {w.emoji} {w.title}
                </div>
            ))}
        </div>
    );
}
