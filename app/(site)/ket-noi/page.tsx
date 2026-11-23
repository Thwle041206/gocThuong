import type { Metadata } from "next";
import ResourcesBrowser from "@/components/ResourcesBrowser";

export const metadata: Metadata = {
  title: "Tài nguyên chia sẻ",
  description: "Link và tài liệu chọn lọc cho BA, AI và người học ngôn ngữ.",
};

export default function ConnectPage() {
  return <ResourcesBrowser />;
}
