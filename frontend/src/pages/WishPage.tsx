import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Wish } from "../types";
import { getWish, deleteWish, handleWishComplete } from "../api/wishes"

export default function WishesPage() {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false);
    const { wishId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wish, setWish] = useState<Wish | null>(null);

    const handleComplete = async () => {
        if (wish === null) return;

        const updated = { ...wish, is_completed: !wish.is_completed };
        setWish(updated); // оптимистичное обновление

        try {
            await handleWishComplete(wish.id, { is_completed: updated.is_completed });
        } catch (e) {
            setWish(wish); // откат - возвращаем старый объект
            setError(e instanceof Error ? e.message : "Ошибка");
        }
    };
    const handleDeleteWish = async () => {
        if (wishId === undefined) {
            setError("Wishlist id is NaN")
            return
        }

        const wishIdInt = Number(wishId);
        if (Number.isNaN(wishIdInt)) {
            setError("Wishlist id is NaN")
        }
        try {
            await deleteWish(wishIdInt)
            navigate(`/wishlists/${wish?.wishlist_id}`)

        } catch (e) {
            setError(e instanceof Error ? e.message : "Undefind error");
            return
        }
    }

    useEffect(() => {
        if (wishId) {
            getWish(Number(wishId))
                .then(setWish)
                .catch((e) => setError(e.message))
                .finally(() => { setLoading(false) });
        }

    }, [wishId]);


    if (loading) return <div>Загрузка...</div>;

    if (error) return <div>Ошибка: {error}</div>;

    if (wish == null) return <div>Wish not find</div>

    return (

        <div>
            <header className="wish-header" >
                <button className="back-button" onClick={() => navigate(`/wishlists/${wish?.wishlist_id}`)}>back</button >
                <h1>{wish?.title}</h1>

                <button onClick={() => setMenuOpen(!menuOpen)}>⋯</button>

                {menuOpen && (
                    <div style={{ position: "absolute", background: "white", border: "1px solid #ccc" }}>
                        <button onClick={() => { handleDeleteWish(); setMenuOpen(false); }}>
                            Удалить
                        </button>
                    </div>
                )}
            </header>
            <div className="wish-body">
                {wish.url && (
                    <a href={wish.url} target="_blank" rel="noopener noreferrer">
                        Ссылка на товар
                    </a>
                )}

                {wish.price && (
                    <p>{wish.price} ₽</p>
                )}

                {wish.description && (
                    <p>{wish.description}</p>
                )}

                <button onClick={handleComplete}>
                    {wish.is_completed ? "✓ Выполнено" : "Отметить выполненным"}
                </button>
            </div>
        </div>
    );
}
