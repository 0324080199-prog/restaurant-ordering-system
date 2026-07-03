// menu.js handles the menu data and renders menu cards dynamically.
const menuItems = [
  {
    id: 1,
    name: 'Herb Roasted Chicken',
    description: 'Juicy chicken served with seasonal vegetables and garlic jus.',
    price: 18.99,
    image: 'images/food/menu-1.svg',
  },
  {
    id: 2,
    name: 'Mediterranean Salmon',
    description: 'Fresh salmon fillet, lemon butter, and herb quinoa.',
    price: 21.5,
    image: 'images/food/menu-2.svg',
  },
  {
    id: 3,
    name: 'Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms and parmesan.',
    price: 16.75,
    image: 'images/food/menu-3.svg',
  },
  {
    id: 4,
    name: 'Spicy Tuna Roll',
    description: 'Sushi roll with spicy tuna, avocado, and crispy tempura.',
    price: 14.5,
    image: 'images/food/menu-4.svg',
  },
  {
    id: 5,
    name: 'Beef Wellington',
    description: 'Classic beef fillet wrapped in puff pastry with mushroom duxelles.',
    price: 29.0,
    image: 'images/food/menu-5.svg',
  },
  {
    id: 6,
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center and vanilla gelato.',
    price: 9.95,
    image: 'images/food/menu-6.svg',
  }
];

function renderMenu() {
  const menuGrid = document.getElementById('menuGrid');
  if (!menuGrid) return;

  menuGrid.innerHTML = menuItems
    .map((item) => {
      return `
      <article class="menu-card">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <div class="price-row">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="btn btn-secondary add-button" data-id="${item.id}">Add to Cart</button>
        </div>
      </article>
      `;
    })
    .join('');
}

renderMenu();
