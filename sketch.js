/**
 * ============================================================================
 * SIMULASI SAINS KOMPUTASI: KONSERVASI ENERGI MEKANIK (Ep + Ek = Em)
 * ============================================================================
 * Mata Kuliah : Sains Komputasi RPL (2026)
 * Dosen       : Prof. Dr. rer. nat. Yudi Rosandi & Dr. Budi Adiperdana
 * Pendekatan  : Eksperimen Teori & Simulasi Komputasi (3 Pilar Sains)
 * Metode      : Integrasi Numerik Waktu Diskrit (Euler-Cromer) & Visualisasi Real-Time
 * File        : sketch.js
 * ============================================================================
 * Rumus Fisika yang Digunakan:
 * 1. Energi Potensial Gravitasi : Ep = m * g * h
 * 2. Energi Kinetik             : Ek = 0.5 * m * v^2
 * 3. Energi Mekanik Total       : Em = Ep + Ek
 * 4. Hukum Kekekalan Energi     : Em = konstan (jika sistem konservatif / friksi = 0)
 * 5. Disipasi Energi            : E_disip = Em_awal - Em (jika ada redaman/gesekan)
 * ============================================================================
 */

// Nonaktifkan Friendly Errors untuk performa visual 60 FPS maksimal (sesuai modul/standar p5.js)
p5.disableFriendlyErrors = true;

// ============================================================================
// 1. VARIABEL GLOBAL FISIKA & SIMULASI
// ============================================================================
let massa = 2.0;          // Massa benda (kg)
let g = 9.8;              // Percepatan gravitasi (m/s^2)
let muGesek = 0.00;       // Koefisien redaman/gesek (0 = Konservatif Murni)
let dt = 0.02;            // Selang waktu integrasi numerik per frame (detik)
let skalaMeter = 42;      // Skala visual: 1 meter = 42 piksel
let yTanah = 460;         // Koordinat piksel permukaan tanah (acuan h = 0)
let waktuSimulasi = 0.0;  // Akumulasi waktu simulasi (detik)

// State Kontrol Simulasi
let statusJalan = false;   // Status animasi (true = jalan, false = jeda)
let isSlowMotion = false;  // Mode gerak lambat untuk observasi detail
let isDragging = false;    // Status interaksi drag mouse pada objek
let modelAktif = 'roller_coaster'; // 'roller_coaster' | 'jatuh_bebas' | 'bandul'

// Variabel Nilai Energi Terkini (Joule)
let Ep = 0.0;
let Ek = 0.0;
let Em = 0.0;
let Edisip = 0.0;
let EmAwal = 0.0;

// Riwayat Data untuk Grafik Real-Time
let riwayatEnergi = [];
const MAX_RIWAYAT = 180;

// Jejak Lintasan Objek (Trail)
let jejakObjek = [];
const MAX_JEJAK = 40;

// State Spesifik Model 1: Roller Coaster / Lintasan Melengkung
let rc_u = 0.12;          // Posisi parametrik lintasan (0.0 sampai 1.0)
let rc_v = 0.0;           // Kecepatan tangensial di lintasan (m/s)
const RC_X_START = 60;    // Batas kiri lintasan (px)
const RC_X_END = 540;     // Batas kanan lintasan (px)

// State Spesifik Model 2: Gerak Jatuh Bebas & Pantulan
let jb_x = 300;           // Posisi horizontal tetap bola (px)
let jb_h = 7.5;           // Ketinggian vertikal di atas tanah (m)
let jb_v = 0.0;           // Kecepatan vertikal (m/s, positif ke atas)

// State Spesifik Model 3: Bandul Sederhana
let bd_pivotX = 300;      // Titik tumpu engsel X (px)
let bd_pivotY = 100;      // Titik tumpu engsel Y (px)
let bd_L = 5.5;           // Panjang tali bandul (meter)
let bd_theta = 0.85;      // Sudut simpangan dari garis vertikal (radian)
let bd_omega = 0.0;       // Kecepatan sudut bandul (rad/s)

// Komponen Antarmuka / UI DOM (sesuai Bab 3.5 Modul Dr. Budi Adiperdana)
let selectModel;
let tombolMulai;
let tombolReset;
let tombolSlow;
let sliderMassa;
let sliderGravitasi;
let sliderGesekan;
let sliderKetinggian;
let checkboxVektor;
let checkboxJejak;
let checkboxGrid;

// Label Teks UI untuk memantau nilai slider
let labelMassaVal;
let labelGravitasiVal;
let labelGesekanVal;
let labelKetinggianVal;

// ============================================================================
// 2. FUNGSI SETUP (Inisialisasi Kanvas & Komponen UI)
// ============================================================================
function setup() {
  pixelDensity(1);
  let canvas = createCanvas(980, 520);
  
  // Jika ada container HTML '#canvas-container', tautkan ke sana
  let cContainer = select('#canvas-container');
  if (cContainer) {
    canvas.parent('canvas-container');
  }

  // Buat Antarmuka Kontrol Interaktif (DOM)
  inisialisasiUI();

  // Reset kondisi awal simulasi
  resetSimulasi();
}

// ============================================================================
// 3. FUNGSI DRAW (Loop Utama Animasi & Perhitungan Frame-by-Frame)
// ============================================================================
function draw() {
  // Update fisika numerik jika simulasi sedang berjalan dan tidak di-drag
  if (statusJalan && !isDragging) {
    // Mode gerak lambat membagi delta waktu agar fenomena mudah diamati siswa
    let effectiveDt = isSlowMotion ? dt * 0.4 : dt;
    updateFisika(effectiveDt);
  } else {
    // Jika dijeda, tetap perbarui pembacaan energi statis
    hitungEnergiStatis();
  }

  // 1. Gambar Area Kiri: Lingkungan Simulasi Fisika
  renderLingkunganSimulasi();

  // 2. Gambar Objek Fisika Sesuai Model Aktif
  if (modelAktif === 'roller_coaster') {
    renderRollerCoaster();
  } else if (modelAktif === 'jatuh_bebas') {
    renderJatuhBebas();
  } else if (modelAktif === 'bandul') {
    renderBandul();
  }

  // 3. Gambar Area Kanan: Dasbor Analisis Energi & Grafik Real-Time
  renderDasborEnergi();

  // Perbarui nilai teks slider pada panel UI
  updateTeksUI();
}

