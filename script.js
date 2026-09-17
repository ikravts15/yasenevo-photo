document.getElementById('year').textContent = new Date().getFullYear();

// Фон навигации при прокрутке
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Мобильное меню
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const siteRoot = document.body.classList.contains('page-portfolio') ? '../' : '';

const previewObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;

    if (entry.isIntersecting) {
      const played = video.play();
      if (played) played.catch(() => {});
    } else {
      video.pause();
    }
  });
}, { rootMargin: '100px 0px', threshold: 0.2 });

const bindPreviewVideos = (scope) => {
  scope.querySelectorAll('.shot__media, .folder__media').forEach((video) => {
    if (reducedMotion) {
      video.preload = 'metadata';
      video.load();
      return;
    }

    previewObserver.observe(video);
  });
};

const makePreviewVideo = (src, { autoplay = false, aria } = {}) => {
  const video = document.createElement('video');
  video.src = siteRoot + src;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (aria) video.setAttribute('aria-label', aria);
  else video.setAttribute('aria-hidden', 'true');
  return video;
};

const makeFolderButton = (node) => {
  const btn = document.createElement('button');
  btn.className = 'folder';
  btn.type = 'button';
  btn.dataset.go = node.id;
  btn.hidden = true;

  if (node.stub) {
    btn.dataset.stub = '';
    btn.setAttribute('aria-label', node.aria || `${node.title}, материалы появятся позже`);
  }

  if (node.preview) {
    const video = makePreviewVideo(node.preview, { autoplay: Boolean(node.autoplay) });
    video.className = 'folder__media';
    btn.append(video);
  }

  const caption = document.createElement('span');
  caption.className = 'folder__caption';
  const title = document.createElement('strong');
  title.textContent = node.title;
  const note = document.createElement('span');
  note.textContent = node.caption || 'Открыть';
  caption.append(title, note);
  btn.append(caption);
  return btn;
};

const makeShotCard = (item, category, folder) => {
  const figure = document.createElement('figure');
  figure.className = item.preview ? 'shot shot--video' : 'shot';
  figure.dataset.category = category.id;
  if (folder) figure.dataset.series = folder.id;

  if (item.full) {
    figure.dataset.full = siteRoot + item.full;
    figure.dataset.title = item.lightboxTitle || `${category.title} — ${item.title}`;
  } else {
    figure.setAttribute('role', 'img');
    if (item.aria) figure.setAttribute('aria-label', item.aria);
  }

  if (item.preview) {
    const video = makePreviewVideo(item.preview, {
      autoplay: Boolean(item.autoplay),
      aria: item.aria
    });
    video.className = 'shot__media';
    figure.append(video);
  }

  const caption = document.createElement('figcaption');
  caption.className = 'shot__caption';
  const title = document.createElement('strong');
  title.textContent = item.title;
  const label = document.createElement('span');
  label.textContent = folder ? folder.title : category.title;
  caption.append(title, label);
  figure.append(caption);

  if (item.full) {
    const open = document.createElement('button');
    open.className = 'shot__open';
    open.type = 'button';
    open.setAttribute('aria-label', item.openLabel || `Открыть полное видео: ${item.title}`);
    const play = document.createElement('span');
    play.className = 'shot__play';
    play.setAttribute('aria-hidden', 'true');
    open.append(play);
    figure.append(open);
  }

  return figure;
};

const buildViews = (data) => {
  const views = {
    root: {
      title: data.title,
      lead: data.lead,
      folders: data.categories.map((category) => category.id),
      parent: null,
      crumbs: [{ id: 'root', label: 'Портфолио' }]
    }
  };
  const hashes = { root: '' };

  data.categories.forEach((category) => {
    hashes[category.id] = category.id;
    const view = {
      title: category.title,
      lead: category.lead,
      parent: 'root',
      crumbs: [
        { id: 'root', label: 'Портфолио' },
        { id: category.id, label: category.title }
      ]
    };

    if (category.folders?.length) view.folders = category.folders.map((folder) => folder.id);
    if (category.items?.length) view.category = category.id;
    views[category.id] = view;

    (category.folders || []).forEach((folder) => {
      if (folder.stub) return;
      hashes[folder.id] = `${category.id}/${folder.id}`;
      views[folder.id] = {
        title: folder.title,
        lead: folder.lead,
        series: folder.id,
        parent: category.id,
        crumbs: [
          { id: 'root', label: 'Портфолио' },
          { id: category.id, label: category.title },
          { id: folder.id, label: folder.title }
        ]
      };
    });
  });

  return { views, hashes };
};

