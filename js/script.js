/**
 * CampusCart - Student Shopping Store
 * Main Application Logic & Cart Operations
 */

// Storage Keys
const CART_STORAGE_KEY = 'campuscart_cart';
const LAST_ORDER_KEY = 'campuscart_latest_order';

// Cart State Management
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateNavCartBadge();
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }));
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
}

function getCartTotals() {
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  // Free delivery for orders >= ₹499
  const shipping = (subtotal === 0 || subtotal >= 499) ? 0 : 49;
  const total = subtotal + shipping;
  return { count, subtotal, shipping, total };
}

function addToCart(productId, quantity = 1, showFeedback = true) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', true);
    return;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      quantity: quantity
    });
  }

  saveCart(cart);

  if (showFeedback) {
    showToast(`✓ Added ${quantity} × ${product.name} to cart! <a href="cart.html">View Cart</a>`);
  }
}

function updateCartItemQuantity(productId, newQty) {
  const qty = parseInt(newQty, 10);
  let cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === productId);

  if (itemIndex === -1) return;

  if (qty <= 0) {
    removeCartItem(productId);
    return;
  }

  cart[itemIndex].quantity = qty;
  saveCart(cart);
}

function removeCartItem(productId) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  if (item) {
    showToast(`Removed "${item.name}" from your cart.`);
  }
}

function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateNavCartBadge();
}

function updateNavCartBadge() {
  const totals = getCartTotals();
  const badges = document.querySelectorAll('.cart-count');
  badges.forEach(badge => {
    badge.textContent = totals.count;
    badge.style.display = totals.count > 0 ? 'inline-flex' : 'none';
  });
}

// Toast Notifications
function showToast(messageHtml, isError = false) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <span>${messageHtml}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

// Setup Header Navigation on Every Page
function setupNavigation() {
  updateNavCartBadge();

  // Mobile drawer toggle
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });
  }

  // Header scroll subtle shadow
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

// Product Card HTML Generator
function createProductCardHTML(product) {
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return `
    <article class="product-card" data-id="${product.id}">
      <a href="product-details.html?id=${product.id}" class="product-thumb-link" aria-label="View ${product.name}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="product-badge-overlay">${discountPercent}% OFF</span>
      </a>
      <div class="product-card-body">
        <div class="product-meta">
          <span class="product-category">${product.category}</span>
          <span class="product-rating">★ ${product.rating.toFixed(1)}</span>
        </div>
        <h3 class="product-title">
          <a href="product-details.html?id=${product.id}">${product.name}</a>
        </h3>
        <p class="product-description-snippet">${product.description}</p>
        <div class="product-price-row">
          <span class="product-price tabular-nums">${formatPrice(product.price)}</span>
          <span class="product-old-price tabular-nums">${formatPrice(product.originalPrice)}</span>
          <span class="product-discount">${discountPercent}% off</span>
        </div>
        <div class="product-actions">
          <button type="button" class="btn btn-primary btn-sm add-to-cart-btn" data-id="${product.id}">
            🛒 Add to Cart
          </button>
          <a href="product-details.html?id=${product.id}" class="btn btn-secondary btn-sm">
            Details
          </a>
        </div>
      </div>
    </article>
  `;
}

// Bind Global Add-to-Cart Buttons
function bindAddToCartButtons(container) {
  const root = container || document;
  const buttons = root.querySelectorAll('.add-to-cart-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'), 10);
      addToCart(id, 1, true);
    });
  });
}

// -----------------------------------------------------------------------------
// Page-Specific Logic
// -----------------------------------------------------------------------------

// 1. Home Page (index.html)
function initHomePage() {
  const featuredGrid = document.getElementById('featured-products-grid');
  if (featuredGrid) {
    const featured = getFeaturedProducts().slice(0, 4);
    featuredGrid.innerHTML = featured.map(p => createProductCardHTML(p)).join('');
    bindAddToCartButtons(featuredGrid);
  }
}