// ============================================================================
// 4. PEMODELAN MATEMATIKA & INTEGRASI NUMERIK SAINS KOMPUTASI
// ============================================================================

/**
 * Pembaruan kondisi fisis menggunakan pendekatan numerik Euler-Cromer.
 * Karakteristik: Kecepatan diperbarui lebih dulu dengan percepatan saat ini,
 * lalu posisi diperbarui dengan kecepatan baru. Ini menjaga konservasi energi
 * jauh lebih stabil dibandingkan metode Euler biasa.
 */
function updateFisika(deltaT) {
  waktuSimulasi += deltaT;

  if (modelAktif === 'roller_coaster') {
    updateFisikaRollerCoaster(deltaT);
  } else if (modelAktif === 'jatuh_bebas') {
    updateFisikaJatuhBebas(deltaT);
  } else if (modelAktif === 'bandul') {
    updateFisikaBandul(deltaT);
  }

  // Catat riwayat energi ke buffer array untuk plot kurva
  riwayatEnergi.push({
    t: waktuSimulasi,
    Ep: Ep,
    Ek: Ek,
    Em: Em,
    Edisip: Edisip
  });

  if (riwayatEnergi.length > MAX_RIWAYAT) {
    riwayatEnergi.shift();
  }
}

/**
 * Model 1: Lintasan Melengkung / Roller Coaster
 * Persamaan Ketinggian Lintasan: h(u) dalam meter, u in [0, 1]
 */
function rc_getHeight(u) {
  // Profil lintasan 2 bukit dan 1 lembah halus
  let baseH = 1.2;
  let wave = 2.9 * (1.0 - Math.cos(2.0 * Math.PI * (u - 0.5)));
  let tilt = 1.3 * (1.0 - u);
  return baseH + wave + tilt;
}

function rc_getSlope(u) {
  // Turunan analitik dh/du
  let dWave = 5.8 * Math.PI * Math.sin(2.0 * Math.PI * (u - 0.5));
  let dTilt = -1.3;
  return dWave + dTilt;
}

function updateFisikaRollerCoaster(deltaT) {
  let trackWidthM = (RC_X_END - RC_X_START) / skalaMeter;
  let dh_du = rc_getSlope(rc_u);
  let dh_dx = dh_du / trackWidthM;
  let theta = Math.atan(dh_dx); // Kemiringan lintasan (radian)

  // Percepatan tangensial sepanjang kurva:
  // a_t = - g * sin(theta) - gaya_gesek / m
  let aTangensial = -g * Math.sin(theta) - (muGesek * 2.5) * rc_v;

  // Integrasi Euler-Cromer
  rc_v += aTangensial * deltaT;
  let ds = rc_v * deltaT; // perpindahan sepanjang busur lintasan
  let du = (ds * Math.cos(theta)) / trackWidthM;
  rc_u += du;

  // Pantulan elastis jika mencapai ujung lintasan
  if (rc_u < 0.03) {
    rc_u = 0.03;
    rc_v = -rc_v * (1.0 - muGesek);
  } else if (rc_u > 0.97) {
    rc_u = 0.97;
    rc_v = -rc_v * (1.0 - muGesek);
  }

  // Perhitungan Energi
  let h = rc_getHeight(rc_u);
  Ep = massa * g * h;
  Ek = 0.5 * massa * (rc_v * rc_v);
  Em = Ep + Ek;

  if (muGesek > 0) {
    Edisip = Math.max(0, EmAwal - Em);
  } else {
    Edisip = 0.0;
  }

  // Rekam jejak posisi visual
  let posX = RC_X_START + rc_u * (RC_X_END - RC_X_START);
  let posY = yTanah - h * skalaMeter;
  tambahJejak(posX, posY);
}

/**
 * Model 2: Gerak Jatuh Bebas & Pantulan (GLBB Vertikal 1D)
 * Diturunkan langsung dari Modul Bagian 4.3 karya Dr. Budi Adiperdana
 */
function updateFisikaJatuhBebas(deltaT) {
  // Percepatan vertikal: gravitasi ke bawah (-g) dan gaya hambatan jika ada
  let a_y = -g - (muGesek * 1.5) * jb_v;

  // Integrasi Euler-Cromer
  jb_v += a_y * deltaT;
  jb_h += jb_v * deltaT;

  // Kondisi saat benda menyentuh permukaan tanah (h <= 0)
  if (jb_h <= 0.0) {
    jb_h = 0.0;
    // Koefisien restitusi (e = 1.0 jika tanpa gesekan / konservatif murni)
    let koefRestitusi = Math.max(0.0, 1.0 - muGesek * 1.8);
    jb_v = -jb_v * koefRestitusi;

    // Redam getaran numerik kecil saat benda berhenti total di lantai
    if (Math.abs(jb_v) < 0.25) {
      jb_v = 0.0;
      jb_h = 0.0;
    }
  }

  // Perhitungan Energi
  Ep = Math.max(0, massa * g * jb_h);
  Ek = 0.5 * massa * (jb_v * jb_v);
  Em = Ep + Ek;

  if (muGesek > 0) {
    Edisip = Math.max(0, EmAwal - Em);
  } else {
    Edisip = 0.0;
  }

  let posX = jb_x;
  let posY = yTanah - jb_h * skalaMeter;
  tambahJejak(posX, posY);
}

/**
 * Model 3: Ayunan Bandul Sederhana (Harmonic Motion)
 */
