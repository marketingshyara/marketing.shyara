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
    if (settings.data) setSettingsDraft(settings.data);
  }, [settings.data]);

  useEffect(() => {
    if (support.data) setSupportDraft(support.data);
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
    if (!settingsDraft) return;
    setSettingsDraft({
      ...settingsDraft,
      notifications: {
        ...settingsDraft.notifications,
        [event.target.name]: event.target.checked
      }
    });
  };

  if (!settingsDraft || !supportDraft) {
    return <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Portal Settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Lead statuses</span>
            <input
              value={settingsDraft.leadStatuses.join(", ")}
              onChange={(event) => setSettingsDraft((current) => current ? { ...current, leadStatuses: splitStatuses(event.target.value) } : current)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Commission statuses</span>
            <input
              value={settingsDraft.commissionStatuses.join(", ")}
              onChange={(event) => setSettingsDraft((current) => current ? { ...current, commissionStatuses: splitStatuses(event.target.value) } : current)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Project statuses</span>
            <input
              value={settingsDraft.projectStatuses.join(", ")}
              onChange={(event) => setSettingsDraft((current) => current ? { ...current, projectStatuses: splitStatuses(event.target.value) } : current)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Revision statuses</span>
            <input
              value={settingsDraft.revisionStatuses.join(", ")}
              onChange={(event) => setSettingsDraft((current) => current ? { ...current, revisionStatuses: splitStatuses(event.target.value) } : current)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Inactivity reminder days</span>
            <input
              type="number"
              value={settingsDraft.inactivityReminderDays}
              onChange={(event) =>
                setSettingsDraft((current) => current ? { ...current, inactivityReminderDays: Number(event.target.value) } : current)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <span>In-app notifications</span>
            <input
              name="inAppEnabled"
              type="checkbox"
              checked={settingsDraft.notifications.inAppEnabled}
              onChange={handleNotificationToggle}
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => saveSettings.mutate(settingsDraft)}
            className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950"
          >
            Save portal settings
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Service Packages</h2>
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
            className="rounded-full border border-white/10 px-4 py-2 text-sm"
          >
            Add package
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {supportDraft.servicePackages.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="grid gap-3 md:grid-cols-2">
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
                  placeholder="Package name"
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                />
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
                  placeholder="Pricing"
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                />
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
                  placeholder="Short pitch"
                  className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 md:col-span-2"
                />
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
                  placeholder="Inclusions"
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                />
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
                  placeholder="Exclusions"
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {(["salesInstructions", "objectionGuides", "closingGuides"] as const).map((sectionKey) => (
        <section key={sectionKey} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{sectionKey}</h2>
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
              className="rounded-full border border-white/10 px-4 py-2 text-sm"
            >
              Add item
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {supportDraft[sectionKey].map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
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
                  placeholder="Title"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                />
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
                  className="mt-3 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button type="button" onClick={() => saveSupport.mutate(supportDraft)} className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">
          Save support content
        </button>
      </div>
    </div>
  );
}
