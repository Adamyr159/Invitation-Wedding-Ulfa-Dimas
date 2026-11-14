// "Jalaraning Tresna" — Woro Endah Wedding Music Player
// Langsung memutar lagu MP3 "Jalaraning Tresna" begitu PIN berhasil dibuka
// tanpa suara synthesizer/backsound buatan di awal.

export const JALARANING_TRESNA_LOCAL_URL = '/audio/jalaraning_tresna.mp3';

export const JALARANING_TRESNA_VERCEL_URL =
  'https://invitation-wedding-ulfa-dimas-blush.vercel.app/audio/jalaraning_tresna.mp3';

const AUDIO_SOURCES = [
  JALARANING_TRESNA_LOCAL_URL,
  JALARANING_TRESNA_VERCEL_URL,
];

class WeddingMusicController {
  private audioEl: HTMLAudioElement | null = null;
  private isPlaying = false;
  private sourceIndex = 0;

  public preload() {
    if (typeof window === 'undefined') return;
    if (this.audioEl) return;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.78;
    audio.src = AUDIO_SOURCES[this.sourceIndex];

    audio.onerror = () => {
      if (this.sourceIndex < AUDIO_SOURCES.length - 1) {
        this.sourceIndex += 1;
        audio.src = AUDIO_SOURCES[this.sourceIndex];
        audio.load();
        if (this.isPlaying) {
          audio.play().catch(() => {});
        }
      }
    };

    audio.load();
    this.audioEl = audio;
  }

  /**
   * Dipanggil saat tamu klik "Buka Surat Undangan" (sebelum mengetik PIN)
   * agar browser sudah mem-buffer penuh file MP3 dan membuka izin audio lebih awal.
   */
  public primeOnUserGesture() {
    this.preload();
    if (!this.audioEl || this.isPlaying) return;

    // Pastikan browser mulai mengunduh buffer penuh
    if (this.audioEl.readyState < 2) {
      this.audioEl.load();
    }
  }

  /**
   * Langsung memutar lagu "Jalaraning Tresna - Woro Endah" seketika saat PIN berhasil diverifikasi.
   */
  public start() {
    this.preload();
    if (!this.audioEl) return;

    this.isPlaying = true;
    this.audioEl.volume = 0.78;
    this.audioEl.play().catch(() => {
      // Jika source pertama gagal, otomatis pindah ke URL berikutnya
      if (this.audioEl && this.sourceIndex < AUDIO_SOURCES.length - 1) {
        this.sourceIndex += 1;
        this.audioEl.src = AUDIO_SOURCES[this.sourceIndex];
        this.audioEl.play().catch(() => {});
      }
    });
  }
}

export const weddingMusic = new WeddingMusicController();
