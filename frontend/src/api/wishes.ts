import type {
	HandleWishCompleteRequest,
	Wish,
	WishCreatePayload,
	WishUpdatePayload,
} from "../types";
import client from "./client";

export const getWishes = (wishlistId: number): Promise<Wish[]> =>
	client.get(`/wishlists/${wishlistId}/wishes`).then((r) => r.data);

export const getWish = (wishId: number): Promise<Wish> =>
	client.get(`/wishes/${wishId}`).then((r) => r.data);

export const createWish = (data: WishCreatePayload): Promise<Wish> =>
	client
		.post(`/wishlists/${data.wishlist_id}/wishes`, data)
		.then((r) => r.data);

export const updateWish = (
	id: number,
	data: WishUpdatePayload,
): Promise<Wish> => client.patch(`/wishes/${id}`, data).then((r) => r.data);

export const handleWishComplete = (
	wishId: number,
	data: HandleWishCompleteRequest,
): Promise<{ completed_id: number }> =>
	client.patch(`/wishes/${wishId}/complete`, data).then((r) => r.data);

export const deleteWish = (wishId: number): Promise<{ deleted_id: number }> =>
	client.delete(`/wishes/${wishId}`).then((r) => r.data);
