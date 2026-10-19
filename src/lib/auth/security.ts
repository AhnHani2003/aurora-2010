import "server-only";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { runtimeConfig } from "./config";

export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}
export function tokenHash(token: string) {
  return createHmac("sha256", runtimeConfig().secret)
    .update(token)
    .digest("hex");
}
export function correctPassword(candidate: string) {
  const secret = runtimeConfig().secret;
  return timingSafeEqual(
    scryptSync(candidate, secret, 32),
    scryptSync(runtimeConfig().password, secret, 32),
  );
}
export function requestIdentity(request: Request) {
  // Vercel provides this header; local development is intentionally one shared bucket.
  const address =
    process.env.VERCEL === "1"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
      : "local";
  return createHmac("sha256", runtimeConfig().secret)
    .update(address)
    .digest("hex");
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const reject = () => {
    throw new HttpError(403, "Please return to the garden and try again.");
  };
  // Next can rewrite request.url to its bind address (e.g. 0.0.0.0). The
  // browser's Host identifies the destination whose cookie it is sending.
  const host = request.headers.get("host");
  if (
    !origin ||
    !host ||
    /[\s/\\?#@]/.test(host) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return reject();
  let protocol = new URL(request.url).protocol;
  // Only trust this forwarding header on the deployment platform that sets it.
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  if (
    process.env.VERCEL === "1" &&
    (forwardedProtocol === "https" || forwardedProtocol === "http")
  )
    protocol = `${forwardedProtocol}:`;
  try {
    const destination = new URL(`${protocol}//${host}`);
    const source = new URL(origin);
    if (
      !["http:", "https:"].includes(protocol) ||
      destination.username ||
      destination.password ||
      destination.pathname !== "/" ||
      destination.search ||
      destination.hash ||
      source.origin !== origin ||
      source.origin !== destination.origin
    )
      reject();
  } catch {
    reject();
  }
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
