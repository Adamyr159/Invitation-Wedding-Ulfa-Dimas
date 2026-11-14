import React, { useState, useEffect } from 'react';
import {
  Lock,
  ArrowRight,
  KeyRound,
  MailOpen,
  ArrowLeft,
} from 'lucide-react';
import { GuestEntry, WeddingConfig, WishEntry } from '../types/wedding';
import { GununganCrest } from './JavaneseOrnaments';
import { weddingMusic } from '../utils/weddingMusicPlayer';
import { verifyPinWithSpreadsheet } from '../services/gasApi';

export type WeddingColorTheme = 'maroon-velvet' | 'maroon-ivory' | 'dark-jawa';

interface PinGateModalProps {
  config: WeddingConfig;
  guests: GuestEntry[];
  isOpeningGate: boolean;
  onStartGateOpen: (guest: GuestEntry, remoteWishes?: WishEntry[]) => void;
  colorTheme?: WeddingColorTheme;
}

// Foto Background Aula Joglo (1PM-8RFPofVmOZYpsXB1R4lceNVBrNqip)
export const JOGLO_HALL_BG = '/images/gedung_user_drive.jpg';
export const JOGLO_HALL_FALLBACK =
  'https://drive.google.com/thumbnail?id=1PM-8RFPofVmOZYpsXB1R4lceNVBrNqip&sz=w1000';

// Gambar 1: Foto Bingkai Halaman Pertama Input PIN (Drive 1: 11U5mxsda2pUewOnUqs7p8ChCxcG8d32A)
export const COVER_PIN_PHOTO = '/images/cover_drive_1.jpg';
export const COVER_PIN_FALLBACK =
  'https://drive.google.com/thumbnail?id=11U5mxsda2pUewOnUqs7p8ChCxcG8d32A&sz=w800';

// Gambar 2: Foto Bingkai Pengantin Utama Setelah Gerbang Terbuka (Drive 2: 1eTjiCq_kGE_c7pG6mqejL12iNokL7i8g)
export const COUPLE_DRIVE_PHOTO = '/images/hero_drive_2.jpg';
export const COUPLE_DRIVE_FALLBACK =
  'https://drive.google.com/thumbnail?id=1eTjiCq_kGE_c7pG6mqejL12iNokL7i8g&sz=w1000';

/**
 * Ornamen Border Sudut Emas (4 Sudut Layar) — Muncul pada [0.3s - 0.9s]
 */
