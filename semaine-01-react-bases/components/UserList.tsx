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
    <ul>
      {userList.data.map((user) => (
        <li key={user.id}>
          Nom : {user.name} - Email: {user.email}
        </li>
      ))}
    </ul>
  );
}
