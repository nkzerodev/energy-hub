const FAVORITES_STORAGE_KEY = "energy-hub:favorites";

export function getFavoriteStationIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is string => typeof value === "string"
    );
  } catch {
    return [];
  }
}

export function setFavoriteStationIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(ids)
  );
}

export function isFavoriteStation(id: string): boolean {
  return getFavoriteStationIds().includes(id);
}

export function toggleFavoriteStation(id: string): boolean {
  const current = getFavoriteStationIds();

  if (current.includes(id)) {
    const next = current.filter((item) => item !== id);
    setFavoriteStationIds(next);
    return false;
  }

  const next = [...current, id];
  setFavoriteStationIds(next);
  return true;
}
