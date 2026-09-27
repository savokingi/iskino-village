const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxLabel = document.querySelector('#lightbox-label');
const lightboxCount = document.querySelector('#lightbox-count');

document.querySelector('#year').textContent = new Date().getFullYear();

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 100);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

function setMenu(open) {
  menuButton.classList.toggle('is-active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.inert = !open;
  document.body.classList.toggle('no-scroll', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
});

const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -55px 0px', threshold: 0.05 });
  revealTargets.forEach(element => observer.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add('is-visible'));
}

const gallery = [
  { src: 'assets/photos/post-5.jpg', alt: 'Дом с панорамными окнами', label: 'ДОМ' },
  { src: 'assets/photos/post-29.jpg', alt: 'Озеро и деревянный пирс', label: 'ОЗЕРО' },
  { src: 'assets/photos/post-6.jpg', alt: 'Гостиная в доме', label: 'ВНУТРИ' },
  { src: 'assets/photos/post-26.jpg', alt: 'Зелёная территория и дома', label: 'ТЕРРИТОРИЯ' }
];
let galleryIndex = 0;
let galleryTrigger = null;

function showGalleryImage(index) {
  galleryIndex = (index + gallery.length) % gallery.length;
  const item = gallery[galleryIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxLabel.textContent = item.label;
  lightboxCount.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
}

document.querySelectorAll('[data-gallery]').forEach(button => {
  button.addEventListener('click', () => {
    galleryTrigger = button;
    showGalleryImage(Number(button.dataset.gallery));
    lightbox.showModal();
    document.body.classList.add('no-scroll');
    document.querySelector('.lightbox-close').focus();
  });
});
document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox-prev').addEventListener('click', () => showGalleryImage(galleryIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => showGalleryImage(galleryIndex + 1));
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('no-scroll');
  galleryTrigger?.focus();
});
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showGalleryImage(galleryIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(galleryIndex + 1);
});

const bookingForm = document.querySelector('#booking-form');
const checkin = document.querySelector('#checkin');
const checkout = document.querySelector('#checkout');
const guests = document.querySelector('#guests');
const errorMessage = document.querySelector('#form-error');
const today = new Date();
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
checkin.min = localToday;
checkout.min = localToday;

function nextDay(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
checkin.addEventListener('change', () => {
  if (!checkin.value) return;
  checkout.min = nextDay(checkin.value);
  if (checkout.value && checkout.value <= checkin.value) checkout.value = '';
  errorMessage.textContent = '';
});
checkout.addEventListener('change', () => { errorMessage.textContent = ''; });
guests.addEventListener('change', () => { errorMessage.textContent = ''; });

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  if (checkout.value <= checkin.value) {
    errorMessage.textContent = 'Дата выезда должна быть позже даты заезда.';
    checkout.focus();
    return;
  }
  const formatDate = value => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  const message = [
    'Здравствуйте! Хочу уточнить свободные даты в Iskino Village.',
    `Заезд: ${formatDate(checkin.value)}`,
    `Выезд: ${formatDate(checkout.value)}`,
    `Гостей: ${guests.value}`,
    document.querySelector('#wants-bath').checked ? 'Также интересует баня.' : null,
    'Подскажите, пожалуйста, актуальную стоимость и условия бронирования.'
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/79669948662?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
