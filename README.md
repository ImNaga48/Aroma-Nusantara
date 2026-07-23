# Aroma Nusantara - Digital Menu & QR Payment

Website kafe modern dengan sistem pemesanan digital dan pembayaran QRIS.

## Fitur
- Single Page Application (SPA) tanpa reload halaman
- Menu interaktif dengan pencarian dan filter kategori
- Keranjang belanja disimpan di localStorage
- Checkout dan pembayaran dengan QR code dinamis (nominal sesuai total)
- Countdown timer pembayaran 15 menit
- Dark mode
- Responsif untuk semua perangkat
- Backend PHP untuk menyimpan pesanan ke database MySQL

## Instalasi
1. Clone atau download repository ini ke direktori web server (XAMPP/htdocs, Laragon/www, dll).
2. Buat database MySQL dengan nama `aroma_nusantara`.
3. Import file `backend/database.sql` ke database tersebut.
4. Sesuaikan konfigurasi database di `backend/config.php` (host, user, password).
5. Pastikan folder `assets/qr/` berisi file gambar QR dengan nama sesuai nominal (contoh: 5000.png, 12000.png). Gambar QR dapat dibuat menggunakan QRIS generator.
6. Buka `index.html` melalui browser (misal http://localhost/aroma-nusantara/).

## Struktur Folder
- `index.html` : Halaman utama SPA
- `style.css` : Semua styling
- `script.js` : Logika frontend
- `data/` : File JSON (cafe, menu, contact)
- `assets/` : Gambar logo, banner, menu, QR, icon
- `backend/` : API PHP untuk menyimpan pesanan

## Kustomisasi
- Ganti gambar di `assets/` sesuai keperluan.
- Edit data di `data/cafe.json`, `data/menu.json`, `data/contact.json`.
- QR Payment: tambahkan gambar QR dengan nama file sesuai nominal pembayaran (contoh: `15000.png`). Jika tidak ada, sistem akan menampilkan pesan "QR belum tersedia".

## Teknologi
- HTML5, CSS3, JavaScript (ES6)
- PHP 7+, MySQL
- Font Awesome, Google Fonts