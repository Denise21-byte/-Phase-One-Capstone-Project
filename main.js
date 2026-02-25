


  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });




import { fetchBooks } from "./fetchBooks.js";
import { addFavorite, removeFavorite, isFavorite } from "./favorites.js";

// ── Grab DOM elements ────────────────────────────────────────
const bookGrid    = document.getElementById("bookGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn   = document.getElementById("searchBtn");
const favBadge    = document.getElementById("favCount");

// Keep track of books currently shown (needed for adding favorites)
let currentBooks = [];

// ──  Loading skeleton ──────────────────────────
function showLoading() {
  bookGrid.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "bg-white rounded-lg shadow overflow-hidden animate-pulse";
    skeleton.innerHTML = `
      <div class="bg-gray-200 h-48 w-full"></div>
      <div class="p-3 space-y-2">
        <div class="bg-gray-200 h-3 rounded w-3/4"></div>
        <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        <div class="bg-gray-200 h-3 rounded w-1/4"></div>
      </div>
    `;
    bookGrid.appendChild(skeleton);
  }
}

// ──  No results message ────────────────────────
function showEmpty(query) {
  bookGrid.innerHTML = `
    <div class="col-span-full text-center py-20 text-gray-400">
      <p class="text-5xl mb-4">🔍</p>
      <p class="text-xl font-semibold">No results found</p>
      <p class="text-sm mt-2">Try a different search term for "<span class="text-gray-600">${query}</span>"</p>
    </div>
  `;
}

// ──  Error message ──────────────────────────────
function showError(message) {
  bookGrid.innerHTML = `
    <div class="col-span-full text-center py-20 text-gray-400">
      <p class="text-5xl mb-4">⚠️</p>
      <p class="text-xl font-semibold">Something went wrong</p>
      <p class="text-sm mt-2 text-red-400">${message}</p>
      <button onclick="location.reload()"
        class="mt-4 text-xs border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100 transition text-gray-600">
        Try Again
      </button>
    </div>
  `;
}

// ── Update the navbar favorites badge ───────────────────────
function updateFavBadge() {
  try {
    const favs = JSON.parse(localStorage.getItem("bookExplorerFavorites") || "[]");
    if (favs.length > 0) {
      favBadge.textContent = favs.length;
      favBadge.classList.remove("hidden");
    } else {
      favBadge.classList.add("hidden");
    }
  } catch {}
}

// ──  Build one book card element ────────────────
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group";
  card.dataset.bookId = book.id;

  const fav = isFavorite(book.id);

  const coverHTML = book.cover
    ? `<img
         src="${book.cover}"
         alt="${book.title}"
         class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
         loading="lazy"
       />`
    : `<div class="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-900
                   flex flex-col items-center justify-center px-3 text-center gap-2">
         <span class="text-3xl">📖</span>
         <span class="text-white text-xs font-medium leading-tight">${book.title}</span>
         <span class="text-gray-400 text-xs">${book.author}</span>
       </div>`;

  card.innerHTML = `
    <div class="relative overflow-hidden">
      ${coverHTML}
      <button
        class="fav-btn absolute top-2 right-2 w-8 h-8 rounded-full shadow flex items-center
               justify-center text-sm transition-all duration-200
               opacity-0 group-hover:opacity-100
               ${fav ? "bg-yellow-400 text-gray-900 !opacity-100" : "bg-white text-gray-400 hover:text-yellow-500"}"
        data-book-id="${book.id}"
        title="${fav ? "Remove from favorites" : "Save to favorites"}"
      >${fav ? "♥" : "♡"}</button>
    </div>
    <div class="p-3">
      <h3 class="font-semibold text-sm leading-tight line-clamp-2">${book.title}</h3>
      <p class="text-xs text-gray-500 mt-1 truncate">${book.author}</p>
      <p class="text-xs text-yellow-500 mt-1">${book.year}</p>
      <button
        class="save-btn mt-3 w-full text-xs py-1.5 rounded border transition
               ${fav
                 ? "bg-yellow-400 border-yellow-400 text-gray-900"
                 : "border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-500"}"
        data-book-id="${book.id}"
      >${fav ? "♥ Saved" : "♡ Save"}</button>
    </div>
  `;

  return card;
}

// ── Toggle favorite and update card UI ───────────────────────
function handleFavToggle(bookId) {
  const card    = bookGrid.querySelector(`[data-book-id="${bookId}"]`);
  const favBtn  = card.querySelector(".fav-btn");
  const saveBtn = card.querySelector(".save-btn");

  if (isFavorite(bookId)) {
    removeFavorite(bookId);
    favBtn.textContent = "♡";
    favBtn.className   = favBtn.className
      .replace("bg-yellow-400 text-gray-900 !opacity-100", "bg-white text-gray-400 hover:text-yellow-500");
    saveBtn.textContent = "♡ Save";
    saveBtn.className   = "save-btn mt-3 w-full text-xs py-1.5 rounded border transition border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-500";
  } else {
    const book = currentBooks.find((b) => b.id === bookId);
    if (book) addFavorite(book);
    favBtn.textContent = "♥";
    favBtn.classList.replace("bg-white", "bg-yellow-400");
    favBtn.classList.replace("text-gray-400", "text-gray-900");
    favBtn.classList.add("!opacity-100");
    saveBtn.textContent = "♥ Saved";
    saveBtn.className   = "save-btn mt-3 w-full text-xs py-1.5 rounded border transition bg-yellow-400 border-yellow-400 text-gray-900";
  }

  updateFavBadge();
}

// ──  Render books into grid ────────────────────
function renderBooks(books) {
  bookGrid.innerHTML = "";

  books.forEach((book) => {
    const card = createBookCard(book);
    bookGrid.appendChild(card);
  });

  // Attach click events to every fav/save button
  bookGrid.querySelectorAll(".fav-btn, .save-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => handleFavToggle(e.currentTarget.dataset.bookId));
  });

  updateFavBadge();
}

// ──  Fetch and render ────────────────────
async function loadBooks(query) {
  showLoading();

  try {
    const books  = await fetchBooks(query, 20);
    currentBooks = books;

    if (books.length === 0) {
      showEmpty(query);
    } else {
      renderBooks(books);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showError(error.message);
  }
}

// ──  Search bar ─────────────────────────────────
searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (q) loadBooks(q);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const q = searchInput.value.trim();
    if (q) loadBooks(q);
  }
});

// ── Initial load ─────────────────────────────────────────────
loadBooks("popular fiction");