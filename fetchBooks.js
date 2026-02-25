

const BASE_URL = "https://openlibrary.org";

// ── Exercise 3.1: Fetch books by search query ────────────────
export async function fetchBooks(query = "popular fiction", limit = 20) {
  const encodedQuery = encodeURIComponent(query);
  const url = `${BASE_URL}/search.json?q=${encodedQuery}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,subject`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Transform the raw API data into a clean format we can use
  return data.docs.map((book) => ({
    id: book.key,                                  // e.g. "/works/OL45883W"
    title: book.title || "Unknown Title",
    author: book.author_name?.[0] || "Unknown Author",
    year: book.first_publish_year || "—",
    cover: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
    subjects: book.subject?.slice(0, 3) || [],
  }));
}