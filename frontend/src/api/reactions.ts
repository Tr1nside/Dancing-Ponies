import type { Reaction } from "../types";
import client from "./client";

export const getReactions = (
	targetType: "wish" | "todo",
	targetId: number,
): Promise<Reaction[]> =>
	client
		.get("/reactions", {
			params: { target_type: targetType, target_id: targetId },
		})
		.then((r) => r.data);

export const getReactionsForMany = (
	targetType: "wish" | "todo",
	targetIds: number[],
): Promise<Reaction[]> =>
	client
		.get("/reactions/all", {
			params: { target_type: targetType, target_ids: targetIds.join(",") },
		})
		.then((r) => r.data);

export const createReaction = (data: {
	emoji: string;
	target_type: "wish" | "todo";
	target_id: number;
}): Promise<Reaction> => client.post("/reactions", data).then((r) => r.data);

export const deleteReaction = (id: number): Promise<{ deleted_id: number }> =>
	client.delete(`/reactions/${id}`).then((r) => r.data);
