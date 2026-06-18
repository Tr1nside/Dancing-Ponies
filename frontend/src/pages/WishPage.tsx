import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	deleteWish,
	getWish,
	handleWishComplete,
	updateWish,
} from "../api/wishes";
import BackButton from "../components/BackButton";
import { DropdownMenu, type MenuItem } from "../components/DropdownMenu";
import type { Wish } from "../types";

function normalizeUrl(url: string): string {
	if (!url) return "";
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	return `https://${url}`;
}

function EditableField({
	isEditing,
	value,
	display,
	type = "text",
	onChange,
	placeholder = "",
	multiline = false,
}: {
	isEditing: boolean;
	value: string | number;
	display: React.ReactNode;
	type?: string;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => void;
	placeholder: string;
	multiline?: boolean;
}) {
	if (!isEditing) return <>{display}</>;

	if (multiline) {
		return (
			<textarea
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				id="description-input"
			/>
		);
	}

	return (
		<input
			value={value}
			type={type}
			onChange={onChange}
			placeholder={placeholder}
		/>
	);
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
				<BackButton
					onClick={() => navigate(`/wishlists/${wish?.wishlist_id}`)}
				/>
				<EditableField
					isEditing={isEditing}
					value={editData.title}
					display={<h1>{wish.title}</h1>}
					type="text"
					onChange={(e) => updateField("title", e.target.value)}
					placeholder="Название"
				/>

				<DropdownMenu
					items={
						[
							!isEditing ? { label: "Edit", onClick: handleEdit } : null,
							{ label: "Delete", onClick: handleDeleteWish },
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
							<a
								href={normalizeUrl(wish.url)}
								target="_blank"
								rel="noopener noreferrer"
							>
								Ссылка
							</a>
						)
					}
					type="url"
					onChange={(e) => updateField("url", normalizeUrl(e.target.value))}
					placeholder="Ссылка"
				/>
				<EditableField
					isEditing={isEditing}
					value={editData.price}
					display={wish.price && <p>{wish.price} ₽</p>}
					type="number"
					onChange={(e) => updateField("price", Number(e.target.value))}
					placeholder="Цена"
				/>
				<EditableField
					isEditing={isEditing}
					value={editData.description}
					display={wish.description && <p>{wish.description}</p>}
					type="text"
					onChange={(e) => updateField("description", e.target.value)}
					placeholder="Описание"
					multiline={true}
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
