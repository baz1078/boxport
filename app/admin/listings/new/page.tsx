import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, userProfiles } from "@/lib/db/schema";
import { AdminListingForm } from "@/components/admin/AdminListingForm";

export const metadata = { title: "Create Listing — Admin" };

export default async function AdminNewListingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  // Get all users who have a profile (registered sellers/buyers)
  const allProfiles = await db.query.userProfiles.findMany({
    orderBy: (p, { asc }) => [asc(p.fullName)],
  });

  const allUsers = await db.query.users.findMany();
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.email]));

  const sellers = allProfiles.map((p) => ({
    id: p.id,
    fullName: p.fullName || "No name",
    businessName: p.businessName,
    email: userMap[p.id] ?? null,
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Listing for Seller</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Post a listing on behalf of any registered seller. It will appear under their account.
        </p>
      </div>
      <AdminListingForm sellers={sellers} />
    </div>
  );
}
