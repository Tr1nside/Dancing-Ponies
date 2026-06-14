import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Wishlist } from "../types";
import { getWishlists } from "../api/wishlists";

export default function WishlistsPage() {
    const navigate = useNavigate();
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getWishlists()
            .then(setWishlists)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);


    if (loading) return <div>Загрузка...</div>;

    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div>
            <h1>Мои списки</h1>
            <div className="new-wishlist-dib">
                <input type="text" name="1" id="emoji-input" />
                <input type="text" name="2" id="title-input" />
                <input type="button" value="Создать" />

            </div>
            {wishlists.map((w) => (
                <div className="wishlist-div" key={w.id} onClick={() => navigate(`/wishlists/${w.id}`)}>
                    {w.emoji} {w.title}
                </div>
            ))}
        </div>
    );
}
