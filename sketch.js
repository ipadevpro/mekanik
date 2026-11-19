/**
 * ============================================================================
 * SIMULASI SAINS KOMPUTASI: KONSERVASI ENERGI MEKANIK (Ep + Ek = Em)
 * ============================================================================
 * Mata Kuliah : Sains Komputasi RPL (2026)
 * Dosen       : Prof. Dr. rer. nat. Yudi Rosandi & Dr. Budi Adiperdana
 * Metode      : Integrasi numerik waktu diskrit (Euler-Cromer)
 * File        : sketch.js
 * ============================================================================
 * Rumus:
 * 1. Energi potensial gravitasi : Ep = m * g * h
 * 2. Energi kinetik             : Ek = 0.5 * m * v^2
 * 3. Energi mekanik             : Em = Ep + Ek
 * 4. Kekekalan energi           : Em = konstan (jika mu = 0)
 * 5. Energi terdisipasi (kalor) : Q  = Em_awal - Em (jika mu > 0)
 * ============================================================================
 */

p5.disableFriendlyErrors = true;

// ============================================================================
// 1. TAMPILAN: PALET & TIPOGRAFI
// Warna dipakai secara semantik, bukan dekoratif:
//   biru  = Ep (dan garis ketinggian h)
//   oranye = Ek (dan vektor kecepatan v)
//   merah  = Q, energi yang hilang jadi kalor
//   tinta  = Em, total
// ============================================================================
const C = {
  surface: [255, 254, 251],
  grid:    [236, 233, 225],
  rule:    [214, 210, 199],
  ink:     [29, 31, 33],
  ink2:    [85, 88, 92],
  ink3:    [138, 141, 145],
  ep:      [44, 100, 176],
  ek:      [214, 112, 24],
  q:       [178, 58, 72],
  em:      [29, 31, 33]
};
// p5 membungkus nama font berspasi dengan kutip sehingga fallback hilang,
// jadi font kanvas diset langsung lewat drawingContext.
const FONT_SANS = '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

// Angka ditulis dengan koma desimal (format Indonesia)
function fmt(v, d) {
  if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
  return v.toFixed(d).replace('.', ',').replace('-', '−');
}

function teks(str, x, y, opt) {
  opt = opt || {};
  noStroke();
  fill(opt.warna || C.ink);
  aturFont(opt.ukuran || 11, opt.mono, opt.tebal);
  textAlign(opt.rata || LEFT, opt.vrata || BASELINE);
  text(str, x, y);
}

function aturFont(ukuran, mono, tebal) {
  textSize(ukuran);
  drawingContext.font = (tebal ? '600 ' : '400 ') + ukuran + 'px ' + (mono ? FONT_MONO : FONT_SANS);
}

// ============================================================================
// 2. VARIABEL GLOBAL FISIKA & SIMULASI
// ============================================================================
let massa = 2.0;          // kg
let g = 9.8;              // m/s^2
let muGesek = 0.00;       // koefisien redaman (0 = konservatif)
let dt = 0.02;            // s per frame
let skalaMeter = 42;      // 1 m = 42 px
let yTanah = 460;         // piksel acuan h = 0
let waktuSimulasi = 0.0;  // s

const LEBAR_SIM = 600;    // kanvas 0..600 = area eksperimen, 600..980 = dasbor

let statusJalan = false;
let isSlowMotion = false;
let isDragging = false;
let modelAktif = 'roller_coaster'; // 'roller_coaster' | 'jatuh_bebas' | 'bandul'

let Ep = 0.0, Ek = 0.0, Em = 0.0, Edisip = 0.0, EmAwal = 0.0;

let riwayatEnergi = [];
const MAX_RIWAYAT = 180;

let jejakObjek = [];
const MAX_JEJAK = 40;

// Model 1: lintasan melengkung
let rc_u = 0.12;          // posisi parametrik 0..1
let rc_v = 0.0;           // kecepatan tangensial (m/s)
const RC_X_START = 70;
const RC_X_END = 560;

// Model 2: jatuh bebas
let jb_x = 320;
let jb_h = 7.5;           // m
let jb_v = 0.0;           // m/s, positif ke atas

// Model 3: bandul
let bd_pivotX = 320;
let bd_pivotY = 140;
let bd_L = 6.0;           // m
let bd_theta = 0.85;      // rad
let bd_omega = 0.0;       // rad/s

// Posisi awal per model. Slider, drag, dan Reset memakai sumber yang sama.
let posisiAwal = {
  roller_coaster: 0.12,   // u
  jatuh_bebas: 7.5,       // h (m)
  bandul: 49              // theta (derajat)
};

// Komponen UI DOM
let selectModel, tombolMulai, tombolReset, tombolSlow, tombolSimpan;
let sliderMassa, sliderGravitasi, sliderGesekan, sliderKetinggian;
let checkboxVektor, checkboxJejak, checkboxGrid, checkboxSuara;
let outMassa, outGravitasi, outGesekan, outPosisi, labelPosisi;
let tombolPresetG = [];

// ============================================================================
// 3. SETUP & DRAW
// ============================================================================
function setup() {
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  let canvas = createCanvas(980, 520);
  if (select('#canvas-container')) canvas.parent('canvas-container');
  canvas.attribute('role', 'img');
  canvas.attribute('aria-label', 'Simulasi energi mekanik dengan diagram batang dan grafik energi terhadap waktu');

  inisialisasiUI();
  resetSimulasi();
}

function draw() {
  if (statusJalan && !isDragging) {
    updateFisika(isSlowMotion ? dt * 0.4 : dt);
  } else {
    hitungEnergiStatis();
  }
  perbaruiSuaraGerak();

  background(C.surface);
  renderLingkunganSimulasi();

  if (modelAktif === 'roller_coaster') renderRollerCoaster();
  else if (modelAktif === 'jatuh_bebas') renderJatuhBebas();
  else if (modelAktif === 'bandul') renderBandul();

  renderDasborEnergi();
}