const GoldCornerOrnament: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  const posClasses =
    position === 'tl'
      ? 'top-3 left-3 sm:top-6 sm:left-6'
      : position === 'tr'
      ? 'top-3 right-3 sm:top-6 sm:right-6 scale-x-[-1]'
      : position === 'bl'
      ? 'bottom-3 left-3 sm:bottom-6 sm:left-6 scale-y-[-1]'
      : 'bottom-3 right-3 sm:bottom-6 sm:right-6 scale-[-1]';

  return (
    <div
      className={`fixed z-30 pointer-events-none w-14 h-14 sm:w-24 sm:h-24 ${posClasses}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <path
          d="M2 92 V12 C2 6.5 6.5 2 12 2 H92"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeOpacity="0.85"
        />
        <path
          d="M10 76 V16 C10 12.7 12.7 10 16 10 H76"
          stroke="#F3E5AB"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        <path
          d="M18 18 C32 18 32 32 18 32 C18 44 36 44 44 26 C52 36 44 52 26 52"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <circle cx="14" cy="14" r="3" fill="#F3E5AB" />
        <circle cx="38" cy="14" r="1.8" fill="#D4AF37" />
        <circle cx="14" cy="38" r="1.8" fill="#D4AF37" />
      </svg>
    </div>
  );
};

/**
 * Rangkaian Bunga Sakura & Emas (3D Layered Floral Cluster) untuk menghiasi Bingkai Pengantin & Halaman Utama
 */
export const SakuraFloralCluster: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 140 140"
    fill="none"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    {/* Dahan & Daun Emas */}
    <path
      d="M15 115 Q55 75 118 28"
      stroke="#D4AF37"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M48 84 Q32 58 22 45 M76 58 Q96 68 116 62"
      stroke="#B8860B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Daun Emas Kecil */}
    <path d="M36 92 C22 86 20 72 34 74 C44 76 42 88 36 92 Z" fill="#D4AF37" fillOpacity="0.8" />
    <path d="M88 52 C98 38 112 40 106 52 C100 62 90 58 88 52 Z" fill="#F3E5AB" fillOpacity="0.75" />

    {/* Bunga Sakura Utama (Tengah) */}
    <g transform="translate(65, 65)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d="M0 -4 C-10 -18 -14 -30 -4 -35 C0 -32 0 -30 0 -32 C0 -30 0 -32 4 -35 C14 -30 10 -18 0 -4 Z"
          fill="url(#sakuraPinkGrad)"
          stroke="#D4AF37"
          strokeWidth="0.9"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="6" fill="#D4AF37" />
      <circle cx="0" cy="0" r="3" fill="#FAF3E8" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="0"
          y1="-6"
          x2="0"
          y2="-12"
          stroke="#D4AF37"
          strokeWidth="1"
          transform={`rotate(${deg})`}
        />
      ))}
    </g>

    {/* Bunga Sakura Kedua (Kiri Bawah) */}
    <g transform="translate(32, 96) scale(0.68)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d="M0 -4 C-10 -18 -14 -30 -4 -35 C0 -32 0 -30 4 -35 C14 -30 10 -18 0 -4 Z"
          fill="url(#sakuraIvoryGrad)"
          stroke="#D4AF37"
          strokeWidth="1"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="5.5" fill="#8B1C29" />
      <circle cx="0" cy="0" r="2.5" fill="#F3E5AB" />
    </g>

    {/* Bunga Sakura Ketiga (Kanan Atas) */}
    <g transform="translate(102, 36) scale(0.62)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d="M0 -4 C-10 -18 -14 -30 -4 -35 C0 -32 0 -30 4 -35 C14 -30 10 -18 0 -4 Z"
          fill="url(#sakuraPinkGrad)"
          stroke="#D4AF37"
          strokeWidth="1"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="5.5" fill="#D4AF37" />
    </g>

    {/* Kuncup Sakura */}
    <circle cx="118" cy="24" r="5" fill="#F4A7B9" stroke="#D4AF37" strokeWidth="1" />
    <circle cx="18" cy="54" r="4" fill="#FFD1DC" stroke="#D4AF37" strokeWidth="1" />

    <defs>
      <radialGradient id="sakuraPinkGrad" cx="50%" cy="65%" r="65%">
        <stop offset="0%" stopColor="#8B1C29" stopOpacity="0.45" />
        <stop offset="45%" stopColor="#F4A7B9" />
        <stop offset="100%" stopColor="#FFF0F5" />
      </radialGradient>
      <radialGradient id="sakuraIvoryGrad" cx="50%" cy="65%" r="65%">
        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.55" />
        <stop offset="50%" stopColor="#FFD1DC" />
        <stop offset="100%" stopColor="#FAF3E8" />
      </radialGradient>
    </defs>
  </svg>
);

/**
 * Hujan Kelopak Bunga Sakura Ringan (GPU-Accelerated tanpa filter blur berat)
 */
const SAKURA_PETALS = [
  { id: 1, left: '7%', size: 18, dur: '6.4s', delay: '0.1s', type: 'a', color: '#FFD1DC' },
  { id: 2, left: '19%', size: 15, dur: '7.4s', delay: '0.8s', type: 'b', color: '#F4A7B9' },
  { id: 3, left: '31%', size: 19, dur: '6.1s', delay: '0.3s', type: 'a', color: '#FAF3E8' },
  { id: 4, left: '44%', size: 14, dur: '7.8s', delay: '1.2s', type: 'b', color: '#FFD1DC' },
  { id: 5, left: '56%', size: 18, dur: '6.6s', delay: '0.5s', type: 'a', color: '#F4A7B9' },
  { id: 6, left: '68%', size: 15, dur: '7.2s', delay: '0.9s', type: 'b', color: '#F3E5AB' },
  { id: 7, left: '81%', size: 17, dur: '6.3s', delay: '0.4s', type: 'a', color: '#FFD1DC' },
  { id: 8, left: '91%', size: 16, dur: '6.9s', delay: '1.1s', type: 'b', color: '#FAF3E8' },
];

export const SakuraPetalShower: React.FC<{ density?: 'full' | 'subtle' }> = ({
  density = 'full',
}) => {
  const items = density === 'full' ? SAKURA_PETALS : SAKURA_PETALS.slice(0, 6);
  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden="true">
      {items.map((p) => (
        <div
          key={p.id}
          className={`absolute top-0 ${
            p.type === 'a' ? 'sakura-petal-a' : 'sakura-petal-b'
          }`}
          style={
            {
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--fall-dur': p.dur,
              '--fall-delay': p.delay,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_6px_rgba(139,28,41,0.35)]">
            <path
              d="M16 28 C6 22 3 11 9 5 C12 2 15 5 16 8 C17 5 20 2 23 5 C29 11 26 22 16 28 Z"
              fill={p.color}
              fillOpacity="0.88"
              stroke="#D4AF37"
              strokeWidth="0.6"
              strokeOpacity="0.6"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

/**
 * Daun Pintu Gerbang Agung Keraton (Kiri & Kanan)
 * Saat isOpening = true, kedua daun pintu berayun membuka lebar (rotateY)
 * dan langsung memperlihatkan Halaman Utama Undangan di belakangnya!
 */
const RoyalGateDoors: React.FC<{ isOpening: boolean }> = ({ isOpening }) => (
  <div
    className={`fixed inset-0 z-25 pointer-events-none flex gate-3d-stage ${
      isOpening ? '' : 'opacity-95'
    }`}
    aria-hidden="true"
  >
    {/* Cahaya Kemuliaan Emas saat Pintu Gerbang Terbuka */}
    {isOpening && (
      <div className="anim-gate-light-burst absolute inset-0 z-30 flex items-center justify-center">
        <div className="w-[520px] h-[520px] sm:w-[760px] sm:h-[760px] rounded-full bg-[radial-gradient(circle,rgba(250,243,232,0.95)_0%,rgba(212,175,55,0.65)_35%,rgba(139,28,41,0.2)_65%,transparent_80%)] blur-xl" />
      </div>
    )}

    {/* DAUN GERBANG KIRI */}
    <div
      className={`w-1/2 h-full relative bg-gradient-to-r from-[#1A0408] via-[#2B0910] to-[#3A0C15] border-r-2 border-[#D4AF37] shadow-[15px_0_50px_rgba(0,0,0,0.85)] flex flex-col justify-between p-4 sm:p-8 overflow-hidden ${
        isOpening ? 'anim-gate-door-left-open' : ''
      }`}
    >
      <div className="w-full h-full border border-[#D4AF37]/45 rounded-l-xl p-3 sm:p-6 flex flex-col justify-between relative bg-[radial-gradient(circle_at_right,rgba(212,175,55,0.12)_0%,transparent_70%)]">
        <div className="w-24 h-24 sm:w-36 sm:h-36 opacity-75">
          <SakuraFloralCluster className="w-full h-full" />
        </div>

        {/* Setengah Lingkaran Mandala & Gunungan di Pertemuan Pintu Kiri */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-44 h-64 sm:w-64 sm:h-80 rounded-full border-2 border-[#D4AF37]/70 bg-[#26080E]/95 shadow-[0_0_40px_rgba(212,175,55,0.3)] flex items-center justify-center">
          <div className="-translate-x-7 sm:-translate-x-10 opacity-85">
            <GununganCrest className="w-16 h-24 sm:w-24 sm:h-36" />
          </div>
          <div className="absolute left-1/2 -translate-x-8 sm:-translate-x-11 top-1/2 -translate-y-1/2 w-5 h-12 rounded-full border-2 border-[#F3E5AB] bg-gradient-to-b from-[#D4AF37] to-[#8C6D1F] shadow-[0_0_15px_#D4AF37]" />
        </div>

        <div className="h-20 sm:h-28 border-t border-[#D4AF37]/30 flex items-center justify-center">
          <div className="w-full h-3 border-y border-[#D4AF37]/25" />
        </div>
      </div>
    </div>

    {/* DAUN GERBANG KANAN */}
    <div
      className={`w-1/2 h-full relative bg-gradient-to-l from-[#1A0408] via-[#2B0910] to-[#3A0C15] border-l-2 border-[#D4AF37] shadow-[-15px_0_50px_rgba(0,0,0,0.85)] flex flex-col justify-between p-4 sm:p-8 overflow-hidden ${
        isOpening ? 'anim-gate-door-right-open' : ''
      }`}
    >
      <div className="w-full h-full border border-[#D4AF37]/45 rounded-r-xl p-3 sm:p-6 flex flex-col justify-between relative bg-[radial-gradient(circle_at_left,rgba(212,175,55,0.12)_0%,transparent_70%)]">
        <div className="w-24 h-24 sm:w-36 sm:h-36 self-end scale-x-[-1] opacity-75">
          <SakuraFloralCluster className="w-full h-full" />
        </div>

        {/* Setengah Lingkaran Mandala & Gunungan di Pertemuan Pintu Kanan */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-44 h-64 sm:w-64 sm:h-80 rounded-full border-2 border-[#D4AF37]/70 bg-[#26080E]/95 shadow-[0_0_40px_rgba(212,175,55,0.3)] flex items-center justify-center">
          <div className="translate-x-7 sm:translate-x-10 opacity-85">
            <GununganCrest className="w-16 h-24 sm:w-24 sm:h-36" />
          </div>
          <div className="absolute right-1/2 translate-x-8 sm:translate-x-11 top-1/2 -translate-y-1/2 w-5 h-12 rounded-full border-2 border-[#F3E5AB] bg-gradient-to-b from-[#D4AF37] to-[#8C6D1F] shadow-[0_0_15px_#D4AF37]" />
        </div>

        <div className="h-20 sm:h-28 border-t border-[#D4AF37]/30 flex items-center justify-center">
          <div className="w-full h-3 border-y border-[#D4AF37]/25" />
        </div>
      </div>
    </div>
  </div>
);

export const PinGateModal: React.FC<PinGateModalProps> = ({
  config,
  guests,
  isOpeningGate,
  onStartGateOpen,
  colorTheme = 'maroon-ivory',
}) => {
  const [isPinBoxVisible, setIsPinBoxVisible] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // Preload lagu "A Thousand Years" sejak halaman pertama dibuka & cek parameter URL ?pin=XXXX
  useEffect(() => {
    weddingMusic.preload();
    const params = new URLSearchParams(window.location.search);
    const urlPin = params.get('pin');
    if (urlPin) {
      setPinInput(urlPin.toUpperCase());
    }
  }, []);

  // Handler saat tombol "Buka Surat Undangan" diklik
  const handleOpenCoverClick = async () => {
    weddingMusic.primeOnUserGesture();
    if (pinInput.trim()) {
      setIsVerifyingPin(true);
      const res = await verifyPinWithSpreadsheet(pinInput.trim(), guests);
      setIsVerifyingPin(false);
      if (res.success && res.guest) {
        onStartGateOpen(res.guest, res.wishes);
        return;
      }
    }
    setIsPinBoxVisible(true);
  };

  // Handler verifikasi PIN -> Cek ke Google Sheets via Apps Script API & langsung buka Pintu Gerbang Agung 3D!
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOpeningGate || isVerifyingPin) return;

    const cleanPin = pinInput.trim().toUpperCase();
    if (!cleanPin) {
      setErrorMsg('Silakan masukkan kode PIN undangan Anda terlebih dahulu.');
      return;
    }

    setErrorMsg('');
    setIsVerifyingPin(true);
    const res = await verifyPinWithSpreadsheet(cleanPin, guests);
    setIsVerifyingPin(false);

    if (!res.success || !res.guest) {
      setErrorMsg(
        res.message ||
          'Kode PIN tidak terdaftar. Silakan periksa kembali PIN pada undangan Anda.'
      );
      return;
    }

    onStartGateOpen(res.guest, res.wishes);
  };

  const isIvoryCard = colorTheme === 'maroon-ivory';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none px-4 py-3 ${
        isOpeningGate ? 'pointer-events-none bg-transparent' : 'bg-[#26080E]'
      }`}
    >
      {/* =====================================================================
          BACKGROUND AULA JOGLO (Hanya ditampilkan di dalam modal saat masih terkunci;
          begitu gerbang mulai membuka, latar Aula Joglo milik Section 1 di belakangnya
          langsung terlihat menyatu tanpa putus!)
          ===================================================================== */}
      {!isOpeningGate && (
        <div className="absolute inset-0 anim-phase1-bg">
          <img
            src={JOGLO_HALL_BG}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== JOGLO_HALL_FALLBACK) {
                target.src = JOGLO_HALL_FALLBACK;
              }
            }}
            alt="Background Aula Joglo Pernikahan Ulfa & Dimas"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#26080E]/75 via-[#3B0E17]/50 to-[#26080E]/88" />
        </div>
      )}

      {/* Hujan Kelopak Bunga Sakura di Halaman Pertama */}
      {!isOpeningGate && <SakuraPetalShower density="subtle" />}

      {/* =====================================================================
          ORNAMEN BORDER SUDUT EMAS (4 SUDUT LAYAR)
          ===================================================================== */}
      <div className="anim-phase1-corners">
        <GoldCornerOrnament position="tl" />
        <GoldCornerOrnament position="tr" />
        <GoldCornerOrnament position="bl" />
        <GoldCornerOrnament position="br" />
      </div>

      {/* =====================================================================
          PINTU GERBANG AGUNG KERATON KEMBAR (KIRI & KANAN)
          Membuka Lebar & Smooth selama 3.6 detik begitu PIN berhasil diverifikasi!
          ===================================================================== */}
      <RoyalGateDoors isOpening={isOpeningGate} />

      {/* =====================================================================
          CONTAINER CARD KUBAH/ARCH TENGAH (Halaman Pertama Input PIN — Tanpa Scrollbar!)
          Menggunakan foto 1zIE5RHN5-kvCTCf3WKgp288ESs2675-Y
          ===================================================================== */}
      <div
        className={`relative z-30 w-full max-w-[390px] rounded-t-[135px] rounded-b-2xl backdrop-blur-md border px-5 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6 text-center transition-all duration-500 ${
          isOpeningGate
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'anim-phase1-card'
        } ${
          isIvoryCard
            ? 'bg-[#FAF3E8]/96 border-[#B8860B]/65 text-[#2B0910] shadow-[0_25px_80px_rgba(20,3,6,0.92)]'
            : 'bg-[#2B0910]/92 border-[#D4AF37]/60 text-[#FAF3E8] shadow-[0_25px_80px_rgba(12,2,4,0.95)]'
        }`}
      >
        {/* Rangkaian Bunga Sakura di Sudut Kartu Arch */}
        <SakuraFloralCluster className="w-20 h-20 sm:w-24 sm:h-24 absolute -top-4 -left-4 z-30 anim-sakura-sway pointer-events-none" />
        <SakuraFloralCluster className="w-20 h-20 sm:w-24 sm:h-24 absolute -top-4 -right-4 z-30 scale-x-[-1] anim-sakura-sway pointer-events-none" />

        {/* [0.9s - 1.4s] GAMBAR 1: FOTO BINGKAI HALAMAN PERTAMA INPUT PIN (Drive 1: 11U5mxsda2pUewOnUqs7p8ChCxcG8d32A) */}
        <div className="anim-phase1-photo relative mx-auto w-52 h-44 sm:w-56 sm:h-48 mb-3">
          <SakuraFloralCluster className="w-16 h-16 absolute -top-3 -left-5 z-20 anim-sakura-sway" />
          <SakuraFloralCluster className="w-16 h-16 absolute -bottom-3 -right-5 z-20 scale-[-1] anim-sakura-sway" />

          <div className="relative w-full h-full rounded-t-[95px] rounded-b-xl overflow-hidden border-2 border-[#D4AF37] shadow-[0_12px_35px_rgba(38,8,14,0.55)] bg-[#2B0910]">
            <img
              src={COVER_PIN_PHOTO}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== COVER_PIN_FALLBACK) {
                  target.src = COVER_PIN_FALLBACK;
                }
              }}
              alt="Potret Pengantin Ulfa Azizah & Dimas"
              decoding="async"
              className="w-full h-full object-cover object-[50%_45%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#26080E]/85 via-transparent to-transparent" />
            <div className="absolute bottom-2 inset-x-0 flex justify-center">
              <span className="px-3 py-0.5 rounded-full bg-[#26080E]/92 border border-[#D4AF37]/80 font-mono-code text-[10px] tracking-[0.22em] text-[#F3E5AB] font-semibold">
                14 · 02 · 2027
              </span>
            </div>
          </div>
        </div>

          {/* [1.2s - 1.6s] TEKS NAMA MEMPELAI */}
          <div className="anim-phase1-names">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold text-[#8B1C29]">
              THE WEDDING OF
            </p>

            <h1 className="font-serif-jawa text-3xl sm:text-4xl font-semibold tracking-wide mt-0.5 leading-tight text-[#2B0910]">
              {config.namaPanggilanWanita}{' '}
              <span className="text-[#8B1C29] italic font-normal">&amp;</span>{' '}
              {config.namaPanggilanPria}
            </h1>

            <p className="text-xs mt-1 font-light tracking-wide text-[#5C232C]">
              {config.tanggalTeksMasehi} · {config.namaTempat}
            </p>

            <div className="my-2.5 h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/65 to-transparent" />
          </div>

          {/* [1.5s - 1.9s] TOMBOL "BUKA SURAT UNDANGAN" */}
          {!isPinBoxVisible ? (
            <div className="space-y-3">
              <p className="anim-phase1-names text-xs leading-relaxed px-1 text-[#5C232C]">
                Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk membuka
                gerbang surat undangan pernikahan kami.
              </p>

              <div className="relative inline-block w-full anim-phase1-cta">
                <span
                  className="anim-phase1-cta-glow absolute -inset-1 rounded-xl bg-gradient-to-r from-[#D4AF37]/40 via-[#F3E5AB]/55 to-[#D4AF37]/40 blur-md pointer-events-none"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={handleOpenCoverClick}
                  className="relative w-full py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 cursor-pointer bg-gradient-to-r from-[#6E121D] via-[#8B1C29] to-[#590D16] text-[#FAF3E8] border border-[#D4AF37]/70 shadow-[0_8px_25px_rgba(139,28,41,0.45)]"
                >
                  <MailOpen className="w-4 h-4 text-[#F3E5AB]" />
                  <span>Buka Surat Undangan</span>
                </button>
              </div>
            </div>
          ) : (
            /* KOTAK INPUT PIN */
            <div className="rounded-xl p-3.5 text-left border bg-[#F2E6D4] border-[#8B1C29]/35 text-[#2B0910] animate-[archPhotoPopIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-[#8B1C29]">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[11px] uppercase tracking-[0.18em] font-semibold">
                    Masukkan PIN Undangan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinBoxVisible(false);
                    setErrorMsg('');
                  }}
                  className="text-xs flex items-center gap-1 text-[#5C232C] hover:text-[#2B0910] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Kembali
                </button>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-3">
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B1C29]" />
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    placeholder="Ketik Kode PIN Anda"
                    maxLength={12}
                    autoFocus
                    className="w-full rounded-lg outline-none py-2.5 pl-10 pr-4 text-center font-mono-code text-base tracking-[0.22em] uppercase transition-colors bg-[#FAF3E8] border border-[#8B1C29]/45 focus:border-[#8B1C29] text-[#2B0910] placeholder:text-[#6D343E]/50 placeholder:tracking-normal placeholder:font-sans"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#B71C1C] bg-[#B71C1C]/10 border border-[#B71C1C]/30 rounded-lg px-3 py-2 text-center">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingPin}
                  className="w-full py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#6E121D] via-[#8B1C29] to-[#590D16] text-[#FAF3E8] border border-[#D4AF37]/65 shadow-md disabled:opacity-60"
                >
                  <span>
                    {isVerifyingPin ? 'Memeriksa Kode PIN...' : 'Buka Gerbang Undangan'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#F3E5AB]" />
                </button>
              </form>
            </div>
          )}
      </div>
    </div>
  );
};
