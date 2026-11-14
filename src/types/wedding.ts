export interface GuestEntry {
  pin: string;
  namaTamu: string;
  gelarAtauInstansi: string;
  kategori: 'Keluarga Keraton' | 'VIP / Kehormatan' | 'Sahabat & Kolega' | 'Keluarga Besar';
  kuotaMaksimal: number;
  statusBuka: 'Sudah Membuka' | 'Belum Membuka';
  waktuBukaTerakhir?: string;
}

export interface RsvpEntry {
  id: string;
  timestamp: string;
  pin: string;
  namaTamu: string;
  statusKehadiran: 'Hadir' | 'Berhalangan';
  jumlahHadir: number;
  sesiAcara: 'Akad, Panggih & Pahargyan Agung' | 'Pahargyan Agung (Resepsi)' | 'Akad & Panggih Saja';
  catatan: string;
}

export interface GiftConfirmationEntry {
  id: string;
  timestamp: string;
  pin: string;
  namaPengirim: string;
  metodeTujuan: string;
  nominalAtauBarang: string;
  pesanKonfirmasi: string;
  statusVerifikasi: 'Terkonfirmasi' | 'Menunggu Verifikasi';
}

export interface WishEntry {
  id: string;
  timestamp: string;
  pin: string;
  namaPengirim: string;
  statusKehadiran: 'Hadir' | 'Berhalangan';
  isiUcapan: string;
}

export interface BankAccountInfo {
  id: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  cabangAtauKeterangan: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  aspectClass: 'wide' | 'tall' | 'standard';
  story: string;
}

export interface WeddingConfig {
  namaPanggilanWanita: string;
  namaLengkapWanita: string;
  putriDariWanita: string;
  namaPanggilanPria: string;
  namaLengkapPria: string;
  putraDariPria: string;
  tanggalAcaraISO: string;
  tanggalTeksJawa: string;
  tanggalTeksMasehi: string;
  waktuAkad: string;
  waktuPanggih: string;
  waktuResepsi: string;
  namaTempat: string;
  alamatTempat: string;
  googleMapsUrl: string;
  alamatKirimKado: string;
  kutipanJawa: string;
  artiKutipanJawa: string;
}
