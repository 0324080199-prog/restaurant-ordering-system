// checkout-page.js validates checkout form input and renders order summary.
const checkoutForm = document.getElementById('checkoutForm');
const orderSummary = document.getElementById('orderSummary');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryTotal = document.getElementById('summaryTotal');
const formStatus = document.getElementById('formStatus');

/**
 * Retrieve cart state from Local Storage.
 * @returns {Array<object>}
 */
function getCheckoutCart() {
  const storedCart = window.localStorage.getItem('savoryBitesCart');
  if (!storedCart) return [];
  try {
    return JSON.parse(storedCart);
  } catch {
    return [];
  }
}

/**
 * Render the order summary list on the checkout page.
 */
function renderOrderSummary() {
  const cart = getCheckoutCart();
  orderSummary.innerHTML = '';

  if (cart.length === 0) {
    orderSummary.innerHTML = '<p class="empty-cart">No items in cart. Please add menu items before checking out.</p>';
    summarySubtotal.textContent = '$0.00';
    summaryTotal.textContent = '$0.00';
    return;
  }

  let subtotal = 0;
  cart.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const line = document.createElement('div');
    line.className = 'summary-line';
    line.innerHTML = `
      <div>
        <strong>${item.quantity}x ${item.name}</strong>
        <p>${item.quantity} x $${item.price.toFixed(2)}</p>
      </div>
      <span>$${lineTotal.toFixed(2)}</span>
    `;
    orderSummary.appendChild(line);
  });

  summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
  summaryTotal.textContent = `$${(subtotal + 4.99).toFixed(2)}`;
}

/**
 * Display a validation error message for a field.
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field
 * @param {string} message
 */
function setFieldError(field, message) {
  const errorElement = document.getElementById(`${field.id}Error`);
  field.classList.add('field-invalid');
  if (errorElement) {
    errorElement.textContent = message;
  }
}

/**
 * Clear validation message for a field.
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field
 */
function clearFieldError(field) {
  const errorElement = document.getElementById(`${field.id}Error`);
  field.classList.remove('field-invalid');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

/**
 * Validate the checkout form fields and return validation state.
 * @returns {boolean}
 */
function validateCheckoutForm() {
  const customerName = document.getElementById('customerName');
  const phoneNumber = document.getElementById('phoneNumber');
  const deliveryAddress = document.getElementById('deliveryAddress');
  const paymentMethod = document.getElementById('paymentMethod');
  const specialInstructions = document.getElementById('specialInstructions');
  const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');

  let isValid = true;

  [customerName, phoneNumber, deliveryAddress, paymentMethod, specialInstructions].forEach(clearFieldError);
  document.getElementById('deliveryError').textContent = '';

  if (!customerName.value.trim()) {
    setFieldError(customerName, 'Customer name is required.');
    isValid = false;
  }

  if (!phoneNumber.value.trim()) {
    setFieldError(phoneNumber, 'Phone number is required.');
    isValid = false;
  } else if (!/^\+?[0-9()\-\s]{7,20}$/.test(phoneNumber.value.trim())) {
    setFieldError(phoneNumber, 'Enter a valid phone number.');
    isValid = false;
  }

  if (!deliveryAddress.value.trim()) {
    setFieldError(deliveryAddress, 'Delivery address is required.');
    isValid = false;
  }

  if (!paymentMethod.value) {
    setFieldError(paymentMethod, 'Payment method is required.');
    isValid = false;
  }

  if (!specialInstructions.value.trim()) {
    setFieldError(specialInstructions, 'Please add special instructions or type none.');
    isValid = false;
  }

  if (!deliveryOption) {
    document.getElementById('deliveryError').textContent = 'Please choose a delivery option.';
    isValid = false;
  }

  return isValid;
}

/**
 * Reset the checkout status message.
 */
function clearFormStatus() {
  formStatus.textContent = '';
  formStatus.className = 'form-status';
}

/**
 * Show a success message when validation passes.
 * @param {string} message
 */
function showSuccess(message) {
  formStatus.textContent = message;
  formStatus.className = 'form-status success';
}

/**
 * Show an error message when validation fails.
 * @param {string} message
 */
function showError(message) {
  formStatus.textContent = message;
  formStatus.className = 'form-status error';
}

/**
 * Generate a random 6-digit identifier.
 * @returns {string}
 */
function generateNumber() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Save the order to Local Storage for receipt generation.
 * @param {object} order
 */
function saveReceiptData(order) {
  window.localStorage.setItem('savoryBitesReceipt', JSON.stringify(order));
}

/**
 * Build the receipt order object from form values and cart items.
 * @returns {object|null}
 */
function buildReceiptOrder() {
  const cart = getCheckoutCart();
  if (!cart.length) {
    return null;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
  const customerName = document.getElementById('customerName').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;
  const specialInstructions = document.getElementById('specialInstructions').value.trim();

  const discount = subtotal * 0.05;
  const taxableAmount = subtotal - discount + 4.99;
  const tax = taxableAmount * 0.08;
  const grandTotal = subtotal - discount + 4.99 + tax;

  return {
    receiptNumber: generateNumber(),
    orderNumber: generateNumber(),
    timestamp: Date.now(),
    customerName,
    customerPhone: phoneNumber,
    customerAddress: deliveryAddress,
    paymentMethod,
    deliveryOption: deliveryOption ? deliveryOption.value : 'delivery',
    specialInstructions,
    items: cart,
    subtotal,
    deliveryFee: 4.99,
    discount,
    tax,
    grandTotal,
    status: 'Confirmed',
  };
}

if (checkoutForm) {
  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFormStatus();

    if (!validateCheckoutForm()) {
      showError('Please fix the highlighted fields before continuing.');
      return;
    }

    const order = buildReceiptOrder();
    if (!order) {
      showError('Your cart is empty. Please add items before checking out.');
      return;
    }

    saveReceiptData(order);
    showSuccess('Order validated. Redirecting to receipt...');
    window.setTimeout(() => {
      window.location.href = 'receipt.html';
    }, 700);
  });
}

renderOrderSummary();
