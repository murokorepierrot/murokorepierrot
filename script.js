(function() {
  'use strict';

  /* ===== CLICK-TO-FRONT CARDS =====
     Opens a card in a full-screen overlay only when the user taps/clicks it,
     not while scrolling. */
  try {
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
      let touchMoved = false;

      function openCard(card) {
        if (touchMoved) return;

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

        let touchStartY = 0;

        card.addEventListener('touchstart', function(e) {
          touchMoved = false;
          touchStartY = e.touches[0].clientY;
        }, { passive: true });

        card.addEventListener('touchmove', function(e) {
          if (touchStartY) {
            const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
            if (deltaY > 10) {
              touchMoved = true;
            }
          }
        }, { passive: true });

        card.addEventListener('touchend', function(e) {
          if (!touchMoved) {
            e.preventDefault();
            openCard(card);
          }
        }, { passive: false });

        card.addEventListener('click', function(e) {
          e.stopPropagation();
          openCard(card);
        });

        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCard(card);
          }
        });
      });

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

    initClickToFrontCards('.testimonial-card');
    initClickToFrontCards('.why-card');
    initClickToFrontCards('.step-card');

  } catch (err) {
    console.warn('Click-to-front cards failed to initialize:', err);
  }

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
      ? 'Open now · Mon–Sat 6:30 AM–9:00 PM · Sun 8:00 AM–8:00 PM'
      : 'Closed now · Opens at 6:30 AM';
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

  const langBtns = document.querySelectorAll('.lang-btn');
  const enElements = document.querySelectorAll('.lang-en');
  const rwElements = document.querySelectorAll('.lang-rw');
  const frElements = document.querySelectorAll('.lang-fr');

  function setLanguage(lang) {
    langBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (lang === 'en') {
      enElements.forEach(el => el.style.removeProperty('display'));
      rwElements.forEach(el => el.style.display = 'none');
      frElements.forEach(el => el.style.display = 'none');
    } else if (lang === 'rw') {
      enElements.forEach(el => el.style.display = 'none');
      rwElements.forEach(el => el.style.removeProperty('display'));
      frElements.forEach(el => el.style.display = 'none');
    } else if (lang === 'fr') {
      enElements.forEach(el => el.style.display = 'none');
      rwElements.forEach(el => el.style.display = 'none');
      frElements.forEach(el => el.style.removeProperty('display'));
    }
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

  setLanguage('en');

})();

/* ============================================================
   LIGHTBOX - Category-Specific Grouping
   ============================================================ */
(function() {
  'use strict';

  const overlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImage');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  if (!overlay) return;

  let currentGalleryImages = [];
  let currentIndex = 0;

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
    let img;
    if (element.tagName === 'IMG') {
      img = element;
    } else {
      img = element.querySelector('img');
    }
    
    if (!img) return;

    const group = img.getAttribute('data-group');
    if (!group) {
        currentGalleryImages = Array.from(document.querySelectorAll('.gallery-item img, .product-photo-slot img, .team-card img'));
    } else {
        const allImages = document.querySelectorAll('.gallery-item img, .product-photo-slot img, .team-card img, .about-media img, .team-big-img, .footer-media img');
        currentGalleryImages = Array.from(allImages).filter(imgEl => imgEl.getAttribute('data-group') === group);
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

  let touchStartX = 0;
  let touchEndX = 0;
  
  overlay.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  overlay.addEventListener('touchend', function(e) {
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

  function getAIResponse(query) {
    const lang = getCurrentLanguage();
    const q = query.toLowerCase().trim();

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
