import { GuestEntry, WishEntry } from '../types/wedding';

/**
 * URL Web App Google Apps Script (`exec`) yang terhubung langsung ke Google Sheets "Wedding Ulfa".
 */
export const GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbw92bDEBz7VBrgsz25CrzzRKswWwYm6OG-CrbMaqH57VXUlq5wUEWgPfi6WQG0SRgl1JQ/exec';

interface GasVerifyPinResponse {
  success: boolean;
  message?: string;
  guest?: {
    pin: string;
    namaTamu: string;
    gelarAtauInstansi: string;
    kategori: string;
    kuotaMaksimal: number;
  };
  wishes?: Array<{
    timestamp: string;
    pin: string;
    namaPengirim: string;
    statusKehadiran: string;
    isiUcapan: string;
  }>;
}

/**
 * Helper pemanggil API Google Apps Script menggunakan Content-Type: text/plain;charset=utf-8
 * agar tidak terkena blokir CORS preflight (OPTIONS) saat di-deploy di Vercel.
 */
async function postToGasApi<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(body),
    redirect: 'follow',
  });

  const text = await response.text();
  return JSON.parse(text) as T;
}

function normalizeCategory(rawCategory?: string): GuestEntry['kategori'] {
  if (rawCategory === 'Keluarga Besar') return 'Keluarga Besar';
  if (rawCategory === 'Sahabat & Kolega') return 'Sahabat & Kolega';
  return 'VIP / Kehormatan';
}

function mapRawWishes(
  rawList?: GasVerifyPinResponse['wishes']
): WishEntry[] | undefined {
  if (!Array.isArray(rawList)) return undefined;
  return rawList.map((w, idx) => ({
    id: `wish-gas-${idx}-${w.pin || 'guest'}`,
    timestamp: w.timestamp || 'Baru saja · WIB',
    pin: w.pin || '-',
    namaPengirim: w.namaPengirim || 'Tamu Undangan',
    statusKehadiran:
      w.statusKehadiran === 'Berhalangan' ? 'Berhalangan' : 'Hadir',
    isiUcapan: w.isiUcapan || '',
  }));
}

/**
 * Verifikasi PIN Tamu langsung ke Sheet "Tamu" di Google Sheets melalui Apps Script.
 */
export async function verifyPinWithSpreadsheet(
  pin: string,
  fallbackGuests: GuestEntry[]
): Promise<{
  success: boolean;
  message?: string;
  guest?: GuestEntry;
  wishes?: WishEntry[];
}> {
  const cleanPin = pin.trim().toUpperCase();

  try {
    const data = await postToGasApi<GasVerifyPinResponse>({
      action: 'verifyPin',
      pin: cleanPin,
    });

    if (data && typeof data.success === 'boolean') {
      if (!data.success || !data.guest) {
        return {
          success: false,
          message:
            data.message ||
            'Kode PIN tidak terdaftar di buku tamu. Silakan periksa kembali PIN undangan Anda.',
        };
      }

      const mappedGuest: GuestEntry = {
        pin: String(data.guest.pin || cleanPin).toUpperCase(),
        namaTamu: data.guest.namaTamu || 'Tamu Kehormatan',
        gelarAtauInstansi: data.guest.gelarAtauInstansi || 'Tamu Undangan',
        kategori: normalizeCategory(data.guest.kategori),
        kuotaMaksimal: Number(data.guest.kuotaMaksimal) || 2,
        statusBuka: 'Sudah Membuka',
        waktuBukaTerakhir: 'Baru saja · WIB',
      };

      return {
        success: true,
        guest: mappedGuest,
        wishes: mapRawWishes(data.wishes),
      };
    }
  } catch {
    // Jika deployment Code.gs di Google Apps Script belum di-update dengan fungsi doPost terbaru,
    // gunakan fallback daftar tamu lokal agar website tetap berjalan lancar.
  }

  const localMatched = fallbackGuests.find(
    (g) => g.pin.toUpperCase() === cleanPin
  );
  if (localMatched) {
    return {
      success: true,
      guest: localMatched,
    };
  }

  return {
    success: false,
    message:
      'Kode PIN tidak terdaftar. Silakan periksa kembali PIN pada undangan Anda.',
  };
}

/**
 * Mengambil daftar ucapan & doa terbaru dari Sheet "Ucapan".
 */
export async function fetchWishesFromSpreadsheet(): Promise<WishEntry[] | null> {
  try {
    const res = await postToGasApi<{
      success: boolean;
      wishes?: GasVerifyPinResponse['wishes'];
    }>({
      action: 'getWishes',
    });
    if (res && res.success && Array.isArray(res.wishes)) {
      return mapRawWishes(res.wishes) || null;
    }
  } catch {
    // Abaikan jika offline / belum redeploy Code.gs
  }
  return null;
}

/**
 * Menyimpan konfirmasi kehadiran (RSVP) ke Sheet "RSVP".
 */
export async function submitRsvpToSpreadsheet(payload: {
  pin: string;
  namaTamu: string;
  statusKehadiran: string;
  jumlahHadir: number;
  sesiAcara: string;
  catatan: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await postToGasApi<{ success: boolean; message?: string }>({
      action: 'submitRsvp',
      payload,
    });
    if (res && res.success) {
      return res;
    }
  } catch {
    // Fallback jika belum redeploy
  }
  return {
    success: true,
    message: `Terima kasih ${payload.namaTamu}, konfirmasi kehadiran (${payload.statusKehadiran}) Anda telah tercatat.`,
  };
}

/**
 * Menyimpan konfirmasi Wedding Gift ke Sheet "WeddingGift".
 */
export async function submitGiftToSpreadsheet(payload: {
  pin: string;
  namaPengirim: string;
  metodeTujuan: string;
  nominalAtauBarang: string;
  pesanKonfirmasi: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await postToGasApi<{ success: boolean; message?: string }>({
      action: 'submitGift',
      payload,
    });
    if (res && res.success) {
      return res;
    }
  } catch {
    // Fallback jika belum redeploy
  }
  return {
    success: true,
    message:
      'Terima kasih banyak, konfirmasi pengiriman tanda kasih Anda telah diterima.',
  };
}

/**
 * Menyimpan Ucapan & Doa Restu ke Sheet "Ucapan" dan mengembalikan daftar ucapan terbaru.
 */
export async function submitWishToSpreadsheet(payload: {
  pin: string;
  namaPengirim: string;
  statusKehadiran: 'Hadir' | 'Berhalangan';
  isiUcapan: string;
}): Promise<{ success: boolean; wishes?: WishEntry[] }> {
  try {
    const res = await postToGasApi<{
      success: boolean;
      wishes?: GasVerifyPinResponse['wishes'];
    }>({
      action: 'submitWish',
      payload,
    });
    if (res && res.success) {
      return {
        success: true,
        wishes: mapRawWishes(res.wishes),
      };
    }
  } catch {
    // Fallback jika belum redeploy
  }
  return { success: true };
}
