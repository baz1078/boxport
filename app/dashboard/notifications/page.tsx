import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/formatters";
import Link from "next/link";
import { MarkAllReadButton } from "@/components/dashboard/MarkAllReadButton";

export const metadata = { title: "Notifications — BoxPort" };

const typeIcons: Record<string, string> = {
  offer_received: "💰",
  offer_accepted: "✅",
  offer_declined: "❌",
  counter_sent: "🔄",
  counter_received: "🔄",
  payment_received: "💳",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const allNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: [desc(notifications.createdAt)],
  });

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton userId={session.user.id} />}
      </div>

      {allNotifications.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">You&apos;ll be notified of offers, payments, and more</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isRead ? "" : "border-primary/30 bg-primary/5"}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 flex-shrink-0">
                    {typeIcons[notification.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.body}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="text-xs text-primary hover:underline"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
