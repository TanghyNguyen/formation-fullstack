"use client";
import { useState } from "react";
import { Card } from "@/components/Card";
import { UserProfile, UserStatus } from "@/components/UserProfile";
import { UserList } from "@/components/UserList";

type Profile = {
  name: string;
  role: string;
  skills: string[];
  status: UserStatus;
};

export default function Home() {
  const profiles: Profile[] = [
    {
      name: "Joey Conrad",
      role: "Développeur Frontend",
      skills: ["React", "TypeScript"],
      status: "online",
    },
    {
      name: "Joe Rotten",
      role: "Admin SQL",
      skills: ["Sql", "Php"],
      status: "offline",
    },
    {
      name: "Lydia Sheeban",
      role: "Développeuse Backend",
      skills: ["Node", "Sql"],
      status: "busy",
    },
    {
      name: "Alice Dupont",
      role: "Développeuse Frontend",
      skills: ["React", "TypeScript", "Tailwind"],
      status: "online",
    },
    {
      name: "Bob Martin",
      role: "Backend Engineer",
      skills: ["Node.js", "PostgreSQL", "Docker"],
      status: "busy",
    },
  ];
  const [currentStatus, setCurrentStatus] = useState<UserStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProfiles = profiles.filter((profile) => {
    const nameMatches = profile.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const statusMatches =
      currentStatus === "all" || profile.status === currentStatus;
    return nameMatches && statusMatches;
  });

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl font-bold md:text-3xl">Mes composants</h1>
        <UserList />
        <input
          type="text"
          placeholder="Rechercher un profil..."
          value={searchQuery}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(event.target.value)
          }
          className="border rounded px-3 py-2 w-full"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentStatus("all")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              currentStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setCurrentStatus("online")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              currentStatus === "online"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            En ligne
          </button>
          <button
            onClick={() => setCurrentStatus("offline")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              currentStatus === "offline"
                ? "bg-gray-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Hors ligne
          </button>
          <button
            onClick={() => setCurrentStatus("busy")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              currentStatus === "busy"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Occupé(e)
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredProfiles.map((profile) => (
            <Card key={profile.name} title={profile.name}>
              <UserProfile
                name={profile.name}
                role={profile.role}
                skills={profile.skills}
                status={profile.status}
              />
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
