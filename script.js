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