// 2. Shop / Products Page (products.html)
function initProductsPage() {
  const grid = document.getElementById('products-grid');
  const searchInput = document.getElementById('product-search');
  const sortSelect = document.getElementById('product-sort');
  const filterChipsContainer = document.getElementById('category-filter-chips');
  const countDisplay = document.getElementById('products-count');

  if (!grid) return;

  // Read URL params for pre-filter
  const urlParams = new URLSearchParams(window.location.search);
  let activeCategory = urlParams.get('category') || 'All';
  let searchTerm = urlParams.get('search') || '';

  if (searchInput && searchTerm) {
    searchInput.value = searchTerm;
  }

  // Render Category Filter Chips
  if (filterChipsContainer) {
    const categories = getAllCategories();
    filterChipsContainer.innerHTML = categories.map(cat => `
      <button type="button" class="filter-chip ${cat.toLowerCase() === activeCategory.toLowerCase() ? 'active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `).join('');

    const chips = filterChipsContainer.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.getAttribute('data-category');
        applyFiltersAndRender();
      });
    });
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFiltersAndRender();
    });
  }

  // Sort dropdown handler
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFiltersAndRender();
    });
  }

  function applyFiltersAndRender() {
    let filtered = PRODUCTS.filter(p => {
      const matchCat = (activeCategory === 'All') || (p.category.toLowerCase() === activeCategory.toLowerCase());
      const matchSearch = (!searchTerm) || 
        p.name.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    const sortValue = sortSelect ? sortSelect.value : 'default';
    if (sortValue === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} of ${PRODUCTS.length} products`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>No products found</h3>
          <p>We couldn't find any products matching "${searchTerm || activeCategory}". Try a different keyword or category.</p>
          <button type="button" class="btn btn-secondary" id="reset-filters-btn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchTerm = '';
          activeCategory = 'All';
          const chips = filterChipsContainer.querySelectorAll('.filter-chip');
          chips.forEach(c => c.classList.remove('active'));
          chips[0]?.classList.add('active');
          if (sortSelect) sortSelect.value = 'default';
          applyFiltersAndRender();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
    bindAddToCartButtons(grid);
  }

  applyFiltersAndRender();
}

// 3. Product Details Page (product-details.html)
function initProductDetailsPage() {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || '1';
  const product = getProductById(productId);

  if (!product) {
    container.innerHTML = `
      <div class="empty-state" style="margin: 40px auto; max-width: 600px;">
        <h3>Product Not Found</h3>
        <p>The product you are looking for does not exist or may have been discontinued.</p>
        <a href="products.html" class="btn btn-primary">Return to Shop</a>
      </div>
    `;
    return;
  }

  // Update Page Title
  document.title = `${product.name} | CampusCart`;

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  container.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="products.html">Shop</a>
      <span>/</span>
      <a href="products.html?category=${encodeURIComponent(product.category)}">${product.category}</a>
      <span>/</span>
      <span style="color: var(--text-main); font-weight: 600;">${product.name}</span>
    </nav>

    <div class="product-detail-layout">
      <!-- Left: Large Image Gallery -->
      <div class="product-gallery-container">
        <div class="product-main-image-frame">
          <img src="${product.image}" alt="${product.name}" id="detail-main-img" />
        </div>
      </div>

      <!-- Right: Product Info & Purchase Module -->
      <div class="product-detail-info">
        <div class="detail-category-tag">${product.category}</div>
        <h1 class="detail-title">${product.name}</h1>

        <div class="detail-rating-row">
          <span class="product-rating" style="font-size: 1rem;">★ ${product.rating.toFixed(1)}</span>
          <span style="color: var(--text-muted);">·</span>
          <span style="color: var(--text-muted);">${product.reviewsCount} verified student ratings</span>
          <span style="color: var(--text-muted);">·</span>
          <span style="color: var(--accent-green); font-weight: 700;">✓ In Stock</span>
        </div>

        <div class="detail-price-box">
          <span class="detail-current-price tabular-nums">${formatPrice(product.price)}</span>
          <span class="detail-old-price tabular-nums">${formatPrice(product.originalPrice)}</span>
          <span class="detail-savings">${discountPercent}% Student Discount</span>
        </div>

        <p class="detail-description">${product.description}</p>

        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 12px;">Key Academic Highlights:</h4>
        <ul class="detail-features-list">
          ${product.features.map(f => `
            <li class="detail-feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>

        <div class="detail-purchase-row">
          <div class="quantity-stepper">
            <button type="button" class="qty-btn" id="detail-qty-minus" aria-label="Decrease quantity">−</button>
            <input type="number" id="detail-qty-input" class="qty-input tabular-nums" value="1" min="1" max="99" />
            <button type="button" class="qty-btn" id="detail-qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="btn btn-primary btn-lg" id="detail-add-to-cart-btn" style="flex: 1;">
            🛒 Add to Cart
          </button>
        </div>

        <div style="display: flex; gap: 16px; margin-top: 8px;">
          <a href="products.html" class="btn btn-secondary btn-sm">
            ← Back to Products
          </a>
          <a href="cart.html" class="btn btn-secondary btn-sm">
            View Cart
          </a>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div style="margin-top: 56px;">
      <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 24px;">Recommended for You</h3>
      <div class="product-grid col-3" id="related-products-grid"></div>
    </div>
  `;

  // Quantity Stepper controls
  const qtyInput = document.getElementById('detail-qty-input');
  const qtyMinus = document.getElementById('detail-qty-minus');
  const qtyPlus = document.getElementById('detail-qty-plus');
  const addBtn = document.getElementById('detail-add-to-cart-btn');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });

    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = val + 1;
    });

    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 1) qtyInput.value = 1;
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const q = parseInt(qtyInput.value, 10) || 1;
      addToCart(product.id, q, true);
    });
  }

  // Render Related Products (same category or others)
  const relatedGrid = document.getElementById('related-products-grid');
  if (relatedGrid) {
    const related = PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
    const fallbacks = related.length < 3 ? PRODUCTS.filter(p => p.id !== product.id).slice(0, 3) : related;
    relatedGrid.innerHTML = fallbacks.map(p => createProductCardHTML(p)).join('');
    bindAddToCartButtons(relatedGrid);
  }
}

// 4. Cart Page (cart.html)
function initCartPage() {
  const container = document.getElementById('cart-page-container');
  if (!container) return;

  function renderCart() {
    const cart = getCart();
    const totals = getCartTotals();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
          </div>
          <h3>Your CampusCart is Empty</h3>
          <p>Looks like you haven't added any study gear or college essentials to your cart yet.</p>
          <a href="products.html" class="btn btn-primary btn-lg">Explore Student Products</a>
        </div>
      `;
      return;
    }

    const freeShippingThreshold = 499;
    const remainingForFreeShipping = freeShippingThreshold - totals.subtotal;

    container.innerHTML = `
      <div class="cart-layout">
        <!-- Left: Items list -->
        <div class="cart-items-card">
          <div class="cart-table-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          <div class="cart-items-list">
            ${cart.map(item => `
              <div class="cart-item-row" data-id="${item.id}">
                <div class="cart-item-product">
                  <a href="product-details.html?id=${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
                  </a>
                  <div class="cart-item-info">
                    <h4><a href="product-details.html?id=${item.id}">${item.name}</a></h4>
                    <p>${item.category}</p>
                  </div>
                </div>

                <div class="cart-item-price tabular-nums">
                  ${formatPrice(item.price)}
                </div>

                <div class="quantity-stepper">
                  <button type="button" class="qty-btn cart-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                  <input type="number" class="qty-input tabular-nums cart-qty-input" data-id="${item.id}" value="${item.quantity}" min="1" max="99" />
                  <button type="button" class="qty-btn cart-qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>

                <div class="cart-item-total tabular-nums">
                  ${formatPrice(item.price * item.quantity)}
                </div>

                <button type="button" class="cart-remove-btn" data-id="${item.id}" title="Remove item" aria-label="Remove item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>

          <div style="padding: 16px 24px; background: var(--bg-main); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <a href="products.html" class="btn btn-secondary btn-sm">
              ← Continue Shopping
            </a>
            <button type="button" class="btn btn-secondary btn-sm" id="clear-cart-btn" style="color: var(--danger); border-color: #fecaca;">
              Clear Entire Cart
            </button>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div class="order-summary-card">
          <h3 class="summary-title">Order Summary</h3>

          ${totals.subtotal >= 499 ? `
            <div class="shipping-free-alert">
              <span>🎉</span>
              <span><strong>Free Delivery Unlocked!</strong> Standard campus delivery is free.</span>
            </div>
          ` : `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: 10px 14px; font-size: 0.85rem; color: #92400e; margin-bottom: 18px;">
              <span>💡 Add <strong>${formatPrice(remainingForFreeShipping)}</strong> more to unlock <strong>FREE Delivery</strong>!</span>
            </div>
          `}

          <div class="summary-row">
            <span>Items Subtotal (${totals.count} items)</span>
            <span class="tabular-nums" style="font-weight: 600; color: var(--text-main);">${formatPrice(totals.subtotal)}</span>
          </div>

          <div class="summary-row">
            <span>Delivery Fee</span>
            <span class="tabular-nums" style="font-weight: 600; color: ${totals.shipping === 0 ? 'var(--accent-green)' : 'var(--text-main)'};">
              ${totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
            </span>
          </div>

          <div class="summary-row total-row">
            <span>Final Total</span>
            <span class="tabular-nums" style="color: var(--primary);">${formatPrice(totals.total)}</span>
          </div>

          <p style="font-size: 0.75rem; color: var(--text-muted); margin: 12px 0 20px;">
            Includes all applicable taxes and door-to-dorm delivery charges.
          </p>

          <a href="checkout.html" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 12px;">
            Proceed to Checkout →
          </a>

          <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>🛡️ Campus Verified · Student Guarantee</span>
          </div>
        </div>
      </div>
    `;

    // Bind event handlers
    const minuses = container.querySelectorAll('.cart-qty-minus');
    const pluses = container.querySelectorAll('.cart-qty-plus');
    const inputs = container.querySelectorAll('.cart-qty-input');
    const removes = container.querySelectorAll('.cart-remove-btn');
    const clearBtn = document.getElementById('clear-cart-btn');

    minuses.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const item = cart.find(i => i.id === id);
        if (item) {
          updateCartItemQuantity(id, item.quantity - 1);
          renderCart();
        }
      });
    });

    pluses.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const item = cart.find(i => i.id === id);
        if (item) {
          updateCartItemQuantity(id, item.quantity + 1);
          renderCart();
        }
      });
    });

    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const id = parseInt(input.getAttribute('data-id'), 10);
        const val = parseInt(input.value, 10);
        updateCartItemQuantity(id, isNaN(val) ? 1 : val);
        renderCart();
      });
    });

    removes.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        removeCartItem(id);
        renderCart();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to empty your entire shopping cart?')) {
          clearCart();
          renderCart();
          showToast('Shopping cart cleared.');
        }
      });
    }
  }

  renderCart();
  window.addEventListener('cart-updated', renderCart);
}

// 5. Checkout Page (checkout.html)
function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  const summaryContainer = document.getElementById('checkout-order-summary');
  if (!form || !summaryContainer) return;

  const cart = getCart();
  const totals = getCartTotals();

  // If cart is empty, show prompt and disable
  if (cart.length === 0) {
    summaryContainer.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <h4>Your cart is empty!</h4>
        <p>Please add products before checking out.</p>
        <a href="products.html" class="btn btn-primary btn-sm">Return to Shop</a>
      </div>
    `;
    form.innerHTML = `
      <div class="empty-state" style="padding: 36px;">
        <h3>No items to checkout</h3>
        <p>Your shopping cart is currently empty. Add college essentials to place an order.</p>
        <a href="products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  // Render Checkout Summary
  summaryContainer.innerHTML = `
    <h3 class="summary-title">Order Overview (${totals.count} Items)</h3>
    <div style="max-height: 240px; overflow-y: auto; margin-bottom: 16px; padding-right: 4px;">
      ${cart.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 0.85rem;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" />
            <div>
              <div style="font-weight: 700; color: var(--text-main);">${item.name}</div>
              <div style="color: var(--text-muted);">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
            </div>
          </div>
          <span class="tabular-nums" style="font-weight: 700;">${formatPrice(item.price * item.quantity)}</span>
        </div>
      `).join('')}
    </div>

    <div class="summary-row">
      <span>Subtotal</span>
      <span class="tabular-nums">${formatPrice(totals.subtotal)}</span>
    </div>
    <div class="summary-row">
      <span>Delivery Fee</span>
      <span class="tabular-nums" style="color: ${totals.shipping === 0 ? 'var(--accent-green)' : 'var(--text-main)'};">
        ${totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
      </span>
    </div>
    <div class="summary-row total-row">
      <span>Total to Pay</span>
      <span class="tabular-nums" style="color: var(--primary);">${formatPrice(totals.total)}</span>
    </div>
    <div style="margin-top: 14px; font-size: 0.8rem; color: var(--text-muted); background: var(--bg-main); padding: 10px; border-radius: 6px;">
      📦 <strong>Estimated Delivery:</strong> Within 48 hours directly to your campus hostel/address.
    </div>
  `;

  // Payment radio card styling toggle
  const paymentCards = document.querySelectorAll('.payment-radio-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Handle Form Submission with Validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Helper for validation
    function validateField(id, errorId, testFn, errorMsg) {
      const el = document.getElementById(id);
      const errEl = document.getElementById(errorId);
      if (!el) return true;
      const valid = testFn(el.value.trim());
      if (!valid) {
        el.classList.add('error');
        if (errEl) errEl.textContent = errorMsg;
        isValid = false;
      } else {
        el.classList.remove('error');
        if (errEl) errEl.textContent = '';
      }
      return valid;
    }

    validateField('fullName', 'error-fullName', val => val.length >= 3, 'Please enter your full name (minimum 3 letters).');
    validateField('email', 'error-email', val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Please enter a valid student/personal email address.');
    validateField('phone', 'error-phone', val => /^[0-9]{10}$/.test(val.replace(/\D/g, '')), 'Please enter a valid 10-digit mobile number.');
    validateField('address', 'error-address', val => val.length >= 5, 'Please provide full room/hostel or street address.');
    validateField('city', 'error-city', val => val.length >= 2, 'City is required.');
    validateField('state', 'error-state', val => val.length >= 2, 'State is required.');
    validateField('pincode', 'error-pincode', val => /^[0-9]{6}$/.test(val), 'Please enter a valid 6-digit PIN code.');

    if (!isValid) {
      showToast('Please fix the errors marked in the checkout form.', true);
      return;
    }

    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'Cash on Delivery';

    // Generate Order ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `CC-${randomNum}`;

    const orderData = {
      orderId: orderId,
      customerName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      pincode: document.getElementById('pincode').value.trim(),
      paymentMethod: paymentMethod,
      items: [...cart],
      totals: { ...totals },
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Store in localStorage for Order Success page
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(orderData));

    // Clear cart
    clearCart();

    // Redirect to success page
    window.location.href = 'success.html';
  });
}

// 6. Order Success Page (success.html)
function initSuccessPage() {
  const container = document.getElementById('order-success-content');
  if (!container) return;

  let orderData = null;
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    if (raw) orderData = JSON.parse(raw);
  } catch (e) {
    console.error('Error reading order data', e);
  }

  if (!orderData) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No Recent Order Found</h3>
        <p>You haven't placed an order recently or your session has expired.</p>
        <a href="products.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  // Calculate estimated delivery date: 2 business days from order
  const today = new Date();
  today.setDate(today.getDate() + 2);
  const deliveryDateString = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  container.innerHTML = `
    <div class="success-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>

    <h1 class="success-title">Order Placed Successfully!</h1>
    <p style="color: var(--text-muted); font-size: 1.05rem;">
      Thank you, <strong>${orderData.customerName}</strong>! Your campus order has been received and is being prepared for dispatched.
    </p>

    <div class="success-order-id-box">
      Order ID: <span>#${orderData.orderId}</span>
    </div>

    <div class="success-card-details">
      <div class="success-detail-row">
        <span style="color: var(--text-muted);">Order Date:</span>
        <span>${orderData.orderDate}</span>
      </div>
      <div class="success-detail-row">
        <span style="color: var(--text-muted);">Payment Method:</span>
        <span>${orderData.paymentMethod}</span>
      </div>
      <div class="success-detail-row">
        <span style="color: var(--text-muted);">Campus Delivery Address:</span>
        <span style="text-align: right; max-width: 320px;">
          ${orderData.address}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}
        </span>
      </div>
      <div class="success-detail-row">
        <span style="color: var(--text-muted);">Estimated Delivery:</span>
        <span style="color: var(--accent-green); font-weight: 700;">By ${deliveryDateString} (Campus Courier)</span>
      </div>
      <div class="success-detail-row">
        <span style="color: var(--text-muted);">Total Paid / To Pay:</span>
        <span class="tabular-nums" style="font-size: 1.15rem; color: var(--primary);">${formatPrice(orderData.totals.total)}</span>
      </div>
    </div>

    <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; margin-bottom: 28px; text-align: left;">
      <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Ordered Items</h4>
      ${orderData.items.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${item.image}" alt="${item.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" />
            <div>
              <div style="font-weight: 700; color: var(--text-main);">${item.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${item.category} · Qty: ${item.quantity}</div>
            </div>
          </div>
          <span class="tabular-nums" style="font-weight: 700;">${formatPrice(item.price * item.quantity)}</span>
        </div>
      `).join('')}
    </div>

    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
      <a href="products.html" class="btn btn-primary btn-lg">
        Continue Shopping
      </a>
      <button type="button" class="btn btn-secondary btn-lg" onclick="window.print()">
        🖨️ Print Receipt
      </button>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// Global DOM Content Loaded Initialization
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();

  // Detect and initialize active page
  if (document.getElementById('featured-products-grid')) {
    initHomePage();
  }
  if (document.getElementById('products-grid')) {
    initProductsPage();
  }
  if (document.getElementById('product-detail-container')) {
    initProductDetailsPage();
  }
  if (document.getElementById('cart-page-container')) {
    initCartPage();
  }
  if (document.getElementById('checkout-form')) {
    initCheckoutPage();
  }
  if (document.getElementById('order-success-content')) {
    initSuccessPage();
  }
});
