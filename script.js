(function() {
  'use strict';

  /* ===== CLICK-TO-FRONT CARDS =====
     Works like a gallery: tap a card, it pops up cleanly on its own.
     No scroll-triggering, no stacking, no double-tap issues. */
  try {
    function initClickToFrontCards(selector) {
      var cards = document.querySelectorAll(selector);
      if (!cards.length) return;

      var overlay = document.getElementById('cardFocusOverlay');
      var content = document.getElementById('cardFocusContent');
      var closeBtn = document.getElementById('cardFocusClose');
      if (!overlay || !content || !closeBtn) return;

      var activeCard = null;
      var originalParent = null;
      var originalNextSibling = null;
      var touchStartY = 0;
      var isTouching = false;

      function openCard(card) {
        // Prevent opening if the card is already active
        if (activeCard === card) return;

        // If another card is open, close it first
        if (activeCard) closeCard();

        activeCard = card;
        originalParent = card.parentNode;
        originalNextSibling = card.nextSibling;

        content.appendChild(card);
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        card.setAttribute('aria-pressed', 'true');
        closeBtn.focus();
      }

      function closeCard() {
        if (!activeCard) return;
        if (originalNextSibling) {
          originalParent.insertBefore(activeCard, originalNextSibling);
        } else {
          originalParent.appendChild(activeCard);
        }
        activeCard.setAttribute('aria-pressed', 'false');
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeCard = null;
        originalParent = null;
        originalNextSibling = null;
      }

      cards.forEach(function(card) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');

        // Touch events: detect if user is scrolling or tapping
        card.addEventListener('touchstart', function(e) {
          touchStartY = e.touches[0].clientY;
          isTouching = true;
        }, { passive: true });

        card.addEventListener('touchmove', function(e) {
          if (touchStartY) {
            var deltaY = Math.abs(e.touches[0].clientY - touchStartY);
            if (deltaY > 10) {
              isTouching = false; // User is scrolling, not tapping
            }
          }
        }, { passive: true });

        card.addEventListener('touchend', function(e) {
          if (isTouching) {
            e.preventDefault();
            openCard(card);
          }
          isTouching = false;
        }, { passive: false });

        // Click for desktop
        card.addEventListener('click', function(e) {
          e.stopPropagation();
          openCard(card);
        });

        // Keyboard support
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCard(card);
          }
        });
      });

      // Close handlers
      closeBtn.addEventListener('click', closeCard);
      closeBtn.addEventListener('touchend', function(e) {
        e.stopPropagation();
        closeCard();
      }, { passive: true });

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeCard();
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeCard();
      });
    }

    // Initialize all card types
    initClickToFrontCards('.testimonial-card');
    initClickToFrontCards('.why-card');
    initClickToFrontCards('.step-card');

  } catch (err) {
    console.warn('Click-to-front cards failed to initialize:', err);
  }

  /* ===== MODERN LOADER ===== */
  var loader = document.getElementById('page-loader');
  var progressBar = document.getElementById('loaderProgressBar');
  var loaderLabel = document.getElementById('loaderLabel');

  if (loader && progressBar) {
    var progress = 0;
    var steps = [
      { p: 20, label: 'Warming up …' },
      { p: 45, label: 'Loading products …' },
      { p: 70, label: 'Preparing your shop …' },
      { p: 90, label: 'Almost ready …' }
    ];
    var stepIndex = 0;
    var interval = setInterval(function() {
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
  var scrollProgress = document.getElementById('scrollProgress');
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
     PRODUCT SEARCH
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

  var langBtns = document.querySelectorAll('.lang-btn');
  var enElements = document.querySelectorAll('.lang-en');
  var rwElements = document.querySelectorAll('.lang-rw');
  var frElements = document.querySelectorAll('.lang-fr');

  function setLanguage(lang) {
    langBtns.forEach(function(btn) { btn.classList.remove('active'); });
    var activeBtn = document.querySelector('.lang-btn[data-lang="' + lang + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    if (lang === 'en') {
      enElements.forEach(function(el) { el.style.removeProperty('display'); });
      rwElements.forEach(function(el) { el.style.display = 'none'; });
      frElements.forEach(function(el) { el.style.display = 'none'; });
    } else if (lang === 'rw') {
      enElements.forEach(function(el) { el.style.display = 'none'; });
      rwElements.forEach(function(el) { el.style.removeProperty('display'); });
      frElements.forEach(function(el) { el.style.display = 'none'; });
    } else if (lang === 'fr') {
      enElements.forEach(function(el) { el.style.display = 'none'; });
      rwElements.forEach(function(el) { el.style.display = 'none'; });
      frElements.forEach(function(el) { el.style.removeProperty('display'); });
    }
  }

  if (productSearchInput && searchDropdown) {
    var resizeDropdown = function() {
      var rect = productSearchInput.getBoundingClientRect();
      searchDropdown.style.width = rect.width + 'px';
      searchDropdown.style.minWidth = '300px';
    };
    window.addEventListener('resize', resizeDropdown);
    setTimeout(resizeDropdown, 100);
  }

  langBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var lang = this.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  setLanguage('en');

})();

/* ============================================================
   LIGHTBOX - Category-Specific Grouping
   ============================================================ */
(function() {
  'use strict';

  var overlay = document.getElementById('lightboxOverlay');
  var lightboxImg = document.getElementById('lightboxImage');
  var closeBtn = document.querySelector('.lightbox-close');
  var prevBtn = document.querySelector('.lightbox-prev');
  var nextBtn = document.querySelector('.lightbox-next');

  if (!overlay) return;

  var currentGalleryImages = [];
  var currentIndex = 0;

  function updateLightboxImage() {
    if (!currentGalleryImages.length || !currentGalleryImages[currentIndex]) {
      closeLightbox();
      return;
    }
    lightboxImg.src = currentGalleryImages[currentIndex].src;
    lightboxImg.alt = currentGalleryImages[currentIndex].alt || 'Image';
    
    if (prevBtn) {
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
    }
    if (nextBtn) {
      nextBtn.style.display = currentIndex === currentGalleryImages.length - 1 ? 'none' : 'flex';
    }
  }

  window.openLightbox = function(element) {
    var img;
    if (element.tagName === 'IMG') {
      img = element;
    } else {
      img = element.querySelector('img');
    }
    
    if (!img) return;

    var group = img.getAttribute('data-group');
    if (!group) {
        currentGalleryImages = Array.from(document.querySelectorAll('.gallery-item img, .product-photo-slot img, .team-card img'));
    } else {
        var allImages = document.querySelectorAll('.gallery-item img, .product-photo-slot img, .team-card img, .about-media img, .team-big-img, .footer-media img');
        currentGalleryImages = Array.from(allImages).filter(function(imgEl) { return imgEl.getAttribute('data-group') === group; });
    }

    currentIndex = currentGalleryImages.indexOf(img);
    
    if (currentIndex === -1 && currentGalleryImages.length > 0) {
        currentIndex = 0;
    }

    updateLightboxImage();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  window.changeLightbox = function(direction) {
    if (!currentGalleryImages.length) return;
    currentIndex += direction;
    
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= currentGalleryImages.length) currentIndex = currentGalleryImages.length - 1;
    
    updateLightboxImage();
  };

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
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      changeLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      changeLightbox(1);
    }
  });

  var touchStartX = 0;
  var touchEndX = 0;
  
  overlay.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  overlay.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
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

  var toggleBtn = document.getElementById('ai-chat-toggle');
  var popup = document.getElementById('ai-chat-popup');
  var closeBtn = document.getElementById('chat-close-btn');
  var sendBtn = document.getElementById('chat-send-btn');
  var chatInput = document.getElementById('chat-input');
  var chatBody = document.getElementById('ai-chat-popup').querySelector('.chat-body');

  if (!toggleBtn) return;

  function toggleChat() {
    var isOpen = popup.classList.contains('chat-open');
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

  function addMessage(text, sender, isHTML) {
    if (isHTML === undefined) isHTML = false;
    var msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ' + sender;
    msgDiv.innerHTML = '<div class="bubble">' + text + '</div>';
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function getCurrentLanguage() {
    var activeLangBtn = document.querySelector('.lang-btn.active');
    if (activeLangBtn) {
      return activeLangBtn.getAttribute('data-lang');
    }
    return 'en';
  }

  function getAIResponse(query) {
    var lang = getCurrentLanguage();
    var q = query.toLowerCase().trim();

    // ENGLISH
    if (lang === 'en') {
      if (q === 'hi' || q === 'hello' || q === 'hey') {
        return "Hello! 👋 You are free to ask anything about Marie Rose Shop. What can I help you with today?";
      }
      if (q.includes('thank') || q.includes('thx') || q.includes('thanks')) {
        return "You are very welcome! 😊 Thank you for choosing Marie Rose Shop. Have a blessed day!";
      }
      if (q === 'bye' || q === 'goodbye') {
        return "Goodbye! 😊 If you need anything else, just type 'Hi' to start a new chat. Have a blessed day!";
      }
      if (q.includes('who are you') || q.includes('what are you') || q.includes('your name')) {
        return "I am the official AI Assistant for Marie Rose Shop! 🤖 I was created to help our customers get instant answers about our products, location, and services.";
      }
      if (q.includes('hour') || q.includes('open') || q.includes('close') || q.includes('time')) {
        return "We are open 7 days a week! 🕘<br><br>• <b>Monday - Saturday:</b> 7:00 AM – 9:30 PM<br>• <b>Sunday:</b> 7:30 AM – 9:00 PM";
      }
      if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('find')) {
        return "We are located at <b>Kabuye Cell, Jabana Sector, Gasabo District, Kigali City, Rwanda</b>.<br><br>You can find us just <b>below the Kabuye Parish Church</b>.";
      }
      if (q.includes('pay') || q.includes('payment') || q.includes('cash') || q.includes('momo')) {
        return "We accept cash, MTN Mobile Money (MoMo Pay), and Airtel Money. Every payment comes with an official EBM receipt.";
      }
      if (q.includes('delivery') || q.includes('home') || q.includes('deliver')) {
        return "Currently we operate as a walk-in neighbourhood shop. We do not offer home delivery.";
      }
      if (q.includes('ebm') || q.includes('receipt') || q.includes('tax')) {
        return "Yes! 🧾<br><br><b>Every single sale</b> comes with an official <b>EBM (Electronic Billing Machine) receipt</b>.";
      }
      if (q.includes('contact') || q.includes('call') || q.includes('whatsapp') || q.includes('phone')) {
        return "You can reach us anytime! 📞<br><br>• <b>Call or WhatsApp:</b> +250 789 542 601<br>• <b>Visit us:</b> Kabuye, just below the Kabuye Parish Church.";
      }
      return "I'm not sure about that. You can call or WhatsApp us at +250 789 542 601, or visit our shop in Kabuye. The team is always happy to help! 😊";
    }

    // KINYARWANDA
    else if (lang === 'rw') {
      if (q === 'muraho' || q === 'mwaramutse' || q === 'amakuru') {
        return "Muraho! 👋 Ufite uburenganzira bwo kubaza ikintu cyose kijyanye na Marie Rose Shop. Nakubafasha iki uyu munsi?";
      }
      if (q.includes('urakoze') || q.includes('murakoze')) {
        return "Murakoze cyane! 😊 Mube numunsi mwiza!";
      }
      if (q.includes('amasaha') || q.includes('gufungura') || q.includes('gufunga')) {
        return "Dufunguye iminsi 7 mu cyumweru! 🕘<br><br>• <b>Kuwa mbere - Kuwa gatandatu:</b> 7:00 AM – 9:30 PM<br>• <b>Ku cyumweru:</b> 7:30 AM – 9:00 PM";
      }
      if (q.includes('herereye') || q.includes('ahe') || q.includes('adresse')) {
        return "Tuherereye i <b>Kabuye, Umurenge wa Jabana, Akarere ka Gasabo, Umujyi wa Kigali, Rwanda</b>.<br><br>Mushobora kutubona hepfo y'<b>Itorero rya Kabuye</b>.";
      }
      if (q.includes('kwishyura') || q.includes('amafaranga') || q.includes('momo')) {
        return "Twakira amafaranga (Cash), MTN Mobile Money (MoMo Pay), na Airtel Money. Buri kigurishwa cyose giterwa inyemezabwishyu ya EBM.";
      }
      if (q.includes('ebm') || q.includes('inyemezabwishyu')) {
        return "Yego! 🧾<br><br><b>Buri kigurishwa cyose</b> gitangwa n'inyemezabwishyu ya <b>EBM</b>.";
      }
      return "Ntabwo mbizi neza ubu. Mushobora guhamagara cyangwa kutwandikira kuri WhatsApp kuri +250 789 542 601, cyangwa kudusura i Kabuye. Itsinda ryacu rishobora kubafasha! 😊";
    }

    // FRENCH
    else if (lang === 'fr') {
      if (q === 'bonjour' || q === 'salut') {
        return "Bonjour ! 👋 Vous êtes libre de poser toutes les questions concernant Marie Rose. Comment puis-je vous aider aujourd'hui ?";
      }
      if (q.includes('merci')) {
        return "Je vous en prie ! 😊 Passez une excellente journée !";
      }
      if (q.includes('heure') || q.includes('ouvert') || q.includes('fermé')) {
        return "Nous sommes ouverts 7 jours sur 7 ! 🕘<br><br>• <b>Lundi - Samedi :</b> 7h00 – 21h30<br>• <b>Dimanche :</b> 7h30 – 21h00";
      }
      if (q.includes('localisation') || q.includes('où') || q.includes('adresse')) {
        return "Nous sommes situés à <b>Kabuye, Secteur Jabana, District de Gasabo, Ville de Kigali, Rwanda</b>.<br><br>Vous pouvez nous trouver juste <b>en dessous de l'église paroissiale de Kabuye</b>.";
      }
      if (q.includes('payer') || q.includes('paiement') || q.includes('momo')) {
        return "Nous acceptons les espèces, MTN Mobile Money (MoMo Pay) et Airtel Money. Chaque paiement est accompagné d'un reçu EBM officiel.";
      }
      if (q.includes('ebm') || q.includes('reçu')) {
        return "Oui ! 🧾<br><br><b>Chaque vente</b> est accompagnée d'un <b>reçu EBM officiel</b>.";
      }
      return "Je ne suis pas sûr de cela. Vous pouvez nous appeler ou nous envoyer un WhatsApp au +250 789 542 601, ou visiter notre boutique à Kabuye. L'équipe sera ravie de vous aider ! 😊";
    }
  }

  function handleUserQuery() {
    var query = chatInput.value.trim();
    if (!query) return;

    addMessage(query, 'user', false);
    chatInput.value = '';

    var typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.innerHTML = '<div class="bubble typing-indicator"><span>.</span><span>.</span><span>.</span></div>';
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(function() {
      typingDiv.remove();
      var response = getAIResponse(query);
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
