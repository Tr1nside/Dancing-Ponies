import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	createWish,
	deleteWish,
	getWishes,
	handleWishComplete,
} from "../api/wishes";
import { deleteWishlist, getWishlist, updateWishlist } from "../api/wishlists";
import BackButton from "../components/BackButton";
import { DropdownMenu, type MenuItem } from "../components/DropdownMenu";
import MembersPanel from "../components/MembersPanel";
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
	const [listTitle, setListTitle] = useState<string>("");
	const [emoji, setEmoji] = useState<string>("");
	const [membersOpen, setMembersOpen] = useState(false);
	const currentUserId = (() => {
		try {
			const { initData } = retrieveLaunchParams();
			return initData?.user?.id ?? 0;
		} catch {
			return Number(import.meta.env.VITE_DEV_INIT_DATA);
		}
	})();
	const isOwner = wishlist?.owner_id === currentUserId;

	const handleSave = async () => {
		if (!wishlistId) return;
		try {
			const updated = await updateWishlist(Number(wishlistId), {
				title: listTitle || undefined,
				emoji: emoji || undefined,
			});
			setWishlist(updated);
			setMembersOpen(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error");
		}
	};
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
				wishlist_id: wishlistIdInt,
			});
			setWishes([...wishes, newWish]); // добавляем в список без перезагрузки
			setTitle(""); // очищаем форму
			setPrice(0);
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
	const handleDeleteWish = async (wish: Wish) => {
		try {
			await deleteWish(wish.id);
			setWishes((prev) => prev.filter((w) => w.id !== wish.id));
		} catch (e) {
			setError(e instanceof Error ? e.message : "Undefined error");
		}
	};

	const openMemberEdit = () => {
		setListTitle(wishlist?.title ?? "");
		setEmoji(wishlist?.emoji ?? "");
		setMembersOpen(true);
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
			{membersOpen && wishlist && (
				<div className="modal-overlay">
					<button
						type="button"
						className="modal-backdrop"
						onClick={() => setMembersOpen(false)}
						aria-label="Закрыть"
					/>
					<div className="modal-content">
						{/* <div className="wishlish-edit"></div> */}
						{isOwner && (
							<div className="wishlist-edit">
								<input
									type="text"
									value={listTitle}
									id="title-input"
									placeholder="Title..."
									onChange={(e) => {
										setListTitle(e.target.value);
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
								<input
									type="submit"
									className="btn-primary"
									value="Save"
									onClick={handleSave}
								/>
							</div>
						)}
						<MembersPanel
							wishlist={wishlist}
							currentUserId={currentUserId}
							onMemberKicked={(userId) =>
								setWishlist((prev) =>
									prev
										? {
												...prev,
												members: prev.members.filter((m) => m.id !== userId),
											}
										: prev,
								)
							}
						/>
						<span className="end-row">
							<button type="button" onClick={() => setMembersOpen(false)}>
								Cancel
							</button>
						</span>
					</div>
				</div>
			)}
			<header className="wishlist-header" style={{ position: "relative" }}>
				<BackButton onClick={() => navigate("/")} />
				<h1>
					{wishlist?.emoji} {wishlist?.title}
				</h1>
				<DropdownMenu
					items={
						[
							isOwner ? { label: "Delete", onClick: handleDeleteList } : null,
							{ label: "Management", onClick: openMemberEdit },
						].filter(Boolean) as MenuItem[]
					}
				/>
			</header>
			<div className="cards">
				<div className="new-wish-form">
					<input
						type="text"
						value={title}
						id="title-input"
						placeholder="Title..."
						onChange={(e) => setTitle(e.target.value)}
					/>
					<input
						type="number"
						value={price || ""}
						id="price-input"
						placeholder="Price"
						onChange={(e) => setPrice(Number(e.target.value))}
					/>
					<input type="button" onClick={handleCreate} value="Create" />
				</div>

				<p className="exp">My Wishes</p>
				{wishes.map((w) => (
					<WishCard
						key={w.id}
						wish={w}
						onClick={() => navigate(`/wishes/${w.id}`)}
						onComplete={(completed) => handleComplete(w.id, completed)}
						deleteWishF={handleDeleteWish}
					/>
				))}
			</div>
		</div>
	);
}
