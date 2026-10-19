import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { readJson } from "./request";

describe("bounded JSON requests", () => {
  const request = (body: string, type = "application/json") =>
    new Request("http://localhost/api/game", {
      method: "POST",
      headers: { "Content-Type": type },
      body,
    });
  it("accepts valid small JSON", async () => {
    expect(await readJson(request('{"choice":"Aurora"}'))).toEqual({
      choice: "Aurora",
    });
  });
  it("rejects oversized bodies even without a content-length header", async () => {
    await expect(
      readJson(request(JSON.stringify({ message: "a".repeat(20_000) }))),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("rejects invalid JSON and unsupported content types", async () => {
    await expect(readJson(request("{broken"))).rejects.toMatchObject({
      status: 400,
    });
    await expect(readJson(request("{}", "text/plain"))).rejects.toMatchObject({
      status: 415,
    });
  });
});
