/**
 * ============================================================================
 * THE WEDDING OF ULFA AZIZAH & DIMAS — GOOGLE APPS SCRIPT (Code.gs)
 * Terhubung ke Spreadsheet "Wedding Ulfa"
 * ID Spreadsheet: 13Hl_QHcG8WhsD4X4fE2ll8HeZjHNhpVpo8gCVZkh_rc
 * ============================================================================
 * CARA MENGISI SPREADSHEET OTOMATIS:
 * 1. Buka Google Sheets "Wedding Ulfa", klik menu Extensions > Apps Script.
 * 2. Buat 4 file: Code.gs, Index.html, Stylesheet.html, dan JavaScript.html.
 * 3. Pilih fungsi `setupDatabaseSheets` di bagian atas editor, lalu klik Run.
 * ============================================================================
 */

const SPREADSHEET_ID = '13Hl_QHcG8WhsD4X4fE2ll8HeZjHNhpVpo8gCVZkh_rc';

const SHEET_TAMU = 'Tamu';
const SHEET_RSVP = 'RSVP';
const SHEET_GIFT = 'WeddingGift';
const SHEET_UCAPAN = 'Ucapan';

/**
 * ============================================================================
 * DAFTAR ID GOOGLE DRIVE FOTO PENGANTIN & PRE-WEDDING (HANYA ID DRIVE)
 * Seluruh foto di website diambil otomatis dari daftar ID Google Drive di bawah ini:
 * ============================================================================
 */
const DRIVE_PHOTO_IDS = {
  gedungPelaminan: '1PM-8RFPofVmOZYpsXB1R4lceNVBrNqip',
  coverPin: '11U5mxsda2pUewOnUqs7p8ChCxcG8d32A',
  heroUtama: '1eTjiCq_kGE_c7pG6mqejL12iNokL7i8g',
  bgRsvp: '1Tw8kQBOkkJnjH5loQKd0kWyHRhq0EGIb',
  bgUcapan: '1Qipk7crILX40rblYqBwZvCJS-jJgKzcF',
  mempelaiPria: '1qfq7jIPx7ZrVXFJpjJaZF-7jOb2NoXVc',
  mempelaiWanita: '1y9XU1vd5QsGszWf51DFTnfrRedOJSZeY',
  keduaMempelai: [
    '1HkIaVcpXyOWLHAuYxOX-oYjO4A17kmQd',
    '1y1xhfQwY_APLzsJ41iLpKE406Oqll4NG',
    '1Tw8kQBOkkJnjH5loQKd0kWyHRhq0EGIb',
    '1MRaIdTGU3UQexo11HO2r7HFNSeWJQFko',
    '1FghtVHHPnBhh1syJhTj_tNnR_PNb_3cy',
    '1eTjiCq_kGE_c7pG6mqejL12iNokL7i8g',
    '1zIE5RHN5-kvCTCf3WKgp288ESs2675-Y',
    '1ofdjvCj28avtxaLXMScoTiQ1biPEKKxx',
    '1P7gdLYYzFG2EqoMhOtbg5bnd3zvu5ZWg',
    '11U5mxsda2pUewOnUqs7p8ChCxcG8d32A',
    '1jKctamd88yiYMXWIrjMc-MtoFHcp3Ro0',
    '1CJWNQ7f0dGhXDw_jrjcDy9oJaZhnPLSQ',
    '1KEY8pv0weS22GhmCNy5LY04y5JW3T9Gc',
    '1Qipk7crILX40rblYqBwZvCJS-jJgKzcF'
  ]
};

function getDrivePhotoConfig() {
  return DRIVE_PHOTO_IDS;
}

function getWeddingSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Menerima request GET:
 * - Jika dipanggil dari Vercel dengan parameter `?action=...`, kembalikan JSON API.
 * - Jika dibuka langsung di browser tanpa `action`, tampilkan halaman HTML Apps Script.
 */
