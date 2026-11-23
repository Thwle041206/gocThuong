import type { Metadata } from "next";
import ProjectsBrowser from "@/components/ProjectsBrowser";

export const metadata: Metadata = {
  title: "Dự án",
  description: "Case study BA & AI: vấn đề, cách làm, kết quả đo được.",
};

export default function ProjectsPage() {
  return <ProjectsBrowser />;
}