const initPortfolio = (data) => {
  const explorer = document.getElementById('explorer');
  const foldersWrap = document.getElementById('folders');
  const gallery = document.getElementById('gallery');
  const backBtn = document.getElementById('explorerBack');
  const crumbsPath = document.getElementById('crumbsPath');
  const titleEl = document.getElementById('explorerTitle');
  const leadEl = document.getElementById('explorerLead');
  const { views, hashes } = buildViews(data);
  let currentView = 'root';

  data.categories.forEach((category) => {
    foldersWrap.append(makeFolderButton(category));
    (category.folders || []).forEach((folder) => {
      foldersWrap.append(makeFolderButton(folder));
    });
    (category.items || []).forEach((item) => {
      gallery.append(makeShotCard(item, category));
    });
    (category.folders || []).forEach((folder) => {
      (folder.items || []).forEach((item) => {
        gallery.append(makeShotCard(item, category, folder));
      });
    });
  });

  const folderButtons = foldersWrap.querySelectorAll('.folder');
  const shots = gallery.querySelectorAll('.shot');

  const viewFromHash = () => {
    const hash = location.hash.replace(/^#/, '');
    if (views[hash]) return hash;
    const last = hash.split('/').pop();
    if (last && views[last]) return last;
    return 'root';
  };

  const playVisibleMedia = (selector) => {
    document.querySelectorAll(selector).forEach((video) => {
      const tile = video.closest('.folder, .shot');
      if (!tile || tile.hidden || (tile.parentElement && tile.parentElement.hidden)) {
        video.pause();
        return;
      }
      if (reducedMotion) return;
      const played = video.play();
      if (played) played.catch(() => {});
    });
  };

  const renderView = (id) => {
    const view = views[id] || views.root;
    currentView = view === views.root ? 'root' : id;

    titleEl.textContent = view.title;
    leadEl.textContent = view.lead;
    backBtn.hidden = !view.parent;

    const showFolders = Boolean(view.folders);
    foldersWrap.hidden = !showFolders;
    folderButtons.forEach((btn) => {
      btn.hidden = !(showFolders && view.folders.includes(btn.dataset.go));
    });

    const showShots = Boolean(view.category || view.series);
    gallery.hidden = !showShots;
    shots.forEach((shot) => {
      if (view.series) {
        shot.hidden = shot.dataset.series !== view.series;
      } else if (view.category) {
        shot.hidden = shot.dataset.category !== view.category || Boolean(shot.dataset.series);
      } else {
        shot.hidden = true;
      }
    });

    crumbsPath.replaceChildren();
    view.crumbs.forEach((crumb, index) => {
      if (index) {
        const sep = document.createElement('span');
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '/';
        crumbsPath.append(sep);
      }

      const last = index === view.crumbs.length - 1;
      if (last) {
        const current = document.createElement('span');
        current.textContent = crumb.label;
        current.setAttribute('aria-current', 'page');
        crumbsPath.append(current);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = crumb.label;
        btn.addEventListener('click', () => goTo(crumb.id));
        crumbsPath.append(btn);
      }
    });

    playVisibleMedia('.folder__media, .shot__media');
  };

  const goTo = (id) => {
    const hash = hashes[id] || '';

    if (hash) {
      if (location.hash.replace(/^#/, '') !== hash) location.hash = hash;
      else renderView(id);
      return;
    }

    if (location.hash) {
      history.pushState('', document.title, location.pathname + location.search);
    }

    renderView('root');
  };

  folderButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.hasAttribute('data-stub')) return;
      goTo(btn.dataset.go);
    });
  });

  backBtn.addEventListener('click', () => {
    const parent = (views[currentView] || views.root).parent;
    goTo(parent || 'root');
  });

  window.addEventListener('hashchange', () => renderView(viewFromHash()));
  bindPreviewVideos(explorer);
  renderView(viewFromHash());
};

