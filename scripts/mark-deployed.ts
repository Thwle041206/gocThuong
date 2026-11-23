import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT || "gocthuong" });
getFirestore()
  .doc("meta/site")
  .set({ lastDeployAt: FieldValue.serverTimestamp() }, { merge: true })
  .then(() => console.log("✓ Marked deploy time"))
  .catch((e) => console.warn("::warning::" + e.message));
