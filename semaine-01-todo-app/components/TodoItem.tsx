"use client";

type TodoItemProps = {
  id: string;
  title: string;
  isCompleted: boolean;
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
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={isCompleted} onChange={onToggle} />
        <span
          className={
            isCompleted ? "line-through text-gray-400" : "text-gray-800"
          }
        >
          {title}
        </span>
      </div>
      <div>
        <button
          className="text-sm text-red-500 hover:text-red-700"
          onClick={onDelete}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
