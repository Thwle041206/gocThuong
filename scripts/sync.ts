/**
 * Runs in GitHub Actions before `next build` (needs GOOGLE_APPLICATION_CREDENTIALS = Firebase service account).
 *  1. Writes the Firebase web config to lib/firebase-config.json (creates a Web app if none exists).
 *  2. Grants the "admin" role to ADMIN_EMAILS and creates/updates the TEST_EMAIL account.
 *  3. Seeds Firestore with the starter content the first time.
 *  4. Exports published content to content/remote.json for the static build.
 * Every step is best-effort: a failure logs a warning and the build continues with the seed content.
 */
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getSecurityRules } from "firebase-admin/security-rules";
import { seedPosts } from "../content/posts";
import { seedProjects } from "../content/projects";
import { seedResources } from "../content/resources";

const PROJECT = process.env.FIREBASE_PROJECT || "gocthuong";
const cred = applicationDefault();
initializeApp({ credential: cred, projectId: PROJECT });
const db = getFirestore();

const warn = (step: string, e: unknown) => console.warn(`::warning title=${step}::${(e as Error)?.message ?? e}`);

async function token() {
  const t = await cred.getAccessToken();
  return t.access_token;
}

async function webConfig() {
  const base = `https://firebase.googleapis.com/v1beta1/projects/${PROJECT}`;
  const h = { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" };
  let apps = ((await (await fetch(`${base}/webApps`, { headers: h })).json()) as { apps?: { appId: string }[] }).apps ?? [];
  if (!apps.length) {
    console.log("Creating Firebase Web app…");
    const op = (await (await fetch(`${base}/webApps`, { method: "POST", headers: h, body: JSON.stringify({ displayName: "gocthuong-web" }) })).json()) as { name?: string };
    for (let i = 0; i < 20 && op.name; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const st = (await (await fetch(`https://firebase.googleapis.com/v1beta1/${op.name}`, { headers: h })).json()) as { done?: boolean };
      if (st.done) break;
    }
    apps = ((await (await fetch(`${base}/webApps`, { headers: h })).json()) as { apps?: { appId: string }[] }).apps ?? [];
  }
  if (!apps.length) throw new Error("No Firebase Web app");
  const cfg = (await (await fetch(`${base}/webApps/${apps[0].appId}/config`, { headers: h })).json()) as Record<string, string>;
  if (!cfg.apiKey) throw new Error("Web app config has no apiKey: " + JSON.stringify(cfg).slice(0, 200));
  const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = cfg;
  writeFileSync("lib/firebase-config.json", JSON.stringify({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }, null, 2));
  console.log("✓ Firebase web config written");
}

async function setupAuth() {
  const auth = getAuth();
  const emails = (process.env.ADMIN_EMAILS || "").split(/[,\s|]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
  const testEmail = (process.env.TEST_EMAIL || "").trim().toLowerCase();
  const testPassword = process.env.TEST_PASSWORD || "";
  if (testEmail && testPassword) {
    try {
      const u = await auth.getUserByEmail(testEmail);
      await auth.updateUser(u.uid, { password: testPassword, disabled: false });
    } catch (e) {
      if ((e as { code?: string }).code === "auth/user-not-found") await auth.createUser({ email: testEmail, password: testPassword, displayName: "Tài khoản thử", emailVerified: true });
      else throw e;
    }
    emails.push(testEmail);
    console.log("✓ Test account ready");
  }
  for (const email of new Set(emails)) {
    try {
      const u = await auth.getUserByEmail(email);
      if (u.customClaims?.role !== "admin") await auth.setCustomUserClaims(u.uid, { ...(u.customClaims ?? {}), role: "admin" });
      console.log("✓ Admin role set for one account");
    } catch (e) {
      if ((e as { code?: string }).code === "auth/user-not-found") console.log("• An admin email has not signed in yet; it gets the role on the next deploy after first sign-in.");
      else throw e;
    }
  }
}

async function seed() {
  const [p, pr, r] = await Promise.all([db.collection("posts").limit(1).get(), db.collection("projects").limit(1).get(), db.collection("resources").limit(1).get()]);
  const now = Timestamp.now();
  const b = db.batch();
  if (p.empty) seedPosts.forEach((x) => b.set(db.collection("posts").doc(x.slug), { ...x, createdAt: now, updatedAt: now }));
  if (pr.empty) seedProjects.forEach((x, i) => b.set(db.collection("projects").doc(x.slug), { ...x, status: "published", order: i, createdAt: now, updatedAt: now }));
  if (r.empty) seedResources.forEach((x) => b.set(db.collection("resources").doc(String(x.id)), { ...x, status: "approved", createdAt: now, updatedAt: now }));
  if (p.empty || pr.empty || r.empty) {
    await b.commit();
    console.log("✓ Seeded Firestore with starter content");
  }
}

const plain = (d: FirebaseFirestore.DocumentData) =>
  JSON.parse(JSON.stringify(d, (_k, v) => (v && typeof v === "object" && "_seconds" in v ? v._seconds * 1000 : v)));

async function exportContent() {
  const [posts, projects, resources, site] = await Promise.all([
    db.collection("posts").where("status", "==", "published").get(),
    db.collection("projects").get(),
    db.collection("resources").where("status", "==", "approved").get(),
    db.doc("settings/site").get(),
  ]);
  const out: Record<string, unknown> = {
    posts: posts.docs.map((d) => plain(d.data())),
    projects: projects.docs.map((d) => plain(d.data())).filter((x) => (x.status ?? "published") === "published"),
    resources: resources.docs.map((d) => ({ ...plain(d.data()), id: d.id })),
  };
  if (site.exists) out.site = plain(site.data()!);
  const json = JSON.stringify(out, null, 2);
  writeFileSync("content/remote.json", json);
  const hash = createHash("sha256").update(json).digest("hex").slice(0, 16);
  mkdirSync("public", { recursive: true });
  writeFileSync("public/content-hash.txt", hash);
  console.log(`✓ Exported ${posts.size} posts, ${(out.projects as unknown[]).length} projects, ${resources.size} resources (hash ${hash})`);
  return hash;
}

/** Publishes firestore.rules (admin-only access). */
async function rules() {
  if (process.env.FIRESTORE_EMULATOR_HOST) return;
  await getSecurityRules().releaseFirestoreRulesetFromSource(readFileSync("firestore.rules", "utf8"));
  console.log("✓ Firestore rules published");
}

async function main() {
  await webConfig().catch((e) => warn("Firebase web config", e));
  await setupAuth().catch((e) => warn("Auth setup (enable Authentication in Firebase console?)", e));
  await rules().catch((e) => warn("Firestore rules (paste firestore.rules in the console Rules tab?)", e));
  let hash = "";
  try {
    await seed();
    hash = await exportContent();
  } catch (e) {
    warn("Firestore (create the Firestore database in Firebase console?)", e);
  }
  // For scheduled runs: only rebuild when content changed since the live deploy.
  let live = "";
  try {
    live = (await (await fetch("https://gocthuong.web.app/content-hash.txt", { cache: "no-store" })).text()).trim();
  } catch {}
  const changed = !hash || hash !== live;
  console.log(`content changed: ${changed}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
}

main();
