import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { posts } from "@/content/posts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "du-an/", "bai-viet/", "ket-noi/", "hanh-trinh-ngon-ngu/"];
  return [
    ...pages.map((p) => ({ url: `${site.url}/${p}` })),
    ...projects.map((p) => ({ url: `${site.url}/du-an/${p.slug}/` })),
    ...posts.filter((p) => p.date).map((p) => ({ url: `${site.url}/bai-viet/${p.slug}/`, lastModified: p.date })),
  ];
}