// ============================================================================
// 4. PEMODELAN & INTEGRASI NUMERIK (Euler-Cromer)
// v diperbarui lebih dulu dengan a(t), lalu x diperbarui dengan v yang baru.
// ============================================================================
function updateFisika(deltaT) {
  waktuSimulasi += deltaT;

  if (modelAktif === 'roller_coaster') updateFisikaRollerCoaster(deltaT);
  else if (modelAktif === 'jatuh_bebas') updateFisikaJatuhBebas(deltaT);
  else if (modelAktif === 'bandul') updateFisikaBandul(deltaT);

  riwayatEnergi.push({ t: waktuSimulasi, Ep: Ep, Ek: Ek, Em: Em, Edisip: Edisip });
  if (riwayatEnergi.length > MAX_RIWAYAT) riwayatEnergi.shift();
}

function hitungDisipasi() {
  Edisip = muGesek > 0 ? Math.max(0, EmAwal - Em) : 0.0;
}

// Model 1: profil lintasan h(u) dalam meter, u di [0, 1]
function rc_getHeight(u) {
  let baseH = 1.2;
  let wave = 2.9 * (1.0 - Math.cos(2.0 * Math.PI * (u - 0.5)));
  let tilt = 1.3 * (1.0 - u);
  return baseH + wave + tilt;
}

function rc_getSlope(u) {
  // turunan analitik dh/du
  return 5.8 * Math.PI * Math.sin(2.0 * Math.PI * (u - 0.5)) - 1.3;
}

function rc_x(u) {
  return RC_X_START + u * (RC_X_END - RC_X_START);
}

// Gerak di lintasan diintegrasikan dalam koordinat panjang busur s (meter):
//   dv/dt = -g sin(theta) - redaman * v,   ds/dt = v
// Dengan begitu Euler-Cromer tetap simplektik dan energi tidak menumpuk.
// Tabel s(u) dipakai untuk mengubah s kembali ke parameter u.
const RC_N = 2000;
let rc_tabelS = null;

function rc_bangunTabel() {
  let W = (RC_X_END - RC_X_START) / skalaMeter;
  rc_tabelS = new Float64Array(RC_N + 1);
  for (let i = 1; i <= RC_N; i++) {
    let u = i / RC_N;
    rc_tabelS[i] = rc_tabelS[i - 1] + Math.hypot(W / RC_N, rc_getHeight(u) - rc_getHeight(u - 1 / RC_N));
  }
}

function rc_sDariU(u) {
  if (!rc_tabelS) rc_bangunTabel();
  let k = Math.min(RC_N - 1, Math.floor(u * RC_N));
  let t = u * RC_N - k;
  return rc_tabelS[k] + t * (rc_tabelS[k + 1] - rc_tabelS[k]);
}

function rc_uDariS(s) {
  if (!rc_tabelS) rc_bangunTabel();
  let lo = 0, hi = RC_N;
  while (hi - lo > 1) {
    let mid = (lo + hi) >> 1;
    if (rc_tabelS[mid] <= s) lo = mid; else hi = mid;
  }
  return (lo + (s - rc_tabelS[lo]) / (rc_tabelS[lo + 1] - rc_tabelS[lo])) / RC_N;
}

function updateFisikaRollerCoaster(deltaT) {
  let trackWidthM = (RC_X_END - RC_X_START) / skalaMeter;
  let theta = Math.atan(rc_getSlope(rc_u) / trackWidthM);

  // a_t = -g sin(theta) - redaman * v
  let aTangensial = -g * Math.sin(theta) - (muGesek * 2.5) * rc_v;

  // Euler-Cromer: v dulu, lalu s dengan v baru
  rc_v += aTangensial * deltaT;
  let s = rc_sDariU(rc_u) + rc_v * deltaT;

  // pantulan di ujung lintasan
  let sMin = rc_sDariU(0.03), sMaks = rc_sDariU(0.97);
  if (s < sMin) {
    s = sMin;
    bunyiTumbukan(Math.abs(rc_v), 'dinding');
    rc_v = -rc_v * (1.0 - muGesek);
  } else if (s > sMaks) {
    s = sMaks;
    bunyiTumbukan(Math.abs(rc_v), 'dinding');
    rc_v = -rc_v * (1.0 - muGesek);
  }
  rc_u = rc_uDariS(s);

  let h = rc_getHeight(rc_u);
  Ep = massa * g * h;
  Ek = 0.5 * massa * rc_v * rc_v;
  Em = Ep + Ek;
  hitungDisipasi();
  tambahJejak(rc_x(rc_u), yTanah - h * skalaMeter);
}

// Model 2: jatuh bebas & pantulan (GLBB vertikal, Modul 4.3)
function updateFisikaJatuhBebas(deltaT) {
  let a_y = -g - (muGesek * 1.5) * jb_v;

  jb_v += a_y * deltaT;
  jb_h += jb_v * deltaT;

  if (jb_h <= 0.0) {
    // Bola sempat menembus lantai sejauh |h| dalam satu langkah. Posisi ikut
    // dicerminkan (bukan dipaksa h = 0) agar jarak tembus itu tidak membuang
    // atau menambah energi secara acak.
    let koefRestitusi = Math.max(0.0, 1.0 - muGesek * 1.8); // e = 1 jika mu = 0
    // Bunyi hanya untuk pantulan sungguhan, bukan saat bola sudah diam di lantai
    if (Math.abs(jb_v) > 0.6) bunyiTumbukan(Math.abs(jb_v), 'lantai');
    jb_h = -jb_h * koefRestitusi;
    jb_v = -jb_v * koefRestitusi;
    if (Math.abs(jb_v) < 0.25) {
      jb_v = 0.0;
      jb_h = 0.0;
    }
  }

  Ep = Math.max(0, massa * g * jb_h);
  Ek = 0.5 * massa * jb_v * jb_v;
  Em = Ep + Ek;
  hitungDisipasi();
  tambahJejak(jb_x, yTanah - jb_h * skalaMeter);
}

// Model 3: bandul sederhana
function updateFisikaBandul(deltaT) {
  let alpha = -(g / bd_L) * Math.sin(bd_theta) - (muGesek * 1.8) * bd_omega;

  bd_omega += alpha * deltaT;
  bd_theta += bd_omega * deltaT;

  let h = bd_L * (1.0 - Math.cos(bd_theta)); // relatif terhadap titik terendah
  let v = bd_L * bd_omega;

  Ep = Math.max(0, massa * g * h);
  Ek = 0.5 * massa * v * v;
  Em = Ep + Ek;
  hitungDisipasi();
  tambahJejak(bandulX(), bandulY());
}

