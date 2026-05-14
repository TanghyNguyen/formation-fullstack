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
    <main className="max-w-2xl mx-auto min-h-screen py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Todo App
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {remainingCount} tâche(s) restante(s)
      </p>
      <form className="flex gap-2 mb-6" onSubmit={handleSubmit}>
        <input
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors duration-150"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer"
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
        <p className="text-gray-400 dark:text-gray-600 text-sm mt-4">
          Aucune tâche pour le moment
        </p>
      )}
    </main>
  );
}
