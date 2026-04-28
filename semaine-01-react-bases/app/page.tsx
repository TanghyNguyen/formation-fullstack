import { Card } from "@/components/Card";
import { UserProfile } from "@/components/UserProfile";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Mes composants</h1>
        <Card title="Profil 1">
          <UserProfile
            name="Alice Dupont"
            role="Développeuse Frontend"
            skills={["React", "TypeScript", "Tailwind"]}
            status="online"
          />
        </Card>

        <Card title="Profil 2">
          <UserProfile
            name="Bob Martin"
            role="Backend Engineer"
            skills={["Node.js", "PostgreSQL", "Docker"]}
            status="busy"
          />
        </Card>
      </div>
    </main>
  );
}
