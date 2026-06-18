import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createWishlist, getWishlists } from "../api/wishlists";
import { DropdownMenu } from "../components/DropdownMenu";
import type { Wishlist } from "../types";

export default function WishlistsPage() {
	const [wishlists, setWishlists] = useState<Wishlist[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState<string>("");
	const [emoji, setEmoji] = useState<string>("");

	const handleCreate = async () => {
		if (!title.trim()) return;

		const emojiToSend = emoji || "⬛";
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
			<div className="new-wishlist-input">
				<input
					type="text"
					value={title}
					id="title-input"
					placeholder="Title..."
					onChange={(e) => {
						setTitle(e.target.value);
					}}
				/>
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
				<input type="submit" value="Create" onClick={handleCreate} />
			</div>
			<div className="cards">
				<p className="exp">My Wishlists</p>
				{wishlists.map((w) => (
					<Link key={w.id} className="wishlist-div" to={`/wishlists/${w.id}`}>
						<span className="wishlist-left">
							<p className="emoji-icon">{w.emoji}</p> {w.title}
						</span>
						<DropdownMenu
							items={[
								{
									label: "Delete",
									onClick: () => {
										console.log;
									},
								},
							]}
						/>
					</Link>
				))}
			</div>
		</div>
	);
}
