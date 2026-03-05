
# Mission: Exposition — Web Game (GitHub Pages)

Game edukatif Analytical Exposition (Fase E, Kelas 10 SMK) dengan **timer**, **streak bonus**, dan **bank soal JSON**.

## Struktur Proyek
```
.
├── index.html
├── style.css
├── script.js
└── bank_soal.json
```

## Cara Jalan Lokal
- Buka `index.html` di Chrome/Edge/Firefox.
- Catatan: sebagian browser membatasi `fetch()` saat dibuka dari `file://`. Jika bank soal tidak termuat, game otomatis pakai **data bawaan**. Untuk memaksa pakai JSON, jalankan via server lokal (mis. VSCode *Live Server*) atau **GitHub Pages**.

## Deploy ke GitHub Pages
1. Buat repo (mis. `mission-exposition`).
2. Unggah `index.html`, `style.css`, `script.js`, `bank_soal.json`.
3. Settings → Pages → Branch `main`, folder `(root)` → **Save**.
4. Akses: `https://<username>.github.io/mission-exposition/`.

## Kustomisasi
- **Timer**: atur di `bank_soal.json` → `settings.timer` per level.
- **Streak bonus**: faktor per best streak di `settings.streakBonusPerBest`.
- **Time bonus (Level 4)**: `settings.timeBonusPer10s` (poin per sisa 10 detik).
- **Soal & materi**: edit array `level1`, `level2`, `level3` di `bank_soal.json`.

## Lisensi
Untuk tujuan pendidikan. Silakan modifikasi.
