// admin.js handles the admin dashboard login, menu management, and orders overview.
const loginForm = document.getElementById('loginForm');
const adminLogin = document.getElementById('adminLogin');
const adminDashboard = document.getElementById('adminDashboard');
const loginError = document.getElementById('loginError');
const sidebarNav = document.getElementById('sidebarNav');
const logoutButton = document.getElementById('logoutButton');
const openAddFoodButton = document.getElementById('openAddFood');
const foodFormCard = document.getElementById('foodFormCard');
const foodForm = document.getElementById('foodForm');
const foodFormTitle = document.getElementById('foodFormTitle');
const foodIdInput = document.getElementById('foodId');
const foodNameInput = document.getElementById('foodName');
const foodCategoryInput = document.getElementById('foodCategory');
const foodPriceInput = document.getElementById('foodPrice');
const foodDescriptionInput = document.getElementById('foodDescription');
const foodImageInput = document.getElementById('foodImage');
const cancelFoodButton = document.getElementById('cancelFood');
const menuTableBody = document.querySelector('#menuTable tbody');
const ordersTableBody = document.querySelector('#ordersTable tbody');
const cardTotalOrders = document.getElementById('cardTotalOrders');
const cardPendingOrders = document.getElementById('cardPendingOrders');
const revenueTotal = document.getElementById('revenueTotal');
const customerCount = document.getElementById('customerCount');
const totalOrdersStat = document.getElementById('totalOrders');
const pendingOrdersStat = document.getElementById('pendingOrders');
const statOrders = document.getElementById('statOrders');
const statRevenue = document.getElementById('statRevenue');
const statPending = document.getElementById('statPending');
const statCustomers = document.getElementById('statCustomers');
const sectionPanels = document.querySelectorAll('.section-panel');

const adminCredentials = {
  username: 'admin',
  password: 'password123',
};

const STORAGE_MENU_KEY = 'savoryBitesAdminMenu';
const STORAGE_ORDERS_KEY = 'savoryBitesAdminOrders';

const defaultMenu = [
  { id: 1, name: 'Jollof Rice & Grilled Chicken', category: 'Rice', price: 18.99, description: 'Smoky tomato rice paired with seasoned grilled chicken and fried plantain.', image: 'images/food/menu-1.svg' },
  { id: 2, name: 'Waakye Bowl', category: 'Rice', price: 21.5, description: 'Rice and beans served with fried fish, boiled egg, gari, and spicy shito.', image: 'images/food/menu-2.svg' },
  { id: 3, name: 'Banku & Grilled Tilapia', category: 'Seafood', price: 16.75, description: 'Fermented corn and cassava dough served with pepper sauce and grilled tilapia.', image: 'images/food/menu-3.svg' },
  { id: 4, name: 'Spicy Kelewele', category: 'Snacks', price: 14.5, description: 'Sweet plantains fried with ginger, chili, nutmeg, and a touch of cloves.', image: 'images/food/menu-4.svg' },
  { id: 5, name: 'Chinchinga Skewers', category: 'Street Food', price: 29.0, description: 'Pepper-spiced skewers grilled to perfection and served with fresh onions.', image: 'images/food/menu-5.svg' },
  { id: 6, name: 'Cocoa Banana Fudge', category: 'Desserts', price: 9.95, description: 'Rich Ghanaian cocoa fudge topped with caramelized banana and toasted nuts.', image: 'images/food/menu-6.svg' },
];

const defaultOrders = [
  { id: 101, customer: 'Jane Doe', status: 'Pending', total: 69.44, date: '2026-07-03' },
  { id: 102, customer: 'Mark Brown', status: 'Accepted', total: 42.90, date: '2026-07-02' },
  { id: 103, customer: 'Lucy Gray', status: 'Preparing', total: 28.50, date: '2026-07-01' },
  { id: 104, customer: 'Daniel K.', status: 'Ready', total: 34.20, date: '2026-06-30' },
  { id: 105, customer: 'Ava White', status: 'Delivered', total: 74.90, date: '2026-06-29' },
];

function getStoredMenu() {
  const raw = window.localStorage.getItem(STORAGE_MENU_KEY);
  if (!raw) return defaultMenu;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultMenu;
  }
}

function saveMenu(menu) {
  window.localStorage.setItem(STORAGE_MENU_KEY, JSON.stringify(menu));
}

function getStoredOrders() {
  const raw = window.localStorage.getItem(STORAGE_ORDERS_KEY);
  if (!raw) return defaultOrders;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultOrders;
  }
}

function saveOrders(orders) {
  window.localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
}

function setActiveSection(targetId) {
  sectionPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === targetId);
  });

  const buttons = sidebarNav.querySelectorAll('.nav-item');
  buttons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === targetId);
  });
}

