import { create } from "zustand";
import { Todo } from "../types/todo";
import * as api from "../lib/api";

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  addTodo: (
    todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTodo: (id: string, todo: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  isLoading: false,
  error: null,
  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const todos = await api.getTodos();
      set({ todos, isLoading: false });
    } catch (err) {
      set({ error: "Failed to fetch todos", isLoading: false });
      console.error(err);
    }
  },
  addTodo: async (todo) => {
    set({ isLoading: true, error: null });
    try {
      const newTodo = await api.createTodo(todo);
      set((state) => ({
        todos: [...state.todos, newTodo],
        isLoading: false,
      }));
    } catch (err) {
      set({ error: "Failed to create todo", isLoading: false });
      console.error(err);
    }
  },
  updateTodo: async (id, todo) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTodo = await api.updateTodo(id, todo);
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: "Failed to update todo", isLoading: false });
      console.error(err);
    }
  },
  deleteTodo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete todo", isLoading: false });
      console.error(error);
    }
  },
}));
