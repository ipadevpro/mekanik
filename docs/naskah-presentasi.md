# Naskah Presentasi: Simulasi Konservasi Energi Mekanik

Sains Komputasi RPL 2026 · Dosen: Prof. Dr. rer. nat. Yudi Rosandi dan Dr. Budi Adiperdana

Naskah ini pendamping 19 slide presentasi. Isi yang sama juga ada di catatan pembicara setiap slide, jadi muncul di layar presenter saat mode Present.

## Pembagian pembicara

| Pembicara | Slide | Bagian | Perkiraan waktu |
|---|---|---|---|
| Faizah Hayati | 1–8 | Pembuka, tampilan simulasi, pertanyaan 1: persamaan diferensial | ±7 menit |
| Devi Saidulloh | 9–14 | Euler-Cromer, kekekalan energi, pertanyaan 2: syarat awal dan syarat batas | ±6 menit |
| Ayutyastuti | 15–19 | Pertanyaan 3: flowchart, ringkasan, demo langsung | ±5 menit + demo 3 menit |

Total sekitar 18 menit ditambah demo. Pembagian ini usulan dan bisa ditukar sesuai kesepakatan kelompok.

## Tips membawakan

- Bicaralah seperti menjelaskan kepada siswa yang cerdas: pelan, satu ide per slide, dan tunjuk bagian slide yang sedang dibahas.
- Rumus tidak perlu dibaca huruf demi huruf. Sebutkan artinya, misalnya "percepatan sama dengan gravitasi dikurangi redaman".
- Angka dari simulasi (0,52 %, 124 %, 5,15 s) adalah bukti. Beri jeda sejenak setelah menyebutnya.
- Siapkan laptop dengan `index.html` sudah terbuka sebelum giliran demo.

---

## Slide 1 · Judul

**Pembicara: Faizah · ±45 detik**

Assalamu'alaikum warahmatullahi wabarakatuh, salam sejahtera untuk kita semua. Yang kami hormati Bapak Prof. Yudi Rosandi dan Bapak Dr. Budi Adiperdana, serta rekan-rekan guru yang kami banggakan.

Kami dari kelompok yang terdiri atas saya, Faizah Hayati, bersama Devi Saidulloh dan Ayutyastuti. Hari ini kami akan memaparkan simulasi konservasi energi mekanik yang kami buat dengan p5.js.

Sebagai guru, kita sudah sering mengajarkan bahwa energi mekanik itu kekal. Biasanya kita tunjukkan dengan rumus Ep + Ek = konstan dan beberapa contoh soal. Dalam tugas ini kami mencoba cara yang berbeda: membiarkan komputer menghitung gerak benda sedikit demi sedikit, lalu kita periksa bersama apakah energinya memang tetap.

Pembagian kami: saya akan membuka dan membahas persamaan diferensialnya, Devi membahas metode numerik dan syarat batas, lalu Ayutyastuti membahas flowchart dan menutup dengan demo langsung.

## Slide 2 · Tiga Pertanyaan Minggu Ini

**Pembicara: Faizah · ±45 detik**

Presentasi ini kami susun untuk menjawab tiga pertanyaan dari Bapak dosen pada pertemuan sebelumnya.

Pertama, bagaimana ekspresi persamaan diferensialnya. Kedua, bagaimana penerapan syarat batasnya. Ketiga, bagaimana flowchart programnya.

Kalau di kelas kita, anggap saja tiga pertanyaan ini seperti tujuan pembelajaran. Di akhir presentasi, kami akan kembali ke tiga pertanyaan ini dan menjawabnya satu per satu secara ringkas.

Semua jawaban kami ambil dari simulasi yang kami buat sendiri, sehingga setiap rumus yang tampil nanti bisa kita lihat langsung bekerja di program.

## Slide 3 · Tiga Sistem dari Hukum II Newton

**Pembicara: Faizah · ±1 menit**

Simulasi kami memuat tiga sistem yang sudah sangat akrab di kelas fisika: benda jatuh bebas yang memantul di lantai, bandul sederhana, dan bola yang bergerak di lintasan melengkung seperti wahana roller coaster.

