import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("server secret boundaries", () => {
  it("keeps privileged modules server-only", () => {
    expect(read("src/lib/supabase/admin.ts")).toMatch(/^import "server-only";/);
    expect(read("src/lib/calls/provider.ts")).toMatch(/^import "server-only";/);
    expect(read("src/lib/calls/reconcile.ts")).toMatch(/^import "server-only";/);
  });

  it("does not reference private credentials in client modules", () => {
    const clientFiles = [
      "src/lib/supabase/client.ts",
      "src/components/login-form.tsx",
      "src/components/app-navigation.tsx",
    ];
    for (const file of clientFiles) {
      const source = read(file);
      expect(source).not.toContain("SUPABASE_SECRET_KEY");
      expect(source).not.toContain("CALL_E_API_KEY");
      expect(source).not.toContain("CALLE_API_KEY");
    }
  });

  it("keeps webhook events without client policies", () => {
    const migration = read(
      "supabase/migrations/202609060004_call_webhook_events.sql",
    );
    expect(migration).toContain("enable row level security");
    expect(migration).not.toMatch(/create policy/i);
  });

  it("blocks live calls when webhook administration is unavailable", () => {
    const action = read("src/lib/actions/workspace.ts");
    expect(action).toContain("process.env.SUPABASE_SECRET_KEY");
    expect(action).toContain("Live+calling+is+blocked");
  });

  it("supports provider polling when a webhook is delayed or lost", () => {
    const action = read("src/lib/actions/workspace.ts");
    expect(action).toContain("export async function refreshFollowupCall");
    expect(action).toContain("getCallECall(call.provider_call_id)");
  });
});
