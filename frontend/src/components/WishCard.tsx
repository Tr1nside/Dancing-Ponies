import type { Wish } from "../types";
import { DropdownMenu } from "./DropdownMenu";

interface WishCardProps {
	wish: Wish;
	onClick: () => void;
	onComplete: (completed: boolean) => void;
	deleteWishF: (wish: Wish) => void;
}

export default function WishCard({
	wish,
	onClick,
	onComplete,
	deleteWishF,
}: WishCardProps) {
	return (
		<div className="wishcard-div">
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
	);
}