function updateFisikaBandul(deltaT) {
  // Percepatan sudut: alpha = - (g / L) * sin(theta) - redaman * omega
  let alpha = -(g / bd_L) * Math.sin(bd_theta) - (muGesek * 1.8) * bd_omega;

  // Integrasi Euler-Cromer
  bd_omega += alpha * deltaT;
  bd_theta += bd_omega * deltaT;

  // Ketinggian relatif terhadap titik terendah ayunan
  let h = bd_L * (1.0 - Math.cos(bd_theta));
  let v = bd_L * bd_omega; // Kecepatan linier tangensial (m/s)

  // Perhitungan Energi
  Ep = Math.max(0, massa * g * h);
  Ek = 0.5 * massa * (v * v);
  Em = Ep + Ek;

  if (muGesek > 0) {
    Edisip = Math.max(0, EmAwal - Em);
  } else {
    Edisip = 0.0;
  }

  let posX = bd_pivotX + bd_L * skalaMeter * Math.sin(bd_theta);
  let posY = bd_pivotY + bd_L * skalaMeter * Math.cos(bd_theta);
  tambahJejak(posX, posY);
}

/**
 * Menghitung energi statis saat simulasi dijeda atau saat objek di-drag.
 */
function hitungEnergiStatis() {
  if (modelAktif === 'roller_coaster') {
    let h = rc_getHeight(rc_u);
    Ep = massa * g * h;
    Ek = 0.5 * massa * (rc_v * rc_v);
  } else if (modelAktif === 'jatuh_bebas') {
    Ep = massa * g * Math.max(0, jb_h);
    Ek = 0.5 * massa * (jb_v * jb_v);
  } else if (modelAktif === 'bandul') {
    let h = bd_L * (1.0 - Math.cos(bd_theta));
    let v = bd_L * bd_omega;
    Ep = massa * g * Math.max(0, h);
    Ek = 0.5 * massa * (v * v);
  }
  Em = Ep + Ek;
  if (muGesek <= 0.0001) {
    Edisip = 0.0;
  }
}

function tambahJejak(px, py) {
  jejakObjek.push({ x: px, y: py, umur: 1.0 });
  if (jejakObjek.length > MAX_JEJAK) {
    jejakObjek.shift();
  }
}

// ============================================================================
// 5. RENDER VISUAL SIMULASI (Area Kiri: Kanvas 0 s/d 600 px)
// ============================================================================

function renderLingkunganSimulasi() {
  // Latar belakang area eksperimen fisika
  noStroke();
  fill(244, 247, 251);
  rect(0, 0, 600, height);

  // Garis Grid Bantu Koordinat (jika checkbox dicentang)
  if (checkboxGrid.checked()) {
    stroke(226, 232, 240);
    strokeWeight(1);
    // Garis horizontal tiap 1 meter (skalaMeter piksel)
    for (let py = yTanah; py >= 30; py -= skalaMeter) {
      line(0, py, 600, py);
    }
    for (let px = 40; px < 600; px += skalaMeter) {
      line(px, 0, px, yTanah);
    }
  }

  // Penggaris Skala Ketinggian Sumbu Y di sisi kiri
  stroke(148, 163, 184);
  strokeWeight(2);
  line(38, 30, 38, yTanah);

  for (let m = 0; m <= 10; m++) {
    let py = yTanah - m * skalaMeter;
    if (py >= 20) {
      stroke(100, 116, 139);
      strokeWeight(m % 2 === 0 ? 2 : 1);
      line(32, py, 38, py);

      noStroke();
      fill(100, 116, 139);
      textSize(10);
      textAlign(RIGHT, CENTER);
      text(m + " m", 28, py);
    }
  }

  // Label sumbu ketinggian
  push();
  translate(14, yTanah / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, CENTER);
  textSize(11);
  textStyle(BOLD);
  fill(71, 85, 105);
  text("Ketinggian h (meter)", 0, 0);
  pop();

  // Garis Permukaan Tanah (h = 0)
  stroke(71, 85, 105);
  strokeWeight(3);
  line(0, yTanah, 600, yTanah);

  // Arsir Pola Tanah Teknik (Hatched Ground Pattern)
  stroke(148, 163, 184);
  strokeWeight(1.5);
  for (let px = 0; px < 600; px += 16) {
    line(px, yTanah, px - 10, yTanah + 14);
  }

  // Label Acuan Ketinggian Tanah
  noStroke();
  fill(15, 23, 42);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("Garis Acuan Tanah (h = 0 m | Ep = 0 J)", 50, yTanah + 16);

  // Gambar Jejak Lintasan (Trail) jika diaktifkan
  if (checkboxJejak.checked() && jejakObjek.length > 1) {
    noFill();
    for (let i = 1; i < jejakObjek.length; i++) {
      let alphaVal = map(i, 0, jejakObjek.length, 20, 180);
      stroke(59, 130, 246, alphaVal);
      strokeWeight(map(i, 0, jejakObjek.length, 1.5, 4));
      line(jejakObjek[i - 1].x, jejakObjek[i - 1].y, jejakObjek[i].x, jejakObjek[i].y);
    }
  }

  // Indikator Status & Bantuan Pengoperasian di Kanvas
  fill(15, 23, 42);
  textSize(13);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  let statusStr = statusJalan ? (isSlowMotion ? "STATUS: BERJALAN (Slow-Mo 0.4x)" : "STATUS: BERJALAN (Normal)") : "STATUS: DIJEDA / SIAP";
  text(statusStr, 50, 16);

  textSize(11);
  textStyle(NORMAL);
  fill(100, 116, 139);
  text("Tip: Klik & geser bola dengan mouse untuk mengatur ketinggian awal", 50, 36);
}

/**
 * Render Model 1: Roller Coaster
 */
