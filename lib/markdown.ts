import { Marked, type Tokens } from "marked";

export type Heading = { id: string; label: string };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-|-$/g, "") || "muc";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Markdown → safe HTML (raw HTML in the source is escaped, links limited to http/https/mailto/relative). */
export function renderMarkdown(md: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();
  const m = new Marked({ gfm: true, breaks: false });
  m.use({
    renderer: {
      html(t: Tokens.HTML | Tokens.Tag) {
        return esc(t.text);
      },
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, t: Tokens.Heading) {
        const text = this.parser.parseInline(t.tokens);
        if (t.depth === 2) {
          let id = slugify(t.text);
          while (used.has(id)) id += "-2";
          used.add(id);
          headings.push({ id, label: t.text });
          return `<h2 id="${id}">${text}</h2>`;
        }
        return `<h${t.depth}>${text}</h${t.depth}>`;
      },
      link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, t: Tokens.Link) {
        const ok = /^(https?:|mailto:|\/|#)/i.test(t.href);
        const href = ok ? esc(t.href) : "#";
        const ext = /^https?:/i.test(t.href);
        return `<a href="${href}"${ext ? ' target="_blank" rel="noopener nofollow"' : ""}>${this.parser.parseInline(t.tokens)}</a>`;
      },
      image(t: Tokens.Image) {
        const ok = /^(https?:|\/)/i.test(t.href);
        return ok ? `<figure><img src="${esc(t.href)}" alt="${esc(t.text)}" loading="lazy"/>${t.text ? `<figcaption>${esc(t.text)}</figcaption>` : ""}</figure>` : "";
      },
    },
  });
  const html = m.parse(md || "", { async: false }) as string;
  return { html, headings };
}
