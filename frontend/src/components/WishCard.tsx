import type { Wish } from "../types";

interface WishCardProps {
	wish: Wish;
	onClick: () => void;
	onComplete: (completed: boolean) => void;
}

export default function WishCard({ wish, onClick, onComplete }: WishCardProps) {
	return (
		<div className="wishcard-div">
			<input
				type="checkbox"
				checked={wish.is_completed}
				onChange={(e) => onComplete(e.target.checked)}
			/>
			<button type="button" key={wish.id} onClick={onClick}>
				{wish.title} {wish.price ? `— ${wish.price}₽` : ""}
			</button>
		</div>
	);
}
