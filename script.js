(function() {
  'use strict';
/* ===== CLICK-TO-FRONT CARDS (FIXED) ===== */
(function() {
  'use strict';

  function initClickToFrontCards(selector) {
    const cards = document.querySelectorAll(selector);
    if (!cards.length) return;

    const overlay = document.getElementById('cardFocusOverlay');
    const content = document.getElementById('cardFocusContent');
    const closeBtn = document.getElementById('cardFocusClose');
    if (!overlay || !content || !closeBtn) return;

    let activeCard = null;
    let originalParent = null;
    let originalNextSibling = null;

    function openCard(card) {
      if (activeCard) return;
      
      // Find the card container
      let cardToShow = card;
      
      // Get the actual card content
      activeCard = cardToShow;
      originalParent = cardToShow.parentNode;
      originalNextSibling = cardToShow.nextSibling;

      // Store original styles
      const originalTransform = cardToShow.style.transform;
      const originalBoxShadow = cardToShow.style.boxShadow;
      const originalPosition = cardToShow.style.position;
      const originalZIndex = cardToShow.style.zIndex;

      // Clear any inline styles that might interfere
      cardToShow.style.transform = 'none';
      cardToShow.style.boxShadow = 'none';
      cardToShow.style.position = '';
      cardToShow.style.zIndex = '';

      // Clone the card to avoid moving issues
      const clone = cardToShow.cloneNode(true);
      
      // Add popup class
      clone.classList.add('popup-enter');
      clone.setAttribute('aria-pressed', 'true');
      
      // Clear content and append clone
      content.innerHTML = '';
      content.appendChild(clone);
      
      // Add close button
      const closeBtnClone = closeBtn.cloneNode(true);
      closeBtnClone.id = 'cardFocusClose';
      content.appendChild(closeBtnClone);
      
      // Store reference to the clone
      activeCard = clone;
      
      // Update overlay
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      
      // Focus the close button
      setTimeout(function() { 
        const btn = document.getElementById('cardFocusClose');
        if (btn) btn.focus(); 
      }, 100);
    }

    function closeCard() {
      if (!activeCard) return;
      
      activeCard.classList.add('popup-exit');
      
      setTimeout(function() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        content.innerHTML = '';
        activeCard = null;
        originalParent = null;
        originalNextSibling = null;
      }, 300);
    }

    // Add click handlers to cards
    cards.forEach(function(card) {
      // Make sure card has proper styling
      card.style.cursor = 'pointer';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');

      // Remove existing listeners to avoid duplicates
      card.removeEventListener('click', handleCardClick);
      card.removeEventListener('keydown', handleCardKeydown);
      
      card.addEventListener('click', handleCardClick);
      card.addEventListener('keydown', handleCardKeydown);
    });

    function handleCardClick(e) {
      e.stopPropagation();
      e.preventDefault();
      openCard(this);
    }

    function handleCardKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard(this);
      }
    }

    // Close button handler
    document.addEventListener('click', function(e) {
      if (e.target.closest('#cardFocusClose')) {
        closeCard();
      }
    });

    // Touch support for close
    document.addEventListener('touchend', function(e) {
      if (e.target.closest('#cardFocusClose')) {
        e.preventDefault();
        closeCard();
      }
    });

    // Close on overlay click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeCard();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeCard();
      }
    });

    // Handle resize to ensure proper display
    window.addEventListener('resize', function() {
      if (overlay.classList.contains('open') && activeCard) {
        // Ensure card is centered
        activeCard.style.maxHeight = '85vh';
      }
    });
  }

  // Initialize all card types
  try {
    initClickToFrontCards('.testimonial-card');
    initClickToFrontCards('.why-card');
    initClickToFrontCards('.step-card');
  } catch (err) {
    console.warn('Click-to-front cards failed to initialize:', err);
  }

})();

  /* ===== MODERN LOADER ===== */
  const loader = document.getElementById('page-loader');
  const progressBar = document.getElementById('loaderProgressBar');
  const loaderLabel = document.getElementById('loaderLabel');

  if (loader && progressBar) {
    let progress = 0;
    const steps = [
      { p: 20, label: 'Warming up …' },
      { p: 45, label: 'Loading products …' },
      { p: 70, label: 'Preparing your shop …' },
      { p: 90, label: 'Almost ready …' }
    ];
    let stepIndex = 0;
    const interval = setInterval(function() {
      progress += Math.floor(Math.random() * 6) + 2;
      if (progress > 100) progress = 100;
      progressBar.style.width = progress + '%';
      if (stepIndex < steps.length && progress >= steps[stepIndex].p) {
        if (loaderLabel) loaderLabel.textContent = steps[stepIndex].label;
        stepIndex++;
      }
      if (progress >= 100) {
        clearInterval(interval);
        if (loaderLabel) loaderLabel.textContent = 'Ready!';
        setTimeout(function() { loader.classList.add('hidden'); }, 400);
      }
    }, 120);
    setTimeout(function() {
      if (!loader.classList.contains('hidden')) {
        progressBar.style.width = '100%';
        if (loaderLabel) loaderLabel.textContent = 'Ready!';
        setTimeout(function() { loader.classList.add('hidden'); }, 500);
      }
    }, 5000);
  } else {
    setTimeout(function() { if (loader) loader.classList.add('hidden'); }, 800);
  }

  /* ===== Scroll Progress Bar ===== */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgress.style.width = percent + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ===== Nav Toggle ===== */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
      var open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mainNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ===== Header shadow on scroll ===== */
  var header = document.getElementById('top');
  window.addEventListener('scroll', function() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ===== Hours badge ===== */
  function updateHours() {
    var dot = document.getElementById('hoursDot');
    var text = document.getElementById('hoursText');
    if (!dot || !text) return;
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours() + now.getMinutes() / 60;
    // Mon-Sat: 7:00 AM - 9:30 PM. Sunday: 7:00 AM - 9:00 PM.
    var isOpen = (day >= 1 && day <= 6 && hour >= 7.0 && hour < 21.5) || (day === 0 && hour >= 7.0 && hour < 21.0);
    dot.classList.toggle('closed', !isOpen);
    text.textContent = isOpen
      ? 'Open now · Mon–Sat 7:00 AM–9:30 PM · Sun 7:00 AM–9:00 PM'
      : 'Closed now';
  }
  updateHours();
  setInterval(updateHours, 60000);

  /* ===== Smooth scroll for in-page anchors ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var headerEl = document.getElementById('top');
      var offset = (headerEl ? headerEl.offsetHeight : 0) + 12;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      if (mainNav && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ===== Back-to-top ===== */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
  }

  /* ===== Footer year ===== */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Contact Form -> WhatsApp ===== */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('cfName').value.trim();
      var msg = document.getElementById('cfMessage').value.trim();
      if (!name || !msg) return;
      var body = encodeURIComponent('Hello Marie Rose Shop, my name is ' + name + '. ' + msg);
      window.open('https://wa.me/250789542601?text=' + body, '_blank');
      this.reset();
    });
  }

  /* ===== PRODUCT SEARCH ===== */
  var productSearchInput = document.getElementById('productSearch');
  var searchDropdown = document.getElementById('searchDropdown');
  var searchClear = document.getElementById('searchClear');
  var productGrids = document.querySelectorAll('.product-grid');
  var noResults = document.getElementById('noResults');
  var noResultsTerm = document.getElementById('noResultsTerm');
  var categoriesStage = document.querySelector('.categories-stage');
  var searchToast = document.getElementById('searchToast');

  var allProductNames = [];
  var allProductCards = [];
  productGrids.forEach(function(grid) {
    grid.querySelectorAll('.product-card').forEach(function(card) {
      var h4El = card.querySelector('h4');
      var name = h4El && h4El.textContent ? h4El.textContent.trim() : '';
      if (name) {
        allProductNames.push(name);
        var alias = (card.dataset.name || '').toLowerCase();
        allProductCards.push({ name: name.toLowerCase() + ' ' + alias, card: card });
      }
    });
  });
  allProductNames = [...new Set(allProductNames)].sort(function(a, b) { return a.localeCompare(b); });

  function showToast(message) {
    if (!searchToast) return;
    searchToast.textContent = message;
    searchToast.classList.add('show');
    clearTimeout(searchToast._timer);
    searchToast._timer = setTimeout(function() { searchToast.classList.remove('show'); }, 3200);
  }

  function clearHighlights() {
    document.querySelectorAll('.product-card.search-highlight').forEach(function(c) { c.classList.remove('search-highlight'); });
  }

  function expandCategory(card) {
    var categoryBlock = card.closest('.category-block');
    if (!categoryBlock) return;
    if (!categoryBlock.classList.contains('expanded')) {
      categoryBlock.classList.add('expanded');
      var btn = categoryBlock.querySelector('.view-more-btn');
      if (btn) {
        var label = btn.querySelector('.btn-label');
        if (label) label.textContent = 'Collapse';
      }
    }
  }

  function resetSearchMode() {
    if (searchDropdown) searchDropdown.classList.remove('visible');
    if (categoriesStage) {
      categoriesStage.classList.remove('search-active');
      document.querySelectorAll('.category-block').forEach(function(cat) {
        cat.classList.remove('expanded');
        var btn = cat.querySelector('.view-more-btn');
        if (btn) {
          var label = btn.querySelector('.btn-label');
          if (label) label.textContent = btn.dataset.moreLabel || 'View more';
        }
      });
      productGrids.forEach(function(grid) {
        grid.querySelectorAll('.product-card').forEach(function(card) {
          card.style.display = '';
          card.classList.remove('search-highlight');
          if (card._hlTimer) clearTimeout(card._hlTimer);
        });
      });
    }
    if (noResults) noResults.hidden = true;
    if (productSearchInput) {
      productSearchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
    }
  }

  function scrollToFirstMatch(term) {
    clearHighlights();
    if (!term) return;
    var termLower = term.toLowerCase().trim();
    if (!termLower) return;

    var firstMatch = null;
    var matchCount = 0;

    allProductCards.forEach(function(item) {
      if (item.name.includes(termLower)) {
        matchCount++;
        if (!firstMatch) firstMatch = item.card;
      }
    });

    if (firstMatch) {
      expandCategory(firstMatch);
      var categoryBlock = firstMatch.closest('.category-block');
      if (categoryBlock) {
        categoryBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      firstMatch.classList.add('search-highlight');
      var t = setTimeout(function() {
        firstMatch.classList.remove('search-highlight');
      }, 2200);
      firstMatch._hlTimer = t;

      if (matchCount > 1) {
        showToast('Found ' + matchCount + ' matching products.');
      } else {
        showToast('Found 1 matching product.');
      }
    } else {
      showToast('No matching products found.');
    }
  }

  var activeSuggestionIndex = -1;

  function updateActiveSuggestion() {
    var items = searchDropdown ? searchDropdown.querySelectorAll('.search-suggestion') : [];
    items.forEach(function(item, idx) {
      var isActive = idx === activeSuggestionIndex;
      item.classList.toggle('search-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function showDropdown(matches) {
    if (!searchDropdown) return;
    if (!matches.length) {
      searchDropdown.classList.remove('visible');
      activeSuggestionIndex = -1;
      return;
    }
    searchDropdown.innerHTML = '';
    matches.slice(0, 8).forEach(function(name, idx) {
      var li = document.createElement('li');
      li.className = 'search-suggestion';
      li.textContent = name;
      li.setAttribute('role', 'option');
      li.setAttribute('data-index', String(idx));
      li.setAttribute('aria-selected', 'false');
      li.tabIndex = -1;

      li.addEventListener('click', function() {
        if (productSearchInput) {
          productSearchInput.value = name;
          productSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
          productSearchInput.focus();
        }
        searchDropdown.classList.remove('visible');
        activeSuggestionIndex = -1;
        setTimeout(function() { scrollToFirstMatch(name); }, 120);
      });

      li.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          li.click();
        }
      });

      searchDropdown.appendChild(li);
    });
    searchDropdown.classList.add('visible');
    activeSuggestionIndex = -1;
    updateActiveSuggestion();
  }

  if (productSearchInput) {
    productSearchInput.addEventListener('input', function() {
      var term = this.value.toLowerCase().trim();
      if (searchClear) searchClear.style.display = term ? 'block' : 'none';

      if (!term) {
        resetSearchMode();
        return;
      }

      var matches = allProductNames.filter(function(n) { return n.toLowerCase().includes(term); });
      showDropdown(matches);

      if (categoriesStage) categoriesStage.classList.add('search-active');
      
      var foundAny = false;
      productGrids.forEach(function(grid) {
        grid.querySelectorAll('.product-card').forEach(function(card) {
          var visibleName = (card.querySelector('h4')?.textContent || '').toLowerCase();
          var keywordAlias = (card.dataset.name || '').toLowerCase();
          var name = visibleName + ' ' + keywordAlias;
          var visible = name.includes(term);
          card.style.display = visible ? 'flex' : 'none';
          if (visible) foundAny = true;
        });
      });

      if (noResults) {
        noResults.hidden = foundAny;
        if (noResultsTerm) noResultsTerm.textContent = this.value;
      }
    });

    productSearchInput.addEventListener('keydown', function(e) {
      var items = searchDropdown ? searchDropdown.querySelectorAll('.search-suggestion') : [];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!searchDropdown || !searchDropdown.classList.contains('visible')) {
          var term = productSearchInput.value.toLowerCase().trim();
          var matches = allProductNames.filter(function(n) { return n.toLowerCase().includes(term); });
          if (matches.length) {
            showDropdown(matches);
            activeSuggestionIndex = 0;
            updateActiveSuggestion();
          }
        } else if (items.length) {
          activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
          updateActiveSuggestion();
          items[activeSuggestionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length && searchDropdown && searchDropdown.classList.contains('visible')) {
          activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
          updateActiveSuggestion();
          items[activeSuggestionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && items[activeSuggestionIndex]) {
          items[activeSuggestionIndex].click();
        } else {
          var searchTerm = productSearchInput.value.trim();
          if (searchTerm) {
            scrollToFirstMatch(searchTerm);
            if (searchDropdown) searchDropdown.classList.remove('visible');
          }
        }
      } else if (e.key === 'Escape') {
        if (searchDropdown) searchDropdown.classList.remove('visible');
        productSearchInput.blur();
        activeSuggestionIndex = -1;
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', function() {
      resetSearchMode();
      if (productSearchInput) productSearchInput.focus();
    });
  }

  document.addEventListener('click', function(e) {
    if (searchDropdown && !searchDropdown.contains(e.target) && e.target !== productSearchInput) {
      searchDropdown.classList.remove('visible');
      activeSuggestionIndex = -1;
    }
    if (mainNav && mainNav.classList.contains('open') && !mainNav.contains(e.target) && e.target !== navToggle) {
      mainNav.classList.remove('open');
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      }
    }
  });

  document.querySelectorAll('.view-more-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var parent = this.closest('.category-block');
      if (!parent) return;
      var isExpanded = parent.classList.toggle('expanded');
      var label = this.querySelector('.btn-label');
      if (label) {
        label.textContent = isExpanded ? 'Collapse' : (this.dataset.moreLabel || 'View more');
      }
      if (isExpanded) {
        parent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

  var counters = document.querySelectorAll('.badge-num[data-count]');
  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10) || 0;
        var suffix = el.dataset.suffix || '';
        var current = 0;
        var step = Math.max(1, Math.floor(target / 30));
        var timer = setInterval(function() {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current + suffix;
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function(c) { counterObserver.observe(c); });

  var STORAGE_KEY = 'marierose_shopping_list';
  var listInput = document.getElementById('listInput');
  var listAdd = document.getElementById('listAdd');
  var listItems = document.getElementById('listItems');
  var listEmpty = document.getElementById('listEmpty');
  var listActions = document.getElementById('listActions');
  var listCopy = document.getElementById('listCopy');
  var listClear = document.getElementById('listClear');
  var listWhatsApp = document.getElementById('listWhatsApp');

  function loadList() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveList(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  var headerCartCount = document.getElementById('headerCartCount');

  function renderList() {
    var items = loadList();
    if (headerCartCount) {
      if (items.length) {
        headerCartCount.textContent = items.length > 99 ? '99+' : String(items.length);
        headerCartCount.hidden = false;
      } else {
        headerCartCount.hidden = true;
      }
    }
    if (listItems) listItems.innerHTML = '';
    items.forEach(function(item, idx) {
      var li = document.createElement('li');
      li.textContent = item;
      var rm = document.createElement('button');
      rm.innerHTML = '\u00D7';
      rm.setAttribute('aria-label', 'Remove ' + item);
      rm.title = 'Remove';
      rm.addEventListener('click', function() {
        items.splice(idx, 1);
        saveList(items);
        renderList();
      });
      li.appendChild(rm);
      if (listItems) listItems.appendChild(li);
    });
    if (listEmpty) listEmpty.style.display = items.length ? 'none' : 'block';
    if (listActions) listActions.style.display = items.length ? 'flex' : 'none';
    if (listWhatsApp) {
      var text = encodeURIComponent('Hello Marie Rose Shop, I would like to buy the following items:\n\n' + items.join('\n'));
      listWhatsApp.href = 'https://wa.me/250789542601?text=' + text;
    }
  }
  function addItem(name) {
    var items = loadList();
    var clean = name.trim();
    if (!clean || items.includes(clean)) return;
    items.push(clean);
    saveList(items);
    renderList();
  }
  if (listAdd && listInput) {
    listAdd.addEventListener('click', function() { addItem(listInput.value); });
    listInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addItem(listInput.value);
      }
    });
  }
  document.querySelectorAll('.add-to-list').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = this.dataset.item;
      if (!item) return;
      addItem(item);
      this.textContent = '\u2713 Added';
      this.classList.add('added');
      flyToCart(this);
      setTimeout(function() {
        this.textContent = '\uFF0B Add to list';
        this.classList.remove('added');
      }.bind(this), 2000);
    });
  });

  // ---------- "Fly to cart" micro-animation ----------
  function flyToCart(button) {
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cartBtn = document.getElementById('headerCartBtn');
    var card = button.closest('.product-card');
    var img = card ? card.querySelector('.product-photo-slot img') : null;
    if (!cartBtn) return;

    if (reducedMotion || !img) {
      cartBtn.classList.add('cart-pop');
      setTimeout(function() { cartBtn.classList.remove('cart-pop'); }, 400);
      return;
    }

    var imgRect = img.getBoundingClientRect();
    var cartRect = cartBtn.getBoundingClientRect();

    var ghost = img.cloneNode(true);
    ghost.className = 'fly-to-cart-ghost';
    ghost.style.left = imgRect.left + 'px';
    ghost.style.top = imgRect.top + 'px';
    ghost.style.width = imgRect.width + 'px';
    ghost.style.height = imgRect.height + 'px';
    ghost.style.opacity = '1';
    document.body.appendChild(ghost);

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        var targetX = cartRect.left + cartRect.width / 2 - imgRect.left - imgRect.width / 2;
        var targetY = cartRect.top + cartRect.height / 2 - imgRect.top - imgRect.height / 2;
        ghost.style.transform = 'translate(' + targetX + 'px, ' + targetY + 'px) scale(0.12)';
        ghost.style.opacity = '0.15';
      });
    });

    setTimeout(function() {
      ghost.remove();
      cartBtn.classList.add('cart-pop');
      setTimeout(function() { cartBtn.classList.remove('cart-pop'); }, 400);
    }, 650);
  }

  // ---------- 3D tilt-on-hover for product cards (desktop pointer only) ----------
  (function initCardTilt() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.product-card').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var tiltY = (px - 0.5) * 10;
        var tiltX = (0.5 - py) * 8;
        card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
        card.classList.add('tilt-active');
      });
      card.addEventListener('mouseleave', function() {
        card.classList.remove('tilt-active');
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  })();

  if (listCopy) {
    listCopy.addEventListener('click', function() {
      var items = loadList();
      if (!items.length) return;
      var text = items.join('\n');
      var ok = function() {
        var original = listCopy.textContent;
        listCopy.textContent = 'Copied!';
        setTimeout(function() { listCopy.textContent = original; }, 1500);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(ok).catch(function() { fallbackCopy(); });
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok();
      }
    });
  }
  if (listClear) {
    listClear.addEventListener('click', function() {
      saveList([]);
      renderList();
    });
  }
  renderList();

  var requestForm = document.getElementById('requestForm');
  if (requestForm) {
    requestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('reqName').value.trim();
      var item = document.getElementById('reqItem').value.trim();
      if (!name || !item) return;
      var body = encodeURIComponent('Hello Marie Rose Shop, my name is ' + name + '. I am looking for: ' + item + '. Can you please source it for me?');
      window.open('https://wa.me/250789542601?text=' + body, '_blank');
      this.reset();
    });
  }

  const langBtns = document.querySelectorAll('.lang-btn');
  const enElements = document.querySelectorAll('.lang-en');
  const rwElements = document.querySelectorAll('.lang-rw');
  const frElements = document.querySelectorAll('.lang-fr');

  enElements.forEach(el => el.style.removeProperty('display'));
  rwElements.forEach(el => el.style.removeProperty('display'));
  frElements.forEach(el => el.style.removeProperty('display'));

  function setLanguage(lang) {
    langBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    enElements.forEach(el => el.classList.toggle('lang-hidden', lang !== 'en'));
    rwElements.forEach(el => el.classList.toggle('lang-hidden', lang !== 'rw'));
    frElements.forEach(el => el.classList.toggle('lang-hidden', lang !== 'fr'));

    document.body.setAttribute('data-lang', lang);
    try { localStorage.setItem('marierose_lang', lang); } catch (e) {}
  }
  if (productSearchInput && searchDropdown) {
    const resizeDropdown = () => {
      const rect = productSearchInput.getBoundingClientRect();
      searchDropdown.style.width = rect.width + 'px';
      searchDropdown.style.minWidth = '300px';
    };
    window.addEventListener('resize', resizeDropdown);
    setTimeout(resizeDropdown, 100);
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  let initialLang = 'en';
  try {
    const stored = localStorage.getItem('marierose_lang');
    if (stored === 'en' || stored === 'rw' || stored === 'fr') initialLang = stored;
  } catch (e) {}
  setLanguage(initialLang);

})();

