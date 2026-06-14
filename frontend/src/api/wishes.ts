import client from "./client";
import type { Wish } from "../types";

export const getWishes = (wishlist_id: number) =>
    client.get<Wish[]>(`/wishlists/${wishlist_id}/wishes`).then((r) => r.data);

export const getWish = (wish_id: number) =>
    client.get<Wish>(`/wishes/${wish_id}`).then((r) => r.data);

export const createWish = (data: Omit<Wish, "id">) =>
    client.post(`/wishlists/${data.wishlist_id}/wishes`, data).then((r) => r.data);

export const deleteWish = (wish_id: number) =>
    client.delete(`/wishes/${wish_id}`).then((r) => r.data);
