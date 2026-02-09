
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
            slides: 'Slide',
            services: 'Layanan & Toko'
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
            },
            offlineAssets: {
                title: 'Aset Offline',
                description: 'Unduh perpustakaan yang diperlukan, serta gambar dan suara bawaan agar aplikasi dapat bekerja sepenuhnya tanpa internet (Mode Offline).',
                download: 'Unduh Aset',
                downloading: 'Mengunduh...',
                ready: 'Aset Siap (Mode Offline Tersedia)',
                success: 'Aset berhasil diunduh!'
            },
            remote: {
                title: 'Remote Control',
                description: 'Scan QR Code ini menggunakan HP Anda untuk mengontrol tampilan dari jarak jauh.',
                pairingCode: 'Kode Pairing / Peer ID',
                statusConnected: 'Remote Terhubung',
                statusWaiting: 'Menunggu Koneksi...',
                scanButton: 'Scan untuk Hubungkan',
                manualInputLabel: 'Atau Masukkan Kode Manual',
                manualInputPlaceholder: 'Contoh: WAQTI-AB123',
                connectButton: 'Hubungkan'
            },
            promo: {
                title: 'Butuh Perangkat Khusus?',
                description: 'Dapatkan WaqtiBox (Mini PC) siap pakai. Lebih stabil, tanpa ribet instalasi.',
                button: 'Lihat Layanan & Toko'
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
            source: {
                title: 'Sumber Data & Lokasi',
                source: 'Sumber Perhitungan',
                api: 'Online (API)',
                calculated: 'Offline (Kalkulasi)',
                latitude: 'Lintang (Latitude)',
                longitude: 'Bujur (Longitude)',
                detect: 'Deteksi Lokasi',
                detecting: 'Mendeteksi...',
                detectError: 'Gagal mendeteksi lokasi. Pastikan izin lokasi aktif.',
                searchCityPlaceholder: 'Cari koordinat berdasarkan nama kota...',
                searchCity: 'Cari Koordinat',
                searchSuccess: 'Ditemukan koordinat untuk: {{city}}',
                searchNotFound: 'Koordinat kota tidak ditemukan.',
                manualHelp: 'Anda dapat mengetik Angka Lintang dan Bujur secara manual di atas.',
                currentCoordinates: 'Koordinat Saat Ini',
                modeHelp: "Pilih 'Online' untuk hasil yang divalidasi server, atau 'Offline' untuk perhitungan internal (Adhan.js) tanpa internet."
            },
            methodHelp: 'Pengaturan di bawah ini berlaku untuk kedua metode (Online API & Offline Adhan.js).',
            corrections: {
                title: 'Koreksi Manual',
                useManual: 'Gunakan Waktu Shalat Manual',
                correction: 'Koreksi Waktu (menit)',
                iqamah: 'Jeda Menuju Iqamah (menit)',
                hijri: 'Penyesuaian Tanggal Hijriah (Hari)',
                hijriHelp: 'Atur +/- 1 atau 2 hari jika tanggal Hijriah berbeda dengan ketetapan pemerintah (Rukyat).'
            }
        },
        display: {
            title: 'Pengaturan Tampilan & Visual',
            presets: {
                title: 'Tema Siap Pakai',
                description: 'Terapkan gaya tampilan (warna, wallpaper, font) dengan satu kali klik.',
                apply: 'Terapkan'
            },
            fontStyle: {
                title: 'Gaya Font',
                sans: 'Modern (Sans-Serif)',
                serif: 'Klasik (Serif)'
            },
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
            minimalist: {
                enableSwap: 'Tampilkan Jadwal Lengkap Secara Berkala',
                swapInterval: 'Interval (menit)'
            },
            bgAnimation: 'Aktifkan Animasi Latar Belakang',
            dimScreen: {
                enable: 'Aktifkan Layar Redup saat Shalat',
                help: 'Layar akan menjadi hitam selama periode "Shalat Didirikan" untuk mensimulasikan layar mati.'
            },
            sleepMode: {
                title: 'Hemat Daya (Auto Sleep/Wake)',
                enable: 'Aktifkan Mode Tidur',
                startTime: 'Waktu Mulai (Tidur)',
                endTime: 'Waktu Selesai (Bangun)',
                help: 'Layar akan mati total (hitam pekat) pada jam-jam ini untuk menghemat listrik dan mencegah burn-in.'
            },
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
                finance: 'Tambah Keuangan',
                fridayOfficer: 'Tambah Petugas'
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
                donationTarget: 'Target Donasi (Opsional)',
                chartTitle: 'Pemasukan vs Pengeluaran',
                summary: 'Ringkasan',
                collected: 'Terkumpul',
                remaining: 'Sisa',
                remainingNeeded: 'Dana yang masih dibutuhkan:'
            },
            officer: {
                title: 'Petugas Jum\'at',
                khotib: 'Khatib',
                imam: 'Imam',
                muadzin: 'Muadzin',
                bilal: 'Bilal'
            },
            empty: 'Belum ada slide. Silakan tambahkan.',
            type: {
                text: 'Slide Teks',
                image: 'Slide Gambar',
                schedule: 'Slide Jadwal',
                finance: 'Slide Keuangan',
                'friday-officer': 'Slide Petugas'
            }
        }
    },
    info: {
        title: 'Tentang & Layanan',
        tabs: {
            about: 'Tentang Aplikasi',
            guide: 'Panduan Pengguna',
            services: 'Layanan & Toko',
            contact: 'Kontak'
        },
        about: {
            appName: "Waqti",
            description_part1: "Aplikasi waktu shalat modern dan personal untuk menemani waktu Anda dengan Sang Pencipta. Dilengkapi kustomisasi, tema, dan konten dinamis untuk penggunaan pribadi dan tampilan jam digital masjid. Terinspirasi dari ",
            mawaqit_link_text: "Mawaqit",
            description_part2: " dengan penggunaan yang lebih sederhana—tanpa akun atau backoffice. Nama Waqti (وقتي) berarti 'Waktuku', menekankan hubungan personal dengan waktu shalat.",
            featuresTitle: 'Fitur Utama',
            features: "Waktu Shalat Otomatis:Menghitung waktu berdasarkan kota dan metode pilihan.|Remote Control:Kendalikan tampilan (ganti slide, matikan alarm) dari jarak jauh via HP dengan pemindai QR bawaan.|Kalkulasi Kustom:Sesuaikan metode, mazhab, dan koreksi waktu.|Hitung Mundur Iqamah:Menampilkan jeda waktu dari azan ke iqamah.|Mode Jum'at:Tampilan khusus untuk shalat Jum'at.|Tata Letak Tampilan:Pilih tampilan Fokus, Dasbor, atau Minimalis.|Slideshow Dinamis:Tampilkan teks, gambar, jadwal, dan laporan keuangan.|Tema Siap Pakai:Terapkan gaya (Masjidil Haram, Minimalis, Nusantara) dengan satu klik.|Theming:Kustomisasi warna aksen dan wallpaper.|Teks Berjalan:Tampilkan pesan kustom atau konten Islami.|Tampilan Dzikir:Menampilkan urutan dzikir setelah shalat.|Layar Redup:Layar menjadi gelap saat shalat untuk mengurangi gangguan.|Hemat Daya:Fitur Auto Sleep/Wake untuk mematikan rendering layar di malam hari.|Petugas Jum'at:Slide khusus untuk menampilkan Imam, Khatib, dan Muadzin.|Dukungan Offline Total:Bekerja tanpa internet dengan fitur unduh aset (gambar/suara).|Performa Tinggi:Penyimpanan gambar yang dioptimalkan untuk akses cepat.|Aplikasi PWA:Dapat diinstal seperti aplikasi native.|Backup & Restore:Ekspor dan impor pengaturan dengan mudah.",
            supportTitle: 'Pengembang',
            coffee: 'Traktir Kopi',
            discussion: 'Gabung Diskusi',
            github: 'GitHub'
        },
        services: {
            title: 'Layanan & Perangkat Keras',
            intro: 'Dukung pengembangan Waqti dan permudah operasional masjid Anda dengan solusi premium berikut. Seluruh keuntungan digunakan untuk pemeliharaan dan pengembangan fitur baru.',
            waqtibox: {
                title: 'WaqtiBox (Mini PC Plug & Play)',
                description: 'Perangkat Mini PC hemat daya yang sudah di-install Waqti. Tinggal colok ke TV masjid, sambungkan WiFi, dan siap digunakan. Solusi paling stabil dan mudah dikonfigurasi.',
                price: 'Mulai Rp 500.000 (Harga menyesuaikan perangkat)'
            },
            sdcard: {
                title: 'WaqtiDrive (USB Bootable)',
                description: 'Bootable Flashdrive containing a lightweight Custom Linux OS + Waqti. Budget-friendly solution to repurpose old x86 Mini PCs or Laptops into a digital mosque clock.',
                price: 'Starts from $7'
            },
            setup: {
                title: 'Jasa Setup & Instalasi',
                description: 'Tim kami siap datang ke lokasi masjid Anda (Area Pulau Jawa) untuk instalasi, setting TV, dan pelatihan. Biaya transportasi ditanggung pemesan.',
                price: 'Hubungi Kami'
            },
            whitelabel: {
                title: 'Custom Branding / White Label',
                description: 'Versi khusus Waqti dengan Logo Masjid/Yayasan Anda yang permanen, warna korporat, dan fitur khusus sesuai permintaan donatur.',
                price: 'Hubungi Kami'
            },
            contact_button: 'Pesan via WhatsApp'
        },
        guide: {
            title: 'Panduan Pengaturan',
            intro: 'Berikut adalah penjelasan dari setiap pengaturan yang tersedia untuk membantu Anda menyesuaikan aplikasi sesuai kebutuhan.',
            general: {
                title: 'Pengaturan Umum',
                content: `<ul>
<li><strong>Nama Masjid:</strong> Nama yang ditampilkan di layar utama.</li>
<li><strong>Bahasa:</strong> Mengubah bahasa antarmuka aplikasi.</li>
<li><strong>Kota:</strong> Menentukan perhitungan waktu shalat (Mode Online). Aplikasi akan mengambil data dari internet berdasarkan kota ini.</li>
<li><strong>Remote Control:</strong> Pindai kode QR untuk menyambungkan HP Anda dan menggunakannya sebagai pengendali jarak jauh.</li>
<li><strong>Aset Offline:</strong> Unduh file yang diperlukan agar aplikasi berfungsi sempurna tanpa koneksi internet.</li>
<li><strong>Manajemen Data:</strong> Anda dapat mengekspor semua pengaturan saat ini menjadi file <code>.json</code> sebagai cadangan atau untuk memindahkannya ke perangkat lain. Gunakan impor untuk memulihkan dari file tersebut.</li>
</ul>`
            },
            calculation: {
                title: 'Pengaturan Kalkulasi',
                content: `<ul>
<li><strong>Sumber:</strong> Pilih 'Online (API)' untuk mengambil waktu berdasarkan nama kota, atau 'Offline (Kalkulasi)' untuk menghitung secara internal menggunakan koordinat.</li>
<li><strong>Koordinat:</strong> Lintang (Latitude) dan Bujur (Longitude) diperlukan untuk perhitungan offline. Anda bisa mendeteksinya secara otomatis.</li>
<li><strong>Metode Kalkulasi:</strong> Pilih lembaga perhitungan waktu shalat (misal: Kemenag RI). Pilih 'Kustom' untuk mengatur sudut Subuh dan Isya sendiri.</li>
<li><strong>Madhab:</strong> Mempengaruhi perhitungan waktu Asar. 'Standar' untuk Syafi'i, Maliki, Hambali, sedangkan 'Hanafi' waktunya lebih lambat.</li>
<li><strong>Koreksi Waktu:</strong> Tambah atau kurangi menit secara manual untuk setiap waktu shalat jika ada selisih dengan masjid setempat.</li>
<li><strong>Jeda Iqamah:</strong> Mengatur durasi hitung mundur dari azan menuju iqamah untuk setiap shalat.</li>
<li><strong>Penyesuaian Hijriah:</strong> Tambah atau kurangi hari untuk tanggal Hijriah secara manual agar sesuai dengan hasil rukyat setempat.</li>
</ul>`
            },
            display: {
                title: 'Pengaturan Tampilan',
                content: `<ul>
<li><strong>Tema Siap Pakai:</strong> Pilih preset gaya tampilan instan (warna, wallpaper, font).</li>
<li><strong>Tema:</strong> Pilih antara tampilan gelap atau terang.</li>
<li><strong>Mode Orientasi:</strong> 'Landscape' cocok untuk layar lebar (monitor/TV), 'Portrait' untuk layar tinggi. Ini mempengaruhi tata letak.</li>
<li><strong>Template Layout:</strong> Pilih tampilan layar utama. 'Fokus Jam' besar dan jelas, 'Dasbor Informasi' menampilkan beragam info, dan 'Minimalis' lebih sederhana.</li>
<li><strong>Hemat Daya (Sleep Mode):</strong> Secara otomatis membuat layar menjadi hitam pekat pada jam-jam tertentu (misal: 22.00 - 03.00) untuk menghemat listrik dan mencegah kerusakan layar.</li>
<li><strong>Layar Redup:</strong> Jika diaktifkan, layar akan menjadi hitam selama waktu shalat berlangsung (setelah pesan awal 'Dirikanlah Shalat') untuk mengurangi gangguan.</li>
<li><strong>Warna Aksen:</strong> Warna utama yang digunakan untuk sorotan, tombol, dan penanda waktu shalat berikutnya.</li>
<li><strong>Wallpaper:</strong> Atur latar belakang layar utama. Bisa menggunakan gambar dari URL, unggah gambar sendiri, atau pilih 'Warna Polos' untuk warna matte sederhana.</li>
<li><strong>Wallpaper Kontekstual:</strong> Jika diaktifkan, wallpaper akan berubah otomatis berdasarkan periode waktu shalat saat ini (misal: gambar berbeda untuk Subuh, Zuhur, dll).</li>
<li><strong>Teks Berjalan:</strong> Menampilkan teks bergerak di bagian bawah layar. Mode 'Kustom' menggunakan teks buatan Anda, mode 'Tema' memilih acak dari ayat Al-Qur'an atau hadits.</li>
</ul>`
            },
            mosqueMode: {
                title: 'Penggunaan Sebagai Jam Digital Masjid',
                content: `<p>Aplikasi ini dirancang agar bisa berfungsi sebagai jam digital layar penuh di masjid. Berikut langkah praktis pengaturannya:</p>
<ol>
<li><strong>Perangkat & Koneksi:</strong> Sambungkan perangkat komputer (seperti Mini PC, Intel NUC, atau Raspberry Pi) ke layar TV besar atau proyektor di masjid menggunakan kabel HDMI.</li>
<li><strong>Buka di Browser:</strong> Buka aplikasi Waqti di browser web pada perangkat tersebut (misalnya Google Chrome atau Firefox).</li>
<li><strong>Mode Layar Penuh:</strong> Tekan tombol <code>F11</code> pada keyboard agar browser masuk ke mode layar penuh (fullscreen) tanpa bilah alamat. Tekan <code>F11</code> lagi untuk keluar.</li>
<li><strong>Pilih Layout Terbaik:</strong> Di menu Pengaturan > Tampilan, pilih 'Template Layout' yang paling sesuai untuk dilihat dari jauh. <strong>'Fokus Jam'</strong> sangat disarankan untuk keterbacaan maksimal, atau <strong>'Dasbor Informasi'</strong> jika ingin menampilkan jadwal dan info keuangan.</li>
<li><strong>Instal Aplikasi (PWA) & Unduh Aset:</strong> Agar lebih mudah diakses dan andal secara offline, instal aplikasi ini ke perangkat. Juga, buka Pengaturan > Umum dan klik "Unduh Aset" untuk menyimpan gambar dan suara secara lokal.</li>
<li><strong>Remote Control:</strong> Gunakan HP Anda untuk memindai kode QR di Pengaturan > Remote Control untuk mengatur slide atau mematikan alarm tanpa menyentuh TV.</li>
<li><strong>Transfer Pengaturan:</strong> Atur semua pengaturan di komputer pribadi Anda terlebih dahulu. Lalu gunakan fitur <strong>Ekspor Data</strong> untuk menyimpan pengaturan. Pindahkan file tersebut ke komputer masjid dan gunakan fitur <strong>Impor Data</strong> untuk menerapkan semua konfigurasi secara instan.</li>
</ol>`
            },
            alarm: {
                title: 'Pengaturan Alarm & Dzikir',
                content: `<ul>
<li><strong>Alarm:</strong> Aktifkan alarm yang akan berbunyi saat waktu Azan dan Iqamah tiba. Bisa menggunakan suara bawaan, URL, atau unggah file audio sendiri.</li>
<li><strong>Mode Jum'at:</strong> Pengaturan khusus hari Jum'at. Bisa mengikuti waktu Zuhur atau waktu manual. 'Durasi Tampilan Khutbah' menggantikan hitung mundur iqamah pada hari Jum'at.</li>
<li><strong>Durasi Tampilan:</strong> Mengatur berapa lama layar 'Shalat Didirikan' ditampilkan untuk setiap shalat dan total durasi untuk seluruh rangkaian dzikir.</li>
<li><strong>Daftar Dzikir:</strong> Aktifkan, nonaktifkan, tambah, hapus, dan urutkan daftar dzikir yang muncul setelah shalat selesai.</li>
</ul>`
            },
            slides: {
                title: 'Pengaturan Slide',
                content: `<p>Fitur ini memungkinkan Anda menampilkan berbagai slide informasi yang akan bergantian dengan tampilan jam utama.</p>
<ul>
<li><strong>Tambah Slide:</strong> Klik tombol untuk menambah jenis slide: Teks, Gambar, Jadwal, Keuangan, atau Petugas.</li>
<li><strong>Pengaturan Slide:</strong> Untuk setiap slide, Anda bisa mengaktifkan/mematikan, mengatur durasi tampil, dan memilih apakah hanya muncul di hari Jum'at.</li>
<li><strong>Jenis Konten:</strong>
<ul>
<li>- <strong>Teks:</strong> Menampilkan judul dan konten dengan format sederhana.</li>
<li>- <strong>Gambar:</strong> Menampilkan gambar dari URL atau file yang diunggah. Mendukung file besar dengan pemuatan cepat.</li>
<li>- <strong>Jadwal:</strong> Menampilkan daftar jadwal kajian atau kegiatan masjid.</li>
<li>- <strong>Keuangan:</strong> Menampilkan ringkasan laporan keuangan kas masjid, termasuk pemasukan, pengeluaran, dan saldo akhir, lengkap dengan grafik.</li>
<li>- <strong>Petugas:</strong> Menampilkan nama-nama petugas Khotib, Imam, dan Muadzin untuk shalat Jum'at.</li>
</ul>
</li>
</ul>`
            }
        },
        contact: {
            title: 'Hubungi Kami',
            description: 'Punya pertanyaan, kritik, atau saran? Silakan isi formulir di bawah ini untuk mengirim email kepada kami. Masukan Anda sangat berharga!',
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
            { id: 'hadith-akhlaq', name: 'Akhlaq', category: 'hadith' },
            { id: 'hadith-fikih', name: 'Fikih', category: 'hadith' },
            { id: 'hadith-random', name: 'Random', category: 'hadith' },
        ],
    }
};
