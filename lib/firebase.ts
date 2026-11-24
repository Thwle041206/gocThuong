"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import config from "./firebase-config.json";

// The web config is public by design (security comes from Auth + Firestore rules).
// CI writes it to firebase-config.json before each build.
// For local testing: NEXT_PUBLIC_EMULATOR=1 npm run dev (with `firebase emulators:start`).
const EMU = process.env.NEXT_PUBLIC_EMULATOR === "1";
const cfg = EMU ? { apiKey: "demo-key", authDomain: "localhost", projectId: "demo-gocthuong", appId: "demo" } : config;

export const firebaseReady = EMU || Boolean((config as { apiKey?: string }).apiKey);

let cache: { app: FirebaseApp; auth: Auth; db: Firestore } | undefined;
export function fb() {
  if (!firebaseReady) throw new Error("Firebase chưa được cấu hình");
  if (cache) return cache;
  const app = getApps()[0] ?? initializeApp(cfg);
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (EMU) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  cache = { app, auth, db };
  return cache;
}