function bandulX() { return bd_pivotX + bd_L * skalaMeter * Math.sin(bd_theta); }
function bandulY() { return bd_pivotY + bd_L * skalaMeter * Math.cos(bd_theta); }

function ketinggianSaatIni() {
  if (modelAktif === 'roller_coaster') return rc_getHeight(rc_u);
  if (modelAktif === 'jatuh_bebas') return Math.max(0, jb_h);
  return bd_L * (1.0 - Math.cos(bd_theta));
}

function kelajuanSaatIni() {
  if (modelAktif === 'roller_coaster') return Math.abs(rc_v);
  if (modelAktif === 'jatuh_bebas') return Math.abs(jb_v);
  return Math.abs(bd_L * bd_omega);
}

// ============================================================================
// SUARA (Web Audio API, dibangkitkan langsung tanpa berkas audio)
//   - Tumbukan: lantai (jatuh bebas) dan dinding (lintasan). Kerasnya sebanding
//     dengan kelajuan saat menumbuk.
//   - Gerak terus-menerus: gelinding (lintasan), desir angin (bandul, jatuh
//     bebas). Kerasnya mengikuti kelajuan, jadi telinga ikut "mendengar" Ek.
// Browser hanya mengizinkan suara setelah pengguna berinteraksi, jadi audio
// baru dinyalakan saat tombol, tombol keyboard, atau kanvas pertama kali dipakai.
// ============================================================================
let audio = null;

function siapkanAudio() {
  if (audio) {
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return;
  }
  let AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  let ctx = new AC();
  let master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);

  // Derau putih 2 detik yang diulang: bahan suara gelinding dan angin
  let buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  let data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  let derau = ctx.createBufferSource();
  derau.buffer = buf;
  derau.loop = true;

  let filterGerak = ctx.createBiquadFilter();
  filterGerak.type = 'bandpass';
  filterGerak.Q.value = 0.8;
  let gainGerak = ctx.createGain();
  gainGerak.gain.value = 0;
  derau.connect(filterGerak);
  filterGerak.connect(gainGerak);
  gainGerak.connect(master);
  derau.start();

  audio = { ctx, master, filterGerak, gainGerak };
}

function suaraAktif() {
  return audio && checkboxSuara && checkboxSuara.checked() && audio.ctx.state === 'running';
}

// jenis: 'lantai' (bunyi "duk" rendah) atau 'dinding' (bunyi "tok" kayu)
function bunyiTumbukan(kecepatan, jenis) {
  if (!suaraAktif()) return;
  let kuat = constrain(kecepatan / 12, 0, 1);
  if (kuat < 0.04) return;

  let ctx = audio.ctx;
  let t = ctx.currentTime;
  let lantai = jenis === 'lantai';
  let lama = lantai ? 0.25 : 0.12;

  let osc = ctx.createOscillator();
  let g = ctx.createGain();
  osc.type = lantai ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(lantai ? 180 : 520, t);
  osc.frequency.exponentialRampToValueAtTime(lantai ? 55 : 240, t + lama * 0.7);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05 + 0.6 * kuat, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + lama);
  osc.connect(g);
  g.connect(audio.master);
  osc.start(t);
  osc.stop(t + lama + 0.05);
}

// Dipanggil tiap frame: atur kerasnya suara gerak dari kelajuan saat ini
function perbaruiSuaraGerak() {
  if (!audio) return;
  let target = 0;
  let frek = 400;
  if (suaraAktif() && statusJalan && !isDragging) {
    let v = kelajuanSaatIni();
    if (modelAktif === 'roller_coaster') {
      target = 0.22 * constrain(v / 11, 0, 1);      // gelinding di rel
      frek = 220 + 35 * v;
    } else if (modelAktif === 'bandul') {
      target = 0.3 * Math.pow(constrain(v / 7, 0, 1), 1.5); // "wus" di titik terendah
      frek = 500 + 120 * v;
    } else {
      target = 0.08 * constrain(v / 12, 0, 1);      // desir angin saat jatuh
      frek = 900 + 60 * v;
    }
  }
  let t = audio.ctx.currentTime;
  audio.gainGerak.gain.setTargetAtTime(target, t, 0.05);
  audio.filterGerak.frequency.setTargetAtTime(frek, t, 0.05);
}

function hitungEnergiStatis() {
  let v = kelajuanSaatIni();
  Ep = massa * g * ketinggianSaatIni();
  Ek = 0.5 * massa * v * v;
  Em = Ep + Ek;
  if (muGesek <= 0.0001) Edisip = 0.0;
}

function tambahJejak(px, py) {
  jejakObjek.push({ x: px, y: py });
  if (jejakObjek.length > MAX_JEJAK) jejakObjek.shift();
}

// ============================================================================
// 5. RENDER AREA EKSPERIMEN (x = 0..600)
// ============================================================================

// Garis h = 0: tanah untuk lintasan & jatuh bebas, titik terendah untuk bandul
function yNol() {
  return modelAktif === 'bandul' ? bd_pivotY + bd_L * skalaMeter : yTanah;
}

