import { STANDALONE_RELEASE } from "./release";
export async function experienceRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  if (!STANDALONE_RELEASE) return fetch(path, init);
  const { standaloneRequest } = await import("./standalone");
  return standaloneRequest(path, init);
}
