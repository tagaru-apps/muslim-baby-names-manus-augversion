/** Quiet Courtyard interaction: an intentionally simple, private shortlist stored only in the browser. */
import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "muslim-baby-names:favorites";

function readFavorites(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((current) => {
      const next = current.includes(slug)
        ? current.filter((favorite) => favorite !== slug)
        : [...current, slug];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