function renderLingkunganSimulasi() {
  let y0 = yNol();
  let xSumbu = 44;

  if (checkboxGrid.checked()) {
    stroke(C.grid);
    strokeWeight(1);
    for (let py = y0; py >= 24; py -= skalaMeter) line(xSumbu, py, LEBAR_SIM, py);
    for (let px = xSumbu; px < LEBAR_SIM; px += skalaMeter) line(px, 24, px, y0);
  }

  // Penggaris h
  stroke(C.rule);
  strokeWeight(1);
  line(xSumbu, 24, xSumbu, y0);
  for (let m = 0; y0 - m * skalaMeter >= 24; m++) {
    let py = y0 - m * skalaMeter;
    stroke(C.ink3);
    line(xSumbu - 4, py, xSumbu, py);
    teks(String(m), xSumbu - 8, py, { mono: true, ukuran: 10, warna: C.ink3, rata: RIGHT, vrata: CENTER });
  }
  teks('h (m)', 12, 14, { ukuran: 10, warna: C.ink3, vrata: CENTER });

  if (modelAktif !== 'bandul') {
    // Tanah
    stroke(C.ink2);
    strokeWeight(1.5);
    line(xSumbu, yTanah, LEBAR_SIM - 16, yTanah);
    stroke(C.rule);
    strokeWeight(1);
    for (let px = xSumbu + 8; px < LEBAR_SIM - 16; px += 10) line(px, yTanah + 1, px - 8, yTanah + 9);
  } else {
    // Acuan h = 0 bandul
    stroke(C.rule);
    strokeWeight(1);
    drawingContext.setLineDash([4, 4]);
    line(xSumbu, y0, LEBAR_SIM - 16, y0);
    drawingContext.setLineDash([]);
    teks('titik terendah, h = 0', LEBAR_SIM - 16, y0 - 6, { ukuran: 10, warna: C.ink3, rata: RIGHT });
  }

  if (checkboxJejak.checked() && jejakObjek.length > 1) {
    noFill();
    for (let i = 1; i < jejakObjek.length; i++) {
      let k = i / jejakObjek.length;
      stroke(C.ink3[0], C.ink3[1], C.ink3[2], 30 + 150 * k);
      strokeWeight(1 + 2 * k);
      line(jejakObjek[i - 1].x, jejakObjek[i - 1].y, jejakObjek[i].x, jejakObjek[i].y);
    }
  }

  // Status ringkas di bawah tanah
  let status;
  if (isDragging) status = 'Mengatur posisi awal';
  else if (statusJalan) status = 'Berjalan · ' + (isSlowMotion ? '0,4×' : '1×');
  else status = 'Dijeda · seret bola untuk mengatur posisi awal';
  teks(status, xSumbu, 500, { ukuran: 11, warna: statusJalan ? C.ink2 : C.ink3 });

  // Pemisah area eksperimen dan dasbor
  stroke(C.rule);
  strokeWeight(1);
  line(LEBAR_SIM + 0.5, 0, LEBAR_SIM + 0.5, height);
}

function radiusBola() {
  return map(massa, 0.5, 5.0, 11, 22);
}

// Garis ukur h dari benda ke garis acuan, warna Ep
function renderUkuranH(x, yBenda, yAcuan, h, offset) {
  if (h < 0.05) return;
  let xg = x + offset;
  stroke(C.ep);
  strokeWeight(1);
  drawingContext.setLineDash([3, 3]);
  line(x, yBenda, xg + 4, yBenda);
  drawingContext.setLineDash([]);
  line(xg, yBenda, xg, yAcuan);
  line(xg - 3, yBenda, xg + 3, yBenda);
  line(xg - 3, yAcuan, xg + 3, yAcuan);
  teks('h = ' + fmt(h, 2) + ' m', xg + 6, (yBenda + yAcuan) / 2, { mono: true, ukuran: 11, warna: C.ep, vrata: CENTER });
}

function renderRollerCoaster() {
  // Penyangga
  stroke(C.grid);
  strokeWeight(2);
  for (let u = 0.06; u <= 0.95; u += 0.08) {
    line(rc_x(u), yTanah - rc_getHeight(u) * skalaMeter, rc_x(u), yTanah);
  }

  // Rel
  noFill();
  stroke(C.ink2);
  strokeWeight(3);
  beginShape();
  for (let u = 0.0; u <= 1.0001; u += 0.01) vertex(rc_x(u), yTanah - rc_getHeight(u) * skalaMeter);
  endShape();

  let r = radiusBola();

  // Syarat batas: dinding di kedua ujung (u = 0,03 dan 0,97, lihat updateFisikaRollerCoaster)
  renderDindingLintasan(0.03, -1, r);
  renderDindingLintasan(0.97, 1, r);

  let { kx, ky, bx, by, theta } = rc_posisiBola(rc_u, r);
  let h = rc_getHeight(rc_u);

  renderUkuranH(kx, ky, yTanah, h, r + 18);
  renderBola(bx, by, r);

  if (checkboxVektor.checked()) {
    renderPanahVektor(bx, by, rc_v * Math.cos(theta), -rc_v * Math.sin(theta), Math.abs(rc_v), r);
  }
}

// Titik kontak di rel dan pusat bola (digeser sepanjang normal agar duduk di atas rel)
function rc_posisiBola(u, r) {
  let trackWidthM = (RC_X_END - RC_X_START) / skalaMeter;
  let theta = Math.atan(rc_getSlope(u) / trackWidthM);
  let kx = rc_x(u);
  let ky = yTanah - rc_getHeight(u) * skalaMeter;
  return {
    kx, ky, theta,
    bx: kx - Math.sin(theta) * (r + 1.5),
    by: ky - Math.cos(theta) * (r + 1.5)
  };
}

// Dinding pemantul di ujung lintasan. sisi = -1 untuk ujung kiri, +1 untuk ujung kanan.
// Dinding diletakkan tepat di tepi bola saat bola berada di batas pantul,
// jadi pantulan terlihat terjadi saat bola menyentuh dinding.
function renderDindingLintasan(uBatas, sisi, r) {
  let { bx, by } = rc_posisiBola(uBatas, r);
  let xw = bx + sisi * r;
  let uw = (xw - RC_X_START) / (RC_X_END - RC_X_START);
  let yRel = yTanah - rc_getHeight(constrain(uw, 0, 1)) * skalaMeter;
  let yAtas = by - r - 16;

  // Arsiran di sisi luar dinding, seperti arsiran tanah
  stroke(C.ink3);
  strokeWeight(1);
  for (let y = yAtas + 4; y <= yRel; y += 6) {
    line(xw, y, xw + sisi * 7, y - 6);
  }

  stroke(C.ink2);
  strokeWeight(4);
  strokeCap(SQUARE);
  line(xw, yAtas, xw, yRel + 2);
  strokeCap(ROUND);

  teks('dinding', xw, yAtas - 6, { ukuran: 10, warna: C.ink3, rata: CENTER });
}

