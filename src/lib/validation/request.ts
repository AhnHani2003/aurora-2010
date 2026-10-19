import { z } from "zod";
import { HttpError } from "../auth/security";

export const loginSchema = z
  .object({ password: z.string().min(1).max(256) })
  .strict();
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Please send a JSON request.");
  if (Number(request.headers.get("content-length") || 0) > 16_384)
    throw new HttpError(413, "That message is a little too long.");
  // Bound the stream itself, including chunked requests without Content-Length.
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  if (reader) {
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        length += chunk.value.byteLength;
        if (length > 16_384) {
          await reader.cancel();
          throw new HttpError(413, "That message is a little too long.");
        }
        chunks.push(chunk.value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  const raw = Buffer.concat(chunks, length).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Please try that again.");
  }
}
