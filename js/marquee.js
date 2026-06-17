

const track = document.getElementById('marqueeTrack');

if (track) {
  const originalItems = track.innerHTML; 

  
  while (track.scrollWidth < window.innerWidth * 2) {
    track.innerHTML += originalItems;
  }

  
  track.innerHTML += track.innerHTML;
}