function renderJatuhBebas() {
  let r = radiusBola();
  let bx = jb_x;
  let by = yTanah - jb_h * skalaMeter - r;

  // Bayangan: makin dekat tanah makin pekat
  noStroke();
  let k = constrain(jb_h / 9.5, 0, 1);
  fill(C.ink[0], C.ink[1], C.ink[2], 70 - 55 * k);
  ellipse(bx, yTanah + 1, r * (2.4 - 1.4 * k), 5);

  renderUkuranH(bx, by + r, yTanah, jb_h, r + 22);
  renderBola(bx, by, r);

  if (checkboxVektor.checked()) {
    renderPanahVektor(bx, by, 0, -jb_v, Math.abs(jb_v), r);
  }
}

function renderBandul() {
  let r = radiusBola();
  let bx = bandulX();
  let by = bandulY();
  let y0 = yNol();
  let h = bd_L * (1.0 - Math.cos(bd_theta));

  // Tumpuan
  noStroke();
  fill(C.ink2);
  rect(bd_pivotX - 36, bd_pivotY - 10, 72, 6);
  stroke(C.rule);
  strokeWeight(1);
  for (let px = bd_pivotX - 34; px < bd_pivotX + 36; px += 8) line(px, bd_pivotY - 10, px + 6, bd_pivotY - 16);

  // Sumbu vertikal
  stroke(C.rule);
  drawingContext.setLineDash([4, 4]);
  line(bd_pivotX, bd_pivotY, bd_pivotX, y0);
  drawingContext.setLineDash([]);

  // Busur sudut
  noFill();
  stroke(C.ink3);
  strokeWeight(1);
  let a0 = bd_theta >= 0 ? HALF_PI - bd_theta : HALF_PI;
  let a1 = bd_theta >= 0 ? HALF_PI : HALF_PI - bd_theta;
  arc(bd_pivotX, bd_pivotY, 90, 90, a0, a1);
  // label sudut di sisi sumbu yang berlawanan dengan tali
  let sisi = bd_theta >= 0 ? -1 : 1;
  teks('θ = ' + fmt(degrees(bd_theta), 0) + '°', bd_pivotX + sisi * 8, bd_pivotY + 40,
    { mono: true, ukuran: 11, warna: C.ink2, rata: sisi < 0 ? RIGHT : LEFT, vrata: CENTER });

  // Tali
  stroke(C.ink2);
  strokeWeight(1.5);
  line(bd_pivotX, bd_pivotY, bx, by);
  noStroke();
  fill(C.ink);
  circle(bd_pivotX, bd_pivotY, 6);

  let arah = bd_theta >= 0 ? 1 : -1;
  if (arah > 0) {
    renderUkuranH(bx, by, y0, h, r + 18);
  } else {
    // ukuran h di sisi kiri agar tidak menabrak tali
    if (h >= 0.05) {
      let xg = bx - r - 18;
      stroke(C.ep);
      strokeWeight(1);
      drawingContext.setLineDash([3, 3]);
      line(bx, by, xg - 4, by);
      drawingContext.setLineDash([]);
      line(xg, by, xg, y0);
      line(xg - 3, by, xg + 3, by);
      line(xg - 3, y0, xg + 3, y0);
      teks('h = ' + fmt(h, 2) + ' m', xg - 6, (by + y0) / 2, { mono: true, ukuran: 11, warna: C.ep, rata: RIGHT, vrata: CENTER });
    }
  }

  renderBola(bx, by, r);

  if (checkboxVektor.checked()) {
    let vLin = bd_L * bd_omega;
    renderPanahVektor(bx, by, vLin * Math.cos(bd_theta), -vLin * Math.sin(bd_theta), Math.abs(vLin), r);
  }
}

function posisiBola() {
  let r = radiusBola();
  if (modelAktif === 'roller_coaster') {
    let trackWidthM = (RC_X_END - RC_X_START) / skalaMeter;
    let theta = Math.atan(rc_getSlope(rc_u) / trackWidthM);
    return {
      x: rc_x(rc_u) - Math.sin(theta) * (r + 1.5),
      y: yTanah - rc_getHeight(rc_u) * skalaMeter - Math.cos(theta) * (r + 1.5),
      r: r
    };
  }
  if (modelAktif === 'jatuh_bebas') return { x: jb_x, y: yTanah - jb_h * skalaMeter - r, r: r };
  return { x: bandulX(), y: bandulY(), r: r };
}

function renderBola(bx, by, r) {
  let hover = dist(mouseX, mouseY, bx, by) < r + 10;
  if (hover || isDragging) {
    noFill();
    stroke(C.ink3);
    strokeWeight(1);
    circle(bx, by, (r + 6) * 2);
  }
  cursor(isDragging ? 'grabbing' : (hover ? 'grab' : ARROW));

  noStroke();
  fill(C.ink);
  circle(bx, by, r * 2);
}

// Vektor kecepatan, warna Ek
function renderPanahVektor(x, y, vx, vy, kelajuan, r) {
  let skala = 6.5;
  let ex = x + vx * skala;
  let ey = y + vy * skala;
  if (kelajuan < 0.05) return;

  stroke(C.ek);
  strokeWeight(2);
  line(x, y, ex, ey);

  let sudut = Math.atan2(vy, vx);
  push();
  translate(ex, ey);
  rotate(sudut);
  noStroke();
  fill(C.ek);
  triangle(2, 0, -8, -4.5, -8, 4.5);
  pop();

  // label di ujung panah, digeser searah panah
  let jarak = Math.max(kelajuan * skala, (r || 0) + 4) + 10;
  let lx = x + Math.cos(sudut) * jarak;
  let ly = y + Math.sin(sudut) * jarak;
  teks('v = ' + fmt(kelajuan, 2) + ' m/s', lx, ly, {
    mono: true, ukuran: 11, warna: C.ek,
    rata: Math.cos(sudut) >= 0 ? LEFT : RIGHT, vrata: CENTER
  });
}

