import type { Todo } from "../types";
import { DropdownMenu } from "./DropdownMenu";

interface TodoCardProps {
	todo: Todo;
	onClick: () => void;
	onComplete: (completed: boolean) => void;
	deleteWishF: (wish: Todo) => void;
}

export default function TodoCard({
	todo,
	onClick,
	onComplete,
	deleteWishF,
}: TodoCardProps) {
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
				>
					{todo.title}
				</button>
			</span>
			<DropdownMenu
				items={[
					{
						label: "Delete",
						onClick: () => deleteWishF(todo),
					},
				]}
			/>
		</div>
	);
}
