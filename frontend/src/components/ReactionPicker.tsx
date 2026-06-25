import { useEffect, useRef, useState } from "react";

const POPULAR_EMOJIS = [
	"👍",
	"👎",
	"❤️",
	"🔥",
	"😍",
	"😢",
	"😮",
	"😂",
	"🎉",
	"💯",
	"✅",
	"⭐",
	"🙏",
	"👀",
	"🤔",
	"😡",
	"🥳",
	"🤩",
	"🤯",
	"💀",
	"🎁",
	"🎯",
	"💪",
	"🤝",
];

interface ReactionPickerProps {
	onSelect: (emoji: string) => void;
	onClose: () => void;
}

export default function ReactionPicker({
	onSelect,
	onClose,
}: ReactionPickerProps) {
	const [query, setQuery] = useState("");
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const filtered = query
		? POPULAR_EMOJIS.filter((e) => e.includes(query))
		: POPULAR_EMOJIS;

	return (
		<div className="reaction-picker" ref={ref}>
			<input
				type="text"
				placeholder="Search emoji..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="reaction-search-input"
			/>
			<div className="reaction-emoji-grid">
				{filtered.map((emoji) => (
					<button
						key={emoji}
						type="button"
						className="reaction-emoji-btn"
						onClick={() => onSelect(emoji)}
					>
						{emoji}
					</button>
				))}
			</div>
			<div className="reaction-custom-input-row">
				<input
					type="text"
					placeholder="Or paste any emoji"
					className="reaction-custom-input"
					onKeyDown={(e) => {
						if (e.key === "Enter" && e.currentTarget.value.trim()) {
							onSelect(e.currentTarget.value.trim());
						}
					}}
				/>
			</div>
		</div>
	);
}
