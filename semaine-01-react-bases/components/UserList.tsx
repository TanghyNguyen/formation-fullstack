"use client";

import { useState, useEffect } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; message: string };

export function UserList() {
  const [userList, setUserList] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    async function fetchUsers() {
      try {
        const donnees = await fetch(
          "https://jsonplaceholder.typicode.com/users",
          { signal: controller.signal },
        );
        const donnesJson = await donnees.json();
        setUserList({ status: "success", data: donnesJson });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setUserList({
          status: "error",
          message: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }
    fetchUsers();
    return () => controller.abort();
  }, []);

  if (userList.status === "loading") {
    return <p>Chargement...</p>;
  }

  if (userList.status === "error") {
    return <p>{userList.message}</p>;
  }
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold md:text-2xl">Utilisateurs (API)</h2>
      <ul className="space-y-3">
        {userList.data.map((user) => (
          <li
            key={user.id}
            className="border rounded p-3 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-gray-500">{user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
