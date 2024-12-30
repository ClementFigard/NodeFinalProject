import axios from "axios";
import { Todo } from "../types/todo";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getTodos = async () => {
  const response = await api.get<Todo[]>("/todos");
  return response.data;
};

export const createTodo = async (
  todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
) => {
  const response = await api.post<Todo>("/todos", todo);
  return response.data;
};

export const updateTodo = async (id: string, todo: Partial<Todo>) => {
  const response = await api.put<Todo>(`/todos/${id}`, todo);
  return response.data;
};

export const deleteTodo = async (id: string) => {
  await api.delete(`/todos/${id}`);
};
