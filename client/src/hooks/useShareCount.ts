import { useCallback, useEffect, useState } from "react";

const SHARE_COUNT_PREFIX = "muslim-baby-names:local-share-count:";

export function useShareCount(slug: string) {
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    try {
      setShareCount(Number.parseInt(window.localStorage.getItem(`${SHARE_COUNT_PREFIX}${slug}`) || "0", 10) || 0);
    } catch {
      setShareCount(0);
    }
  }, [slug]);

  const recordShare = useCallback(() => {
    setShareCount((current) => {
      const next = current + 1;
      try {
        window.localStorage.setItem(`${SHARE_COUNT_PREFIX}${slug}`, String(next));
      } catch {
        // The counter remains a progressive enhancement if storage is unavailable.
      }
      return next;
    });
  }, [slug]);

  return { shareCount, recordShare };
}