const explorer = document.getElementById('explorer');

if (explorer) {
  fetch(`${siteRoot}portfolio-data.json?v=1`)
    .then((response) => {
      if (!response.ok) throw new Error('portfolio-data.json');
      return response.json();
    })
    .then(initPortfolio)
    .catch(() => {
      const titleEl = document.getElementById('explorerTitle');
      const leadEl = document.getElementById('explorerLead');
      if (titleEl) titleEl.textContent = 'Портфолио';
      if (leadEl) leadEl.textContent = 'Не получилось загрузить каталог. Обновите страницу.';
    });
}

// Активный пункт меню по видимой секции
if (!document.body.classList.contains('page-portfolio')) {
  const sections = document.querySelectorAll('main section[id]');
  const menuLinks = navLinks.querySelectorAll('a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      menuLinks.forEach((link) => {
        link.classList.toggle('is-active', link.hash === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => sectionObserver.observe(s));
}

// Плавное появление блоков
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Фоновые видео: играет только то, чей раздел на экране
const bgVideos = document.querySelectorAll('.section-bg__media');

if (reducedMotion) {
  bgVideos.forEach((video) => {
    video.autoplay = false;
    video.pause();
  });
} else {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        const played = video.play();
        if (played) played.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '200px 0px' });

  bgVideos.forEach((video) => videoObserver.observe(video));
}

const lightbox = document.getElementById('lightbox');

if (lightbox) {
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocused = null;
  let pausedPreviews = [];

  const openLightbox = (card) => {
    const source = card.querySelector('.shot__media');
    const title = card.querySelector('.shot__caption strong');

    lastFocused = document.activeElement;
    pausedPreviews = [...document.querySelectorAll('.shot__media')].filter((video) => !video.paused);
    pausedPreviews.forEach((video) => video.pause());

    lightboxVideo.src = card.dataset.full || (source && source.getAttribute('src'));
    lightboxTitle.textContent = card.dataset.title || (title && title.textContent) || '';
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
    lightboxClose.focus();

    lightboxVideo.muted = false;
    const played = lightboxVideo.play();

    if (played) {
      played.catch(() => {
        lightboxVideo.muted = true;
        lightboxVideo.play().catch(() => {});
      });
    }
  };

  const closeLightbox = () => {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
    lightbox.hidden = true;
    document.body.classList.remove('is-locked');

    pausedPreviews.forEach((video) => {
      const played = video.play();
      if (played) played.catch(() => {});
    });
    pausedPreviews = [];

    if (lastFocused) lastFocused.focus();
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.shot__open');
    if (!btn) return;
    const card = btn.closest('.shot');
    if (card) openLightbox(card);
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.hidden && e.key === 'Escape') closeLightbox();
  });
}

if (!explorer) bindPreviewVideos(document);

// Форма заявки: проверка полей и отправка в Formspree без перезагрузки
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);

    if (!String(data.get('name')).trim() || !String(data.get('contact')).trim()) {
      status.textContent = 'Заполните имя и контакт для связи.';
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    status.textContent = 'Отправляю…';

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    })
      .then((response) => {
        if (!response.ok) throw new Error();

        form.querySelectorAll('.field, .form__hint, [type="submit"]').forEach((el) => {
          el.remove();
        });
        status.textContent = 'Спасибо! Я свяжусь с вами в ближайшее время.';

        const portfolio = document.createElement('a');
        portfolio.className = 'btn';
        portfolio.href = 'portfolio/';
        portfolio.textContent = 'Смотреть портфолио';
        form.append(portfolio);
      })
      .catch(() => {
        submitBtn.disabled = false;
        status.textContent = 'Не получилось отправить. Напишите, пожалуйста, другим способом.';
      });
  });
}
