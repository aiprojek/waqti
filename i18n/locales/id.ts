export const id = {
    general: {
        online: 'Online',
        offline: 'Offline',
        credit: 'Dibuat oleh AI Projek',
        back: 'Kembali',
        save: 'Simpan',
        close: 'Tutup',
        saved: 'Pengaturan berhasil disimpan!',
        saveError: 'Gagal menyimpan pengaturan.',
        exported: 'Data berhasil diekspor.',
        exportError: 'Gagal mengekspor data.',
        imported: 'Data berhasil diimpor! Memuat ulang...',
        importError: 'Gagal mengimpor data. File mungkin rusak atau tidak valid.',
        noContent: 'Tidak ada konten untuk tema yang dipilih.',
        customTextPlaceholder: 'Atur teks berjalan di menu Pengaturan.',
        jummah: "Jum'at",
        jumat: "Jum'at",
    },
    welcome: {
        title: "Selamat Datang di Waqti",
        message: 'Pengingat pribadi Anda untuk janji temu dengan Sang Pencipta. Sebelum memulai, silakan pilih bahasa yang Anda inginkan.',
        language: 'Pilih Bahasa',
        guide: 'Lihat Panduan',
        start: 'Mulai Gunakan'
    },
    prayerNames: {
        Fajr: 'Subuh',
        Sunrise: 'Terbit',
        Dhuhr: 'Zuhur',
        Asr: 'Asar',
        Maghrib: 'Magrib',
        Isha: 'Isya',
    },
    main: {
        loading: 'Memuat waktu shalat...',
        error: 'Terjadi kesalahan',
        prayerTime: 'MEMASUKI WAKTU',
        upNext: 'Shalat Berikutnya',
        countdownTo: 'Menuju',
        iqamahIn: 'Iqamah dalam',
        prayerInProgress: 'DIRIKANLAH SHALAT',
        prayerInProgressTagline: 'Lurus dan Rapatkan Shaf!',
        dhikr: 'DZIKIR SETELAH SHALAT',
        until: 'Menuju',
        in: 'dalam',
        otherPrayerTimes: 'Waktu Shalat Lainnya',
        iqamahOffset: 'Iqamah dalam {{minutes}} menit',
    },
    footer: {
        runningText: {
            text: `Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.`,
            source: 'Q.S. An-Nisa: 103'
        },
    },
    settings: {
        title: 'Pengaturan',
        tabs: {
            general: 'Umum',
            calculation: 'Kalkulasi',
            display: 'Tampilan',
            alarm: 'Alarm & Dzikir',
            slides: 'Slide'
        },
        general: {
            title: 'Pengaturan Umum',
            mosqueName: 'Nama Masjid',
            language: 'Bahasa',
            city: 'Kota',
            search: 'Cari',
            searching: 'Mencari...',
            currentCity: 'Kota saat ini: {{city}}',
            citySetTo: 'Kota diatur ke {{city}}. Waktu shalat akan diperbarui.',
            cityTooShort: 'Nama kota terlalu pendek.',
            dataManagement: {
                title: 'Manajemen Data',
                description: 'Simpan pengaturan Anda ke sebuah file untuk cadangan atau pindahkan ke perangkat lain.',
                export: 'Ekspor Pengaturan',
                import: 'Impor Pengaturan'
            }
        },
        calculation: {
            title: 'Pengaturan Kalkulasi Waktu Shalat',
            method: 'Metode Kalkulasi',
            madhab: 'Madhab (untuk Waktu Asar)',
            highLatitude: 'Aturan Lintang Tinggi',
            fajrAngle: 'Sudut Subuh',
            ishaAngle: 'Sudut Isya',
            customNote: 'Sudut hanya dapat diubah jika Metode Kalkulasi diatur ke Kustom.',
            corrections: {
                title: 'Koreksi Manual',
                useManual: 'Gunakan Waktu Shalat Manual',
                correction: 'Koreksi Waktu (menit)',
                iqamah: 'Jeda Menuju Iqamah (menit)'
            }
        },
        display: {
            title: 'Pengaturan Tampilan & Visual',
            theme: 'Tema',
            dark: 'Gelap',
            light: 'Terang',
            orientation: 'Mode Orientasi',
            landscape: 'Landscape (Layar Lebar)',
            portrait: 'Portrait (Layar Tinggi)',
            layout: 'Template Layout Tampilan Utama',
            layoutFocus: 'Fokus Jam',
            layoutDashboard: 'Dasbor Informasi',
            layoutMinimalist: 'Minimalis',
            bgAnimation: 'Aktifkan Animasi Latar Belakang',
            accentColor: 'Warna Aksen',
            wallpaper: {
                title: 'Wallpaper Utama',
                useUrl: 'Gunakan URL',
                upload: 'Unggah',
                useColor: 'Warna Polos',
                url: 'URL Gambar Wallpaper',
                selectFile: 'Pilih File Gambar...',
                maxSize: 'Ukuran file maks 2MB.',
                preview: 'Pratinjau',
                reset: 'Reset'
            },
            contextualWallpaper: {
                title: 'Wallpaper Kontekstual',
                enable: 'Aktifkan wallpaper berbeda untuk setiap waktu shalat'
            },
            runningText: {
                title: 'Teks Berjalan',
                enable: 'Aktifkan Teks Berjalan di Footer',
                mode: 'Mode Konten',
                custom: 'Kustom',
                themed: 'Tema',
                customList: 'Daftar Teks Kustom',
                addText: 'Tambah Teks',
                text: 'Teks',
                empty: 'Belum ada teks kustom. Silakan tambahkan.',
                quranThemes: 'Tema Al-Qur\'an',
                hadithThemes: 'Tema Hadits',
                speed: 'Kecepatan Animasi (detik)',
                speedHelp: 'Durasi untuk teks berjalan dari satu sisi ke sisi lain. Teks yang lebih panjang membutuhkan waktu lebih lama.'
            }
        },
        alarm: {
            title: 'Pengaturan Alarm',
            enableAdhan: 'Aktifkan Alarm Adzan',
            enableIqamah: 'Aktifkan Alarm Iqamah',
            sound: {
                default: 'Bawaan',
                url: 'URL',
                upload: 'Unggah'
            },
            friday: {
                title: 'Pengaturan Mode Jum\'at',
                enable: 'Aktifkan Mode Jum\'at',
                timeSource: 'Sumber Waktu Jum\'at',
                followDhuhr: 'Mengikuti Waktu Zuhur',
                manual: 'Atur Manual',
                manualTime: 'Waktu Jum\'at Manual',
                khutbahDuration: 'Durasi Tampilan Khutbah (menit)',
                khutbahDurationHelp: 'Menggantikan hitung mundur iqamah. Setelah ini, shalat dianggap selesai.',
                khutbahTitle: 'Judul Pesan Khutbah',
                khutbahTagline: 'Tagline Pesan Khutbah',
                enableSlides: 'Aktifkan slide khusus hari Jum\'at'
            },
            duration: {
                title: 'Pengaturan Durasi Tampilan',
                prayer: 'Durasi "Shalat Didirikan" (menit)',
                dhikr: 'Total Durasi Dzikir (menit)',
                enableDhikr: 'Aktifkan Tampilan Dzikir Setelah Shalat',
                dhikrList: 'Daftar Dzikir yang Ditampilkan',
                dhikrEmpty: 'Pilih setidaknya satu dzikir untuk ditampilkan.',
                addDhikr: 'Tambah Dzikir Baru',
                arabic: 'Teks Arab',
                latin: 'Teks Latin (Transliterasi)',
                add: 'Tambah',
                emptyFields: 'Teks Arab dan Latin tidak boleh kosong.'
            }
        },
        slides: {
            title: 'Pengaturan Slide',
            list: 'Daftar Slide',
            add: {
                text: 'Tambah Teks',
                image: 'Tambah Gambar',
                schedule: 'Tambah Jadwal',
                finance: 'Tambah Keuangan'
            },
            slide: 'Slide',
            enable: 'Aktifkan Slide',
            remove: 'Hapus',
            duration: 'Durasi Tampilan',
            seconds: 'detik',
            fridayOnly: 'Hanya tampil di hari Jum\'at',
            fridayOnlyHelp: 'Aktifkan "slide khusus hari Jum\'at" di tab Alarm & Dzikir untuk menggunakan ini.',
            titleInput: 'Judul',
            content: 'Konten',
            imageUrl: 'URL Gambar',
            image: 'Gambar',
            selectFile: 'Pilih File...',
            schedule: {
                topic: 'Topik Kajian',
                speaker: 'Pemateri',
                day: 'Hari',
                time: 'Waktu',
                add: 'Tambah Jadwal'
            },
            finance: {
                reportTitle: 'Judul Laporan',
                initialBalance: 'Saldo Awal',
                income: 'Pemasukan',
                expense: 'Pengeluaran',
                finalBalance: 'Saldo Akhir',
                donationTarget: 'Target Donasi (Opsional)'
            },
            empty: 'Belum ada slide. Silakan tambahkan.',
            type: {
                text: 'Slide Teks',
                image: 'Slide Gambar',
                schedule: 'Slide Jadwal',
                finance: 'Slide Keuangan'
            }
        }
    },
    info: {
        title: 'Tentang & Panduan',
        tabs: {
            about: 'Tentang Aplikasi',
            guide: 'Panduan Pengguna',
            contact: 'Kontak'
        },
        about: {
            appName: "Waqti",
            description_part1: "Aplikasi waktu shalat yang modern dan personal untuk menemani Waktu Anda bersama Sang Pencipta. Dilengkapi kustomisasi, tema, dan konten dinamis untuk penggunaan pribadi dan tampilan jam digital masjid. Terinspirasi dari ",
            mawaqit_link_text: "Mawaqit",
            description_part2: " dengan penyederhanaan penggunaan yaitu tanpa perlu akun dan backoffice untuk menggunakan. Nama Waqti (وقتي) berarti 'Waktuku', menekankan hubungan yang personal dengan waktu shalat.",
            featuresTitle: 'Fitur Utama',
            features: "Waktu Shalat Otomatis:Menghitung waktu shalat berdasarkan kota dan metode pilihan.|Kalkulasi Kustom:Sesuaikan metode, madhab, dan koreksi waktu.|Hitung Mundur Iqamah:Menampilkan hitung mundur dari adzan ke iqamah.|Mode Jum'at:Mode tampilan khusus untuk shalat Jum'at.|Layout Tampilan:Pilih dari mode Fokus, Dasbor, atau Minimalis.|Slideshow Dinamis:Tampilkan teks, gambar, jadwal kajian, dan laporan keuangan.|Kustomisasi Tema:Ubah warna aksen dan gambar latar belakang.|Teks Berjalan:Tampilkan pesan kustom atau konten bertema.|Tampilan Dzikir:Menampilkan rangkaian dzikir setelah shalat.|Dukungan Offline:Tetap berfungsi meski tanpa koneksi internet.|Dukungan PWA:Dapat diinstal di perangkat Anda untuk akses cepat dan pengalaman seperti aplikasi asli.|Mode Orientasi:Mendukung tampilan landscape (lebar) dan portrait (tinggi) yang responsif.|Cadangkan & Pulihkan Data:Ekspor dan impor semua pengaturan Anda dengan mudah.",
            supportTitle: 'Pengembang',
            coffee: 'Traktir Kopi',
            discussion: 'Diskusi',
            github: 'GitHub'
        },
        guide: {
            title: 'Panduan Pengaturan',
            intro: 'Berikut adalah penjelasan dari setiap pengaturan yang tersedia untuk membantu Anda menyesuaikan aplikasi sesuai kebutuhan.',
            general: {
                title: 'Pengaturan Umum',
                content: `<ul>
<li><strong>Nama Masjid:</strong> Nama yang akan ditampilkan di layar utama.</li>
<li><strong>Bahasa:</strong> Mengubah bahasa antarmuka aplikasi.</li>
<li><strong>Kota:</strong> Menentukan perhitungan waktu shalat. Aplikasi akan mengambil data dari internet berdasarkan kota ini.</li>
<li><strong>Manajemen Data:</strong> Anda dapat mengekspor semua pengaturan saat ini ke dalam sebuah file <code>.json</code> sebagai cadangan atau untuk dipindahkan ke perangkat lain. Gunakan impor untuk memulihkan dari file tersebut.</li>
</ul>`
            },
            calculation: {
                title: 'Pengaturan Kalkulasi',
                content: `<ul>
<li><strong>Metode Kalkulasi:</strong> Pilih lembaga acuan perhitungan waktu shalat (misal: Kemenag RI). Pilih 'Kustom' untuk mengatur sudut Subuh dan Isya sendiri.</li>
<li><strong>Madhab:</strong> Mempengaruhi perhitungan waktu shalat Ashar. 'Standar' untuk Syafi'i, Maliki, Hanbali, sementara 'Hanafi' memiliki waktu yang lebih lambat.</li>
<li><strong>Koreksi Waktu:</strong> Tambah atau kurangi menit secara manual untuk setiap waktu shalat jika Anda menemukan selisih dengan jadwal masjid lokal.</li>
<li><strong>Jeda Iqamah:</strong> Mengatur durasi hitung mundur dari adzan ke iqamah untuk setiap shalat.</li>
</ul>`
            },
            display: {
                title: 'Pengaturan Tampilan',
                content: `<ul>
<li><strong>Tema:</strong> Pilih antara tampilan gelap atau terang.</li>
<li><strong>Mode Orientasi:</strong> 'Landscape' cocok untuk layar lebar (monitor), 'Portrait' untuk layar tinggi. Ini akan mempengaruhi tata letak.</li>
<li><strong>Template Layout:</strong> Pilih penampilan layar utama. 'Fokus Jam' berukuran besar dan jelas, 'Dasbor Informasi' menampilkan berbagai info, dan 'Minimalis' tampil sederhana.</li>
<li><strong>Warna Aksen:</strong> Warna utama yang digunakan untuk sorotan, tombol, dan penanda waktu shalat berikutnya.</li>
<li><strong>Wallpaper:</strong> Atur latar belakang layar utama. Anda bisa menggunakan gambar via URL, mengunggah gambar sendiri, atau memilih 'Warna Polos' untuk menggunakan warna matte sederhana.</li>
<li><strong>Wallpaper Kontekstual:</strong> Jika aktif, wallpaper akan berubah otomatis mengikuti periode waktu shalat saat ini (misal: gambar berbeda untuk Subuh, Zuhur, dst).</li>
<li><strong>Teks Berjalan:</strong> Tampilkan tulisan bergerak di bagian bawah layar. Mode 'Kustom' menggunakan teks yang Anda tulis, mode 'Tema' memilih acak dari ayat Al-Qur'an atau hadits.</li>
</ul>`
            },
            mosqueMode: {
                title: 'Penggunaan Sebagai Jam Digital Masjid',
                content: `<p>Aplikasi ini dirancang agar dapat berfungsi sebagai jam digital layar penuh di masjid. Berikut adalah langkah-langkah praktis untuk mengaturnya:</p>
<ol>
<li><strong>Perangkat & Koneksi:</strong> Sambungkan perangkat komputer (seperti Mini PC, Intel NUC, atau Raspberry Pi) ke layar TV besar atau proyektor di masjid Anda menggunakan kabel HDMI.</li>
<li><strong>Buka di Browser:</strong> Buka aplikasi Waqti di browser web pada perangkat tersebut (misalnya, Google Chrome atau Firefox).</li>
<li><strong>Mode Layar Penuh (Fullscreen):</strong> Tekan tombol <code>F11</code> pada keyboard untuk membuat browser tampil dalam mode layar penuh tanpa bar alamat atau tab. Tekan <code>F11</code> lagi untuk keluar.</li>
<li><strong>Pilih Layout Terbaik:</strong> Di menu Pengaturan &gt; Tampilan, pilih 'Template Layout' yang paling sesuai. <strong>'Fokus Jam'</strong> sangat direkomendasikan untuk keterbacaan maksimal, atau <strong>'Dasbor Informasi'</strong> jika ingin menampilkan info tambahan.</li>
<li><strong>Instal sebagai Aplikasi (PWA):</strong> Untuk kemudahan akses dan keandalan offline, instal aplikasi ini ke perangkat. Cari ikon 'Instal' di bilah alamat browser atau di menu browser. Ini akan membuat pintasan di Desktop.</li>
<li><strong>Transfer Pengaturan:</strong> Atur semua konfigurasi di komputer pribadi Anda, lalu gunakan fitur <strong>Ekspor Data</strong>. Pindahkan file tersebut ke komputer masjid dan gunakan fitur <strong>Impor Data</strong> untuk menerapkan semua konfigurasi secara instan.</li>
</ol>`
            },
            alarm: {
                title: 'Pengaturan Alarm & Dzikir',
                content: `<ul>
<li><strong>Alarm:</strong> Aktifkan alarm yang akan berbunyi saat waktu Adzan dan Iqamah. Anda bisa menggunakan suara bawaan, URL, atau mengunggah file audio sendiri.</li>
<li><strong>Mode Jum'at:</strong> Pengaturan khusus untuk hari Jum'at. 'Durasi Tampilan Khutbah' akan menggantikan hitung mundur iqamah pada hari Jum'at.</li>
<li><strong>Durasi Tampilan:</strong> Atur berapa lama layar 'Shalat Didirikan' ditampilkan untuk tiap shalat dan total durasi untuk seluruh rangkaian dzikir.</li>
<li><strong>Daftar Dzikir:</strong> Aktifkan, non-aktifkan, tambah, hapus, dan urutkan daftar dzikir yang muncul setelah shalat selesai.</li>
</ul>`
            },
            slides: {
                title: 'Pengaturan Slide',
                content: `<p>Fitur ini memungkinkan Anda menampilkan berbagai slide informatif yang akan tampil bergantian dengan jam utama.</p>
<ul>
<li><strong>Tambah Slide:</strong> Klik tombol untuk menambah slide jenis Teks, Gambar, Jadwal, atau Keuangan.</li>
<li><strong>Pengaturan Slide:</strong> Untuk setiap slide, Anda bisa mengaktifkan/menonaktifkan, mengatur durasi tampilnya, dan memilih apakah slide hanya tampil di hari Jum'at.</li>
<li><strong>Jenis Konten:</strong>
<ul>
<li>- <strong>Teks:</strong> Menampilkan judul dan konten dengan format sederhana.</li>
<li>- <strong>Gambar:</strong> Menampilkan gambar dari URL atau file yang diunggah.</li>
<li>- <strong>Jadwal:</strong> Menampilkan daftar jadwal kegiatan/kajian masjid.</li>
<li>- <strong>Keuangan:</strong> Menampilkan ringkasan laporan keuangan, mencakup pemasukan, pengeluaran, dan saldo akhir, lengkap dengan grafik.</li>
</ul>
</li>
</ul>`
            }
        },
        contact: {
            title: 'Hubungi Kami',
            description: 'Punya pertanyaan, masukan, atau saran? Silakan isi formulir di bawah ini untuk mengirimkan email kepada kami. Kami sangat menghargai masukan Anda!',
            name: 'Nama',
            email: 'Email (Opsional)',
            subject: 'Subjek',
            message: 'Pesan',
            send: 'Kirim Pesan'
        },
        developedBy: 'Aplikasi ini dikembangkan oleh:',
        license: 'Lisensi:',
        dataSource: 'Data waktu shalat disediakan oleh',
    },
    defaults: {
        khutbah: {
            title: 'Jaga Ketenangan',
            tagline: "Khutbah Jum'at sedang berlangsung"
        },
        fridaySlides: [
            { title: "Sunnah: Membaca Surah Al-Kahfi", content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"Barangsiapa yang membaca surat Al-Kahfi pada hari Jum’at, dia akan disinari cahaya di antara dua Jum’at."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(HR. An Nasa’i dan Baihaqi)</strong></p>` },
            { title: 'Sunnah: Bersiap Diri', content: `<p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">Mandi, Memakai Pakaian Terbaik, & Menggunakan Wangi-wangian</strong></p><p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"Barangsiapa mandi pada hari Jum\'at, lalu ia bersuci semampunya... niscaya akan diampuni dosanya antara Jum\'at tersebut dan Jum\'at sebelumnya."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(HR. Bukhari)</strong></p>` },
            { title: 'Keutamaan: Bersegera ke Masjid', content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">Datang di waktu pertama seperti berkurban unta, waktu kedua seperti sapi, waktu ketiga seperti domba, waktu keempat seperti ayam, dan waktu kelima seperti telur.</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(Muttafaqun \'alaih)</strong></p>` },
            { title: 'Keutamaan: Perbanyak Shalawat', content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"Perbanyaklah shalawat kepadaku pada hari Jumat. Barangsiapa yang bershalawat kepadaku satu kali, maka Allah akan bershalawat kepadanya sepuluh kali."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(HR. Al-Baihaqi)</strong></p>` },
            { title: 'Waktu Mustajab untuk Berdoa', content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"Di hari Jum’at terdapat suatu waktu, dimana jika seorang hamba muslim shalat dan memohon sesuatu kepada Allah bertepatan dengan waktu tersebut, maka Allah akan mengabulkannya."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">Waktu tersebut adalah setelah Ashar hingga Maghrib. (HR. Bukhari & Muslim)</strong></p>` }
        ],
        calculationMethods: [
            { id: 0, name: 'Syiah Ithna-Ansari' },
            { id: 1, name: 'Universitas Ilmu Islam, Karachi' },
            { id: 2, name: 'Masyarakat Islam Amerika Utara (ISNA)' },
            { id: 3, name: 'Liga Muslim Dunia (MWL)' },
            { id: 4, name: 'Universitas Umm Al-Qura, Makkah' },
            { id: 5, name: 'Otoritas Survei Umum Mesir' },
            { id: 7, name: 'Institut Geofisika, Universitas Teheran' },
            { id: 8, name: 'Wilayah Teluk' },
            { id: 9, name: 'Kuwait' },
            { id: 10, name: 'Qatar' },
            { id: 11, name: 'Majlis Ugama Islam Singapura, Singapura' },
            { id: 12, name: 'Persatuan Organisasi Islam Perancis' },
            { id: 13, name: 'Diyanet (Kepresidenan Urusan Agama), Turki' },
            { id: 14, name: 'Administrasi Spiritual Muslim Rusia' },
            { id: 15, name: 'Komite Pengamatan Hilal Sedunia' },
            { id: 16, name: 'Dubai (tidak resmi)' },
            { id: 17, name: 'Kementerian Agama Republik Indonesia' },
            { id: 99, name: 'Kustom' }
        ],
        madhabOptions: [
            { id: 0, name: "Standar (Syafi'i, Maliki, Hanbali)" },
            { id: 1, name: 'Hanafi' }
        ],
        highLatitudeRules: [
            { id: 'auto', name: 'Otomatis (Bawaan)' },
            { id: 'MiddleOfTheNight', name: 'Tengah Malam' },
            { id: 'OneSeventh', name: 'Sepertujuh Malam' },
            { id: 'AngleBased', name: 'Berdasarkan Sudut (Shafaq)' }
        ],
        themeOptions: [
            { id: 'quran-tauhid', name: 'Tauhid & Aqidah', category: 'quran' },
            { id: 'quran-akhlaq', name: 'Akhlak', category: 'quran' },
            { id: 'quran-fikih', name: 'Fikih', category: 'quran' },
            { id: 'quran-random', name: 'Random', category: 'quran' },
            { id: 'hadith-tauhid', name: 'Tauhid & Aqidah', category: 'hadith' },
            { id: 'hadith-akhlaq', name: 'Akhlak', category: 'hadith' },
            { id: 'hadith-fikih', name: 'Fikih', category: 'hadith' },
            { id: 'hadith-random', name: 'Random', category: 'hadith' },
        ],
    }
};