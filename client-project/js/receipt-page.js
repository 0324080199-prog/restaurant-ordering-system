// receipt-page.js generates a printable POS-style receipt after checkout.
const receiptNumberEl = document.getElementById('receiptNumber');
const orderNumberEl = document.getElementById('orderNumber');
const receiptDateEl = document.getElementById('receiptDate');
const receiptTimeEl = document.getElementById('receiptTime');
const customerNameEl = document.getElementById('customerName');
const customerPhoneEl = document.getElementById('customerPhone');
const customerAddressEl = document.getElementById('customerAddress');
const receiptItemsEl = document.getElementById('receiptItems');
const receiptSubtotalEl = document.getElementById('receiptSubtotal');
const receiptDeliveryEl = document.getElementById('receiptDelivery');
const receiptDiscountEl = document.getElementById('receiptDiscount');
const receiptTaxEl = document.getElementById('receiptTax');
const receiptGrandTotalEl = document.getElementById('receiptGrandTotal');
const receiptPaymentEl = document.getElementById('receiptPayment');
const receiptStatusEl = document.getElementById('receiptStatus');
const orderTrackerEl = document.getElementById('orderTracker');
const trackerProgressEl = document.getElementById('trackerProgress');
const printReceiptButton = document.getElementById('printReceipt');
const downloadPdfButton = document.getElementById('downloadPdf');
const whatsappButton = document.getElementById('whatsappReceipt');
const whatsappQrCodeEl = document.getElementById('whatsappQrCode');

const DELIVERY_FEE = 4.99;
const DISCOUNT_RATE = 0.05;
const TAX_RATE = 0.08;
const WHATSAPP_NUMBER = '233543379248';

/**
 * Get stored checkout info from Local Storage.
 * @returns {object}
 */
function getReceiptData() {
  const rawOrder = window.localStorage.getItem('savoryBitesReceipt');
  if (!rawOrder) return null;
  try {
    return JSON.parse(rawOrder);
  } catch {
    return null;
  }
}

/**
 * Save order details for receipt generation.
 * @param {object} order
 */
function saveReceiptData(order) {
  window.localStorage.setItem('savoryBitesReceipt', JSON.stringify(order));
}

/**
 * Generate a random receipt or order number.
 * @returns {string}
 */
function generateNumber() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Format a numeric value as currency.
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

/**
 * Compute receipt totals including subtotal, discount, tax, and grand total.
 * @param {number} subtotal
 */
function computeReceiptTotals(subtotal) {
  const discount = subtotal * DISCOUNT_RATE;
  const taxableAmount = subtotal - discount + DELIVERY_FEE;
  const tax = taxableAmount * TAX_RATE;
  const grandTotal = subtotal - discount + DELIVERY_FEE + tax;

  return {
    discount,
    tax,
    grandTotal,
  };
}

/**
 * Render the receipt content using order data.
 * @param {object} order
 */
function renderReceipt(order) {
  const now = new Date(order.timestamp || Date.now());
  receiptNumberEl.textContent = order.receiptNumber || generateNumber();
  orderNumberEl.textContent = order.orderNumber || generateNumber();
  receiptDateEl.textContent = now.toLocaleDateString();
  receiptTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  customerNameEl.textContent = order.customerName;
  customerPhoneEl.textContent = order.customerPhone;
  customerAddressEl.textContent = order.customerAddress;
  receiptPaymentEl.textContent = order.paymentMethod;
  receiptStatusEl.textContent = order.status || 'Pending';
  updateOrderTracker(order.status || 'Pending');

  receiptItemsEl.innerHTML = '';
  let subtotal = 0;

  order.items.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const itemRow = document.createElement('div');
    itemRow.className = 'receipt-item';
    itemRow.innerHTML = `
      <span>${item.quantity}</span>
      <div>
        <p>${item.name}</p>
      </div>
      <span>${formatCurrency(lineTotal)}</span>
    `;
    receiptItemsEl.appendChild(itemRow);
  });

  const totals = computeReceiptTotals(subtotal);
  receiptSubtotalEl.textContent = formatCurrency(subtotal);
  receiptDeliveryEl.textContent = formatCurrency(DELIVERY_FEE);
  receiptDiscountEl.textContent = formatCurrency(totals.discount);
  receiptTaxEl.textContent = formatCurrency(totals.tax);
  receiptGrandTotalEl.textContent = formatCurrency(totals.grandTotal);
}

