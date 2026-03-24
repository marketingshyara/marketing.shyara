import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading,
} from "@/components/portal/portal-ui";
import {
  formatPortalLabel,
  portalButtonPrimaryClass,
  portalButtonSecondaryClass,
  portalInputClass,
  portalTextareaClass
} from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import type { PortalSettingsResponse, SupportContent } from "@/types/portal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";

function splitStatuses(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function PortalSettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["portal-settings"], queryFn: portalApi.settings });
  const support = useQuery({ queryKey: ["portal-support"], queryFn: portalApi.supportContent });
  const [settingsDraft, setSettingsDraft] = useState<PortalSettingsResponse | null>(null);
  const [supportDraft, setSupportDraft] = useState<SupportContent | null>(null);

  useEffect(() => {
    if (settings.data) {
      setSettingsDraft(settings.data);
    }
  }, [settings.data]);

  useEffect(() => {
    if (support.data) {
      setSupportDraft(support.data);
    }
  }, [support.data]);

  const saveSettings = useMutation({
    mutationFn: portalApi.updateSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-settings"] });
    }
  });

  const saveSupport = useMutation({
    mutationFn: portalApi.updateSupportContent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-support"] });
    }
  });

  const handleNotificationToggle = (event: ChangeEvent<HTMLInputElement>) => {
    if (!settingsDraft) {
      return;
    }

    setSettingsDraft({
      ...settingsDraft,
      notifications: {
        ...settingsDraft.notifications,
        [event.target.name]: event.target.checked
      }
    });
  };

  if (!settingsDraft || !supportDraft) {
    return <PortalPanel>Loading settings...</PortalPanel>;
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Admin Settings"
        title="Control portal rules and support content from one standardized workspace"
        description="Portal configuration now follows the same card system and readable form styling as the main website."
      />

      <PortalPanel>
        <PortalSectionHeading
          title="Portal Settings"
          description="Define statuses, reminder thresholds, and notification behavior."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Lead statuses
            </span>
            <input
              value={settingsDraft.leadStatuses.join(", ")}
              onChange={(event) =>
                setSettingsDraft((current) =>
                  current ? { ...current, leadStatuses: splitStatuses(event.target.value) } : current
                )
              }
              className={portalInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Commission statuses
            </span>
            <input
              value={settingsDraft.commissionStatuses.join(", ")}
              onChange={(event) =>
                setSettingsDraft((current) =>
                  current ? { ...current, commissionStatuses: splitStatuses(event.target.value) } : current
                )
              }
              className={portalInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Project statuses
            </span>
            <input
              value={settingsDraft.projectStatuses.join(", ")}
              onChange={(event) =>
                setSettingsDraft((current) =>
                  current ? { ...current, projectStatuses: splitStatuses(event.target.value) } : current
                )
              }
              className={portalInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Revision statuses
            </span>
            <input
              value={settingsDraft.revisionStatuses.join(", ")}
              onChange={(event) =>
                setSettingsDraft((current) =>
                  current ? { ...current, revisionStatuses: splitStatuses(event.target.value) } : current
                )
              }
              className={portalInputClass}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Inactivity reminder days
            </span>
            <input
              type="number"
              value={settingsDraft.inactivityReminderDays}
              onChange={(event) =>
                setSettingsDraft((current) =>
                  current ? { ...current, inactivityReminderDays: Number(event.target.value) } : current
                )
              }
              className={portalInputClass}
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-card border border-border bg-[hsl(var(--surface))] px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">In-app notifications</p>
              <p className="mt-1 text-caption text-muted-foreground">Toggle bell notifications inside the portal.</p>
            </div>
            <input
              name="inAppEnabled"
              type="checkbox"
              checked={settingsDraft.notifications.inAppEnabled}
              onChange={handleNotificationToggle}
              className="h-4 w-4 accent-[hsl(var(--accent))]"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => saveSettings.mutate(settingsDraft)} className={portalButtonPrimaryClass}>
            Save portal settings
          </button>
        </div>
      </PortalPanel>

      <PortalPanel className="bg-[hsl(var(--surface))]">
        <PortalSectionHeading
          title="Service Packages"
          description="Keep package positioning, inclusions, exclusions, and pricing current for the sales team."
          action={
            <button
              type="button"
              onClick={() =>
                setSupportDraft((current) =>
                  current
                    ? {
                        ...current,
                        servicePackages: [
                          ...current.servicePackages,
                          {
                            id: crypto.randomUUID(),
                            packageName: "",
                            shortPitch: "",
                            inclusions: [],
                            exclusions: []
                          }
                        ]
                      }
                    : current
                )
              }
              className={portalButtonSecondaryClass}
            >
              Add package
            </button>
          }
        />
        <div className="portal-card-list mt-5">
          {supportDraft.servicePackages.map((item) => (
            <div key={item.id} className="portal-list-card">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Package name
                  </span>
                  <input
                    value={item.packageName}
                    onChange={(event) =>
                      setSupportDraft((current) =>
                        current
                          ? {
                              ...current,
                              servicePackages: current.servicePackages.map((entry) =>
                                entry.id === item.id ? { ...entry, packageName: event.target.value } : entry
                              )
                            }
                          : current
                      )
                    }
                    className={portalInputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Pricing
                  </span>
                  <input
                    type="number"
                    value={item.pricing ?? ""}
                    onChange={(event) =>
                      setSupportDraft((current) =>
                        current
                          ? {
                              ...current,
                              servicePackages: current.servicePackages.map((entry) =>
                                entry.id === item.id ? { ...entry, pricing: Number(event.target.value) || undefined } : entry
                              )
                            }
                          : current
                      )
                    }
                    className={portalInputClass}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Short pitch
                  </span>
                  <textarea
                    value={item.shortPitch}
                    onChange={(event) =>
                      setSupportDraft((current) =>
                        current
                          ? {
                              ...current,
                              servicePackages: current.servicePackages.map((entry) =>
                                entry.id === item.id ? { ...entry, shortPitch: event.target.value } : entry
                              )
                            }
                          : current
                      )
                    }
                    className={portalTextareaClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Inclusions
                  </span>
                  <input
                    value={item.inclusions.join(", ")}
                    onChange={(event) =>
                      setSupportDraft((current) =>
                        current
                          ? {
                              ...current,
                              servicePackages: current.servicePackages.map((entry) =>
                                entry.id === item.id ? { ...entry, inclusions: splitStatuses(event.target.value) } : entry
                              )
                            }
                          : current
                      )
                    }
                    className={portalInputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Exclusions
                  </span>
                  <input
                    value={item.exclusions.join(", ")}
                    onChange={(event) =>
                      setSupportDraft((current) =>
                        current
                          ? {
                              ...current,
                              servicePackages: current.servicePackages.map((entry) =>
                                entry.id === item.id ? { ...entry, exclusions: splitStatuses(event.target.value) } : entry
                              )
                            }
                          : current
                      )
                    }
                    className={portalInputClass}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </PortalPanel>

      {(["salesInstructions", "objectionGuides", "closingGuides"] as const).map((sectionKey) => (
        <PortalPanel key={sectionKey}>
          <PortalSectionHeading
            title={formatPortalLabel(sectionKey)}
            description="Reference content used by sales and admin teams inside the portal."
            action={
              <button
                type="button"
                onClick={() =>
                  setSupportDraft((current) =>
                    current
                      ? {
                          ...current,
                          [sectionKey]: [
                            ...current[sectionKey],
                            sectionKey === "objectionGuides"
                              ? { id: crypto.randomUUID(), title: "", response: "" }
                              : { id: crypto.randomUUID(), title: "", content: "" }
                          ]
                        }
                      : current
                  )
                }
                className={portalButtonSecondaryClass}
              >
                Add item
              </button>
            }
          />
          <div className="portal-card-list mt-5">
            {supportDraft[sectionKey].map((item) => (
              <div key={item.id} className="portal-list-card">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Title
                  </span>
                  <input
                    value={item.title}
                    onChange={(event) =>
                      setSupportDraft((current) =>
                        current
                          ? {
                              ...current,
                              [sectionKey]: current[sectionKey].map((entry) =>
                                entry.id === item.id ? { ...entry, title: event.target.value } : entry
                              ) as SupportContent[typeof sectionKey]
                            }
                          : current
                      )
                    }
                    className={portalInputClass}
                  />
                </label>
                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Content
                  </span>
                  <textarea
                    value={"response" in item ? item.response : item.content}
                    onChange={(event) =>
                      setSupportDraft((current) =>
                        current
                          ? {
                              ...current,
                              [sectionKey]: current[sectionKey].map((entry) =>
                                entry.id === item.id
                                  ? "response" in entry
                                    ? { ...entry, response: event.target.value }
                                    : { ...entry, content: event.target.value }
                                  : entry
                              ) as SupportContent[typeof sectionKey]
                            }
                          : current
                      )
                    }
                    className={portalTextareaClass}
                  />
                </label>
              </div>
            ))}
          </div>
        </PortalPanel>
      ))}

      <div className="flex justify-end">
        <button type="button" onClick={() => saveSupport.mutate(supportDraft)} className={portalButtonPrimaryClass}>
          Save support content
        </button>
      </div>
    </div>
  );
}
