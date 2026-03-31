import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata = { title: "Create Listing" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">List a Container</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details below to create your listing. Photos are required.
        </p>
      </div>
      <ListingForm sellerId={session.user.id} />
    </div>
  );
}
