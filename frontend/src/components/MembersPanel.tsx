import { useState } from "react";
import { createInvite, kickMember } from "../api/wishlists";
import type { User, Wishlist } from "../types";

interface Props {
	wishlist: Wishlist;
	currentUserId: number;
	onMemberKicked: (userId: number) => void;
}

export default function MembersPanel({
	wishlist,
	currentUserId,
	onMemberKicked,
}: Props) {
	const [inviteUrl, setInviteUrl] = useState<string | null>(null);
	const [loadingInvite, setLoadingInvite] = useState(false);
	const [copied, setCopied] = useState(false);

	const isOwner = wishlist.owner_id === currentUserId;

	const handleInvite = async () => {
		setLoadingInvite(true);
		try {
			const url = await createInvite(wishlist.id);
			setInviteUrl(url);
		} finally {
			setLoadingInvite(false);
		}
	};

	const handleCopy = () => {
		if (!inviteUrl) return;
		navigator.clipboard.writeText(inviteUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleKick = async (userId: number) => {
		await kickMember(wishlist.id, userId);
		onMemberKicked(userId);
	};

	return (
		<div className="members-panel">
			<h2>Участники</h2>

			<div className="member-row">
				<span>
					{wishlist.owner_id === currentUserId
						? "Вы (владелец)"
						: `${wishlist.owner.first_name}`}
				</span>
			</div>

			{wishlist.members.map((member: User) => (
				<div key={member.id} className="member-row">
					<span>{member.first_name}</span>
					{isOwner && member.id !== currentUserId && (
						<button
							type="button"
							className="btn-danger"
							onClick={() => handleKick(member.id)}
						>
							Удалить
						</button>
					)}
				</div>
			))}

			<button
				type="button"
				className="btn-primary"
				onClick={handleInvite}
				disabled={loadingInvite}
			>
				{loadingInvite ? "Создаём..." : "Пригласить участника"}
			</button>

			{inviteUrl && (
				<div className="invite-box">
					<span className="invite-url">{inviteUrl}</span>
					<button type="button" className="btn-secondary" onClick={handleCopy}>
						{copied ? "Скопировано!" : "Копировать"}
					</button>
				</div>
			)}
		</div>
	);
}
