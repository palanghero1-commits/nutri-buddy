import { describe, expect, it } from "vitest";
import { createSessionToken, readSession, sessionHasRole } from "../../server-auth.mjs";

describe("signed API sessions", () => {
  it("validates the signed role and normalized email", () => {
    const token = createSessionToken("Bhw@Example.com", "bhw");
    const request = { headers: { authorization: `Bearer ${token}` } } as never;
    expect(readSession(request)).toMatchObject({ email: "bhw@example.com", role: "bhw" });
    expect(sessionHasRole(request, "bhw")).not.toBeNull();
    expect(sessionHasRole(request, "admin")).toBeNull();
  });

  it("rejects forged, malformed, and missing tokens", () => {
    const token = createSessionToken("bhw@example.com", "bhw");
    expect(readSession({ headers: { authorization: `Bearer ${token}x` } } as never)).toBeNull();
    expect(readSession({ headers: { authorization: "Bearer malformed" } } as never)).toBeNull();
    expect(readSession({ headers: {} } as never)).toBeNull();
  });
});
