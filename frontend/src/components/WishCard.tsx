import type { Wish } from "../types";
import { DropdownMenu } from "./DropdownMenu";

interface WishCardProps {
	wish: Wish;
	onClick: () => void;
	onComplete: (completed: boolean) => void;
}

export default function WishCard({ wish, onClick, onComplete }: WishCardProps) {
	return (
		<div className="wishcard-div">
			<span className="wishlist-left">
				<input
					type="checkbox"
					checked={wish.is_completed}
					onChange={(e) => onComplete(e.target.checked)}
				/>
				<button type="button" key={wish.id} onClick={onClick}>
					{wish.title} {wish.price ? `— ${wish.price}₽` : ""}
				</button>
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
		</div>
	);
}
