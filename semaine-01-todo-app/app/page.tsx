"use client";
import React, { useState } from "react";
import TodoItem from "@/components/TodoItem";
import type { Todo } from "@/types";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) {
      return;
    }
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: inputValue.trim(),
      isCompleted: false,
    };
    setTodos((prev) => [...prev, newTodo]);
    setInputValue("");
  }
  function handleToggle(id: string) {
    const newToggle = todos.map((todo) =>
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo,
    );
    setTodos(newToggle);
  }
  function handleDelete(id: string) {
    const newDelete = todos.filter((todo) => todo.id !== id);
    setTodos(newDelete);
  }
  const remainingCount = todos.filter((t) => !t.isCompleted).length;
  return (
    <main className="max-w-2xl mx-auto min-h-screen py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo App</h1>
      <p className="text-sm text-gray-500 mb-4">
        {remainingCount} tâche(s) restante(s)
      </p>
      <form className="flex gap-2 mb-6" onSubmit={handleSubmit}>
        <input
          className="border px-2 py-1 w-full"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded ml-2"
          type="submit"
        >
          Ajouter
        </button>
      </form>
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            title={todo.title}
            isCompleted={todo.isCompleted}
            onToggle={() => handleToggle(todo.id)}
            onDelete={() => handleDelete(todo.id)}
          />
        ))}
      </ul>
      {todos.length === 0 && (
        <p className="text-gray-400 text-sm mt-4">
          Aucune tâche pour le moment
        </p>
      )}
    </main>
  );
}
