import type { ReactNode } from "react";

export type Id = number;
export type ISODateTimeString = string;

export type ListType = "wishlist" | "todolist";

export type User = {
	id: Id;
	first_name: string;
	username: string | null;
};

export type InviteResponse = {
	id: Id;
	token: string;
	created_at: ISODateTimeString;
};

export type Wishlist = {
	id: Id;
	title: string;
	emoji: string;
	list_type: ListType;
	owner_id: Id;
	owner: User;
	created_at: ISODateTimeString;
	members: User[];
};

export type Wish = {
	id: Id;
	title: string;
	wishlist_id: Id;
	description: string | null;
	url: string | null;
	price: number | null;
	is_completed: boolean;
	photo_file_name: string | null;
};

export type Todo = {
	id: Id;
	todolist_id: Id;
	title: string;
	description: string | null;
	is_completed: boolean;
	due_date: ISODateTimeString | null;
	priority: number;
};

export type CreateWishlistPayload = {
	title: string;
	emoji: string;
	list_type?: ListType;
};

export type UpdateWishlistPayload = {
	title?: string;
	emoji?: string;
};

export type WishCreatePayload = {
	title: string;
	wishlist_id: Id;
	description?: string | null;
	url?: string | null;
	price?: number | null;
};

export type WishUpdatePayload = {
	title?: string;
	description?: string | null;
	price?: number | null;
	url?: string | null;
	photo?: File | null;
};

export type HandleWishCompleteRequest = {
	is_completed: boolean;
};

export type TodoCreatePayload = {
	todolist_id: Id;
	title: string;
	description?: string | null;
	due_date?: ISODateTimeString | null;
	priority?: number;
};

export type TodoUpdatePayload = {
	title?: string;
	description?: string | null;
	due_date?: ISODateTimeString | null;
	priority?: number | null;
};

export type HandleTodoCompleteRequest = {
	is_completed: boolean;
};

export type DeleteResponse = {
	deleted_id: Id;
};

export type CompleteResponse = {
	completed_id: Id;
};

export type AcceptInviteResponse = {
	wishlist_id: Id;
};

export type KickMemberResponse = {
	wishlist_id: Id;
	kicked_user: Id;
};

export type Nullable<T> = T | null;

export type EditableFieldProps = {
	isEditing: boolean;
	value: string | number;
	display: ReactNode;
	type?: string;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => void;
	placeholder?: string;
	multiline?: boolean;
};
