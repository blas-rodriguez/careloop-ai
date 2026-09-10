import { randomBytes } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
let secret = process.env.SUPABASE_SECRET_KEY;
if (url && !secret) {
  try {
    const projectRef = new URL(url).hostname.split(".")[0];
    const output = execFileSync(
      "npx",
      [
        "supabase",
        "projects",
        "api-keys",
        "--project-ref",
        projectRef,
        "--reveal",
        "--output",
        "json",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const keys = JSON.parse(output);
    secret =
      keys.find((key) => key.type === "secret")?.api_key ??
      keys.find((key) => key.name === "service_role")?.api_key;
  } catch {
    // Fall through to the configuration message below.
  }
}
if (!url || !secret || !publishableKey) {
  console.error(
    "Authenticated E2E requires a linked Supabase project or SUPABASE_SECRET_KEY.",
  );
  process.exit(1);
}

const token = randomBytes(10).toString("hex");
const email = `careloop-e2e-${token}@example.com`;
const password = `E2E-${randomBytes(18).toString("base64url")}!`;
const secondEmail = `careloop-e2e-isolation-${token}@example.com`;
const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function removeTestUser(user) {
  await admin.from("patients").delete().eq("owner_id", user.id);
  await admin.from("doctors").delete().eq("owner_id", user.id);
  await admin.from("specialties").delete().eq("owner_id", user.id);
  return admin.auth.admin.deleteUser(user.id);
}

const { data: existingUsers } = await admin.auth.admin.listUsers({
  perPage: 1000,
});
for (const user of existingUsers?.users ?? []) {
  if (user.email?.startsWith("careloop-e2e-")) await removeTestUser(user);
}

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "CareLoop E2E" },
});
const { data: secondData, error: secondError } =
  await admin.auth.admin.createUser({
    email: secondEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: "CareLoop Isolation E2E" },
  });
if (error || !data.user || secondError || !secondData.user) {
  console.error("Could not create the disposable E2E account.");
  if (data.user) await removeTestUser(data.user);
  process.exit(1);
}

try {
  const firstClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const secondClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const [firstLogin, secondLogin] = await Promise.all([
    firstClient.auth.signInWithPassword({ email, password }),
    secondClient.auth.signInWithPassword({ email: secondEmail, password }),
  ]);
  if (firstLogin.error || secondLogin.error)
    throw new Error("Disposable account login failed.");
  const [firstReset, secondReset] = await Promise.all([
    firstClient.rpc("reset_demo_workspace"),
    secondClient.rpc("reset_demo_workspace"),
  ]);
  if (firstReset.error || secondReset.error)
    throw new Error("Demo reset failed during the RLS test.");
  const secondPatients = await secondClient.from("patients").select("id");
  const foreignId = secondPatients.data?.[0]?.id;
  if (!foreignId) throw new Error("Isolation fixture was not created.");
  const leaked = await firstClient
    .from("patients")
    .select("id")
    .eq("id", foreignId);
  if (leaked.error || leaked.data?.length)
    throw new Error("RLS isolation check failed.");
  console.log("RLS cross-account isolation check passed.");

  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      ["playwright", "test", "tests/e2e/authenticated.spec.ts", "--workers=1"],
      {
        stdio: "inherit",
        env: { ...process.env, E2E_EMAIL: email, E2E_PASSWORD: password },
      },
    );
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  const { error: deleteError } = await removeTestUser(data.user);
  const { error: secondDeleteError } = await removeTestUser(secondData.user);
  if (deleteError || secondDeleteError) {
    console.error(
      "The disposable E2E account could not be removed; remove it from Supabase Auth.",
    );
    process.exitCode = 1;
  } else {
    console.log(
      "Disposable E2E account and its cascaded workspace were removed.",
    );
  }
}
