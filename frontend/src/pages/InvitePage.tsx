import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { acceptInvite } from "../api/wishlists";

export default function InvitePage() {
	const { token } = useParams();
	const navigate = useNavigate();
	const [wishlistId, setWishlistId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!token) return;
		acceptInvite(token)
			.then(setWishlistId)
			.catch(() => setError("Ссылка недействительна или вы уже участник"));
	}, [token]);

	if (error)
		return (
			<div className="page-div">
				<p>{error}</p>
			</div>
		);

	if (!wishlistId)
		return (
			<div className="page-div">
				<p>Загрузка...</p>
			</div>
		);

	return (
		<div className="page-div">
			<h1>Вас добавили в список!</h1>
			<button
				type="button"
				className="btn-primary"
				onClick={() => navigate(`/wishlists/${wishlistId}`)}
			>
				Перейти к списку
			</button>
		</div>
	);
}
