export default function BackButton({ onClick }: { onClick: () => void }) {
	return (
		<button type="button" className="back-button" onClick={onClick}>
			<img src="/back_icon.svg" alt="back" width={24} height={24} />
		</button>
	);
}
