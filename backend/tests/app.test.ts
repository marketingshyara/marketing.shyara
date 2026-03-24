import { expect, test } from "vitest";
import { createDefaultState } from "../src/domain/defaults";
import { buildApp } from "../src/app";
import { MemoryPortalRepository } from "../src/store/memoryPortalRepository";
import { PortalService } from "../src/services/portalService";

test("login and session endpoints do not expose password hashes", async () => {
  const portalService = new PortalService(
    new MemoryPortalRepository(
      createDefaultState({
        adminName: "Portal Admin",
        adminEmail: "admin@shyara.local",
        adminPassword: "ChangeMe123!"
      })
    )
  );
  const app = buildApp({ portalService });

  try {
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "admin@shyara.local",
        password: "ChangeMe123!"
      }
    });

    expect(login.statusCode).toBe(200);
    expect(login.json().user.passwordHash).toBeUndefined();

    const cookie = login.headers["set-cookie"];
    const session = await app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie }
    });

    expect(session.statusCode).toBe(200);
    expect(session.json().user.passwordHash).toBeUndefined();
    expect(session.json().user.mustChangePassword).toBe(true);
  } finally {
    await app.close();
  }
});

test("authenticated users can rotate a temporary password and clear the forced-change flag", async () => {
  const portalService = new PortalService(
    new MemoryPortalRepository(
      createDefaultState({
        adminName: "Portal Admin",
        adminEmail: "admin@shyara.local",
        adminPassword: "ChangeMe123!"
      })
    )
  );
  const app = buildApp({ portalService });

  try {
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "admin@shyara.local",
        password: "ChangeMe123!"
      }
    });

    expect(login.statusCode).toBe(200);
    expect(login.json().user.mustChangePassword).toBe(true);

    const cookie = login.headers["set-cookie"];
    const changePassword = await app.inject({
      method: "POST",
      url: "/api/auth/change-password",
      headers: { cookie },
      payload: {
        currentPassword: "ChangeMe123!",
        newPassword: "EvenSaferPassword123!"
      }
    });

    expect(changePassword.statusCode).toBe(200);
    expect(changePassword.json().ok).toBe(true);

    const session = await app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie }
    });

    expect(session.statusCode).toBe(200);
    expect(session.json().user.mustChangePassword).toBe(false);
  } finally {
    await app.close();
  }
});
