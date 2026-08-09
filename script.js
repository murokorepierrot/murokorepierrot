(function() {
  'use strict';

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
    var isOpen = (day >= 1 && day <= 6 && hour >= 6.5 && hour < 21) || (day === 0 && hour >= 8 && hour < 20);
    dot.classList.toggle('closed', !isOpen);
    text.textContent = isOpen
      ? 'Open now \u00B7 Mon\u2013Sat 6:30 AM\u20139:00 PM \u00B7 Sun 8:00 AM\u20138:00 PM'
      : 'Closed now \u00B7 Opens at 6:30 AM';
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

  /* ===========================================================
     PRODUCT SEARCH — Professional search with scroll, highlight,
     keyboard navigation, and toast notifications.
     =========================================================== */
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
      var name = card.querySelector('h4')?.textContent?.trim();
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
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstMatch.classList.add('search-highlight');
      var t = setTimeout(function() {
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
        return;
      }

      var matches = allProductNames.filter(function(n) { return n.toLowerCase().includes(term); });
      showDropdown(matches);

      if (categoriesStage) categoriesStage.classList.add('search-active');
      document.querySelectorAll('.category-block').forEach(function(cat) { cat.classList.add('expanded'); });

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

  /* ===== View More / Collapse ===== */
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

  /* ===== Scroll Reveal Animations ===== */
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

  /* ===== Animated Counters (About badges) ===== */
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

  /* ===== Shopping List (localStorage) ===== */
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
  function renderList() {
    var items = loadList();
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
  /* Add-to-list buttons on product cards */
  document.querySelectorAll('.add-to-list').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = this.dataset.item;
      if (!item) return;
      addItem(item);
      this.textContent = '\u2713 Added';
      this.classList.add('added');
      setTimeout(function() {
        this.textContent = '\uFF0B Add to list';
        this.classList.remove('added');
      }.bind(this), 2000);
    });
  });
  /* Copy list to clipboard */
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
  /* Clear list */
  if (listClear) {
    listClear.addEventListener('click', function() {
      saveList([]);
      renderList();
    });
  }
  renderList();

  /* ===== Request Product Form -> WhatsApp ===== */
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

})();