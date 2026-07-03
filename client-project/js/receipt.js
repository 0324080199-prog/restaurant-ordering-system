// receipt.js creates a simple receipt interface after a successful checkout.
const receiptModal = document.getElementById('receiptModal');
const receiptContent = document.getElementById('receiptContent');
const closeReceiptButton = document.getElementById('closeReceipt');

/**
 * Render the receipt with order details.
 * @param {Object} order
 */
function renderReceipt(order) {
  const itemRows = order.items
    .map((item) => `<li>${item.quantity} × ${item.name} <span>$${(item.price * item.quantity).toFixed(2)}</span></li>`)
    .join('');

  receiptContent.innerHTML = `
    <div class="receipt-header">
      <h2>Order Confirmed</h2>
      <p>Thank you, ${order.customerName}! Your delicious meal is on the way.</p>
    </div>
    <div class="receipt-details">
      <p><strong>Order Date:</strong> ${order.date}</p>
      <p><strong>Delivery:</strong> ${order.address}</p>
      <p><strong>Payment:</strong> ${order.payment}</p>
    </div>
    <ul class="receipt-items">
      ${itemRows}
    </ul>
    <div class="receipt-total">
      <span>Total Paid</span>
      <strong>$${order.total.toFixed(2)}</strong>
    </div>
  `;

  receiptModal.classList.add('open');
}

function closeReceipt() {
  receiptModal.classList.remove('open');
}

if (closeReceiptButton) {
  closeReceiptButton.addEventListener('click', closeReceipt);
}
