import { createBrowserClient } from "@supabase/ssr";

// Strips BOM and any non-printable-ASCII that can corrupt HTTP headers
const clean = (s: string) => s.replace(/[^\x20-\x7E]/g, "").trim();

export function createClient() {
  return createBrowserClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!),
    { auth: { flowType: "implicit" } },
  );
}
