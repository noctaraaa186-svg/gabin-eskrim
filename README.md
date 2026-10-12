# Es Krim Gabin – Website Laporan Penjualan (versi pribadi)

Isi paket:
- `index.html`  : website (satu file, tanpa build/instal apa pun)
- `Code.gs`     : backend Google Apps Script (menghubungkan website ke Google Sheets)
- `Template_Laporan_Es_Krim_Gabin.xlsx` : template Spreadsheet (Pesanan, Rekap, Harga)

Cara kerja: website → Apps Script → Google Sheets. Semua anggota membuka website yang sama,
datanya tersimpan di satu Google Sheets dan sinkron otomatis (diperbarui tiap 15 detik).

## Langkah pasang (±10 menit)

1. **Spreadsheet.** Unggah `Template_Laporan_Es_Krim_Gabin.xlsx` ke Google Drive, buka, lalu
   *File > Simpan sebagai Google Spreadsheet*. Bagikan Sheet itu ke anggota kelompok (Viewer sudah cukup
   untuk melihat; website yang menulis datanya).
2. **Backend.** Di Sheet itu: *Ekstensi > Apps Script*. Hapus isi default, tempel isi `Code.gs`.
   Ganti `GANTI_KODE_KELOMPOK` dengan kode rahasia pilihanmu. Simpan.
3. Pilih fungsi `setup` di dropdown, klik **Jalankan**, setujui izin akses (sekali saja).
4. **Deploy.** *Terapkan > Deployment baru > jenis: Aplikasi web*.
   Jalankan sebagai: **Saya**. Yang memiliki akses: **Siapa saja**. Salin **URL aplikasi web**.
5. Buka `index.html` dengan editor teks, cari `PASTE_URL_WEB_APP_DI_SINI`, ganti dengan URL tadi.
6. **Hosting** (pilih salah satu, gratis): Netlify Drop (seret folder), GitHub Pages, atau Cloudflare Pages.
   Untuk uji coba, `index.html` juga bisa dibuka langsung dari komputer.
7. Buka website, masukkan kode kelompok saat diminta. Bagikan link website + kode ke anggota.

## Catatan penting
- Setiap kali `Code.gs` diubah, buat **Deployment baru** (atau *Kelola deployment > edit > versi baru*), kalau tidak perubahan tidak aktif.
- Kapasitas 300 pesanan (baris 6–305). Untuk lebih banyak, salin rumus kolom A, F, G ke bawah, ubah `LAST` di `Code.gs`, dan perluas rentang rumus di sheet Rekap.
- Harga satuan diambil dari sheet **Harga** lewat rumus. Mengubah harga di sana ikut mengubah total pesanan lama.
  (Tidak seperti versi di Claude yang mengunci harga per pesanan.)
- Keamanan: siapa pun yang punya URL Apps Script **dan** kode kelompok bisa membaca/menulis data. Jaga kerahasiaan keduanya.
- Edit langsung di Google Sheets boleh, tapi hanya di kolom kuning (B, C, D, E, H, I) dan jangan menghapus kolom J–K (tersembunyi, berisi ID baris).
  Baris yang dibuat manual tanpa ID tidak muncul di website.
