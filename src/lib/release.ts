// Standalone is intentional in every environment. Only this explicit value enables services.
export const STANDALONE_RELEASE =
  process.env.NEXT_PUBLIC_RELEASE_MODE !== "backend";
