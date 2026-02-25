const STORAGE_KEY = "bookExplorerFavorites";

export function loadFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Could not load favorites:", error);
    return [];
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Could not save favorites:", error);
  }
}

export function addFavorite(book) {
  const favorites = loadFavorites();

  // Don't add duplicates
  const alreadySaved = favorites.find((f) => f.id === book.id);
  if (alreadySaved) return favorites;

  const updated = [...favorites, book];
  saveFavorites(updated);
  return updated;
}

export function removeFavorite(bookId) {
  const favorites = loadFavorites();
  const updated = favorites.filter((f) => f.id !== bookId);
  saveFavorites(updated);
  return updated;
}

export function isFavorite(bookId) {
  const favorites = loadFavorites();
  return favorites.some((f) => f.id === bookId);
}