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
