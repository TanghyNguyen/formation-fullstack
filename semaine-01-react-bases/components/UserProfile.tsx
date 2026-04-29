"use client";
import { useState } from "react";
import { Badge } from "@/components/Badge";

export type UserStatus = "online" | "offline" | "busy";

type UserProfileProps = {
  name: string;
  role: string;
  skills: string[];
  status: UserStatus;
};

const statusColor: Record<UserStatus, "green" | "gray" | "red"> = {
  online: "green",
  offline: "gray",
  busy: "red",
};

export function UserProfile({ name, role, skills, status }: UserProfileProps) {
  const [count, setCount] = useState(0);
  const label =
    count === 0 ? "♡ Favori" : `♥ ${count} Favori${count > 1 ? "s" : ""}`;
  const isFavorite = count > 0;
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-600">{role}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} text={skill} color="blue" />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Statut :</span>
        <Badge text={status} color={statusColor[status]} />
      </div>
      <button
        onClick={() => setCount((prev) => prev + 1)}
        className={`px-3 py-1 rounded text-sm font-medium ${isFavorite ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700 "}`}
      >
        {label}
      </button>
    </div>
  );
}