function renderRollerCoaster() {
  let trackWidthM = (RC_X_END - RC_X_START) / skalaMeter;

  // Gambar Pilar Penyangga Rel ke Tanah
  stroke(203, 213, 225);
  strokeWeight(2);
  for (let u = 0.05; u <= 0.95; u += 0.08) {
    let px = RC_X_START + u * (RC_X_END - RC_X_START);
    let py = yTanah - rc_getHeight(u) * skalaMeter;
    line(px, py, px, yTanah);
  }

  // Gambar Rel Ganda (Track)
  noFill();
  stroke(100, 116, 139);
  strokeWeight(5);
  beginShape();
  for (let u = 0.0; u <= 1.0; u += 0.015) {
    let px = RC_X_START + u * (RC_X_END - RC_X_START);
    let py = yTanah - rc_getHeight(u) * skalaMeter;
    vertex(px, py);
  }
  endShape();

  stroke(59, 130, 246);
  strokeWeight(2.5);
  beginShape();
  for (let u = 0.0; u <= 1.0; u += 0.015) {
    let px = RC_X_START + u * (RC_X_END - RC_X_START);
    let py = yTanah - rc_getHeight(u) * skalaMeter - 3;
    vertex(px, py);
  }
  endShape();

  // Posisi Benda Terkini
  let hBenda = rc_getHeight(rc_u);
  let bendaX = RC_X_START + rc_u * (RC_X_END - RC_X_START);
  let bendaY = yTanah - hBenda * skalaMeter;
  let radiusVisual = map(massa, 0.5, 5.0, 12, 22);

  // Garis Bantu Dimensi Ketinggian (h)
  stroke(16, 185, 129, 180);
  strokeWeight(1.5);
  drawingContext.setLineDash([4, 4]);
  line(bendaX, bendaY, bendaX, yTanah);
  drawingContext.setLineDash([]);

  noStroke();
  fill(16, 185, 129);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("h = " + nf(hBenda, 1, 2) + " m", bendaX + radiusVisual + 6, (bendaY + yTanah) / 2);

  // Gambar Benda Bola Berkilau
  renderBola(bendaX, bendaY, radiusVisual);

  // Vektor Kecepatan (jika checkbox dicentang)
  if (checkboxVektor.checked()) {
    let dh_du = rc_getSlope(rc_u);
    let dh_dx = dh_du / trackWidthM;
    let theta = Math.atan(dh_dx);
    let vx = rc_v * Math.cos(theta);
    let vy = -rc_v * Math.sin(theta); // Negatif karena sumbu Y kanvas terbalik
    renderPanahVektor(bendaX, bendaY, vx, vy, "v = " + nf(Math.abs(rc_v), 1, 2) + " m/s");
  }
}

/**
 * Render Model 2: Jatuh Bebas & Pantulan
 */
function renderJatuhBebas() {
  let radiusVisual = map(massa, 0.5, 5.0, 14, 26);
  let bendaX = jb_x;
  let bendaY = yTanah - jb_h * skalaMeter;

  // Tiang Menara Acuan
  stroke(226, 232, 240);
  strokeWeight(6);
  line(bendaX - 50, 40, bendaX - 50, yTanah);
  stroke(148, 163, 184);
  strokeWeight(2);
  line(bendaX - 50, 40, bendaX - 50, yTanah);

  // Landasan Pantul di Tanah
  noStroke();
  fill(71, 85, 105);
  rect(bendaX - 40, yTanah - 4, 80, 8, 3);

  // Bayangan di Tanah (Membesar saat mendekati tanah)
  let shadowAlpha = map(jb_h, 0, 8, 160, 20);
  let shadowWidth = map(jb_h, 0, 8, radiusVisual * 2.2, radiusVisual * 0.8);
  fill(15, 23, 42, shadowAlpha);
  ellipse(bendaX, yTanah, shadowWidth, 8);

  // Garis Bantu Dimensi Ketinggian (h)
  stroke(16, 185, 129, 180);
  strokeWeight(1.5);
  drawingContext.setLineDash([4, 4]);
  line(bendaX + 35, bendaY, bendaX + 35, yTanah);
  line(bendaX, bendaY, bendaX + 40, bendaY);
  drawingContext.setLineDash([]);

  noStroke();
  fill(16, 185, 129);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("h = " + nf(jb_h, 1, 2) + " m", bendaX + 42, (bendaY + yTanah) / 2);

  // Gambar Benda Bola
  renderBola(bendaX, bendaY, radiusVisual);

  // Vektor Kecepatan (jika dicentang)
  if (checkboxVektor.checked()) {
    renderPanahVektor(bendaX, bendaY, 0, -jb_v, "v = " + nf(jb_v, 1, 2) + " m/s");
  }
}

/**
 * Render Model 3: Bandul Sederhana
 */
