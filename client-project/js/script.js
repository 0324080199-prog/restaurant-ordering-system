// script.js holds general page interactions and cart drawer control.
const cartToggle = document.getElementById('cartToggle');
const closeCartButton = document.getElementById('closeCart');
const cartDrawer = document.getElementById('cartDrawer');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenuButton = document.getElementById('closeMobileMenu');
let activeCategory = 'all';

/**
 * Open the shopping cart drawer.
 */
function openCart() {
  cartDrawer.classList.add('open');
}

/**
 * Close the shopping cart drawer.
 */
function closeCart() {
  cartDrawer.classList.remove('open');
}

cartToggle.addEventListener('click', openCart);
closeCartButton.addEventListener('click', closeCart);

if (navToggle) {
  navToggle.addEventListener('click', () => {
    if (mobileMenu) {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
    }
  });
}

if (closeMobileMenuButton) {
  closeMobileMenuButton.addEventListener('click', () => {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

if (mobileMenu) {
  mobileMenu.addEventListener('click', (event) => {
    if (event.target === mobileMenu) {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

/**
 * Return the searchable text for a menu card.
 * @param {HTMLElement} card
 * @returns {string}
 */
function getMenuCardText(card) {
  const title = card.querySelector('h3')?.textContent || '';
  const category = card.querySelector('.menu-card-tag')?.textContent || '';
  const description = card.querySelector('.menu-card-content > p')?.textContent || card.querySelector('p')?.textContent || '';
  return `${title} ${category} ${description}`.toLowerCase();
}

/**
 * Get favorite meal IDs from Local Storage.
 * @returns {string[]}
 */
function getFavoriteIds() {
  const stored = window.localStorage.getItem('savoryBitesFavorites');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save favorite meal IDs to Local Storage.
 * @param {string[]} ids
 */
function saveFavoriteIds(ids) {
  window.localStorage.setItem('savoryBitesFavorites', JSON.stringify(ids));
}

/**
 * Update the favorites count displayed in the header.
 */
function updateFavoriteCount() {
  const countEl = document.getElementById('favoriteCount');
  if (!countEl) return;
  countEl.textContent = String(getFavoriteIds().length);
}

/**
 * Update the heart icon state for a favorite button.
 * @param {HTMLButtonElement} button
 * @param {boolean} active
 */
function updateFavoriteButtonState(button, active) {
  button.classList.toggle('active', active);
  const icon = button.querySelector('i');
  if (icon) {
    icon.className = active ? 'fas fa-heart' : 'far fa-heart';
  }
}

/**
 * Animate the favorite heart when clicked.
 * @param {HTMLButtonElement} button
 */
function animateHeart(button) {
  button.classList.add('animate');
  button.addEventListener(
    'animationend',
    () => {
      button.classList.remove('animate');
    },
    { once: true }
  );
}

/**
 * Toggle the favorite meal state for a menu card.
 * @param {MouseEvent} event
 */
function toggleFavorite(event) {
  const button = event.currentTarget;
  const card = button.closest('.menu-card');
  if (!card) return;

  const menuId = card.dataset.menuId;
  if (!menuId) return;

  const favorites = getFavoriteIds();
  const index = favorites.indexOf(menuId);
  const isActive = index !== -1;

  if (isActive) {
    favorites.splice(index, 1);
  } else {
    favorites.push(menuId);
  }

  saveFavoriteIds(favorites);
  updateFavoriteButtonState(button, !isActive);
  updateFavoriteCount();
  animateHeart(button);
}

/**
 * Create a favorite button for a menu card.
 * @param {string} menuId
 * @returns {HTMLButtonElement}
 */
function createFavoriteButton(menuId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'favorite-button';
  button.dataset.menuId = menuId;
  button.setAttribute('aria-label', 'Favorite meal');
  button.innerHTML = '<i class="far fa-heart"></i>';
  button.addEventListener('click', toggleFavorite);
  return button;
}

/**
 * Initialize favorite buttons on all menu cards.
 */
function setupFavorites() {
  const favorites = getFavoriteIds();
  const cards = document.querySelectorAll('.menu-card');

  cards.forEach((card) => {
    const addButton = card.querySelector('.add-to-cart');
    const menuId = addButton?.dataset.id || card.dataset.menuId;
    if (!menuId) return;

    card.dataset.menuId = menuId;
    let favoriteButton = card.querySelector('.favorite-button');

    if (!favoriteButton) {
      favoriteButton = createFavoriteButton(menuId);
      const content = card.querySelector('.menu-card-content');
      if (!content) return;

      const topRow = document.createElement('div');
      topRow.className = 'menu-card-top';
      const tag = content.querySelector('.menu-card-tag');
      if (tag) {
        topRow.appendChild(tag);
      }
      topRow.appendChild(favoriteButton);
      content.prepend(topRow);
    }

    updateFavoriteButtonState(favoriteButton, favorites.includes(menuId));
  });

  updateFavoriteCount();
}

/**
 * Determine whether the menu card matches the selected category filter.
 * @param {HTMLElement} card
 * @param {string} category
 * @returns {boolean}
 */
function categoryMatches(card, category) {
  if (category === 'all') return true;
  const text = getMenuCardText(card);

  switch (category) {
    case 'burger':
      return text.includes('burger');
    case 'pizza':
      return text.includes('pizza');
    case 'rice':
      return text.includes('rice');
    case 'drinks':
      return text.includes('drink') || text.includes('tea') || text.includes('coffee');
    case 'desserts':
      return text.includes('dessert') || text.includes('cake') || text.includes('mousse');
    default:
      return false;
  }
}

/**
 * Set the active category and refresh the menu results.
 * @param {string} category
 */
function setActiveCategory(category) {
  activeCategory = category;
  const buttons = document.querySelectorAll('.menu-filter-button');
  buttons.forEach((button) => {
    button.classList.toggle('active', button.dataset.category === category);
  });

  const searchInput = document.getElementById('menuSearch');
  filterMenuCards(searchInput ? searchInput.value : '');
}

/**
 * Filter the menu cards by query and category.
 * @param {string} query
 */
function filterMenuCards(query) {
  const normalized = query.trim().toLowerCase();
  const cards = Array.from(document.querySelectorAll('.menu-card'));
  let matchCount = 0;

  cards.forEach((card) => {
    const text = getMenuCardText(card);
    const matchesSearch = !normalized || text.includes(normalized);
    const matchesCategory = categoryMatches(card, activeCategory);
    const visible = matchesSearch && matchesCategory;

    card.style.display = visible ? '' : 'none';
    if (visible) matchCount += 1;
  });

  const noResults = document.getElementById('menuSearchNoResults');
  if (noResults) {
    noResults.style.display = matchCount === 0 ? 'block' : 'none';
  }
}

/**
 * Attach live-search listeners to the menu search input.
 */
function setupMenuSearch() {
  const searchInput = document.getElementById('menuSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    filterMenuCards(event.target.value);
  });

  filterMenuCards(searchInput.value);
}

/**
 * Attach menu category button handlers.
 */
function setupMenuFilters() {
  const filters = document.getElementById('menuFilters');
  if (!filters) return;

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('.menu-filter-button');
    if (!button) return;
    setActiveCategory(button.dataset.category);
  });
}

/**
 * Initialize page features.
 */
function initPage() {
  bindCartActions();
  setupMenuFilters();
  setupMenuSearch();
  setupFavorites();

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Thank you! Your message has been received.');
      contactForm.reset();
    });
  }
}

initPage();
