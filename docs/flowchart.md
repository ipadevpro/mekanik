# Flowchart Simulasi Konservasi Energi Mekanik

Tiga diagram ini menggambarkan cara kerja `sketch.js`. Versi gambar untuk slide tersedia sebagai PNG dan SVG di folder ini.

## 1. Alur program

p5.js memanggil `setup()` sekali, lalu `draw()` terus-menerus, sekitar 60 kali per detik.

![Alur program](flowchart-alur-program.png)

```mermaid
flowchart TD
    A([Mulai]) --> B["<b>setup()</b><br/>buat kanvas 980 × 520<br/>buat kontrol: select, tombol, slider, checkbox"]
    B --> C["<b>resetSimulasi()</b><br/>terapkan posisi awal model aktif<br/>hitung Ep, Ek, Em → simpan sebagai E₀<br/>kosongkan grafik, t = 0"]
    C --> D(["<b>draw()</b> · diulang tiap frame"])
    D --> E{"Simulasi berjalan<br/>dan bola tidak diseret?"}
    E -- Ya --> F["<b>updateFisika(Δt)</b><br/>Δt = 0,02 s · mode lambat 0,4 Δt<br/><i>lihat diagram langkah fisika</i>"]
    E -- Tidak --> G["<b>hitungEnergiStatis()</b><br/>Ep, Ek, Em dari posisi saat ini"]
    F --> H["Gambar area eksperimen<br/>penggaris h, tanah, jejak, bola,<br/>garis h, vektor v"]
    G --> H
    H --> I["Gambar dasbor energi<br/>batang Ep, Ek, Q, Em · garis E₀<br/>grafik E terhadap t · pembacaan ΔEm"]
    I --> D
```

## 2. Satu langkah fisika: `updateFisika(Δt)`

Dipanggil sekali per frame selama simulasi berjalan. Ketiga sistem memakai urutan Euler-Cromer yang sama: kecepatan diperbarui dulu, lalu posisi memakai kecepatan yang baru.

![Langkah fisika](flowchart-langkah-fisika.png)

```mermaid
flowchart TD
    A(["<b>updateFisika(Δt)</b>"]) --> B["t ← t + Δt"]
    B --> C{"Sistem aktif?"}

    C -- Lintasan --> R1["θ dari kemiringan lintasan di u<br/>a = −g sin θ − 2,5μ·v"]
    R1 --> R2["v ← v + a·Δt<br/>s ← s + v·Δt"]
    R2 --> R3{"s melewati<br/>ujung lintasan?"}
    R3 -- Ya --> R4["s ← batas ujung<br/>v ← −v·(1 − μ)"]
    R3 -- Tidak --> R5
    R4 --> R5["u ← u(s) dari tabel panjang busur<br/>h ← h(u)"]

    C -- Jatuh bebas --> J1["a = −g − 1,5μ·v"]
    J1 --> J2["v ← v + a·Δt<br/>h ← h + v·Δt"]
    J2 --> J3{"h ≤ 0?"}
    J3 -- Ya --> J4["e = 1 − 1,8μ<br/>h ← −e·h · v ← −e·v<br/>jika |v| < 0,25 → bola diam"]
    J3 -- Tidak --> J5
    J4 --> J5["h dari tanah"]

    C -- Bandul --> P1["α = −(g/L) sin θ − 1,8μ·ω"]
    P1 --> P2["ω ← ω + α·Δt<br/>θ ← θ + ω·Δt"]
    P2 --> P3["h = L(1 − cos θ)<br/>v = L·ω"]

    R5 --> E1
    J5 --> E1
    P3 --> E1["Ep = m·g·h<br/>Ek = ½·m·v²<br/>Em = Ep + Ek"]
    E1 --> E2{"μ > 0?"}
    E2 -- Ya --> E3["Q = E₀ − Em"]
    E2 -- Tidak --> E4["Q = 0"]
    E3 --> E5["Simpan t, Ep, Ek, Em, Q ke riwayat<br/>(180 titik terakhir) · tambah jejak"]
    E4 --> E5
    E5 --> Z(["kembali ke draw()"])

    N["<b>Euler-Cromer</b>: kecepatan diperbarui dulu,<br/>posisi memakai kecepatan yang baru"] -.- R2
    N -.- J2
    N -.- P2
```

## 3. Masukan pengguna

Kejadian ini bisa terjadi kapan saja di antara dua frame. Hasilnya terlihat pada `draw()` berikutnya.

![Masukan pengguna](flowchart-masukan.png)

```mermaid
flowchart LR
    K1["Spasi / tombol Jalankan"] --> L1["statusJalan dibalik<br/>(jalan ⇄ jeda)"]
    K2["R / tombol Reset"] --> L2["resetSimulasi()<br/>kembali ke posisi awal"]
    K3["S / tombol Simpan PNG"] --> L3["saveCanvas()"]
    K4["Seret bola /<br/>slider posisi awal"] --> L4["posisi awal diubah · simulasi dijeda<br/>E₀ diatur ulang, grafik dikosongkan"]
    K5["Slider m atau g"] --> L5["E₀ diatur ulang<br/>grafik dimulai lagi"]
    K6["Slider μ"] --> L6["redaman berubah<br/>Q mulai tercatat jika μ > 0"]
    K7["Ganti sistem"] --> L7["rentang slider posisi diatur<br/>→ resetSimulasi()"]
```
