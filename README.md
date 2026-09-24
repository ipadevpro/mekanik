# Simulasi Konservasi Energi Mekanik (Sains Komputasi RPL)

Proyek simulasi laboratorium fisika virtual untuk mata kuliah **Sains Komputasi RPL 2026** (Dosen Pengampu: **Prof. Dr. rer. nat. Yudi Rosandi** & **Dr. Budi Adiperdana**), dikembangkan menggunakan **p5.js** dengan pendekatan pemodelan komputasi numerik diskrit waktu.

---

## 📌 Jawaban Pertanyaan: Apakah `index.html` Perlu?

> **Tanya:** *"buat sketch.js doang ya? kalau index.html perlu?"*

**Jawab:**
1. **YA, `index.html` SANGAT PERLU jika dijalankan di komputer lokal (Laptop / Offline / VS Code / Browser)**:
   - Sesuai dengan **Modul Simulasi Fisika p5.js Bab II Bagian 2 (*Cara 2: Unduh Berkas dan Membuat Script JS & HTML Secara Lokal*)**, browser membutuhkan file `index.html` sebagai berkas induk penghubung yang memuat pustaka p5.js via CDN (`https://cdnjs.cloudflare.com/...`) dan menjalankan file skrip `sketch.js`. Tanpa `index.html`, Anda tidak bisa membuka `sketch.js` di browser secara langsung.
2. **JIKA Dosen meminta pengumpulan di p5.js Web Editor (`editor.p5js.org`)**:
   - Anda **cukup menyalin (copy-paste)** seluruh isi kode dari file `sketch.js` saja ke dalam jendela editor, karena di p5.js Web Editor file `index.html` sudah otomatis disediakan di balik layar oleh platform.

Oleh karena itu, di proyek ini sudah disiapkan **keduanya**:
- [`index.html`](file:///Users/users/Documents/Project/p5js.energi/index.html) : Untuk menjalankan simulasi di browser laptop/lokal dengan tampilan antarmuka yang lengkap dan rapi.
- [`sketch.js`](file:///Users/users/Documents/Project/p5js.energi/sketch.js) : Seluruh logika algoritma fisika, sains komputasi numerik, rendering kanvas, dan antarmuka kontrol.

---

## 🎯 Keselarasan dengan Materi Kuliah Sains Komputasi RPL

Simulasi ini dirancang khusus mengikuti materi perkuliahan dan modul praktikum:
1. **3 Pilar Sains (Teori, Eksperimen Basah, Simulasi Komputasi / Eksperimen Kering)**:
   - Sesuai slide kuliah *Sains Komputasi RPL 00 Pendahuluan*, komputasi digunakan untuk memodelkan sistem fisis yang sulit atau mahal jika dieksperimenkan secara langsung, serta memvalidasi prediksi teoritis sebelum eksperimen.
2. **Diskritisasi Waktu ($\Delta t$) dan Integrasi Numerik (Euler-Cromer)**:
   - Melanjutkan materi GLB & GLBB dari Modul Bab IV (*4.1 GLB, 4.2 GLBB, 4.3 Jatuh Bebas, 4.4 Gerak Parabola*).
   - Menggunakan integrasi numerik langkah waktu diskrit:
     $$\vec{v}(t + \Delta t) = \vec{v}(t) + \vec{a}(t) \cdot \Delta t$$
     $$\vec{x}(t + \Delta t) = \vec{x}(t) + \vec{v}(t + \Delta t) \cdot \Delta t$$
3. **Plot Kurva Real-Time (Ekspansi Kode 4.4.3 Plot Sinusoid)**:
   - Menampilkan grafik waktu-nyata kurva $E_p(t)$, $E_k(t)$, dan $E_m(t)$ menggunakan fungsi `beginShape()` dan `vertex()`.
4. **Komponen Antarmuka Interaktif UI DOM (Modul Bab 3.5)**:
   - Menggunakan `createButton`, `createSlider`, `createCheckbox`, `createSelect`, dan `createDiv` untuk parameter massa ($m$), gravitasi ($g$), redaman ($\mu$), serta kontrol animasi.

---

## ⚙️ Fitur-Fitur Simulasi

1. **3 Model Sistem Fisis yang Dapat Dipilih**:
   - **Model 1: Lintasan Melengkung (Roller Coaster / Ramp 2D)** — Konversi energi bolak-balik antara bukit dan lembah.
   - **Model 2: Gerak Jatuh Bebas & Pantulan (GLBB 1D)** — Implementasi langsung materi Modul 4.3 dengan tumbukan lenting dan konservasi ketinggian.
   - **Model 3: Ayunan Bandul Sederhana (Pendulum)** — Osilasi harmonik non-linier antara energi kinetik di titik terendah dan energi potensial di titik simpangan maksimum.
2. **Dasbor Analisis Energi Real-Time**:
   - **Diagram Batang (Energy Bar Chart)**: Nilai $E_p$, $E_k$, $E_{disip}$, dan $E_m$ dalam Joule secara langsung.
   - **Grafik Energi vs Waktu ($E$ vs $t$)**: Saat redaman $\mu = 0$, garis $E_m$ membuktikan hukum kekekalan dengan membentuk garis lurus horizontal sempurna!
3. **Interaktivitas Mouse (Drag & Drop)**:
   - Tarik bola langsung dengan kursor mouse untuk mengatur ketinggian awal / posisi awal peluncuran.
4. **Pintasan Keyboard**:
   - `[Spasi]` : Mulai / Jeda simulasi
   - `[R]` : Reset simulasi ke posisi awal
   - `[S]` : Simpan tangkapan layar ke gambar PNG (`saveCanvas`)

---

## 🚀 Cara Menjalankan Simulasi

### Cara A: Menjalankan di Komputer Lokal (Offline)
1. Buka folder `/Users/users/Documents/Project/p5js.energi`.
2. Klik dua kali file `index.html` untuk langsung membukanya di browser (Google Chrome, Firefox, Safari, atau Edge).
3. Atau jalankan server lokal ringan via terminal:
   ```bash
   cd /Users/users/Documents/Project/p5js.energi
   python3 -m http.server 8000
   ```
   Lalu buka tautan `http://localhost:8000` di browser.

### Cara B: Menjalankan di p5.js Web Editor (Online)
1. Buka [editor.p5js.org](https://editor.p5js.org/).
2. Buka berkas `sketch.js` yang ada di proyek ini.
3. Salin (copy) semua baris kodenya dan tempel (paste) menggantikan kode bawaan di `editor.p5js.org`.
4. Klik tombol **Play (▶)** di pojok kiri atas.
