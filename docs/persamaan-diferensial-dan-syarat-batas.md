# Persamaan Diferensial, Syarat Batas, dan Flowchart

Jawaban untuk tiga pertanyaan minggu depan, berdasarkan kode di `sketch.js`:

1. Bagaimana ekspresi persamaan diferensialnya?
2. Bagaimana penerapan syarat batasnya?
3. Bagaimana flowchart programnya?

Simbol yang dipakai:

| Simbol | Arti | Nilai / rentang di program |
|---|---|---|
| m | massa | 0,5 – 5 kg (bawaan 2 kg) |
| g | percepatan gravitasi | 1 – 25 m/s² (bawaan 9,8) |
| μ | parameter redaman di slider | 0 – 0,20 (bawaan 0) |
| b | koefisien redaman dalam persamaan, b = k·μ | satuan 1/s |
| Δt | langkah waktu | 0,02 s (mode lambat 0,008 s) |

> **Catatan jujur tentang μ.** Di program, μ bukan koefisien gesek kinetik (gaya μN). μ dipakai sebagai redaman *viskos*, yaitu gaya yang sebanding dengan kecepatan: F = −m·b·v, dengan b = k·μ. Nilai k berbeda per model (2,5; 1,5; 1,8) dan dipilih agar efek redamannya terlihat jelas di layar.

---

## 1. Ekspresi persamaan diferensial

Ketiga sistem berasal dari Hukum II Newton, F = m·a, dan semuanya berupa **persamaan diferensial biasa orde dua**. Agar bisa diselesaikan dengan Euler-Cromer, setiap persamaan ditulis sebagai **dua persamaan orde satu**: satu untuk posisi, satu untuk kecepatan.

### 1.1 Jatuh bebas & pantulan (GLBB vertikal)

Variabel: ketinggian h(t) dan kecepatan v(t), positif ke atas.

```
d²h/dt² = −g − b·v          b = 1,5·μ
```

Sebagai sistem orde satu:

```
dh/dt = v
dv/dt = −g − b·v
```

Diskretisasi Euler-Cromer (`sketch.js` baris 256–259):

```
a     = −g − b·vₙ
vₙ₊₁ = vₙ + a·Δt
hₙ₊₁ = hₙ + vₙ₊₁·Δt
```

Kalau b = 0, ini persis GLBB di Modul 4.3: v = v₀ − g·t, h = h₀ + v₀·t − ½g·t².

### 1.2 Bandul sederhana

Variabel: sudut simpangan θ(t) dari garis vertikal dan kecepatan sudut ω(t). Panjang tali L = 6 m.

```
d²θ/dt² = −(g/L)·sin θ − b·ω          b = 1,8·μ
```

Sebagai sistem orde satu:

```
dθ/dt = ω
dω/dt = −(g/L)·sin θ − b·ω
```

Diskretisasi Euler-Cromer (baris 283–286):

```
α     = −(g/L)·sin θₙ − b·ωₙ
ωₙ₊₁ = ωₙ + α·Δt
θₙ₊₁ = θₙ + ωₙ₊₁·Δt
```

Besaran turunan untuk energi:

```
h = L·(1 − cos θ)        diukur dari titik terendah
v = L·ω
```

Persamaan ini **tidak dilinearkan** (sin θ tidak diganti θ). Karena itu periode pada sudut besar keluar benar: 5,15 s pada θ₀ = 49° dan 5,59 s pada θ₀ = 80°. Rumus sudut kecil 2π√(L/g) hanya memberi 4,92 s.

### 1.3 Lintasan melengkung

Variabel: jarak tempuh s(t) di sepanjang lintasan (panjang busur, meter) dan kelajuan v(t) searah lintasan.

Bentuk lintasan, dengan x posisi mendatar dan W = 490 px ÷ 42 px/m ≈ 11,67 m lebar lintasan (baris 175–185):

```
h(x) = 1,2 + 2,9·[1 − cos(2π(x/W − 0,5))] + 1,3·(1 − x/W)
```

Kemiringan di titik itu:

```
tan θ = dh/dx      →      sin θ = h'(x) / √(1 + h'(x)²)
```

Persamaan gerak, yaitu komponen gravitasi searah lintasan ditambah redaman:

```
d²s/dt² = −g·sin θ(s) − b·v          b = 2,5·μ
```