function doGet(e) {
  ensureSheetsExist();

  const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : '';
  if (action) {
    try {
      if (action === 'verifyPin') {
        return createJsonResponse(verifyGuestPin(e.parameter.pin || ''));
      }
      if (action === 'getWishes') {
        return createJsonResponse({ success: true, wishes: getPublicWishes() });
      }
      if (action === 'getConfig') {
        return createJsonResponse({ success: true, drivePhotoIds: DRIVE_PHOTO_IDS });
      }
      return createJsonResponse({ success: false, message: 'Action GET tidak dikenali: ' + action });
    } catch (err) {
      return createJsonResponse({ success: false, message: String(err) });
    }
  }

  const template = HtmlService.createTemplateFromFile('Index');
  template.initialPin = (e && e.parameter && e.parameter.pin)
    ? String(e.parameter.pin).trim().toUpperCase()
    : '';
  template.drivePhotoIdsJson = JSON.stringify(DRIVE_PHOTO_IDS);

  return template
    .evaluate()
    .setTitle('The Wedding of Ulfa Azizah & Dimas')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Menerima request POST dari Website Vercel (Bebas CORS dengan Content-Type: text/plain)
 * untuk Verifikasi PIN, Simpan RSVP, Simpan Konfirmasi Gift, dan Simpan Ucapan ke Google Sheets.
 */
function doPost(e) {
  ensureSheetsExist();

  try {
    const rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const body = JSON.parse(rawBody);
    const action = String(body.action || '').trim();

    if (action === 'verifyPin') {
      return createJsonResponse(verifyGuestPin(body.pin || ''));
    }
    if (action === 'submitRsvp') {
      return createJsonResponse(submitRsvp(body.payload || body));
    }
    if (action === 'submitGift') {
      return createJsonResponse(submitGiftConfirmation(body.payload || body));
    }
    if (action === 'submitWish') {
      return createJsonResponse(submitWish(body.payload || body));
    }
    if (action === 'getWishes') {
      return createJsonResponse({ success: true, wishes: getPublicWishes() });
    }

    return createJsonResponse({
      success: false,
      message: 'Action POST tidak dikenali: ' + action
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: 'Gagal memproses data di Google Apps Script: ' + String(err)
    });
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function formatHeaderRow(sheet, columnCount) {
  const headerRange = sheet.getRange(1, 1, 1, columnCount);
  headerRange
    .setBackground('#1C140F')
    .setFontColor('#D4AF37')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  for (let c = 1; c <= columnCount; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Jalankan fungsi ini 1x untuk mengisi Spreadsheet yang masih kosong
 */
function setupDatabaseSheets() {
  const ss = getWeddingSpreadsheet();

  // 1. Sheet Tamu (Daftar PIN & Nama Tamu)
  let sheetTamu = ss.getSheetByName(SHEET_TAMU);
  if (!sheetTamu) {
    sheetTamu = ss.insertSheet(SHEET_TAMU);
    sheetTamu.appendRow([
      'PIN',
      'Nama Tamu',
      'Asal / Keterangan',
      'Kategori',
      'Kuota Maksimal',
      'Status Buka',
      'Waktu Buka Terakhir'
    ]);

    const initialGuests = [
      ['123456', 'Bapak Budi Santoso & Keluarga', 'Jakarta Selatan', 'VIP / Kehormatan', 3, 'Belum Membuka', '-'],
      ['ULFA01', 'Dinda Permatasari & Partner', 'Sahabat Mempelai Wanita', 'Sahabat & Kolega', 2, 'Belum Membuka', '-'],
      ['ULFA02', 'Keluarga Besar Bapak H. Hendra Gunawan', 'Bandung', 'Keluarga Besar', 4, 'Belum Membuka', '-'],
      ['DIMAS1', 'Rizky Pratama & Istri', 'Rekan Kerja Mempelai Pria', 'Sahabat & Kolega', 2, 'Belum Membuka', '-'],
      ['112233', 'Ibu Hj. Ratna Sari Dewi', 'Yogyakarta', 'Keluarga Besar', 2, 'Belum Membuka', '-'],
      ['223344', 'Andi Wijaya, S.T. & Partner', 'Surabaya', 'VIP / Kehormatan', 2, 'Belum Membuka', '-']
    ];

    initialGuests.forEach(function(row) {
      sheetTamu.appendRow(row);
    });
    formatHeaderRow(sheetTamu, 7);
  }

  // 2. Sheet RSVP
  let sheetRsvp = ss.getSheetByName(SHEET_RSVP);
  if (!sheetRsvp) {
    sheetRsvp = ss.insertSheet(SHEET_RSVP);
    sheetRsvp.appendRow([
      'Timestamp',
      'PIN',
      'Nama Tamu',
      'Status Kehadiran',
      'Jumlah Hadir',
      'Sesi Acara',
      'Catatan Tambahan'
    ]);
    formatHeaderRow(sheetRsvp, 7);
  }

  // 3. Sheet WeddingGift
  let sheetGift = ss.getSheetByName(SHEET_GIFT);
  if (!sheetGift) {
    sheetGift = ss.insertSheet(SHEET_GIFT);
    sheetGift.appendRow([
      'Timestamp',
      'PIN',
      'Nama Pengirim',
      'Rekening Bank / Metode Tujuan',
      'Nominal Transfer / Jenis Kado',
      'Pesan Konfirmasi',
      'Status Verifikasi'
    ]);
    formatHeaderRow(sheetGift, 7);
  }

  // 4. Sheet Ucapan
  let sheetUcapan = ss.getSheetByName(SHEET_UCAPAN);
  if (!sheetUcapan) {
    sheetUcapan = ss.insertSheet(SHEET_UCAPAN);
    sheetUcapan.appendRow([
      'Timestamp',
      'PIN',
      'Nama Pengirim',
      'Status Kehadiran',
      'Isi Ucapan'
    ]);

    const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy · HH:mm') + ' WIB';
    sheetUcapan.appendRow([
      nowStr,
      '123456',
      'Bapak Budi Santoso & Keluarga',
      'Hadir',
      'Selamat menempuh hidup baru untuk Ulfa Azizah dan Dimas. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.'
    ]);
    sheetUcapan.appendRow([
      nowStr,
      'ULFA01',
      'Dinda Permatasari & Partner',
      'Hadir',
      'Happy wedding Ulfa & Mas Dimas! Lancar sampai hari H ya, semoga bahagia selalu dan langgeng selamanya.'
    ]);
    formatHeaderRow(sheetUcapan, 5);
  }

  const defaultSheet1 = ss.getSheetByName('Sheet1');
  if (defaultSheet1 && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet1);
    } catch (e) {}
  }
}

function ensureSheetsExist() {
  const ss = getWeddingSpreadsheet();
  if (!ss.getSheetByName(SHEET_TAMU)) {
    setupDatabaseSheets();
  }
}

function verifyGuestPin(inputPin) {
  const cleanPin = String(inputPin || '').trim().toUpperCase();
  if (!cleanPin) {
    return {
      success: false,
      message: 'Silakan masukkan kode PIN undangan Anda terlebih dahulu.'
    };
  }

  const ss = getWeddingSpreadsheet();
  let sheetTamu = ss.getSheetByName(SHEET_TAMU);
  if (!sheetTamu) {
    setupDatabaseSheets();
    sheetTamu = ss.getSheetByName(SHEET_TAMU);
  }

  const data = sheetTamu.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowPin = String(data[i][0] || '').trim().toUpperCase();
    if (rowPin === cleanPin) {
      const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy HH:mm') + ' WIB';
      sheetTamu.getRange(i + 1, 6).setValue('Sudah Membuka');
      sheetTamu.getRange(i + 1, 7).setValue(nowStr);

      return {
        success: true,
        guest: {
          pin: rowPin,
          namaTamu: String(data[i][1] || ''),
          gelarAtauInstansi: String(data[i][2] || ''),
          kategori: String(data[i][3] || 'Tamu Undangan'),
          kuotaMaksimal: Number(data[i][4] || 2)
        },
        wishes: getPublicWishes()
      };
    }
  }

  return {
    success: false,
    message: 'Kode PIN tidak ditemukan. Pastikan kode PIN sesuai dengan undangan Anda.'
  };
}

function submitRsvp(payload) {
  const ss = getWeddingSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RSVP);
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName(SHEET_RSVP);
  }

  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy HH:mm') + ' WIB';
  sheet.appendRow([
    nowStr,
    payload.pin || '-',
    payload.namaTamu || '-',
    payload.statusKehadiran || 'Hadir',
    Number(payload.jumlahHadir || 1),
    payload.sesiAcara || 'Akad Nikah & Resepsi Pernikahan',
    payload.catatan || '-'
  ]);

  return {
    success: true,
    timestamp: nowStr,
    message: 'Terima kasih ' + (payload.namaTamu || '') + ', konfirmasi kehadiran (RSVP) Anda telah tercatat.'
  };
}