// ============================================================================
// 6. DASBOR ENERGI (x = 600..980)
// ============================================================================
function renderDasborEnergi() {
  let x0 = LEBAR_SIM + 24;
  let w = width - x0 - 24;
  let refTotal = Math.max(EmAwal, Em, 1.0);

  // --- Diagram batang ---
  teks('Energi', x0, 24, { ukuran: 13, tebal: true });
  teks('joule', x0 + 50, 24, { ukuran: 11, warna: C.ink3 });
  teks('E₀ = ' + fmt(EmAwal, 1) + ' J', x0 + w, 24, { mono: true, ukuran: 11, warna: C.ink2, rata: RIGHT });

  let dasar = 204;
  let tinggiMaks = 148;
  let slot = w / 4;
  let batang = [
    { sim: 'Ep', nilai: Ep, warna: C.ep },
    { sim: 'Ek', nilai: Ek, warna: C.ek },
    { sim: 'Q', nilai: Edisip, warna: C.q },
    { sim: 'Em', nilai: Em, warna: C.em }
  ];

  // garis acuan E0
  let yE0 = dasar - (EmAwal / refTotal) * tinggiMaks;
  stroke(C.rule);
  strokeWeight(1);
  drawingContext.setLineDash([3, 3]);
  line(x0, yE0, x0 + w, yE0);
  drawingContext.setLineDash([]);

  for (let i = 0; i < batang.length; i++) {
    let b = batang[i];
    let cx = x0 + slot * i + slot / 2;
    let bw = 36;
    let bh = constrain(b.nilai / refTotal, 0, 1) * tinggiMaks;
    noStroke();
    fill(b.warna);
    rect(cx - bw / 2, dasar - bh, bw, bh);
    teks(b.sim, cx, dasar + 18, { ukuran: 12, tebal: true, warna: b.warna, rata: CENTER });
    teks(fmt(b.nilai, 1), cx, dasar + 34, { mono: true, ukuran: 11, warna: C.ink2, rata: CENTER });
  }
  stroke(C.ink2);
  strokeWeight(1);
  line(x0, dasar + 0.5, x0 + w, dasar + 0.5);

  // --- Grafik E terhadap t ---
  renderGrafikEnergi(x0, 268, w, 128, refTotal);

  // --- Pembacaan ---
  stroke(C.rule);
  strokeWeight(1);
  line(x0, 446.5, x0 + w, 446.5);

  let dE = Em - EmAwal;
  let kolom = [
    ['h', fmt(ketinggianSaatIni(), 2), 'm'],
    ['v', fmt(kelajuanSaatIni(), 2), 'm/s'],
    ['t', fmt(waktuSimulasi, 2), 's'],
    ['ΔEm', (dE > 0.005 ? '+' : '') + fmt(dE, 2), 'J']
  ];
  let kw = w / 4;
  for (let i = 0; i < kolom.length; i++) {
    let kx = x0 + kw * i;
    teks(kolom[i][0], kx, 466, { ukuran: 10, warna: C.ink3 });
    teks(kolom[i][1], kx, 484, { mono: true, ukuran: 13, warna: C.ink });
    teks(kolom[i][2], kx + textWidth(kolom[i][1]) + 4, 484, { ukuran: 10, warna: C.ink3 });
  }

  let ket;
  if (muGesek <= 0.0001) {
    let persen = EmAwal > 0 ? Math.abs(dE) / EmAwal * 100 : 0;
    ket = 'μ = 0 · Em menyimpang ' + fmt(persen, 2) + ' % dari E₀ (galat numerik)';
  } else {
    let persen = EmAwal > 0 ? Edisip / EmAwal * 100 : 0;
    ket = 'μ = ' + fmt(muGesek, 2) + ' · ' + fmt(persen, 1) + ' % energi awal jadi kalor';
  }
  teks(ket, x0, 506, { ukuran: 10, warna: C.ink2 });
}

function renderGrafikEnergi(gx, gy, gw, gh, maxEnergy) {
  let tampilQ = muGesek > 0;

  teks('E terhadap t', gx, gy, { ukuran: 13, tebal: true });

  // legenda
  let leg = [['Ep', C.ep, false], ['Ek', C.ek, false], ['Em', C.em, false]];
  if (tampilQ) leg.push(['Q', C.q, true]);
  let lx = gx + gw;
  for (let i = leg.length - 1; i >= 0; i--) {
    aturFont(11, false, false);
    let tw = textWidth(leg[i][0]);
    lx -= tw;
    teks(leg[i][0], lx, gy, { ukuran: 11, warna: C.ink2 });
    stroke(leg[i][1]);
    strokeWeight(2);
    if (leg[i][2]) drawingContext.setLineDash([3, 2]);
    line(lx - 18, gy - 4, lx - 5, gy - 4);
    drawingContext.setLineDash([]);
    lx -= 30;
  }

  let px0 = gx + 32;
  let px1 = gx + gw;
  let pyTop = gy + 18;
  let pyBot = gy + gh;
  let safeMax = Math.max(maxEnergy, 1.0);

  // sumbu & grid
  stroke(C.grid);
  strokeWeight(1);
  line(px0, pyTop + 0.5, px1, pyTop + 0.5);
  line(px0, (pyTop + pyBot) / 2, px1, (pyTop + pyBot) / 2);
  stroke(C.ink3);
  line(px0 + 0.5, pyTop, px0 + 0.5, pyBot);
  line(px0, pyBot + 0.5, px1, pyBot + 0.5);

  teks(fmt(safeMax, 0), px0 - 6, pyTop, { mono: true, ukuran: 10, warna: C.ink3, rata: RIGHT, vrata: CENTER });
  teks('0', px0 - 6, pyBot, { mono: true, ukuran: 10, warna: C.ink3, rata: RIGHT, vrata: CENTER });

  let n = riwayatEnergi.length;
  let tAwal = n > 0 ? riwayatEnergi[0].t : 0;
  let tAkhir = n > 0 ? riwayatEnergi[n - 1].t : 0;
  teks(fmt(tAwal, 1), px0, pyBot + 16, { mono: true, ukuran: 10, warna: C.ink3 });
  teks(fmt(tAkhir, 1) + ' s', px1, pyBot + 16, { mono: true, ukuran: 10, warna: C.ink3, rata: RIGHT });

  if (n < 2) {
    teks('Tekan Jalankan untuk merekam', (px0 + px1) / 2, (pyTop + pyBot) / 2 - 10,
      { ukuran: 11, warna: C.ink3, rata: CENTER, vrata: CENTER });
    return;
  }

  function kurva(kunci, warna, tebal, putus) {
    noFill();
    stroke(warna);
    strokeWeight(tebal);
    if (putus) drawingContext.setLineDash([4, 3]);
    beginShape();
    for (let i = 0; i < n; i++) {
      let vx = map(i, 0, MAX_RIWAYAT - 1, px0 + 2, px1);
      let vy = map(riwayatEnergi[i][kunci], 0, safeMax, pyBot - 1, pyTop + 1);
      vertex(vx, constrain(vy, pyTop, pyBot));
    }
    endShape();
    drawingContext.setLineDash([]);
  }

  kurva('Ep', C.ep, 1.75, false);
  kurva('Ek', C.ek, 1.75, false);
  if (tampilQ) kurva('Edisip', C.q, 1.5, true);
  kurva('Em', C.em, 2.25, false);
}

