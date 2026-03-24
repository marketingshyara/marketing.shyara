import { describe, expect, test } from "vitest";
import { buildSeededPortalService } from "../src/testing/buildSeededPortalService";

describe("portal service", () => {
  test("marks reset passwords as requiring a forced password change", async () => {
    const portal = buildSeededPortalService();
    const admin = await portal.findUserByEmail("admin@shyara.local");
    const salesUser = await portal.findUserByEmail("sales@shyara.local");

    await portal.resetUserPassword(admin, salesUser.id, "NewPassword123!");

    const updatedUser = await portal.getUserById(salesUser.id);

    expect(updatedUser?.mustChangePassword).toBe(true);
  });

  test("rejects updating a user to an email that already exists", async () => {
    const portal = buildSeededPortalService();
    const admin = await portal.findUserByEmail("admin@shyara.local");
    const salesUser = await portal.findUserByEmail("sales@shyara.local");

    await expect(() =>
      portal.updateUser(admin, salesUser.id, {
        email: "ops@shyara.local"
      })
    ).rejects.toThrowError("A user with this email already exists.");
  });

  test("rejects login for suspended users", async () => {
    const portal = buildSeededPortalService();

    const result = await portal.authenticate("suspended@shyara.local", "password123");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("This account is suspended. Contact an administrator.");
  });

  test("creates duplicate flags when a lead matches phone, email, or business-city", async () => {
    const portal = buildSeededPortalService();
    const salesUser = await portal.findUserByEmail("sales@shyara.local");

    const duplicateResult = await portal.createLead(salesUser.id, {
      businessName: "Aster Dental",
      contactPersonName: "Riya Sharma",
      phoneNumber: "9000000001",
      whatsappNumber: "9000000001",
      email: "owner@asterdental.com",
      businessCategory: "Dental Clinic",
      city: "Kolkata",
      locality: "Salt Lake",
      source: "Referral",
      packageInterest: "Website Development",
      firstContactDate: "2026-03-24",
      description: "Existing clinic with duplicate markers."
    });

    expect(duplicateResult.duplicateFlags).toHaveLength(3);
    expect(duplicateResult.lead.status).toBe("new");
    expect(duplicateResult.activity.action).toBe("lead_created");
  });

  test("does not allow closing the same lead twice", async () => {
    const portal = buildSeededPortalService();
    const admin = await portal.findUserByEmail("admin@shyara.local");
    const lead = (await portal.listLeadsForUser(admin)).find((item) => item.status !== "closed_won");

    if (!lead) {
      throw new Error("expected an open seeded lead");
    }

    await portal.closeLead(admin, lead.id, {
      packageName: "Growth Website",
      closedValue: 45000,
      commissionAmount: 4500,
      remarks: "Paid advance and moved to delivery."
    });

    await expect(() =>
      portal.closeLead(admin, lead.id, {
        packageName: "Growth Website",
        closedValue: 45000,
        commissionAmount: 4500
      })
    ).rejects.toThrowError("This lead has already been closed.");
  });

  test("closing a lead creates linked project and commission records", async () => {
    const portal = buildSeededPortalService();
    const admin = await portal.findUserByEmail("admin@shyara.local");
    const operationsUser = await portal.findUserByEmail("ops@shyara.local");
    const lead = (await portal.listLeadsForUser(admin)).find((item) => item.status !== "closed_won");

    if (!lead) {
      throw new Error("expected an open seeded lead");
    }

    const closure = await portal.closeLead(admin, lead.id, {
      packageName: "Growth Website",
      closedValue: 45000,
      commissionAmount: 4500,
      remarks: "Paid advance and moved to delivery.",
      operationsOwnerUserId: operationsUser.id
    });

    expect(closure.lead.status).toBe("closed_won");
    expect(closure.project.leadId).toBe(lead.id);
    expect(closure.project.status).toBe("project_started");
    expect(closure.project.operationsOwnerUserId).toBe(operationsUser.id);
    expect(closure.commission.status).toBe("pending");
    expect((await portal.getProjectByLeadId(lead.id))?.id).toBe(closure.project.id);
  });

  test("rejects assigning a lead to a missing user", async () => {
    const portal = buildSeededPortalService();
    const admin = await portal.findUserByEmail("admin@shyara.local");
    const lead = (await portal.listLeadsForUser(admin))[0];

    if (!lead) {
      throw new Error("expected a lead for reassignment test");
    }

    await expect(portal.assignLead(admin, lead.id, "user-missing")).rejects.toThrowError("Assignee not found.");
  });

  test("rejects creating a revision for a project that does not exist", async () => {
    const portal = buildSeededPortalService();
    const admin = await portal.findUserByEmail("admin@shyara.local");

    await expect(() =>
      portal.addRevision(admin, "project-missing", {
        revisionNotes: "Need to revise hero section",
        requestedDate: "2026-03-24",
        status: "pending"
      })
    ).rejects.toThrowError("Project not found.");
  });

  test("creating and completing a revision keeps project status in sync", async () => {
    const portal = buildSeededPortalService();
    const admin = await portal.findUserByEmail("admin@shyara.local");
    const lead = (await portal.listLeadsForUser(admin)).find((item) => item.status !== "closed_won");

    if (!lead) {
      throw new Error("expected an open seeded lead");
    }

    const closure = await portal.closeLead(admin, lead.id, {
      packageName: "Growth Website",
      closedValue: 45000
    });

    const revision = await portal.addRevision(admin, closure.project.id, {
      revisionNotes: "Need client-requested edits",
      requestedDate: "2026-03-24",
      status: "pending"
    });

    const revisionInProgressProject = await portal.getProjectByLeadId(lead.id);
    expect(revisionInProgressProject?.status).toBe("revision_pending");

    const completedRevision = await portal.updateRevisionStatus(admin, revision.id, "completed");
    const completedProject = await portal.getProjectByLeadId(lead.id);

    expect(completedRevision.completedDate).toBeDefined();
    expect(completedProject?.status).toBe("in_progress");
  });

  test("counts only follow-ups due today in the dashboard summary", async () => {
    const portal = buildSeededPortalService();
    const salesUser = await portal.findUserByEmail("sales@shyara.local");
    const [firstLead, secondLead] = await portal.listLeadsForUser(salesUser);

    if (!firstLead || !secondLead) {
      throw new Error("expected seeded leads for dashboard test");
    }

    await portal.addFollowUp(salesUser, firstLead.id, {
      dateTime: "2026-03-24T10:00:00.000Z",
      followUpType: "call",
      note: "Call back today",
      nextFollowUpDate: "2026-03-24",
      outcome: "follow_up_needed"
    });
    await portal.addFollowUp(salesUser, secondLead.id, {
      dateTime: "2026-03-24T12:00:00.000Z",
      followUpType: "call",
      note: "Call back tomorrow",
      nextFollowUpDate: "2026-03-25",
      outcome: "follow_up_needed"
    });

    const summary = await portal.getDashboardSummary(salesUser);

    expect(summary.followUpsDueToday).toBe(1);
    expect(summary.activeFollowUps).toBe(2);
  });

  test("sales associates only see their own or shared leads", async () => {
    const portal = buildSeededPortalService();
    const salesUser = await portal.findUserByEmail("sales@shyara.local");
    const visibleLeadIds = (await portal.listLeadsForUser(salesUser)).map((lead) => lead.id);

    expect(visibleLeadIds).toContain("lead-seeded-open");
    expect(visibleLeadIds).toContain("lead-seeded-shared");
    expect(visibleLeadIds).not.toContain("lead-ops-hidden");
  });
});
