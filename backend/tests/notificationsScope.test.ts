import { describe, expect, it } from "vitest";
import { PortalNotificationKind, UserRole } from "@prisma/client";
import { notificationVisibilityWhere } from "../src/services/notifications.js";

describe("notificationVisibilityWhere", () => {
  const rep = { id: "rep-1", role: UserRole.SALES_REP };
  const admin = { id: "admin-1", role: UserRole.ADMIN };

  it("scopes rep inbox to admin decisions on owned leads", () => {
    const where = notificationVisibilityWhere(rep);
    expect(where.userId).toBe("rep-1");
    expect(where.kind).toEqual({
      in: [PortalNotificationKind.ADMIN_VERIFIED, PortalNotificationKind.ADMIN_DECLINED]
    });
    expect(where.lead).toEqual({
      OR: [{ assignedToUserId: "rep-1" }, { createdByUserId: "rep-1" }]
    });
  });

  it("scopes admin inbox to rep submissions only", () => {
    const where = notificationVisibilityWhere(admin);
    expect(where.userId).toBe("admin-1");
    expect(where.kind).toBe(PortalNotificationKind.REP_SUBMITTED);
    expect(where.lead).toBeUndefined();
  });

  it("applies unreadOnly when requested", () => {
    const where = notificationVisibilityWhere(rep, { unreadOnly: true });
    expect(where.readAt).toBeNull();
  });
});
