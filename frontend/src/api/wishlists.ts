import type { Wishlist } from "../types";
import client from "./client";

export const getWishlists = () =>
	client.get<Wishlist[]>("/wishlists/").then((r) => r.data);

export const getWishlist = (wishlist_id: number) =>
	client.get<Wishlist>(`/wishlists/${wishlist_id}`).then((r) => r.data);

export const createWishlist = (data: Pick<Wishlist, "title" | "emoji">) =>
	client.post<Wishlist>("/wishlists/", data).then((r) => r.data);

export const deleteWishlist = (id: number) =>
	client.delete(`/wishlists/${id}`).then((r) => r.data);

export async function createInvite(wishlistId: number): Promise<string> {
	const res = await client.post(`/wishlists/${wishlistId}/invite`);
	const token: string = res.data.token;
	return `https://t.me/${import.meta.env.VITE_BOT_USERNAME}?startapp=${token}`;
}

export const acceptInvite = async (token: string): Promise<number> => {
	const response = await client.post(`/invites/${token}/accept`);
	return response.data.wishlist_id;
};

export async function kickMember(
	wishlistId: number,
	userId: number,
): Promise<void> {
	await client.delete(`/wishlists/${wishlistId}/members/${userId}`);
}

export const updateWishlist = async (
	id: number,
	data: { title?: string; emoji?: string },
): Promise<Wishlist> => {
	const response = await client.patch(`/wishlists/${id}`, data);
	return response.data;
};