function renderBandul() {
  let radiusVisual = map(massa, 0.5, 5.0, 14, 26);
  let bobX = bd_pivotX + bd_L * skalaMeter * Math.sin(bd_theta);
  let bobY = bd_pivotY + bd_L * skalaMeter * Math.cos(bd_theta);
  let lowestY = bd_pivotY + bd_L * skalaMeter;
  let hBenda = bd_L * (1.0 - Math.cos(bd_theta));

  // Tumpuan Plafon / Engsel
  fill(71, 85, 105);
  noStroke();
  rect(bd_pivotX - 40, bd_pivotY - 14, 80, 14, 4);
  fill(203, 213, 225);
  circle(bd_pivotX, bd_pivotY, 10);

  // Garis Putus-Putus Sumbu Vertikal Acuan Simetri
  stroke(148, 163, 184, 150);
  strokeWeight(1);
  drawingContext.setLineDash([4, 4]);
  line(bd_pivotX, bd_pivotY, bd_pivotX, lowestY + 30);
  drawingContext.setLineDash([]);

  // Tali Bandul
  stroke(51, 65, 85);
  strokeWeight(2.5);
  line(bd_pivotX, bd_pivotY, bobX, bobY);

  // Garis Acuan Ketinggian Terendah Bandul
  stroke(148, 163, 184, 120);
  strokeWeight(1);
  drawingContext.setLineDash([3, 3]);
  line(bd_pivotX - 120, lowestY, bd_pivotX + 120, lowestY);
  line(bobX, bobY, bobX + 30, bobY);
  line(bobX + 25, bobY, bobX + 25, lowestY);
  drawingContext.setLineDash([]);

  noStroke();
  fill(16, 185, 129);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("h = " + nf(hBenda, 1, 2) + " m", bobX + 30, (bobY + lowestY) / 2);

  // Gambar Busur Simpangan Sudut Theta
  let arcRadius = 70;
  noFill();
  stroke(245, 158, 11);
  strokeWeight(2);
  let startAngle = bd_theta >= 0 ? HALF_PI : HALF_PI + bd_theta;
  let endAngle = bd_theta >= 0 ? HALF_PI + bd_theta : HALF_PI;
  arc(bd_pivotX, bd_pivotY, arcRadius, arcRadius, startAngle, endAngle);

  fill(245, 158, 11);
  noStroke();
  textSize(11);
  textAlign(CENTER, TOP);
  let thetaDeg = (bd_theta * 180 / Math.PI);
  text("θ = " + nf(thetaDeg, 1, 1) + "°", bd_pivotX + (bd_theta >= 0 ? 30 : -30), bd_pivotY + 45);

  // Gambar Benda Bob Bandul
  renderBola(bobX, bobY, radiusVisual);

  // Vektor Kecepatan Linier (Tegak lurus terhadap tali)
  if (checkboxVektor.checked()) {
    let linSpeed = bd_L * bd_omega;
    let vx = linSpeed * Math.cos(bd_theta);
    let vy = -linSpeed * Math.sin(bd_theta);
    renderPanahVektor(bobX, bobY, vx, vy, "v = " + nf(Math.abs(linSpeed), 1, 2) + " m/s");
  }
}

/**
 * Render visual bola dengan gradien bayangan dan highlight refleksi
 */
function renderBola(bx, by, r) {
  // Cincin interaktif jika mouse berada di atas bola
  let dMouse = dist(mouseX, mouseY, bx, by);
  if (dMouse < r + 8 || isDragging) {
    stroke(59, 130, 246, 200);
    strokeWeight(2);
    noFill();
    circle(bx, by, (r + 7) * 2);
    cursor(HAND);
  } else {
    cursor(ARROW);
  }

  // Badan Bola Utama
  noStroke();
  fill(37, 99, 235);
  circle(bx, by, r * 2);

  // Highlight Refleksi Cahaya (3D Specular Look)
  fill(255, 255, 255, 140);
  circle(bx - r * 0.35, by - r * 0.35, r * 0.7);

  fill(255, 255, 255, 220);
  circle(bx - r * 0.4, by - r * 0.4, r * 0.3);
}

/**
 * Render panah vektor kecepatan dengan kepala panah jelas
 */
function renderPanahVektor(x, y, vx, vy, label) {
  let scaleV = 6.5; // Faktor pembesaran visual panjang panah
  let endX = x + vx * scaleV;
  let endY = y + vy * scaleV;
  let magV = Math.sqrt(vx * vx + vy * vy);

  stroke(220, 38, 38);
  strokeWeight(2.5);
  line(x, y, endX, endY);

  // Kepala panah (arrowhead) jika vektor cukup panjang
  if (magV > 0.1) {
    let angle = Math.atan2(vy, vx);
    let headSize = 8;
    push();
    translate(endX, endY);
    rotate(angle);
    fill(220, 38, 38);
    noStroke();
    triangle(0, 0, -headSize, -headSize / 2, -headSize, headSize / 2);
    pop();
  }

  // Label Vektor
  noStroke();
  fill(185, 28, 28);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, BOTTOM);
  text(label, endX + 8, endY - 4);
}

// ============================================================================
// 6. RENDER DASBOR ANALISIS ENERGI (Area Kanan: Kanvas 600 s/d 980 px)
// ============================================================================

