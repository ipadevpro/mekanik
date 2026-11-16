# Narasi Presentasi: Membaca Flowchart Simulasi

Pendamping untuk tiga gambar di folder ini. Durasi sekitar 5–6 menit. Bagian ini bisa disisipkan sebagai pengganti **Slide 2 (Model dan metode)** di [`narasi-presentasi.md`](narasi-presentasi.md), atau dibawakan sebagai sesi tersendiri tentang "bagaimana programnya bekerja".

Saran urutan: bawakan diagram 1, lalu diagram 2, lalu diagram 3. Diagram 2 adalah inti metodenya, jadi berikan waktu paling banyak di sana.

---

## Slide A · Alur program

**Tampilkan:** `flowchart-alur-program.png`

**Pembuka (sambil menunjuk "Mulai" sampai "draw()")**

> "Program kami ditulis di p5.js, dan p5.js punya pola yang sederhana. Ada dua fungsi utama: `setup()` yang dijalankan sekali di awal, dan `draw()` yang dijalankan terus-menerus, sekitar 60 kali per detik. Setiap pemanggilan `draw()` kami sebut satu frame."

**Bagian setup dan reset**

> "Di `setup()`, program membuat kanvas berukuran 980 × 520 piksel, lalu membuat kontrolnya: pilihan sistem, tombol, slider, dan checkbox. Semuanya dibuat dengan fungsi DOM p5.js sesuai modul.
>
> Setelah itu `resetSimulasi()` dipanggil. Fungsi ini meletakkan benda di posisi awalnya, menghitung Ep, Ek, dan Em, lalu menyimpan Em itu sebagai **E₀**. E₀ adalah patokan kami. Semua yang kami ukur nanti dibandingkan dengan angka ini."

**Bagian percabangan (tunjuk belah ketupat)**

> "Setiap frame, `draw()` mengajukan satu pertanyaan: apakah simulasi sedang berjalan, dan bolanya sedang tidak diseret?
>
> Kalau **ya**, program memanggil `updateFisika(Δt)` untuk memajukan waktu satu langkah, 0,02 detik. Kalau mode lambat aktif, langkahnya diperkecil menjadi 0,4 kali, jadi geraknya melambat tanpa mengubah fisikanya.
>
> Kalau **tidak**, misalnya sedang dijeda, waktu tidak maju. Program hanya menghitung ulang energi dari posisi saat itu, supaya angka di dasbor tetap benar ketika bola digeser."

**Bagian gambar (tunjuk dua kotak bawah dan panah balik)**

> "Kedua jalur bertemu lagi di bagian menggambar. Pertama area eksperimen: penggaris ketinggian, tanah, jejak, bola, garis h, dan vektor kecepatan. Lalu dasbor energi: diagram batang, grafik E terhadap t, dan pembacaan ΔEm.
>
> Panah ini kembali ke `draw()`. Jadi setiap frame, perhitungan selalu dilakukan sebelum menggambar. Yang terlihat di layar adalah hasil hitungan terbaru."

**Transisi**

> "Diagram ini menjelaskan kerangka programnya. Isi perhitungannya ada di satu kotak, `updateFisika`. Mari kita buka kotak itu."

---

## Slide B · Satu langkah fisika

**Tampilkan:** `flowchart-langkah-fisika.png`

**Pembuka (tunjuk bagian atas)**

> "Ini adalah isi satu langkah waktu. Langkah pertama paling sederhana: waktu ditambah Δt. Lalu program memeriksa sistem mana yang aktif, dan alurnya bercabang tiga."

**Pola yang sama (tunjuk catatan Euler-Cromer)**

> "Sebelum masuk ke tiap cabang, perhatikan catatan di tengah ini. Ketiga cabang mengikuti pola yang sama, yaitu Euler-Cromer. Pertama, hitung percepatan dari posisi saat ini. Kedua, perbarui kecepatan. Ketiga, perbarui posisi memakai kecepatan yang **baru**.
>
> Urutan kecil inilah yang menentukan apakah energinya kekal. Kalau posisi diperbarui memakai kecepatan lama, yaitu Euler biasa, bandul kami mendapat energi tambahan 124 persen dalam 30 detik. Dengan Euler-Cromer, hanya sekitar 1 persen."

**Cabang lintasan (kiri)**

> "Cabang kiri adalah lintasan melengkung. Percepatan bola di sepanjang lintasan adalah −g sin θ, dengan θ kemiringan lintasan di titik itu. Suku −2,5μ·v adalah redaman, yang bernilai nol kalau μ = 0.
>
> Posisi bola disimpan sebagai jarak tempuh **s** di sepanjang lintasan, dalam meter. Kalau bola melewati ujung lintasan, ia dipantulkan. Terakhir, s diubah kembali ke posisi pada gambar lewat tabel panjang busur, lalu ketinggiannya dihitung.
>
> Kotak terakhir ini punya cerita. Versi pertama kami tidak memakai tabel itu, dan energinya naik 8,5 persen dalam 30 detik. Kami akan bahas di bagian akhir."

**Cabang jatuh bebas (tengah)**

