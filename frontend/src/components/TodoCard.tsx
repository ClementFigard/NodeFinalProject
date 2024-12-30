import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import { Todo } from "../types/todo";
import { useTodoStore } from "../store/todo-store";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

export function TodoCard({ todo, onEdit }: TodoCardProps) {
  const { deleteTodo } = useTodoStore();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  console.log(todo);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move group'
    >
      <div className='flex justify-between items-start mb-2'>
        <h3 className='font-medium text-gray-900'>{todo.title}</h3>
        <div className='flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            onClick={() => onEdit(todo)}
            className='text-gray-500 hover:text-blue-500'
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => deleteTodo(todo.id)}
            className='text-gray-500 hover:text-red-500'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className='text-sm text-gray-600'>{todo.description}</p>
      <div className='mt-2 text-xs text-gray-400'>
        {new Date(todo.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