function renderDasborEnergi() {
  let startX = 600;
  let dashW = width - startX;

  // Latar Belakang Kartu Dasbor (Modern Slate Theme)
  noStroke();
  fill(15, 23, 42); // slate-900
  rect(startX, 0, dashW, height);

  // Garis Pembatas Vertikal
  stroke(30, 41, 59);
  strokeWeight(2);
  line(startX, 0, startX, height);

  // Header Judul Dasbor
  fill(248, 250, 252);
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("ANALISIS ENERGI MEKANIK", startX + 20, 16);

  fill(148, 163, 184);
  textSize(11);
  textStyle(NORMAL);
  text("Hukum Kekekalan: Em = Ep + Ek = Konstan", startX + 20, 36);

  // Diagram Batang Energi Real-Time (Energy Bar Chart)
  let barY = 65;
  let barMaxW = dashW - 40;
  let refTotal = Math.max(EmAwal, Em, 1.0);

  // 1. Energi Potensial (Ep = m * g * h) -> Warna Hijau Emerald
  renderBarEnergi(
    startX + 20,
    barY,
    barMaxW,
    "Energi Potensial (Ep = m·g·h)",
    Ep,
    refTotal,
    color(16, 185, 129),
    color(5, 150, 105)
  );

  // 2. Energi Kinetik (Ek = 0.5 * m * v^2) -> Warna Biru Langit
  renderBarEnergi(
    startX + 20,
    barY + 45,
    barMaxW,
    "Energi Kinetik (Ek = ½·m·v²)",
    Ek,
    refTotal,
    color(14, 165, 233),
    color(2, 132, 199)
  );

  // 3. Energi Disipasi / Termal (jika ada gesekan) -> Warna Merah Coral
  renderBarEnergi(
    startX + 20,
    barY + 90,
    barMaxW,
    "Energi Terdisipasi / Kalor (W_gesek)",
    Edisip,
    refTotal,
    color(244, 63, 94),
    color(225, 29, 72)
  );

  // 4. Energi Mekanik Total (Em = Ep + Ek) -> Warna Emas / Amber
  renderBarEnergi(
    startX + 20,
    barY + 135,
    barMaxW,
    "Energi Mekanik Total (Em = Ep + Ek)",
    Em,
    refTotal,
    color(245, 158, 11),
    color(217, 119, 6)
  );

  // Grafik Kurva Energi Terhadap Waktu (Sesuai Konsep Kode 4.4.3 Plot Sinusoid Modul)
  let graphX = startX + 20;
  let graphY = 270;
  let graphW = dashW - 40;
  let graphH = 130;
  renderGrafikEnergi(graphX, graphY, graphW, graphH, refTotal);

  // Kotak Telemetri Nilai Fisis Terkini
  let infoY = 420;
  fill(30, 41, 59);
  noStroke();
  rect(startX + 20, infoY, dashW - 40, 85, 6);

  // Teks Indikator Nilai Fisis
  fill(226, 232, 240);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("Parameter Fisis Terkini:", startX + 32, infoY + 10);

  textStyle(NORMAL);
  textSize(11);
  fill(203, 213, 225);

  let curH = modelAktif === 'roller_coaster' ? rc_getHeight(rc_u) : (modelAktif === 'jatuh_bebas' ? jb_h : bd_L * (1 - Math.cos(bd_theta)));
  let curV = modelAktif === 'roller_coaster' ? Math.abs(rc_v) : (modelAktif === 'jatuh_bebas' ? Math.abs(jb_v) : Math.abs(bd_L * bd_omega));

  text("Ketinggian (h)  : " + nf(curH, 1, 2) + " m", startX + 32, infoY + 30);
  text("Kecepatan (v)   : " + nf(curV, 1, 2) + " m/s", startX + 32, infoY + 46);
  text("Massa (m)       : " + nf(massa, 1, 1) + " kg", startX + 200, infoY + 30);
  text("Gravitasi (g)   : " + nf(g, 1, 1) + " m/s²", startX + 200, infoY + 46);

  // Badge Status Konservasi
  let statusKonservasi = muGesek <= 0.0001 ? "KONSERVATIF MURNI (Em = Konstan 100%)" : "NON-KONSERVATIF (Disipasi Friksi)";
  fill(muGesek <= 0.0001 ? color(16, 185, 129) : color(244, 63, 94));
  textStyle(BOLD);
  text("Status: " + statusKonservasi, startX + 32, infoY + 65);
}

/**
 * Komponen Diagram Batang Energi
 */
function renderBarEnergi(x, y, w, title, val, maxVal, cFill, cBorder) {
  noStroke();
  fill(203, 213, 225);
  textSize(11);
  textStyle(NORMAL);
  textAlign(LEFT, BOTTOM);
  text(title, x, y + 14);

  // Nilai Angka Joule
  textAlign(RIGHT, BOTTOM);
  textStyle(BOLD);
  fill(cFill);
  text(nf(val, 1, 1) + " J", x + w, y + 14);

  // Rel Dasar Batang (Background Track)
  fill(30, 41, 59);
  rect(x, y + 17, w, 14, 4);

  // Isi Batang (Fill Progress)
  let rasio = constrain(val / maxVal, 0, 1);
  if (rasio > 0.001) {
    fill(cFill);
    rect(x, y + 17, w * rasio, 14, 4);
  }
}

/**
 * Komponen Plot Kurva Energi Terhadap Waktu (Time-Series)
 */
function renderGrafikEnergi(gx, gy, gw, gh, maxEnergy) {
  // Latar Belakang Kotak Grafik
  fill(15, 23, 42);
  stroke(51, 65, 85);
  strokeWeight(1);
  rect(gx, gy, gw, gh, 6);

  // Garis Sumbu & Grid Internal
  stroke(30, 41, 59);
  line(gx, gy + gh / 2, gx + gw, gy + gh / 2);

  // Label Judul Grafik & Legenda
  noStroke();
  fill(226, 232, 240);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("Grafik Energi vs Waktu (E vs t)", gx + 8, gy + 8);

  // Legenda Warna
  let legX = gx + gw - 170;
  let legY = gy + 8;
  textSize(10);
  fill(16, 185, 129); text("● Ep", legX, legY);
  fill(14, 165, 233); text("● Ek", legX + 40, legY);
  fill(245, 158, 11); text("● Em", legX + 80, legY);
  if (muGesek > 0) {
    fill(244, 63, 94); text("● Ed", legX + 120, legY);
  }

  // Plot Kurva Menggunakan beginShape() dan vertex()
  if (riwayatEnergi.length > 1) {
    let n = riwayatEnergi.length;
    let safeMax = Math.max(maxEnergy, 1.0);

    // 1. Kurva Ep (Hijau)
    noFill();
    stroke(16, 185, 129);
    strokeWeight(1.8);
    beginShape();
    for (let i = 0; i < n; i++) {
      let vx = map(i, 0, MAX_RIWAYAT, gx + 6, gx + gw - 6);
      let vy = map(riwayatEnergi[i].Ep, 0, safeMax, gy + gh - 8, gy + 28);
      vertex(vx, constrain(vy, gy + 24, gy + gh - 6));
    }
    endShape();

    // 2. Kurva Ek (Biru)
    stroke(14, 165, 233);
    strokeWeight(1.8);
    beginShape();
    for (let i = 0; i < n; i++) {
      let vx = map(i, 0, MAX_RIWAYAT, gx + 6, gx + gw - 6);
      let vy = map(riwayatEnergi[i].Ek, 0, safeMax, gy + gh - 8, gy + 28);
      vertex(vx, constrain(vy, gy + 24, gy + gh - 6));
    }
    endShape();

    // 3. Kurva Edisip (Merah) jika ada
    if (muGesek > 0) {
      stroke(244, 63, 94);
      strokeWeight(1.5);
      beginShape();
      for (let i = 0; i < n; i++) {
        let vx = map(i, 0, MAX_RIWAYAT, gx + 6, gx + gw - 6);
        let vy = map(riwayatEnergi[i].Edisip, 0, safeMax, gy + gh - 8, gy + 28);
        vertex(vx, constrain(vy, gy + 24, gy + gh - 6));
      }
      endShape();
    }

    // 4. Kurva Em (Emas) -> Konservasi Energi Menghasilkan Garis Lurus Horizontal!
    stroke(245, 158, 11);
    strokeWeight(2.2);
    beginShape();
    for (let i = 0; i < n; i++) {
      let vx = map(i, 0, MAX_RIWAYAT, gx + 6, gx + gw - 6);
      let vy = map(riwayatEnergi[i].Em, 0, safeMax, gy + gh - 8, gy + 28);
      vertex(vx, constrain(vy, gy + 24, gy + gh - 6));
    }
    endShape();
  }
}

