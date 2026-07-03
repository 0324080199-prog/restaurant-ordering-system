// checkout.js manages the checkout modal and prepares order details.
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutButton = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummary = document.getElementById('checkoutSummary');

/**
 * Open the checkout modal and render the current cart summary.
 */
function openCheckout() {
  if (!checkoutModal) return;

  const cartItems = getCartData();
  if (!cartItems || cartItems.length === 0) {
    alert('Your cart is empty. Add items before checking out.');
    return;
  }

  renderCheckoutSummary(cartItems);
  checkoutModal.classList.add('open');
}

/**
 * Close the checkout modal.
 */
function closeCheckout() {
  if (!checkoutModal) return;
  checkoutModal.classList.remove('open');
}

/**
 * Render the order summary inside the checkout modal.
 * @param {Array} items
 */
function renderCheckoutSummary(items) {
  const lines = items.map((item) => {
    return `<div class="summary-row"><span>${item.quantity}x ${item.name}</span><strong>$${(item.price * item.quantity).toFixed(2)}</strong></div>`;
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  checkoutSummary.innerHTML = `
    ${lines.join('')}
    <div class="summary-total"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
  `;
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', openCheckout);
}

if (closeCheckoutButton) {
  closeCheckoutButton.addEventListener('click', closeCheckout);
}

if (checkoutForm) {
  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(checkoutForm);
    const order = {
      customerName: formData.get('customerName'),
      email: formData.get('customerEmail'),
      address: formData.get('customerAddress'),
      payment: formData.get('paymentMethod'),
      items: getCartData(),
      total: getCartData().reduce((sum, item) => sum + item.price * item.quantity, 0),
      date: new Date().toLocaleString(),
    };

    closeCheckout();
    renderReceipt(order);
    clearCart();
    checkoutForm.reset();
  });
}
