import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	createTodo,
	deleteTodo,
	getTodos,
	handleTodoComplete,
} from "../api/todos";
import { deleteWishlist, getWishlist, updateWishlist } from "../api/wishlists";
import BackButton from "../components/BackButton";
import { DropdownMenu, type MenuItem } from "../components/DropdownMenu";
import MembersPanel from "../components/MembersPanel";
import TodoCard from "../components/TodoCard";
import type { Todo, Wishlist } from "../types";

export default function TodosPage() {
	const navigate = useNavigate();
	const { wishlistId } = useParams();
	const [todos, setTodos] = useState<Todo[]>([]);
	const [todolist, setTodolist] = useState<Wishlist>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState<string>("");
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
	const isOwner = todolist?.owner_id === currentUserId;

	const handleSave = async () => {
		if (!wishlistId) return;
		try {
			const updated = await updateWishlist(Number(wishlistId), {
				title: listTitle || undefined,
				emoji: emoji || undefined,
			});
			setTodolist(updated);
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
			const newWish = await createTodo({
				todolist_id: wishlistIdInt,
				title,
			});
			setTodos([...todos, newWish]); // добавляем в список без перезагрузки
			setTitle("");
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
		setTodos(todos.map((t) => (t.id === wish_id ? { ...t, is_completed } : t)));

		try {
			await handleTodoComplete(wish_id, { is_completed });
		} catch (e) {
			// Откат
			setTodos(
				todos.map((t) =>
					t.id === wish_id ? { ...t, is_completed: !is_completed } : t,
				),
			);
			setError(e instanceof Error ? e.message : "Error");
			return;
		}
	};
	const handleDeleteWish = async (wish: Todo) => {
		try {
			await deleteTodo(wish.id);
			setTodos((prev) => prev.filter((w) => w.id !== wish.id));
		} catch (e) {
			setError(e instanceof Error ? e.message : "Undefined error");
		}
	};

	const openMemberEdit = () => {
		setListTitle(todolist?.title ?? "");
		setEmoji(todolist?.emoji ?? "");
		setMembersOpen(true);
	};

	useEffect(() => {
		if (wishlistId) {
			getTodos(Number(wishlistId))
				.then(setTodos)
				.catch((e) => setError(e.message))
				.finally(() => {
					setLoading(false);
				});
			getWishlist(Number(wishlistId))
				.then(setTodolist)
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
			{membersOpen && todolist && (
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
							wishlist={todolist}
							currentUserId={currentUserId}
							onMemberKicked={(userId) =>
								setTodolist((prev) =>
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
					{todolist?.emoji} {todolist?.title}
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
					<input type="button" onClick={handleCreate} value="Create" />
				</div>

				<p className="exp">My Todos</p>
				{todos.map((t) => (
					<TodoCard
						key={t.id}
						todo={t}
						onClick={() => navigate(`/todos/${t.id}`)}
						onComplete={(completed) => handleComplete(t.id, completed)}
						deleteWishF={handleDeleteWish}
					/>
				))}
			</div>
		</div>
	);
}