Sebagai sistem orde satu:

```
ds/dt = v
dv/dt = −g·sin θ(s) − b·v
```

Diskretisasi Euler-Cromer (baris 229–244):

```
a     = −g·sin θ(sₙ) − b·vₙ
vₙ₊₁ = vₙ + a·Δt
sₙ₊₁ = sₙ + vₙ₊₁·Δt
```

Karena θ bergantung pada posisi, program perlu mengubah s ke posisi x. Caranya, lintasan dipotong menjadi 2.000 segmen pendek, panjang setiap segmen dijumlahkan menjadi tabel s(x), lalu tabel itu dicari dan diinterpolasi.

### 1.4 Persamaan energi: penghubung ke topik konservasi

Energi tidak dipakai untuk menghitung gerak. Energi dihitung sesudahnya dari h dan v:

```
Ep = m·g·h        Ek = ½·m·v²        Em = Ep + Ek
```

Dari persamaan diferensial di atas, laju perubahan Em bisa diturunkan. Contoh jatuh bebas:

```
dEm/dt = m·v·(dv/dt) + m·g·(dh/dt)
       = m·v·(−g − b·v) + m·g·v
       = −m·b·v²
```

Hasil yang sama, **dEm/dt = −m·b·v²**, berlaku juga untuk bandul (v = Lω) dan lintasan. Artinya:

- **μ = 0 (b = 0):** dEm/dt = 0, jadi Em kekal secara analitik. Simulasi harus menghasilkan garis Em datar, dan penyimpangan yang tersisa adalah galat numerik.
- **μ > 0:** Em selalu turun (v² ≥ 0), paling cepat saat benda paling cepat. Energi yang hilang dicatat sebagai kalor Q = E₀ − Em.

---

## 2. Penerapan syarat awal dan syarat batas

Ketiga sistem ini adalah **masalah nilai awal** (*initial value problem*). Persamaan orde dua butuh dua syarat awal, yaitu posisi dan kecepatan di t = 0. Selain itu, ada **batas fisik** yang harus ditangani tersendiri, karena persamaan diferensialnya tidak tahu ada lantai atau ujung lintasan.

### 2.1 Syarat awal (t = 0)

Diterapkan di `terapkanPosisiAwal()` (baris 861–866). Semua benda dilepas dari keadaan **diam**.

| Sistem | Posisi awal (bawaan) | Rentang | Kecepatan awal |
|---|---|---|---|
| Jatuh bebas | h₀ = 7,5 m | 0,5 – 9,5 m | v₀ = 0 |
| Bandul | θ₀ = 49° | −80° – 80° | ω₀ = 0 |
| Lintasan | u₀ = 0,12 (h₀ = 7,36 m) | u = 0,05 – 0,95 | v₀ = 0 |

Posisi awal bisa diubah lewat slider atau dengan menyeret bola. Setiap kali syarat awal berubah, E₀ = Em(t = 0) dihitung ulang sebagai patokan (`aturUlangAcuanEnergi()`).

### 2.2 Syarat batas: jatuh bebas, lantai di h = 0

Baris 261–272. Dalam satu langkah Δt, bola bisa menembus lantai sedikit (h < 0). Program menerapkan:

```
jika h ≤ 0:
    e = 1 − 1,8·μ            koefisien restitusi (e = 1 jika μ = 0, lenting sempurna)
    h ← −e·h                  posisi dicerminkan ke atas lantai
    v ← −e·v                  arah kecepatan dibalik
    jika |v| < 0,25 m/s:      bola dianggap diam di lantai
        v ← 0, h ← 0
```

Posisi **dicerminkan**, bukan dipaksa ke h = 0. Kalau dipaksa nol, jarak tembus dalam langkah itu hilang begitu saja. Versi pertama kami memakai cara itu, dan galat energinya acak: 2,8 % pada Δt = 0,02 tetapi 5,8 % pada Δt = 0,005. Dengan pencerminan, galat mengecil teratur: 4,15 → 2,53 → 1,72 → 1,11 % untuk Δt = 0,04 → 0,005.

Batas |v| < 0,25 m/s mencegah bola bergetar terus di lantai ketika energinya hampir habis (μ > 0).

### 2.3 Syarat batas: lintasan, dinding di kedua ujung

Baris 234–244. Bola dibatasi di u = 0,03 sampai 0,97, yaitu jarak busur s_min sampai s_maks.