// ============================================================================
// 7. INISIALISASI & MANAJEMEN KOMPONEN KONTROL ANTARMUKA (UI DOM)
// ============================================================================

function inisialisasiUI() {
  // Induk container kontrol jika ada di index.html
  let parentPanel = select('#control-panel');

  // Wadah utama panel kontrol dibuat rapi dengan CSS styling
  let panel = createDiv();
  panel.id('sim-controls-wrapper');
  if (parentPanel) {
    panel.parent('control-panel');
  } else {
    panel.position(20, 540);
  }

  // Baris 1: Pilihan Model Sistem Fisis & Tombol Aksi
  let row1 = createDiv().parent(panel).style('display', 'flex').style('gap', '12px').style('align-items', 'center').style('margin-bottom', '12px');

  createDiv('<b>Pilih Sistem Fisis:</b>').parent(row1).style('font-size', '13px');
  selectModel = createSelect().parent(row1);
  selectModel.option('1. Lintasan Melengkung (Roller Coaster)', 'roller_coaster');
  selectModel.option('2. Gerak Jatuh Bebas & Pantulan', 'jatuh_bebas');
  selectModel.option('3. Ayunan Bandul Sederhana', 'bandul');
  selectModel.selected('roller_coaster');
  selectModel.changed(gantiModelSimulasi);
  selectModel.style('padding', '6px 10px').style('border-radius', '6px').style('background', '#ffffff').style('border', '1px solid #cbd5e1');

  tombolMulai = createButton('▶ Jalankan / Jeda').parent(row1);
  tombolMulai.style('padding', '7px 14px').style('background', '#2563eb').style('color', '#ffffff').style('font-weight', 'bold').style('border', 'none').style('border-radius', '6px').style('cursor', 'pointer');
  tombolMulai.mousePressed(toggleSimulasi);

  tombolReset = createButton('↺ Reset Posisi').parent(row1);
  tombolReset.style('padding', '7px 14px').style('background', '#475569').style('color', '#ffffff').style('border', 'none').style('border-radius', '6px').style('cursor', 'pointer');
  tombolReset.mousePressed(resetSimulasi);

  tombolSlow = createButton('🐢 Slow-Mo (0.4x)').parent(row1);
  tombolSlow.style('padding', '7px 14px').style('background', '#0f766e').style('color', '#ffffff').style('border', 'none').style('border-radius', '6px').style('cursor', 'pointer');
  tombolSlow.mousePressed(() => {
    isSlowMotion = !isSlowMotion;
    tombolSlow.style('background', isSlowMotion ? '#0d9488' : '#0f766e');
    tombolSlow.html(isSlowMotion ? '⚡ Kecepatan Normal (1x)' : '🐢 Slow-Mo (0.4x)');
  });

  // Baris 2: Parameter Slider
  let row2 = createDiv().parent(panel).style('display', 'grid').style('grid-template-columns', 'repeat(auto-fit, minmax(200px, 1fr))').style('gap', '16px').style('margin-bottom', '12px').style('background', '#f8fafc').style('padding', '12px').style('border-radius', '8px').style('border', '1px solid #e2e8f0');

  // Slider Massa (m)
  let boxMassa = createDiv().parent(row2);
  boxMassa.html('<span>Massa Benda (m): </span>');
  labelMassaVal = createSpan('2.0 kg').parent(boxMassa).style('font-weight', 'bold').style('color', '#2563eb');
  sliderMassa = createSlider(0.5, 5.0, 2.0, 0.1).parent(boxMassa).style('width', '100%');
  sliderMassa.input(updateParameterSlider);

  // Slider Gravitasi (g)
  let boxGrav = createDiv().parent(row2);
  boxGrav.html('<span>Gravitasi (g): </span>');
  labelGravitasiVal = createSpan('9.8 m/s²').parent(boxGrav).style('font-weight', 'bold').style('color', '#2563eb');
  sliderGravitasi = createSlider(1.0, 25.0, 9.8, 0.2).parent(boxGrav).style('width', '100%');
  sliderGravitasi.input(updateParameterSlider);

  // Slider Gesekan / Redaman (mu)
  let boxGesek = createDiv().parent(row2);
  boxGesek.html('<span>Redaman / Gesekan (μ): </span>');
  labelGesekanVal = createSpan('0.00 (Murni)').parent(boxGesek).style('font-weight', 'bold').style('color', '#16a34a');
  sliderGesekan = createSlider(0.00, 0.20, 0.00, 0.01).parent(boxGesek).style('width', '100%');
  sliderGesekan.input(updateParameterSlider);

  // Slider Ketinggian Awal (h0)
  let boxH0 = createDiv().parent(row2);
  boxH0.html('<span>Posisi / Simpangan Awal: </span>');
  labelKetinggianVal = createSpan('Tinggi').parent(boxH0).style('font-weight', 'bold').style('color', '#2563eb');
  sliderKetinggian = createSlider(10, 90, 45, 1).parent(boxH0).style('width', '100%');
  sliderKetinggian.input(updatePosisiAwalSlider);

  // Baris 3: Kotak Centang (Checkboxes) Opsi Tampilan
  let row3 = createDiv().parent(panel).style('display', 'flex').style('gap', '20px').style('font-size', '13px');
  checkboxVektor = createCheckbox(' Tampilkan Vektor Kecepatan (v)', true).parent(row3);
  checkboxJejak = createCheckbox(' Tampilkan Jejak Lintasan (Trail)', true).parent(row3);
  checkboxGrid = createCheckbox(' Tampilkan Garis Bantu / Grid', true).parent(row3);
}

