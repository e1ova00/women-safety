

(function () {
  var logo = document.querySelector('.header__logo');
  var nav  = document.getElementById('nav');
  if (!logo || !nav) return;

  var isMobile = window.matchMedia('(max-width: 834px)');

  function openMenu() {
    nav.classList.add('nav--open');
    logo.classList.add('header__logo--nav-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('nav--open');
    logo.classList.remove('header__logo--nav-open');
    document.body.style.overflow = '';
  }

  
  logo.addEventListener('click', function (e) {
    if (!isMobile.matches) return;   
    e.preventDefault();
    nav.classList.contains('nav--open') ? closeMenu() : openMenu();
  });

  
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  
  nav.addEventListener('click', function (e) {
    if (e.target === nav) closeMenu();
  });

  
  isMobile.addEventListener('change', function (mq) {
    if (!mq.matches) closeMenu();
  });
})();