function renderMenuTable() {
  const menu = getStoredMenu();
  menuTableBody.innerHTML = menu
    .map((item) => {
      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.description}</td>
          <td>
            <button class="action-edit" data-id="${item.id}">Edit</button>
            <button class="action-delete" data-id="${item.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderOrdersTable() {
  const orders = getStoredOrders();
  ordersTableBody.innerHTML = orders
    .map((order) => {
      return `
        <tr>
          <td>#${order.id}</td>
          <td>${order.customer}</td>
          <td>${order.status}</td>
          <td>$${order.total.toFixed(2)}</td>
          <td>${order.date}</td>
        </tr>
      `;
    })
    .join('');
}

function renderSummaryCards() {
  const orders = getStoredOrders();
  const menu = getStoredMenu();
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === 'Pending').length;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const customers = new Set(orders.map((order) => order.customer)).size;

  cardTotalOrders.textContent = totalOrders;
  cardPendingOrders.textContent = pendingOrders;
  revenueTotal.textContent = `$${revenue.toFixed(2)}`;
  customerCount.textContent = customers;
  totalOrdersStat.textContent = totalOrders;
  pendingOrdersStat.textContent = pendingOrders;
  statOrders.textContent = totalOrders;
  statRevenue.textContent = `$${revenue.toFixed(2)}`;
  statPending.textContent = pendingOrders;
  statCustomers.textContent = customers;
}

function resetFoodForm() {
  foodIdInput.value = '';
  foodNameInput.value = '';
  foodCategoryInput.value = '';
  foodPriceInput.value = '';
  foodDescriptionInput.value = '';
  foodImageInput.value = '';
  foodFormTitle.textContent = 'Add Food Item';
}

function openFoodForm(editItem) {
  foodFormCard.scrollIntoView({ behavior: 'smooth' });
  if (editItem) {
    foodFormTitle.textContent = 'Edit Food Item';
    foodIdInput.value = editItem.id;
    foodNameInput.value = editItem.name;
    foodCategoryInput.value = editItem.category;
    foodPriceInput.value = editItem.price;
    foodDescriptionInput.value = editItem.description;
    foodImageInput.value = editItem.image;
  } else {
    resetFoodForm();
  }
}

function handleMenuAction(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const menuId = Number(button.dataset.id);
  const menu = getStoredMenu();

  if (button.classList.contains('action-edit')) {
    const item = menu.find((entry) => entry.id === menuId);
    if (item) openFoodForm(item);
  }

  if (button.classList.contains('action-delete')) {
    const updatedMenu = menu.filter((entry) => entry.id !== menuId);
    saveMenu(updatedMenu);
    renderMenuTable();
    renderSummaryCards();
  }
}

function handleFoodSubmit(event) {
  event.preventDefault();

  const menu = getStoredMenu();
  const id = foodIdInput.value ? Number(foodIdInput.value) : Date.now();
  const newItem = {
    id,
    name: foodNameInput.value.trim(),
    category: foodCategoryInput.value.trim(),
    price: Number(foodPriceInput.value),
    description: foodDescriptionInput.value.trim(),
    image: foodImageInput.value.trim() || 'images/food/menu-1.svg',
  };

  if (!newItem.name || !newItem.category || !newItem.price) return;

  const existingIndex = menu.findIndex((entry) => entry.id === id);
  if (existingIndex >= 0) {
    menu[existingIndex] = newItem;
  } else {
    menu.push(newItem);
  }

  saveMenu(menu);
  renderMenuTable();
  resetFoodForm();
}

function authenticateAdmin(event) {
  event.preventDefault();

  const username = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value.trim();

  if (username === adminCredentials.username && password === adminCredentials.password) {
    adminLogin.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    loginError.textContent = '';
    renderSummaryCards();
    renderMenuTable();
    renderOrdersTable();
    setActiveSection('dashboardSection');
  } else {
    loginError.textContent = 'Invalid username or password.';
  }
}

function bindSidebarNavigation() {
  sidebarNav.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-item');
    if (!button) return;
    setActiveSection(button.dataset.target);
  });
}

function bindEvents() {
  loginForm.addEventListener('submit', authenticateAdmin);
  logoutButton.addEventListener('click', () => {
    adminDashboard.classList.add('hidden');
    adminLogin.classList.remove('hidden');
    resetFoodForm();
  });
  openAddFoodButton.addEventListener('click', () => openFoodForm(null));
  cancelFoodButton.addEventListener('click', resetFoodForm);
  foodForm.addEventListener('submit', handleFoodSubmit);
  menuTableBody.addEventListener('click', handleMenuAction);
  bindSidebarNavigation();
}

bindEvents();
