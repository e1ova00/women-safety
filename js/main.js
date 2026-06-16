// main.js

/* ─── AOS ─────────────────────────────────────────────────── */
AOS.init({ duration: 700, once: true, offset: 100 });

/* ─── GSAP ────────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── 1. Дорожка: прорисовка сверху вниз при скролле ───────── */
gsap.fromTo('.features__path',
  { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
  {
    clipPath: 'inset(0 0 0% 0)',
    duration: 2.4,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: '.features', start: 'top 60%' }
  }
);

gsap.fromTo('.features__walker',
  { opacity: 0, x: -40 },
  {
    opacity: 1, x: 0, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.features', start: 'top 50%' }
  }
);

/* Персонаж на дорожке: ставим вровень с блоком «Безопасный маршрут».
   Процент от высоты секции ненадёжен (зависит от размеров картинок),
   поэтому измеряем offsetTop route-блока в реальном DOM.           */
(function () {
  var walker   = document.querySelector('.features__walker');
  var route    = document.querySelector('.feature--route');
  var features = document.querySelector('.features');
  if (!walker || !route || !features) return;

  function alignWalker() {
    if (window.innerWidth <= 480) return; /* на мобильном позиция из CSS (top: 40%) */
    var container  = features.querySelector('.container');
    var routeTop   = (container ? container.offsetTop : 0) + route.offsetTop;
    walker.style.top = routeTop + 'px';
  }

  alignWalker();
  window.addEventListener('resize', alignWalker);
})();

/* ── 2. Облака «Почему Women Safety» ── ─────────────────────── */
(function () {
  var whyClouds = Array.from(document.querySelectorAll('.why-cloud'));
  if (!whyClouds.length) return;

  /* Параметры влёта: облака прилетают издалека с вращением и масштабом */
  var entrance = [
    { x: -320, y: 90,  rot: -16, scale: 0.58, dur: 2.0, delay: 0.00 },
    { x:  320, y: 80,  rot:  16, scale: 0.58, dur: 1.9, delay: 0.14 },
    { x: -260, y: 100, rot: -12, scale: 0.62, dur: 2.2, delay: 0.28 },
    { x:  260, y: 90,  rot:  12, scale: 0.62, dur: 2.1, delay: 0.20 }
  ];

  /* Параметры бесконечного плавания после влёта */
  var floatPrms = [
    { dur: 11, fx:  30, fy: -16, fr:  2.8, fs: 0.04 },
    { dur: 14, fx: -24, fy: -18, fr: -2.2, fs: 0.03 },
    { dur: 12, fx:  22, fy: -24, fr:  2.0, fs: 0.05 },
    { dur: 13, fx: -28, fy: -14, fr: -2.5, fs: 0.035 }
  ];

  whyClouds.forEach(function (cloud, i) {
    var e = entrance[i]  || entrance[0];
    var f = floatPrms[i] || floatPrms[0];

    gsap.fromTo(cloud,
      { opacity: 0, x: e.x, y: e.y, scale: e.scale, rotation: e.rot },
      {
        opacity: 1, x: 0, y: 0, scale: 1, rotation: 0,
        duration: e.dur,
        delay: e.delay,
        ease: 'back.out(1.9)',
        scrollTrigger: { trigger: '.why', start: 'top 78%', once: true },
        onComplete: function () {
          gsap.to(cloud, {
            x:        '+=' + f.fx,
            y:        '+=' + f.fy,
            rotation: f.fr,
            scale:    1 + f.fs,
            duration: f.dur,
            ease:     'sine.inOut',
            yoyo:     true,
            repeat:   -1
          });
        }
      }
    );
  });

  /* Мышиный параллакс — облака мягко реагируют на движение курсора.
     Используем CSS-свойство translate (не GSAP x/y), чтобы не конфликтовать
     с бесконечным float выше. CSS Individual Transforms применяются независимо. */
  var depths = [14, 20, 10, 24];
  var whySec = document.querySelector('.why');
  if (!whySec || window.matchMedia('(pointer: coarse)').matches) return;

  whySec.addEventListener('mousemove', function (e) {
    var rect = whySec.getBoundingClientRect();
    var dx = (e.clientX - rect.left  - rect.width  * 0.5) / (rect.width  * 0.5);
    var dy = (e.clientY - rect.top   - rect.height * 0.5) / (rect.height * 0.5);

    whyClouds.forEach(function (cloud, i) {
      var d    = depths[i] || 14;
      var sign = i % 2 === 0 ? 1 : -1;
      cloud.style.transition = 'translate 0.9s cubic-bezier(0.25,0.46,0.45,0.94)';
      cloud.style.translate  = (dx * d * sign) + 'px ' + (dy * d * 0.55 * sign) + 'px';
    });
  });

  whySec.addEventListener('mouseleave', function () {
    whyClouds.forEach(function (cloud) {
      cloud.style.transition = 'translate 1.1s ease';
      cloud.style.translate  = '0px 0px';
    });
  });
})();

