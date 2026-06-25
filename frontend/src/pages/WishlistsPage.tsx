import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createWishlist, deleteWishlist, getWishlists } from "../api/wishlists";
import { DropdownMenu, type MenuItem } from "../components/DropdownMenu";
import type { ListType, Wishlist } from "../types";

export default function WishlistsPage() {
	const [wishlists, setWishlists] = useState<Wishlist[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState<string>("");
	const [emoji, setEmoji] = useState<string>("");
	const [listType, setListType] = useState<ListType>("wishlist");

	let currentUserId = 0;
	try {
		const { initData } = retrieveLaunchParams();
		currentUserId = initData?.user?.id ?? 0;
	} catch {
		currentUserId = Number(import.meta.env.VITE_DEV_INIT_DATA);
	}

	const handleDeleteList = async (wishlist: Wishlist) => {
		try {
			await deleteWishlist(wishlist.id);
			setWishlists((prev) => prev.filter((w) => w.id !== wishlist.id));
		} catch (e) {
			setError(e instanceof Error ? e.message : "Undefind error");
			return;
		}
	};

	const handleCreate = async () => {
		if (!title.trim()) return;

		const emojiToSend = emoji || "⬛";
		try {
			const newWishlist = await createWishlist({
				title,
				emoji: emojiToSend,
				list_type: listType,
			});
			setWishlists([...wishlists, newWishlist]);
			setTitle("");
			setEmoji("");
			setListType("wishlist");
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
				<select
					id="list-type-input"
					value={listType}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						setListType(e.target.value as ListType)
					}
				>
					<option value="wishlist">wishlist</option>
					<option value="todolist">todolist</option>
				</select>
				<input type="submit" value="Create" onClick={handleCreate} />
			</div>
			<div className="cards">
				<p className="exp">My Wishlists</p>
				{wishlists.map((w) => (
					<Link
						key={w.id}
						className="wishlist-div"
						to={
							w.list_type === "wishlist"
								? `/wishlists/${w.id}/wishes`
								: `/wishlists/${w.id}/todos`
						}
					>
						<span className="wishlist-left">
							<p className="emoji-icon">{w.emoji}</p> {w.title}
						</span>
						<DropdownMenu
							items={
								[
									w.owner_id === currentUserId
										? {
												label: "Delete",
												onClick: () => {
													handleDeleteList(w);
												},
											}
										: null,
								].filter(Boolean) as MenuItem[]
							}
						/>
					</Link>
				))}
			</div>
		</div>
	);
}
