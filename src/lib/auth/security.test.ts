import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { assertSameOrigin } from "./security";

afterEach(() => vi.unstubAllEnvs());

describe("browser destination origin checks", () => {
  const request = (
    origin: string,
    host = "localhost:3000",
    extra: Record<string, string> = {},
  ) =>
    new Request("http://0.0.0.0:3000/api/login", {
      method: "POST",
      headers: { origin, host, ...extra },
    });

  it("accepts the browser localhost origin when Next uses a wildcard bind address", () => {
    expect(() =>
      assertSameOrigin(request("http://localhost:3000")),
    ).not.toThrow();
  });
  it("rejects a different origin, port, malformed Host, and explicit cross-site requests", () => {
    expect(() => assertSameOrigin(request("https://other.example"))).toThrow();
    expect(() => assertSameOrigin(request("http://localhost:3001"))).toThrow();
    expect(() =>
      assertSameOrigin(
        request("http://localhost:3000", "attacker@localhost:3000"),
      ),
    ).toThrow();
    expect(() =>
      assertSameOrigin(request("http://localhost:3000", "localhost:3000/path")),
    ).toThrow();
    expect(() =>
      assertSameOrigin(
        request("http://localhost:3000", "localhost:3000", {
          "sec-fetch-site": "cross-site",
        }),
      ),
    ).toThrow();
  });
  it("accepts trusted Vercel HTTPS forwarding but rejects an untrusted forwarded protocol", () => {
    vi.stubEnv("VERCEL", "1");
    expect(() =>
      assertSameOrigin(
        request("https://surprise.example", "surprise.example", {
          "x-forwarded-proto": "https",
        }),
      ),
    ).not.toThrow();
    vi.stubEnv("VERCEL", "");
    expect(() =>
      assertSameOrigin(
        request("https://surprise.example", "surprise.example", {
          "x-forwarded-proto": "https",
        }),
      ),
    ).toThrow();
  });
  it("requires a real Origin and destination Host", () => {
    expect(() =>
      assertSameOrigin(
        new Request("http://0.0.0.0:3000/api/login", { method: "POST" }),
      ),
    ).toThrow();
    expect(() => assertSameOrigin(request("null"))).toThrow();
  });
});
