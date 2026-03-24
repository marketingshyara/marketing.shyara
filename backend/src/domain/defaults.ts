import bcrypt from "bcryptjs";
import type { PortalSettings, PortalState } from "./types";

export const defaultSettings: PortalSettings = {
  leadStatuses: [
    "new",
    "contacted",
    "under_follow_up",
    "interested",
    "not_interested",
    "callback_later",
    "payment_pending",
    "closed_won",
    "lost",
    "dormant"
  ],
  commissionStatuses: ["pending", "under_review", "approved", "paid", "rejected", "on_hold"],
  projectStatuses: [
    "project_started",
    "content_pending",
    "in_progress",
    "preview_shared",
    "revision_pending",
    "revision_in_progress",
    "final_delivery_done",
    "closed"
  ],
  revisionStatuses: ["pending", "in_progress", "completed", "on_hold"],
  inactivityReminderDays: 14,
  notifications: {
    inAppEnabled: true,
    emailEnabled: false
  }
};

interface SeedOptions {
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

export function createDefaultState(options: SeedOptions = {}): PortalState {
  const now = new Date("2026-03-24T09:00:00.000Z").toISOString();
  const adminPasswordHash = bcrypt.hashSync(options.adminPassword ?? "password123", 10);
  const sharedPasswordHash = bcrypt.hashSync("password123", 10);

  return {
    meta: { nextId: 100, version: 1 },
    users: [
      {
        id: "user-admin",
        name: options.adminName ?? "Portal Admin",
        email: options.adminEmail ?? "admin@shyara.local",
        role: "admin",
        status: "active",
        passwordHash: adminPasswordHash,
        mustChangePassword: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "user-sales",
        name: "Ananya Sales",
        email: "sales@shyara.local",
        phone: "9000000010",
        role: "sales_associate",
        status: "active",
        passwordHash: sharedPasswordHash,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "user-ops",
        name: "Rohan Ops",
        email: "ops@shyara.local",
        phone: "9000000020",
        role: "operations",
        status: "active",
        passwordHash: sharedPasswordHash,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "user-suspended",
        name: "Suspended Sales",
        email: "suspended@shyara.local",
        role: "sales_associate",
        status: "suspended",
        passwordHash: sharedPasswordHash,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now
      }
    ],
    leads: [
      {
        id: "lead-seeded-open",
        businessName: "Shine Dental Care",
        contactPersonName: "Dr. Meera Sen",
        phoneNumber: "9000000091",
        whatsappNumber: "9000000091",
        email: "hello@shinedental.com",
        businessCategory: "Dental Clinic",
        city: "Kolkata",
        locality: "Park Street",
        source: "Website Referral",
        packageInterest: "Growth Website",
        firstContactDate: "2026-03-20",
        description: "Wants website redesign and local SEO support.",
        status: "interested",
        assignedSalesPersonId: "user-sales",
        createdByUserId: "user-sales",
        sharedWithUserIds: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "lead-seeded-shared",
        businessName: "North Star Cafe",
        contactPersonName: "Kabir Das",
        phoneNumber: "9000000092",
        whatsappNumber: "9000000092",
        email: "owner@northstarcafe.com",
        businessCategory: "Cafe",
        city: "Kolkata",
        locality: "New Town",
        source: "Walk-in",
        packageInterest: "Social Media Management",
        firstContactDate: "2026-03-18",
        description: "Needs content pipeline and ad support.",
        status: "under_follow_up",
        assignedSalesPersonId: "user-admin",
        createdByUserId: "user-admin",
        sharedWithUserIds: ["user-sales"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "lead-ops-hidden",
        businessName: "Velocity Motors",
        contactPersonName: "Ankit Roy",
        phoneNumber: "9000000093",
        whatsappNumber: "9000000093",
        email: "owner@velocitymotors.com",
        businessCategory: "Automobile",
        city: "Howrah",
        locality: "Andul",
        source: "Cold Outreach",
        packageInterest: "App Development",
        firstContactDate: "2026-03-17",
        description: "Owned by admin only; should not be visible to sales associate.",
        status: "payment_pending",
        assignedSalesPersonId: "user-admin",
        createdByUserId: "user-admin",
        sharedWithUserIds: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "lead-seeded-duplicate-target",
        businessName: "Aster Dental",
        contactPersonName: "Dr. Arjun Bose",
        phoneNumber: "9000000001",
        whatsappNumber: "9000000001",
        email: "owner@asterdental.com",
        businessCategory: "Dental Clinic",
        city: "Kolkata",
        locality: "Salt Lake",
        source: "Referral",
        packageInterest: "Website Development",
        firstContactDate: "2026-03-10",
        description: "Used to test duplicate detection.",
        status: "contacted",
        assignedSalesPersonId: "user-sales",
        createdByUserId: "user-sales",
        sharedWithUserIds: [],
        createdAt: now,
        updatedAt: now
      }
    ],
    leadNotes: [],
    followUps: [],
    leadActivities: [],
    duplicateFlags: [],
    ownershipHistory: [],
    servicePackages: [
      {
        id: "package-growth-website",
        packageName: "Growth Website",
        shortPitch: "High-conversion business website with clear CTAs.",
        inclusions: ["Custom landing pages", "Mobile responsive", "Contact capture setup"],
        exclusions: ["Ad spend", "Third-party licenses"],
        pricing: 45000
      }
    ],
    salesInstructions: [
      {
        id: "instruction-intro",
        title: "First Discovery Call",
        content: "Focus on business goal, current funnel, and urgency before pitching packages."
      }
    ],
    objectionGuides: [
      {
        id: "objection-budget",
        title: "Budget Concern",
        response: "Acknowledge budget first, then propose a smaller entry package with milestone-based upsell."
      }
    ],
    closingGuides: [
      {
        id: "closing-payment",
        title: "Payment Stage",
        content: "Confirm package, timeline, and handoff owner before marking payment pending."
      }
    ],
    closures: [],
    commissionRules: [
      {
        id: "commission-rule-growth",
        name: "Default Growth Website Rule",
        packageName: "Growth Website",
        amount: 4500
      }
    ],
    commissions: [],
    commissionLogs: [],
    projects: [],
    revisions: [],
    notifications: [],
    auditEvents: [],
    settings: defaultSettings
  };
}

export function createProductionBootstrapState(options: SeedOptions = {}): PortalState {
  const now = new Date().toISOString();
  const adminPasswordHash = bcrypt.hashSync(options.adminPassword ?? "change-me", 10);

  return {
    meta: { nextId: 1, version: 1 },
    users: [
      {
        id: "user-admin",
        name: options.adminName ?? "Portal Admin",
        email: options.adminEmail ?? "admin@example.com",
        role: "admin",
        status: "active",
        passwordHash: adminPasswordHash,
        mustChangePassword: true,
        passwordResetAt: now,
        createdAt: now,
        updatedAt: now
      }
    ],
    leads: [],
    leadNotes: [],
    followUps: [],
    leadActivities: [],
    duplicateFlags: [],
    ownershipHistory: [],
    servicePackages: [
      {
        id: "package-growth-website",
        packageName: "Growth Website",
        shortPitch: "High-conversion business website with clear CTAs.",
        inclusions: ["Custom landing pages", "Mobile responsive", "Contact capture setup"],
        exclusions: ["Ad spend", "Third-party licenses"],
        pricing: 45000
      }
    ],
    salesInstructions: [
      {
        id: "instruction-intro",
        title: "First Discovery Call",
        content: "Focus on business goal, current funnel, and urgency before pitching packages."
      }
    ],
    objectionGuides: [
      {
        id: "objection-budget",
        title: "Budget Concern",
        response: "Acknowledge budget first, then propose a smaller entry package with milestone-based upsell."
      }
    ],
    closingGuides: [
      {
        id: "closing-payment",
        title: "Payment Stage",
        content: "Confirm package, timeline, and handoff owner before marking payment pending."
      }
    ],
    closures: [],
    commissionRules: [
      {
        id: "commission-rule-growth",
        name: "Default Growth Website Rule",
        packageName: "Growth Website",
        amount: 4500
      }
    ],
    commissions: [],
    commissionLogs: [],
    projects: [],
    revisions: [],
    notifications: [],
    auditEvents: [],
    settings: defaultSettings
  };
}