/* ── 3. SMS: живой диалог ──────────────────────────────────── */
/*
   Алгоритм для каждого сообщения:
   1. Создаём индикатор набора (div.sms-typing) и вставляем
      его ПРЯМО ПЕРЕД нужным сообщением — на его же стороне.
   2. Плавно показываем индикатор.
   3. Держим его 1.4 с.
   4. Кроссфейд: индикатор исчезает, на его месте появляется
      само сообщение (они оба в одной точке DOM).
   5. Удаляем индикатор из DOM.
   6. Пауза для чтения — только потом следующий шаг.
*/
(function () {
  var howTo = document.querySelector('.how-to');
  if (!howTo) return;

  var msgs = Array.from(howTo.querySelectorAll('.sms:not(.sms-typing)'));
  if (!msgs.length) return;

  // Скрываем все сообщения без занятия места в лэйауте
  msgs.forEach(function (m) { m.style.display = 'none'; });

  var HOLD  = 0.7;   // секунд показываем индикатор набора
  var PAUSE = 1.0;   // секунд пауза после появления сообщения

  // Вспомогательные промисы
  function wait(sec) {
    return new Promise(function (res) { setTimeout(res, sec * 1000); });
  }
  function tw(target, vars) {
    return new Promise(function (res) {
      gsap.to(target, Object.assign({}, vars, { onComplete: res }));
    });
  }

  async function runChat() {
    for (var i = 0; i < msgs.length; i++) {
      var msg    = msgs[i];
      var isLeft = msg.classList.contains('sms--left');

      // ── Индикатор вставляется туда, где будет сообщение ──
      var dot = document.createElement('div');
      dot.className = 'sms ' + (isLeft ? 'sms--left' : 'sms--right') + ' sms-typing';
      dot.innerHTML = '<span class="typing-dot"></span>'
                    + '<span class="typing-dot"></span>'
                    + '<span class="typing-dot"></span>';
      msg.parentNode.insertBefore(dot, msg);   // прямо перед сообщением

      // Показываем индикатор (fade-in снизу)
      gsap.set(dot, { display: 'flex', opacity: 0, y: 8 });
      await tw(dot, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' });

      // Держим пока "печатают"
      await wait(HOLD);

      // Индикатор уходит вверх
      await tw(dot, { opacity: 0, y: -8, duration: 0.1 });

      // Удаляем индикатор — сообщение занимает его место в раскладке
      if (dot.parentNode) dot.parentNode.removeChild(dot);

      // Сообщение появляется снизу с небольшим сдвигом —
      // это маскирует скачок раскладки и выглядит как «вылет из той же точки»
      msg.style.display = '';
      gsap.set(msg, { opacity: 0, y: 16, scale: 0.96 });
      await tw(msg, { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: 'back.out(1.5)' });

      // Пауза: читаем сообщение
      await wait(PAUSE);
    }
  }

  var triggered = false;
  ScrollTrigger.create({
    trigger: howTo,
    start:   'top 65%',
    once:    true,
    onEnter: function () {
      if (!triggered) { triggered = true; runChat(); }
    }
  });
})();

/* ── 4. Кастомный розовый курсор ────────────────────────── */
(function () {
  var cursor = document.getElementById('customCursor');
  if (!cursor) return;

  /* Работает только на устройствах с мышью */
  if (window.matchMedia('(pointer: coarse)').matches) return;

  /* Перемещаем кружок: напрямую через transform — без задержки */
  document.addEventListener('mousemove', function (e) {
    cursor.style.transform =
      'translate(calc(' + e.clientX + 'px - 50%), calc(' + e.clientY + 'px - 50%))';
  });

  /* Увеличиваем на интерактивных элементах */
  document.querySelectorAll('a, button').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      cursor.classList.add('custom-cursor--hover');
    });
    el.addEventListener('mouseleave', function () {
      cursor.classList.remove('custom-cursor--hover');
    });
  });

  /* Прячем при выходе за пределы окна */
  document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });
})();

/* ── 5. Магнитный эффект «Почему нам доверяют» ──────────── */
/*
   Баблы и персонаж плавно отодвигаются от курсора
   и возвращаются на место.

   Ключевой момент: используем CSS-свойство translate
   (не transform), чтобы не конфликтовать с animation: float
   на тех же элементах — они используют transform: translateY.
   CSS Individual Transforms (translate / rotate / scale)
   применяются поверх transform независимо.
*/
(function () {
  var trust = document.querySelector('.trust');
  if (!trust) return;

  var items = Array.from(trust.querySelectorAll('.trust__bubble, .trust__char'));
  if (!items.length) return;

  var STRENGTH = 28;   /* максимальное смещение, px */
  var RADIUS   = 240;  /* радиус влияния курсора, px */

  function resetAll () {
    items.forEach(function (item) {
      item.style.transition = 'translate 0.7s cubic-bezier(0.34,1.56,0.64,1)';
      item.style.translate   = '0px 0px';
    });
  }

  trust.addEventListener('mousemove', function (e) {
    var rect = trust.getBoundingClientRect();
    var mx   = e.clientX - rect.left;
    var my   = e.clientY - rect.top;

    items.forEach(function (item) {
      var ir   = item.getBoundingClientRect();
      var cx   = (ir.left - rect.left) + ir.width  * 0.5;
      var cy   = (ir.top  - rect.top)  + ir.height * 0.5;
      var dx   = mx - cx;
      var dy   = my - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;

      if (dist < RADIUS) {
        var force = (1 - dist / RADIUS) * STRENGTH;
        item.style.transition = 'translate 0.22s ease';
        item.style.translate   =
          (-(dx / dist) * force) + 'px ' + (-(dy / dist) * force) + 'px';
      } else {
        item.style.transition = 'translate 0.5s ease';
        item.style.translate   = '0px 0px';
      }
    });
  });

  trust.addEventListener('mouseleave', resetAll);
})();
