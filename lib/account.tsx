"use client";

// Reader accounts: anyone can sign in to save posts and resources and to share a resource.
// Signing in never grants admin rights: the CMS checks the "admin" custom claim set in CI.
// Firebase is loaded only in the browser, after the page has rendered.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import type { Unsubscribe } from "firebase/firestore";

export type SavedType = "post" | "resource";
export type SavedItem = { type: SavedType; ref: string; title: string; url: string; savedAt: number };
export type Submission = { title: string; url: string; desc: string; cat: string };
export type MySubmission = Submission & { id: string; status: "pending" | "approved" | "rejected"; createdAt?: number };

type Ctx = {
  /** false until Firebase has said whether someone is signed in. */
  ready: boolean;
  enabled: boolean;
  user: User | null;
  saved: Record<string, SavedItem>;
  isSaved: (type: SavedType, ref: string) => boolean;
  /** Saves or unsaves; opens the sign-in dialog when nobody is signed in. Returns the new state, or null. */
  toggleSave: (item: Omit<SavedItem, "savedAt">) => Promise<boolean | null>;
  submitResource: (s: Submission) => Promise<void>;
  mySubmissions: () => Promise<MySubmission[]>;
  openSignIn: (reason?: string) => void;
  closeSignIn: () => void;
  signInReason: string | null;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AccountCtx = createContext<Ctx | null>(null);

export const savedKey = (type: SavedType, ref: string) => `${type}-${ref}`.replace(/[/#?\s]/g, "_").slice(0, 300);

async function load() {
  const [{ fb, firebaseReady }, auth, fs] = await Promise.all([import("./firebase"), import("firebase/auth"), import("firebase/firestore")]);
  return { fb, firebaseReady, auth, fs };
}
type Lib = Awaited<ReturnType<typeof load>>;

export function authMessage(e: unknown) {
  const code = (e as { code?: string }).code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email hoặc mật khẩu không đúng.";
  if (code.includes("email-already-in-use")) return "Email này đã có tài khoản. Hãy đăng nhập.";
  if (code.includes("weak-password")) return "Mật khẩu cần ít nhất 6 ký tự.";
  if (code.includes("invalid-email")) return "Email không hợp lệ.";
  if (code.includes("too-many-requests")) return "Thử quá nhiều lần. Đợi một lát rồi thử lại.";
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return "Bạn đã đóng cửa sổ đăng nhập.";
  if (code.includes("popup-blocked")) return "Trình duyệt đã chặn cửa sổ đăng nhập. Cho phép popup rồi thử lại.";
  if (code.includes("requires-recent-login")) return "Vì an toàn, hãy đăng xuất, đăng nhập lại rồi thử lại.";
  if (code.includes("permission-denied")) return "Không có quyền thực hiện thao tác này.";
  if (code.includes("unavailable") || code.includes("network")) return "Mất kết nối. Thử lại sau.";
  return "Có lỗi xảy ra. Thử lại sau.";
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const lib = useRef<Lib | null>(null);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState<Record<string, SavedItem>>({});
  const [signInReason, setSignInReason] = useState<string | null>(null);

  useEffect(() => {
    let offAuth: (() => void) | undefined;
    let offSaved: Unsubscribe | undefined;
    let alive = true;
    load()
      .then((l) => {
        if (!alive) return;
        lib.current = l;
        if (!l.firebaseReady) {
          setEnabled(false);
          setReady(true);
          return;
        }
        const { auth, db } = l.fb();
        offAuth = l.auth.onAuthStateChanged(auth, (u) => {
          offSaved?.();
          offSaved = undefined;
          setUser(u);
          setSaved({});
          setReady(true);
          if (u) {
            offSaved = l.fs.onSnapshot(
              l.fs.collection(db, "users", u.uid, "saved"),
              (snap) => {
                const next: Record<string, SavedItem> = {};
                snap.forEach((d) => (next[d.id] = d.data() as SavedItem));
                setSaved(next);
              },
              () => setSaved({}),
            );
          }
        });
      })
      .catch(() => {
        setEnabled(false);
        setReady(true);
      });
    return () => {
      alive = false;
      offAuth?.();
      offSaved?.();
    };
  }, []);

  const openSignIn = useCallback((reason?: string) => setSignInReason(reason ?? "Đăng nhập để lưu bài viết và tài liệu vào tài khoản của bạn."), []);
  const closeSignIn = useCallback(() => setSignInReason(null), []);

  const toggleSave = useCallback(
    async (item: Omit<SavedItem, "savedAt">) => {
      const l = lib.current;
      if (!l || !user) {
        openSignIn(item.type === "post" ? "Đăng nhập để lưu bài viết này vào tài khoản của bạn." : "Đăng nhập để lưu tài liệu này vào tài khoản của bạn.");
        return null;
      }
      const key = savedKey(item.type, item.ref);
      const ref = l.fs.doc(l.fb().db, "users", user.uid, "saved", key);
      if (saved[key]) {
        setSaved(({ [key]: _, ...rest }) => rest);
        await l.fs.deleteDoc(ref);
        return false;
      }
      const full: SavedItem = { type: item.type, ref: String(item.ref).slice(0, 300), title: item.title.slice(0, 300), url: item.url.slice(0, 500), savedAt: Date.now() };
      setSaved((s) => ({ ...s, [key]: full }));
      await l.fs.setDoc(ref, full);
      return true;
    },
    [user, saved, openSignIn],
  );

  const submitResource = useCallback(
    async (s: Submission) => {
      const l = lib.current;
      if (!l || !user) throw Object.assign(new Error("signed out"), { code: "permission-denied" });
      await l.fs.addDoc(l.fs.collection(l.fb().db, "resources"), {
        title: s.title.trim(),
        url: s.url.trim(),
        desc: s.desc.trim(),
        cat: s.cat,
        by: (user.displayName || user.email?.split("@")[0] || "Bạn đọc").slice(0, 60),
        likes: 0,
        status: "pending",
        submittedBy: user.uid,
        createdAt: Date.now(),
      });
    },
    [user],
  );

  const mySubmissions = useCallback(async () => {
    const l = lib.current;
    if (!l || !user) return [];
    const snap = await l.fs.getDocs(l.fs.query(l.fs.collection(l.fb().db, "resources"), l.fs.where("submittedBy", "==", user.uid)));
    return snap.docs
      .map((d) => ({ ...(d.data() as MySubmission), id: d.id }))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [user]);

  const signOut = useCallback(async () => {
    const l = lib.current;
    if (l) await l.auth.signOut(l.fb().auth);
  }, []);

  const deleteAccount = useCallback(async () => {
    const l = lib.current;
    if (!l || !user) return;
    const { db } = l.fb();
    const snap = await l.fs.getDocs(l.fs.collection(db, "users", user.uid, "saved"));
    await Promise.all(snap.docs.map((d) => l.fs.deleteDoc(d.ref)));
    await l.auth.deleteUser(user);
  }, [user]);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      enabled,
      user,
      saved,
      isSaved: (type, ref) => Boolean(saved[savedKey(type, ref)]),
      toggleSave,
      submitResource,
      mySubmissions,
      openSignIn,
      closeSignIn,
      signInReason,
      signOut,
      deleteAccount,
    }),
    [ready, enabled, user, saved, toggleSave, submitResource, mySubmissions, openSignIn, closeSignIn, signInReason, signOut, deleteAccount],
  );

  return <AccountCtx.Provider value={value}>{children}</AccountCtx.Provider>;
}

export function useAccount() {
  const c = useContext(AccountCtx);
  if (!c) throw new Error("useAccount must be used inside AccountProvider");
  return c;
}

/** Sign-in helpers used by the dialog. */
export async function signInWithGoogle() {
  const l = await load();
  const { auth } = l.fb();
  await l.auth.signInWithPopup(auth, new l.auth.GoogleAuthProvider());
}
export async function signInWithEmail(email: string, password: string) {
  const l = await load();
  await l.auth.signInWithEmailAndPassword(l.fb().auth, email.trim(), password);
}
export async function signUpWithEmail(name: string, email: string, password: string) {
  const l = await load();
  const cred = await l.auth.createUserWithEmailAndPassword(l.fb().auth, email.trim(), password);
  if (name.trim()) await l.auth.updateProfile(cred.user, { displayName: name.trim().slice(0, 60) });
  await l.auth.sendEmailVerification(cred.user).catch(() => {});
}
export async function resetPassword(email: string) {
  const l = await load();
  await l.auth.sendPasswordResetEmail(l.fb().auth, email.trim());
}
