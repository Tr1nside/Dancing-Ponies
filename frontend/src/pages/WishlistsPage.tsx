import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createWishlist, getWishlists } from "../api/wishlists";
import type { Wishlist } from "../types";

export default function WishlistsPage() {
	const [wishlists, setWishlists] = useState<Wishlist[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState<string>("");
	const [emoji, setEmoji] = useState<string>("");

	const handleCreate = async () => {
		if (!title.trim()) return;

		const emojiToSend = emoji || "☺️";
		try {
			const newWishlist = await createWishlist({ title, emoji: emojiToSend });
			setWishlists([...wishlists, newWishlist]); // добавляем в список без перезагрузки
			setTitle(""); // очищаем форму
			setEmoji("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error");
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
		<div className="page-div">
			<h1>Мои списки</h1>
			<div className="new-wishlist-input">
				<input
					type="text"
					value={emoji}
					id="emoji-input"
					placeholder="😊"
					maxLength={2}
					onChange={(e) => {
						setEmoji(e.target.value);
					}}
				/>
				<input
					type="text"
					value={title}
					id="title-input"
					placeholder="Название"
					onChange={(e) => {
						setTitle(e.target.value);
					}}
				/>
				<input type="submit" value="Создать" onClick={handleCreate} />
			</div>
			{wishlists.map((w) => (
				<Link key={w.id} className="wishlist-div" to={`/wishlists/${w.id}`}>
					{w.emoji} {w.title}
				</Link>
			))}
		</div>
	);
}
