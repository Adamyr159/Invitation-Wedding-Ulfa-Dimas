import {
  BankAccountInfo,
  GalleryPhoto,
  GiftConfirmationEntry,
  GuestEntry,
  RsvpEntry,
  WeddingConfig,
  WishEntry,
} from '../types/wedding';

export const INITIAL_WEDDING_CONFIG: WeddingConfig = {
  namaPanggilanWanita: 'Ulfa Azizah',
  namaLengkapWanita: 'Ulfa Azizah, S.Psi.',
  putriDariWanita: 'Putri Pertama dari Bapak H. Ahmad Fauzi & Ibu Hj. Siti Rahmawati',
  namaPanggilanPria: 'Dimas',
  namaLengkapPria: 'Dimas, S.Kom.',
  putraDariPria: 'Putra Kedua dari Bapak Ir. Bambang Suryono & Ibu Hj. Endang Sulastri',
  tanggalAcaraISO: '2027-02-14T08:00:00+07:00',
  tanggalTeksJawa: 'Minggu Pahing',
  tanggalTeksMasehi: 'Minggu, 14 Februari 2027',
  waktuAkad: '08.00 – 10.00 WIB',
  waktuPanggih: '10.00 – 11.00 WIB',
  waktuResepsi: '11.00 – 14.00 WIB',
  namaTempat: 'Pendopo Agung Royal Ambarrukmo',
  alamatTempat: 'Jl. Laksda Adisucipto No. 81, Caturtunggal, Depok, Sleman, Yogyakarta',
  googleMapsUrl: 'https://maps.google.com/?q=Pendopo+Agung+Royal+Ambarrukmo+Yogyakarta',
  alamatKirimKado: 'Jl. Raya Lenteng Agung Gg.H.Tohir RT 004/005 No.44 Jagakarsa, Jakarta Selatan',
  kutipanJawa:
    'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
  artiKutipanJawa: 'QS. Ar-Rum : 21',
};

export interface LoveStoryItem {
  id: string;
  phase: string;
  period: string;
  title: string;
  story: string;
}

export const LOVE_STORY_ITEMS: LoveStoryItem[] = [
  {
    id: 'story-1',
    phase: 'Babak 01',
    period: 'Oktober 2022',
    title: 'Awal Bertemu',
    story:
      'Oktober 2022 Menjadi awal dari sebuah cerita sederhana yang tak pernah kami sangka akan sejauh ini. Berawal dari pertemuan di kampus yang sama, dua orang yang sebelumnya asing perlahan saling mengenal. Dari sapaan sederhana, tumbuh percakapan, kedekatan, hingga rasa yang semakin bermakna.',
  },
  {
    id: 'story-2',
    phase: 'Babak 02',
    period: 'Agustus 2026',
    title: 'Tunangan',
    story:
      'Bulan Agustus 2026 Waktu membawa kami melewati berbagai cerita, mengajarkan arti saling memahami, bertahan, dan tumbuh bersama. Hingga akhirnya, bulan ini menjadi babak baru dalam perjalanan kami. Dengan niat baik dan restu keluarga kami mengikat janji untuk Tunangan.',
  },
  {
    id: 'story-3',
    phase: 'Babak 03',
    period: 'Menuju Ikatan Suci',
    title: 'Menikah',
    story:
      'Kini, dengan niat yang sama dan doa yang menyertai, kami memilih untuk menyempurnakan perjalanan ini dalam ikatan suci pernikahan. Sebagai awal baru untuk berbagi hidup, tumbuh dan menua bersama.',
  },
];

export const INITIAL_GUESTS: GuestEntry[] = [
  {
    pin: '123456',
    namaTamu: 'Bapak Budi Santoso & Keluarga',
    gelarAtauInstansi: 'Jakarta Selatan',
    kategori: 'VIP / Kehormatan',
    kuotaMaksimal: 3,
    statusBuka: 'Sudah Membuka',
    waktuBukaTerakhir: '2026-11-07 09:15 WIB',
  },
  {
    pin: 'ULFA01',
    namaTamu: 'Dinda Permatasari & Partner',
    gelarAtauInstansi: 'Sahabat Mempelai Wanita',
    kategori: 'Sahabat & Kolega',
    kuotaMaksimal: 2,
    statusBuka: 'Sudah Membuka',
    waktuBukaTerakhir: '2026-11-07 10:30 WIB',
  },
  {
    pin: 'ULFA02',
    namaTamu: 'Keluarga Besar Bapak H. Hendra Gunawan',
    gelarAtauInstansi: 'Bandung',
    kategori: 'Keluarga Besar',
    kuotaMaksimal: 4,
    statusBuka: 'Belum Membuka',
  },
  {
    pin: 'DIMAS1',
    namaTamu: 'Rizky Pratama & Istri',
    gelarAtauInstansi: 'Rekan Kerja Mempelai Pria',
    kategori: 'Sahabat & Kolega',
    kuotaMaksimal: 2,
    statusBuka: 'Sudah Membuka',
    waktuBukaTerakhir: '2026-11-07 11:05 WIB',
  },
  {
    pin: '112233',
    namaTamu: 'Ibu Hj. Ratna Sari Dewi',
    gelarAtauInstansi: 'Yogyakarta',
    kategori: 'Keluarga Besar',
    kuotaMaksimal: 2,
    statusBuka: 'Belum Membuka',
  },
  {
    pin: '223344',
    namaTamu: 'Andi Wijaya, S.T. & Partner',
    gelarAtauInstansi: 'Surabaya',
    kategori: 'VIP / Kehormatan',
    kuotaMaksimal: 2,
    statusBuka: 'Belum Membuka',
  },
];

