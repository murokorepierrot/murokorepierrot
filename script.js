(function() {
  'use strict';

  /* ===== Page Loader ===== */
  const loader = document.getElementById('page-loader');
  if (loader) {
    window.addEventListener('load', () => loader.classList.add('hidden'));
    setTimeout(() => loader.classList.add('hidden'), 3000);
  }

  /* ===== Scroll Progress Bar ===== */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgress.style.width = percent + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ===== Nav Toggle ===== */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ===== Header shadow on scroll ===== */
  const header = document.getElementById('top');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ===== Hours badge ===== */
  function updateHours() {
    const dot = document.getElementById('hoursDot');
    const text = document.getElementById('hoursText');
    if (!dot || !text) return;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const isOpen = (day >= 1 && day <= 6 && hour >= 6.5 && hour < 21) || (day === 0 && hour >= 8 && hour < 20);
    dot.classList.toggle('closed', !isOpen);
    text.textContent = isOpen
      ? 'Open now \u00B7 Mon\u2013Sat 6:30 AM\u20139:00 PM \u00B7 Sun 8:00 AM\u20138:00 PM'
      : 'Closed now \u00B7 Opens at 6:30 AM';
  }
  updateHours();
  setInterval(updateHours, 60000);

  /* ===== Smooth scroll for in-page anchors ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerEl = document.getElementById('top');
      const offset = (headerEl ? headerEl.offsetHeight : 0) + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      if (mainNav && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ===== Back-to-top ===== */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
  }

  /* ===== Footer year ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== WhatsApp Share (footer) ===== */
  const waShare = document.getElementById('waShare');
  if (waShare) {
    const url = encodeURIComponent(window.location.href);
    const msg = encodeURIComponent('Check out Marie Rose Shop!');
    waShare.href = 'https://wa.me/?text=' + msg + '%20' + url;
  }

  /* ===== Contact Form -> WhatsApp ===== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('cfName').value.trim();
      const msg = document.getElementById('cfMessage').value.trim();
      if (!name || !msg) return;
      const body = encodeURIComponent('Hello Marie Rose Shop, my name is ' + name + '. ' + msg);
      window.open('https://wa.me/250789542601?text=' + body, '_blank');
      this.reset();
    });
  }

  /* ===========================================================
     PRODUCT SEARCH — Professional search with scroll, highlight,
     keyboard navigation, and toast notifications.
     =========================================================== */
  const productSearchInput = document.getElementById('productSearch');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchClear = document.getElementById('searchClear');
  const productGrids = document.querySelectorAll('.product-grid');
  const noResults = document.getElementById('noResults');
  const noResultsTerm = document.getElementById('noResultsTerm');
  const categoriesStage = document.querySelector('.categories-stage');
  const searchToast = document.getElementById('searchToast');

  let allProductNames = [];
  let allProductCards = [];
  productGrids.forEach(grid => {
    grid.querySelectorAll('.product-card').forEach(card => {
      const name = card.querySelector('h4')?.textContent?.trim();
      if (name) {
        allProductNames.push(name);
        allProductCards.push({ name: name.toLowerCase(), card });
      }
    });
  });
  allProductNames = [...new Set(allProductNames)].sort((a, b) => a.localeCompare(b));

  function showToast(message) {
    if (!searchToast) return;
    searchToast.textContent = message;
    searchToast.classList.add('show');
    clearTimeout(searchToast._timer);
    searchToast._timer = setTimeout(() => searchToast.classList.remove('show'), 3200);
  }

  function clearHighlights() {
    document.querySelectorAll('.product-card.search-highlight').forEach(c => c.classList.remove('search-highlight'));
  }

  function expandCategory(card) {
    const categoryBlock = card.closest('.category-block');
    if (!categoryBlock) return;
    if (!categoryBlock.classList.contains('expanded')) {
      categoryBlock.classList.add('expanded');
      const btn = categoryBlock.querySelector('.view-more-btn');
      if (btn) {
        const label = btn.querySelector('.btn-label');
        if (label) label.textContent = 'Collapse';
      }
    }
  }

  function scrollToFirstMatch(term) {
    clearHighlights();
    if (!term) return;
    const termLower = term.toLowerCase().trim();
    if (!termLower) return;

    let firstMatch = null;
    let matchCount = 0;

    allProductCards.forEach(({ name, card }) => {
      if (name.includes(termLower)) {
        matchCount++;
        if (!firstMatch) firstMatch = card;
      }
    });

    if (firstMatch) {
      expandCategory(firstMatch);
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstMatch.classList.add('search-highlight');
      const t = setTimeout(() => {
        firstMatch.classList.remove('search-highlight');
      }, 2200);
      firstMatch._hlTimer = t;

      if (matchCount > 1) {
        showToast('Found ' + matchCount + ' matching products — scrolled to the first one.');
      } else {
        showToast('Found 1 matching product.');
      }
    } else {
      showToast('No matching products found.');
    }
  }

  let activeSuggestionIndex = -1;

  function updateActiveSuggestion() {
    const items = searchDropdown ? searchDropdown.querySelectorAll('.search-suggestion') : [];
    items.forEach((item, idx) => {
      const isActive = idx === activeSuggestionIndex;
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
    matches.slice(0, 8).forEach((name, idx) => {
      const li = document.createElement('li');
      li.className = 'search-suggestion';
      li.textContent = name;
      li.setAttribute('role', 'option');
      li.setAttribute('data-index', String(idx));
      li.setAttribute('aria-selected', 'false');
      li.tabIndex = -1;

      li.addEventListener('click', () => {
        if (productSearchInput) {
          productSearchInput.value = name;
          productSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
          productSearchInput.focus();
        }
        searchDropdown.classList.remove('visible');
        activeSuggestionIndex = -1;
        setTimeout(() => scrollToFirstMatch(name), 120);
      });

      li.addEventListener('keydown', e => {
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
      const term = this.value.toLowerCase().trim();
      if (searchClear) searchClear.style.display = term ? 'block' : 'none';

      if (!term) {
        if (searchDropdown) searchDropdown.classList.remove('visible');
        if (categoriesStage) {
          categoriesStage.classList.remove('search-active');
          document.querySelectorAll('.category-block').forEach(cat => {
            cat.classList.remove('expanded');
            const btn = cat.querySelector('.view-more-btn');
            if (btn) {
              const label = btn.querySelector('.btn-label');
              if (label) label.textContent = btn.dataset.moreLabel || 'View more';
            }
          });
          productGrids.forEach(grid => {
            grid.querySelectorAll('.product-card').forEach(card => {
              card.style.display = '';
              card.classList.remove('search-highlight');
              if (card._hlTimer) clearTimeout(card._hlTimer);
            });
          });
        }
        if (noResults) noResults.hidden = true;
        return;
      }

      const matches = allProductNames.filter(n => n.toLowerCase().includes(term));
      showDropdown(matches);

      if (categoriesStage) categoriesStage.classList.add('search-active');
      document.querySelectorAll('.category-block').forEach(cat => cat.classList.add('expanded'));

      let foundAny = false;
      productGrids.forEach(grid => {
        grid.querySelectorAll('.product-card').forEach(card => {
          const name = (card.dataset.name || card.querySelector('h4')?.textContent || '').toLowerCase();
          const visible = name.includes(term);
          card.style.display = visible ? 'flex' : 'none';
          if (visible) foundAny = true;
        });
      });

      if (noResults) {
        noResults.hidden = foundAny;
        if (noResultsTerm) noResultsTerm.textContent = this.value;
      }
    });

    productSearchInput.addEventListener('keydown', e => {
      const items = searchDropdown ? searchDropdown.querySelectorAll('.search-suggestion') : [];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!searchDropdown || !searchDropdown.classList.contains('visible')) {
          const term = productSearchInput.value.toLowerCase().trim();
          const matches = allProductNames.filter(n => n.toLowerCase().includes(term));
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
          const term = productSearchInput.value.trim();
          if (term) {
            scrollToFirstMatch(term);
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
    searchClear.addEventListener('click', () => {
      if (productSearchInput) {
        productSearchInput.value = '';
        productSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        productSearchInput.focus();
      }
      if (searchDropdown) searchDropdown.classList.remove('visible');
      clearHighlights();
      activeSuggestionIndex = -1;
    });
  }

  /* ===== Click outside to close dropdowns & mobile menu ===== */
  document.addEventListener('click', e => {
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

  /* ===== View More / Collapse ===== */
  document.querySelectorAll('.view-more-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.closest('.category-block');
      if (!parent) return;
      const isExpanded = parent.classList.toggle('expanded');
      const label = this.querySelector('.btn-label');
      if (label) {
        label.textContent = isExpanded ? 'Collapse' : (this.dataset.moreLabel || 'View more');
      }
      if (isExpanded) {
        parent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ===== Scroll Reveal Animations ===== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ===== Animated Counters (About badges) ===== */
  const counters = document.querySelectorAll('.badge-num[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = Math.max(1, Math.floor(target / 30));
        const timer = setInterval(() => {
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
  counters.forEach(c => counterObserver.observe(c));

  /* ===== Shopping List (localStorage) ===== */
  const STORAGE_KEY = 'marierose_shopping_list';
  const listInput = document.getElementById('listInput');
  const listAdd = document.getElementById('listAdd');
  const listItems = document.getElementById('listItems');
  const listEmpty = document.getElementById('listEmpty');
  const listActions = document.getElementById('listActions');
  const listCopy = document.getElementById('listCopy');
  const listClear = document.getElementById('listClear');
  const listWhatsApp = document.getElementById('listWhatsApp');

  function loadList() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveList(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function renderList() {
    const items = loadList();
    if (listItems) listItems.innerHTML = '';
    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = item;
      const rm = document.createElement('button');
      rm.innerHTML = '\u00D7';
      rm.setAttribute('aria-label', 'Remove ' + item);
      rm.title = 'Remove';
      rm.addEventListener('click', () => {
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
      const text = encodeURIComponent('Hello Marie Rose Shop, I would like to buy the following items:\n\n' + items.join('\n'));
      listWhatsApp.href = 'https://wa.me/250789542601?text=' + text;
    }
  }
  function addItem(name) {
    const items = loadList();
    const clean = name.trim();
    if (!clean || items.includes(clean)) return;
    items.push(clean);
    saveList(items);
    renderList();
  }
  if (listAdd && listInput) {
    listAdd.addEventListener('click', () => addItem(listInput.value));
    listInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addItem(listInput.value);
      }
    });
  }
  /* Add-to-list buttons on product cards */
  document.querySelectorAll('.add-to-list').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.dataset.item;
      if (!item) return;
      addItem(item);
      this.textContent = '\u2713 Added';
      this.classList.add('added');
      setTimeout(() => {
        this.textContent = '\uFF0B Add to list';
        this.classList.remove('added');
      }, 2000);
    });
  });
  /* Copy list to clipboard */
  if (listCopy) {
    listCopy.addEventListener('click', () => {
      const items = loadList();
      if (!items.length) return;
      const text = items.join('\n');
      const ok = () => {
        const original = listCopy.textContent;
        listCopy.textContent = 'Copied!';
        setTimeout(() => listCopy.textContent = original, 1500);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(ok).catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok();
      }
    });
  }
  /* Clear list */
  if (listClear) {
    listClear.addEventListener('click', () => {
      saveList([]);(function() {
  'use strict';

  /* ===== Page Loader ===== */
  const loader = document.getElementById('page-loader');
  if (loader) {
    window.addEventListener('load', () => loader.classList.add('hidden'));
    setTimeout(() => loader.classList.add('hidden'), 3000);
  }

  /* ===== Scroll Progress Bar ===== */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgress.style.width = percent + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ===== Nav Toggle ===== */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ===== Header shadow on scroll ===== */
  const header = document.getElementById('top');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ===== Hours badge ===== */
  function updateHours() {
    const dot = document.getElementById('hoursDot');
    const text = document.getElementById('hoursText');
    if (!dot || !text) return;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const isOpen = (day >= 1 && day <= 6 && hour >= 6.5 && hour < 21) || (day === 0 && hour >= 8 && hour < 20);
    dot.classList.toggle('closed', !isOpen);
    text.textContent = isOpen
      ? 'Open now \u00B7 Mon\u2013Sat 6:30 AM\u20139:00 PM \u00B7 Sun 8:00 AM\u20138:00 PM'
      : 'Closed now \u00B7 Opens at 6:30 AM';
  }
  updateHours();
  setInterval(updateHours, 60000);

  /* ===== Smooth scroll for in-page anchors ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerEl = document.getElementById('top');
      const offset = (headerEl ? headerEl.offsetHeight : 0) + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      if (mainNav && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ===== Back-to-top ===== */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
  }

  /* ===== Footer year ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== WhatsApp Share (footer) ===== */
  const waShare = document.getElementById('waShare');
  if (waShare) {
    const url = encodeURIComponent(window.location.href);
    const msg = encodeURIComponent('Check out Marie Rose Shop!');
    waShare.href = 'https://wa.me/?text=' + msg + '%20' + url;
  }

  /* ===== Contact Form -> WhatsApp ===== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('cfName').value.trim();
      const msg = document.getElementById('cfMessage').value.trim();
      if (!name || !msg) return;
      const body = encodeURIComponent('Hello Marie Rose Shop, my name is ' + name + '. ' + msg);
      window.open('https://wa.me/250789542601?text=' + body, '_blank');
      this.reset();
    });
  }

  /* ===========================================================
     PRODUCT SEARCH — Professional search with scroll, highlight,
     keyboard navigation, and toast notifications.
     =========================================================== */
  const productSearchInput = document.getElementById('productSearch');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchClear = document.getElementById('searchClear');
  const productGrids = document.querySelectorAll('.product-grid');
  const noResults = document.getElementById('noResults');
  const noResultsTerm = document.getElementById('noResultsTerm');
  const categoriesStage = document.querySelector('.categories-stage');
  const searchToast = document.getElementById('searchToast');

  let allProductNames = [];
  let allProductCards = [];
  productGrids.forEach(grid => {
    grid.querySelectorAll('.product-card').forEach(card => {
      const h4Name = card.querySelector('h4')?.textContent?.trim();
      const searchName = (card.dataset.name || h4Name || '').toLowerCase().trim();
      if (searchName) {
        if (h4Name) allProductNames.push(h4Name);
        allProductCards.push({ searchName, h4Name, card });
      }
    });
  });
  allProductNames = [...new Set(allProductNames)].sort((a, b) => a.localeCompare(b));

  function showToast(message) {
    if (!searchToast) return;
    searchToast.textContent = message;
    searchToast.classList.add('show');
    clearTimeout(searchToast._timer);
    searchToast._timer = setTimeout(() => searchToast.classList.remove('show'), 3200);
  }

  function clearHighlights() {
    document.querySelectorAll('.product-card.search-highlight').forEach(c => c.classList.remove('search-highlight'));
  }

  function expandCategory(card) {
    const categoryBlock = card.closest('.category-block');
    if (!categoryBlock) return;
    if (!categoryBlock.classList.contains('expanded')) {
      categoryBlock.classList.add('expanded');
      const btn = categoryBlock.querySelector('.view-more-btn');
      if (btn) {
        const label = btn.querySelector('.btn-label');
        if (label) label.textContent = 'Collapse';
      }
    }
  }

  function scrollToFirstMatch(term) {
    clearHighlights();
    if (!term) return;
    const termLower = term.toLowerCase().trim();
    if (!termLower) return;

    let firstMatch = null;
    let matchCount = 0;

    allProductCards.forEach(({ searchName, card }) => {
      if (searchName.includes(termLower)) {
        matchCount++;
        if (!firstMatch) firstMatch = card;
      }
    });

    if (firstMatch) {
      expandCategory(firstMatch);
      // Ensure the card is visible before scrolling (defensive fix in case input handler hid it)
      firstMatch.style.display = '';
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstMatch.classList.add('search-highlight');
      const t = setTimeout(() => {
        firstMatch.classList.remove('search-highlight');
      }, 2200);
      firstMatch._hlTimer = t;

      if (matchCount > 1) {
        showToast('Found ' + matchCount + ' matching products — scrolled to the first one.');
      } else {
        showToast('Found 1 matching product.');
      }
    } else {
      showToast('No matching products found.');
    }
  }

  let activeSuggestionIndex = -1;

  function updateActiveSuggestion() {
    const items = searchDropdown ? searchDropdown.querySelectorAll('.search-suggestion') : [];
    items.forEach((item, idx) => {
      const isActive = idx === activeSuggestionIndex;
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
    matches.slice(0, 8).forEach((name, idx) => {
      const li = document.createElement('li');
      li.className = 'search-suggestion';
      li.textContent = name;
      li.setAttribute('role', 'option');
      li.setAttribute('data-index', String(idx));
      li.setAttribute('aria-selected', 'false');
      li.tabIndex = -1;

      li.addEventListener('click', () => {
        if (productSearchInput) {
          productSearchInput.value = name;
          productSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
          productSearchInput.focus();
        }
        searchDropdown.classList.remove('visible');
        activeSuggestionIndex = -1;
        // Small delay lets the input handler finish expanding categories and showing cards
        setTimeout(() => scrollToFirstMatch(name), 180);
      });

      li.addEventListener('keydown', e => {
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
      const term = this.value.toLowerCase().trim();
      if (searchClear) searchClear.style.display = term ? 'block' : 'none';

      if (!term) {
        if (searchDropdown) searchDropdown.classList.remove('visible');
        if (categoriesStage) {
          categoriesStage.classList.remove('search-active');
          document.querySelectorAll('.category-block').forEach(cat => {
            cat.classList.remove('expanded');
            const btn = cat.querySelector('.view-more-btn');
            if (btn) {
              const label = btn.querySelector('.btn-label');
              if (label) label.textContent = btn.dataset.moreLabel || 'View more';
            }
          });
          productGrids.forEach(grid => {
            grid.querySelectorAll('.product-card').forEach(card => {
              card.style.display = '';
              card.classList.remove('search-highlight');
              if (card._hlTimer) clearTimeout(card._hlTimer);
            });
          });
        }
        if (noResults) noResults.hidden = true;
        return;
      }

      const matches = allProductNames.filter(n => n.toLowerCase().includes(term));
      showDropdown(matches);

      if (categoriesStage) categoriesStage.classList.add('search-active');
      document.querySelectorAll('.category-block').forEach(cat => cat.classList.add('expanded'));

      let foundAny = false;
      productGrids.forEach(grid => {
        grid.querySelectorAll('.product-card').forEach(card => {
          const name = (card.dataset.name || card.querySelector('h4')?.textContent || '').toLowerCase();
          const visible = name.includes(term);
          card.style.display = visible ? 'flex' : 'none';
          if (visible) foundAny = true;
        });
      });

      if (noResults) {
        noResults.hidden = foundAny;
        if (noResultsTerm) noResultsTerm.textContent = this.value;
      }
    });

    productSearchInput.addEventListener('keydown', e => {
      const items = searchDropdown ? searchDropdown.querySelectorAll('.search-suggestion') : [];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!searchDropdown || !searchDropdown.classList.contains('visible')) {
          const term = productSearchInput.value.toLowerCase().trim();
          const matches = allProductNames.filter(n => n.toLowerCase().includes(term));
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
          const term = productSearchInput.value.trim();
          if (term) {
            // Ensure categories are expanded and matching cards are visible before scrolling
            if (categoriesStage) categoriesStage.classList.add('search-active');
            document.querySelectorAll('.category-block').forEach(cat => cat.classList.add('expanded'));
            productGrids.forEach(grid => {
              grid.querySelectorAll('.product-card').forEach(card => {
                const cardName = (card.dataset.name || card.querySelector('h4')?.textContent || '').toLowerCase();
                card.style.display = cardName.includes(term.toLowerCase()) ? 'flex' : 'none';
              });
            });
            setTimeout(() => scrollToFirstMatch(term), 50);
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
    searchClear.addEventListener('click', () => {
      if (productSearchInput) {
        productSearchInput.value = '';
        productSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        productSearchInput.focus();
      }
      if (searchDropdown) searchDropdown.classList.remove('visible');
      clearHighlights();
      activeSuggestionIndex = -1;
    });
  }

  /* ===== Click outside to close dropdowns & mobile menu ===== */
  document.addEventListener('click', e => {
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

  /* ===== View More / Collapse ===== */
  document.querySelectorAll('.view-more-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.closest('.category-block');
      if (!parent) return;
      const isExpanded = parent.classList.toggle('expanded');
      const label = this.querySelector('.btn-label');
      if (label) {
        label.textContent = isExpanded ? 'Collapse' : (this.dataset.moreLabel || 'View more');
      }
      if (isExpanded) {
        parent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ===== Scroll Reveal Animations ===== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ===== Animated Counters (About badges) ===== */
  const counters = document.querySelectorAll('.badge-num[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = Math.max(1, Math.floor(target / 30));
        const timer = setInterval(() => {
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
  counters.forEach(c => counterObserver.observe(c));

  /* ===== Shopping List (localStorage) ===== */
  const STORAGE_KEY = 'marierose_shopping_list';
  const listInput = document.getElementById('listInput');
  const listAdd = document.getElementById('listAdd');
  const listItems = document.getElementById('listItems');
  const listEmpty = document.getElementById('listEmpty');
  const listActions = document.getElementById('listActions');
  const listCopy = document.getElementById('listCopy');
  const listClear = document.getElementById('listClear');
  const listWhatsApp = document.getElementById('listWhatsApp');

  function loadList() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveList(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function renderList() {
    const items = loadList();
    if (listItems) listItems.innerHTML = '';
    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = item;
      const rm = document.createElement('button');
      rm.innerHTML = '\u00D7';
      rm.setAttribute('aria-label', 'Remove ' + item);
      rm.title = 'Remove';
      rm.addEventListener('click', () => {
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
      const text = encodeURIComponent('Hello Marie Rose Shop, I would like to buy the following items:\n\n' + items.join('\n'));
      listWhatsApp.href = 'https://wa.me/250789542601?text=' + text;
    }
  }
  function addItem(name) {
    const items = loadList();
    const clean = name.trim();
    if (!clean || items.includes(clean)) return;
    items.push(clean);
    saveList(items);
    renderList();
  }
  if (listAdd && listInput) {
    listAdd.addEventListener('click', () => addItem(listInput.value));
    listInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addItem(listInput.value);
      }
    });
  }
  /* Add-to-list buttons on product cards */
  document.querySelectorAll('.add-to-list').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.dataset.item;
      if (!item) return;
      addItem(item);
      this.textContent = '\u2713 Added';
      this.classList.add('added');
      setTimeout(() => {
        this.textContent = '\uFF0B Add to list';
        this.classList.remove('added');
      }, 2000);
    });
  });
  /* Copy list to clipboard */
  if (listCopy) {
    listCopy.addEventListener('click', () => {
      const items = loadList();
      if (!items.length) return;
      const text = items.join('\n');
      const ok = () => {
        const original = listCopy.textContent;
        listCopy.textContent = 'Copied!';
        setTimeout(() => listCopy.textContent = original, 1500);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(ok).catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok();
      }
    });
  }
  /* Clear list */
  if (listClear) {
    listClear.addEventListener('click', () => {
      saveList([]);
      renderList();
    });
  }
  renderList();

  /* ===== Request Product Form -> WhatsApp ===== */
  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    requestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('reqName').value.trim();
      const item = document.getElementById('reqItem').value.trim();
      if (!name || !item) return;
      const body = encodeURIComponent('Hello Marie Rose Shop, my name is ' + name + '. I am looking for: ' + item + '. Can you please source it for me?');
      window.open('https://wa.me/250789542601?text=' + body, '_blank');
      this.reset();
    });
  }

})();
      renderList();
    });
  }
  renderList();

  /* ===== Request Product Form -> WhatsApp ===== */
  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    requestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('reqName').value.trim();
      const item = document.getElementById('reqItem').value.trim();
      if (!name || !item) return;
      const body = encodeURIComponent('Hello Marie Rose Shop, my name is ' + name + '. I am looking for: ' + item + '. Can you please source it for me?');
      window.open('https://wa.me/250789542601?text=' + body, '_blank');
      this.reset();
    });
  }

})();