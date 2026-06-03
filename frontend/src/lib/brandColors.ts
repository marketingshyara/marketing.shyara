/** Shyara marketing chroma — semantic tones for local-business trust UX */
export const brandTones = ["emerald", "sky", "amber", "coral", "violet", "teal"] as const;

export type BrandTone = (typeof brandTones)[number];

export const brandToneClasses: Record<
  BrandTone,
  {
    text: string;
    well: string;
    wellHover: string;
    border: string;
    ring: string;
  }
> = {
  emerald: {
    text: "text-brand-emerald",
    well: "bg-brand-emerald/12 dark:bg-brand-emerald/18",
    wellHover: "group-hover:bg-brand-emerald/20 dark:group-hover:bg-brand-emerald/26",
    border: "hover:border-brand-emerald/45 dark:hover:border-brand-emerald/50",
    ring: "border-brand-emerald/35 dark:border-brand-emerald/40",
  },
  sky: {
    text: "text-brand-sky",
    well: "bg-brand-sky/12 dark:bg-brand-sky/18",
    wellHover: "group-hover:bg-brand-sky/20 dark:group-hover:bg-brand-sky/26",
    border: "hover:border-brand-sky/45 dark:hover:border-brand-sky/50",
    ring: "border-brand-sky/35 dark:border-brand-sky/40",
  },
  amber: {
    text: "text-brand-amber dark:text-brand-amber",
    well: "bg-brand-amber/12 dark:bg-brand-amber/16",
    wellHover: "group-hover:bg-brand-amber/20 dark:group-hover:bg-brand-amber/24",
    border: "hover:border-brand-amber/45 dark:hover:border-brand-amber/50",
    ring: "border-brand-amber/35 dark:border-brand-amber/40",
  },
  coral: {
    text: "text-brand-coral",
    well: "bg-brand-coral/12 dark:bg-brand-coral/16",
    wellHover: "group-hover:bg-brand-coral/20 dark:group-hover:bg-brand-coral/24",
    border: "hover:border-brand-coral/45 dark:hover:border-brand-coral/50",
    ring: "border-brand-coral/35 dark:border-brand-coral/40",
  },
  violet: {
    text: "text-brand-violet",
    well: "bg-brand-violet/12 dark:bg-brand-violet/16",
    wellHover: "group-hover:bg-brand-violet/20 dark:group-hover:bg-brand-violet/24",
    border: "hover:border-brand-violet/45 dark:hover:border-brand-violet/50",
    ring: "border-brand-violet/35 dark:border-brand-violet/40",
  },
  teal: {
    text: "text-brand-teal",
    well: "bg-brand-teal/12 dark:bg-brand-teal/18",
    wellHover: "group-hover:bg-brand-teal/20 dark:group-hover:bg-brand-teal/26",
    border: "hover:border-brand-teal/45 dark:hover:border-brand-teal/50",
    ring: "border-brand-teal/35 dark:border-brand-teal/40",
  },
};
