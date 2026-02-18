# Mission: Exposition — Web Game (GitHub Pages)

Game edukatif Analytical Exposition untuk kelas 10 SMK (Fase E) dengan 4 level: struktur, analisis argumen, kebahasaan, dan menulis teks.

## Struktur Proyek
```
.
├── index.html
├── style.css
├── script.js
└── README.md
```

## Jalankan Lokal
Cukup buka `index.html` di browser modern (Chrome/Edge/Firefox). Semua fitur berjalan tanpa server.

## Deploy ke GitHub Pages
1. **Buat repository baru** di GitHub (misal: `mission-exposition`).
2. **Unggah** berkas `index.html`, `style.css`, `script.js`, `README.md` ke repository (drag-and-drop via web GitHub atau `git`).
3. **Aktifkan Pages**:
   - Masuk **Settings → Pages**.
   - Di bagian **Deployment**, pilih **Branch**: `main` dan **Folder**: `/root` (atau `/(root)` tergantung UI).
   - Klik **Save**.
4. Tunggu ±1–3 menit. Situs akan tersedia di URL: `https://<username>.github.io/mission-exposition/`.

> Alternatif: jika Anda menyimpan file di folder `docs/`, pilih **Folder**: `/docs` pada pengaturan Pages.

## Kustomisasi
- **Konten level**: edit konstanta `L1_DATA`, `L2_DATA`, `L3_QUESTIONS` di `script.js`.
- **Rubrik Level 4**: ubah logika pada fungsi `scoreLevel4()`.
- **Poin & Badge**: atur di `recordScore()`.

## Lisensi
Proyek ini dirilis untuk tujuan pendidikan. Modifikasi dan gunakan bebas dalam kelas.
