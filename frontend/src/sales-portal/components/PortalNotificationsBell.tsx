import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { stageShortTitle } from "../lib/pipelineCopy";
import type { PipelineStageKey } from "../types";
import { cn } from "@/lib/utils";

type Props = {
  user: SessionUser;
};

export function PortalNotificationsBell({ user }: Props) {
  const [open, setOpen] = useState(false);
  const unread = useNotificationsUnreadCountQuery(user.id, true);
  const list = useNotificationsQuery(user.id, {
    page: 1,
    pageSize: 15,
    unreadOnly: true,
    enabled: open
  });
  const markRead = useMarkNotificationReadMutation(user.id);
  const isAdmin = user.role === "ADMIN";
  const total = unread.data?.total ?? 0;
  const markingId = markRead.isPending ? markRead.variables : undefined;
  const items = list.data?.items ?? [];

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative min-h-11 min-w-11 touch-manipulation border-2 border-[#0A0A0A]"
          aria-label={`Notifications${total > 0 ? `, ${total} unread` : ""}`}
          aria-expanded={open}
          aria-haspopup="dialog"
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
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="flex w-[min(calc(100vw-1.5rem),20rem)] max-h-[min(24rem,70dvh)] flex-col overflow-hidden p-0 touch-manipulation sm:w-80"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5">
          <p className="text-sm font-semibold leading-snug">Notifications</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 shrink-0"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          role="list"
          aria-label="Unread notifications"
          aria-busy={list.isFetching}
        >
          {list.isError ? (
            <p className="px-3 py-4 text-sm text-destructive">Could not load notifications.</p>
          ) : list.isLoading && items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No unread notifications.</p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n.id} role="listitem" className="px-3 py-3">
                  <p className="break-words text-sm leading-snug">{n.message}</p>
                  {n.stageKey ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Step: {stageShortTitle(n.stageKey as PipelineStageKey)}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1 sm:flex-none"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link to={projectLink(n.leadId, isAdmin ? n.repId : user.id)}>Open</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className={cn("min-h-11 flex-1 sm:flex-none")}
                      disabled={markingId === n.id}
                      aria-busy={markingId === n.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markRead.mutate(n.id);
                      }}
                    >
                      {markingId === n.id ? "Marking…" : "Mark read"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem asChild className="min-h-11 rounded-none">
          <Link
            to={defaultPortalHome(user.role)}
            className="w-full cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Go to home
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
