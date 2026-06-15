import type { handleWishCompleteRequest, Wish } from "../types";
import client from "./client";

export const getWishes = (wishlist_id: number) =>
	client.get<Wish[]>(`/wishlists/${wishlist_id}/wishes`).then((r) => r.data);

export const getWish = (wish_id: number) =>
	client.get<Wish>(`/wishes/${wish_id}`).then((r) => r.data);

export const createWish = (
	data: Pick<Wish, "title" | "price" | "url" | "wishlist_id">,
) =>
	client
		.post(`/wishlists/${data.wishlist_id}/wishes`, data)
		.then((r) => r.data);

export const updateWish = (id: number, data: Partial<Wish>) =>
	client.patch(`/wishes/${id}`, data).then((r) => r.data);

export const handleWishComplete = (
	wish_id: number,
	data: handleWishCompleteRequest,
) => client.patch(`/wishes/${wish_id}/complete`, data).then((r) => r.data);

export const deleteWish = (wish_id: number) =>
	client.delete(`/wishes/${wish_id}`).then((r) => r.data);
