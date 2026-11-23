"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { fb } from "./firebase";
import type { PostDoc } from "@/content/posts";
import type { Project } from "@/content/projects";
import type { Resource } from "@/content/resources";
import type { Site } from "@/content/site";

export type WithId<T> = T & { id: string };

const ms = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : undefined);

async function list<T>(name: string): Promise<WithId<T>[]> {
  const snap = await getDocs(collection(fb().db, name));
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id, updatedAt: ms(d.data().updatedAt), createdAt: ms(d.data().createdAt) }));
}

/** Marks content as changed so the next scheduled deploy rebuilds the public site. */
async function touch(what: string) {
  await setDoc(doc(fb().db, "meta", "site"), { contentUpdatedAt: serverTimestamp(), lastChange: what }, { merge: true });
}

async function save<T extends object>(name: string, id: string | undefined, data: T, label: string): Promise<string> {
  const clean = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  delete clean.id;
  clean.updatedAt = serverTimestamp();
  let newId = id;
  if (id) await setDoc(doc(fb().db, name, id), clean);
  else newId = (await addDoc(collection(fb().db, name), { ...clean, createdAt: serverTimestamp() })).id;
  await touch(label);
  await logActivity(label);
  return newId!;
}

async function remove(name: string, id: string, label: string) {
  await deleteDoc(doc(fb().db, name, id));
  await touch(label);
  await logActivity(label);
}

export async function logActivity(text: string) {
  try {
    await addDoc(collection(fb().db, "activity"), { text, at: serverTimestamp(), by: fb().auth.currentUser?.email ?? "" });
  } catch {}
}
export async function listActivity() {
  const rows = await list<{ text: string; at?: unknown }>("activity");
  return rows
    .map((r) => ({ ...r, atMs: ms(r.at) ?? 0 }))
    .sort((a, b) => b.atMs - a.atMs)
    .slice(0, 8);
}

export const cms = {
  posts: {
    list: () => list<PostDoc>("posts"),
    get: async (id: string) => {
      const d = await getDoc(doc(fb().db, "posts", id));
      return d.exists() ? ({ ...(d.data() as PostDoc), id: d.id } as WithId<PostDoc>) : null;
    },
    save: (id: string | undefined, p: PostDoc, label: string) => save("posts", id, p, label),
    remove: (id: string, title: string) => remove("posts", id, `Đã xoá bài “${title}”`),
  },
  projects: {
    list: () => list<Project>("projects"),
    save: (id: string | undefined, p: Project) => save("projects", id, p, `Đã lưu dự án “${p.title}”`),
    remove: (id: string, title: string) => remove("projects", id, `Đã xoá dự án “${title}”`),
    reorder: async (ids: string[]) => {
      const b = writeBatch(fb().db);
      ids.forEach((id, i) => b.update(doc(fb().db, "projects", id), { order: i }));
      await b.commit();
      await touch("Sắp xếp dự án");
    },
  },
  resources: {
    list: () => list<Resource>("resources"),
    save: (id: string | undefined, r: Resource) => save("resources", id, r, `Đã lưu tài nguyên “${r.title}”`),
    remove: (id: string, title: string) => remove("resources", id, `Đã xoá tài nguyên “${title}”`),
  },
  settings: {
    get: async () => {
      const d = await getDoc(doc(fb().db, "settings", "site"));
      return d.exists() ? (d.data() as Partial<Site>) : null;
    },
    save: async (s: Partial<Site>) => {
      await setDoc(doc(fb().db, "settings", "site"), JSON.parse(JSON.stringify(s)));
      await touch("Cài đặt");
      await logActivity("Đã cập nhật cài đặt");
    },
  },
  meta: async () => {
    const d = await getDoc(doc(fb().db, "meta", "site"));
    const data = d.data() ?? {};
    return { contentUpdatedAt: ms(data.contentUpdatedAt), lastDeployAt: ms(data.lastDeployAt) };
  },
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
