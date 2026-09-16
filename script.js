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

// Проводник портфолио: папки → проекты → карточки
const explorer = document.getElementById('explorer');

if (explorer) {
  const views = {
    root: {
      title: 'Избранные работы',
      lead: 'Выберите направление, чтобы посмотреть подходящие кадры.',
      folders: ['commercial', 'event', 'aerial', 'portrait', 'product'],
      parent: null,
      crumbs: [{ id: 'root', label: 'Портфолио' }]
    },
    portrait: {
      title: 'Портретная съёмка',
      lead: 'Студийные и локационные портреты.',
      category: 'portrait',
      parent: 'root',
      crumbs: [{ id: 'root', label: 'Портфолио' }, { id: 'portrait', label: 'Портретная съёмка' }]
    },
    event: {
      title: 'Репортаж и события',
      lead: 'Репортаж с мероприятий и корпоративов.',
      category: 'event',
      parent: 'root',
      crumbs: [{ id: 'root', label: 'Портфолио' }, { id: 'event', label: 'Репортаж и события' }]
    },
    product: {
      title: 'Предметная съёмка',
      lead: 'Каталоги, украшения и съёмка для брендов.',
      category: 'product',
      parent: 'root',
      crumbs: [{ id: 'root', label: 'Портфолио' }, { id: 'product', label: 'Предметная съёмка' }]
    },
    commercial: {
      title: 'Коммерческая съёмка',
      lead: 'Реклама, имидж бренда и промо для бизнеса.',
      category: 'commercial',
      parent: 'root',
      crumbs: [{ id: 'root', label: 'Портфолио' }, { id: 'commercial', label: 'Коммерческая съёмка' }]
    },
    aerial: {
      title: 'Аэросъёмка с дрона',
      lead: 'Выберите проект.',
      folders: ['moskino'],
      parent: 'root',
      crumbs: [{ id: 'root', label: 'Портфолио' }, { id: 'aerial', label: 'Аэросъёмка с дрона' }]
    },
    moskino: {
      title: 'Москино',
      lead: 'Кинопарк Москино: декорации с воздуха и с земли.',
      series: 'moskino',
      parent: 'aerial',
      crumbs: [
        { id: 'root', label: 'Портфолио' },
        { id: 'aerial', label: 'Аэросъёмка с дрона' },
        { id: 'moskino', label: 'Москино' }
      ]
    }
  };

  const hashes = {
    root: '',
    portrait: 'portrait',
    event: 'event',
    product: 'product',
    commercial: 'commercial',
    aerial: 'aerial',
    moskino: 'aerial/moskino'
  };

  const foldersWrap = document.getElementById('folders');
  const gallery = document.getElementById('gallery');
  const shots = document.querySelectorAll('.shot');
  const folderButtons = document.querySelectorAll('.folder');
  const backBtn = document.getElementById('explorerBack');
  const crumbsPath = document.getElementById('crumbsPath');
  const titleEl = document.getElementById('explorerTitle');
  const leadEl = document.getElementById('explorerLead');
  let currentView = 'root';

  const viewFromHash = () => {
    const hash = location.hash.replace(/^#/, '');
    if (hash === 'aerial/moskino' || hash === 'moskino') return 'moskino';
    if (views[hash]) return hash;
    return 'root';
  };

  const playVisibleMedia = (selector) => {
    document.querySelectorAll(selector).forEach((video) => {
      const tile = video.closest('.folder, .shot');
      if (!tile || tile.hidden || (tile.parentElement && tile.parentElement.hidden)) {
        video.pause();
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
        shot.hidden = shot.dataset.category !== view.category;
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
    btn.addEventListener('click', () => goTo(btn.dataset.go));
  });

  backBtn.addEventListener('click', () => {
    const parent = (views[currentView] || views.root).parent;
    goTo(parent || 'root');
  });

  window.addEventListener('hashchange', () => renderView(viewFromHash()));
  renderView(viewFromHash());
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

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

// Видео-карточки портфолио: превью в сетке и просмотр по клику
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const shotVideos = document.querySelectorAll('.shot__media');

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

shotVideos.forEach((video) => {
  if (reducedMotion) {
    // Без анимации показываем только первый кадр
    video.preload = 'metadata';
    video.load();
    return;
  }

  previewObserver.observe(video);
});

document.querySelectorAll('.folder__media').forEach((video) => {
  if (reducedMotion) {
    video.preload = 'metadata';
    video.load();
    return;
  }

  previewObserver.observe(video);
});

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
    pausedPreviews = [...shotVideos].filter((video) => !video.paused);
    pausedPreviews.forEach((video) => video.pause());

    // В карточке крутится короткий отрывок, в просмотре — полная версия со звуком
    lightboxVideo.src = card.dataset.full || source.getAttribute('src');
    lightboxTitle.textContent = card.dataset.title || title.textContent;
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

  document.querySelectorAll('.shot__open').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(btn.closest('.shot')));
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.hidden && e.key === 'Escape') closeLightbox();
  });
}

// Форма: пока только проверка полей, без отправки
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

    status.textContent = 'Форма заполнена. Отправка будет подключена позже.';
  });
}
