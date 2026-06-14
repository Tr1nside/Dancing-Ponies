import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Wishlist } from "../types";
import { getWishlists, createWishlist } from "../api/wishlists";

export default function WishlistsPage() {
    const navigate = useNavigate();
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("")
    const [emoji, setEmoji] = useState<string>("")

    const handleCreate = async () => {
        if (!title.trim()) return;
        try {
            const newWishlist = await createWishlist({ title, emoji });
            setWishlists([...wishlists, newWishlist]); // добавляем в список без перезагрузки
            setTitle("");  // очищаем форму
            setEmoji("");
        } catch (e: any) {
            setError(e.message);
        }
    };



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
                <input type="text" value={emoji} id="emoji-input" onChange={(e) => { setEmoji(e.target.value) }} />
                <input type="text" value={title} id="title-input" onChange={(e) => { setTitle(e.target.value) }} />
                <input type="submit" value="Создать" onClick={handleCreate} />

            </div>
            {wishlists.map((w) => (
                <div className="wishlist-div" key={w.id} onClick={() => navigate(`/wishlists/${w.id}`)}>
                    {w.emoji} {w.title}
                </div>
            ))}
        </div>
    );
}
