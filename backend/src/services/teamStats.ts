import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  ProspectCategory,
  type PrismaClient
} from "@prisma/client";

export type RepDashboardStats = {
  totalLeads: number;
  notInterestedLeads: number;
  activeClients: number;
  ongoingProjects: number;
  completedProjects: number;
  pendingPayments: number;
  needsAdminAction: number;
};

export async function getRepDashboardStats(
  prisma: PrismaClient,
  repUserId: string
): Promise<RepDashboardStats> {
  const assigned = { assignedToUserId: repUserId };

  const [
    totalLeads,
    notInterestedLeads,
    activeClients,
    ongoingProjects,
    completedProjects,
    pendingPayments,
    needsAdminAction
  ] = await Promise.all([
      prisma.lead.count({
        where: {
          ...assigned,
          convertedAt: null,
          prospectCategory: { not: ProspectCategory.NOT_INTERESTED }
        }
      }),
      prisma.lead.count({
        where: {
          ...assigned,
          convertedAt: null,
          prospectCategory: ProspectCategory.NOT_INTERESTED
        }
      }),
      prisma.lead.count({
        where: {
          ...assigned,
          convertedAt: { not: null },
          status: { not: LeadStatus.COMMISSION_PAID }
        }
      }),
      prisma.lead.count({
        where: {
          ...assigned,
          convertedAt: { not: null },
          status: { not: LeadStatus.COMMISSION_PAID },
          project: { is: { deploymentVerifiedAt: null } }
        }
      }),
      prisma.lead.count({
        where: {
          ...assigned,
          convertedAt: { not: null },
          status: LeadStatus.COMMISSION_PAID
        }
      }),
      prisma.leadPayment.count({
        where: {
          verificationStatus: PaymentVerificationStatus.PENDING,
          lead: assigned
        }
      }),
      prisma.lead.count({
        where: {
          ...assigned,
          status: { not: LeadStatus.COMMISSION_PAID },
          OR: [
            {
              payments: {
                some: { verificationStatus: PaymentVerificationStatus.PENDING }
              }
            },
            {
              convertedAt: { not: null },
              payments: {
                some: {
                  kind: PaymentKind.ADVANCE,
                  verificationStatus: PaymentVerificationStatus.VERIFIED
                }
              },
              whatsappGroupLink: { not: null },
              whatsappVerifiedAt: null
            },
            {
              accountsReadyAt: { not: null },
              accountsReadyVerifiedAt: null
            },
            {
              project: {
                is: {
                  deploymentSubmittedAt: { not: null },
                  deploymentVerifiedAt: null
                }
              }
            },
            {
              demoFinalizedAt: { not: null },
              demoFinalizedVerifiedAt: null
            },
            {
              convertedAt: { not: null },
              whatsappVerifiedAt: { not: null },
              demoFinalizedVerifiedAt: null,
              project: { is: { previewUrl: null } }
            },
            {
              status: LeadStatus.FINAL_PAID,
              repoTransferVerifiedAt: null,
              payments: {
                some: {
                  kind: PaymentKind.FINAL,
                  verificationStatus: PaymentVerificationStatus.VERIFIED
                }
              }
            },
            {
              project: {
                is: {
                  deploymentVerifiedAt: { not: null },
                  lead: { status: { not: LeadStatus.COMMISSION_PAID } }
                }
              }
            }
          ]
        }
      })
    ]);

  return {
    totalLeads,
    notInterestedLeads,
    activeClients,
    ongoingProjects,
    completedProjects,
    pendingPayments,
    needsAdminAction
  };
}