export const INITIAL_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    id: 'bank-mandiri-ulfa',
    namaBank: 'Bank Mandiri',
    nomorRekening: '1270014138570',
    atasNama: 'ULFA AZIZAH',
    cabangAtauKeterangan: 'Rekening Mempelai Wanita',
  },
  {
    id: 'bank-mandiri-adimas',
    namaBank: 'Bank Mandiri',
    nomorRekening: '1270015507799',
    atasNama: 'ADIMAS NOPIYANTO',
    cabangAtauKeterangan: 'Rekening Mempelai Pria',
  },
];

export const DRIVE_PHOTO_IDS = {
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
    '1Qipk7crILX40rblYqBwZvCJS-jJgKzcF',
  ],
};

// Ukuran default w600 membuat ukuran file gambar 10x lebih ringan (~45KB) sehingga loading sangat cepat
export function getDriveThumbnailUrl(driveId: string, size: 'w600' | 'w800' | 'w1000' | 'w1200' = 'w600'): string {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId.trim())}&sz=${size}`;
}

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [
  ...DRIVE_PHOTO_IDS.keduaMempelai.map((driveId, idx): GalleryPhoto => ({
    id: `gal-couple-${idx + 1}`,
    title: `Ulfa Azizah & Dimas · Potret ${String(idx + 1).padStart(2, '0')}`,
    subtitle: 'Galeri Pre-Wedding Kedua Mempelai',
    category: idx === 0 ? 'Potret Utama' : 'Kedua Mempelai',
    imageUrl: getDriveThumbnailUrl(driveId, 'w600'),
    aspectClass: idx % 5 === 0 ? 'wide' : idx % 3 === 0 ? 'tall' : 'standard',
    story:
      'Potret kebersamaan Ulfa Azizah dan Dimas dalam sesi foto pre-wedding adat Jawa klasik.',
  })),
  {
    id: 'gal-bride',
    title: 'Pesona Anggun Mempelai Wanita',
    subtitle: 'Ulfa Azizah, S.Psi.',
    category: 'Mempelai Wanita',
    imageUrl: getDriveThumbnailUrl(DRIVE_PHOTO_IDS.mempelaiWanita, 'w600'),
    aspectClass: 'tall',
    story:
      'Potret anggun mempelai wanita Ulfa Azizah dalam balutan busana pengantin klasik.',
  },
  {
    id: 'gal-groom',
    title: 'Keteguhan Hati Mempelai Pria',
    subtitle: 'Dimas, S.Kom.',
    category: 'Mempelai Pria',
    imageUrl: getDriveThumbnailUrl(DRIVE_PHOTO_IDS.mempelaiPria, 'w600'),
    aspectClass: 'tall',
    story:
      'Potret mempelai pria Dimas dalam balutan busana adat Jawa klasik.',
  },
];

export const INITIAL_RSVP_LIST: RsvpEntry[] = [
  {
    id: 'rsvp-1',
    timestamp: '07 Nov 2026, 09:20 WIB',
    pin: '123456',
    namaTamu: 'Bapak Budi Santoso & Keluarga',
    statusKehadiran: 'Hadir',
    jumlahHadir: 2,
    sesiAcara: 'Akad, Panggih & Pahargyan Agung',
    catatan: 'InsyaAllah hadir tepat waktu bersama istri.',
  },
  {
    id: 'rsvp-2',
    timestamp: '07 Nov 2026, 10:35 WIB',
    pin: 'ULFA01',
    namaTamu: 'Dinda Permatasari & Partner',
    statusKehadiran: 'Hadir',
    jumlahHadir: 2,
    sesiAcara: 'Pahargyan Agung (Resepsi)',
    catatan: 'Siap hadir meramaikan hari bahagia Ulfa & Dimas!',
  },
];

export const INITIAL_GIFT_CONFIRMATIONS: GiftConfirmationEntry[] = [
  {
    id: 'gift-1',
    timestamp: '07 Nov 2026, 09:25 WIB',
    pin: '123456',
    namaPengirim: 'Bapak Budi Santoso & Keluarga',
    metodeTujuan: 'Bank Mandiri (1370098765432)',
    nominalAtauBarang: 'Rp 1.000.000',
    pesanKonfirmasi: 'Selamat menempuh hidup baru untuk Ulfa & Dimas, semoga berkah selalu.',
    statusVerifikasi: 'Terkonfirmasi',
  },
];

export const INITIAL_WISHES: WishEntry[] = [
  {
    id: 'wish-1',
    timestamp: '07 Nov 2026 · 09:22 WIB',
    pin: '123456',
    namaPengirim: 'Bapak Budi Santoso & Keluarga',
    statusKehadiran: 'Hadir',
    isiUcapan:
      'Selamat menempuh hidup baru untuk Ulfa Azizah dan Dimas. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah, serta selalu diberikan kebahagiaan dunia dan akhirat.',
  },
  {
    id: 'wish-2',
    timestamp: '07 Nov 2026 · 10:38 WIB',
    pin: 'ULFA01',
    namaPengirim: 'Dinda Permatasari & Partner',
    statusKehadiran: 'Hadir',
    isiUcapan:
      'Happy wedding Ulfa sayang & Mas Dimas! Lancar sampai hari H ya, semoga selalu kompak, saling melengkapi, dan lekas diberikan momongan yang lucu dan saleh.',
  },
  {
    id: 'wish-3',
    timestamp: '07 Nov 2026 · 11:12 WIB',
    pin: 'DIMAS1',
    namaPengirim: 'Rizky Pratama & Istri',
    statusKehadiran: 'Hadir',
    isiUcapan:
      'Selamat berbahagia bro Dimas & Mbak Ulfa! Semoga pernikahannya penuh berkah, rezekinya makin lancar, dan langgeng sampai kakek nenek.',
  },
];
