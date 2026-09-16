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

// Фильтр портфолио
const filters = document.querySelectorAll('.filter');
const shots = document.querySelectorAll('.shot');

filters.forEach((btn) => {
  btn.addEventListener('click', () => {
    filters.forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });

    const value = btn.dataset.filter;
    shots.forEach((shot) => {
      shot.hidden = value !== 'all' && shot.dataset.category !== value;
    });
  });
});

// Активный пункт меню по видимой секции
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

const lightbox = document.getElementById('lightbox');
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

  lightboxVideo.src = source.getAttribute('src');
  lightboxTitle.textContent = title.textContent;
  lightbox.hidden = false;
  document.body.classList.add('is-locked');
  lightboxClose.focus();

  const played = lightboxVideo.play();
  if (played) played.catch(() => {});
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

// Форма: пока только проверка полей, без отправки
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);

  if (!String(data.get('name')).trim() || !String(data.get('contact')).trim()) {
    status.textContent = 'Заполните имя и контакт для связи.';
    return;
  }

  status.textContent = 'Форма заполнена. Отправка будет подключена позже.';
});
