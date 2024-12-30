import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "./components/Column";
import { TodoModal } from "./components/TodoModal";
import { useTodoStore } from "./store/todo-store";
import { Todo, TodoStatus } from "./types/todo";
import { Layout } from "lucide-react";

function App() {
  const { todos, fetchTodos, addTodo, updateTodo } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus>("TODO");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const todoId = active.id as string;
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    const newStatus = over.id as TodoStatus;
    if (todo.status !== newStatus) {
      updateTodo(todoId, { ...todo, status: newStatus });
    }
  };

  const handleAddTodo = (status: TodoStatus) => {
    setSelectedStatus(status);
    setEditingTodo(undefined);
    setIsModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleSubmitTodo = (
    todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, todo);
    } else {
      addTodo({ ...todo, status: selectedStatus });
    }
  };

  const todosByStatus = {
    TODO: todos.filter((t) => t.status === "TODO"),
    IN_PROGRESS: todos.filter((t) => t.status === "IN_PROGRESS"),
    DONE: todos.filter((t) => t.status === "DONE"),
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center space-x-3'>
            <Layout className='h-6 w-6 text-blue-600' />
            <h1 className='text-xl font-semibold text-gray-900'>Todo Board</h1>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8'>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className='flex space-x-6'>
            <Column
              title='To Do'
              status='TODO'
              todos={todosByStatus.TODO}
              onAddTodo={handleAddTodo}
              onEditTodo={handleEditTodo}
            />
            <Column
              title='In Progress'
              status='IN_PROGRESS'
              todos={todosByStatus.IN_PROGRESS}
              onAddTodo={handleAddTodo}
              onEditTodo={handleEditTodo}
            />
            <Column
              title='Done'
              status='DONE'
              todos={todosByStatus.DONE}
              onAddTodo={handleAddTodo}
              onEditTodo={handleEditTodo}
            />
          </div>
        </DndContext>
      </main>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTodo}
        initialTodo={editingTodo}
      />
    </div>
  );
}

export default App;