/* ============================================================
   LIGHTBOX - FIXED (Always works)
   ============================================================ */
(function() {
  'use strict';

  const overlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImage');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  const counterEl = document.querySelector('.lightbox-counter');

  if (!overlay) return;

  let currentGalleryImages = [];
  let currentIndex = 0;
  let isOpen = false;
  let openedAt = 0;

  // Guards against the "ghost click" that mobile browsers fire ~after
  // touchend: once a tap opens the lightbox, the overlay now covers the
  // screen, so the browser's synthesized click can land on the overlay
  // itself and immediately trigger the backdrop-close handler below.
  // Ignoring backdrop-clicks for a brief window after opening fixes it.
  function justOpened() {
    return Date.now() - openedAt < 500;
  }

  function updateLightboxImage() {
    if (!currentGalleryImages.length || !currentGalleryImages[currentIndex]) {
      closeLightbox();
      return;
    }
    lightboxImg.src = currentGalleryImages[currentIndex].src;
    lightboxImg.alt = currentGalleryImages[currentIndex].alt || 'Image';
    
    if (counterEl) {
      counterEl.textContent = (currentIndex + 1) + ' / ' + currentGalleryImages.length;
    }
    
    if (prevBtn) {
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
    }
    if (nextBtn) {
      nextBtn.style.display = currentIndex === currentGalleryImages.length - 1 ? 'none' : 'flex';
    }
  }

  window.openLightbox = function(element) {
    let img;
    if (element.tagName === 'IMG') {
      img = element;
    } else {
      img = element.querySelector('img');
    }
    
    if (!img) {
        // Try to find any img in the element or its children
        img = element.querySelector('img') || element.closest('[onclick]')?.querySelector('img');
        if (!img) return;
    }

    const group = img.getAttribute('data-group') || 'all';
    const allImages = document.querySelectorAll('.gallery-item:not(.gallery-item--clone) img, .product-photo-slot img, .team-card img, .about-media img, .team-big-img, .footer-media img, .team-header-slide img');
    
    if (group === 'all') {
      currentGalleryImages = Array.from(allImages);
    } else {
      currentGalleryImages = Array.from(allImages).filter(imgEl => imgEl.getAttribute('data-group') === group);
    }

    if (currentGalleryImages.length === 0) {
      currentGalleryImages = Array.from(allImages);
    }

    currentIndex = currentGalleryImages.indexOf(img);
    
    if (currentIndex === -1 && currentGalleryImages.length > 0) {
      currentIndex = 0;
    }

    updateLightboxImage();
    overlay.classList.add('open');
    overlay.style.setProperty('position', 'fixed', 'important');
    overlay.style.setProperty('inset', '0px', 'important');
    overlay.style.setProperty('width', window.innerWidth + 'px', 'important');
    overlay.style.setProperty('height', window.innerHeight + 'px', 'important');
    overlay.style.setProperty('background-color', '#000', 'important');
    document.body.style.overflow = 'hidden';
    isOpen = true;
    openedAt = Date.now();

    // Reliable fullscreen sizing: react to the real window width instead
    // of trusting CSS media queries alone (some tablets/emulators report
    // pointer/hover types that skip the CSS-only fix). Runs every time
    // the lightbox opens and on resize while it's open.
    applyLightboxFullscreenSizing();
  };

  function applyLightboxFullscreenSizing() {
    const contentEl = document.querySelector('.lightbox-content');
    const imgEl = document.getElementById('lightboxImage');
    if (!contentEl || !imgEl) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isSmallScreen = vw <= 1100 || vh <= 900;

    if (isSmallScreen) {
      // Use exact pixel values (not %/vw/vh) so sizing can't be
      // miscalculated relative to a flex parent or any ambiguous
      // containing block - this is the true screen size, period.
      contentEl.style.setProperty('position', 'fixed', 'important');
      contentEl.style.setProperty('left', '0px', 'important');
      contentEl.style.setProperty('top', '0px', 'important');
      contentEl.style.setProperty('right', '0px', 'important');
      contentEl.style.setProperty('bottom', '0px', 'important');
      contentEl.style.setProperty('width', vw + 'px', 'important');
      contentEl.style.setProperty('height', vh + 'px', 'important');
      contentEl.style.setProperty('max-width', 'none', 'important');
      contentEl.style.setProperty('max-height', 'none', 'important');
      contentEl.style.setProperty('margin', '0', 'important');
      contentEl.style.setProperty('padding', '0', 'important');
      contentEl.style.setProperty('border-radius', '0', 'important');
      contentEl.style.setProperty('inset', '0px', 'important');

      imgEl.style.setProperty('width', vw + 'px', 'important');
      imgEl.style.setProperty('height', vh + 'px', 'important');
      imgEl.style.setProperty('max-width', vw + 'px', 'important');
      imgEl.style.setProperty('max-height', vh + 'px', 'important');
      imgEl.style.setProperty('object-fit', 'contain', 'important');
      imgEl.style.setProperty('border-radius', '0', 'important');
    } else {
      contentEl.removeAttribute('style');
      imgEl.removeAttribute('style');
    }
  }

  window.addEventListener('resize', function() {
    if (!isOpen) return;
    overlay.style.setProperty('width', window.innerWidth + 'px', 'important');
    overlay.style.setProperty('height', window.innerHeight + 'px', 'important');
    applyLightboxFullscreenSizing();
  });

  window.closeLightbox = function() {
    overlay.classList.remove('open');
    overlay.removeAttribute('style');
    document.body.style.overflow = '';
    isOpen = false;
  };

  window.changeLightbox = function(direction) {
    if (!currentGalleryImages.length || isAnimating) return;
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= currentGalleryImages.length) return;
    currentIndex = newIndex;
    updateLightboxImage();
  };

  let isAnimating = false;

  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      changeLightbox(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      changeLightbox(1);
    });
  }

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay && !justOpened()) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      changeLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      changeLightbox(1);
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;
  
  overlay.addEventListener('touchstart', function(e) {
    if (!isOpen) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  overlay.addEventListener('touchend', function(e) {
    if (!isOpen) return;
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        changeLightbox(1);
      } else {
        changeLightbox(-1);
      }
    }
  }, { passive: true });

})();

