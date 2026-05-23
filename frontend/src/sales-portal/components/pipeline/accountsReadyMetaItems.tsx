import type { Lead } from "../../types";
import type { PortalMetaItem } from "../ui/PortalMetaGrid";
import { PortalCopyableText } from "../ui/PortalCopyableText";

export function accountsReadyMetaItems(lead: Lead): PortalMetaItem[] {
  const submitted = Boolean(lead.accountsReadyAt);

  const items: PortalMetaItem[] = [
    {
      label: "Rep marked",
      value: lead.accountsReadyAt
        ? new Date(lead.accountsReadyAt).toLocaleString()
        : "Not yet"
    }
  ];

  if (submitted) {
    items.push(
      {
        label: "GitHub username",
        value: (
          <PortalCopyableText
            value={lead.clientGithubId}
            copyLabel="GitHub username"
            variant="plain"
            monospace
          />
        )
      },
      {
        label: "GitHub account email",
        value: (
          <PortalCopyableText
            value={lead.clientGithubEmail}
            copyLabel="GitHub account email"
            variant="plain"
          />
        )
      }
    );
  }

  return items;
}

export function accountsReadyMissingGithubHint(lead: Lead): boolean {
  return (
    Boolean(lead.accountsReadyAt) &&
    !lead.clientGithubId?.trim() &&
    !lead.clientGithubEmail?.trim()
  );
}
