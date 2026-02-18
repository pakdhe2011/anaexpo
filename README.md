
# Analytical Exposition RPG (SMK Fase E – Kelas 10)

Game RPG edukatif berbasis web untuk melatih pemahaman **Analytical Exposition**: struktur (Thesis–Arguments–Reiteration), membedakan opini vs fakta, menyusun paragraf, dan ujian akhir menulis 3 paragraf.

## Fitur
- 🎮 Movement top-down (WASD/Arrow), interaksi (Spasi)
- 🧠 3 tantangan kuis + **Ujian Akhir** dengan penilaian otomatis
- 💾 Progress tersimpan (LocalStorage)
- 🌐 Kompatibel **GitHub Pages** (statik, tanpa server)

## Struktur Proyek
```
index.html
style.css
game.js
```

## Cara Menjalankan (Lokal)
Buka `index.html` di browser modern (Chrome/Edge/Firefox). Tidak perlu server.

## Deploy ke GitHub Pages
1. Buat repository publik, unggah 3 file di atas.
2. Settings → Pages → Source: `main` / root → Save.
3. Akses: `https://username.github.io/nama-repo/`.

## Kustomisasi Konten
- Pertanyaan kuis & teks dapat diubah pada `game.js` di objek `content`.
- Topik Ujian Akhir dapat diedit pada fungsi `finalExam()`.
- Penilaian otomatis berada di `autoGrade(text)` — atur bobot/skor sesuai kebutuhan.

## Lisensi
Gunakan bebas untuk tujuan edukasi.