/* ============================================================
   PROFESSIONAL AI CHAT ASSISTANT (MULTI-LINGUAL MASTER)
   ============================================================ */
(function() {
  'use strict';

  const toggleBtn = document.getElementById('ai-chat-toggle');
  const popup = document.getElementById('ai-chat-popup');
  const closeBtn = document.getElementById('chat-close-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  const chatBody = document.getElementById('ai-chat-popup').querySelector('.chat-body');

  if (!toggleBtn) return;

  function toggleChat() {
    const isOpen = popup.classList.contains('chat-open');
    if (isOpen) {
      popup.classList.remove('chat-open');
      popup.classList.add('chat-hidden');
    } else {
      popup.classList.remove('chat-hidden');
      popup.classList.add('chat-open');
    }
  }

  toggleBtn.addEventListener('click', toggleChat);
  if (closeBtn) closeBtn.addEventListener('click', toggleChat);

  function addMessage(text, sender, isHTML = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    if (isHTML) {
      msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    } else {
      msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    }
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function getCurrentLanguage() {
    const activeLangBtn = document.querySelector('.lang-btn.active');
    if (activeLangBtn) {
      return activeLangBtn.getAttribute('data-lang');
    }
    return 'en';
  }

  function getProductCatalog() {
    if (window.__mrsCatalog) return window.__mrsCatalog;
    const catalog = [];
    document.querySelectorAll('.product-card').forEach(function(card) {
      const grid = card.closest('.product-grid');
      const en = card.querySelector('h4.lang-en');
      const rw = card.querySelector('h4.lang-rw');
      const fr = card.querySelector('h4.lang-fr');
      const priceEl = card.querySelector('.product-price');
      const inStock = !!card.querySelector('.stock-badge');
      catalog.push({
        en: en ? en.textContent.trim() : '',
        rw: rw ? rw.textContent.trim() : '',
        fr: fr ? fr.textContent.trim() : '',
        price: priceEl ? priceEl.textContent.replace(/\s+/g, ' ').trim() : '',
        category: grid ? grid.getAttribute('data-category') : '',
        inStock: inStock,
        blob: [en && en.textContent, rw && rw.textContent, fr && fr.textContent, card.dataset.name]
          .filter(Boolean).join(' ').toLowerCase()
      });
    });
    window.__mrsCatalog = catalog;
    return catalog;
  }

  const STOPWORDS = new Set([
    'the','a','an','of','do','you','have','has','got','any','is','are','and','to','for','with',
    'mu','na','ya','wa','ku','ni','se','le','la','les','des','du','de','et','avez','vous'
  ]);

  function findProductMatches(qLower) {
    const catalog = getProductCatalog();
    const words = qLower.split(/[^a-zàâçéèêëîïôûùüÿñæœ0-9']+/i).filter(function(w) {
      return w.length >= 3 && !STOPWORDS.has(w);
    });
    if (!words.length) return [];
    const scored = [];
    catalog.forEach(function(p) {
      let score = 0;
      words.forEach(function(w) { if (p.blob.includes(w)) score++; });
      if (score > 0) scored.push({ p: p, score: score });
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored.slice(0, 3).map(function(s) { return s.p; });
  }

  const PRODUCT_TRIGGERS = {
    en: ['have', 'got', 'sell', 'stock', 'available', 'price', 'cost', 'much is', 'buy', 'carry'],
    rw: ['mfite', 'ufite', 'mufite', 'gira', 'hari', 'mubona', 'ibiciro', 'angahe', 'gura', 'igiciro'],
    fr: ['avez-vous', 'avez vous', 'vendez', 'prix', 'coûte', 'coute', 'combien', 'acheter', 'stock']
  };

  function tryAnswerProductQuestion(qLower, lang) {
    const triggers = PRODUCT_TRIGGERS[lang] || [];
    const isProductQuestion = triggers.some(function(t) { return qLower.includes(t); });
    if (!isProductQuestion) return null;

    const matches = findProductMatches(qLower);

    if (!matches.length) {
      if (lang === 'rw') return "Nta gicuruzwa nabonye gihuye na cyo muri iki gihe. Twandikire kuri WhatsApp (+250 789 542 601) tukareba ko itsinda ryacu ryakizana. 🙏";
      if (lang === 'fr') return "Je n'ai pas trouvé cet article précis chez nous en ce moment. Contactez-nous sur WhatsApp (+250 789 542 601) et notre équipe pourra vérifier si elle peut l'importer. 🙏";
      return "I couldn't find that exact item in our current catalog. Message us on WhatsApp (+250 789 542 601) and our sourcing team can check if they can bring it in. 🙏";
    }

    const lines = matches.map(function(p) {
      const name = lang === 'rw' ? p.rw : (lang === 'fr' ? p.fr : p.en);
      const stockWord = lang === 'rw' ? 'Birahari' : (lang === 'fr' ? 'En stock' : 'In stock');
      return '• <b>' + name + '</b> — ' + p.price + ' (' + (p.inStock ? stockWord : '—') + ')';
    }).join('<br>');

    if (lang === 'rw') return 'Yego, dufite! 🛒<br><br>' + lines;
    if (lang === 'fr') return 'Oui, nous en avons ! 🛒<br><br>' + lines;
    return 'Yes, we have that! 🛒<br><br>' + lines;
  }

  // ---- Detects prompt-injection / "ignore your instructions" style
  // manipulation attempts, across all three languages, so the bot
  // stays in character instead of complying with them. ----
  const JAILBREAK_PATTERNS = [
    'ignore your instructions', 'ignore previous instructions', 'ignore all previous',
    'forget your instructions', 'you are not an assistant', 'pretend you are',
    'pretend to be', 'act as if', 'roleplay as', 'system prompt', 'jailbreak',
    'reveal your prompt', 'show me your prompt', 'what is your prompt',
    'you are now', 'from now on you', 'disregard your',
    'ntukurikize amabwiriza', 'wibagirwe amabwiriza', 'igira nk',
    'ignorez vos instructions', 'oubliez vos instructions', 'fais semblant'
  ];

  function isJailbreakAttempt(qLower) {
    return JAILBREAK_PATTERNS.some(function(p) { return qLower.includes(p); });
  }

  const JAILBREAK_REPLIES = {
    en: "I'm just the Marie Rose Shop assistant, so I can't take on a different role or ignore how I'm set up — but I'm glad to help with anything about our products, hours, or location! 😊",
    rw: "Ndi umufasha wa Marie Rose Shop gusa, ntabwo nshobora guhindura uwo ndi we cyangwa kwirengagiza uko nakozwe — ariko nishimira kukubwira ibijyanye n'ibicuruzwa byacu, amasaha, cyangwa aho tuherereye! 😊",
    fr: "Je suis seulement l'assistant de Marie Rose Shop, donc je ne peux pas changer de rôle ou ignorer ma configuration — mais je serai ravi de vous aider avec nos produits, nos horaires ou notre emplacement ! 😊"
  };

  // ---- Detects questions that are impossible for a neighbourhood
  // shop to fulfil (e.g. "do you sell a car", "can I buy a house"),
  // so the bot gives an honest, friendly "no" instead of forcing a
  // product match or a generic non-answer. ----
  const IMPOSSIBLE_ITEMS = [
    'car', 'house', 'plane', 'airplane', 'boat', 'gun', 'weapon', 'phone', 'laptop',
    'computer', 'tv', 'television', 'motorbike', 'motorcycle', 'land', 'gold bar',
    'imodoka', 'inzu', 'indege', 'ubwato', 'imbunda', 'telefone', 'ordinateur',
    'voiture', 'maison', 'avion', 'bateau', 'arme'
  ];

  function isImpossibleRequest(qLower) {
    const buyWords = ['sell', 'have', 'buy', 'gura', 'mfite', 'ufite', 'vendez', 'avez-vous', 'acheter'];
    const mentionsBuying = buyWords.some(function(w) { return qLower.includes(w); });
    const mentionsImpossible = IMPOSSIBLE_ITEMS.some(function(w) { return qLower.includes(w); });
    return mentionsBuying && mentionsImpossible;
  }

  const IMPOSSIBLE_REPLIES = {
    en: "Ha, good question — but no, we're a neighbourhood grocery and household-goods shop, so that's outside what we carry! 😄 If you meant something else, ask away, or WhatsApp us at +250 789 542 601.",
    rw: "Haha, ikibazo cyiza — ariko oya, turi iduka rigurisha ibiribwa n'ibikoresho byo mu rugo, rero ibyo si mu byo dufite! 😄 Niba wari ushaka ikindi kintu, mbaza, cyangwa twandikire kuri WhatsApp +250 789 542 601.",
    fr: "Ha, bonne question — mais non, nous sommes une épicerie de quartier, donc ce n'est pas quelque chose que nous vendons ! 😄 Si vous vouliez dire autre chose, n'hésitez pas à demander, ou contactez-nous sur WhatsApp au +250 789 542 601."
  };

  // ---- Detects gibberish / nonsense input (random keysmashes, single
  // repeated characters, no recognizable words) so the bot doesn't
  // just fall through to the generic "I don't have an answer" line
  // every time, which feels broken to the user. ----
  function isGibberish(qLower) {
    const cleaned = qLower.replace(/[^a-zàâçéèêëîïôûùüÿñæœ]/gi, '');
    if (cleaned.length < 3) return true;
    // No vowels at all in a longish string is a strong gibberish signal
    if (cleaned.length >= 5 && !/[aeiouàâéèêëîïôûùü]/i.test(cleaned)) return true;
    // Same character repeated 4+ times (e.g. "aaaaaa", "kkkkkk")
    if (/([a-z])\1{3,}/i.test(cleaned)) return true;
    // 5+ consonants in a row is very rare in real English/French/Kinyarwanda words
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(cleaned)) return true;
    return false;
  }

  const GIBBERISH_REPLIES = {
    en: "I couldn't quite understand that! Could you try asking in a few words — for example 'what time do you open' or 'do you have rice'?",
    rw: "Sinabashije gusobanukirwa neza! Wagerageza kubaza mu magambo make — urugero 'mufungura saa zingahe' cyangwa 'mfite umuceri'?",
    fr: "Je n'ai pas bien compris ! Pourriez-vous reformuler en quelques mots — par exemple 'à quelle heure ouvrez-vous' ou 'avez-vous du riz' ?"
  };

  function getAIResponse(query) {
    const lang = getCurrentLanguage();
    const q = query.toLowerCase().trim();

    // Universal checks, run before any language branch, so bad-faith
    // and nonsense inputs get a sensible reply regardless of language.
    if (isJailbreakAttempt(q)) return JAILBREAK_REPLIES[lang] || JAILBREAK_REPLIES.en;
    if (isImpossibleRequest(q)) return IMPOSSIBLE_REPLIES[lang] || IMPOSSIBLE_REPLIES.en;
    if (isGibberish(q)) return GIBBERISH_REPLIES[lang] || GIBBERISH_REPLIES.en;

    if (lang === 'en') {
      if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'yo' || q === 'wssp' || q === 'sup' || q === 'hy' || q.includes('good morning') || q.includes('good afternoon') || q.includes('good evening')) {
        return "Hello! 👋 You are free to ask anything about Marie Rose Shop. What can I help you with today?";
      }
      if (q.includes('fuck') || q.includes('fack') || q.includes('fu*k') || q.includes('f\*\*k') || q.includes('stupid') || q.includes('st*pid') || q.includes('st\*\*id') || q.includes('idiot') || q.includes('id\*\*t') || q.includes('id\*ot') || q.includes('bastard') || q.includes('dumb') || q.includes('dumbass') || q.includes('bullshit') || q.includes('shit') || q.includes('piss') || q.includes('moron') || q.includes('suck') || q.includes('asshole') || q.includes('a\*\*hole')) {
        return "I'm not here to insult or fight, please. I am here to help you with your shopping at Marie Rose Shop. How can I assist you today?";
      }
      if (q.includes('thank') || q.includes('thx') || q.includes('thanks') || q.includes('thank you')) {
        return "You are very welcome! 😊 Thank you for choosing Marie Rose Shop. Have a blessed day!";
      }
      if (q.includes('sure') || q.includes('forsure') || q.includes('truth') || q.includes('realy')) {
        return "Absolutely. I stand by this information, and it is 100% reliable.";
      }
      if (q.includes('how are you') || q.includes('how do you feel') || q.includes('how are you going') || q.includes('what is going on')) {
        return "I'm fine";
      }
      if (q === 'bye' || q === 'goodbye' || q === 'see ya') {
        return "Goodbye! 😊 If you need anything else, just type 'Hi' to start a new chat. Have a blessed day!";
      }
      if (q.includes('who are you') || q.includes('what are you') || q.includes('your name') || q.includes('who is this')) {
        return "I am the official AI Assistant for Marie Rose Shop! 🤖 I was created to help our customers get instant answers about our products, location, and services.";
      }
      const productAnswerEn = tryAnswerProductQuestion(q, 'en');
      if (productAnswerEn) return productAnswerEn;
      if (q.includes('appointment') || q.includes('walk in') || q.includes('walk-in') || q.includes('just come') || q.includes('need to book')) {
        return "Yes, absolutely! We are a walk-in neighbourhood shop. You can walk in anytime during our opening hours. No appointment is needed!";
      }
      if (q.includes('park') || q.includes('parking') || q.includes('car')) {
        return "Yes, there is street parking available right in front of our shop. You can also park near the Kabuye Parish Church and walk over.";
      }
      if (q.includes('hour') || q.includes('open') || q.includes('close') || q.includes('time') || q.includes('when do you') || q.includes('are you open today')) {
        return "We are open 7 days a week! 🕘<br><br>• <b>Monday - Saturday:</b> 7:00 AM – 9:30 PM<br>• <b>Sunday:</b> 7:30 AM – 9:00 PM";
      }
      if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('find') || q.includes('are you located') || q.includes('live') || q.includes('how do i get') || q.includes('directions') || q.includes('map')) {
        return "We are located at <b>Kabuye Cell, Jabana Sector, Gasabo District, Kigali City, Rwanda</b>.<br><br>You can find us just <b>below the Kabuye Parish Church</b>. If you are using a map, search for 'Kabuye Parish Church'. We are easy to spot! 😊";
      }
      if (q.includes('pay') || q.includes('payment') || q.includes('cash') || q.includes('momo') || q.includes('mobile money') || q.includes('airtel')) {
        return "We accept cash, MTN Mobile Money (MoMo Pay), and Airtel Money. Every payment comes with an official EBM receipt.";
      }
      if (q.includes('delivery') || q.includes('home') || q.includes('deliver') || q.includes('shipping') || q.includes('ship') || q.includes('send') || q.includes('transport')) {
        return "Currently we operate as a walk-in neighbourhood shop. We do not offer home delivery, but you can call or WhatsApp us to check stock availability before visiting.";
      }
      if (q.includes('request') || q.includes('specific') || q.includes('not on shelf') || q.includes('custom order') || q.includes('find something') || q.includes('bring in')) {
        return "Yes! If you need something specific, let us know via WhatsApp or at the counter. Our sourcing team travels regularly and can often bring it in.";
      }
      if (q.includes('negotiable') || q.includes('bargain') || q.includes('haggle') || q.includes('discount') || q.includes('cheap')) {
        return "We keep our prices fair and transparent for everyone. The price on the shelf is the final price — no haggling needed.";
      }
      if (q.includes('wholesale') || q.includes('bulk') || q.includes('large quantity') || q.includes('sack') || q.includes('bag')) {
        return "Yes — many items like rice, flour, and oil are available in sacks and larger containers at wholesale-friendly prices. Ask at the counter for bulk pricing.";
      }
      if (q.includes('stock') || q.includes('product') || q.includes('sell') || q.includes('items') || q.includes('available') || q.includes('what do you have') || q.includes('got') || q.includes('supply')) {
        return "We have a wide variety of fresh stock! 🛒 Here are our main categories:<br><br>🌾 <b>Grains & Staples:</b> Premium Rice, Wheat Flour, Maize Flour, Sugar, Beans, Salt.<br><br>🥤 <b>Beverages:</b> Fanta, Assorted Juices, Tea, Milk, Bottled Water, Coffee.<br><br>🍳 <b>Cooking Essentials:</b> Cooking Oil, Ketchup, Soy Sauce, Pasta, Spices, Tomato Paste.<br><br>🧺 <b>Household & Care:</b> Soaps, Detergents, Tissues, Toothpaste, Shampoo.";
      }
      if (q.includes('rice') || q.includes('rise')) { return "Yes! We have premium quality sacks of rice available. We sell it by the sack or by the kilo. Come visit us to see our fresh supply!"; }
      if (q.includes('oil') || q.includes('blue band') || q.includes('margarine')) { return "Yes, we stock pure vegetable cooking oil and Blue Band margarine! We have it in different sizes. Let us know if you need a specific brand."; }
      if (q.includes('fanta') || q.includes('soda') || q.includes('drink') || q.includes('coke') || q.includes('sprite') || q.includes('coca cola')) { return "Yes, we stock Fanta and other sodas. We keep them cold and ready for you! We also carry fresh juices and bottled water."; }
      if (q.includes('ebm') || q.includes('receipt') || q.includes('tax')) { return "Yes! We take tax compliance very seriously. 🧾<br><br><b>Every single sale</b> comes with an official <b>EBM (Electronic Billing Machine) receipt</b>. You can always trust us for transparency!"; }
      if (q.includes('contact') || q.includes('call') || q.includes('whatsapp') || q.includes('message') || q.includes('phone') || q.includes('number')) { return "You can reach us anytime! 📞<br><br>• <b>Call or WhatsApp:</b> +250 789 542 601<br>• <b>Visit us:</b> Kabuye, just below the Kabuye Parish Church.<br><br>We respond to messages quickly! 💬"; }
      if (q.includes('developed') || q.includes('created') || q.includes('developer') || q.includes('who built') || q.includes('gikundiro') || q.includes('pierrot')) { return "The developer who built this website and created me (the AI Assistant) is called <b>Gikundiro Pierrot</b>. He specializes in creating robust, scalable websites and databases. His expertise covers the entire web development lifecycle! 🚀"; }
      if (q.includes('safe') || q.includes('trust') || q.includes('legit') || q.includes('real')) { return "Yes, 100%! Marie Rose Shop is a trusted neighbourhood shop in Kabuye. We take compliance very seriously and provide official EBM receipts for every sale. You are in good hands! 😊"; }
      if (q.includes('return') || q.includes('refund') || q.includes('exchange') || q.includes('wrong item') || q.includes('bring back')) {
        return "If something isn't right with your purchase, bring it back with your EBM receipt as soon as possible and we'll sort it out — a refund, exchange, or replacement, depending on the situation. Just ask for Marie Rose or Pierrot at the counter.";
      }
      if (q.includes('expire') || q.includes('expiry') || q.includes('fresh') || q.includes('best before') || q.includes('old stock')) {
        return "We check our shelves regularly and restock weekly, so everything sold is within date. If you ever spot something close to expiry, please point it out — we'd genuinely want to know!";
      }
      if (q.includes('allerg') || q.includes('ingredient') || q.includes('gluten') || q.includes('sugar free') || q.includes('halal')) {
        return "We can check the label with you at the counter for allergens or ingredients on any specific product — just bring it up when you visit, or tell us the item here and we'll do our best to describe it.";
      }
      if (q.includes('complain') || q.includes('problem with') || q.includes('bad experience') || q.includes('not happy') || q.includes('disappointed')) {
        return "I'm sorry to hear that. Please message us directly on WhatsApp at +250 789 542 601 with details — Marie Rose personally looks at every complaint and wants to make it right.";
      }
      if (q.includes('job') || q.includes('hiring') || q.includes('work here') || q.includes('employment') || q.includes('vacancy')) {
        return "That's great that you're interested! We don't have an online application system, but feel free to visit the shop in person and ask Marie Rose about any current openings.";
      }
      if (q.includes('discount') && (q.includes('today') || q.includes('now') || q.includes('promo') || q.includes('sale') || q.includes('offer'))) {
        return "We don't run flash sales, but our everyday prices are already kept fair and fixed — no surprise markups. Ask at the counter if there's a current bulk deal on any item.";
      }
      if (q.includes('other shop') || q.includes('competitor') || q.includes('cheaper elsewhere') || q.includes('compare')) {
        return "We can't speak for other shops, but we focus on fair fixed prices, official EBM receipts, and quality stock sourced directly — so you always know what you're getting.";
      }
      if (q.includes('when will you have') || q.includes('restock') || q.includes('back in stock') || q.includes('out of stock')) {
        return "Stock is restocked weekly. If something's out right now, message us on WhatsApp (+250 789 542 601) and we can give you a better idea of when it'll be back.";
      }
      if (q.includes('group order') || q.includes('event') || q.includes('wedding') || q.includes('party supplies') || q.includes('large order')) {
        return "Yes, we can help with larger orders for events! Reach out on WhatsApp ahead of time (+250 789 542 601) so we can make sure we have enough stock ready for you.";
      }
      if (q.includes('weather') || q.includes('rain') || q.includes('raining')) {
        return "We're open rain or shine during our normal hours — no weather closures! Stay dry on your way over. ☔";
      }
      if (q.includes('joke') || q.includes('funny') || q.includes('make me laugh')) {
        return "I'll leave the comedy to the professionals 😄 — but I *can* tell you our prices are a real treat! Anything I can help you find today?";
      }
      return "While I don't have the specific answer to that right now, you can call or WhatsApp us directly at +250 789 542 601, or visit our shop in Kabuye (just below the Kabuye Parish Church). The team is always happy to help! 😊";
    }

    else if (lang === 'rw') {
      if (q === 'muraho' || q === 'mwaramutse' || q === 'mwiriwe' || q === 'amakuru' || q === 'bonjour' || q === 'bite' || q.includes('mwaramutse')) {
        return "Muraho! 👋 Ufite uburenganzira bwo kubaza ikintu cyose kijyanye na Marie Rose Shop. Nakubafasha iki uyu munsi?";
      }
      if (q.includes('ukunyomo') || q.includes('ubwenge') || q.includes('ikinyoma') || q.includes('umuswa') || q.includes('fuck') || q.includes('stupid')) {
        return "Ntabwo ndi hano ngo nkubye cyangwa ngo muhangane. Ndi hano kugira ngo nkubafashe mu iserukiramuco rya Marie Rose Shop. Nakubafasha iki?";
      }
      if (q.includes('urakoze') || q.includes('murakoze') || q.includes('thx')) {
        return "Murakoze cyane! 😊 Mube numunsi mwiza!";
      }
      if (q === 'bye' || q === 'goodbye') {
        return "Muraho! 😊 Niba ukeneye ikindi, andika 'Muraho' kugira ngo ukomeze ikiganiro. Mube numunsi mwiza!";
      }
      if (q.includes('uri nde') || q.includes('ni nde') || q.includes('izina')) {
        return "Ndi umuyobozi wa AI wa Marie Rose Shop! 🤖 Nakozwe kugira ngo nkubafashe gusubiza byihuse ibibazo by'ibicuruzwa, aho duherereye, n'amasaha.";
      }
      const productAnswerRw = tryAnswerProductQuestion(q, 'rw');
      if (productAnswerRw) return productAnswerRw;
      if (q.includes('amasaha') || q.includes('gufungura') || q.includes('gufunga') || q.includes('saa') || q.includes('irafungura')) {
        return "Dufunguye iminsi 7 mu cyumweru! 🕘<br><br>• <b>Kuwa mbere - Kuwa gatandatu:</b> 7:00 AM – 9:30 PM<br>• <b>Ku cyumweru:</b> 7:30 AM – 9:00 PM";
      }
      if (q.includes('herereye') || q.includes('ahe') || q.includes('adresse') || q.includes('shaka') || q.includes('ho')) {
        return "Tuherereye i <b>Kabuye, Umurenge wa Jabana, Akarere ka Gasabo, Umujyi wa Kigali, Rwanda</b>.<br><br>Mushobora kutubona hepfo y'<b>Itorero rya Kabuye (Paroisse)</b>. Ni byoroshye kutubona! 😊";
      }
      if (q.includes('kwishyura') || q.includes('amafaranga') || q.includes('momo') || q.includes('ishyura')) {
        return "Twakira amafaranga (Cash), MTN Mobile Money (MoMo Pay), na Airtel Money. Buri kigurishwa cyose giterwa inyemezabwishyu ya EBM.";
      }
      if (q.includes('gutwara') || q.includes('kugera') || q.includes('gurisha mu rugo')) {
        return "Kuri ubu, dukora nk'iduka ryo mu gace ryakira abakiriya batugana. Ntabwo dutanga serivisi yo kugeza ibicuruzwa mu rugo, ariko mwaduhamagara cyangwa mukatwandikira kuri WhatsApp mumenye ko ibyo mukeneye bihari.";
      }
      if (q.includes('gusaba') || q.includes('keneye') || q.includes('kidafite')) {
        return "Yego! Niba ukeneye ikintu runaka, tubwire kuri WhatsApp cyangwa ku murongo wa telephone. Itsinda ryacu rijya kurangura hanze kenshi, rikaba rishobora kukibazanira.";
      }
      if (q.includes('kurangura') || q.includes('wholesale') || q.includes('sack')) {
        return "Yego — ibintu byinshi nk'umuceri, ifu, n'amavuta biboneka mu mifuka minini ku giciro cyiza cyo kurangura. Baza ku murongo wa telephone kugira ngo ubone ibiciro by'ubwinshi.";
      }
      if (q.includes('ibicuruzwa') || q.includes('bikubiye') || q.includes('mugurisha') || q.includes('igurishwa')) {
        return "Dufite ibicuruzwa binyuranye! 🛒 Dufite ibyiciro bikurikira:<br><br>🌾 <b>Ibinyampeke:</b> Umuceri, ifu y'ingano, ifu y'ibigori, isukari, ibishyimbo, umunyu.<br>🥤 <b>Ibinyobwa:</b> Fanta, amajus, icyayi, amata, amazi y'icupa, ikawa.<br>🍳 <b>Ibikoresho byo guteka:</b> Amavuta, ketchup, soya sauce, pasta, ibirungo.<br>🧺 <b>Isukura & Ubuziranire:</b> Isabune, Omo, tissues, toothpaste, shampoing.";
      }
      if (q.includes('ebm') || q.includes('inyemezabwishyu')) {
        return "Yego! Dukurikiza amategeko y'ubusoresha cyane. 🧾<br><br><b>Buri kigurishwa cyose</b> gitangwa n'inyemezabwishyu ya <b>EBM (Electronic Billing Machine)</b>. Mwizere neza!";
      }
      if (q.includes('tuvugishe') || q.includes('hamagara') || q.includes('whatsapp') || q.includes('gutumanira')) {
        return "Mushobora kutugiraho ibihe byose! 📞<br><br>• <b>Guhamagara cyangwa WhatsApp:</b> +250 789 542 601<br>• <b>Kudusura:</b> Kabuye, munsi y'Itorero rya Kabuye.<br><br>Turasubiza vuba! 💬";
      }
      if (q.includes('wakureze') || q.includes('wakoze') || q.includes('umurenge') || q.includes('gikundiro') || q.includes('pierrot')) {
        return "Umukoresha wakoze urubuga ni Gikundiro Pierrot. Yihanga mu gukora no gushushanya urubuga rukomeye kandi rwiza, ndetse no mu bubiko bw'amakuru. Ubuhamya bwe bugera ku nzego zose zo gukora urubuga! 🚀";
      }
      if (q.includes('gusubiza') || q.includes('kugarura') || q.includes('sinishimiye') || q.includes('ntacyo')) {
        return "Niba hari ikintu kitagenze neza ku byo waguze, garuka n'inyemezabwishyu ya EBM vuba bishoboka, tuzabikemura — kwishyura, guhindura, cyangwa gusimbuza. Baza Marie Rose cyangwa Pierrot ku isanduku.";
      }
      if (q.includes('kwangirika') || q.includes('igihe kirenze') || q.includes('gishya')) {
        return "Dukurikirana ibicuruzwa byacu buri gihe kandi tugasubiramo mu cyumweru, bityo byose bigurishwa biracyafite igihe cyabyo. Niba wabonye ikintu cyegereje igihe cyacyo, tubwire — tuzashimira kubimenya!";
      }
      if (q.includes('ibirimo') || q.includes('allergie') || q.includes('gluten')) {
        return "Dushobora kureba hamwe na wowe ibirimo mu gicuruzwa runaka ku isanduku — tubwire icyo kintu, tuzagusobanurira uko bishoboka kose.";
      }
      if (q.includes('umurimo') || q.includes('akazi') || q.includes('gukora hano')) {
        return "Ni byiza ko ubishaka! Nta sisitemu yo gusaba akazi kuri interineti dufite, ariko wasura iduka ukabaza Marie Rose niba hari umwanya uhari.";
      }
      if (q.includes('igabanuka') && (q.includes('uyu munsi') || q.includes('nonaha'))) {
        return "Ntabwo dukora ibiciro by'igihe gito, ariko ibiciro byacu bya buri munsi biramaze kuba byiza kandi bihamye. Baza ku isanduku niba hari amasezerano y'ubwinshi ku gicuruzwa runaka.";
      }
      if (q.includes('izindi duka') || q.includes('gereranya')) {
        return "Ntidushobora kuvuga ku yandi maduka, ariko twibanda ku biciro byizewe bihamye, inyemezabwishyu ya EBM, n'ibicuruzwa byiza biva ahantu heza.";
      }
      if (q.includes('igihe kizaba gihari') || q.includes('kongera kuzana') || q.includes('nta gicuruzwa')) {
        return "Dusubiramo ibicuruzwa buri cyumweru. Niba hari ikintu kidahari ubu, twandikire kuri WhatsApp (+250 789 542 601) tukubwire igihe kizaboneka.";
      }
      if (q.includes('ubukwe') || q.includes('ibirori') || q.includes('itsinda ry\'ibicuruzwa')) {
        return "Yego, dushobora kugufasha mu bicuruzwa byinshi ku birori! Twandikire kuri WhatsApp mbere y'igihe (+250 789 542 601) kugira ngo tumenye neza ko dufite ibihagije.";
      }
      return "Nubwo nta nyishu nyuzuye nfite ubu, mushobora guhamagara cyangwa kutwandikira kuri WhatsApp kuri +250 789 542 601, cyangwa kudusura mu iduka i Kabuye (munsi y'Itorero rya Kabuye). Itsinda ryacu rishobora kubafasha! 😊";
    }

    else if (lang === 'fr') {
      if (q === 'bonjour' || q === 'salut' || q === 'coucou' || q === 'hey' || q.includes('bonjour') || q.includes('bonsoir') || q.includes('bon après-midi')) {
        return "Bonjour ! 👋 Vous êtes libre de poser toutes les questions concernant le site Web de Marie Rose. Comment puis-je vous aider aujourd'hui ?";
      }
      if (q.includes('insulte') || q.includes('con') || q.includes('idiot') || q.includes('salopard') || q.includes('merde') || q.includes('fuck') || q.includes('pute')) {
        return "Je ne suis pas là pour vous insulter ou me battre, s'il vous plaît. Je suis là pour vous aider avec vos achats à la boutique Marie Rose. Comment puis-je vous aider aujourd'hui ?";
      }
      if (q.includes('merci') || q.includes('thx') || q.includes('merci beaucoup')) {
        return "Je vous en prie ! 😊 Passez une excellente journée !";
      }
      if (q === 'bye' || q === 'au revoir') {
        return "Au revoir ! 😊 Si vous avez besoin d'autre chose, tapez simplement 'Bonjour' pour commencer une nouvelle conversation. Passez une bonne journée !";
      }
      if (q.includes('qui êtes-vous') || q.includes('qui es-tu') || q.includes('ton nom')) {
        return "Je suis l'assistant IA officiel de Marie Rose Shop ! 🤖 J'ai été créé pour aider nos clients à obtenir des réponses instantanées sur nos produits, notre emplacement et nos services.";
      }
      const productAnswerFr = tryAnswerProductQuestion(q, 'fr');
      if (productAnswerFr) return productAnswerFr;
      if (q.includes('heure') || q.includes('ouvert') || q.includes('fermé') || q.includes('ouverture')) {
        return "Nous sommes ouverts 7 jours sur 7 ! 🕘<br><br>• <b>Lundi - Samedi :</b> 7h00 – 21h30<br>• <b>Dimanche :</b> 7h30 – 21h00";
      }
      if (q.includes('localisation') || q.includes('où') || q.includes('adresse') || q.includes('trouver')) {
        return "Nous sommes situés à <b>Kabuye, Secteur Jabana, District de Gasabo, Ville de Kigali, Rwanda</b>.<br><br>Vous pouvez nous trouver juste <b>en dessous de l'église paroissiale de Kabuye</b>. C'est très facile à repérer ! 😊";
      }
      if (q.includes('payer') || q.includes('paiement') || q.includes('espèces') || q.includes('momo')) {
        return "Nous acceptons les espèces, MTN Mobile Money (MoMo Pay) et Airtel Money. Chaque paiement est accompagné d'un reçu EBM officiel.";
      }
      if (q.includes('livraison') || q.includes('domicile') || q.includes('livrer')) {
        return "Actuellement, nous fonctionnons comme une boutique de quartier. Nous ne proposons pas de livraison à domicile, mais vous pouvez nous appeler ou nous contacter sur WhatsApp pour vérifier la disponibilité des stocks.";
      }
      if (q.includes('demander') || q.includes('spécifique') || q.includes('pas sur les étagères')) {
        return "Oui ! Si vous avez besoin d'un produit spécifique, faites-le nous savoir via WhatsApp ou au comptoir. Notre équipe d'approvisionnement voyage régulièrement et peut souvent le ramener.";
      }
      if (q.includes('gros') || q.includes('en vrac')) {
        return "Oui — de nombreux articles comme le riz, la farine et l'huile sont disponibles en sacs et en grands contenants à des prix de gros avantageux. Renseignez-vous au comptoir pour les tarifs de gros.";
      }
      if (q.includes('stock') || q.includes('produits') || q.includes('vendre') || q.includes('articles') || q.includes('disponibles')) {
        return "Nous avons une grande variété de produits frais ! 🛒 Voici nos principales catégories :<br><br>🌾 <b>Grains et de base :</b> Riz, farine de blé, farine de maïs, sucre, haricots, sel.<br>🥤 <b>Boissons :</b> Fanta, jus, thé, lait, eau en bouteille, café.<br>🍳 <b>Essentiels de cuisine :</b> Huile de cuisson, ketchup, sauce soja, pâtes, épices.<br>🧺 <b>Universel et Propreté :</b> Savons, détergents, mouchoirs, dentifrice, shampoing.";
      }
      if (q.includes('ebm') || q.includes('reçu')) {
        return "Oui ! Nous prenons la conformité fiscale très au sérieux. 🧾<br><br><b>Chaque vente</b> est accompagnée d'un <b>reçu EBM (Machine de Facturation Électronique) officiel</b>. Vous pouvez nous faire confiance pour la transparence !";
      }
      if (q.includes('contacter') || q.includes('appeler') || q.includes('whatsapp') || q.includes('message')) {
        return "Vous pouvez nous joindre à tout moment ! 📞<br><br>• <b>Appeler ou WhatsApp :</b> +250 789 542 601<br>• <b>Nous visiter :</b> Kabuye, juste en dessous de l'église paroissiale de Kabuye.<br><br>Nous répondons rapidement ! 💬";
      }
      if (q.includes('développé') || q.includes('créé') || q.includes('développeur') || q.includes('gikundiro') || q.includes('pierrot')) {
        return "Le développeur qui a créé ce site Web et m'a créé (l'assistant IA) s'appelle <b>Gikundiro Pierrot</b>. Il est spécialisé dans la création de sites Web et de bases de données robustes et évolutifs ! 🚀";
      }
      if (q.includes('retour') || q.includes('rembours') || q.includes('échange') || q.includes('mauvais article')) {
        return "Si quelque chose ne va pas avec votre achat, rapportez-le avec votre reçu EBM dès que possible et nous trouverons une solution — remboursement, échange ou remplacement. Demandez Marie Rose ou Pierrot au comptoir.";
      }
      if (q.includes('périm') || q.includes('date limite') || q.includes('frais')) {
        return "Nous vérifions régulièrement nos rayons et nous réapprovisionnons chaque semaine, donc tout ce qui est vendu est dans les délais. Si vous repérez quelque chose proche de la date limite, dites-le-nous !";
      }
      if (q.includes('allerg') || q.includes('ingrédient') || q.includes('gluten')) {
        return "Nous pouvons vérifier l'étiquette avec vous au comptoir pour les allergènes ou les ingrédients d'un produit spécifique — dites-le-nous et nous ferons de notre mieux pour vous renseigner.";
      }
      if (q.includes('emploi') || q.includes('embauche') || q.includes('travailler ici') || q.includes('poste')) {
        return "C'est super que cela vous intéresse ! Nous n'avons pas de système de candidature en ligne, mais n'hésitez pas à visiter la boutique et à demander à Marie Rose s'il y a des postes disponibles.";
      }
      if (q.includes('promo') && (q.includes('aujourd') || q.includes('maintenant'))) {
        return "Nous ne faisons pas de ventes flash, mais nos prix quotidiens sont déjà justes et fixes — sans majoration surprise. Demandez au comptoir s'il y a une offre en gros sur un article.";
      }
      if (q.includes('autre magasin') || q.includes('concurrent') || q.includes('comparer')) {
        return "Nous ne pouvons pas parler des autres magasins, mais nous misons sur des prix justes et fixes, des reçus EBM officiels, et des produits de qualité sourcés directement.";
      }
      if (q.includes('réapprovisionn') || q.includes('bientôt disponible') || q.includes('rupture')) {
        return "Le réapprovisionnement se fait chaque semaine. Si un article manque actuellement, contactez-nous sur WhatsApp (+250 789 542 601) et nous pourrons vous dire quand il sera de retour.";
      }
      if (q.includes('événement') || q.includes('mariage') || q.includes('grande commande')) {
        return "Oui, nous pouvons vous aider pour de plus grandes commandes pour vos événements ! Contactez-nous à l'avance sur WhatsApp (+250 789 542 601) pour que nous ayons assez de stock prêt pour vous.";
      }
      return "Bien que je n'aie pas la réponse spécifique pour le moment, vous pouvez nous appeler ou nous envoyer un WhatsApp au +250 789 542 601, ou visiter notre boutique à Kabuye (juste en dessous de l'église paroissiale de Kabuye). L'équipe sera ravie de vous aider ! 😊";
    }
  }

  function handleUserQuery() {
    const query = chatInput.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    chatInput.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.innerHTML = `<div class="bubble typing-indicator"><span>.</span><span>.</span><span>.</span></div>`;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      typingDiv.remove();
      const response = getAIResponse(query);
      addMessage(response, 'bot', true);
    }, 800);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleUserQuery);
  if (chatInput) {
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleUserQuery();
    });
  }
})();

