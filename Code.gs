/**
 * Es Krim Gabin – backend Google Apps Script
 * Dipasang di script.google.com (proyek mandiri) dan terhubung ke Spreadsheet lewat SHEET_ID
 * Langkah lengkap ada di README.md
 */
const SECRET = 'GANTI_KODE_KELOMPOK';   // kode rahasia kelompok, WAJIB diganti
const SHEET_ID = 'ISI_ID_SPREADSHEET';   // ID Google Spreadsheet (lihat README)
const FIRST = 6, LAST = 305, N = LAST - FIRST + 1; // area data sheet Pesanan (baris 6-305)

function ss_() { return SpreadsheetApp.openById(SHEET_ID); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function t_(v, max) { v = String(v == null ? '' : v).trim().slice(0, max); return /^[=+\-@]/.test(v) ? "'" + v : v; }

// Jalankan SEKALI dari editor Apps Script (menu Run > setup)
function setup() {
  const s = ss_().getSheetByName('Pesanan');
  s.getRange('J5:K5').setValues([['ID', 'TS']]);
  s.hideColumns(10, 2);
}

function doGet() { return out_({ ok: true, msg: 'Es Krim Gabin API aktif' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.key !== SECRET) return out_({ ok: false, error: 'unauthorized' });
    const s = ss_().getSheetByName('Pesanan');
    switch (b.action) {
      case 'list': break;
      case 'add': add_(s, b.order); break;
      case 'paid': s.getRange(rowOf_(s, b.id), 8).setValue(b.paid ? 'Lunas' : 'Belum'); break;
      case 'delete': del_(s, b.id); break;
      case 'menu': menu_(s, b.variants); break;
      default: return out_({ ok: false, error: 'aksi tidak dikenal' });
    }
    SpreadsheetApp.flush();
    return out_(list_(s));
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function ids_(s) { return s.getRange(FIRST, 10, N, 1).getValues().map(r => String(r[0])); }
function rowOf_(s, id) {
  const i = ids_(s).indexOf(String(id));
  if (i < 0) throw new Error('Pesanan tidak ditemukan');
  return FIRST + i;
}
function menuNames_() {
  return ss_().getSheetByName('Harga').getRange('A5:A7').getValues().map(r => String(r[0]));
}

function add_(s, o) {
  const name = t_(o.name, 60);
  if (!name) throw new Error('Nama pemesan kosong');
  if (menuNames_().indexOf(String(o.variantName)) < 0) throw new Error('Varian tidak dikenal');
  const qty = Math.floor(Number(o.qty));
  if (!(qty >= 1 && qty <= 999)) throw new Error('Jumlah tidak valid');
  const i = ids_(s).indexOf('');
  if (i < 0) throw new Error('Tabel penuh (maks ' + N + ' baris). Salin rumus kolom A, F, G ke bawah lalu perbesar LAST di Code.gs.');
  const r = FIRST + i;
  const tz = ss_().getSpreadsheetTimeZone();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(o.date) ? Utilities.parseDate(o.date, tz, 'yyyy-MM-dd') : new Date();
  s.getRange(r, 2, 1, 4).setValues([[date, name, String(o.variantName), qty]]);
  s.getRange(r, 8, 1, 4).setValues([[o.paid ? 'Lunas' : 'Belum', t_(o.note, 120), Utilities.getUuid().slice(0, 8), Date.now()]]);
}

function del_(s, id) {
  const r = rowOf_(s, id);
  s.getRange(r, 2, 1, 4).clearContent();
  s.getRange(r, 8, 1, 4).clearContent();
}

function menu_(s, variants) {
  if (!Array.isArray(variants) || variants.length !== 3) throw new Error('Data varian tidak valid');
  const h = ss_().getSheetByName('Harga');
  const old = menuNames_();
  const next = variants.map(v => [t_(v.name, 30) || 'Varian', Math.max(0, Math.round(Number(v.price) || 0))]);
  const col = s.getRange(FIRST, 4, N, 1);
  const vals = col.getValues();
  old.forEach((oldName, i) => {
    if (oldName !== next[i][0]) vals.forEach(r => { if (r[0] === oldName) r[0] = next[i][0]; });
  });
  col.setValues(vals);
  h.getRange('A5:B7').setValues(next);
}

function list_(s) {
  const tz = ss_().getSpreadsheetTimeZone();
  const vals = s.getRange(FIRST, 1, N, 11).getValues();
  const orders = [];
  vals.forEach(r => {
    if (r[9] === '') return;
    let d = r[1];
    if (d instanceof Date) d = Utilities.formatDate(d, tz, 'yyyy-MM-dd');
    orders.push({
      id: String(r[9]), date: String(d), name: String(r[2]), variantName: String(r[3]),
      qty: Number(r[4]) || 0, price: Number(r[5]) || 0, total: Number(r[6]) || 0,
      paid: r[7] === 'Lunas', note: String(r[8] || ''), ts: Number(r[10]) || 0
    });
  });
  const menu = ss_().getSheetByName('Harga').getRange('A5:B7').getValues()
    .map(r => ({ name: String(r[0]), price: Number(r[1]) || 0 }));
  return { ok: true, menu: menu, orders: orders };
}