/**
 * Animate tracker progress between lifecycle stages.
 * @param {string} status
 */
function updateOrderTracker(status) {
  if (!orderTrackerEl || !trackerProgressEl) return;

  const stages = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];
  const activeIndex = Math.max(stages.indexOf(status.toLowerCase()), 0);
  const progressPercent = Math.round((activeIndex / (stages.length - 1)) * 100);

  trackerProgressEl.style.width = `${progressPercent}%`;
  trackerProgressEl.setAttribute('aria-valuenow', String(progressPercent));

  const stageCards = orderTrackerEl.querySelectorAll('.tracker-stage');
  stageCards.forEach((stageCard, index) => {
    const stageName = stageCard.dataset.stage;
    const isActive = index <= activeIndex;
    stageCard.classList.toggle('active', isActive);

    if (isActive) {
      stageCard.classList.add('pulse');
      stageCard.addEventListener(
        'animationend',
        () => stageCard.classList.remove('pulse'),
        { once: true }
      );
    }
  });
}

/**
 * Print the receipt using the browser print dialog.
 */
function printReceipt() {
  window.print();
}

/**
 * Mock download PDF action by opening the print dialog for PDF selection.
 */
function downloadPdf() {
  window.print();
}

/**
 * Build a WhatsApp message string from the receipt details.
 * @param {object} order
 * @returns {string}
 */
function buildWhatsAppMessage(order) {
  const lines = [
    'Savory Bites Receipt',
    `Receipt: ${order.receiptNumber}`,
    `Order: ${order.orderNumber}`,
    '',
    'Customer details:',
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Address: ${order.customerAddress}`,
    '',
    'Ordered items:',
  ];

  order.items.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    lines.push(`${item.quantity}x ${item.name} - ${formatCurrency(lineTotal)}`);
  });

  lines.push('', `Subtotal: ${formatCurrency(order.subtotal)}`);
  lines.push(`Delivery Fee: ${formatCurrency(order.deliveryFee)}`);
  lines.push(`Discount: ${formatCurrency(order.discount)}`);
  lines.push(`Tax: ${formatCurrency(order.tax)}`);
  lines.push(`Total: ${formatCurrency(order.grandTotal)}`);
  lines.push('', `Payment: ${order.paymentMethod}`);
  lines.push(`Status: ${order.status || 'Confirmed'}`);

  return encodeURIComponent(lines.join('\n'));
}

/**
 * Open WhatsApp in a new browser tab with the receipt details.
 */
function sendToWhatsApp() {
  const order = getReceiptData();
  if (!order) return;

  const encodedMessage = buildWhatsAppMessage(order);
  const whatsappNumber = WHATSAPP_NUMBER;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}

/**
 * Render a WhatsApp QR code for the receipt page.
 */
function renderWhatsAppQrCode() {
  if (!whatsappQrCodeEl) return;
  const url = `https://wa.me/${WHATSAPP_NUMBER}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  whatsappQrCodeEl.src = qrCodeUrl;
  whatsappQrCodeEl.alt = 'Scan to message us on WhatsApp';
}

/**
 * Initialize receipt page interactions.
 */
function initReceiptPage() {
  const order = getReceiptData();
  if (!order) {
    receiptItemsEl.innerHTML = '<p>No receipt data available.</p>';
    return;
  }

  renderReceipt(order);

  if (printReceiptButton) {
    printReceiptButton.addEventListener('click', printReceipt);
  }

  if (downloadPdfButton) {
    downloadPdfButton.addEventListener('click', downloadPdf);
  }

  if (whatsappButton) {
    whatsappButton.addEventListener('click', sendToWhatsApp);
  }

  renderWhatsAppQrCode();
}

initReceiptPage();
