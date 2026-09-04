ECHO is on.
/* =========================================================================
   Marie Rose Shop — Product Renderer
   -------------------------------------------------------------------------
   Reads products.json and builds the same .product-card / .category-block
   markup that used to be hand-typed directly in index.html. script.js's
   search, filter, and "add to list" code looks for .product-card elements
   as soon as it runs, so this file must finish inserting all product cards
   into the DOM BEFORE script.js executes.

   To guarantee that order without restructuring script.js, this file:
     - is a plain, non-deferred, non-async <script> tag placed in index.html
       directly BEFORE the <script src="script.js"> tag
     - uses a synchronous XMLHttpRequest (intentionally, despite normally
       being discouraged) so the browser cannot move on to the next script
       tag until products.json has been fetched and all cards rendered

   HOW TO UPDATE PRICES OR PRODUCTS:
   1. Open products.json
   2. Find the product by "id" (or copy an existing entry to add a new one)
   3. Edit "price", "name", "description", "image", etc.
   4. Save, commit, and push to GitHub — no HTML editing required.
   ========================================================================= */
(function () {
  'use strict';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatPrice(price) {
    return Number(price).toLocaleString('en-US');
  }

  function buildProductCard(product) {
    var badgeHtml = '';
    if (product.badge === 'popular') {
      badgeHtml = '<span class="product-badge popular">Popular</span>';
    } else if (product.badge === 'new') {
      badgeHtml = '<span class="product-badge new">New</span>';
    }

    var name = product.name || {};
    var desc = product.description || {};

    return (
      '<div class="product-card reveal" data-name="' + escapeHtml(product.searchName || '') + '">' +
        badgeHtml +
        '<div class="product-photo-slot">' +
          '<a href="#" onclick="openLightbox(this); return false;">' +
            '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.imageAlt || name.en || '') + '" loading="lazy" data-group="' + escapeHtml(product.category) + '">' +
          '</a>' +
          '<span class="stock-badge">In Stock</span>' +
        '</div>' +
        '<h4 class="lang-en">' + (name.en || '') + '</h4>' +
        '<h4 class="lang-rw" style="display:none;">' + (name.rw || '') + '</h4>' +
        '<h4 class="lang-fr" style="display:none;">' + (name.fr || '') + '</h4>' +
        '<p class="lang-en">' + (desc.en || '') + '</p>' +
        '<p class="lang-rw" style="display:none;">' + (desc.rw || '') + '</p>' +
        '<p class="lang-fr" style="display:none;">' + (desc.fr || '') + '</p>' +
        '<p class="product-price">' + formatPrice(product.price) + ' <span class="price-unit">' + escapeHtml(product.unit) + '</span></p>' +
        '<button class="add-to-list" data-item="' + escapeHtml(name.en || '') + '">' +
          '<span class="lang-en">＋ Add to list</span>' +
          '<span class="lang-rw" style="display:none;">＋ Ongera ku rutonde</span>' +
          '<span class="lang-fr" style="display:none;">＋ Ajouter à la liste</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildCategoryBlock(category, products) {
    var count = products.length;
    var heading =
      '<h3 class="category-heading">' + category.icon + ' ' +
        '<span class="lang-en">' + category.name.en + '</span>' +
        '<span class="lang-rw" style="display:none;">' + category.name.rw + '</span>' +
        '<span class="lang-fr" style="display:none;">' + category.name.fr + '</span> ' +
        '<span class="category-count">' + count + ' items</span>' +
      '</h3>';

    var cardsHtml = products.map(buildProductCard).join('');

    var viewMoreLabel = 'View more ' + category.name.en.replace(/&amp;/g, '&');

    var footer =
      '<div class="view-more-wrap">' +
        '<button class="view-more-btn" data-grid="' + category.id + '" data-more-label="' + escapeHtml(viewMoreLabel) + '">' +
          '<span class="btn-label lang-en">' + escapeHtml(viewMoreLabel) + '</span>' +
          '<span class="btn-label lang-rw" style="display:none;">Reba byinshi</span>' +
          '<span class="btn-label lang-fr" style="display:none;">Voir plus</span>' +
          '<span class="chev">▾</span>' +
        '</button>' +
      '</div>';

    return (
      '<div class="category-block" data-category="' + category.id + '">' +
        heading +
        '<div class="product-grid" data-category="' + category.id + '">' + cardsHtml + '</div>' +
        footer +
      '</div>'
    );
  }

  function renderAll(data) {
    var stage = document.querySelector('.categories-stage');
    if (!stage) return;

    var productsByCategory = {};
    data.products.forEach(function (p) {
      if (!productsByCategory[p.category]) productsByCategory[p.category] = [];
      productsByCategory[p.category].push(p);
    });

    var html = data.categories.map(function (category) {
      var products = productsByCategory[category.id] || [];
      return buildCategoryBlock(category, products);
    }).join('');

    stage.innerHTML = html;
  }

  // Synchronous XHR guarantees this completes and the DOM is populated
  // BEFORE the parser moves on to the next <script> tag (script.js), which
  // is what search/filter/add-to-list rely on. This only runs once per
  // page load and the file is small, so the (usually-discouraged) sync XHR
  // is an acceptable, simple trade-off here rather than restructuring all
  // of script.js to wait on an async event.
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'products.json', false); // false = synchronous
    xhr.send(null);
    if (xhr.status === 200 || xhr.status === 0) {
      var data = JSON.parse(xhr.responseText);
      renderAll(data);
    } else {
      console.error('products-render.js: failed to load products.json, status ' + xhr.status);
    }
  } catch (err) {
    console.error('products-render.js: error rendering products', err);
  }
})();