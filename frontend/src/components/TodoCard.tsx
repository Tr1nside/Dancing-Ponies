import { useCallback, useEffect, useRef, useState } from "react";
import { createReaction, deleteReaction, getReactions } from "../api/reactions";
import type { Reaction, Todo } from "../types";
import { DropdownMenu } from "./DropdownMenu";
import ReactionPicker from "./ReactionPicker";

interface TodoCardProps {
	todo: Todo;
	onClick: () => void;
	onComplete: (completed: boolean) => void;
	deleteWishF: (wish: Todo) => void;
}

const LONG_PRESS_MS = 400;

export default function TodoCard({
	todo,
	onClick,
	onComplete,
	deleteWishF,
}: TodoCardProps) {
	const [reactions, setReactions] = useState<Reaction[]>(todo.reactions ?? []);
	const [pickerOpen, setPickerOpen] = useState(false);
	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		getReactions("todo", todo.id)
			.then(setReactions)
			.catch(() => {});
	}, [todo.id]);

	const handleLongPressStart = useCallback(() => {
		longPressTimer.current = setTimeout(() => {
			setPickerOpen(true);
		}, LONG_PRESS_MS);
	}, []);

	const handleLongPressEnd = useCallback(() => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	}, []);

	const handleSelectReaction = async (emoji: string) => {
		setPickerOpen(false);
		try {
			const updated = await createReaction({
				emoji,
				target_type: "todo",
				target_id: todo.id,
			});
			setReactions((prev) => {
				const filtered = prev.filter((r) => r.user_id !== updated.user_id);
				return [...filtered, updated];
			});
		} catch {
			// silently fail
		}
	};

	const handleRemoveReaction = async (reactionId: number) => {
		try {
			await deleteReaction(reactionId);
			setReactions((prev) => prev.filter((r) => r.id !== reactionId));
		} catch {
			// silently fail
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setPickerOpen(true);
	};

	const grouped = reactions.reduce<Record<string, Reaction[]>>((acc, r) => {
		acc[r.emoji] = acc[r.emoji] ?? [];
		acc[r.emoji].push(r);
		return acc;
	}, {});

	return (
		<div className="wishcard-div">
			<span className="wishlist-left">
				<input
					type="checkbox"
					checked={todo.is_completed}
					onChange={(e) => onComplete(e.target.checked)}
				/>
				<button
					className="wish-btn"
					type="button"
					key={todo.id}
					onClick={onClick}
					onMouseDown={handleLongPressStart}
					onMouseUp={handleLongPressEnd}
					onMouseLeave={handleLongPressEnd}
					onTouchStart={handleLongPressStart}
					onTouchEnd={handleLongPressEnd}
					onContextMenu={handleContextMenu}
				>
					{todo.title}
				</button>
			</span>
			<div className="reaction-bar">
				{Object.entries(grouped).map(([emoji, items]) => (
					<button
						key={emoji}
						type="button"
						className="reaction-chip"
						onClick={() => handleRemoveReaction(items[0].id)}
						title={`${items.length} reaction${items.length > 1 ? "s" : ""}`}
					>
						{emoji} <span className="reaction-count">{items.length}</span>
					</button>
				))}
				<button
					type="button"
					className="reaction-add-btn"
					onClick={() => setPickerOpen(true)}
				>
					+
				</button>
			</div>
			<DropdownMenu
				items={[
					{
						label: "Delete",
						onClick: () => deleteWishF(todo),
					},
				]}
			/>
			{pickerOpen && (
				<ReactionPicker
					onSelect={handleSelectReaction}
					onClose={() => setPickerOpen(false)}
				/>
			)}
		</div>
	);
}
