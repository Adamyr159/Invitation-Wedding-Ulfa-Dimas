/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Copy,
  Check,
  Send,
  Gift,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  GalleryPhoto,
  GiftConfirmationEntry,
  GuestEntry,
  RsvpEntry,
  WeddingConfig,
  WishEntry,
} from './types/wedding';
import {
  DRIVE_PHOTO_IDS,
  getDriveThumbnailUrl,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_GIFT_CONFIRMATIONS,
  INITIAL_GUESTS,
  INITIAL_RSVP_LIST,
  INITIAL_WEDDING_CONFIG,
  INITIAL_WISHES,
  LOVE_STORY_ITEMS,
} from './data/initialWeddingData';
import { weddingMusic } from './utils/weddingMusicPlayer';
import {
  fetchWishesFromSpreadsheet,
  submitGiftToSpreadsheet,
  submitRsvpToSpreadsheet,
  submitWishToSpreadsheet,
} from './services/gasApi';
import { GununganCrest, JavaneseSectionDivider } from './components/JavaneseOrnaments';
import {
  PinGateModal,
  WeddingColorTheme,
  SakuraPetalShower,
  SakuraFloralCluster,
  JOGLO_HALL_BG,
  JOGLO_HALL_FALLBACK,
  COUPLE_DRIVE_PHOTO,
  COUPLE_DRIVE_FALLBACK,
} from './components/PinGateModal';

