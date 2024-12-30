import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Todo, TodoStatus } from "../types/todo";

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => void;
  initialTodo?: Todo;
}

export function TodoModal({
  isOpen,
  onClose,
  onSubmit,
  initialTodo,
}: TodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TodoStatus>("TODO");

  useEffect(() => {
    if (initialTodo) {
      setTitle(initialTodo.title);
      setDescription(initialTodo.description);
      setStatus(initialTodo.status);
    } else {
      setTitle("");
      setDescription("");
      setStatus("TODO");
    }
  }, [initialTodo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, status });
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>
            {initialTodo ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Title
            </label>
            <input
              style={{ padding: "8px" }}
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Description
            </label>
            <textarea
              style={{ padding: "8px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              rows={3}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Status
            </label>
            <select
              value={status}
              style={{ padding: "8px" }}
              onChange={(e) => setStatus(e.target.value as TodoStatus)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            >
              <option value='TODO'>To Do</option>
              <option value='IN_PROGRESS'>In Progress</option>
              <option value='DONE'>Done</option>
            </select>
          </div>
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
            >
              {initialTodo ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
