-- Heal legacy users tagged ADMIN when the role column was added with DEFAULT 'ADMIN'.
-- Admins cannot create leads (rep-only); anyone who created leads was acting as a sales rep.
UPDATE "User" u
SET role = 'SALES_REP'::"UserRole"
WHERE u.role = 'ADMIN'::"UserRole"
  AND EXISTS (
    SELECT 1
    FROM "Lead" l
    WHERE l."createdByUserId" = u.id
  );
