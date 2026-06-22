import type {
	HandleTodoCompleteRequest,
	Todo,
	TodoCreatePayload,
	TodoUpdatePayload,
} from "../types";
import client from "./client";

export const getTodos = (wishlistId: number): Promise<Todo[]> =>
	client.get(`/wishlists/${wishlistId}/todos`).then((r) => r.data);

export const getTodo = (todoId: number): Promise<Todo> =>
	client.get(`/todos/${todoId}`).then((r) => r.data);

export const createTodo = (data: TodoCreatePayload): Promise<Todo> =>
	client.post(`/wishlists/${data.todolist_id}/todos`, data).then((r) => r.data);

export const updateTodo = (
	todoId: number,
	data: TodoUpdatePayload,
): Promise<Todo> => client.patch(`/todos/${todoId}`, data).then((r) => r.data);

export const handleTodoComplete = (
	todoId: number,
	data: HandleTodoCompleteRequest,
): Promise<{ completed_id: number }> =>
	client.patch(`/todos/${todoId}/complete`, data).then((r) => r.data);

export const deleteTodo = (todoId: number): Promise<{ deleted_id: number }> =>
	client.delete(`/todos/${todoId}`).then((r) => r.data);