Ketiganya berangkat dari hukum yang sama, Hukum II Newton, F = m·a. Karena percepatan adalah turunan kedua dari posisi terhadap waktu, ketiganya menghasilkan persamaan diferensial biasa orde dua.

Perhatikan tabel ini, Bapak Ibu. Yang membedakan ketiga sistem hanya dua hal: variabel posisinya, yaitu h, θ, atau s, dan gaya penggeraknya. Pada jatuh bebas, gravitasi bekerja penuh. Pada bandul dan lintasan, yang bekerja hanya komponen gravitasi searah gerak, sehingga muncul sin θ.

Satu catatan agar tidak ada salah paham: μ di slider kami bukan koefisien gesek kinetik seperti di buku. Kami memakainya sebagai redaman yang sebanding dengan kecepatan, mirip hambatan udara. Angka pengali 1,5; 1,8; dan 2,5 kami pilih supaya efek redamannya terlihat jelas di layar.

## Slide 4 · Tampilan Simulasi

**Pembicara: Faizah · ±1 menit**

Sebelum masuk ke persamaan, mari kita lihat dulu wujud simulasinya, supaya nanti setiap rumus punya gambaran yang jelas.

Nomor 1 adalah area eksperimen. Di sana ada bola, garis biru yang menunjukkan ketinggian h, dan panah oranye yang menunjukkan kecepatan v. Nomor 2 adalah dasbor energi: batang Ep berwarna biru, Ek oranye, Q merah untuk kalor, dan Em hitam. Di bawahnya ada grafik energi terhadap waktu. Nomor 3 adalah panel kontrol untuk memilih sistem dan mengatur massa, gravitasi, redaman, dan posisi awal.

Coba perhatikan grafiknya. Garis biru dan oranye naik turun bergantian: saat bola di bawah, Ek besar dan Ep kecil, begitu pula sebaliknya. Tetapi garis hitam Em tetap datar. Inilah pesan utama simulasi kami. Di pojok bawah tertulis Em hanya menyimpang 0,52 persen dari energi awal.

Dua gambar kecil di kanan menunjukkan bandul dan jatuh bebas. Pola energinya sama.

## Slide 5 · Pertanyaan 1

**Pembicara: Faizah · ±15 detik**

Kita masuk ke pertanyaan pertama: bagaimana ekspresi persamaan diferensialnya. Kami akan membahas satu sistem per slide, lalu menunjukkan bagaimana ketiganya terhubung dengan kekekalan energi.

## Slide 6 · Jatuh Bebas dan Pantulan

**Pembicara: Faizah · ±1,5 menit**

Kita mulai dari yang paling sederhana, jatuh bebas. Arah ke atas kami ambil positif.

Persamaan geraknya: turunan kedua h terhadap t sama dengan minus g dikurangi b kali v. Artinya, percepatan bola adalah gravitasi yang menarik ke bawah, ditambah redaman yang selalu melawan arah gerak.

Komputer tidak bisa langsung menyelesaikan persamaan orde dua, jadi kami pecah menjadi dua persamaan orde satu. Bahasanya sederhana sekali, Bapak Ibu: laju perubahan posisi adalah kecepatan, dan laju perubahan kecepatan adalah percepatan.

Kotak di kanan adalah cara komputer menghitungnya. Waktu dipotong menjadi langkah kecil Δt sebesar 0,02 detik. Pada setiap langkah, hitung percepatan, perbarui kecepatan, lalu perbarui posisi. Ibarat kita mencatat posisi bola dengan stopwatch setiap dua per seratus detik.

Kalau redamannya nol, hasilnya persis sama dengan rumus GLBB yang kita ajarkan di Modul 4.3: v = v₀ − g·t dan h = h₀ + v₀·t − ½·g·t². Jadi simulasi ini tidak bertentangan dengan buku, justru memperluasnya.

## Slide 7 · Bandul Sederhana

**Pembicara: Faizah · ±1,5 menit**

Sistem kedua adalah bandul dengan panjang tali 6 meter. Di sini variabelnya bukan tinggi, melainkan sudut simpangan θ dan kecepatan sudut ω.