```
jika s < s_min:   s ← s_min,  v ← −(1 − μ)·v
jika s > s_maks:  s ← s_maks, v ← −(1 − μ)·v
```

Jika μ = 0, pantulannya lenting sempurna. Jika μ > 0, sebagian kecepatan hilang di setiap tumbukan dinding.

Dinding ini diperlukan karena bola dilepas dari h₀ = 7,36 m, lebih tinggi dari ujung kanan lintasan (sekitar 7,0 m). Tanpa dinding, bola akan keluar dari lintasan.

### 2.4 Syarat batas: bandul

Bandul tidak punya dinding. Batasnya adalah **kendala tali**: panjang L dianggap tetap. Kendala ini sudah terpenuhi dengan sendirinya karena gerak ditulis dalam sudut θ. Posisi bob selalu (L sin θ, L cos θ) dari titik gantung, jadi tidak perlu dikoreksi.

Simpangan awal dibatasi ±80°. Karena bandul selalu dilepas dari diam, energinya tidak pernah cukup untuk berputar penuh melewati titik gantung.

### 2.5 Acuan energi potensial (h = 0)

Ep = mgh bergantung pada di mana h = 0 dipilih:

| Sistem | h = 0 di |
|---|---|
| Jatuh bebas, lintasan | permukaan tanah |
| Bandul | titik terendah ayunan |

Pilihan acuan tidak mengubah fisikanya, karena yang berpengaruh adalah *perubahan* Ep. Acuan hanya menggeser nilai Ep dan Em secara konstan.

### Ringkasan syarat

| | Jatuh bebas | Bandul | Lintasan |
|---|---|---|---|
| Syarat awal | h₀, v₀ = 0 | θ₀, ω₀ = 0 | s₀, v₀ = 0 |
| Batas | lantai h = 0, dipantulkan dengan e | kendala tali L tetap | dinding di kedua ujung |
| Acuan h = 0 | tanah | titik terendah | tanah |

---

## 3. Flowchart program

Tiga flowchart sudah tersedia di folder ini, lengkap dengan narasi presentasinya di [`narasi-flowchart.md`](narasi-flowchart.md):

| Gambar | Isi |
|---|---|
| [`flowchart-alur-program.png`](flowchart-alur-program.png) | `setup()` → `resetSimulasi()` → `draw()` berulang: hitung lalu gambar |
| [`flowchart-langkah-fisika.png`](flowchart-langkah-fisika.png) | isi `updateFisika(Δt)`: tiga cabang persamaan diferensial dan syarat batasnya |
| [`flowchart-masukan.png`](flowchart-masukan.png) | apa yang terjadi saat pengguna menekan tombol, menggeser slider, atau menyeret bola |

**Kaitan dengan dua pertanyaan sebelumnya.** Flowchart langkah fisika memuat jawaban nomor 1 dan 2 sekaligus:

- Kotak "a = …" dan "v ← v + a·Δt, x ← x + v·Δt" di setiap cabang adalah **persamaan diferensial yang didiskritisasi** (bagian 1).
- Belah ketupat "h ≤ 0?" dan "s melewati ujung lintasan?" adalah **syarat batas** (bagian 2).
- Kotak "Ep = mgh, Ek = ½mv², Em = Ep + Ek" di bawahnya adalah **persamaan energi** (bagian 1.4).

Syarat awal muncul di flowchart alur program, pada kotak `resetSimulasi()`.

---

## Ringkasan satu slide

> **Persamaan diferensial:** ketiga sistem berasal dari F = m·a.
> Jatuh bebas: h″ = −g − b·h′ · Bandul: θ″ = −(g/L) sin θ − b·θ′ · Lintasan: s″ = −g sin θ(s) − b·s′.
> Setiap persamaan dipecah menjadi dua persamaan orde satu, lalu diselesaikan dengan Euler-Cromer (Δt = 0,02 s).
> Dari persamaan ini, dEm/dt = −m·b·v², sehingga Em kekal jika b = 0.
>
> **Syarat awal:** benda dilepas dari diam di h₀ atau θ₀ yang dipilih pengguna.
> **Syarat batas:** lantai memantulkan bola dengan koefisien restitusi e (posisi dicerminkan), lintasan berdinding di kedua ujung, dan tali bandul berpanjang tetap.
