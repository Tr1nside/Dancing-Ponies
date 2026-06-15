import { useEffect, useRef, useState } from "react";

export type MenuItem = {
	label: string;
	onClick: () => void;
};

export function DropdownMenu({ items }: { items: MenuItem[] }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (e: MouseEvent) => {
			// если клик был НЕ внутри .dropdown — закрываем
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open]);

	return (
		<div className="dropdown" ref={ref}>
			<button type="button" onClick={() => setOpen(!open)}>
				<img
					src="/other_icon.svg"
					className="icon-button"
					alt="⋯"
					width={24}
					height={24}
				/>
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