Persamaan geraknya: percepatan sudut sama dengan minus g per L dikali sin θ, dikurangi redaman. Cara memecahnya sama dengan jatuh bebas: laju perubahan sudut adalah ω, dan laju perubahan ω adalah percepatan sudut.

Ada satu hal yang ingin kami tekankan. Di buku SMA, sin θ biasanya diganti θ supaya rumusnya sederhana, sehingga periode bandul T = 2π√(L/g). Kami tidak melakukan penyederhanaan itu.

Lihat tabelnya. Pada simpangan 10°, simulasi memberi 4,93 detik, hampir sama dengan rumus sudut kecil 4,92 detik. Tetapi pada 49° periodenya 5,15 detik, dan pada 80° menjadi 5,59 detik, sekitar 14 persen lebih lama. Jadi simulasi ini bisa menjadi bahan diskusi yang menarik dengan siswa: kapan rumus di buku berlaku, dan kapan tidak.

Untuk menghitung energi, ketinggian bandul diperoleh dari h = L(1 − cos θ) dan kelajuannya v = L·ω.

## Slide 8 · Lintasan Melengkung

**Pembicara: Faizah · ±1,5 menit**

Sistem ketiga adalah bola di lintasan melengkung. Variabelnya s, yaitu jarak yang ditempuh bola sepanjang lintasan.

Bayangkan bidang miring yang biasa kita ajarkan, tetapi kemiringannya berubah-ubah di setiap titik. Gaya penggeraknya adalah komponen gravitasi searah lintasan, g sin θ, dan θ di sini adalah kemiringan lintasan di posisi bola. Kemiringan itu kami hitung dari turunan bentuk lintasan h(x).

Langkah Euler-Cromer-nya sama persis dengan dua sistem sebelumnya: hitung a, perbarui v, lalu perbarui s.

Ada satu tantangan teknis. Kemiringan bergantung pada posisi mendatar x, sedangkan yang kami hitung adalah s. Untuk mengubah s menjadi x, lintasan kami potong menjadi 2.000 segmen pendek, lalu panjangnya dijumlahkan menjadi tabel. Mirip mengukur jalan yang berkelok dengan meteran pendek, sepotong demi sepotong.

Bagian selanjutnya akan dilanjutkan oleh rekan saya, Devi Saidulloh.

## Slide 9 · Diskretisasi Euler-Cromer

**Pembicara: Devi · ±1,5 menit**

Terima kasih, Faizah. Bapak Ibu, kalau kita perhatikan tiga slide tadi, ternyata ketiga sistem memakai pola yang sama. Hitung percepatan dari posisi dan kecepatan, perbarui kecepatan, lalu perbarui posisi dengan kecepatan yang baru. Itulah metode Euler-Cromer.

Ada metode yang lebih sederhana, yaitu Euler biasa. Bedanya hanya urutan dua baris perhitungan: Euler biasa memperbarui posisi dengan kecepatan yang lama. Kelihatannya sepele, tetapi akibatnya besar.

Tabel di kanan adalah hasil percobaan kami pada bandul yang sama. Dengan Euler biasa, energi bandul terus naik: 15 persen di detik ke-5, dan 124 persen di detik ke-30. Bandul seolah mendapat energi dari ketiadaan, dan ayunannya makin lebar. Itu tentu tidak mungkin secara fisika.

Dengan Euler-Cromer, energinya tetap di sekitar 40,4 joule, dengan penyimpangan hanya sekitar 1 persen. Karena itulah kami memilih Euler-Cromer.

## Slide 10 · Hubungan dengan Kekekalan Energi

**Pembicara: Devi · ±1 menit**

Slide ini adalah jembatan antara persamaan diferensial dan konsep yang kita ajarkan di kelas, yaitu kekekalan energi.

Dari ketiga persamaan gerak tadi, kalau kita hitung laju perubahan energi mekanik, hasilnya selalu sama: dEm/dt = −m·b·v².

Mari kita baca maknanya. Kalau b = 0, artinya tidak ada redaman, maka dEm/dt = 0. Energi mekanik tidak berubah, kekal secara analitik. Jadi garis Em di grafik seharusnya datar. Kalau di simulasi masih ada sedikit penyimpangan, itu bukan kesalahan fisika, melainkan galat numerik karena kita menghitung dengan langkah waktu.