function submitGiftConfirmation(payload) {
  const ss = getWeddingSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_GIFT);
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName(SHEET_GIFT);
  }

  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy HH:mm') + ' WIB';
  sheet.appendRow([
    nowStr,
    payload.pin || '-',
    payload.namaPengirim || '-',
    payload.metodeTujuan || '-',
    payload.nominalAtauBarang || '-',
    payload.pesanKonfirmasi || '-',
    'Terkonfirmasi'
  ]);

  return {
    success: true,
    timestamp: nowStr,
    message: 'Terima kasih banyak, konfirmasi pengiriman tanda kasih Anda telah diterima.'
  };
}

function submitWish(payload) {
  const ss = getWeddingSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_UCAPAN);
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName(SHEET_UCAPAN);
  }

  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd MMM yyyy · HH:mm') + ' WIB';
  sheet.appendRow([
    nowStr,
    payload.pin || '-',
    payload.namaPengirim || 'Tamu Undangan',
    payload.statusKehadiran || 'Hadir',
    payload.isiUcapan || ''
  ]);

  return {
    success: true,
    wishes: getPublicWishes()
  };
}

function getPublicWishes() {
  const ss = getWeddingSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_UCAPAN);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  const list = [];
  for (let i = rows.length - 1; i >= 1; i--) {
    list.push({
      timestamp: String(rows[i][0] || ''),
      pin: String(rows[i][1] || ''),
      namaPengirim: String(rows[i][2] || ''),
      statusKehadiran: String(rows[i][3] || 'Hadir'),
      isiUcapan: String(rows[i][4] || '')
    });
  }
  return list;
}

/**
 * Mengambil foto dari Google Drive berdasarkan File ID (contoh: 1PM-8RFPofVmOZYpsXB1R4lceNVBrNqip)
 * agar selalu tampil meskipun dibuka di berbagai browser.
 */
function getDrivePhotoDataUrl(fileId) {
  try {
    const cleanId = String(fileId || '1PM-8RFPofVmOZYpsXB1R4lceNVBrNqip').trim();
    const file = DriveApp.getFileById(cleanId);
    const blob = file.getBlob();
    const b64 = Utilities.base64Encode(blob.getBytes());
    return {
      success: true,
      dataUrl: 'data:' + blob.getContentType() + ';base64,' + b64
    };
  } catch (err) {
    return {
      success: false,
      message: String(err)
    };
  }
}

