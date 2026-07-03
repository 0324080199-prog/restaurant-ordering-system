// cart.js manages the shopping cart state and UI with persistent storage.
const STORAGE_KEY = 'savoryBitesCart';
const DELIVERY_FEE = 4.99;

const cartDrawer = document.getElementById('cartDrawer');
const cartItemsContainer = document.getElementById('cartItems');
const cartSubtotalAmount = document.getElementById('cartSubtotal');
const cartDeliveryAmount = document.getElementById('cartDelivery');
const cartTotalAmount = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutButton = document.getElementById('checkoutButton');

let cart = loadCartFromStorage();

/**
 * Load cart state from Local Storage.
 * @returns {Array<object>} Stored cart items
 */
function loadCartFromStorage() {
  const storedCart = window.localStorage.getItem(STORAGE_KEY);
  if (!storedCart) {
    return [];
  }

  try {
    return JSON.parse(storedCart);
  } catch (error) {
    console.warn('Failed to parse stored cart data:', error);
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Save current cart state to Local Storage.
 */
function saveCartToStorage() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Find an item in the cart by its id.
 * @param {number} id
 * @returns {object|undefined}
 */
function findCartItem(id) {
  return cart.find((item) => item.id === id);
}

/**
 * Calculate the cart subtotal.
 * @returns {number}
 */
function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate the cart grand total including delivery.
 * @returns {number}
 */
function calculateGrandTotal() {
  return calculateSubtotal() + DELIVERY_FEE;
}

/**
 * Update the cart badge count in the header.
 */
function updateCartBadge() {
  cartCount.textContent = String(cart.reduce((sum, item) => sum + item.quantity, 0));
}

/**
 * Render the cart sidebar UI based on current cart state.
 */
function updateCartUI() {
  cartItemsContainer.innerHTML = '';
  cartDeliveryAmount.textContent = `$${DELIVERY_FEE.toFixed(2)}`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty. Add something delicious!</div>';
    cartSubtotalAmount.textContent = '$0.00';
    cartTotalAmount.textContent = '$0.00';
    updateCartBadge();
    return;
  }

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    const cartElement = document.createElement('article');
    cartElement.className = 'cart-item';
    cartElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-content">
        <h4>${item.name}</h4>
        <div class="cart-item-meta">
          <span>$${item.price.toFixed(2)}</span>
          <span>Qty: ${item.quantity}</span>
        </div>
        <div class="cart-item-meta">
          <span>Subtotal: $${itemTotal.toFixed(2)}</span>
          <button class="remove-item" data-id="${item.id}" aria-label="Remove item"><i class="fas fa-trash"></i></button>
        </div>
        <div class="quantity-controls">
          <button class="decrease-qty" data-id="${item.id}" type="button">-</button>
          <span>${item.quantity}</span>
          <button class="increase-qty" data-id="${item.id}" type="button">+</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartElement);
  });

  cartSubtotalAmount.textContent = `$${calculateSubtotal().toFixed(2)}`;
  cartTotalAmount.textContent = `$${calculateGrandTotal().toFixed(2)}`;
  if (checkoutButton) {
    checkoutButton.disabled = cart.length === 0;
  }
  updateCartBadge();
}

/**
 * Add a new item to the cart or increment quantity if it already exists.
 * @param {object} item
 */
function addToCart(item) {
  const existingItem = findCartItem(item.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCartToStorage();
  updateCartUI();
}

/**
 * Remove a cart item entirely by id.
 * @param {number} id
 */
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCartToStorage();
  updateCartUI();
}

/**
 * Change the quantity of a cart item by a delta amount.
 * @param {number} id
 * @param {number} delta
 */
function updateQuantity(id, delta) {
  const item = findCartItem(id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity < 1) {
    removeFromCart(id);
    return;
  }

  saveCartToStorage();
  updateCartUI();
}

/**
 * Clear the entire cart.
 */
function clearCart() {
  cart = [];
  saveCartToStorage();
  updateCartUI();
}

/**
 * Bind actions to add-to-cart buttons and cart controls inside the sidebar.
 */
function bindCartActions() {
  const addButtons = document.querySelectorAll('.add-to-cart');
  addButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = Number(button.dataset.id);
      const itemName = button.dataset.name;
      const itemPrice = Number(button.dataset.price);
      const itemImage = button.dataset.image;
      addToCart({ id: itemId, name: itemName, price: itemPrice, image: itemImage });
    });
  });

  cartItemsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const id = Number(button.dataset.id);
    if (button.classList.contains('remove-item')) {
      removeFromCart(id);
      return;
    }

    if (button.classList.contains('increase-qty')) {
      updateQuantity(id, 1);
      return;
    }

    if (button.classList.contains('decrease-qty')) {
      updateQuantity(id, -1);
      return;
    }
  });

  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      if (cart.length === 0) {
        window.alert('Add items to your cart before checking out.');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
}

/**
 * Initialize the cart functions and render the current state.
 */
function initCart() {
  bindCartActions();
  updateCartUI();
}

initCart();
