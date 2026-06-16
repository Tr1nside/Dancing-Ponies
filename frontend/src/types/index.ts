export interface User {
	id: number;
	first_name: string;
	username?: string;
}
export interface Wishlist {
	id: number;
	title: string;
	emoji: string;
	owner_id: number;
	owner: User;
	members: User[];
}

export interface Wish {
	id: number;
	title: string;
	description?: string;
	url?: string;
	price?: number;
	wishlist_id: number;
	is_completed: boolean;
}

export interface handleWishCompleteRequest {
	is_completed: boolean;
}
