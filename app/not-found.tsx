import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap flex flex-col items-center gap-4 py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display">Không tìm thấy trang</h1>
      <p className="m-0 text-lg text-muted">Trang này có thể đã đổi địa chỉ.</p>
      <Link href="/" className="btn btn-dark mt-4">Về trang chủ</Link>
    </section>
  );
}
