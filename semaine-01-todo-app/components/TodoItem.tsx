"use client";
import type { Todo } from "@/types";

type TodoItemProps = Todo & {
  onToggle: () => void;
  onDelete: () => void;
};

export default function TodoItem({
  title,
  isCompleted,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={isCompleted} onChange={onToggle} />
        <span
          className={
            isCompleted
              ? "line-through text-gray-400 dark:text-gray-600"
              : "text-gray-800 dark:text-gray-100"
          }
        >
          {title}
        </span>
      </div>
      <div>
        <button
          className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded cursor-pointer"
          onClick={onDelete}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
