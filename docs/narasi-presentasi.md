# Narasi Presentasi: Konservasi Energi Mekanik

Sains Komputasi RPL 2026. Durasi sekitar 10 menit + demo.

Semua angka di bawah diambil dengan menjalankan fungsi fisika di `sketch.js` langsung, bukan dihitung ulang terpisah. Pengaturan bawaan, kecuali disebut lain:

| Parameter | Nilai |
|---|---|
| Massa m | 2 kg |
| Gravitasi g | 9,8 m/s² |
| Langkah waktu Δt | 0,02 s |
| Lama simulasi | 30 s (1.500 langkah) |
| Redaman μ | 0 |
| Posisi awal | lintasan h₀ = 7,36 m · jatuh bebas h₀ = 7,5 m · bandul θ₀ = 49°, L = 6 m |

---

## Slide 1 · Pembuka

**Tampilkan:** judul dan satu kalimat pertanyaan.

> "Kita semua hafal bahwa energi mekanik itu kekal: Ep + Ek = konstan. Pertanyaan kami: kalau hukum ini kita serahkan ke komputer, yang hanya bisa menghitung dalam langkah-langkah waktu yang terputus, apakah energinya masih kekal? Dan kalau tidak, seberapa jauh menyimpangnya?"

---

## Slide 2 · Model dan metode

**Tampilkan:** tiga gambar sistem dan dua baris rumus Euler-Cromer.

> "Kami membangun tiga sistem: bola di lintasan melengkung, bola yang jatuh dan memantul, dan bandul sederhana. Ketiganya dihitung dengan cara yang sama. Waktu dipotong per 0,02 detik. Di setiap langkah, kecepatan diperbarui dulu dari percepatan, lalu posisi diperbarui memakai kecepatan yang baru. Itulah metode Euler-Cromer.
>
> Setiap langkah kami menghitung Ep = mgh, Ek = ½mv², dan jumlahnya Em. Yang kami amati adalah seberapa jauh Em bergeser dari nilai awalnya, E₀. Di simulasi, angka ini tampil sebagai ΔEm."

---

## Slide 3 · Hasil utama: Em tetap datar

**Tampilkan:** tabel berikut dan tangkapan layar grafik E terhadap t.

| Sistem | E₀ | Penyimpangan maks. Em | Em pada t = 30 s |
|---|---|---|---|
| Lintasan melengkung | 144,2 J | 1,45 J (1,0 %) | 145,5 J |
| Jatuh bebas | 147,0 J | 3,72 J (2,5 %) | 146,5 J |
| Bandul | 40,4 J | 0,50 J (1,2 %) | 40,9 J |

> "Selama 30 detik, Ep dan Ek terus bertukar, tetapi Em di ketiga sistem tetap dalam rentang 1 sampai 2,5 persen dari nilai awal. Yang penting, penyimpangannya tidak menumpuk. Em di detik ke-30 hampir sama dengan Em di detik ke-5. Garis hitam di grafik bergoyang sedikit, tetapi tidak naik atau turun terus.
>
> Penyimpangan kecil ini bukan pelanggaran hukum fisika. Itu galat numerik, harga yang kita bayar karena waktu dipotong-potong."

---

## Slide 4 · Mengapa Euler-Cromer, bukan Euler biasa

**Tampilkan:** dua garis Em pada bandul yang sama (θ₀ = 49°, Δt = 0,02 s).

| t | Euler biasa | Euler-Cromer |
|---|---|---|
| 0 s | 40,45 J | 40,45 J |
| 5 s | 46,73 J (+15,5 %) | 40,61 J (+0,4 %) |
| 10 s | 53,84 J (+33,1 %) | 40,76 J (+0,8 %) |
| 20 s | 70,67 J (+74,7 %) | 40,94 J (+1,2 %) |
| 30 s | 90,69 J (+124,2 %) | 40,88 J (+1,1 %) |

> "Bedanya hanya urutan dua baris kode. Euler biasa memperbarui posisi dengan kecepatan lama. Dengan Euler biasa, bandul kita mendapat energi dari ketiadaan: dalam 30 detik energinya jadi lebih dari dua kali lipat, dan ayunannya makin lebar. Euler-Cromer cukup memperbarui kecepatan lebih dulu, dan energinya tetap terkunci di sekitar 40,4 J.
>
> Metode yang menjaga struktur ini disebut simplektik. Untuk simulasi jangka panjang, sifat ini lebih penting daripada sekadar akurasi per langkah."

---

## Slide 5 · Galat mengecil saat Δt diperkecil

**Tampilkan:** grafik log-log atau tabel berikut.

| Δt | Bandul | Jatuh bebas |
|---|---|---|
| 0,04 s | 2,50 % | 4,15 % |
| 0,02 s | 1,24 % | 2,53 % |
| 0,01 s | 0,62 % | 1,72 % |
| 0,005 s | 0,31 % | 1,11 % |

