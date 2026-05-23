-- Lock commission calculation to agreed project total (portal settings + heal stored JSON).
UPDATE "PortalSettings"
SET "values" = jsonb_set(
  COALESCE("values", '{}'::jsonb),
  '{commissionBasis}',
  '"AGREED_TOTAL"'::jsonb,
  true
)
WHERE id = 'default';
