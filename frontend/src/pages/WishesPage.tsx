import { useEffect, useState } from "react";
import WishCard from "../components/WishCard"
import { useParams, useNavigate } from "react-router-dom";
import type { Wish, Wishlist } from "../types";
import { getWishes, createWish, handleWishComplete } from "../api/wishes";
import { getWishlist, deleteWishlist } from "../api/wishlists";

export default function WishesPage() {
    const navigate = useNavigate()
    const { wishlistId } = useParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [wishlist, setWishlist] = useState<Wishlist>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [url, setUrl] = useState<string>("");

    const handleCreate = async () => {
        if (!title.trim()) return;
        if (wishlistId === undefined) {
            setError("Wishlist id is NaN")
        }

        const wishlistIdInt = Number(wishlistId);
        if (Number.isNaN(wishlistIdInt)) {
            setError("Wishlist id is NaN")
        }
        try {
            const newWish = await createWish({ title, price, url, wishlist_id: wishlistIdInt });
            setWishes([...wishes, newWish]); // добавляем в список без перезагрузки
            setTitle("");  // очищаем форму
            setPrice(0);
            setUrl("");
        } catch (e: any) {
            setError(e.message);
        }
    };
    const handleDeleteList = async () => {
        if (wishlistId === undefined) {
            setError("Wishlist id is NaN")
            return
        }

        const wishlistIdInt = Number(wishlistId);
        if (Number.isNaN(wishlistIdInt)) {
            setError("Wishlist id is NaN")
        }
        try {
            await deleteWishlist(wishlistIdInt)
            navigate("/")

        } catch (e) {
            setError(e instanceof Error ? e.message : "Undefind error");
            return
        }
    }
    const handleComplete = async (wish_id: number, is_completed: boolean) => {
        // Оптимистично обновляем UI сразу
        setWishes(wishes.map((w) =>
            w.id === wish_id ? { ...w, is_completed } : w
        ));

        try {
            await handleWishComplete(wish_id, { is_completed });
        } catch (e: any) {
            // Откат
            setWishes(wishes.map((w) =>
                w.id === wish_id ? { ...w, is_completed: !is_completed } : w
            ));
            setError(e.message);
            return
        }
    };



    useEffect(() => {
        if (wishlistId) {
            getWishes(Number(wishlistId))
                .then(setWishes)
                .catch((e) => setError(e.message))
                .finally(() => { setLoading(false) });
            getWishlist(Number(wishlistId))
                .then(setWishlist)
                .catch((e) => setError(e.message))
                .finally(() => { setLoading(false) });

        }
    }, [wishlistId]);


    if (loading) return <div>Загрузка...</div>;

    if (error) return <div>Ошибка: {error}</div>;

    return (

        <div>
            <header className="wishlist-header" style={{ position: "relative" }}>
                <button className="back-button" onClick={() => navigate("/")}>back</button >
                <h1>{wishlist?.emoji} {wishlist?.title}</h1>
                <button onClick={() => setMenuOpen(!menuOpen)}>⋯</button>

                {menuOpen && (
                    <div style={{ position: "absolute", background: "white", border: "1px solid #ccc" }}>
                        <button onClick={() => { handleDeleteList(); setMenuOpen(false); }}>
                            Удалить
                        </button>
                    </div>
                )}
            </header>
            <div className="new-wish-dib">
                <input type="text" value={title} id="title-input" onChange={(e) => { setTitle(e.target.value) }} />
                <input type="number" value={price} id="price-input" onChange={(e) => { setPrice(Number(e.target.value)) }} />
                <input type="text" value={url} id="url-input" onChange={(e) => { setUrl(e.target.value) }} />
                <input type="submit" value="Создать" onClick={handleCreate} />

            </div>


            {
                wishes.map((w) => (
                    <WishCard
                        key={w.id}
                        wish={w}
                        onClick={() => navigate(`/wishes/${w.id}`)}
                        onComplete={(completed) => handleComplete(w.id, completed)}
                    />
                ))
            }
        </div >
    );
}