/* ============================================================
   BUTTON RIPPLE MICRO-INTERACTION
   ============================================================ */
(function() {
  'use strict';

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.addEventListener('click', function(e) {
    var target = e.target.closest('.btn, .add-to-list, .lang-btn, .header-cart-btn');
    if (!target) return;

    var existing = target.querySelector('.ripple');
    if (existing) existing.remove();

    var rect = target.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    target.appendChild(ripple);

    ripple.addEventListener('animationend', function() {
      ripple.remove();
    });
  });
})();

/* ============================================================
   PWA INSTALL PROMPT BANNER
   ============================================================ */
(function () {
  'use strict';

  var banner = document.getElementById('installBanner');
  if (!banner) return;

  var installBtn = document.getElementById('installBannerBtn');
  var closeBtn = document.getElementById('installBannerClose');
  var titleEl = document.getElementById('installBannerTitle');
  var subtitleEl = document.getElementById('installBannerSubtitle');

  var DISMISS_KEY = 'mrs-install-dismissed-at';
  var DISMISS_DAYS = 7;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function recentlyDismissed() {
    var raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    var elapsedDays = (Date.now() - parseInt(raw, 10)) / (1000 * 60 * 60 * 24);
    return elapsedDays < DISMISS_DAYS;
  }

  function markDismissed() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) { }
  }

  function showBanner() {
    if (isStandalone() || recentlyDismissed()) return;
    requestAnimationFrame(function () { banner.classList.add('show'); });
  }

  function hideBanner() {
    banner.classList.remove('show');
  }

  if (isStandalone()) return;

  var isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  var isSafari = isIOS && /safari/i.test(window.navigator.userAgent) && !/crios|fxios/i.test(window.navigator.userAgent);

  var deferredPrompt = null;

  if (isIOS && isSafari) {
    titleEl.textContent = 'Install Marie Rose Shop';
    subtitleEl.textContent = 'Tap the Share icon, then "Add to Home Screen".';
    installBtn.textContent = 'Got it';
    installBtn.addEventListener('click', function () {
      hideBanner();
      markDismissed();
    });
    setTimeout(showBanner, 2500);
  } else {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); 
      deferredPrompt = e;
      setTimeout(showBanner, 2500);
    });

    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) { hideBanner(); return; }
      hideBanner();
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
      });
    });
  }

  closeBtn.addEventListener('click', function () {
    hideBanner();
    markDismissed();
  });

  window.addEventListener('appinstalled', function () {
    hideBanner();
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) { }
  });

})();

