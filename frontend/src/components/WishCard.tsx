import { useCallback, useEffect, useRef, useState } from "react";
import { createReaction, deleteReaction, getReactions } from "../api/reactions";
import type { Reaction, Wish } from "../types";
import { DropdownMenu } from "./DropdownMenu";
import ReactionPicker from "./ReactionPicker";

interface WishCardProps {
	wish: Wish;
	onClick: () => void;
	onComplete: (completed: boolean) => void;
	deleteWishF: (wish: Wish) => void;
}

const LONG_PRESS_MS = 400;

export default function WishCard({
	wish,
	onClick,
	onComplete,
	deleteWishF,
}: WishCardProps) {
	const [reactions, setReactions] = useState<Reaction[]>(wish.reactions ?? []);
	const [pickerOpen, setPickerOpen] = useState(false);
	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const didLongPress = useRef(false);

	useEffect(() => {
		getReactions("wish", wish.id)
			.then(setReactions)
			.catch(() => {});
	}, [wish.id]);

	const handleLongPressStart = useCallback(() => {
		didLongPress.current = false;
		longPressTimer.current = setTimeout(() => {
			didLongPress.current = true;
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
				target_type: "wish",
				target_id: wish.id,
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
	<div className={`wishcard-div${wish.is_completed ? " completed" : ""}`}>
			<div className="wishcard-main">
                <span className="wishlist-left">
                    <input
                        type="checkbox"
                        checked={wish.is_completed}
                        onChange={(e) => onComplete(e.target.checked)}
                    />
                    <button
                        className="wish-btn"
                        type="button"
                        key={wish.id}
                        onClick={onClick}
                        onMouseDown={handleLongPressStart}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={handleLongPressStart}
                        onTouchEnd={handleLongPressEnd}
                        onContextMenu={handleContextMenu}
                    >
                        {wish.title} {wish.price ? `— ${wish.price}₽` : ""}
                    </button>
                </span>
				<DropdownMenu
					items={[
						{
							label: "Delete",
							onClick: () => deleteWishF(wish),
						},
					]}
				/>
			</div>
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
				<div className="reaction-picker-wrapper">
					<button
						type="button"
						className="reaction-add-btn"
						onClick={(e) => {
							e.stopPropagation();
							setPickerOpen(true);
						}}
					>
						+
					</button>
					{pickerOpen && (
						<ReactionPicker
							onSelect={handleSelectReaction}
							onClose={() => setPickerOpen(false)}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
