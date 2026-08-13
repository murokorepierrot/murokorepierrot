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

  /* 1. Expand a specific category and turn the button into "Collapse" */
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

  /* 2. Reset the page entirely */
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

  /* 3. Search and scroll directly to the Collapse button */
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

  /* ===========================================================
     LANGUAGE TOGGLE FUNCTIONALITY
     =========================================================== */
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
    /* ===== SEARCH DROPDOWN WIDTH FIX ===== */
  // Force the search dropdown to be the same width as the search input
  if (productSearchInput && searchDropdown) {
    const resizeDropdown = () => {
      const rect = productSearchInput.getBoundingClientRect();
      searchDropdown.style.width = rect.width + 'px';
      searchDropdown.style.minWidth = '300px'; // Ensures it doesn't get too small
    };
    
    // Set width on load and whenever the window resizes
    window.addEventListener('resize', resizeDropdown);
    setTimeout(resizeDropdown, 100); // Run shortly after load
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
   LIGHTBOX - Category-Specific Grouping (Fixed)
   ============================================================ */
(function() {
  'use strict';

  const overlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImage');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  if (!overlay) return;

  // Variable to hold ONLY the images from the clicked category
  let currentGalleryImages = [];
  let currentIndex = 0;

  function updateLightboxImage() {
    if (!currentGalleryImages.length || !currentGalleryImages[currentIndex]) {
      closeLightbox();
      return;
    }
    lightboxImg.src = currentGalleryImages[currentIndex].src;
    lightboxImg.alt = currentGalleryImages[currentIndex].alt || 'Image';
    
    // Show/hide navigation arrows
    if (prevBtn) {
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
    }
    if (nextBtn) {
      nextBtn.style.display = currentIndex === currentGalleryImages.length - 1 ? 'none' : 'flex';
    }
  }

  // Open Lightbox function
  window.openLightbox = function(element) {
    let img;
    if (element.tagName === 'IMG') {
      img = element;
    } else {
      img = element.querySelector('img');
    }
    
    if (!img) return;

    // 1. Get the group of the clicked image (e.g., "gallery", "grains", "beverages")
    const group = img.getAttribute('data-group');
    if (!group) {
        // Fallback if data-group is missing: Build list from all images on page
        currentGalleryImages = Array.from(document.querySelectorAll('.gallery-item img, .product-photo-slot img, .team-card img'));
    } else {
        // 2. Find ALL images with the exact same data-group (including Team images)
        const allImages = document.querySelectorAll('.gallery-item img, .product-photo-slot img, .team-card img, .about-media img, .team-big-img, .footer-media img');
        currentGalleryImages = Array.from(allImages).filter(imgEl => imgEl.getAttribute('data-group') === group);
    }

    // 3. Find the index of the clicked image within this filtered list
    currentIndex = currentGalleryImages.indexOf(img);
    
    // Prevent errors if the image wasn't found
    if (currentIndex === -1 && currentGalleryImages.length > 0) {
        currentIndex = 0;
    }

    updateLightboxImage();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  // Close Lightbox
  window.closeLightbox = function() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Change image (next/prev)
  window.changeLightbox = function(direction) {
    if (!currentGalleryImages.length) return;
    currentIndex += direction;
    
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= currentGalleryImages.length) currentIndex = currentGalleryImages.length - 1;
    
    updateLightboxImage();
  };

  // Event Listeners
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

  // Click on overlay background to close
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  // Keyboard navigation
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

  // Touch swipe support
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

/* ===== AI ASSISTANT CHAT WIDGET LOGIC (MULTI-LINGUAL) ===== */
(function() {
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const popup = document.getElementById('ai-chat-popup');
  const closeBtn = document.getElementById('chat-close-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  const chatBody = document.getElementById('ai-chat-popup').querySelector('.chat-body');

  // Function to detect the current active language
  function getCurrentLanguage() {
    const activeBtn = document.querySelector('.lang-btn.active');
    if (activeBtn) return activeBtn.getAttribute('data-lang');
    return 'en'; // Default to English
  }

  // Toggle open/close
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

  if (toggleBtn) toggleBtn.addEventListener('click', toggleChat);
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

  // ==========================================
  //  MULTI-LINGUAL AI LOGIC ENGINE
  // ==========================================
  function getAIResponse(query) {
    const lang = getCurrentLanguage(); // Detect language
    const q = query.toLowerCase();

    // --- Response Dictionary ---
    const responses = {
      // ENGLISH DICTIONARY
      en: {
        intro: "I'm Marie Rose's AI Assistant! 🤖 I'm here to help you with information about our shop, products, location, and hours. How can I assist you today?",
        hours: "We are open 7 days a week! 🕘<br><br>• <b>Mon - Sat:</b> 7:00 AM – 9:30 PM<br>• <b>Sunday:</b> 7:30 AM – 9:00 PM",
        location: "We are located at <b>Kabuye Cell, Jabana Sector, Gasabo District, Kigali City, Rwanda</b>.<br><br>You can find us just <b>below the Kabuye Parish Church</b>. Come say hello! 😊",
        payment: "We accept multiple payment methods for your convenience:<br>• 💵 <b>Cash</b><br>• 📱 <b>MTN MoMo:</b> 0789542601<br>• 📱 <b>MoMo Pay:</b> 2003223<br>• 🧾 <b>EBM Receipt:</b> Official receipts provided for every purchase!",
        stock: "We have a wide variety of fresh stock! 🛒 Here are our main categories:<br><br>🌾 <b>Grains & Staples:</b> Rice, wheat flour, maize flour, sugar, beans, salt.<br>🥤 <b>Beverages:</b> Fanta, juices, tea, milk, bottled water, coffee.<br>🍳 <b>Cooking Essentials:</b> Cooking oil, ketchup, soy sauce, pasta, spices, tomato paste.<br>🧺 <b>Universal & Clean:</b> Soaps, detergents, tissues, toothpaste, shampoo.",
        contact: "You can reach us anytime! 📞<br><br>• <b>Call or WhatsApp:</b> +250 789 542 601<br>• <b>Visit us:</b> Kabuye, just below the Kabuye Parish Church.<br><br>We respond to messages quickly! 💬",
        ebm: "Yes! We take tax compliance very seriously. 🧾<br><br><b>Every single sale</b> comes with an official <b>EBM (Electronic Billing Machine) receipt</b>. You can trust us for transparency!",
        
        // FAQ ANSWERS
        delivery: "Currently we operate as a walk-in neighbourhood shop. We do not offer home delivery, but you can call or WhatsApp us to check stock availability before visiting.",
        request_item: "Yes! If you need something specific, let us know via WhatsApp or at the counter. Our sourcing team travels regularly and can often bring it in.",
        negotiable: "We keep our prices fair and transparent for everyone. The price on the shelf is the final price — no haggling needed.",
        wholesale: "Yes — many items like rice, flour, and oil are available in sacks and larger containers at wholesale-friendly prices. Ask at the counter for bulk pricing.",
        
        // BACKGROUND STORY
        story: "Marie Rose Shop opened its doors in Kabuye, right here in Jabana Sector, as a small family stall selling a few sacks of rice and flour to neighbours. Today it has grown into a full household-goods and grocery shop — but the idea hasn't changed: stock what families actually need, price it fairly, and treat every customer like a neighbour, because they are. Behind the counter is a small, dedicated team: Marie Rose, the owner, who receives and manages the shop's finances herself; Gikundiro Pierrot, who handles every sale through the EBM (Electronic Billing Machine) so every client gets a proper, official receipt; and two team members who travel abroad to source quality stock at wholesale prices.",
        
        // DEVELOPER INFO
        developer: "The developer who developed me is called Gikundiro Pierrot. He specializes in creating and designing robust, scalable websites and databases. His expertise spans the full development lifecycle, from concept to deployment.",
        
        // POLITE / GREETING / HARASSMENT HANDLING
        greeting: "Hi! 👋 You are free to ask anything related to the Marie Rose website. What can I help you with today?",
        morning: "Good morning! ☀️ You are free to ask anything related to the Marie Rose website. How can I assist you today?",
        afternoon: "Good afternoon! ☀️ You are free to ask anything related to the Marie Rose website. How can I assist you today?",
        evening: "Good evening! 🌙 You are free to ask anything related to the Marie Rose website. How can I assist you today?",
        thanks: "You are very welcome! 😊 Have a blessed day!",
        abuse: "I am not here to insult you. Please be respectful. How can I help you with our shop?",
        fallback: "That's a great question! 🤔<br><br>While I don't have the specific answer to that right now, you can <b>call or WhatsApp us directly at +250 789 542 601</b>, or visit our shop in Kabuye (just below the Kabuye Parish Church). The team is always happy to help! 😊"
      },

      // KINYARWANDA DICTIONARY
      rw: {
        intro: "Ndi umuyobozi wa AI wa Marie! 🤖 Ndi hano kugira ngo nkubafashe amakuru ajyanye n'iduka ryacu, ibicuruzwa, aho duherereye, n'amasaha. Nakubafasha iki?",
        hours: "Dufunguye iminsi 7 mu cyumweru! 🕘<br><br>• <b>Kuwa mbere - Kuwa gatandatu:</b> 7:00 AM – 9:30 PM<br>• <b>Ku cyumweru:</b> 7:30 AM – 9:00 PM",
        location: "Tuherereye i <b>Kabuye, Umurenge wa Jabana, Akarere ka Gasabo, Umujyi wa Kigali, Rwanda</b>.<br><br>Mushobora kutubona hepfo y'<b>Itorero rya Kabuye (Paroisse)</b>. Mwize kudusura! 😊",
        payment: "Twakira uburyo bwinshi bwo kwishyura:<br>• 💵 <b>Amafaranga (Cash)</b><br>• 📱 <b>MTN MoMo:</b> 0789542601<br>• 📱 <b>MoMo Pay:</b> 2003223<br>• 🧾 <b>EBM Receipt:</b> Buri kigurishwa cyose giterwa inyemezabwishyu ya EBM!",
        stock: "Dufite ibicuruzwa binyuranye! 🛒 Dufite ibyiciro bikurikira:<br><br>🌾 <b>Ibinyampeke:</b> Umuceri, ifu y'ingano, ifu y'ibigori, isukari, ibishyimbo, umunyu.<br>🥤 <b>Ibinyobwa:</b> Fanta, amajus, icyayi, amata, amazi y'icupa, ikawa.<br>🍳 <b>Ibikoresho byo guteka:</b> Amavuta, ketchup, soya sauce, pasta, ibirungo.<br>🧺 <b>Isukura & Ubuziranire:</b> Isabune, Omo, tissues, toothpaste, shampoing.",
        contact: "Mushobora kutugiraho ibihe byose! 📞<br><br>• <b>Guhamagara cyangwa WhatsApp:</b> +250 789 542 601<br>• <b>Kudusura:</b> Kabuye, munsi y'Itorero rya Kabuye.<br><br>Turasubiza vuba! 💬",
        ebm: "Yego! Dukurikiza amategeko y'ubusoresha cyane. 🧾<br><br><b>Buri kigurishwa cyose</b> gitangwa n'inyemezabwishyu ya <b>EBM (Electronic Billing Machine)</b>. Mwizere neza!",
        
        // FAQ ANSWERS
        delivery: "Kuri ubu, dukora nk'iduka ryo mu gace ryakira abakiriya batugana. Ntabwo dutanga serivisi yo kugeza ibicuruzwa mu rugo, ariko ushaka ibicuruzwa mwaduhamagara cyangwa mukatwandikira kuri WhatsApp mukabanza kumenya ko ibyo mukeneye bihari mbere yo kudusura.",
        request_item: "Yego! Niba ukeneye ikintu runaka, tubwire kuri WhatsApp cyangwa ku murongo wa telephone. Itsinda ryacu rijya kurangura hanze kenshi, rikaba rishobora kukibazanira.",
        negotiable: "Dushyiraho ibiciro byiza kandi byo hasi kuri buri wese. Igiciro kiri ku bicuruzwa ni cyo giciro cyanyuma — nta guciririkanya kundi.",
        wholesale: "Yego — ibintu byinshi nk'umuceri, ifu, n'amavuta biboneka mu mifuka minini ku giciro cyiza cyo kurangura. Baza ku murongo wa telephone kugira ngo ubone ibiciro by'ubwinshi.",
        
        // BACKGROUND STORY
        story: "Iduka Marie Rose Shop ryafunguye imiryango i Kabuye, hano mu Murenge wa Jabana, ryatangiye ari butiki k'umuryango igurisha ibicuruzwa bya detaye no kubiro nk'umuceri n'ifu ku baturanyi. Uyu munsi ryaragutse riba iduka ryuzuye ry'ibicuruzwa nk'ibikoresho byo murugo iby'isuku n'ibiribwa — ariko intego yacu ntiyahindutse: kugurisha ibicuruzwa byacu ku giciro cyo hasi dore ko tubyikurira mu mahanga. Imbere mw'iduka hari itsinda rito ry'abanyamwete: Marie Rose, wakira amafaranga akaba ari na we ucunga umutungo w'iduka; Gikundiro Pierrot, ukurikirana buri kigurishwa cyose akoresheje imashini ya EBM (Electronic Billing Machine) kugira ngo buri mukiriya ahabwe Inyemezabwishyu ikwiye; ndetse n'abafatanyabikorwa babiri bajya kurangura ibicuruzwa mu mahanga.",
        
        // DEVELOPER INFO
        developer: "Umukoresha wanjye wampfundishije ni Gikundiro Pierrot. Yihanga mu gukora no gushushanya urubuga rukomeye kandi rwiza, ndetse no mu bubiko bw'amakuru. Ubuhamya bwe bugera ku nzego zose zo gukora urubuga, kuva mu gitekerezo kugeza mu gukoresha.",
        
        // POLITE / GREETING / HARASSMENT HANDLING
        greeting: "Muraho! 👋 Ufite uburenganzira bwo kubaza ikintu cyose kijyanye na website ya Marie Rose. Nakubafasha iki uyu munsi?",
        morning: "Mwaramutse! ☀️ Ufite uburenganzira bwo kubaza ikintu cyose kijyanye na website ya Marie Rose. Nakubafasha iki uyu munsi?",
        afternoon: "Mwiriwe! ☀️ Ufite uburenganzira bwo kubaza ikintu cyose kijyanye na website ya Marie Rose. Nakubafasha iki uyu munsi?",
        evening: "Muraho! 🌙 Ufite uburenganzira bwo kubaza ikintu cyose kijyanye na website ya Marie Rose. Nakubafasha iki uyu munsi?",
        thanks: "Murakoze cyane! 😊 Mube numunsi mwiza!",
        abuse: "Ntabwo ndi hano ngo nkubabye. Nimusabwa kwitonda. Nakubafasha iki ku byerekeye iduka ryacu?",
        fallback: "Ikibazo cyiza! 🤔<br><br>Nubwo nta nyishu nyuzuye nfite ubu, mushobora <b>guhama cyangwa kutwandikira kuri WhatsApp kuri +250 789 542 601</b>, cyangwa kudusura mu iduka i Kabuye (munsi y'Itorero rya Kabuye). Itsinda ryacu rishobora kubafasha! 😊"
      },

      // FRENCH DICTIONARY
      fr: {
        intro: "Je suis l'assistant IA de Marie ! 🤖 Je suis là pour vous aider avec des informations sur notre boutique, nos produits, notre emplacement et nos heures. Comment puis-je vous aider aujourd'hui ?",
        hours: "Nous sommes ouverts 7 jours sur 7 ! 🕘<br><br>• <b>Lun - Sam:</b> 7h00 – 21h30<br>• <b>Dimanche:</b> 7h30 – 21h00",
        location: "Nous sommes situés à <b>Kabuye, Secteur Jabana, District de Gasabo, Ville de Kigali, Rwanda</b>.<br><br>Vous pouvez nous trouver juste <b>en dessous de l'église paroissiale de Kabuye</b>. Venez nous dire bonjour ! 😊",
        payment: "Nous acceptons plusieurs modes de paiement pour votre commodité :<br>• 💵 <b>Espèces</b><br>• 📱 <b>MTN MoMo :</b> 0789542601<br>• 📱 <b>MoMo Pay :</b> 2003223<br>• 🧾 <b>Reçu EBM :</b> Des reçus officiels fournis pour chaque achat !",
        stock: "Nous avons une grande variété de produits frais ! 🛒 Voici nos principales catégories :<br><br>🌾 <b>Grains et de base :</b> Riz, farine de blé, farine de maïs, sucre, haricots, sel.<br>🥤 <b>Boissons :</b> Fanta, jus, thé, lait, eau en bouteille, café.<br>🍳 <b>Essentiels de cuisine :</b> Huile de cuisson, ketchup, sauce soja, pâtes, épices.<br>🧺 <b>Universel et Propreté :</b> Savons, détergents, mouchoirs, dentifrice, shampoing.",
        contact: "Vous pouvez nous joindre à tout moment ! 📞<br><br>• <b>Appeler ou WhatsApp :</b> +250 789 542 601<br>• <b>Nous visiter :</b> Kabuye, juste en dessous de l'église paroissiale de Kabuye.<br><br>Nous répondons rapidement ! 💬",
        ebm: "Oui ! Nous prenons la conformité fiscale très au sérieux. 🧾<br><br><b>Chaque vente</b> est accompagnée d'un <b>reçu EBM (Machine de Facturation Électronique) officiel</b>. Vous pouvez nous faire confiance pour la transparence !",
        
        // FAQ ANSWERS
        delivery: "Actuellement, nous fonctionnons comme une boutique de quartier. Nous ne proposons pas de livraison à domicile, mais vous pouvez nous appeler ou nous contacter sur WhatsApp pour vérifier la disponibilité des stocks avant votre visite.",
        request_item: "Oui ! Si vous avez besoin d'un produit spécifique, faites-le nous savoir via WhatsApp ou au comptoir. Notre équipe d'approvisionnement voyage régulièrement et peut souvent le ramener.",
        negotiable: "Nous maintenons des prix équitables et transparents pour tout le monde. Le prix indiqué sur l'étagère est le prix final — pas besoin de marchander.",
        wholesale: "Oui — de nombreux articles comme le riz, la farine et l'huile sont disponibles en sacs et en grands contenants à des prix de gros avantageux. Renseignez-vous au comptoir pour les tarifs de gros.",
        
        // BACKGROUND STORY
        story: "Marie Rose Shop a ouvert ses portes à Kabuye, dans le secteur de Jabana, comme une petite échoppe familiale vendant quelques sacs de riz et de farine aux voisins. Aujourd'hui, elle est devenue une boutique d'épicerie et d'articles ménagers complète — mais l'idée n'a pas changé : stocker ce dont les familles ont besoin, à un prix juste, et traiter chaque client comme un voisin. Derrière le comptoir se trouve une petite équipe dévouée : Marie Rose, la propriétaire, qui gère elle-même les finances du magasin ; Gikundiro Pierrot, qui gère chaque vente via la machine EBM afin que chaque client reçoive un reçu officiel ; et deux membres de l'équipe qui se rendent à l'étranger pour se procurer des produits de qualité à des prix de gros.",
        
        // DEVELOPER INFO
        developer: "Le développeur qui m'a créée s'appelle Gikundiro Pierrot. Il est spécialisé dans la création et la conception de sites Web et de bases de données robustes et évolutifs. Son expertise couvre l'ensemble du cycle de développement, du concept au déploiement.",
        
        // POLITE / GREETING / HARASSMENT HANDLING
        greeting: "Salut ! 👋 Vous êtes libre de poser toutes les questions concernant le site Web de Marie Rose. Comment puis-je vous aider aujourd'hui ?",
        morning: "Bonjour ! ☀️ Vous êtes libre de poser toutes les questions concernant le site Web de Marie Rose. Comment puis-je vous aider aujourd'hui ?",
        afternoon: "Bon après-midi ! ☀️ Vous êtes libre de poser toutes les questions concernant le site Web de Marie Rose. Comment puis-je vous aider aujourd'hui ?",
        evening: "Bonsoir ! 🌙 Vous êtes libre de poser toutes les questions concernant le site Web de Marie Rose. Comment puis-je vous aider aujourd'hui ?",
        thanks: "Je vous en prie ! 😊 Passez une excellente journée !",
        abuse: "Je ne suis pas là pour vous insulter. Veuillez être respectueux. Comment puis-je vous aider avec notre boutique ?",
        fallback: "Excellente question ! 🤔<br><br>Bien que je n'aie pas la réponse spécifique pour le moment, vous pouvez <b>nous appeler ou nous envoyer un WhatsApp au +250 789 542 601</b>, ou visiter notre boutique à Kabuye (juste en dessous de l'église paroissiale de Kabuye). L'équipe sera ravie de vous aider ! 😊"
      }
    };

    // --- Keyword Matching per Language ---
    const currentResponses = responses[lang];

    // English Keywords
    if (lang === 'en') {
      if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('yo')) return currentResponses.greeting;
      if (q.includes('morning')) return currentResponses.morning;
      if (q.includes('afternoon')) return currentResponses.afternoon;
      if (q.includes('evening')) return currentResponses.evening;
      
      if (q.includes('thank') || q.includes('thx')) return currentResponses.thanks;
      if (q.includes('fuck') || q.includes('stupid') || q.includes('idiot') || q.includes('bastard') || q.includes('dumb')) return currentResponses.abuse;
      
      if (q.includes('who are you') || q.includes('what are you') || q.includes('your name')) return currentResponses.intro;
      if (q.includes('hour') || q.includes('open') || q.includes('close') || q.includes('time')) return currentResponses.hours;
      if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('find')) return currentResponses.location;
      if (q.includes('pay') || q.includes('payment') || q.includes('cash') || q.includes('momo')) return currentResponses.payment;
      if (q.includes('stock') || q.includes('have') || q.includes('sell') || q.includes('product') || q.includes('items') || q.includes('available')) return currentResponses.stock;
      if (q.includes('contact') || q.includes('call') || q.includes('whatsapp') || q.includes('message')) return currentResponses.contact;
      if (q.includes('ebm') || q.includes('receipt')) return currentResponses.ebm;
      
      if (q.includes('delivery') || q.includes('home') || q.includes('deliver')) return currentResponses.delivery;
      if (q.includes('request') || q.includes('specific') || q.includes('not on shelf')) return currentResponses.request_item;
      if (q.includes('negotiable') || q.includes('haggle') || q.includes('bargain')) return currentResponses.negotiable;
      if (q.includes('wholesale') || q.includes('bulk')) return currentResponses.wholesale;
      
      if (q.includes('background') || q.includes('story') || q.includes('history') || q.includes('origin')) return currentResponses.story;
      
      if (q.includes('developed you') || q.includes('created you') || q.includes('developer') || q.includes('who built')) return currentResponses.developer;
      if (q.includes('gikundiro') || q.includes('pierrot')) return currentResponses.developer;
    } 
    // Kinyarwanda Keywords
    else if (lang === 'rw') {
      if (q.includes('muraho') || q.includes('mwiriwe') || q.includes('mwaramutse') || q.includes('hi')) return currentResponses.greeting;
      if (q.includes('mwaramutse')) return currentResponses.morning;
      if (q.includes('mwiriwe')) return currentResponses.afternoon;
      
      if (q.includes('urakoze') || q.includes('murakoze') || q.includes('thx')) return currentResponses.thanks;
      if (q.includes('ukunyomo') || q.includes('ubwenge') || q.includes('ikinyoma') || q.includes('umuswa')) return currentResponses.abuse;
      
      if (q.includes('uri nde') || q.includes('ni nde') || q.includes('izina')) return currentResponses.intro;
      if (q.includes('amasaha') || q.includes('gufungura') || q.includes('gufunga') || q.includes('saa')) return currentResponses.hours;
      if (q.includes('ahe') || q.includes('herereye') || q.includes('adresse') || q.includes('shaka')) return currentResponses.location;
      if (q.includes('kwishyura') || q.includes('amafaranga') || q.includes('momo') || q.includes('ishyura')) return currentResponses.payment;
      if (q.includes('ibicuruzwa') || q.includes('bikubiye') || q.includes('mugurisha') || q.includes('igurishwa')) return currentResponses.stock;
      if (q.includes('tuvugishe') || q.includes('hamagara') || q.includes('whatsapp') || q.includes('gutumanira')) return currentResponses.contact;
      if (q.includes('ebm') || q.includes('inyemezabwishyu')) return currentResponses.ebm;
      
      if (q.includes('gutwara') || q.includes('kugera') || q.includes('gurisha mu rugo')) return currentResponses.delivery;
      if (q.includes('gusaba') || q.includes('keneye') || q.includes('kidafite')) return currentResponses.request_item;
      if (q.includes('guciririkanya') || q.includes('kugurisha') || q.includes('bargain')) return currentResponses.negotiable;
      if (q.includes('kurangura') || q.includes('wholesale')) return currentResponses.wholesale;
      
      if (q.includes('inkuru') || q.includes('amateka') || q.includes('byatangiriye') || q.includes('background')) return currentResponses.story;
      
      if (q.includes('wakureze') || q.includes('wakoze') || q.includes('umurenge') || q.includes('gikundiro') || q.includes('pierrot')) return currentResponses.developer;
    } 
    // French Keywords
    else if (lang === 'fr') {
      if (q.includes('salut') || q.includes('bonjour') || q.includes('coucou') || q.includes('hey') || q.includes('hi')) return currentResponses.greeting;
      if (q.includes('bonjour') && q.includes('matin')) return currentResponses.morning;
      if (q.includes('bonjour') && (q.includes('après-midi') || q.includes('apres-midi'))) return currentResponses.afternoon;
      if (q.includes('bonsoir')) return currentResponses.evening;
      
      if (q.includes('merci') || q.includes('thx')) return currentResponses.thanks;
      if (q.includes('insulte') || q.includes('con') || q.includes('idiot') || q.includes('salopard')) return currentResponses.abuse;
      
      if (q.includes('qui êtes-vous') || q.includes('qui es-tu') || q.includes('ton nom')) return currentResponses.intro;
      if (q.includes('heure') || q.includes('ouvert') || q.includes('fermé') || q.includes('ouverture')) return currentResponses.hours;
      if (q.includes('localisation') || q.includes('où') || q.includes('adresse') || q.includes('trouver')) return currentResponses.location;
      if (q.includes('payer') || q.includes('paiement') || q.includes('espèces') || q.includes('momo')) return currentResponses.payment;
      if (q.includes('stock') || q.includes('produits') || q.includes('vendre') || q.includes('articles') || q.includes('disponibles')) return currentResponses.stock;
      if (q.includes('contacter') || q.includes('appeler') || q.includes('whatsapp') || q.includes('message')) return currentResponses.contact;
      if (q.includes('ebm') || q.includes('reçu')) return currentResponses.ebm;
      
      if (q.includes('livraison') || q.includes('domicile') || q.includes('livrer')) return currentResponses.delivery;
      if (q.includes('demander') || q.includes('spécifique') || q.includes('pas sur les étagères')) return currentResponses.request_item;
      if (q.includes('négociable') || q.includes('marchander')) return currentResponses.negotiable;
      if (q.includes('gros') || q.includes('en vrac')) return currentResponses.wholesale;
      
      if (q.includes('histoire') || q.includes('contexte') || q.includes('origine') || q.includes('background')) return currentResponses.story;
      
      if (q.includes('développé') || q.includes('créé') || q.includes('développeur') || q.includes('gikundiro') || q.includes('pierrot')) return currentResponses.developer;
    }

    // Fallback (Always returns the language-specific fallback)
    return currentResponses.fallback;
  }

  // Handle user query
  function handleUserQuery() {
    const query = chatInput.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    chatInput.value = '';

    // Simulate AI "thinking"
    setTimeout(() => {
      const response = getAIResponse(query);
      addMessage(response, 'bot', true);
    }, 600);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleUserQuery);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUserQuery();
    });
  }
})();