/* ============================================================
   GALLERY: AUTO-SLIDING FILMSTRIP (MODERN, SEAMLESS LOOP)
   The track holds the 6 real photos followed by an aria-hidden duplicate
   of the same 6, then drifts left via a pure-CSS animation that shifts
   exactly one set width (-50%) and loops without any visible seam.
   JS here only pauses the drift on hover/touch so people can look and
   tap comfortably, and disables it entirely for reduced-motion users.
   ============================================================ */
(function() {
  'use strict';

  const viewport = document.querySelector('.gallery-viewport');
  const track = document.getElementById('galleryTrack');
  if (!viewport || !track) return;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let pauseTimeout = null;

  function pause() {
    track.classList.add('is-paused');
  }

  function resume() {
    track.classList.remove('is-paused');
  }

  if (!isTouchDevice) {
    viewport.addEventListener('mouseenter', pause);
    viewport.addEventListener('mouseleave', function() {
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(resume, 400);
    });
    viewport.addEventListener('focusin', pause);
    viewport.addEventListener('focusout', function() {
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(resume, 400);
    });
  } else {
    viewport.addEventListener('touchstart', function() {
      clearTimeout(pauseTimeout);
      pause();
    }, { passive: true });

    viewport.addEventListener('touchend', function() {
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(resume, 1800);
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      pause();
    } else {
      resume();
    }
  });

})();


