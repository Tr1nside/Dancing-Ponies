export default function BackButton({ onClick }: { onClick: () => void }) {
	return (
		<button type="button" className="back-button" onClick={onClick}>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				aria-label="Back"
				className="icon-button"
			>
				<path
					d="M15 18L9 12L15 6"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			</svg>
		</button>
	);
}
