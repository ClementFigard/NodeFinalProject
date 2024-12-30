import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TodoCard } from './TodoCard';
import { Todo, TodoStatus } from '../types/todo';
import { Plus } from 'lucide-react';

interface ColumnProps {
  title: string;
  status: TodoStatus;
  todos: Todo[];
  onAddTodo: (status: TodoStatus) => void;
  onEditTodo: (todo: Todo) => void;
}

export function Column({ title, status, todos, onAddTodo, onEditTodo }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-80 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">{title}</h2>
        <button
          onClick={() => onAddTodo(status)}
          className="p-1 hover:bg-gray-200 rounded-full"
        >
          <Plus size={20} className="text-gray-600" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 space-y-4"
      >
        <SortableContext
          items={todos.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={onEditTodo}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}