/**
 * JAM DIGITAL MASJID MODERN
 * script.js — Pure Vanilla JS, no dependencies
 */

'use strict';

// ============================================================
// CONSTANTS & DEFAULT CONFIG
// ============================================================

const DEFAULT_CONFIG = {
  iqomahDurations: {
    Imsak: 0,    // tidak ada iqomah
    Subuh: 7,
    Terbit: 0,
    Dzuhur: 10,
    Ashar: 10,
    Maghrib: 5,
    Isya: 10,
  },
  soundEnabled: true,
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1SBsjwFKzSjLelgJimRdO4oiszqAv5ETjdpub_b3aZkI/edit?gid=1198090480#gid=1198090480',
  slideshowInterval: 7,  // detik
  iqomahEnabled: true,
  nasihatInterval: 10,   // detik
  nasihatText: 'Mohon menonaktifkan telepon genggam saat berada di dalam Masjid.\nLuruskan dan rapatkan shaf shalat.'
};

// Jadwal shalat static fallback untuk Kota Solo (WIB)
// Ini adalah rata-rata tahunan; idealnya diganti API real-time
const STATIC_PRAYER_TIMES = {
  Imsak:   '04:27',
  Subuh:   '04:37',
  Terbit:  '05:55',
  Dzuhur:  '11:48',
  Ashar:   '15:07',
  Maghrib: '17:39',
  Isya:    '18:52',
};

const PRAYER_ICONS = {
  Imsak:   '🌑',
  Subuh:   '🌙',
  Terbit:  '🌅',
  Dzuhur:  '☀️',
  Ashar:   '🌤️',
  Maghrib: '🌆',
  Isya:    '🌙',
};

// Nama bulan Hijriyah
const HIJRI_MONTHS = [
  'Muharram','Shafar','Rabi\'ul Awal','Rabi\'ul Akhir',
  'Jumadil Awal','Jumadil Akhir','Rajab','Sya\'ban',
  'Ramadhan','Syawal','Dzulqa\'dah','Dzulhijjah'
];

// ============================================================
// STATE
// ============================================================
let config = {};
let prayerTimes = {};
let slides = [];
let currentSlide = 0;
let slideshowTimer = null;
let adzanPlaying = false;
let iqomahTimer = null;
let iqomahSeconds = 0;
let triggedPrayers = new Set();
let lastDateStr = '';

// ============================================================
// LOAD CONFIG FROM LOCALSTORAGE
// ============================================================
function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem('masjid_tv_config') || '{}');
    config = Object.assign({}, DEFAULT_CONFIG, saved);
    if (!config.iqomahDurations) config.iqomahDurations = DEFAULT_CONFIG.iqomahDurations;
    else config.iqomahDurations = Object.assign({}, DEFAULT_CONFIG.iqomahDurations, config.iqomahDurations);
    
    // Force default spreadsheet if empty
    if (!config.spreadsheetUrl) config.spreadsheetUrl = DEFAULT_CONFIG.spreadsheetUrl;
  } catch {
    config = Object.assign({}, DEFAULT_CONFIG);
  }

  // Update UI with config
  startNasihatRotation();
}

let currentNasihatIndex = 0;
let nasihatTimer = null;

function startNasihatRotation() {
  if (nasihatTimer) clearInterval(nasihatTimer);
  const textRaw = config.nasihatText || '';
  const lines = textRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const el = document.getElementById('nasihat-text');
  if (!el) return;

  if (lines.length === 0) {
    el.textContent = '';
    return;
  }
  
  el.textContent = lines[0];
  currentNasihatIndex = 0;
  
  if (lines.length > 1) {
    nasihatTimer = setInterval(() => {
      currentNasihatIndex = (currentNasihatIndex + 1) % lines.length;
      el.textContent = lines[currentNasihatIndex];
    }, (config.nasihatInterval || 10) * 1000);
  }
}

function saveConfig() {
  localStorage.setItem('masjid_tv_config', JSON.stringify(config));
}

