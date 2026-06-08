-- Drift fix: production DB may be missing enum types while migrations are marked applied.
-- On fresh installs, init already creates these enums; only extend ActivityAction here.
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'SETTINGS_UPDATE';