> "Kalau penyimpangan ini benar galat numerik, ia harus mengecil saat langkah waktunya diperkecil. Pada bandul, setiap kali Δt dibagi dua, galatnya ikut terbagi dua: 2,50, 1,24, 0,62, 0,31 persen. Itu ciri metode orde satu, persis seperti teori Euler-Cromer.
>
> Jatuh bebas juga mengecil, tetapi lebih lambat. Galat terbesarnya terjadi saat bola menyentuh lantai, karena tumbukan tidak pernah tepat jatuh di batas langkah waktu."

---

## Slide 6 · Mencocokkan dengan teori

**Tampilkan:** dua perbandingan simulasi vs teori.

**Kecepatan maksimum jatuh bebas** dari h = 7,5 m:
- Teori: v = √(2gh) = 12,12 m/s
- Simulasi: 12,15 m/s (selisih 0,2 %)

**Periode bandul** (L = 6 m, Δt = 0,005 s). Rumus sudut kecil T₀ = 2π√(L/g) = 4,92 s:

| θ₀ | Simulasi | T / T₀ |
|---|---|---|
| 10° | 4,93 s | 1,002 |
| 30° | 5,00 s | 1,017 |
| 49° | 5,15 s | 1,048 |
| 80° | 5,59 s | 1,137 |

> "Kecepatan bola tepat sebelum menyentuh lantai cocok dengan √(2gh) sampai 0,2 persen. Dengan kata lain, Ep di puncak benar-benar berubah seluruhnya menjadi Ek di bawah.
>
> Bandul memberi sesuatu yang menarik. Rumus T = 2π√(L/g) dari buku hanya berlaku untuk sudut kecil. Simulasi kami tidak memakai pendekatan itu, karena memakai sin θ yang sebenarnya. Hasilnya, pada 10° periodenya sama dengan rumus, tetapi pada 80° periodenya 14 persen lebih lama. Angka 5,15 detik untuk 49° cocok dengan rumus koreksi sudut besar T ≈ T₀(1 + θ²/16 + …). Di sini simulasi justru lebih jujur daripada rumus sederhananya."

---

## Slide 7 · Pengaruh massa dan gravitasi

**Tampilkan:** dua tabel bandul (θ₀ = 49°).

| m | E₀ | Periode | v maks |
|---|---|---|---|
| 0,5 kg | 10,1 J | 5,15 s | 6,36 m/s |
| 2 kg | 40,4 J | 5,15 s | 6,36 m/s |
| 5 kg | 101,1 J | 5,15 s | 6,36 m/s |

| Tempat | g | E₀ | Periode | v maks | Galat Em |
|---|---|---|---|---|---|
| Bulan | 1,6 m/s² | 6,6 J | 12,75 s | 2,57 m/s | 0,50 % |
| Bumi | 9,8 m/s² | 40,4 J | 5,15 s | 6,36 m/s | 1,24 % |
| Jupiter | 24,8 m/s² | 102,4 J | 3,24 s | 10,12 m/s | 1,98 % |

> "Massa melipatgandakan energi, tetapi gerakannya sama persis: periode dan kecepatan maksimumnya identik. Massa saling coret di persamaan mgh = ½mv², dan simulasi menunjukkannya.
>
> Gravitasi berbeda. Periode di Bulan 12,75 detik dan di Jupiter 3,24 detik. Perbandingannya sama dengan √(24,8/1,6), sesuai T ∝ 1/√g. Perhatikan kolom terakhir: galat Em membesar di Jupiter. Gerak yang lebih cepat berarti lebih banyak perubahan dalam satu langkah waktu yang sama. Jadi Δt yang cukup di Bulan belum tentu cukup di Jupiter."

---

## Slide 8 · Saat ada gesekan

**Tampilkan:** grafik Em dan Q pada lintasan melengkung, dan tabel berikut (E₀ = 144,2 J).

| μ | Q pada t = 10 s | Q pada t = 30 s | Em akhir |
|---|---|---|---|
| 0,02 | 32,9 J (22,8 %) | 74,1 J (51,4 %) | 70,2 J |
| 0,06 | 74,8 J (51,9 %) | 105,9 J (73,5 %) | 38,3 J |
| 0,12 | 99,2 J (68,8 %) | 108,1 J (74,9 %) | 36,1 J |

> "Begitu μ lebih besar dari nol, garis Em tidak lagi datar. Energi yang hilang kami catat sebagai Q, kalor, dan Ep + Ek + Q tetap sama dengan E₀.
>
> Ada satu angka yang menarik: pada μ = 0,12, Q berhenti di sekitar 108 J dan tidak pernah mencapai 144 J. Penyebabnya, bola akhirnya diam di dasar lembah, yang tingginya 1,84 m di atas tanah. Energi yang tersisa, 36,1 J, sama persis dengan mgh di dasar lembah: 2 × 9,8 × 1,84. Gesekan hanya bisa mengambil energi kinetik dan energi potensial di atas lembah, bukan di bawahnya.
>
> Pada bandul, yang titik terendahnya adalah acuan h = 0, μ = 0,12 menghabiskan 99,8 persen energinya dalam 30 detik."

