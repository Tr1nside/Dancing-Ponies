import client from "./client";
import type { Wishlist } from "../types";

export const getWishlists = () =>
    client.get<Wishlist[]>("/wishlists/").then((r) => r.data);

export const createWishlist = (data: Omit<Wishlist, "id">) =>
    client.post<Wishlist>("/wishlists/", data).then((r) => r.data);

export const deleteWishlist = (id: number) =>
    client.delete(`/wishlists/${id}`).then((r) => r.data);