Kalau b lebih dari nol, Em selalu turun, karena v² tidak pernah negatif. Turunnya paling cepat saat benda bergerak paling cepat. Energi yang hilang tidak lenyap, tetapi kami catat sebagai kalor Q = E₀ − Em.

## Slide 11 · Pertanyaan 2

**Pembicara: Devi · ±20 detik**

Sekarang pertanyaan kedua: bagaimana penerapan syarat batasnya.

Ketiga sistem kami sebenarnya adalah masalah nilai awal. Persamaan orde dua membutuhkan dua syarat di t = 0. Selain itu ada batas fisik, seperti lantai, dinding, dan tali. Persamaan diferensialnya sendiri tidak tahu bahwa ada lantai, sehingga batas ini harus kita tangani secara terpisah di program.

## Slide 12 · Syarat Awal di t = 0

**Pembicara: Devi · ±1 menit**

Untuk persamaan orde dua, kita butuh dua syarat awal: posisi awal dan kecepatan awal.

Pada simulasi kami, semua benda dilepas dari keadaan diam. Ibarat kita memegang bola lalu melepaskannya tanpa didorong. Jadi kecepatan awalnya selalu nol.

Posisi awalnya bisa diatur. Bawaannya, bola jatuh bebas dilepas dari 7,5 meter, bandul dari simpangan 49°, dan bola di lintasan dari ketinggian 7,36 meter. Pengguna bisa mengubahnya dengan slider atau dengan menyeret bola langsung di layar.

Yang penting, setiap kali syarat awal berubah, program menghitung ulang energi awal E₀ sebagai patokan. Dengan begitu, grafik energi selalu dibandingkan dengan titik awal yang benar.

## Slide 13 · Syarat Batas Lantai pada Jatuh Bebas

**Pembicara: Devi · ±1,5 menit**

Ini batas yang paling menarik. Karena waktu dihitung per langkah, dalam satu langkah bola bisa sedikit menembus lantai, sehingga h menjadi negatif.

Aturan kami ada di kotak kiri. Jika h ≤ 0, kecepatan dibalik arahnya dan dikalikan koefisien restitusi e. Saat μ = 0, e = 1, artinya pantulan lenting sempurna. Selain itu, posisi bola dicerminkan ke atas lantai. Jika kecepatannya sudah sangat kecil, di bawah 0,25 m/s, bola dianggap diam supaya tidak bergetar terus di lantai.

Kami ingin berbagi pengalaman jujur di sini, Bapak Ibu. Versi pertama program kami tidak mencerminkan posisi, tetapi langsung memaksa h = 0. Hasilnya, galat energi menjadi acak: 2,8 persen pada Δt 0,02 detik, tetapi malah 5,8 persen saat Δt diperkecil menjadi 0,005 detik. Padahal seharusnya makin kecil langkah, makin kecil galatnya.

Setelah posisi dicerminkan, galatnya turun teratur: 4,15, lalu 2,53, 1,72, dan 1,11 persen. Data inilah yang membantu kami menemukan kesalahan itu.

## Slide 14 · Syarat Batas Lintasan dan Bandul

**Pembicara: Devi · ±1 menit**

Dua sistem lainnya punya batas yang berbeda.

Pada lintasan, kami pasang dinding di kedua ujung. Ini perlu karena bola dilepas dari 7,36 meter, lebih tinggi daripada ujung kanan lintasan yang sekitar 7 meter. Tanpa dinding, bola akan terlempar keluar. Saat menyentuh dinding, arah kecepatan dibalik.

Pada bandul, batasnya adalah tali yang panjangnya tetap. Karena gerak bandul kami tulis dalam sudut θ, posisi bandul selalu berjarak L dari titik gantung, sehingga syarat ini terpenuhi dengan sendirinya tanpa koreksi apa pun.

Terakhir, tentang acuan energi potensial. Untuk jatuh bebas dan lintasan, h = 0 ada di tanah. Untuk bandul, h = 0 ada di titik terendah ayunan. Pilihan acuan ini tidak mengubah fisikanya, hanya menggeser nilai Ep. Ini juga sering membingungkan siswa, jadi baik untuk didiskusikan di kelas.

