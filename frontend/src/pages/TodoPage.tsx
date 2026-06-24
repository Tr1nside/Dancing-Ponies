import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	deleteTodo,
	getTodo,
	handleTodoComplete,
	updateTodo,
} from "../api/todos";
import BackButton from "../components/BackButton";
import { DropdownMenu, type MenuItem } from "../components/DropdownMenu";
import type { Todo } from "../types";

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

export default function TodoPage() {
	const navigate = useNavigate();
	const { todoId } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [todo, setTodo] = useState<Todo | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
		title: "",
		description: "",
	});

	const updateField = (
		field: keyof typeof editData,
		value: string | number,
	) => {
		setEditData((prev) => ({ ...prev, [field]: value }));
	};

	const handleComplete = async () => {
		if (todo === null) return;

		const updated = { ...todo, is_completed: !todo.is_completed };
		setTodo(updated); // оптимистичное обновление

		try {
			await handleTodoComplete(todo.id, { is_completed: updated.is_completed });
		} catch (e) {
			setTodo(todo); // откат - возвращаем старый объект
			setError(e instanceof Error ? e.message : "Error");
		}
	};
	const handleEdit = () => {
		if (!isEditing && todo != null) {
			setEditData({
				title: todo.title,
				description: todo.description ?? "",
			});
		}
		setIsEditing(!isEditing);
	};

	const handleSave = async () => {
		if (todo === null) return;
		try {
			const updated = await updateTodo(todo.id, editData);
			setTodo(updated);
			setIsEditing(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Ошибка");
		}
	};

	const handleDeleteWish = async () => {
		if (todoId === undefined) {
			setError("Wishlist id is NaN");
			return;
		}

		const wishIdInt = Number(todoId);
		if (Number.isNaN(wishIdInt)) {
			setError("Wishlist id is NaN");
		}
		try {
			await deleteTodo(wishIdInt);
			navigate(`/wishlists/${todo?.todolist_id}`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Undefind error");
			return;
		}
	};

	useEffect(() => {
		if (todoId) {
			getTodo(Number(todoId))
				.then((w) => {
					setTodo(w);
					setEditData({
						title: w.title,
						description: w.description ?? "",
					});
				})
				.catch((e) => setError(e.message))
				.finally(() => {
					setLoading(false);
				});
		}
	}, [todoId]);

	if (loading) return <div>Загрузка...</div>;

	if (error) return <div>Ошибка: {error}</div>;

	if (todo == null) return <div>Wish not find</div>;

	return (
		<div className="page-div">
			<header className="wish-header">
				<BackButton
					onClick={() => navigate(`/wishlists/${todo?.todolist_id}/todos`)}
				/>
				<EditableField
					isEditing={isEditing}
					value={editData.title}
					display={<h1>{todo.title}</h1>}
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
				<p className="exp">Todo</p>

				<EditableField
					isEditing={isEditing}
					value={editData.description}
					display={todo.description && <p>{todo.description}</p>}
					type="text"
					onChange={(e) => updateField("description", e.target.value)}
					placeholder="Description"
					multiline={true}
				/>

				<div className="wish-btns">
					<button
						onClick={handleComplete}
						className="btn-secondary"
						type="button"
					>
						{todo.is_completed ? "Done" : "Mark as done"}
					</button>
				</div>
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