// ============================================================================
// 7. KOMPONEN KONTROL (p5 DOM: createSelect, createButton, createSlider, ...)
// Tampilan diatur lewat kelas CSS di index.html.
// ============================================================================
function buatField(parent, id, teksLabel) {
  let f = createDiv().parent(parent).addClass('field');
  let head = createDiv().parent(f).addClass('field-head');
  let lbl = createElement('label', teksLabel).parent(head).attribute('for', id);
  let out = createElement('output').parent(head).attribute('for', id);
  return { field: f, label: lbl, out: out };
}

function inisialisasiUI() {
  let panel = createDiv().id('sim-controls');
  if (select('#control-panel')) panel.parent('control-panel');
  else panel.position(20, 540);

  // Baris aksi
  let bar = createDiv().parent(panel).addClass('toolbar');

  let fModel = createDiv().parent(bar).addClass('model-picker');
  createElement('label', 'Sistem').parent(fModel).attribute('for', 'pilih-model');
  selectModel = createSelect().parent(fModel).id('pilih-model');
  selectModel.option('Lintasan melengkung', 'roller_coaster');
  selectModel.option('Jatuh bebas & pantulan', 'jatuh_bebas');
  selectModel.option('Bandul sederhana', 'bandul');
  selectModel.selected('roller_coaster');
  selectModel.changed(gantiModelSimulasi);

  let aksi = createDiv().parent(bar).addClass('actions');
  tombolMulai = createButton('').parent(aksi).addClass('btn btn-primary');
  tombolMulai.mouseClicked(toggleSimulasi);

  tombolReset = createButton('Reset <kbd>R</kbd>').parent(aksi).addClass('btn');
  tombolReset.attribute('title', 'Kembalikan benda ke posisi awal');
  tombolReset.mouseClicked(resetSimulasi);

  tombolSlow = createButton('Lambat 0,4×').parent(aksi).addClass('btn');
  tombolSlow.attribute('aria-pressed', 'false');
  tombolSlow.mouseClicked(() => {
    isSlowMotion = !isSlowMotion;
    tombolSlow.attribute('aria-pressed', String(isSlowMotion));
  });

  tombolSimpan = createButton('Simpan PNG <kbd>S</kbd>').parent(aksi).addClass('btn btn-ghost');
  tombolSimpan.mouseClicked(simpanGambar);

  // Parameter
  let params = createDiv().parent(panel).addClass('params');

  let fm = buatField(params, 'sl-massa', 'Massa m');
  outMassa = fm.out;
  sliderMassa = createSlider(0.5, 5.0, 2.0, 0.1).parent(fm.field).id('sl-massa');
  sliderMassa.input(updateParameterSlider);

  let fg = buatField(params, 'sl-gravitasi', 'Gravitasi g');
  outGravitasi = fg.out;
  sliderGravitasi = createSlider(1.0, 25.0, 9.8, 0.2).parent(fg.field).id('sl-gravitasi');
  sliderGravitasi.input(updateParameterSlider);
  let preset = createDiv().parent(fg.field).addClass('presets');
  [['Bulan', 1.6], ['Bumi', 9.8], ['Jupiter', 24.8]].forEach(([nama, nilai]) => {
    let b = createButton(nama).parent(preset).addClass('chip');
    b.attribute('title', 'g = ' + fmt(nilai, 1) + ' m/s²');
    b.mouseClicked(() => {
      sliderGravitasi.value(nilai);
      updateParameterSlider();
    });
    tombolPresetG.push({ el: b, nilai: nilai });
  });

  let fmu = buatField(params, 'sl-gesekan', 'Redaman μ');
  outGesekan = fmu.out;
  sliderGesekan = createSlider(0.00, 0.20, 0.00, 0.01).parent(fmu.field).id('sl-gesekan');
  sliderGesekan.input(updateParameterSlider);

  let fp = buatField(params, 'sl-posisi', 'Posisi awal');
  labelPosisi = fp.label;
  outPosisi = fp.out;
  sliderKetinggian = createSlider(0, 1, 0.5, 0.01).parent(fp.field).id('sl-posisi');
  sliderKetinggian.input(updatePosisiAwalSlider);

  // Opsi tampilan
  let opsi = createDiv().parent(panel).addClass('toggles');
  createSpan('Tampilkan').parent(opsi).addClass('toggles-label');
  checkboxVektor = createCheckbox('Vektor v', true).parent(opsi);
  checkboxJejak = createCheckbox('Jejak', true).parent(opsi);
  checkboxGrid = createCheckbox('Grid', true).parent(opsi);
  checkboxSuara = createCheckbox('Suara', true).parent(opsi);
  checkboxSuara.changed(siapkanAudio);

  aturSliderPosisi();
  updateTeksUI();
  updateTombolMulai();
}