Selanjutnya saya serahkan kepada rekan kami, Ayutyastuti.

## Slide 15 · Pertanyaan 3

**Pembicara: Ayutyastuti · ±15 detik**

Terima kasih, Devi. Pertanyaan ketiga adalah bagaimana flowchart programnya. Kami menyiapkan tiga diagram: alur program secara keseluruhan, isi satu langkah fisika, dan apa yang terjadi ketika pengguna mengubah sesuatu.

## Slide 16 · Alur Program

**Pembicara: Ayutyastuti · ±1,5 menit**

Mari kita ikuti alurnya dari kiri atas. Sebelumnya, perhatikan bentuk kotaknya, Bapak Ibu, karena setiap bentuk punya arti. Oval untuk mulai, persegi panjang untuk proses, belah ketupat untuk keputusan, dan jajaran genjang untuk masukan dan keluaran.

Program dimulai, lalu menyiapkan kanvas dan semua tombol serta slider. Berikutnya jajaran genjang pertama: program membaca masukan dari pengguna, yaitu massa, gravitasi, redaman, dan posisi awal. Setelah itu program menerapkan syarat awal dan menghitung E₀. Kotak ini berwarna oranye karena berhubungan dengan pertanyaan kedua, syarat awal.

Kemudian program masuk ke perulangan yang berjalan sekitar 60 kali per detik. Ibarat film animasi, setiap putaran menghasilkan satu gambar.

Pada setiap putaran ada pertanyaan: apakah simulasi sedang berjalan? Jika ya, program menghitung satu langkah fisika, kotak biru yang akan kita bahas di slide berikutnya. Jika tidak, misalnya saat bola sedang diseret, program cukup menghitung energi dari posisi saat itu.

Hasilnya masuk ke jajaran genjang kedua, yaitu keluaran: bola dan dasbor energi ditampilkan ke layar. Setelah itu program kembali ke awal perulangan untuk frame berikutnya.

## Slide 17 · Satu Langkah Fisika

**Pembicara: Ayutyastuti · ±1,5 menit**

Inilah isi kotak biru tadi, dan sebenarnya slide ini merangkum jawaban dua pertanyaan sebelumnya.

Setiap langkah dimulai dengan menambah waktu sebesar Δt. Lalu program bercabang sesuai sistem yang dipilih, satu baris untuk lintasan, jatuh bebas, dan bandul.

Perhatikan warnanya, Bapak Ibu. Kotak biru adalah persamaan diferensial yang sudah didiskretisasi: hitung percepatan, lalu perbarui kecepatan dan posisi. Itu jawaban pertanyaan pertama. Kotak oranye adalah syarat batas: lewat ujung lintasan, menyentuh lantai, dan tali bandul yang tetap. Itu jawaban pertanyaan kedua.

Ketiga cabang kemudian bertemu di satu kotak yang sama, yaitu perhitungan energi: Ep = mgh, Ek = ½mv², Em = Ep + Ek, dan Q = E₀ − Em. Setelah itu program kembali menggambar.

## Slide 18 · Masukan Pengguna

**Pembicara: Ayutyastuti · ±1 menit**

Diagram terakhir menunjukkan apa yang terjadi ketika pengguna berinteraksi dengan simulasi. Masukan ini bisa terjadi kapan saja, dan hasilnya langsung tampil pada frame berikutnya.

Ada tujuh jenis masukan di baris atas. Semuanya digambar sebagai jajaran genjang, karena dalam kaidah flowchart, jajaran genjang adalah simbol untuk masukan dan keluaran. Akibat dari setiap masukan ada di baris bawah.

Kotak oranye adalah masukan yang mengubah syarat awal, misalnya tombol Reset, menyeret bola, dan mengganti sistem. Setiap kali itu terjadi, E₀ dihitung ulang, sehingga grafik energi tetap adil untuk dibandingkan.

Kotak biru adalah slider μ, karena ia mengubah koefisien redaman b di dalam persamaan diferensial. Begitu μ lebih dari nol, kalor Q mulai tercatat.

## Slide 19 · Ringkasan Jawaban

**Pembicara: Ayutyastuti · ±1 menit, lalu demo ±3 menit**