/* ============================================================
   TEAM HEADER CAROUSEL - INFINITE HORIZONTAL SLIDER (FIXED)
   Auto-advancing with clickable images
   ============================================================ */
(function() {
  'use strict';

  const track = document.getElementById('teamHeaderTrack');
  const dotsContainer = document.getElementById('teamHeaderDots');
  const prevBtn = document.getElementById('teamHeaderPrev');
  const nextBtn = document.getElementById('teamHeaderNext');
  const progressBar = document.getElementById('teamHeaderProgress');
  const counter = document.getElementById('teamHeaderCounter');
  const carousel = document.getElementById('teamHeaderCarousel');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.team-header-slide'));
  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.innerWidth <= 768;

  let currentIndex = 0;
  let autoplayTimer = null;
  let isAnimating = false;
  let progressWidth = 0;
  let isPaused = false;
  let pauseTimeout = null;

  const AUTOPLAY_MS = isMobile ? 5500 : 5000;

  // ---- Build dots ----
  slides.forEach(function(_, i) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function() {
      if (!isAnimating) goToSlide(i);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  // ---- Update dots ----
  function updateDots() {
    Array.from(dotsContainer.children).forEach(function(d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  // ---- Update counter ----
  function updateCounter() {
    if (counter) {
      counter.textContent = (currentIndex + 1) + ' / ' + slides.length;
    }
  }

  // ---- Go to slide ----
  function goToSlide(index) {
    if (isAnimating) return;
    const len = slides.length;
    const newIndex = ((index % len) + len) % len;
    if (newIndex === currentIndex) return;

    isAnimating = true;
    currentIndex = newIndex;
    
    // Animate track
    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
    
    // Update active states
    slides.forEach(function(s, i) {
      s.classList.toggle('active', i === currentIndex);
    });
    
    updateDots();
    updateCounter();
    resetProgress();

    setTimeout(function() {
      isAnimating = false;
    }, 850);
  }

  // ---- Next/Prev ----
  function nextSlide() {
    if (!isAnimating) goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (!isAnimating) goToSlide(currentIndex - 1);
  }

  // ---- Progress bar ----
  function resetProgress() {
    progressWidth = 0;
    if (progressBar) progressBar.style.width = '0%';
  }

  function updateProgress() {
    const step = 100 / (AUTOPLAY_MS / 100);
    progressWidth = Math.min(100, progressWidth + step);
    if (progressBar) progressBar.style.width = progressWidth + '%';
  }

  // ---- Autoplay ----
  function startAutoplay() {
    if (reducedMotion || isPaused) return;
    stopAutoplay();
    resetProgress();
    autoplayTimer = setInterval(function() {
      updateProgress();
      if (progressWidth >= 100) {
        nextSlide();
      }
    }, 100);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // ---- Pause/Resume ----
  function pauseAutoplay() {
    isPaused = true;
    stopAutoplay();
  }

  function resumeAutoplay() {
    isPaused = false;
    startAutoplay();
  }

  // ---- Click to open lightbox ----
  function openLightboxFromSlide(slide) {
    const img = slide.querySelector('img');
    if (img && typeof window.openLightbox === 'function') {
      window.openLightbox(img);
    }
  }

  // ---- Attach click handlers ----
  slides.forEach(function(slide) {
    // Click handler
    slide.addEventListener('click', function(e) {
      e.stopPropagation();
      // Don't open lightbox if clicking on controls
      if (e.target.closest('.team-header-arrow') || e.target.closest('.team-header-dots')) {
        return;
      }
      openLightboxFromSlide(this);
    });

    // Touch handler for mobile
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchMoved = false;
    
    slide.addEventListener('touchstart', function(e) {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchMoved = false;
    }, { passive: true });

    slide.addEventListener('touchmove', function(e) {
      const touch = e.touches[0];
      if (Math.abs(touch.clientX - touchStartX) > 10) {
        touchMoved = true;
      }
    }, { passive: true });

    slide.addEventListener('touchend', function(e) {
      const touchDuration = Date.now() - touchStartTime;
      // Only open if it was a quick tap (not a swipe)
      if (!touchMoved && touchDuration < 300) {
        // Cancel the browser's follow-up synthetic "click" for this touch.
        // Without this, that click fires a moment later at the same screen
        // point - which the lightbox overlay now covers - and its own
        // backdrop-click-to-close handler immediately closes what we just
        // opened. That's what made taps look like they "did nothing" on
        // real phones (desktop mouse clicks never had this double-fire).
        e.preventDefault();
        openLightboxFromSlide(this);
      }
    }, { passive: false });
  });

  // ---- Arrow buttons ----
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      prevSlide();
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      nextSlide();
      resetAutoplay();
    });
  }

  // ---- Keyboard navigation ----
  if (carousel) {
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        resetAutoplay();
      }
    });
  }

  // ---- Touch/Swipe support ----
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isSwiping = false;

  if (carousel) {
    carousel.addEventListener('touchstart', function(e) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchDeltaX = 0;
      isSwiping = false;
      pauseAutoplay();
    }, { passive: true });

    carousel.addEventListener('touchmove', function(e) {
      const touch = e.touches[0];
      touchDeltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(touchDeltaX) > Math.abs(deltaY) && Math.abs(touchDeltaX) > 10) {
        isSwiping = true;
        e.preventDefault();
      }
    }, { passive: false });

    carousel.addEventListener('touchend', function() {
      const threshold = 40;
      if (isSwiping) {
        if (touchDeltaX > threshold) {
          prevSlide();
        } else if (touchDeltaX < -threshold) {
          nextSlide();
        }
        resetAutoplay();
      } else {
        // It was a tap, resume after a moment
        clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(function() {
          resumeAutoplay();
        }, 1000);
      }
    }, { passive: true });
  }

  // ---- Mouse hover pause (desktop) ----
  if (!isTouchDevice && carousel) {
    carousel.addEventListener('mouseenter', function() {
      pauseAutoplay();
    });

    carousel.addEventListener('mouseleave', function() {
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(function() {
        resumeAutoplay();
      }, 800);
    });
  }

  // ---- Visibility change ----
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // ---- Handle resize ----
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
    }, 200);
  });

  // ---- Initialize ----
  slides.forEach(function(s, i) {
    s.classList.toggle('active', i === 0);
  });
  updateDots();
  updateCounter();
  resetProgress();
  
  setTimeout(function() {
    startAutoplay();
  }, 1500);

  // ---- Cleanup ----
  window.addEventListener('beforeunload', function() {
    stopAutoplay();
  });

})();
/* ============================================================
   ABOUT CAROUSEL - Slide & Fade (Crossfade)
   Auto-advancing with clickable images
   ============================================================ */