> "Cabang tengah adalah jatuh bebas, yang langsung mengikuti GLBB di modul 4.3. Percepatannya −g, ditambah redaman kalau ada. Kecepatan diperbarui, lalu ketinggian.
>
> Pertanyaannya: apakah bola sudah menembus lantai, h ≤ 0? Kalau ya, bola dipantulkan dengan koefisien restitusi e. Kalau μ = 0, e = 1, jadi pantulannya lenting sempurna. Perhatikan bahwa posisinya juga dicerminkan, h menjadi −e·h, bukan dipaksa nol. Dengan begitu, jarak tembus dalam satu langkah tidak membuang energi secara acak. Kalau kecepatannya tinggal di bawah 0,25 m/s, bola dianggap diam."

**Cabang bandul (kanan)**

> "Cabang kanan adalah bandul. Di sini yang dihitung adalah sudut, bukan jarak. Percepatan sudutnya −(g/L) sin θ. Kami sengaja memakai sin θ asli, tanpa pendekatan sudut kecil. Karena itu periode bandul pada sudut besar keluar benar, seperti yang kami tunjukkan di data.
>
> Dari sudut itu, ketinggian dihitung sebagai L(1 − cos θ) dan kecepatan sebagai L·ω."

**Titik temu (tunjuk kotak Ep, Ek, Em)**

> "Ketiga cabang menghasilkan dua angka yang sama: ketinggian h dan kecepatan v. Dari keduanya, energi dihitung dengan rumus yang sama untuk semua sistem: Ep = mgh, Ek = ½mv², dan Em = Ep + Ek.
>
> Jadi bagian fisikanya boleh berbeda, tetapi cara mengukur energinya seragam. Inilah yang membuat ketiga sistem bisa dibandingkan secara adil."

**Bagian Q dan riwayat (tunjuk bawah)**

> "Kalau μ lebih dari nol, energi yang hilang dicatat sebagai Q = E₀ − Em, yaitu kalor. Perlu kami sampaikan dengan jujur, karena Q dihitung dari selisih, maka Ep + Ek + Q selalu sama dengan E₀ menurut definisi. Itu bukan pengukuran terpisah.
>
> Terakhir, semua angka disimpan ke riwayat. Program menyimpan 180 titik terakhir, sekitar 3,6 detik simulasi. Riwayat inilah yang digambar menjadi grafik E terhadap t. Setelah itu kendali kembali ke `draw()` untuk digambar."

---

## Slide C · Masukan pengguna

**Tampilkan:** `flowchart-masukan.png`

> "Diagram terakhir menjawab pertanyaan: apa yang terjadi kalau pengguna menekan sesuatu di tengah simulasi?
>
> Kejadian ini tidak menunggu urutan `draw()`. Ia bisa terjadi kapan saja di antara dua frame, dan hasilnya terlihat di frame berikutnya.
>
> Kebanyakan sederhana. Spasi menjalankan atau menjeda, R mengembalikan ke posisi awal, S menyimpan gambar kanvas."

**Tunjuk tiga baris yang mengatur ulang E₀**

> "Yang penting ada di tiga baris ini: menyeret bola, mengubah massa atau gravitasi, dan mengganti sistem. Ketiganya mengatur ulang E₀.
>
> Alasannya, ketiganya mengubah energi total sistem dari luar. Kalau bola diangkat lebih tinggi, energinya memang bertambah. Itu bukan pelanggaran hukum kekekalan, melainkan kita yang memberi energi. Kalau E₀ tidak diatur ulang, simulasi akan salah menganggapnya sebagai energi yang muncul atau hilang.
>
> Slider μ berbeda. Mengubah μ tidak mengubah energi saat itu, hanya cara energi berkurang setelahnya. Karena itu E₀ tetap, dan Q mulai tercatat."

**Penutup bagian flowchart**

> "Jadi secara ringkas: diagram pertama adalah kerangkanya, hitung lalu gambar, berulang. Diagram kedua adalah inti metodenya, Euler-Cromer yang sama untuk tiga sistem. Diagram ketiga memastikan patokan E₀ selalu jujur ketika pengguna ikut campur. Dengan kerangka ini, kita bisa beralih ke hasilnya: apakah Em benar-benar tetap datar?"

*(Lanjut ke Slide 3 di `narasi-presentasi.md`.)*

---

## Kemungkinan pertanyaan tentang flowchart

**"Kenapa perhitungan dilakukan per frame, bukan terpisah dari gambar?"**
Agar sederhana dan sesuai pola p5.js di modul. Konsekuensinya, Δt terikat pada frame. Kalau browser melambat, simulasi ikut melambat, tetapi hasil fisikanya tetap sama karena Δt tetap 0,02 s, tidak mengikuti waktu nyata.

**"Kenapa lintasan memakai jarak s, sedangkan bandul memakai sudut θ?"**
Keduanya sebenarnya jarak di sepanjang jalur geraknya. Untuk bandul, jarak busurnya L·θ, jadi sudut sudah cukup. Untuk lintasan berbentuk bebas, hubungan jarak dengan posisi tidak sesederhana itu, sehingga kami memakai tabel panjang busur.

**"Apa yang terjadi jika diagram 2 memakai Euler biasa?"**
Hanya dua baris yang bertukar urutan di setiap cabang: posisi diperbarui dulu dengan kecepatan lama, baru kemudian kecepatan. Hasilnya, pada bandul energi bertambah 15,5 persen dalam 5 detik dan 124 persen dalam 30 detik.