Sebagai penutup, mari kita kembali ke tiga pertanyaan di awal.

Pertama, persamaan diferensialnya. Ketiga sistem berasal dari F = m·a, dipecah menjadi dua persamaan orde satu, lalu diselesaikan dengan Euler-Cromer dengan Δt = 0,02 detik. Dari persamaan itu kita peroleh dEm/dt = −m·b·v², yang menjelaskan mengapa energi kekal saat tidak ada redaman.

Kedua, syarat awal dan syarat batasnya. Benda dilepas dari diam, lantai memantulkan bola dengan posisi dicerminkan, lintasan berdinding di kedua ujung, dan tali bandul berpanjang tetap.

Ketiga, flowchart-nya. Program menyiapkan simulasi sekali, lalu mengulang setiap frame: hitung percepatan, perbarui kecepatan dan posisi, periksa batas, hitung energi, dan gambar.

Bagi kami sebagai guru, simulasi seperti ini bisa langsung dibawa ke kelas. Siswa bisa mengganti gravitasi ke Bulan atau Jupiter, lalu melihat sendiri bahwa garis Em tetap datar. Konsep kekekalan energi tidak lagi hanya dihafal, tetapi diamati.

Sekarang kami akan menunjukkan simulasinya secara langsung.

---

## Urutan demo langsung (±3 menit)

**Pembicara: Ayutyastuti**, dibantu satu anggota yang mengoperasikan laptop.

1. Buka `index.html`. Sistem bawaan: lintasan melengkung, μ = 0. Tekan **Jalankan**. Tunjukkan garis Em yang datar dan angka ΔEm yang kecil.
2. Geser **Redaman μ** ke sekitar 0,10, lalu tekan **Reset** dan **Jalankan**. Tunjukkan batang Q yang tumbuh dan garis Em yang turun perlahan.
3. Kembalikan μ ke 0. Ganti sistem ke **Bandul**, lalu jalankan. Klik **Jupiter**. Ayunannya makin cepat, tetapi Em tetap datar.
4. Ganti ke **Jatuh bebas**, lalu seret bola ke posisi lebih tinggi. Jalankan dan tunjukkan pantulannya.

Kalimat penutup:

> Demikian presentasi dari kelompok kami. Terima kasih atas perhatian Bapak dan Ibu. Kami persilakan apabila ada pertanyaan, saran, atau masukan. Wassalamu'alaikum warahmatullahi wabarakatuh.

---

## Persiapan tanya jawab

**Mengapa memakai Euler-Cromer, bukan Runge-Kutta orde 4 yang lebih akurat?**
Euler-Cromer mudah dijelaskan dan cukup menjaga energi dalam jangka panjang, seperti terlihat pada slide 9. RK4 lebih akurat per langkah, tetapi untuk tujuan menunjukkan kekekalan energi dengan kode yang mudah dipahami, Euler-Cromer sudah memadai.

**Mengapa galat jatuh bebas lebih besar daripada bandul?**
Galat terbesar terjadi saat bola menyentuh lantai, karena tumbukan hampir tidak pernah jatuh tepat di akhir sebuah langkah waktu. Bandul tidak memiliki tumbukan, sehingga galatnya lebih kecil dan turun separuh setiap kali Δt dibagi dua.

**Mengapa μ dibuat redaman viskos, bukan gesekan kinetik μN?**
Redaman viskos membuat persamaan tetap mulus dan mudah diturunkan menjadi dEm/dt = −m·b·v². Gesekan kinetik bisa ditambahkan sebagai pengembangan berikutnya.

**Apakah hasil simulasi sudah dicocokkan dengan teori?**
Sudah. Kecepatan bola tepat sebelum menyentuh lantai dari ketinggian 7,5 m adalah 12,15 m/s, sedangkan teori √(2gh) memberi 12,12 m/s, selisih 0,2 persen. Periode bandul pada sudut kecil juga cocok dengan 2π√(L/g).

**Mengapa Δt = 0,02 detik?**
Nilai ini cukup kecil agar galat energi sekitar 1 persen, tetapi cukup besar agar animasi berjalan lancar di browser. Mode lambat memakai 0,008 detik.
