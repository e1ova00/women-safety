// marquee.js — бесконечная бегущая строка
//
// Идея: CSS-анимация двигает ленту влево на 50% её ширины.
// Чтобы при этом не было «дыр», содержимое ленты должно
// повторяться минимум дважды и быть шире двух экранов.
// Здесь мы дублируем элементы, пока этого не достигнем.

const track = document.getElementById('marqueeTrack');

if (track) {
  const originalItems = track.innerHTML; // запоминаем исходные 3 пункта

  // Дублируем содержимое, пока лента не станет шире двух экранов
  while (track.scrollWidth < window.innerWidth * 2) {
    track.innerHTML += originalItems;
  }

  // И ещё один раз — это и есть «вторая половина»,
  // на которую лента незаметно перематывается
  track.innerHTML += track.innerHTML;
}
