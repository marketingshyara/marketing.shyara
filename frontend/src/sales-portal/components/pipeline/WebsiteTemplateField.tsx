import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatTemplateOption } from "../../lib/templateLabel";
import {
  templateCategoryLabel,
  templatePosterUrl,
  templateSamplePreviewUrl
} from "../../lib/templateSampleUrl";
import type { WebsiteTemplate } from "../../types";

export type WebsiteTemplateFieldMode = "picker" | "selected" | "readonly";

type Props = {
  templates: WebsiteTemplate[];
  value: string;
  onChange?: (templateId: string) => void;
  mode?: WebsiteTemplateFieldMode;
  disabled?: boolean;
  lockedReason?: string | null;
  catalogUrl?: string | null;
  label?: string;
  id?: string;
};

export function WebsiteTemplateField({
  templates,
  value,
  onChange,
  mode = "picker",
  disabled = false,
  lockedReason = null,
  catalogUrl = null,
  label = "Website template",
  id = "website-template"
}: Props) {
  const selected = templates.find((t) => t.id === value) ?? null;
  const previewUrl = templateSamplePreviewUrl(selected);
  const posterUrl = templatePosterUrl(selected);
  const showCatalog =
    catalogUrl &&
    (mode === "picker" || (mode === "selected" && !value));

  const readOnly = mode === "readonly" || disabled;

  return (
    <div className="space-y-3">
      <Label htmlFor={readOnly ? undefined : `${id}-select`}>{label}</Label>

      {selected && (mode === "selected" || mode === "readonly") ? (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt=""
              className="w-full h-32 sm:h-36 object-cover object-top border-b border-border"
            />
          ) : null}
          <div className="p-4 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-primary font-medium">
                  {selected.displayCode}
                </p>
                <p className="font-semibold break-words">{selected.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {templateCategoryLabel(selected.categoryId)}
                </p>
              </div>
              {previewUrl ? (
                <Button variant="outline" size="sm" className="min-h-9 shrink-0 focus-ring" asChild>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    Open sample
                    <ExternalLink className="size-3.5 ml-1.5" aria-hidden />
                  </a>
                </Button>
              ) : null}
            </div>
            {lockedReason ? (
              <p className="text-xs text-muted-foreground">{lockedReason}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!readOnly && onChange ? (
        <Select
          value={value || "__none__"}
          onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
          disabled={disabled}
        >
          <SelectTrigger id={`${id}-select`} className="min-h-11 focus-ring">
            <SelectValue placeholder="Choose template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {formatTemplateOption(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {showCatalog ? (
        <p className="text-xs text-muted-foreground">
          <a
            href={catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground focus-ring rounded-sm"
          >
            Browse all samples
          </a>
          {mode === "selected" && value ? " (optional)" : null}
        </p>
      ) : null}
    </div>
  );
}
