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

const API_URL = import.meta.env.VITE_API_URL ?? "";

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
			className="wish-input"
		/>
	);
}

export default function WishPage() {
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
	const [editPhoto, setEditPhoto] = useState<File | null>(null);

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
			setEditPhoto(null);
		}
		setIsEditing(!isEditing);
	};

	const handleSave = async () => {
		if (wish === null) return;
		try {
			const payload = { ...editData, photo: editPhoto };
			const updated = await updateWish(wish.id, payload);
			setWish(updated);
			setIsEditing(false);
			setEditPhoto(null);
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
					onClick={() => navigate(`/wishlists/${wish?.wishlist_id}/wishes`)}
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
				<p className="exp">Wish</p>
				{wish.photo_file_name && (
                    <div className="wish-image-container">
                        <img
                            src={`${API_URL}/uploads/wishes/${wish.photo_file_name}`}
                            alt={wish.title}
                            className="wish-image"
                        />
                    </div>
				)}
				<EditableField
					isEditing={isEditing}
					value={editData.description}
					display={wish.description && <p>{wish.description}</p>}
					type="text"
					onChange={(e) => updateField("description", e.target.value)}
					placeholder="Description"
					multiline={true}
				/>

				<EditableField
					isEditing={isEditing}
					value={editData.price}
					display={wish.price && <p>{wish.price} ₽</p>}
					type="number"
					onChange={(e) => updateField("price", Number(e.target.value))}
					placeholder="Цена"
				/>

				<div className="wish-btns">
					<EditableField
						isEditing={isEditing}
						value={editData.url}
						display={
							wish.url && (
								<button
									type="button"
									onClick={() => window.open(wish.url ?? undefined, "_blank")}
									className="btn-primary"
								>
									Buy
								</button>
							)
						}
						type="url"
						onChange={(e) => updateField("url", normalizeUrl(e.target.value))}
						placeholder="Link"
					/>
					<button
						onClick={handleComplete}
						className="btn-secondary"
						type="button"
					>
						{wish.is_completed ? "Done" : "Mark as done"}
					</button>
				</div>
				{isEditing && (
					<div className="wish-btns">
						<label className="btn-secondary">
							Загрузить фото
							<input
								type="file"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) setEditPhoto(file);
								}}
								style={{ display: "none" }}
							/>
						</label>
						{editPhoto && (
							<span className="photo-filename">{editPhoto.name}</span>
						)}
					</div>
				)}
				{isEditing && (
					<div className="wish-btns">
						<button type="button" onClick={handleSave}>
							✓ Сохранить
						</button>
						<button type="button" onClick={handleEdit}>
							Отмена
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