export default function App() {
  const [config] = useState<WeddingConfig>(INITIAL_WEDDING_CONFIG);
  const [guests, setGuests] = useState<GuestEntry[]>(INITIAL_GUESTS);
  const [, setRsvps] = useState<RsvpEntry[]>(INITIAL_RSVP_LIST);
  const [, setGifts] = useState<GiftConfirmationEntry[]>(INITIAL_GIFT_CONFIRMATIONS);
  const [wishes, setWishes] = useState<WishEntry[]>(INITIAL_WISHES);

  // 'locked' -> Cover & PIN Input | 'opening' -> Pintu Gerbang 3D membuka di atas Halaman Utama | 'unlocked' -> Gerbang selesai terbuka & halaman bebas di-scroll
  const [activeGuest, setActiveGuest] = useState<GuestEntry>(INITIAL_GUESTS[0]);
  const [gateState, setGateState] = useState<'locked' | 'opening' | 'unlocked'>('locked');
  const [colorTheme] = useState<WeddingColorTheme>('maroon-ivory');

  // Ref penanda agar preload galeri dijalankan tepat 1x setelah Gambar 2 (Hero) selesai dimuat
  const hasPreloadedGalleryRef = useRef<boolean>(false);

  // Fungsi preload seluruh foto mempelai & galeri secara bertahap (ringan & tidak membebani jaringan sekaligus)
  const triggerGalleryPreloadAfterHero = useCallback(() => {
    if (hasPreloadedGalleryRef.current) return;
    hasPreloadedGalleryRef.current = true;

    const urlsToPreload = [
      getDriveThumbnailUrl(DRIVE_PHOTO_IDS.mempelaiWanita, 'w800'),
      getDriveThumbnailUrl(DRIVE_PHOTO_IDS.mempelaiPria, 'w800'),
      getDriveThumbnailUrl(DRIVE_PHOTO_IDS.bgRsvp, 'w1000'),
      getDriveThumbnailUrl(DRIVE_PHOTO_IDS.bgUcapan, 'w1000'),
      ...INITIAL_GALLERY_PHOTOS.map((p) => p.imageUrl),
    ];

    let cursor = 0;
    const loadNextBatch = () => {
      const batch = urlsToPreload.slice(cursor, cursor + 3);
      cursor += 3;
      if (batch.length === 0) return;

      let finishedInBatch = 0;
      const checkDone = () => {
        finishedInBatch += 1;
        if (finishedInBatch >= batch.length) {
          window.setTimeout(loadNextBatch, 60);
        }
      };

      batch.forEach((url) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = checkDone;
        img.onerror = checkDone;
        img.src = url;
      });
    };

    loadNextBatch();
  }, []);

  // Countdown timer state
  const [countdown, setCountdown] = useState({ days: '98', hours: '08', mins: '45', secs: '12' });

  // Gallery Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // RSVP Form state
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Berhalangan'>('Hadir');
  const [rsvpCount, setRsvpCount] = useState<number>(2);
  const [rsvpSession, setRsvpSession] = useState<RsvpEntry['sesiAcara']>(
    'Akad, Panggih & Pahargyan Agung'
  );
  const [rsvpNotes, setRsvpNotes] = useState<string>('');
  const [rsvpSubmittedMsg, setRsvpSubmittedMsg] = useState<string>('');

  // Wedding Gift Confirmation Form state
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [giftSender, setGiftSender] = useState<string>(INITIAL_GUESTS[0].namaTamu);
  const [giftMethod, setGiftMethod] = useState<string>(
    `${INITIAL_BANK_ACCOUNTS[0].namaBank} - ${INITIAL_BANK_ACCOUNTS[0].nomorRekening} (${INITIAL_BANK_ACCOUNTS[0].atasNama})`
  );
  const [giftAmount, setGiftAmount] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [giftSubmittedMsg, setGiftSubmittedMsg] = useState<string>('');

  // Wishes Form & Filter state
  const [wishSender, setWishSender] = useState<string>(INITIAL_GUESTS[0].namaTamu);
  const [wishStatus, setWishStatus] = useState<'Hadir' | 'Berhalangan'>('Hadir');
  const [wishContent, setWishContent] = useState<string>('');
  const [wishFilter, setWishFilter] = useState<'all' | 'Hadir' | 'Berhalangan'>('all');
  const [wishSubmittedMsg, setWishSubmittedMsg] = useState<string>('');

  // Sync forms whenever activeGuest changes
  useEffect(() => {
    setGiftSender(activeGuest.namaTamu);
    setWishSender(activeGuest.namaTamu);
    setRsvpCount(Math.min(2, activeGuest.kuotaMaksimal));
  }, [activeGuest]);

  // Real-time countdown timer
  useEffect(() => {
    const targetTime = new Date(config.tanggalAcaraISO).getTime();
    const updateTimer = () => {
      const diff = Math.max(0, targetTime - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        mins: String(m).padStart(2, '0'),
        secs: String(s).padStart(2, '0'),
      });
    };
    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [config.tanggalAcaraISO]);

  // Ambil daftar doa & ucapan dari Google Sheets saat halaman dimuat
  useEffect(() => {
    fetchWishesFromSpreadsheet().then((remoteWishes) => {
      if (remoteWishes && remoteWishes.length > 0) {
        setWishes(remoteWishes);
      }
    });
  }, []);

  // Saat PIN sukses -> Langsung render Halaman Utama di belakang gerbang & ayunkan Pintu Gerbang 3D membuka!
  const handleStartGateOpen = (guest: GuestEntry, remoteWishes?: WishEntry[]) => {
    const nowFormatted = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setGuests((prev) => {
      const exists = prev.some((item) => item.pin === guest.pin);
      if (!exists) {
        return [guest, ...prev];
      }
      return prev.map((item) =>
        item.pin === guest.pin
          ? {
              ...item,
              statusBuka: 'Sudah Membuka',
              waktuBukaTerakhir: `Hari ini, ${nowFormatted} WIB`,
            }
          : item
      );
    });
    if (remoteWishes && remoteWishes.length > 0) {
      setWishes(remoteWishes);
    }
    setActiveGuest(guest);
    setGateState('opening');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // Langsung putar lagu "A Thousand Years" secara otomatis tanpa tombol on/off
    weddingMusic.start();

    // Setelah daun pintu gerbang 3D selesai berayun terbuka secara mulus (~3.65 detik), lepaskan overlay gerbang
    window.setTimeout(() => {
      setGateState('unlocked');
    }, 3700);
  };

  // Live Scroll-Following Journey State ("Masuk ke Sebuah Perjalanan / Dunia Lain")
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [scrollYPos, setScrollYPos] = useState<number>(0);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(0);

  const JOURNEY_STOPS = [
    { id: 'hero', label: '01 · Pelaminan Sapaan' },
    { id: 'mempelai', label: '02 · Mempelai & Acara' },
    { id: 'love-story', label: '03 · Love Story' },
    { id: 'galeri', label: '04 · Galeri Momen' },
    { id: 'rsvp', label: '05 · Konfirmasi RSVP' },
    { id: 'wedding-gift', label: '06 · Tanda Kasih' },
    { id: 'ucapan', label: '07 · Doa & Restu' },
  ];

  useEffect(() => {
    if (gateState === 'locked') return;
    const handleScroll = () => {
      const y = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (y / maxScroll) * 100));
      setScrollYPos(y);
      setScrollProgress(pct);

      const stepIdx = Math.min(
        JOURNEY_STOPS.length - 1,
        Math.floor((pct / 100) * JOURNEY_STOPS.length)
      );
      setActiveJourneyStep(stepIdx);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [gateState]);

  const handleCopyAccount = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = 'Baru saja · WIB';
    const currentNotes = rsvpNotes.trim() || '-';
    const newEntry: RsvpEntry = {
      id: `rsvp-${Date.now()}`,
      timestamp: nowStr,
      pin: activeGuest.pin,
      namaTamu: activeGuest.namaTamu,
      statusKehadiran: rsvpStatus,
      jumlahHadir: rsvpStatus === 'Hadir' ? rsvpCount : 0,
      sesiAcara: rsvpSession,
      catatan: currentNotes,
    };
    setRsvps((prev) => [newEntry, ...prev]);
    setRsvpSubmittedMsg('Menyimpan konfirmasi kehadiran ke buku tamu...');
    setRsvpNotes('');

    const res = await submitRsvpToSpreadsheet({
      pin: activeGuest.pin,
      namaTamu: activeGuest.namaTamu,
      statusKehadiran: rsvpStatus,
      jumlahHadir: rsvpStatus === 'Hadir' ? rsvpCount : 0,
      sesiAcara: rsvpSession,
      catatan: currentNotes,
    });

    setRsvpSubmittedMsg(
      res.message ||
        `Terima kasih ${activeGuest.namaTamu}, konfirmasi kehadiran (${rsvpStatus}) Anda telah tercatat.`
    );
    setTimeout(() => setRsvpSubmittedMsg(''), 6000);
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftAmount.trim()) return;
    const nowStr = 'Baru saja · WIB';
    const senderVal = giftSender.trim() || activeGuest.namaTamu;
    const amountVal = giftAmount.trim();
    const msgVal = giftMessage.trim() || 'Tanda kasih pernikahan.';

    const newGift: GiftConfirmationEntry = {
      id: `gift-${Date.now()}`,
      timestamp: nowStr,
      pin: activeGuest.pin,
      namaPengirim: senderVal,
      metodeTujuan: giftMethod,
      nominalAtauBarang: amountVal,
      pesanKonfirmasi: msgVal,
      statusVerifikasi: 'Terkonfirmasi',
    };
    setGifts((prev) => [newGift, ...prev]);
    setGiftAmount('');
    setGiftMessage('');
    setGiftSubmittedMsg('Menyimpan konfirmasi pengiriman...');

    const res = await submitGiftToSpreadsheet({
      pin: activeGuest.pin,
      namaPengirim: senderVal,
      metodeTujuan: giftMethod,
      nominalAtauBarang: amountVal,
      pesanKonfirmasi: msgVal,
    });

    setGiftSubmittedMsg(
      res.message ||
        'Terima kasih banyak, konfirmasi pengiriman tanda kasih Anda telah diterima.'
    );
    setTimeout(() => setGiftSubmittedMsg(''), 6000);
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishContent.trim()) return;
    const nowStr = 'Baru saja · WIB';
    const senderVal = wishSender.trim() || activeGuest.namaTamu;
    const contentVal = wishContent.trim();

    const newWish: WishEntry = {
      id: `wish-${Date.now()}`,
      timestamp: nowStr,
      pin: activeGuest.pin,
      namaPengirim: senderVal,
      statusKehadiran: wishStatus,
      isiUcapan: contentVal,
    };
    setWishes((prev) => [newWish, ...prev]);
    setWishContent('');
    setWishSubmittedMsg('Mengirim ucapan dan doa restu...');

    const res = await submitWishToSpreadsheet({
      pin: activeGuest.pin,
      namaPengirim: senderVal,
      statusKehadiran: wishStatus,
      isiUcapan: contentVal,
    });

    if (res.wishes && res.wishes.length > 0) {
      setWishes(res.wishes);
    }
    setWishSubmittedMsg('Terima kasih, ucapan dan doa restu Anda telah ditambahkan.');
    setTimeout(() => setWishSubmittedMsg(''), 4000);
  };

  const filteredWishes =
    wishFilter === 'all' ? wishes : wishes.filter((w) => w.statusKehadiran === wishFilter);

  const activeLightboxPhoto: GalleryPhoto | null =
    lightboxIndex !== null ? INITIAL_GALLERY_PHOTOS[lightboxIndex] : null;

  // Saat masih locked di cover awal, tampilkan PinGateModal saja
  if (gateState === 'locked') {
    return (
      <PinGateModal
        config={config}
        guests={guests}
        isOpeningGate={false}
        onStartGateOpen={handleStartGateOpen}
        colorTheme={colorTheme}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#26080E] text-[#FAF3E8] relative overflow-x-hidden theme-${colorTheme} app-theme-root`}
    >
      {/* Saat gateState === 'opening', Pintu Gerbang Agung 3D membuka lebar langsung di atas Halaman Utama ini! */}
      {gateState === 'opening' && (
        <PinGateModal
          config={config}
          guests={guests}
          isOpeningGate={true}
          onStartGateOpen={handleStartGateOpen}
          colorTheme={colorTheme}
        />
      )}

      {/* =====================================================================
          ATMOSFER BUNGA SAKURA 3D & CANOPY SAKURA
          ===================================================================== */}
      <SakuraPetalShower density={gateState === 'opening' ? 'full' : 'subtle'} />

      {/* Layer Canopy Bunga Sakura di Sudut Kiri-Atas & Kanan-Atas Layar */}
      <div
        className="fixed -top-4 -left-4 w-36 h-36 sm:w-52 sm:h-52 z-20 pointer-events-none opacity-90 anim-sakura-cluster-1"
        aria-hidden="true"
      >
        <SakuraFloralCluster className="w-full h-full anim-sakura-sway" />
      </div>
      <div
        className="fixed -top-4 -right-4 w-36 h-36 sm:w-52 sm:h-52 z-20 pointer-events-none scale-x-[-1] opacity-90 anim-sakura-cluster-2"
        aria-hidden="true"
      >
        <SakuraFloralCluster className="w-full h-full anim-sakura-sway" />
      </div>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Cahaya Aura Emas Lembut di Atas Background Polosan Saat Di-scroll */}
        <div
          className="absolute left-1/2 w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.09)_0%,rgba(184,115,51,0.03)_45%,transparent_72%)] blur-2xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(-50%, ${10 + scrollProgress * 0.55}vh)`,
          }}
        />

        {/* Siluet Gunungan Kembar Paralaks di Kiri & Kanan Layar */}
        <div
          className="hidden xl:block absolute -left-12 top-36 opacity-10 transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${scrollYPos * -0.12}px) rotate(8deg)`,
          }}
        >
          <GununganCrest className="w-64 h-80" />
        </div>
        <div
          className="hidden xl:block absolute -right-12 top-96 opacity-10 transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${scrollYPos * -0.18}px) rotate(-8deg)`,
          }}
        >
          <GununganCrest className="w-64 h-80" />
        </div>
      </div>

      {/* KOMPAS JALUR PERJALANAN MENGIKUTI DI SISI KANAN LAYAR (Kontras Tinggi) */}
      <aside className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-2.5 anim-phase3-chrome">
        <div className="px-3.5 py-1.5 rounded-full bg-[#26080E]/95 border border-[#D4AF37]/60 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-[#F3E5AB] font-semibold flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>{JOURNEY_STOPS[activeJourneyStep]?.label}</span>
        </div>
        <div className="bg-[#26080E]/92 border border-[#D4AF37]/45 backdrop-blur-md rounded-2xl p-2.5 flex flex-col gap-2 shadow-xl">
          {JOURNEY_STOPS.map((stop, idx) => {
            const isActive = idx === activeJourneyStep;
            return (
              <a
                key={stop.id}
                href={`#${stop.id}`}
                className={`group flex items-center justify-end gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${
                  isActive
                    ? 'bg-[#D4AF37]/25 text-[#F3E5AB] font-semibold border border-[#D4AF37]/65'
                    : 'text-[#FAF3E8]/85 hover:text-[#F3E5AB]'
                }`}
              >
                <span>{stop.label}</span>
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-[#F3E5AB] scale-125 shadow-[0_0_10px_#D4AF37]'
                      : 'bg-[#D4AF37]/45 group-hover:bg-[#D4AF37]'
                  }`}
                />
              </a>
            );
          })}
        </div>
      </aside>

      {/* 1. SECTION 01 (PELAMINAN SAPAAN DENGAN BACKGROUND AULA JOGLO HANYA DI SECTION PERTAMA INI) */}
      <section id="hero" className="relative pt-8 sm:pt-12 pb-14 border-b border-[#D4AF37]/25 overflow-hidden">
        {/* Background Aula Joglo Pelaminan KHUSUS Section Pertama Saja */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <img
            src={JOGLO_HALL_BG}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== JOGLO_HALL_FALLBACK) {
                target.src = JOGLO_HALL_FALLBACK;
              }
            }}
            alt=""
            className="w-full h-full object-cover object-center"
          />
          {/* Scrim yang memudar mulus ke warna polosan #26080E di bagian bawah Section 1 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#26080E]/55 via-[#26080E]/45 to-[#26080E]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(243,229,171,0.18)_0%,transparent_58%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8">
          {/* Panggung Utama di Tengah Aula Joglo: Bingkai Pengantin Berlapis Sakura (1zIE5RHN5-kvCTCf3WKgp288ESs2675-Y) */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#26080E]/90 border border-[#D4AF37]/65 backdrop-blur-md text-[10px] sm:text-xs text-[#F3E5AB] uppercase tracking-[0.22em] font-semibold mb-5 anim-phase3-text-left shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>The Wedding Of · Yogyakarta</span>
            </div>

            {/* [0.1s] Bingkai Pengantin Agung Berlapis di Tengah Aula Joglo (Mandala Berputar + 4 Sudut Bunga Sakura + Shimmer Kaca) */}
            <div className="relative flex items-center justify-center anim-phase3-photo-right py-3 w-full max-w-[330px] sm:max-w-[380px] mx-auto">
              {/* Layer Belakang 1: Halo Cincin Mandala Emas Berputar */}
              <div
                className="absolute left-1/2 top-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-dashed border-[#D4AF37]/60 anim-mandala-spin pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute left-1/2 top-1/2 w-64 h-64 sm:w-84 sm:h-84 rounded-full border border-[#F3E5AB]/40 anim-mandala-spin-reverse pointer-events-none"
                aria-hidden="true"
              />

              {/* Layer Bingkai Kubah Berlapis Emas & Krem Gading */}
              <div className="relative z-10 w-full rounded-t-[170px] rounded-b-3xl p-2 sm:p-2.5 bg-gradient-to-b from-[#F3E5AB] via-[#D4AF37] to-[#8C6D1F] shadow-[0_25px_75px_rgba(15,2,5,0.92)]">
                {/* 4 Rangkaian Bunga Sakura Mekar di Keempat Sudut Bingkai Pengantin */}
                <div className="anim-sakura-cluster-1 absolute -top-6 -left-6 sm:-top-8 sm:-left-8 w-24 h-24 sm:w-32 sm:h-32 z-30 pointer-events-none">
                  <SakuraFloralCluster className="w-full h-full anim-sakura-sway" />
                </div>
                <div className="anim-sakura-cluster-2 absolute -top-5 -right-6 sm:-top-7 sm:-right-8 w-22 h-22 sm:w-28 sm:h-28 z-30 scale-x-[-1] pointer-events-none">
                  <SakuraFloralCluster className="w-full h-full anim-sakura-sway" />
                </div>
                <div className="anim-sakura-cluster-3 absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 w-24 h-24 sm:w-32 sm:h-32 z-30 scale-[-1] pointer-events-none">
                  <SakuraFloralCluster className="w-full h-full anim-sakura-sway" />
                </div>
                <div className="anim-sakura-cluster-2 absolute -bottom-5 -left-6 sm:-bottom-7 sm:-left-8 w-22 h-22 sm:w-28 sm:h-28 z-30 scale-y-[-1] pointer-events-none">
                  <SakuraFloralCluster className="w-full h-full anim-sakura-sway" />
                </div>

                <div className="p-2 sm:p-3 rounded-t-[160px] rounded-b-2xl bg-[#FAF3E8] border border-[#8B1C29]/35">
                  <div className="relative w-full h-[370px] sm:h-[420px] rounded-t-[150px] rounded-b-xl overflow-hidden border-2 border-[#D4AF37] bg-[#26080E] flex flex-col justify-end">
                    <img
                      src={COUPLE_DRIVE_PHOTO}
                      onLoad={triggerGalleryPreloadAfterHero}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== COUPLE_DRIVE_FALLBACK) {
                          target.src = COUPLE_DRIVE_FALLBACK;
                        } else {
                          triggerGalleryPreloadAfterHero();
                        }
                      }}
                      alt="Potret Pernikahan Ulfa Azizah dan Dimas"
                      referrerPolicy="no-referrer"
                      decoding="async"
                      fetchPriority="high"
                      className="absolute inset-0 w-full h-full object-cover object-[50%_62%]"
                    />

                    {/* Kilau Kaca Emas Melintas di Atas Foto Pengantin */}
                    <div
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent anim-shimmer-sweep pointer-events-none"
                      aria-hidden="true"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#26080E]/95 via-[#26080E]/20 to-transparent" />
                    <div className="relative z-10 p-5 sm:p-6 text-center">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#F3E5AB] font-semibold">
                        Pasangan Berbahagia
                      </p>
                      <h1 className="font-serif-jawa text-3xl sm:text-4xl text-[#FAF3E8] mt-1 font-semibold">
                        {config.namaPanggilanWanita}{' '}
                        <span className="italic font-normal text-[#F3E5AB]">&amp;</span>{' '}
                        {config.namaPanggilanPria}
                      </h1>
                      <p className="text-xs text-[#FAF3E8]/90 mt-1">{config.tanggalTeksMasehi}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kartu Sapaan Tamu, Nama Mempelai, Kutipan Ayat & Tombol CTA di Bawah Bingkai Pengantin (Bisa Langsung Di-scroll!) */}
          <div className="max-w-4xl mx-auto bg-[#15100C] border border-[#D4AF37]/35 rounded-2xl p-6 sm:p-10 shadow-[0_25px_70px_rgba(12,2,4,0.85)]">
            <div className="anim-phase3-text-left text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Undangan Pernikahan · {config.namaTempat}
              </p>
              <h2 className="font-serif-jawa text-3xl sm:text-5xl font-semibold text-[#F5EFE6] mt-2 tracking-tight">
                {config.namaLengkapWanita} &amp; {config.namaLengkapPria}
              </h2>

              {/* Kotak Sapaan Tamu Otomatis dengan Kontras Tinggi */}
              <div className="mt-6 p-5 sm:p-6 rounded-xl bg-[#0D0A08]/90 border border-[#D4AF37]/40 max-w-2xl mx-auto">
                <p className="text-xs uppercase tracking-[0.16em] text-[#D4AF37] font-semibold">
                  Kepada Yth. Bapak / Ibu / Saudara / i:
                </p>
                <h3 className="font-serif-jawa text-2xl sm:text-3xl font-semibold text-[#F5EFE6] mt-1.5">
                  {activeGuest.namaTamu}
                </h3>
                <p className="text-xs sm:text-sm text-[#B8A898] mt-1">
                  {activeGuest.gelarAtauInstansi} · {activeGuest.kategori} · Kuota Undangan:{' '}
                  <span className="text-[#F3E5AB] font-semibold">
                    {activeGuest.kuotaMaksimal} Orang
                  </span>
                </p>
              </div>
            </div>

            {/* [0.7s] Kutipan Ayat & Tombol CTA */}
            <blockquote className="mt-6 pt-5 border-t border-[#D4AF37]/20 text-center max-w-2xl mx-auto anim-phase3-quote-cta">
              <p className="font-serif-jawa italic text-base sm:text-lg text-[#F3E5AB] leading-relaxed">
                &ldquo;{config.kutipanJawa}&rdquo;
              </p>
              <footer className="text-xs text-[#B8A898] mt-1.5">{config.artiKutipanJawa}</footer>
            </blockquote>

            <div className="mt-7 pt-5 border-t border-[#D4AF37]/20 flex flex-wrap items-center justify-center gap-3 anim-phase3-quote-cta">
              <a
                href="#rsvp"
                className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#e2be46] text-[#0D0A08] font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
              >
                Konfirmasi Kehadiran (RSVP)
              </a>
              <a
                href="#wedding-gift"
                className="px-6 py-3 rounded-xl border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
              >
                Kirim Wedding Gift
              </a>
              <a
                href="#mempelai"
                className="px-6 py-3 rounded-xl border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
              >
                Scroll Isi Undangan ↓
              </a>
            </div>
          </div>

          {/* [1.0s] FULL-WIDTH 4-COLUMN COUNTDOWN STRIP BELOW HERO SPLIT */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 anim-phase3-chrome">
            <div className="bg-[#15100C] border border-[#D4AF37]/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B8A898] block">
                  Menuju Hari H
                </span>
                <span className="text-xs text-[#D4AF37] mt-0.5 block">Hari</span>
              </div>
              <span className="font-mono-tabular text-3xl sm:text-4xl font-semibold text-[#F3E5AB]">
                {countdown.days}
              </span>
            </div>

            <div className="bg-[#15100C] border border-[#D4AF37]/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B8A898] block">
                  Waktu Tersisa
                </span>
                <span className="text-xs text-[#D4AF37] mt-0.5 block">Jam</span>
              </div>
              <span className="font-mono-tabular text-3xl sm:text-4xl font-semibold text-[#F3E5AB]">
                {countdown.hours}
              </span>
            </div>

            <div className="bg-[#15100C] border border-[#D4AF37]/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B8A898] block">
                  Waktu Tersisa
                </span>
                <span className="text-xs text-[#D4AF37] mt-0.5 block">Menit</span>
              </div>
              <span className="font-mono-tabular text-3xl sm:text-4xl font-semibold text-[#F3E5AB]">
                {countdown.mins}
              </span>
            </div>

            <div className="bg-[#15100C] border border-[#D4AF37]/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B8A898] block">
                  Hitungan Mundur
                </span>
                <span className="text-xs text-[#D4AF37] mt-0.5 block">Detik</span>
              </div>
              <span className="font-mono-tabular text-3xl sm:text-4xl font-semibold text-[#D4AF37]">
                {countdown.secs}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN INVITATION CONTENT (BACKGROUND POLOSAN SAAT DI-SCROLL KE BAWAH) */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-28">
        {/* 2. COUPLE PROFILE & EVENT SCHEDULE SECTION */}
        <section id="mempelai" className="py-16 border-b border-[#D4AF37]/20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <GununganCrest className="w-14 h-20 mx-auto mb-3" />
            <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37] font-medium">
              Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
            </p>
            <h2 className="font-serif-jawa text-3xl sm:text-4xl font-semibold text-[#F5EFE6] mt-2 headline-balance">
              Mempelai yang Berbahagia
            </h2>
            <p className="text-sm text-[#B8A898] mt-3 leading-relaxed">
              Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan putra-putri kami:
            </p>
          </div>

          {/* Couple Portrait Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Bride Card */}
            <div className="bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-2/5 min-h-[260px] relative bg-[#1E1610]">
                <img
                  src={getDriveThumbnailUrl(DRIVE_PHOTO_IDS.mempelaiWanita, 'w800')}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = '/src/assets/images/bride_portrait_jawa_1794054526375.jpg';
                    if (!target.src.endsWith(fallback)) {
                      target.src = fallback;
                    }
                  }}
                  alt={config.namaLengkapWanita}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:w-3/5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF37] font-medium">
                    Mempelai Wanita
                  </p>
                  <h3 className="font-serif-jawa text-2xl sm:text-3xl font-semibold text-[#F5EFE6] mt-2 leading-snug">
                    {config.namaLengkapWanita}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8A898] mt-3 leading-relaxed">
                    {config.putriDariWanita}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#D4AF37]/15 text-xs text-[#B8A898]">
                  <span>Yogyakarta</span>
                </div>
              </div>
            </div>

            {/* Groom Card */}
            <div className="bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-2/5 min-h-[260px] relative bg-[#1E1610]">
                <img
                  src={getDriveThumbnailUrl(DRIVE_PHOTO_IDS.mempelaiPria, 'w800')}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = '/src/assets/images/groom_portrait_jawa_1794054528339.jpg';
                    if (!target.src.endsWith(fallback)) {
                      target.src = fallback;
                    }
                  }}
                  alt={config.namaLengkapPria}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:w-3/5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF37] font-medium">
                    Mempelai Pria
                  </p>
                  <h3 className="font-serif-jawa text-2xl sm:text-3xl font-semibold text-[#F5EFE6] mt-2 leading-snug">
                    {config.namaLengkapPria}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8A898] mt-3 leading-relaxed">
                    {config.putraDariPria}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#D4AF37]/15 text-xs text-[#B8A898]">
                  <span>Jakarta · Yogyakarta</span>
                </div>
              </div>
            </div>
          </div>

          <JavaneseSectionDivider label="Rangkaian Acara" />

          {/* 3-Column Event Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF37] font-medium">
                  01. Akad Nikah
                </p>
                <h3 className="font-serif-jawa text-2xl font-semibold text-[#F5EFE6] mt-1">
                  Ijab Qobul
                </h3>
                <p className="text-xs text-[#B8A898] mt-2 leading-relaxed">
                  Prosesi pengucapan janji suci pernikahan di hadapan penghulu, orang tua, dan saksi keluarga.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D4AF37]/15 space-y-1.5 text-xs text-[#F3E5AB]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{config.tanggalTeksMasehi}</span>
                </div>
                <div className="flex items-center gap-2 font-mono-tabular">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{config.waktuAkad}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF37] font-medium">
                  02. Prosesi Adat
                </p>
                <h3 className="font-serif-jawa text-2xl font-semibold text-[#F5EFE6] mt-1">
                  Upacara Panggih &amp; Sungkeman
                </h3>
                <p className="text-xs text-[#B8A898] mt-2 leading-relaxed">
                  Prosesi pertemuan kedua mempelai dengan adat Jawa dilanjutkan sungkeman kepada orang tua.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D4AF37]/15 space-y-1.5 text-xs text-[#F3E5AB]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{config.tanggalTeksMasehi}</span>
                </div>
                <div className="flex items-center gap-2 font-mono-tabular">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{config.waktuPanggih}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF37] font-medium">
                  03. Resepsi Pernikahan
                </p>
                <h3 className="font-serif-jawa text-2xl font-semibold text-[#F5EFE6] mt-1">
                  Syukuran &amp; Ramah Tamah
                </h3>
                <p className="text-xs text-[#B8A898] mt-2 leading-relaxed">
                  Jamuan ramah tamah bersama keluarga besar, kerabat, dan seluruh tamu undangan.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D4AF37]/15 space-y-1.5 text-xs text-[#F3E5AB]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{config.tanggalTeksMasehi}</span>
                </div>
                <div className="flex items-center gap-2 font-mono-tabular">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{config.waktuResepsi}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Location Banner */}
          <div className="mt-6 bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
              <div>
                <h4 className="font-serif-jawa text-xl font-semibold text-[#F5EFE6]">
                  {config.namaTempat}
                </h4>
                <p className="text-xs text-[#B8A898] mt-0.5">{config.alamatTempat}</p>
              </div>
            </div>
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/50 text-[#F3E5AB] hover:bg-[#D4AF37]/15 text-xs font-medium transition-colors whitespace-nowrap shrink-0 text-center"
            >
              Buka Lokasi di Google Maps
            </a>
          </div>
        </section>

        {/* 2B. LOVE STORY SECTION (PERJALANAN CINTA ULFA & DIMAS) */}
        <section id="love-story" className="py-16 border-b border-[#D4AF37]/20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#D4AF37] font-medium">
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Love Story</span>
            </div>
            <h2 className="font-serif-jawa text-3xl sm:text-4xl font-semibold text-[#F5EFE6] mt-2">
              Perjalanan Cinta Kami
            </h2>
            <p className="text-sm text-[#B8A898] mt-2 leading-relaxed">
              Setiap langkah dan waktu yang kami lalui bersama hingga bermuara pada ikatan suci pernikahan:
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Garis Vertikal Emas Penghubung Timeline */}
            <div
              className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-[#D4AF37]/20 via-[#D4AF37]/65 to-[#D4AF37]/20"
              aria-hidden="true"
            />

            <div className="space-y-8">
              {LOVE_STORY_ITEMS.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col md:flex-row items-stretch ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    } gap-6 md:gap-10`}
                  >
                    {/* Titik Ornamen Emas di Tengah Garis Timeline */}
                    <div
                      className="hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-[#26080E] border-2 border-[#D4AF37] items-center justify-center shadow-[0_0_18px_rgba(212,175,55,0.45)]"
                      aria-hidden="true"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#F3E5AB]" />
                    </div>

                    <div className="md:w-1/2">
                      <div className="bg-[#FAF3E8] text-[#2B0910] border-2 border-[#D4AF37] rounded-2xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(12,2,4,0.55)] h-full flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8B1C29]">
                              {item.phase}
                            </span>
                            <span className="px-3 py-0.5 rounded-full bg-[#8B1C29]/10 border border-[#8B1C29]/30 font-mono-tabular text-[11px] font-semibold text-[#8B1C29]">
                              {item.period}
                            </span>
                          </div>
                          <h3 className="font-serif-jawa text-2xl sm:text-3xl font-bold text-[#2B0910] mt-1">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#5C232C] mt-3 leading-relaxed">
                            {item.story}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block md:w-1/2" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. BENTO GALLERY & LIGHTBOX SECTION */}
        <section id="galeri" className="py-16 border-b border-[#D4AF37]/20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37] font-medium">
                Galeri Foto Pre-Wedding ({INITIAL_GALLERY_PHOTOS.length} Foto)
              </p>
              <h2 className="font-serif-jawa text-3xl sm:text-4xl font-semibold text-[#F5EFE6] mt-1">
                Momen Kebahagiaan Ulfa &amp; Dimas
              </h2>
            </div>
            <p className="text-xs text-[#B8A898]">
              Klik pada foto untuk memperbesar tampilan penuh
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5">
            {INITIAL_GALLERY_PHOTOS.map((photo, index) => {
              const mod = index % 5;
              const spanClasses =
                mod === 0
                  ? 'md:col-span-8 min-h-[340px]'
                  : mod === 1
                  ? 'md:col-span-4 min-h-[340px]'
                  : 'md:col-span-4 min-h-[300px]';

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className={`${spanClasses} group relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-[#1B0509] text-left flex flex-col justify-end cursor-pointer focus:outline-none focus:border-[#D4AF37]`}
                >
                  <img
                    src={photo.imageUrl}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith('/images/pengantin_baru_drive.jpg')) {
                        target.src = '/images/pengantin_baru_drive.jpg';
                      }
                    }}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="relative z-10 p-5">
                    <div className="flex items-center gap-2 text-[11px] text-[#F3E5AB] uppercase tracking-wider font-semibold">
                      <span>{photo.category}</span>
                    </div>
                    <h3 className="font-serif-jawa text-xl font-semibold text-[#FAF3E8] mt-1">
                      {photo.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. INTERACTIVE RSVP SECTION (DENGAN BACKGROUND BERBAYANG ID: 1Tw8kQBOkkJnjH5loQKd0kWyHRhq0EGIb) */}
        <section
          id="rsvp"
          className="relative py-16 px-5 sm:px-10 my-6 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_20px_60px_rgba(12,2,4,0.65)]"
        >
          {/* Background Gambar Berbayang (Overlay) untuk Section Konfirmasi Kehadiran Tamu */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <img
              src="/images/bg_rsvp_drive.jpg"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = getDriveThumbnailUrl(DRIVE_PHOTO_IDS.bgRsvp, 'w1000');
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
              alt=""
              referrerPolicy="no-referrer"
              decoding="async"
              className="w-full h-full object-cover object-[50%_48%] opacity-65 scale-105"
            />
            {/* Lapisan Overlay Berbayang Maroon & Vignette Halus (Lebih Terang agar Foto Jelas Terlihat) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#26080E]/65 via-[#26080E]/35 to-[#26080E]/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#26080E]/55 via-transparent to-[#26080E]/55" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: RSVP Explanation & Current Guest Quota */}
            <div className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37] font-medium">
                RSVP Kehadiran
              </p>
              <h2 className="font-serif-jawa text-3xl sm:text-4xl font-semibold text-[#F5EFE6] mt-2 headline-balance">
                Konfirmasi Kehadiran Tamu
              </h2>
              <p className="text-sm text-[#B8A898] mt-3 leading-relaxed">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
              </p>

              <div className="mt-6 p-5 rounded-2xl bg-[#15100C] border border-[#D4AF37]/25 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B8A898]">Nama Tamu Undangan</span>
                  <span className="font-medium text-[#F5EFE6]">{activeGuest.namaTamu}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B8A898]">Asal / Keterangan</span>
                  <span className="text-[#F3E5AB]">{activeGuest.gelarAtauInstansi}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B8A898]">Kuota Undangan</span>
                  <span className="font-mono-tabular text-[#F5EFE6]">
                    Maksimal {activeGuest.kuotaMaksimal} Orang
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: RSVP Form */}
            <div className="lg:col-span-7 bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleRsvpSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Nama Tamu (Terisi Otomatis)
                  </label>
                  <input
                    type="text"
                    value={activeGuest.namaTamu}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08]/80 border border-[#D4AF37]/25 text-[#F3E5AB] text-sm font-medium cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#B8A898] mb-1.5">
                      Konfirmasi Kehadiran
                    </label>
                    <select
                      value={rsvpStatus}
                      onChange={(e) =>
                        setRsvpStatus(e.target.value as 'Hadir' | 'Berhalangan')
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Hadir">InsyaAllah Hadir</option>
                      <option value="Berhalangan">Mohon Maaf Berhalangan Hadir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#B8A898] mb-1.5">
                      Jumlah Tamu yang Hadir
                    </label>
                    <select
                      value={rsvpCount}
                      onChange={(e) => setRsvpCount(Number(e.target.value))}
                      disabled={rsvpStatus === 'Berhalangan'}
                      className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm font-mono-tabular focus:outline-none focus:border-[#D4AF37] disabled:opacity-50"
                    >
                      {Array.from({ length: activeGuest.kuotaMaksimal }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num} Orang
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Sesi Acara yang Dihadiri
                  </label>
                  <select
                    value={rsvpSession}
                    onChange={(e) =>
                      setRsvpSession(e.target.value as RsvpEntry['sesiAcara'])
                    }
                    disabled={rsvpStatus === 'Berhalangan'}
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37] disabled:opacity-50"
                  >
                    <option value="Akad, Panggih & Pahargyan Agung">
                      Akad Nikah &amp; Resepsi Pernikahan
                    </option>
                    <option value="Pahargyan Agung (Resepsi)">
                      Resepsi Pernikahan Saja (11.00 – 14.00 WIB)
                    </option>
                    <option value="Akad & Panggih Saja">
                      Akad Nikah Saja (08.00 – 10.00 WIB)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Pesan / Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={rsvpNotes}
                    onChange={(e) => setRsvpNotes(e.target.value)}
                    placeholder="Tuliskan catatan jika ada..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {rsvpSubmittedMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#F3E5AB] text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{rsvpSubmittedMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#e2be46] text-[#0D0A08] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Konfirmasi Kehadiran</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 5. WEDDING GIFT & CONFIRMATION SECTION */}
        <section id="wedding-gift" className="py-16 border-b border-[#D4AF37]/20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37] font-medium">
              Tanda Kasih Pernikahan
            </p>
            <h2 className="font-serif-jawa text-3xl sm:text-4xl font-semibold text-[#F5EFE6] mt-2">
              Wedding Gift &amp; Konfirmasi
            </h2>
            <p className="text-sm text-[#B8A898] mt-2 leading-relaxed">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Apabila Anda ingin mengirimkan tanda kasih, dapat melalui rekening atau alamat berikut disertai konfirmasi pengiriman:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Bank Accounts & Physical Address */}
            <div className="lg:col-span-6 space-y-4">
              {INITIAL_BANK_ACCOUNTS.map((bank) => (
                <div
                  key={bank.id}
                  className="bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF37] font-medium">
                      {bank.namaBank}
                    </p>
                    <p className="font-mono-tabular text-2xl font-semibold text-[#F5EFE6] mt-1 tracking-wider">
                      {bank.nomorRekening}
                    </p>
                    <p className="text-xs text-[#F3E5AB] mt-1">a.n. {bank.atasNama}</p>
                    <p className="text-xs text-[#B8A898]">{bank.cabangAtauKeterangan}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAccount(bank.id, bank.nomorRekening)}
                    className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/45 text-[#F3E5AB] hover:bg-[#D4AF37]/15 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
                  >
                    {copiedBankId === bank.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              ))}

              {/* Physical Gift Address Card */}
              <div className="bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#D4AF37] font-medium">
                  <Gift className="w-4 h-4" />
                  <span>Alamat Pengiriman Kado Fisik</span>
                </div>
                <p className="text-sm text-[#F5EFE6] font-medium mt-2">
                  Kediaman Ulfa Azizah &amp; Dimas
                </p>
                <p className="text-xs text-[#B8A898] mt-1 leading-relaxed">
                  {config.alamatKirimKado}
                </p>
              </div>
            </div>

            {/* Right Column: Wedding Gift Confirmation Form */}
            <div className="lg:col-span-6 bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-[0.18em] font-medium mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Konfirmasi Pengiriman</span>
              </div>
              <h3 className="font-serif-jawa text-2xl font-semibold text-[#F5EFE6] mb-2">
                Formulir Konfirmasi Wedding Gift
              </h3>
              <p className="text-xs text-[#B8A898] mb-6 leading-relaxed">
                Mohon konfirmasikan transfer atau pengiriman kado Anda melalui formulir di bawah ini:
              </p>

              <form onSubmit={handleGiftSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    value={giftSender}
                    onChange={(e) => setGiftSender(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Rekening Tujuan / Pengiriman Kado
                  </label>
                  <select
                    value={giftMethod}
                    onChange={(e) => setGiftMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  >
                    {INITIAL_BANK_ACCOUNTS.map((b) => (
                      <option
                        key={b.id}
                        value={`${b.namaBank} - ${b.nomorRekening} (${b.atasNama})`}
                      >
                        {b.namaBank} — {b.nomorRekening} (a.n. {b.atasNama})
                      </option>
                    ))}
                    <option value="Pengiriman Kado Fisik">
                      Pengiriman Kado Fisik ke Alamat Rumah
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Nominal Transfer / Jenis Kado
                  </label>
                  <input
                    type="text"
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    placeholder="Contoh: Rp 500.000 atau Bedcover"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Pesan / Catatan Konfirmasi
                  </label>
                  <textarea
                    rows={2}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Tuliskan pesan singkat..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {giftSubmittedMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#F3E5AB] text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{giftSubmittedMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#e2be46] text-[#0D0A08] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Kirim Konfirmasi Wedding Gift</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 6. GUESTBOOK WISHES / DOA & UCAPAN TAMU (DENGAN BACKGROUND BERBAYANG ID: 1Qipk7crILX40rblYqBwZvCJS-jJgKzcF) */}
        <section
          id="ucapan"
          className="relative py-16 px-5 sm:px-10 mt-6 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_20px_60px_rgba(12,2,4,0.65)]"
        >
          {/* Background Gambar Berbayang (Overlay) untuk Section Doa & Ucapan Tamu */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <img
              src="/images/bg_ucapan_drive.jpg"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = getDriveThumbnailUrl(DRIVE_PHOTO_IDS.bgUcapan, 'w1000');
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
              alt=""
              referrerPolicy="no-referrer"
              decoding="async"
              className="w-full h-full object-cover object-[50%_35%] opacity-65 scale-105"
            />
            {/* Lapisan Overlay Berbayang Maroon & Vignette Halus (Lebih Terang agar Foto Jelas Terlihat) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#26080E]/65 via-[#26080E]/35 to-[#26080E]/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#26080E]/55 via-transparent to-[#26080E]/55" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Write Wish Form */}
            <div className="lg:col-span-5 bg-[#15100C] border border-[#D4AF37]/25 rounded-2xl p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37] font-medium">
                Buku Tamu &amp; Doa
              </p>
              <h2 className="font-serif-jawa text-3xl font-semibold text-[#F5EFE6] mt-1">
                Ucapan Selamat &amp; Doa Restu
              </h2>
              <p className="text-xs text-[#B8A898] mt-2 leading-relaxed">
                Berikan ucapan selamat dan doa terbaik Anda untuk pernikahan Ulfa &amp; Dimas:
              </p>

              <form onSubmit={handleWishSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    value={wishSender}
                    onChange={(e) => setWishSender(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Konfirmasi Kehadiran
                  </label>
                  <select
                    value={wishStatus}
                    onChange={(e) =>
                      setWishStatus(e.target.value as 'Hadir' | 'Berhalangan')
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Berhalangan">Berhalangan Hadir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#B8A898] mb-1.5">
                    Ucapan &amp; Doa Restu
                  </label>
                  <textarea
                    rows={4}
                    value={wishContent}
                    onChange={(e) => setWishContent(e.target.value)}
                    placeholder="Selamat menempuh hidup baru Ulfa & Dimas..."
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0D0A08] border border-[#D4AF37]/35 text-[#F5EFE6] text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {wishSubmittedMsg && (
                  <div className="p-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#F3E5AB] text-xs">
                    {wishSubmittedMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF37] hover:bg-[#e2be46] text-[#0D0A08] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span>Kirim Ucapan Selamat</span>
                </button>
              </form>
            </div>

            {/* Right Column: Wishes Feed */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif-jawa text-2xl sm:text-3xl font-semibold text-[#F5EFE6]">
                    Doa &amp; Ucapan Tamu ({filteredWishes.length})
                  </h3>
                  <p className="text-xs text-[#B8A898]">
                    Ucapan selamat dari keluarga, sahabat, dan rekan
                  </p>
                </div>

                {/* Interactive Filter Buttons */}
                <div className="flex items-center gap-1 p-1 bg-[#15100C] border border-[#D4AF37]/20 rounded-lg">
                  {(['all', 'Hadir', 'Berhalangan'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setWishFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        wishFilter === f
                          ? 'bg-[#D4AF37] text-[#0D0A08] font-semibold'
                          : 'text-[#B8A898] hover:text-[#F5EFE6]'
                      }`}
                    >
                      {f === 'all' ? 'Semua' : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredWishes.map((w) => (
                  <article
                    key={w.id}
                    className="bg-[#15100C] border border-[#D4AF37]/20 rounded-2xl p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#B8A898]">
                      <strong className="text-[#F5EFE6] font-semibold text-sm">
                        {w.namaPengirim}
                      </strong>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#D4AF37]">{w.statusKehadiran}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{w.timestamp}</span>
                    </div>

                    <p className="mt-3 text-sm text-[#F5EFE6]/90 leading-relaxed">
                      &ldquo;{w.isiUcapan}&rdquo;
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL FOR GALLERY */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-4xl w-full bg-[#15100C] border border-[#D4AF37]/35 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2 text-xs text-[#B8A898]">
                <span className="text-[#D4AF37] uppercase tracking-wider font-medium">
                  {activeLightboxPhoto.category}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeLightboxPhoto.subtitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-lg text-[#B8A898] hover:text-[#F5EFE6] border border-[#D4AF37]/25 cursor-pointer"
                aria-label="Tutup pratinjau foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-black max-h-[65vh] flex items-center justify-center overflow-hidden">
              <img
                src={activeLightboxPhoto.imageUrl.replace('&sz=w600', '&sz=w1200')}
                alt={activeLightboxPhoto.title}
                referrerPolicy="no-referrer"
                decoding="async"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-jawa text-2xl font-semibold text-[#F5EFE6]">
                  {activeLightboxPhoto.title}
                </h3>
                <p className="text-xs text-[#B8A898] mt-1 max-w-2xl leading-relaxed">
                  {activeLightboxPhoto.story}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + INITIAL_GALLERY_PHOTOS.length) %
                        INITIAL_GALLERY_PHOTOS.length
                    )
                  }
                  className="px-3 py-2 rounded-lg border border-[#D4AF37]/30 text-xs text-[#F3E5AB] hover:bg-[#D4AF37]/15 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % INITIAL_GALLERY_PHOTOS.length)
                  }
                  className="px-3 py-2 rounded-lg border border-[#D4AF37]/30 text-xs text-[#F3E5AB] hover:bg-[#D4AF37]/15 flex items-center gap-1 cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIET FOOTER */}
      <footer className="border-t border-[#D4AF37]/25 bg-[#1D060A] py-8 px-4 sm:px-8 text-center text-xs text-[#E8D5C4]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            The Wedding of {config.namaPanggilanWanita} &amp; {config.namaPanggilanPria} ·{' '}
            {config.tanggalTeksMasehi}
          </p>
          <button
            type="button"
            onClick={() => setGateState('locked')}
            className="hover:text-[#F3E5AB] transition-colors cursor-pointer"
          >
            Kembali ke Sampul Undangan
          </button>
        </div>
      </footer>
    </div>
  );
}