// Rentang slider posisi berbeda per model
function aturSliderPosisi() {
  let el = sliderKetinggian.elt;
  if (modelAktif === 'roller_coaster') {
    labelPosisi.html('Posisi awal');
    el.min = 0.05; el.max = 0.95; el.step = 0.01;
  } else if (modelAktif === 'jatuh_bebas') {
    labelPosisi.html('Ketinggian awal');
    el.min = 0.5; el.max = 9.5; el.step = 0.1;
  } else {
    labelPosisi.html('Simpangan awal');
    el.min = -80; el.max = 80; el.step = 1;
  }
  el.value = posisiAwal[modelAktif];
}

function terapkanPosisiAwal() {
  let p = posisiAwal[modelAktif];
  if (modelAktif === 'roller_coaster') { rc_u = p; rc_v = 0.0; }
  else if (modelAktif === 'jatuh_bebas') { jb_h = p; jb_v = 0.0; }
  else { bd_theta = radians(p); bd_omega = 0.0; }
}

function aturUlangAcuanEnergi() {
  hitungEnergiStatis();
  Edisip = 0.0;
  EmAwal = Em;
  riwayatEnergi = [];
  jejakObjek = [];
}

function updateParameterSlider() {
  let massaBaru = sliderMassa.value();
  let gBaru = sliderGravitasi.value();
  let acuanBerubah = massaBaru !== massa || gBaru !== g;
  massa = massaBaru;
  g = gBaru;
  muGesek = sliderGesekan.value();
  // m atau g berubah: Em ikut berubah, jadi acuan E0 dan grafik dimulai ulang
  if (acuanBerubah) aturUlangAcuanEnergi();
  updateTeksUI();
}

function updatePosisiAwalSlider() {
  posisiAwal[modelAktif] = Number(sliderKetinggian.value());
  terapkanPosisiAwal();
  waktuSimulasi = 0.0;
  aturUlangAcuanEnergi();
  updateTeksUI();
}

function updateTeksUI() {
  outMassa.html(fmt(sliderMassa.value(), 1) + ' kg');
  outGravitasi.html(fmt(sliderGravitasi.value(), 1) + ' m/s²');

  let mu = sliderGesekan.value();
  outGesekan.html(mu <= 0.0001 ? '0 · konservatif' : fmt(mu, 2) + ' · disipatif');
  if (mu > 0.0001) outGesekan.addClass('is-lossy');
  else outGesekan.removeClass('is-lossy');

  let p = posisiAwal[modelAktif];
  if (modelAktif === 'roller_coaster') outPosisi.html('h₀ = ' + fmt(rc_getHeight(p), 2) + ' m');
  else if (modelAktif === 'jatuh_bebas') outPosisi.html('h₀ = ' + fmt(p, 1) + ' m');
  else outPosisi.html('θ₀ = ' + fmt(p, 0) + '°');

  tombolPresetG.forEach(({ el, nilai }) => {
    el.attribute('aria-pressed', String(Math.abs(g - nilai) < 0.05));
  });
}

function updateTombolMulai() {
  if (!tombolMulai) return;
  tombolMulai.html((statusJalan ? 'Jeda' : 'Jalankan') + ' <kbd>Spasi</kbd>');
  tombolMulai.attribute('aria-pressed', String(statusJalan));
}

function toggleSimulasi() {
  siapkanAudio();
  statusJalan = !statusJalan;
  updateTombolMulai();
}

function gantiModelSimulasi() {
  modelAktif = selectModel.value();
  aturSliderPosisi();
  resetSimulasi();
}

function resetSimulasi() {
  waktuSimulasi = 0.0;
  massa = sliderMassa ? sliderMassa.value() : massa;
  g = sliderGravitasi ? sliderGravitasi.value() : g;
  muGesek = sliderGesekan ? sliderGesekan.value() : muGesek;

  terapkanPosisiAwal();
  aturUlangAcuanEnergi();

  statusJalan = false;
  updateTombolMulai();
  if (outPosisi) updateTeksUI();
}

function simpanGambar() {
  saveCanvas('simulasi_konservasi_energi', 'png');
}

// ============================================================================
// 8. INTERAKSI MOUSE / SENTUH (seret bola untuk mengatur posisi awal)
// ============================================================================
function mousePressed() {
  siapkanAudio();
  if (mouseX < 0 || mouseX > LEBAR_SIM || mouseY < 0 || mouseY > height) return;

  let b = posisiBola();
  if (dist(mouseX, mouseY, b.x, b.y) < b.r + 14) {
    isDragging = true;
    statusJalan = false;
    updateTombolMulai();
    return false; // cegah gulir halaman saat menyeret di layar sentuh
  }
}

function mouseDragged() {
  if (!isDragging) return;

  if (modelAktif === 'roller_coaster') {
    posisiAwal.roller_coaster = constrain((mouseX - RC_X_START) / (RC_X_END - RC_X_START), 0.05, 0.95);
  } else if (modelAktif === 'jatuh_bebas') {
    let r = radiusBola();
    posisiAwal.jatuh_bebas = Math.round(constrain((yTanah - mouseY - r) / skalaMeter, 0.5, 9.5) * 10) / 10;
  } else {
    let sudut = degrees(Math.atan2(mouseX - bd_pivotX, mouseY - bd_pivotY));
    posisiAwal.bandul = Math.round(constrain(sudut, -80, 80));
  }

  sliderKetinggian.value(posisiAwal[modelAktif]);
  terapkanPosisiAwal();
  waktuSimulasi = 0.0;
  aturUlangAcuanEnergi();
  updateTeksUI();
  return false;
}

function mouseReleased() {
  if (isDragging) {
    isDragging = false;
    aturUlangAcuanEnergi();
  }
}

// ============================================================================
// 9. PINTASAN KEYBOARD
// ============================================================================
function keyPressed() {
  siapkanAudio();
  let el = document.activeElement;
  let tag = el ? el.tagName : '';
  if (tag === 'SELECT' || tag === 'TEXTAREA') return;

  if (key === ' ') {
    // Spasi pada tombol/checkbox yang sedang fokus sudah ditangani browser
    if (tag === 'BUTTON' || (tag === 'INPUT' && el.type === 'checkbox')) return;
    toggleSimulasi();
    return false;
  }
  if (key === 'r' || key === 'R') {
    resetSimulasi();
    return false;
  }
  if (key === 's' || key === 'S') {
    simpanGambar();
    return false;
  }
}
