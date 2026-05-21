import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useNotificationsUnreadCountQuery
} from "../hooks/useSalesQueries";
import type { SessionUser } from "../types";
import { defaultPortalHome } from "../lib/portalPaths";

type Props = {
  user: SessionUser;
};

export function PortalNotificationsBell({ user }: Props) {
  const unread = useNotificationsUnreadCountQuery(true);
  const list = useNotificationsQuery({ page: 1, pageSize: 15, unreadOnly: true, enabled: true });
  const markRead = useMarkNotificationReadMutation();
  const isAdmin = user.role === "ADMIN";
  const total = unread.data?.total ?? 0;

  const projectLink = (leadId: string, repId?: string | null) => {
    if (isAdmin && repId) {
      return `/portal/team/${repId}/projects/${leadId}`;
    }
    if (!isAdmin) {
      return `/portal/pipeline/${leadId}`;
    }
    return `/portal/team`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative min-h-11 min-w-11"
          aria-label={`Notifications${total > 0 ? `, ${total} unread` : ""}`}
        >
          <Bell className="h-5 w-5" aria-hidden />
          {total > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center px-1 text-[10px]"
            >
              {total > 99 ? "99+" : total}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[min(24rem,70vh)] overflow-y-auto">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {list.isLoading ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">Loading…</p>
        ) : list.data?.items.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">No unread notifications.</p>
        ) : (
          list.data?.items.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-2">
              <span className="text-sm leading-snug">{n.message}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(n.createdAt).toLocaleString()}
              </span>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  asChild
                  onClick={() => markRead.mutate(n.id)}
                >
                  <Link to={projectLink(n.leadId, isAdmin ? n.repId : user.id)}>Open</Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-1 text-xs"
                  onClick={() => markRead.mutate(n.id)}
                >
                  Mark read
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={defaultPortalHome(user.role)} className="w-full cursor-pointer">
            Go to home
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
