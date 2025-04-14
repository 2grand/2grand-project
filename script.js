import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';

document.addEventListener('DOMContentLoaded', () => {
  const welcomeDiv = document.getElementById('welcomeMessage');
  const carouselImages = document.querySelectorAll('.carousel img');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const listenNowBtn = document.getElementById('listenNowBtn');
  const audioSection = document.querySelector('.audio-player');
  const volumeSlider = document.getElementById('volumeSlider');
  const songTitle = document.getElementById('songTitle');
  const playBtn = document.getElementById('playButton');
  const progressTime = document.getElementById('progressTime');
  const durationTime = document.getElementById('durationTime');
  let currentImageIndex = 0;
  let carouselInterval;

  // Carousel
  function showCarouselImage(index) {
    carouselImages.forEach((img, i) => {
      img.style.opacity = i === index ? '1' : '0';
      img.style.zIndex = i === index ? '1' : '0';
    });
  }

  function rotateCarousel() {
    currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
    showCarouselImage(currentImageIndex);
  }

  function startCarousel() {
    carouselInterval = setInterval(rotateCarousel, 3000);
  }

  function stopCarousel() {
    clearInterval(carouselInterval);
  }

  if (carouselImages.length > 0) {
    showCarouselImage(currentImageIndex);
    startCarousel();

    nextBtn?.addEventListener('click', () => {
      stopCarousel();
      rotateCarousel();
      startCarousel();
    });

    prevBtn?.addEventListener('click', () => {
      stopCarousel();
      currentImageIndex = (currentImageIndex - 1 + carouselImages.length) % carouselImages.length;
      showCarouselImage(currentImageIndex);
      startCarousel();
    });
  }

  // Scroll to audio section
  listenNowBtn?.addEventListener('click', () => {
    audioSection?.scrollIntoView({ behavior: 'smooth' });
  });

  // Audio Player
  const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#e63946',
    progressColor: '#ffffff',
    height: 100,
    responsive: true,
    autoScroll: true,
    volume: 0.5,
    cursorColor: '#ffffff',
    interact: true,
    dragToSeek: true
  });

  wavesurfer.load('track.mp3');

  playBtn.innerHTML = '<i class="fas fa-play"></i>';

  playBtn.addEventListener('click', () => {
    wavesurfer.playPause();
    playBtn.innerHTML = wavesurfer.isPlaying()
      ? '<i class="fas fa-pause"></i>'
      : '<i class="fas fa-play"></i>';
  });

  volumeSlider.value = wavesurfer.getVolume();
  volumeSlider.addEventListener('input', e => {
    wavesurfer.setVolume(parseFloat(e.target.value));
  });

  songTitle.textContent = 'Loose Change (Prod. The Alchemist) – 2Grand & Kobierich';

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function updateTimes() {
    progressTime.textContent = formatTime(wavesurfer.getCurrentTime());
    durationTime.textContent = formatTime(wavesurfer.getDuration());
  }

  wavesurfer.on('audioprocess', updateTimes);
  wavesurfer.on('seek', updateTimes);
  wavesurfer.on('ready', updateTimes);

  // Tooltip hover timestamp preview
  const waveformContainer = document.getElementById('waveform');
  const hoverTooltip = document.createElement('div');
  hoverTooltip.style.position = 'absolute';
  hoverTooltip.style.background = 'rgba(0, 0, 0, 0.7)';
  hoverTooltip.style.color = '#fff';
  hoverTooltip.style.padding = '2px 6px';
  hoverTooltip.style.fontSize = '12px';
  hoverTooltip.style.borderRadius = '4px';
  hoverTooltip.style.pointerEvents = 'none';
  hoverTooltip.style.display = 'none';
  hoverTooltip.style.zIndex = '10';
  document.body.appendChild(hoverTooltip);

  waveformContainer.addEventListener('mousemove', e => {
    const rect = waveformContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const hoverTime = percent * wavesurfer.getDuration();
    const minutes = Math.floor(hoverTime / 60);
    const seconds = Math.floor(hoverTime % 60).toString().padStart(2, '0');
    hoverTooltip.textContent = `${minutes}:${seconds}`;
    hoverTooltip.style.left = `${e.pageX + 10}px`;
    hoverTooltip.style.top = `${e.pageY - 30}px`;
    hoverTooltip.style.display = 'block';
  });

  waveformContainer.addEventListener('mouseleave', () => {
    hoverTooltip.style.display = 'none';
  });

  // Personalized Greeting with Weather
  function getGreeting() {
    const hour = new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Detroit' });
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function getCurrentDateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { timeZone: 'America/Detroit', hour12: true });
    const date = now.toLocaleDateString('en-US', { timeZone: 'America/Detroit' });
    return { time, date };
  }

  async function fetchWeather() {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=42.3314&longitude=-83.0458&current_weather=true');
    const data = await res.json();
    return mapWeatherCodeToDescription(data.current_weather.weathercode);
  }

  function mapWeatherCodeToDescription(code) {
    const descriptions = {
      0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'fog',
      48: 'rime fog', 51: 'light drizzle', 53: 'moderate drizzle', 55: 'dense drizzle',
      56: 'freezing drizzle', 57: 'dense freezing drizzle', 61: 'light rain', 63: 'moderate rain',
      65: 'heavy rain', 66: 'freezing rain', 67: 'heavy freezing rain', 71: 'light snow',
      73: 'moderate snow', 75: 'heavy snow', 77: 'snow grains', 80: 'light rain showers',
      81: 'moderate rain showers', 82: 'heavy rain showers', 85: 'light snow showers',
      86: 'heavy snow showers', 95: 'thunderstorm', 96: 'thunderstorm w/ hail', 99: 'thunderstorm w/ heavy hail'
    };
    return descriptions[code] || 'unknown';
  }

  function updateWelcomeMessage() {
    const { time, date } = getCurrentDateTime();
    const greeting = getGreeting();
    const storedName = localStorage.getItem('userName');
    const lastVisit = localStorage.getItem('lastVisit');

    fetchWeather().then(weather => {
      let message = `${greeting}`;
      if (storedName) {
        message += `, ${storedName}!`;
      } else {
        const name = prompt('Welcome! Please enter your name:');
        localStorage.setItem('userName', name);
        message += `, ${name}!`;
      }

      message += ` It's ${time} EST on ${date}, and it's ${weather} right now.`;

      if (lastVisit) {
        message += `<br>Btw, you last visited on ${lastVisit}.`;
      }

      welcomeDiv.innerHTML = message;
      localStorage.setItem('lastVisit', `${date} at ${time}`);
    });
  }

  updateWelcomeMessage();
  setInterval(updateWelcomeMessage, 60000); // Update every minute

  // Artist video fade-in + sound on hover
  document.querySelectorAll('.artist-profile video').forEach(video => {
    video.addEventListener('loadeddata', () => {
      video.classList.add('loaded');
    });
    video.addEventListener('mouseenter', () => {
      video.muted = false;
    });
    video.addEventListener('mouseleave', () => {
      video.muted = true;
    });
  });
});
