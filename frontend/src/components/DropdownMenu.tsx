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
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="dropdown-toggle"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-label="Menu"
					className="icon-button"
				>
					<circle cx="12" cy="5" r="2" />
					<circle cx="12" cy="12" r="2" />
					<circle cx="12" cy="19" r="2" />
				</svg>
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
