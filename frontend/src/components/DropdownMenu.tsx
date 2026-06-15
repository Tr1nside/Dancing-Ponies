import { useState } from "react";

export type MenuItem = {
	label: string;
	onClick: () => void;
};

export function DropdownMenu({ items }: { items: MenuItem[] }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="dropdown">
			<button type="button" onClick={() => setOpen(!open)}>
				⋯
			</button>
			{open && (
				<div className="dropdown-menu">
					{items.map((item) => (
						<button
							type="button"
							key={item.label}
							onClick={() => {
								item.onClick();
								setOpen(false);
							}}
						>
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
