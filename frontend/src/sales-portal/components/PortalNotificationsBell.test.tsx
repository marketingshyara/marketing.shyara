import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PortalNotificationsBell } from "./PortalNotificationsBell";
import * as hooks from "../hooks/useSalesQueries";

vi.mock("../hooks/useSalesQueries", async (importOriginal) => {
  const actual = await importOriginal<typeof hooks>();
  return {
    ...actual,
    useNotificationsUnreadCountQuery: vi.fn(),
    useNotificationsQuery: vi.fn(),
    useMarkNotificationReadMutation: vi.fn()
  };
});

const repUser = {
  id: "rep-1",
  email: "rep@test.local",
  displayName: "Rep",
  role: "SALES_REP" as const,
  mustChangePassword: false
};

function wrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PortalNotificationsBell", () => {
  it("does not crash when notifications query has no data during refetch", async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.useNotificationsUnreadCountQuery).mockReturnValue({
      data: { total: 1 }
    } as ReturnType<typeof hooks.useNotificationsUnreadCountQuery>);

    vi.mocked(hooks.useNotificationsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: true,
      isError: false
    } as ReturnType<typeof hooks.useNotificationsQuery>);

    vi.mocked(hooks.useMarkNotificationReadMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      variables: undefined
    } as ReturnType<typeof hooks.useMarkNotificationReadMutation>);

    const client = new QueryClient();
    render(<PortalNotificationsBell user={repUser} />, {
      wrapper: wrapper(client)
    });

    await user.click(screen.getByRole("button", { name: /Notifications/i }));

    expect(screen.getByText(/No unread notifications/i)).toBeInTheDocument();
  });
});