// ============================================================
// HIJRI DATE CALCULATION
// ============================================================
function toHijri(date) {
  // Algoritma konversi Gregorian → Hijriyah
  const jd = gregorianToJulian(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return julianToHijri(jd);
}

function gregorianToJulian(year, month, day) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function julianToHijri(jd) {
  const z = Math.floor(jd + 0.5);
  const a = z;
  let year, month, day;
  const I = Math.floor((a - 1867216.25) / 36524.25);
  const b = a + I - Math.floor(I / 4) + 1525;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  day = b - d - Math.floor(30.6001 * e);
  month = (e < 14) ? e - 1 : e - 13;
  year = (month > 2) ? c - 4716 : c - 4715;

  // Gregorian to Hijri conversion
  const l = z - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const L = l - 10631 * n + 354;
  const j = Math.floor((10985 - L) / 5316) * Math.floor((50 * L) / 17719) + Math.floor(L / 5670) * Math.floor((43 * L) / 15238);
  const L2 = L - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * L2) / 709);
  const hDay = L2 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 29;

  return { day: hDay, month: hMonth, year: hYear };
}

function formatHijri(date) {
  const h = toHijri(date);
  return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} H`;
}

// ============================================================
// DATE & TIME FORMATTING
// ============================================================
function formatDate(date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}

function formatSeconds(date) {
  return String(date.getSeconds()).padStart(2, '0');
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToDisplay(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ============================================================
// CLOCK UPDATE
// ============================================================
function updateClock() {
  const now = new Date();
  const timeStr = formatTime(now);
  const secStr  = formatSeconds(now);
  const dateStr = formatDate(now);

  document.getElementById('clock-time').textContent     = timeStr;
  document.getElementById('clock-seconds').textContent  = secStr; // tanpa titik dua
  
  const topbarMasehi = document.getElementById('topbar-date-masehi');
  const topbarHijri = document.getElementById('topbar-date-hijri');

  if (topbarMasehi) topbarMasehi.textContent = dateStr;

  // Update Hijri only once per day
  const todayStr = now.toDateString();
  if (todayStr !== lastDateStr) {
    lastDateStr = todayStr;
    const hijriStr = formatHijri(now);
    if (topbarHijri) topbarHijri.textContent = hijriStr;
    
    // Reset triggered prayers at midnight
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      triggedPrayers.clear();
    }
  }

  updateCountdown(now);
  checkPrayerTrigger(now);
}

// ============================================================
// PRAYER TIME — NEXT & COUNTDOWN
// ============================================================
function getPrayerList() {
  return Object.entries(prayerTimes).map(([name, time]) => ({
    name, time,
    minutes: timeToMinutes(time)
  }));
}

function getNextPrayer(now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const list = getPrayerList();
  // Find the soonest prayer that's still in the future
  const upcoming = list.filter(p => p.minutes > nowMinutes);
  if (upcoming.length > 0) return upcoming[0];
  // Wrap to next day — return first prayer
  return list[0];
}

function getCurrentPrayer(now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const list = getPrayerList();
  let current = null;
  for (const p of list) {
    if (p.minutes <= nowMinutes) current = p;
    else break;
  }
  return current;
}

function updateCountdown(now) {
  if (adzanPlaying) return; // Don't update while overlay is showing
  const next = getNextPrayer(now);
  if (!next) return;

  const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const nextTotalSec = next.minutes * 60;
  let diff = nextTotalSec - nowTotalSec;
  if (diff < 0) diff += 86400;

  document.getElementById('countdown-next-prayer').textContent = `Menuju ${next.name}`;
  document.getElementById('countdown-timer').textContent = minutesToDisplay(diff);
  document.getElementById('countdown-status').textContent = `Pukul ${next.time} WIB`;

  // Next prayer info card
  document.getElementById('npi-name').textContent = next.name;
  document.getElementById('npi-time').textContent = next.time + ' WIB';
  document.getElementById('npi-icon').textContent = PRAYER_ICONS[next.name] || '🕌';

  // Refresh prayer card highlights every minute
  if (now.getSeconds() === 0) renderPrayerSchedule(now);
}

// ============================================================
// PRAYER SCHEDULE RENDER
// ============================================================
function renderPrayerSchedule(now) {
  const container = document.getElementById('prayer-schedule');
  container.innerHTML = '';
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const next = getNextPrayer(now);

  for (const [name, time] of Object.entries(prayerTimes)) {
    const minutes = timeToMinutes(time);
    const card = document.createElement('div');
    card.className = 'prayer-card';
    card.id = `prayer-card-${name}`;

    if (next && name === next.name) card.classList.add('active');
    else if (minutes < nowMinutes) card.classList.add('passed');

    card.innerHTML = `
      <div class="prayer-name">${name}</div>
      <div class="prayer-time">${time}</div>
    `;
    container.appendChild(card);
  }
}

// ============================================================
// PRAYER TRIGGER (ADZAN)
// ============================================================
function checkPrayerTrigger(now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowSec = now.getSeconds();

  for (const [name, time] of Object.entries(prayerTimes)) {
    const minutes = timeToMinutes(time);
    const key = `${name}_${now.toDateString()}`;

    if (minutes === nowMinutes && nowSec === 0 && !triggedPrayers.has(key)) {
      triggedPrayers.add(key);
      triggerAdzan(name);
      break;
    }
  }
}

// ============================================================
// ADZAN
// ============================================================
let adzanAutoDismissTimer = null;

function triggerAdzan(prayerName) {
  if (adzanPlaying) return;
  adzanPlaying = true;

  // Show overlay
  document.getElementById('adzan-prayer-name').textContent = prayerName;
  document.getElementById('adzan-overlay').classList.add('show');

  // Play audio
  if (config.soundEnabled) {
    playAudio('audio/adzan.mp3', () => {
      // fallback beep
      playAudio('audio/beep.mp3');
    });
  }

  // Update prayer cards
  renderPrayerSchedule(new Date());

  // Auto dismiss after 3 minutes if not dismissed manually
  if (adzanAutoDismissTimer) clearTimeout(adzanAutoDismissTimer);
  adzanAutoDismissTimer = setTimeout(() => {
    if (adzanPlaying) dismissAdzan(prayerName);
  }, 3 * 60 * 1000);
}

function dismissAdzan(prayerName) {
  if (adzanAutoDismissTimer) { clearTimeout(adzanAutoDismissTimer); adzanAutoDismissTimer = null; }
  document.getElementById('adzan-overlay').classList.remove('show');
  adzanPlaying = false;

  // Start iqomah countdown if enabled
  const dur = config.iqomahDurations[prayerName || ''] || 0;
  if (config.iqomahEnabled && dur > 0) {
    startIqomah(prayerName, dur);
  }
}

// ============================================================
// IQOMAH
// ============================================================
function startIqomah(prayerName, minutes) {
  if (minutes === undefined) {
    minutes = config.iqomahDurations[prayerName || 'Dzuhur'] || 10;
  }
  
  iqomahSeconds = minutes * 60;

  // Show FULLSCREEN iqomah overlay
  const overlay = document.getElementById('iqomah-overlay');
  overlay.querySelector('.iq-name').textContent = prayerName || 'Dzuhur';
  overlay.classList.add('show');

  // Immediately display time
  document.getElementById('iqomah-timer-display').textContent = minutesToDisplay(iqomahSeconds);

  if (iqomahTimer) clearInterval(iqomahTimer);
  iqomahTimer = setInterval(() => {
    iqomahSeconds--;
    document.getElementById('iqomah-timer-display').textContent = minutesToDisplay(iqomahSeconds);

    if (iqomahSeconds <= 0) {
      clearInterval(iqomahTimer);
      iqomahTimer = null;
      overlay.classList.remove('show');
      if (config.soundEnabled) playAudio('audio/beep.mp3');
    }
  }, 1000);
}

// ============================================================
// AUDIO
// ============================================================
function playAudio(src, onError) {
  const audio = new Audio(src);
  audio.play().catch(() => {
    if (typeof onError === 'function') onError();
  });
  return audio;
}

// ============================================================
// SLIDESHOW
// ============================================================
const SLIDE_FILENAMES = [
  'slides/slide1.png',
  'slides/slide2.png',
  'slides/slide3.png',
];

async function loadSlides() {
  const container = document.getElementById('slideshow');
  slides = [...SLIDE_FILENAMES];

  // Optional: We skip the strict Image onload check because on local file:// 
  // protocol it might fail due to CORS or local file restrictions.
  // We just trust the SLIDE_FILENAMES array.

  if (slides.length === 0) {
    container.innerHTML = `
      <div id="slide-empty">
        <div class="empty-icon">🖼️</div>
        <div>Tambahkan gambar ke folder <code>/slides</code></div>
        <div style="font-size:11px;color:#555">Format: slide1.png, slide2.png, dst.</div>
      </div>`;
    return;
  }

  // Build slide elements
  container.innerHTML = '';
  slides.forEach((src, i) => {
    const el = document.createElement('div');
    el.className = 'slide' + (i === 0 ? ' active' : '');
    el.style.backgroundImage = `url('${src}')`;
    container.appendChild(el);
  });

  // Dots
  buildSlideDots();
  startSlideshow();
}

function buildSlideDots() {
  const dotsEl = document.getElementById('slide-dots');
  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsEl.appendChild(dot);
  });
}

function goToSlide(index) {
  const els = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (els[currentSlide]) els[currentSlide].classList.remove('active');
  if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  if (els[currentSlide]) els[currentSlide].classList.add('active');
  if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function startSlideshow() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  const interval = (config.slideshowInterval || 7) * 1000;
  slideshowTimer = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, interval);
}

// ============================================================
// FETCH PRAYER TIMES FROM API
// ============================================================
async function fetchPrayerTimes() {
  try {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    
    // Kemenag API via myquran.com - Kota Surakarta (ID: 1434)
    const url = `https://api.myquran.com/v2/sholat/jadwal/1434/${y}/${m}/${d}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (!data.status) throw new Error('API return status false');
    
    const t = data.data.jadwal;
    prayerTimes = {
      Imsak:   t.imsak,
      Subuh:   t.subuh,
      Terbit:  t.terbit,
      Dzuhur:  t.dzuhur,
      Ashar:   t.ashar,
      Maghrib: t.maghrib,
      Isya:    t.isya,
    };
    console.log('✅ Prayer times loaded from Kemenag API');
  } catch (err) {
    console.warn('⚠️ Prayer API failed, using static fallback:', err.message);
    prayerTimes = { ...STATIC_PRAYER_TIMES };
  }
  renderPrayerSchedule(new Date());
}

