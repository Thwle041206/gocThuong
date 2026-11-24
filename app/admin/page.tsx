"use client";

import Link from "next/link";
import { cms, listActivity } from "@/lib/cms";
import { useAdmin } from "@/components/admin/AdminShell";
import { Loading, PageHead, fmtDate, useLoad } from "@/components/admin/ui";
import { LOCALE_LABEL } from "@/content/posts";

export default function Overview() {
  const { user } = useAdmin();
  const { data, error, reload } = useLoad(async () => {
    const [posts, projects, resources, activity, meta] = await Promise.all([cms.posts.list(), cms.projects.list(), cms.resources.list(), listActivity(), cms.meta()]);
    return { posts, projects, resources, activity, meta };
  });
  const name = user.displayName?.split(" ").slice(-1)[0] || "Thương";

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHead
        title={`Chào ${name}`}
        sub="Đây là tình hình trang của bạn hôm nay."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/bai-viet/sua/" className="btn btn-sm h-11 text-sm">Viết bài mới</Link>
            <Link href="/admin/du-an/?new=1" className="btn btn-sm h-11 text-sm">Thêm dự án</Link>
            <Link href="/admin/cai-dat/" className="btn btn-sm h-11 text-sm">Sửa hồ sơ</Link>
          </div>
        }
      />
      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            {[
              ["BÀI VIẾT", data.posts.length, `${data.posts.filter((p) => p.status === "published").length} đã xuất bản · ${data.posts.filter((p) => p.status !== "published").length} bản nháp`],
              ["DỰ ÁN", data.projects.length, `${data.projects.filter((p) => p.featured).length} nổi bật trên Trang chủ`],
              ["TÀI NGUYÊN", data.resources.length, `${data.resources.filter((r) => r.status === "pending").length} chờ duyệt`],
            ].map(([k, n, s]) => (
              <div key={k as string} className="card flex flex-col gap-2 p-5">
                <span className="label">{k}</span>
                <span className="font-serif text-[48px] leading-none">{n}</span>
                <span className="text-sm text-muted">{s}</span>
              </div>
            ))}
            <div className="flex flex-col gap-2 rounded-2xl bg-ink p-5 text-white">
              <span className="label !text-dim">TRẠNG THÁI SITE</span>
              {data.meta.contentUpdatedAt && (!data.meta.lastDeployAt || data.meta.contentUpdatedAt > data.meta.lastDeployAt) ? (
                <>
                  <span className="text-lg font-medium">Đang chờ cập nhật</span>
                  <span className="text-sm text-on-dark">Thay đổi sẽ lên site trong vòng ~15 phút.</span>
                </>
              ) : (
                <>
                  <span className="text-lg font-medium">Đã đồng bộ</span>
                  <span className="text-sm text-on-dark">Lần deploy gần nhất: {fmtDate(data.meta.lastDeployAt)}</span>
                </>
              )}
              <a href="https://github.com/lletthuong061204-source/gocthuong-web/actions/workflows/deploy.yml" target="_blank" rel="noopener" className="mt-auto self-start rounded-full border border-white px-3 py-1.5 text-[13px] !text-white no-underline">Deploy ngay ↗</a>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-4">
            <section className="card flex flex-col gap-3 p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="m-0 text-lg font-semibold">Tiếp tục viết</h2>
                <Link href="/admin/bai-viet/?tab=draft" className="text-sm font-semibold">Tất cả bản nháp</Link>
              </div>
              {data.posts.filter((p) => p.status !== "published").length === 0 && <p className="m-0 text-sm text-muted">Không có bản nháp nào.</p>}
              {data.posts
                .filter((p) => p.status !== "published")
                .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
                .slice(0, 4)
                .map((p) => {
                  const t = p.tr[p.original] ?? Object.values(p.tr)[0];
                  return (
                    <Link key={p.id} href={`/admin/bai-viet/sua/?id=${p.id}`} className="flex items-center gap-3 rounded-xl p-3 no-underline hover:bg-soft">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-ink font-mono text-[10px] text-white">{p.cat === "NGÔN NGỮ" ? LOCALE_LABEL[p.original] : p.cat.slice(0, 2)}</span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[16px] font-medium">{t?.title || "(Chưa có tiêu đề)"}</span>
                        <span className="text-[13px] text-muted">Bản nháp · {LOCALE_LABEL[p.original]} · sửa {fmtDate(p.updatedAt).toLowerCase()}</span>
                      </span>
                    </Link>
                  );
                })}
            </section>
            <section className="card flex flex-col gap-3 p-6">
              <h2 className="m-0 text-lg font-semibold">Hoạt động gần đây</h2>
              {data.activity.length === 0 && <p className="m-0 text-sm text-muted">Chưa có hoạt động.</p>}
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {data.activity.map((a) => (
                  <li key={a.id} className="flex gap-4 text-[15px]">
                    <span className="w-24 flex-none font-mono text-xs leading-6 text-muted">{fmtDate(a.atMs).replace("Hôm nay, ", "")}</span>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
