import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createWish, getWishes, handleWishComplete } from "../api/wishes";
import { deleteWishlist, getWishlist } from "../api/wishlists";
import BackButton from "../components/BackButton";
import { DropdownMenu } from "../components/DropdownMenu";
import WishCard from "../components/WishCard";
import type { Wish, Wishlist } from "../types";

export default function WishesPage() {
	const navigate = useNavigate();
	const { wishlistId } = useParams();
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
			setError("Wishlist id is NaN");
		}

		const wishlistIdInt = Number(wishlistId);
		if (Number.isNaN(wishlistIdInt)) {
			setError("Wishlist id is NaN");
		}
		try {
			const newWish = await createWish({
				title,
				price,
				url,
				wishlist_id: wishlistIdInt,
			});
			setWishes([...wishes, newWish]); // добавляем в список без перезагрузки
			setTitle(""); // очищаем форму
			setPrice(0);
			setUrl("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error");
		}
	};
	const handleDeleteList = async () => {
		if (wishlistId === undefined) {
			setError("Wishlist id is NaN");
			return;
		}

		const wishlistIdInt = Number(wishlistId);
		if (Number.isNaN(wishlistIdInt)) {
			setError("Wishlist id is NaN");
		}
		try {
			await deleteWishlist(wishlistIdInt);
			navigate("/");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Undefind error");
			return;
		}
	};
	const handleComplete = async (wish_id: number, is_completed: boolean) => {
		// Оптимистично обновляем UI сразу
		setWishes(
			wishes.map((w) => (w.id === wish_id ? { ...w, is_completed } : w)),
		);

		try {
			await handleWishComplete(wish_id, { is_completed });
		} catch (e) {
			// Откат
			setWishes(
				wishes.map((w) =>
					w.id === wish_id ? { ...w, is_completed: !is_completed } : w,
				),
			);
			setError(e instanceof Error ? e.message : "Error");
			return;
		}
	};

	useEffect(() => {
		if (wishlistId) {
			getWishes(Number(wishlistId))
				.then(setWishes)
				.catch((e) => setError(e.message))
				.finally(() => {
					setLoading(false);
				});
			getWishlist(Number(wishlistId))
				.then(setWishlist)
				.catch((e) => setError(e.message))
				.finally(() => {
					setLoading(false);
				});
		}
	}, [wishlistId]);

	if (loading) return <div>Загрузка...</div>;

	if (error) return <div>Ошибка: {error}</div>;

	return (
		<div className="page-div">
			<header className="wishlist-header" style={{ position: "relative" }}>
				<BackButton onClick={() => navigate("/")} />
				<h1>
					{wishlist?.emoji} {wishlist?.title}
				</h1>
				<DropdownMenu
					items={[{ label: "Удалить", onClick: handleDeleteList }]}
				/>
			</header>
			<div className="new-wish-form">
				<input
					type="text"
					value={title}
					id="title-input"
					placeholder="Название"
					onChange={(e) => setTitle(e.target.value)}
				/>
				<div className="price-url-row">
					<input
						type="number"
						value={price || ""}
						id="price-input"
						placeholder="Цена"
						onChange={(e) => setPrice(Number(e.target.value))}
					/>
					<input
						type="text"
						value={url}
						id="url-input"
						placeholder="Ссылка"
						onChange={(e) => setUrl(e.target.value)}
					/>
				</div>
				<input type="button" onClick={handleCreate} value="Создать" />
			</div>

			{wishes.map((w) => (
				<WishCard
					key={w.id}
					wish={w}
					onClick={() => navigate(`/wishes/${w.id}`)}
					onComplete={(completed) => handleComplete(w.id, completed)}
				/>
			))}
		</div>
	);
}
