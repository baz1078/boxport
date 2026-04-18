import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, userProfiles } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  const allUsers = await db.query.users.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)],
  });

  const allProfiles = await db.query.userProfiles.findMany();
  const profileMap = Object.fromEntries(allProfiles.map((p) => [p.id, p]));

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    seller: "bg-blue-100 text-blue-800",
    buyer: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{allUsers.length} registered accounts</p>
      </div>

      <Card>
        <div className="divide-y">
          {allUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No users yet.</p>
          ) : (
            allUsers.map((user) => {
              const profile = profileMap[user.id];
              return (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{user.name || "No name"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                    {profile?.businessName && (
                      <p className="text-xs text-muted-foreground">{profile.businessName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {profile?.city && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {profile.city}, {profile.state}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[profile?.role ?? "buyer"] ?? "bg-gray-100"}`}>
                      {profile?.role ?? "buyer"}
                    </span>
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {profile?.listingsCount ?? 0} listing{profile?.listingsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