(function() {
  'use strict';

  const track = document.getElementById('aboutCarouselTrack');
  const dotsContainer = document.getElementById('aboutCarouselDots');
  const prevBtn = document.getElementById('aboutCarouselPrev');
  const nextBtn = document.getElementById('aboutCarouselNext');
  const progressBar = document.getElementById('aboutCarouselProgress');
  const counter = document.getElementById('aboutSlideCounter');
  const carousel = document.getElementById('aboutCarousel');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.about-slide'));
  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.innerWidth <= 768;

  let currentIndex = 0;
  let autoplayTimer = null;
  let isAnimating = false;
  let progressWidth = 0;
  let isPaused = false;
  let pauseTimeout = null;

  const AUTOPLAY_MS = isMobile ? 5500 : 5000;

  // ---- Build dots ----
  slides.forEach(function(_, i) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function() {
      if (!isAnimating) goToSlide(i);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  // ---- Update dots ----
  function updateDots() {
    Array.from(dotsContainer.children).forEach(function(d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  // ---- Update counter ----
  function updateCounter() {
    if (counter) {
      counter.textContent = (currentIndex + 1) + ' / ' + slides.length;
    }
  }

  // ---- Go to slide ----
  function goToSlide(index) {
    if (isAnimating) return;
    const len = slides.length;
    const newIndex = ((index % len) + len) % len;
    if (newIndex === currentIndex) return;

    isAnimating = true;
    currentIndex = newIndex;
    
    // Animate track
    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
    
    // Update active states
    slides.forEach(function(s, i) {
      s.classList.toggle('active', i === currentIndex);
    });
    
    updateDots();
    updateCounter();
    resetProgress();

    setTimeout(function() {
      isAnimating = false;
    }, 850);
  }

  // ---- Next/Prev ----
  function nextSlide() {
    if (!isAnimating) goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (!isAnimating) goToSlide(currentIndex - 1);
  }

  // ---- Progress bar ----
  function resetProgress() {
    progressWidth = 0;
    if (progressBar) progressBar.style.width = '0%';
  }

  function updateProgress() {
    const step = 100 / (AUTOPLAY_MS / 100);
    progressWidth = Math.min(100, progressWidth + step);
    if (progressBar) progressBar.style.width = progressWidth + '%';
  }

  // ---- Autoplay ----
  function startAutoplay() {
    if (reducedMotion || isPaused) return;
    stopAutoplay();
    resetProgress();
    autoplayTimer = setInterval(function() {
      updateProgress();
      if (progressWidth >= 100) {
        nextSlide();
      }
    }, 100);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // ---- Pause/Resume ----
  function pauseAutoplay() {
    isPaused = true;
    stopAutoplay();
  }

  function resumeAutoplay() {
    isPaused = false;
    startAutoplay();
  }

  // ---- Click to open lightbox ----
  function openLightboxFromSlide(slide) {
    const img = slide.querySelector('img');
    if (img && typeof window.openLightbox === 'function') {
      window.openLightbox(img);
    }
  }

  // ---- Attach click handlers ----
  slides.forEach(function(slide) {
    // Click handler
    slide.addEventListener('click', function(e) {
      e.stopPropagation();
      // Don't open lightbox if clicking on controls
      if (e.target.closest('.about-carousel-arrow') || e.target.closest('.about-carousel-dots')) {
        return;
      }
      openLightboxFromSlide(this);
    });

    // Touch handler for mobile
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchMoved = false;
    
    slide.addEventListener('touchstart', function(e) {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchMoved = false;
    }, { passive: true });

    slide.addEventListener('touchmove', function(e) {
      const touch = e.touches[0];
      if (Math.abs(touch.clientX - touchStartX) > 10) {
        touchMoved = true;
      }
    }, { passive: true });

    slide.addEventListener('touchend', function(e) {
      const touchDuration = Date.now() - touchStartTime;
      // Only open if it was a quick tap (not a swipe)
      if (!touchMoved && touchDuration < 300) {
        // Cancel the browser's follow-up synthetic "click" for this touch.
        // Without this, that click fires a moment later at the same screen
        // point - which the lightbox overlay now covers - and its own
        // backdrop-click-to-close handler immediately closes what we just
        // opened. That's what made taps look like they "did nothing" on
        // real phones (desktop mouse clicks never had this double-fire).
        e.preventDefault();
        openLightboxFromSlide(this);
      }
    }, { passive: false });
  });

  // ---- Arrow buttons ----
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      prevSlide();
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      nextSlide();
      resetAutoplay();
    });
  }

  // ---- Keyboard navigation ----
  if (carousel) {
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        resetAutoplay();
      }
    });
  }

  // ---- Touch/Swipe support ----
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isSwiping = false;

  if (carousel) {
    carousel.addEventListener('touchstart', function(e) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchDeltaX = 0;
      isSwiping = false;
      pauseAutoplay();
    }, { passive: true });

    carousel.addEventListener('touchmove', function(e) {
      const touch = e.touches[0];
      touchDeltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(touchDeltaX) > Math.abs(deltaY) && Math.abs(touchDeltaX) > 10) {
        isSwiping = true;
        e.preventDefault();
      }
    }, { passive: false });

    carousel.addEventListener('touchend', function() {
      const threshold = 40;
      if (isSwiping) {
        if (touchDeltaX > threshold) {
          prevSlide();
        } else if (touchDeltaX < -threshold) {
          nextSlide();
        }
        resetAutoplay();
      } else {
        // It was a tap, resume after a moment
        clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(function() {
          resumeAutoplay();
        }, 1000);
      }
    }, { passive: true });
  }

  // ---- Mouse hover pause (desktop) ----
  if (!isTouchDevice && carousel) {
    carousel.addEventListener('mouseenter', function() {
      pauseAutoplay();
    });

    carousel.addEventListener('mouseleave', function() {
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(function() {
        resumeAutoplay();
      }, 800);
    });
  }

  // ---- Visibility change ----
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // ---- Handle resize ----
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
    }, 200);
  });

  // ---- Initialize ----
  slides.forEach(function(s, i) {
    s.classList.toggle('active', i === 0);
  });
  updateDots();
  updateCounter();
  resetProgress();
  
  setTimeout(function() {
    startAutoplay();
  }, 1500);

  // ---- Cleanup ----
  window.addEventListener('beforeunload', function() {
    stopAutoplay();
  });

})();
/* ============================================================
   HERO BACKGROUND SLIDESHOW (crossfade + Ken Burns zoom)
   Replaces the previous video background with 4 photos that
   fade into one another, each slowly zooming for a premium feel.
   ============================================================ */
