import type { InviteResponse, ListType, Wishlist } from "../types";
import client from "./client";

export type CreateWishlistPayload = {
	title: string;
	emoji: string;
	list_type?: ListType;
};

export type UpdateWishlistPayload = {
	title?: string;
	emoji?: string;
};

export const getWishlists = (): Promise<Wishlist[]> =>
	client.get("/wishlists/").then((r) => r.data);

export const getWishlist = (wishlistId: number): Promise<Wishlist> =>
	client.get(`/wishlists/${wishlistId}`).then((r) => r.data);

export const createWishlist = (
	data: CreateWishlistPayload,
): Promise<Wishlist> => client.post("/wishlists/", data).then((r) => r.data);

export const deleteWishlist = (id: number): Promise<{ deleted_id: number }> =>
	client.delete(`/wishlists/${id}`).then((r) => r.data);

export const createInvite = async (wishlistId: number): Promise<string> => {
	const res = await client.post<InviteResponse>(
		`/wishlists/${wishlistId}/invite`,
	);
	const token = res.data.token;
	return `https://t.me/${import.meta.env.VITE_BOT_USERNAME}?startapp=${token}`;
};

export const acceptInvite = async (token: string): Promise<number> => {
	const response = await client.post<{ wishlist_id: number }>(
		`/invites/${token}/accept`,
	);
	return response.data.wishlist_id;
};

export const kickMember = async (
	wishlistId: number,
	userId: number,
): Promise<void> => {
	await client.delete(`/wishlists/${wishlistId}/members/${userId}`);
};

export const updateWishlist = async (
	id: number,
	data: UpdateWishlistPayload,
): Promise<Wishlist> => {
	const response = await client.patch(`/wishlists/${id}`, data);
	return response.data;
};