// ============================================================
// FETCH FINANCE DATA FROM GOOGLE SPREADSHEET
// ============================================================
async function fetchFinanceData() {
  const url = config.spreadsheetUrl;
  if (!url || url.trim() === '') {
    showFinanceDemo();
    return;
  }

  try {
    // Support opensheet.elk.sh format or direct CSV
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('Finance fetch error');
    const data = await res.json();

    // Expected columns: Tanggal, Keterangan, Pemasukan, Pengeluaran
    let income = 0, expense = 0;
    for (const row of data) {
      const inc = parseRupiah(row['Pemasukan'] || row['pemasukan'] || 0);
      const exp = parseRupiah(row['Pengeluaran'] || row['pengeluaran'] || 0);
      income  += inc;
      expense += exp;
    }
    const balance = income - expense;
    displayFinance(income, expense, balance);
  } catch (err) {
    console.warn('Finance data fetch failed:', err.message);
    showFinanceDemo();
  }
}

function parseRupiah(val) {
  if (!val) return 0;
  return parseInt(String(val).replace(/[^0-9]/g, '')) || 0;
}

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function displayFinance(income, expense, balance) {
  document.getElementById('fin-loading').classList.add('hidden');
  document.getElementById('fin-data').classList.remove('hidden');
  document.getElementById('fin-income').textContent  = formatRupiah(income);
  document.getElementById('fin-expense').textContent = formatRupiah(expense);
  document.getElementById('fin-balance').textContent = formatRupiah(balance);
  const now = new Date();
  document.getElementById('fin-period').textContent =
    now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

function showFinanceDemo() {
  displayFinance(4750000, 1200000, 3550000);
}

// ============================================================
// SETTINGS MODAL
// ============================================================
function openSettings() {
  // Populate form
  const d = config.iqomahDurations;
  document.getElementById('iq-subuh').value   = d.Subuh;
  document.getElementById('iq-dzuhur').value  = d.Dzuhur;
  document.getElementById('iq-ashar').value   = d.Ashar;
  document.getElementById('iq-maghrib').value = d.Maghrib;
  document.getElementById('iq-isya').value    = d.Isya;
  document.getElementById('toggle-sound').checked   = config.soundEnabled;
  document.getElementById('toggle-iqomah').checked  = config.iqomahEnabled;
  document.getElementById('input-spreadsheet').value = config.spreadsheetUrl || '';
  document.getElementById('input-slideshow-interval').value = config.slideshowInterval || 7;
  document.getElementById('input-nasihat').value = config.nasihatText || '';
  document.getElementById('input-nasihat-interval').value = config.nasihatInterval || 10;
  document.getElementById('settings-overlay').classList.add('show');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('show');
}

function saveSettings() {
  config.iqomahDurations.Subuh   = parseInt(document.getElementById('iq-subuh').value)   || 0;
  config.iqomahDurations.Dzuhur  = parseInt(document.getElementById('iq-dzuhur').value)  || 0;
  config.iqomahDurations.Ashar   = parseInt(document.getElementById('iq-ashar').value)   || 0;
  config.iqomahDurations.Maghrib = parseInt(document.getElementById('iq-maghrib').value) || 0;
  config.iqomahDurations.Isya    = parseInt(document.getElementById('iq-isya').value)    || 0;
  config.soundEnabled    = document.getElementById('toggle-sound').checked;
  config.iqomahEnabled   = document.getElementById('toggle-iqomah').checked;
  config.spreadsheetUrl  = document.getElementById('input-spreadsheet').value.trim();
  config.slideshowInterval = parseInt(document.getElementById('input-slideshow-interval').value) || 7;
  config.nasihatText     = document.getElementById('input-nasihat').value.trim();
  config.nasihatInterval = parseInt(document.getElementById('input-nasihat-interval').value) || 10;

  saveConfig();
  closeSettings();

  // Apply nasihat immediately
  startNasihatRotation();

  // Re-fetch finance if URL changed
  fetchFinanceData();

  // Restart slideshow with new interval
  startSlideshow();

  showToast('Pengaturan tersimpan!');
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ============================================================
// REFRESH PRAYER TIMES DAILY
// ============================================================
function scheduleDailyRefresh() {
  const now = new Date();
  const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) - now;
  setTimeout(() => {
    fetchPrayerTimes();
    triggedPrayers.clear();
    scheduleDailyRefresh();
  }, msToMidnight);
}

// Refresh finance data every hour
function scheduleFinanceRefresh() {
  setInterval(fetchFinanceData, 60 * 60 * 1000);
}

// ============================================================
// INIT
// ============================================================
async function init() {
  // Attach event listeners first so UI is responsive immediately
  document.getElementById('btn-settings').addEventListener('click', openSettings);
  document.getElementById('modal-close').addEventListener('click', closeSettings);
  document.getElementById('settings-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settings-overlay')) closeSettings();
  });
  document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
  document.getElementById('adzan-dismiss').addEventListener('click', () => {
    const name = document.getElementById('adzan-prayer-name').textContent;
    dismissAdzan(name);
  });
  
  // Test buttons
  document.getElementById('btn-test-adzan').addEventListener('click', () => {
    closeSettings();
    triggerAdzan('Dzuhur');
  });
  document.getElementById('btn-test-iqomah').addEventListener('click', () => {
    closeSettings();
    startIqomah('Dzuhur');
  });

  loadConfig();

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Load non-blocking or parallel features
  loadSlides();

  // Prayer times
  await fetchPrayerTimes();
  scheduleDailyRefresh();

  // Finance
  await fetchFinanceData();
  scheduleFinanceRefresh();

  console.log('✅ Jam Digital Masjid initialized');
}

document.addEventListener('DOMContentLoaded', init);
