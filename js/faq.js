// faq.js — эксклюзивные табы категорий + аккордеон вопросов внутри

document.addEventListener('DOMContentLoaded', function () {
  var faqList = document.getElementById('faqList');
  if (!faqList) return;

  var cats = Array.from(faqList.querySelectorAll('.faq-cat'));

  // Инициализация: все категории закрыты
  cats.forEach(function (cat) {
    cat.querySelector('.faq-cat__body').style.maxHeight = '0';
  });

  // Клик по заголовку категории
  cats.forEach(function (cat) {
    var toggle = cat.querySelector('.faq-cat__toggle');
    var body   = cat.querySelector('.faq-cat__body');
    var plus   = cat.querySelector('.faq-cat__plus');

    toggle.addEventListener('click', function () {
      var isOpen = cat.classList.contains('open');

      if (isOpen) {
        // Закрываем — показываем все категории снова
        cat.classList.remove('open');
        body.style.maxHeight = '0';
        plus.textContent = '+';
        cats.forEach(function (c) {
          c.classList.remove('faq-cat--hidden');
        });
      } else {
        // Открываем эту, скрываем остальные
        cats.forEach(function (c) {
          if (c === cat) {
            c.classList.add('open');
            c.classList.remove('faq-cat--hidden');
            var b = c.querySelector('.faq-cat__body');
            b.style.maxHeight = b.scrollHeight + 'px';
            c.querySelector('.faq-cat__plus').textContent = '−';
          } else {
            c.classList.remove('open');
            c.classList.add('faq-cat--hidden');
            c.querySelector('.faq-cat__body').style.maxHeight = '0';
            c.querySelector('.faq-cat__plus').textContent = '+';
          }
        });
      }
    });
  });

  // Аккордеон вопросов внутри открытой категории
  faqList.addEventListener('click', function (e) {
    var qBtn = e.target.closest('.faq-item__q');
    if (!qBtn) return;

    var item    = qBtn.closest('.faq-item');
    var answer  = item.querySelector('.faq-item__a');
    var cat     = item.closest('.faq-cat');
    var catBody = cat.querySelector('.faq-cat__body');
    var isOpen  = item.classList.contains('open');

    // Закрываем все вопросы в этой категории
    cat.querySelectorAll('.faq-item').forEach(function (i) {
      i.classList.remove('open');
      i.querySelector('.faq-item__a').style.maxHeight = '0';
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }

    // Подгоняем высоту тела категории после раскрытия вопроса
    catBody.style.maxHeight = catBody.scrollHeight + 'px';
  });
});
