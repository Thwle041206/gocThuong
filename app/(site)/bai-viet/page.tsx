import type { Metadata } from "next";
import PostsBrowser from "@/components/PostsBrowser";

export const metadata: Metadata = {
  title: "Bài viết",
  description: "Bài học từ công việc BA, thử nghiệm AI và hành trình học ngôn ngữ.",
};

export default function PostsPage() {
  return <PostsBrowser />;
}