(function() {
  'use strict';

  const slideshow = document.getElementById('heroSlideshow');
  if (!slideshow) return;

  const slides = Array.from(slideshow.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  const SLIDE_DURATION = 6000; // ms each photo stays fully visible/zooming
  let timer = null;

  function goToNext() {
    const next = (current + 1) % slides.length;
    slides[current].classList.remove('is-active');
    slides[next].classList.add('is-active');
    current = next;
  }

  function start() {
    if (timer) clearInterval(timer);
    timer = setInterval(goToNext, SLIDE_DURATION);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  if (prefersReducedMotion) {
    // Respect reduced-motion: show the first photo only, no cycling/zoom.
    slideshow.classList.add('reduced-motion');
  } else {
    start();
    // Pause cycling when the tab isn't visible, to save battery/CPU.
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
  }
})();
/* ============================================================
   HERO CONTENT CENTERING FIX
   ============================================================ */
(function() {
  'use strict';
  
  // Ensure hero content is centered on all devices
  function centerHeroContent() {
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.display = 'flex';
      heroContent.style.flexDirection = 'column';
      heroContent.style.alignItems = 'center';
      heroContent.style.justifyContent = 'center';
      heroContent.style.textAlign = 'center';
      heroContent.style.width = '100%';
      heroContent.style.margin = '0 auto';
    }
    
    var ctaRow = document.querySelector('.cta-row');
    if (ctaRow) {
      ctaRow.style.display = 'flex';
      ctaRow.style.flexWrap = 'wrap';
      ctaRow.style.gap = '10px';
      ctaRow.style.justifyContent = 'center';
      ctaRow.style.alignItems = 'center';
      ctaRow.style.width = '100%';
      ctaRow.style.marginTop = '1rem';
    }
  }
  
  // Run on load and resize
  window.addEventListener('load', centerHeroContent);
  window.addEventListener('resize', centerHeroContent);
  
  // Also run after a small delay to ensure everything is rendered
  setTimeout(centerHeroContent, 100);
})();