function updateParameterSlider() {
  massa = sliderMassa.value();
  g = sliderGravitasi.value();
  muGesek = sliderGesekan.value();
}

function updatePosisiAwalSlider() {
  let val = sliderKetinggian.value();
  if (modelAktif === 'roller_coaster') {
    rc_u = map(val, 10, 90, 0.08, 0.92);
    rc_v = 0.0;
  } else if (modelAktif === 'jatuh_bebas') {
    jb_h = map(val, 10, 90, 1.5, 9.0);
    jb_v = 0.0;
  } else if (modelAktif === 'bandul') {
    bd_theta = map(val, 10, 90, 0.15, 1.25);
    bd_omega = 0.0;
  }
  // Reset hitungan energi awal
  hitungEnergiStatis();
  EmAwal = Em;
  riwayatEnergi = [];
  jejakObjek = [];
}

function updateTeksUI() {
  if (labelMassaVal) labelMassaVal.html(nf(sliderMassa.value(), 1, 1) + ' kg');
  if (labelGravitasiVal) labelGravitasiVal.html(nf(sliderGravitasi.value(), 1, 1) + ' m/s²');
  if (labelGesekanVal) {
    let mu = sliderGesekan.value();
    if (mu <= 0.0001) {
      labelGesekanVal.html('0.00 (Konservatif Murni)').style('color', '#16a34a');
    } else {
      labelGesekanVal.html(nf(mu, 1, 2) + ' (Disipatif)').style('color', '#dc2626');
    }
  }
}

function toggleSimulasi() {
  statusJalan = !statusJalan;
  if (statusJalan) {
    tombolMulai.html('⏸ Jeda Simulasi').style('background', '#e11d48');
  } else {
    tombolMulai.html('▶ Jalankan').style('background', '#2563eb');
  }
}

function gantiModelSimulasi() {
  modelAktif = selectModel.value();
  resetSimulasi();
}

function resetSimulasi() {
  waktuSimulasi = 0.0;
  jejakObjek = [];
  riwayatEnergi = [];

  massa = sliderMassa ? sliderMassa.value() : 2.0;
  g = sliderGravitasi ? sliderGravitasi.value() : 9.8;
  muGesek = sliderGesekan ? sliderGesekan.value() : 0.00;

  if (modelAktif === 'roller_coaster') {
    rc_u = 0.12;
    rc_v = 0.0;
  } else if (modelAktif === 'jatuh_bebas') {
    jb_h = 7.5;
    jb_v = 0.0;
  } else if (modelAktif === 'bandul') {
    bd_theta = 0.85;
    bd_omega = 0.0;
  }

  hitungEnergiStatis();
  EmAwal = Em;

  if (tombolMulai) {
    statusJalan = false;
    tombolMulai.html('▶ Jalankan').style('background', '#2563eb');
  }
}

// ============================================================================
// 8. INTERAKSI MOUSE (Drag & Drop Posisi Awal Objek)
// ============================================================================

function mousePressed() {
  if (mouseX < 0 || mouseX > 600 || mouseY < 0 || mouseY > height) return;

  let bx, by, r;
  if (modelAktif === 'roller_coaster') {
    bx = RC_X_START + rc_u * (RC_X_END - RC_X_START);
    by = yTanah - rc_getHeight(rc_u) * skalaMeter;
    r = map(massa, 0.5, 5.0, 12, 22);
  } else if (modelAktif === 'jatuh_bebas') {
    bx = jb_x;
    by = yTanah - jb_h * skalaMeter;
    r = map(massa, 0.5, 5.0, 14, 26);
  } else if (modelAktif === 'bandul') {
    bx = bd_pivotX + bd_L * skalaMeter * Math.sin(bd_theta);
    by = bd_pivotY + bd_L * skalaMeter * Math.cos(bd_theta);
    r = map(massa, 0.5, 5.0, 14, 26);
  }

  if (dist(mouseX, mouseY, bx, by) < r + 15) {
    isDragging = true;
    statusJalan = false;
    if (tombolMulai) tombolMulai.html('▶ Jalankan').style('background', '#2563eb');
  }
}

function mouseDragged() {
  if (!isDragging) return;

  if (modelAktif === 'roller_coaster') {
    rc_u = constrain((mouseX - RC_X_START) / (RC_X_END - RC_X_START), 0.05, 0.95);
    rc_v = 0.0;
  } else if (modelAktif === 'jatuh_bebas') {
    jb_h = constrain((yTanah - mouseY) / skalaMeter, 0.2, 9.5);
    jb_v = 0.0;
  } else if (modelAktif === 'bandul') {
    let dx = mouseX - bd_pivotX;
    let dy = mouseY - bd_pivotY;
    bd_theta = constrain(Math.atan2(dx, dy), -1.4, 1.4);
    bd_omega = 0.0;
  }

  hitungEnergiStatis();
  EmAwal = Em;
  jejakObjek = [];
  riwayatEnergi = [];
}

function mouseReleased() {
  if (isDragging) {
    isDragging = false;
    hitungEnergiStatis();
    EmAwal = Em;
  }
}

// Pintasan Keyboard (Shortcut Keys)
function keyPressed() {
  if (key === ' ' || key === 'Space') {
    toggleSimulasi();
  } else if (key === 'r' || key === 'R') {
    resetSimulasi();
  } else if (key === 's' || key === 'S') {
    saveCanvas('simulasi_konservasi_energi_p5js', 'png');
  }
}
