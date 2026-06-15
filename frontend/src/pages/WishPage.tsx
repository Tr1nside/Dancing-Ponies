import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	deleteWish,
	getWish,
	handleWishComplete,
	updateWish,
} from "../api/wishes";
import { DropdownMenu, type MenuItem } from "../components/DropdownMenu";
import type { Wish } from "../types";

function EditableField({
	isEditing,
	value,
	display,
	type = "text",
	onChange,
}: {
	isEditing: boolean;
	value: string | number;
	display: React.ReactNode;
	type?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	if (!isEditing) return <>{display}</>;
	return <input value={value} type={type} onChange={onChange} />;
}

export default function WishesPage() {
	const navigate = useNavigate();
	const { wishId } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [wish, setWish] = useState<Wish | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
		title: "",
		description: "",
		price: 0,
		url: "",
	});

	const updateField = (
		field: keyof typeof editData,
		value: string | number,
	) => {
		setEditData((prev) => ({ ...prev, [field]: value }));
	};

	const handleComplete = async () => {
		if (wish === null) return;

		const updated = { ...wish, is_completed: !wish.is_completed };
		setWish(updated); // оптимистичное обновление

		try {
			await handleWishComplete(wish.id, { is_completed: updated.is_completed });
		} catch (e) {
			setWish(wish); // откат - возвращаем старый объект
			setError(e instanceof Error ? e.message : "Error");
		}
	};
	const handleEdit = () => {
		if (!isEditing && wish != null) {
			setEditData({
				title: wish.title,
				description: wish.description ?? "",
				price: wish.price ?? 0,
				url: wish.url ?? "",
			});
		}
		setIsEditing(!isEditing);
	};

	const handleSave = async () => {
		if (wish === null) return;
		try {
			const updated = await updateWish(wish.id, editData);
			setWish(updated);
			setIsEditing(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Ошибка");
		}
	};

	const handleDeleteWish = async () => {
		if (wishId === undefined) {
			setError("Wishlist id is NaN");
			return;
		}

		const wishIdInt = Number(wishId);
		if (Number.isNaN(wishIdInt)) {
			setError("Wishlist id is NaN");
		}
		try {
			await deleteWish(wishIdInt);
			navigate(`/wishlists/${wish?.wishlist_id}`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Undefind error");
			return;
		}
	};

	useEffect(() => {
		if (wishId) {
			getWish(Number(wishId))
				.then((w) => {
					setWish(w);
					setEditData({
						title: w.title,
						description: w.description ?? "",
						price: w.price ?? 0,
						url: w.url ?? "",
					});
				})
				.catch((e) => setError(e.message))
				.finally(() => {
					setLoading(false);
				});
		}
	}, [wishId]);

	if (loading) return <div>Загрузка...</div>;

	if (error) return <div>Ошибка: {error}</div>;

	if (wish == null) return <div>Wish not find</div>;

	return (
		<div className="page-div">
			<header className="wish-header">
				<button
					type="button"
					className="back-button"
					onClick={() => navigate(`/wishlists/${wish?.wishlist_id}`)}
				>
					back
				</button>
				<EditableField
					isEditing={isEditing}
					value={editData.title}
					display={<h1>{wish.title}</h1>}
					type="text"
					onChange={(e) => updateField("title", e.target.value)}
				/>

				<DropdownMenu
					items={
						[
							!isEditing
								? { label: "Редактировать", onClick: handleEdit }
								: null,
							{ label: "Удалить", onClick: handleDeleteWish },
						].filter(Boolean) as MenuItem[]
					}
				/>
			</header>
			<div className="wish-body">
				<EditableField
					isEditing={isEditing}
					value={editData.url}
					display={
						wish.url && (
							<a href={wish.url} target="_blank" rel="noopener noreferrer">
								Ссылка
							</a>
						)
					}
					type="url"
					onChange={(e) => updateField("url", e.target.value)}
				/>
				<EditableField
					isEditing={isEditing}
					value={editData.price}
					display={wish.price && <p>{wish.price} ₽</p>}
					type="number"
					onChange={(e) => updateField("price", Number(e.target.value))}
				/>
				<EditableField
					isEditing={isEditing}
					value={editData.description}
					display={wish.description && <p>{wish.description}</p>}
					type="text"
					onChange={(e) => updateField("description", e.target.value)}
				/>

				<button onClick={handleComplete} type="button">
					{wish.is_completed ? "✓ Выполнено" : "Отметить выполненным"}
				</button>

				{isEditing ? (
					<div className="edit-actions">
						<button type="button" onClick={handleSave}>
							✓ Сохранить
						</button>
						<button type="button" onClick={handleEdit}>
							Отмена
						</button>
					</div>
				) : (
					<button type="button" onClick={handleEdit}>
						Редактировать
					</button>
				)}
			</div>
		</div>
	);
}
