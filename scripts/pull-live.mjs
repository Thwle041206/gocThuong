// Builds outside GitHub Actions (Cloudflare) can't read Firestore. Before `next build`
// there, copy the Firebase web config and the published content from the live Firebase
// site, which the GitHub deploy publishes under /_build/. Both are public by design.
import { readFileSync, writeFileSync } from "node:fs";

const onCloudflare = process.env.WORKERS_CI || process.env.CF_PAGES || process.env.PULL_LIVE;
const empty = (f) => {
  try {
    return Object.keys(JSON.parse(readFileSync(f, "utf8"))).length === 0;
  } catch {
    return true;
  }
};

if (onCloudflare) {
  const base = process.env.LIVE_URL || "https://gocthuong.web.app";
  for (const [remote, local] of [
    ["firebase-config.json", "lib/firebase-config.json"],
    ["remote.json", "content/remote.json"],
  ]) {
    if (!empty(local)) continue;
    try {
      const res = await fetch(`${base}/_build/${remote}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      writeFileSync(local, JSON.stringify(json, null, 2));
      console.log(`✓ ${local} from ${base}`);
    } catch (e) {
      console.warn(`• ${local}: using the built-in content (${e.message})`);
    }
  }
}