---

## Slide 9 · Data numerik menemukan bug

**Tampilkan:** grafik Em lintasan sebelum dan sesudah perbaikan.

> "Bagian ini tidak kami rencanakan. Saat pertama kali mengumpulkan angka-angka tadi, lintasan melengkung tidak lulus. Dengan μ = 0, Em-nya naik terus dari 144,2 J menjadi 156,5 J dalam 30 detik, atau +8,5 persen. Saat Δt dibagi dua, kenaikannya juga terbagi dua: 12,3, lalu 6,4, lalu 3,3 J. Jadi ini galat sistematis dari kode, bukan fisika.
>
> Penyebabnya: posisi bola disimpan sebagai parameter u di sepanjang lintasan, dan setiap langkah kami mengubah jarak tempuh ke u memakai kemiringan di titik lama. Pendekatan kecil itu merusak sifat simplektik Euler-Cromer. Setelah gerak dihitung langsung dalam panjang busur s dan dipetakan ke u lewat tabel, penyimpangannya turun ke maksimum 1,0 persen dan tidak lagi menumpuk.
>
> Bug kedua ada di pantulan. Saat bola menembus lantai, posisinya dipaksa ke h = 0, sehingga jarak tembusnya terbuang. Akibatnya galat justru membesar saat Δt diperkecil: 2,8 persen pada Δt = 0,02 dan 5,8 persen pada Δt = 0,005. Setelah posisinya dicerminkan, galat mengecil teratur seperti di slide 5.
>
> Pelajarannya: grafik yang tampak masuk akal belum tentu benar. Mengukur ΔEm dan mengubah Δt adalah cara murah untuk menguji simulasi sendiri."

---

## Slide 10 · Kesimpulan dan keterbatasan

**Tampilkan:** tiga poin kesimpulan dan tiga keterbatasan.

> "Kesimpulan kami:
> 1. Dengan Euler-Cromer, energi mekanik di tiga sistem tetap dalam 1 sampai 2,5 persen dari nilai awal selama 30 detik, dan tidak menumpuk. Euler biasa pada kondisi yang sama memberi +124 persen.
> 2. Penyimpangan itu adalah galat numerik orde satu: Δt dibagi dua, galat ikut terbagi dua.
> 3. Simulasi cocok dengan teori, √(2gh) sampai 0,2 persen, dan bahkan menangkap efek sudut besar bandul yang tidak tercakup rumus sederhana.
>
> Keterbatasannya:
> - Redaman kami model sederhana, sebanding dengan kecepatan, bukan gesekan kinetik μN yang sebenarnya.
> - Q dihitung sebagai E₀ − Em. Jadi Ep + Ek + Q = E₀ benar menurut definisi, bukan hasil pengukuran terpisah.
> - Δt terikat pada frame animasi. Galat di Jupiter menunjukkan bahwa Δt idealnya disesuaikan dengan kecepatan gerak."

---

## Urutan demo langsung (2–3 menit)

1. **Lintasan, μ = 0.** Tekan Spasi. Tunjuk batang Ep dan Ek yang bertukar, garis hitam Em yang datar, dan angka ΔEm di pojok kanan bawah.
2. **Seret bola** ke puncak kanan, lalu jalankan lagi. E₀ ikut berubah.
3. **Naikkan μ ke 0,06.** Batang merah Q tumbuh, garis Em menurun, dan bola akhirnya diam di lembah.
4. **Ganti ke bandul, μ = 0.** Klik preset Bulan, lalu Jupiter. Ayunan melambat dan mempercepat, tetapi Em tetap datar.
5. **Tekan S** untuk menyimpan tangkapan layar sebagai bukti.

## Kemungkinan pertanyaan

**"Kenapa tidak pakai Δt yang sangat kecil saja?"**
Bisa. Pada Δt = 0,005 galat bandul hanya 0,31 %. Tapi biaya hitungnya empat kali lipat per detik simulasi, dan di browser setiap langkah juga harus digambar. Langkah yang lebih efisien adalah metode orde dua yang tetap simplektik, seperti Velocity Verlet: galatnya turun empat kali setiap Δt dibagi dua, bukan hanya dua kali.

**"Kalau Em bisa naik 1 %, apakah itu melanggar hukum kekekalan?"**
Tidak. Yang naik adalah galat hitungan, dan ia berosilasi, tidak bertambah terus. Buktinya, galat itu mengecil sebanding dengan Δt. Pelanggaran fisika yang sebenarnya tidak akan hilang hanya karena Δt diperkecil.

**"Bagaimana kalian tahu angkanya benar?"**
Dengan tiga cara: dicocokkan dengan rumus analitik (√(2gh), periode bandul), dicek apakah galat mengikuti orde metodenya, dan dibandingkan dengan Euler biasa yang perilakunya sudah diketahui.
