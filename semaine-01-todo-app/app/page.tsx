"use client";
import React, { useState } from "react";
import TodoItem from "@/components/TodoItem";

type Todo = {
  id: string;
  title: string;
  isCompleted: boolean;
};

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
  return (
    <main className="max-w-2xl mx-auto min-h-screen py-10">
      <h1>Todo App</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="border px-2 py-1"
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
    </main>
  );
}
