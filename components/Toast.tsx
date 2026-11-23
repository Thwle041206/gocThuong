"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Small black snackbar used for "copied link", "saved", etc. */
export function useToast() {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flash = useCallback((t: string) => {
    setText(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(null), 2500);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = text ? (
    <div
      role="status"
      className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-[10px] bg-ink px-5 py-3.5 text-sm text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
    >
      {text}
      <button type="button" onClick={() => setText(null)} className="h-9 cursor-pointer border-0 bg-transparent px-2 font-semibold text-white underline">
        Đóng
      </button>
    </div>
  ) : null;
  return { flash, node };
}

export async function copyLink(url?: string) {
  try {
    await navigator.clipboard.writeText(url ?? window.location.href);
  } catch {}
}
