// "A Thousand Years" — Christina Perri Wedding Music Player
// Langsung memutar lagu MP3 "A Thousand Years" begitu PIN berhasil dibuka
// tanpa suara synthesizer/backsound buatan di awal.

export const THOUSAND_YEARS_LOCAL_URL = '/audio/a_thousand_years.mp3';

export const THOUSAND_YEARS_PRIMARY_URL =
  'https://archive.org/download/christina-perri-a-thousand-years_20260624/Christina%20Perri%20-%20A%20Thousand%20Years.mp3';

export const THOUSAND_YEARS_BACKUP_URL =
  'https://archive.org/download/athousandyearschristinaperri_202003/A%20Thousand%20Years%20-%20Christina%20Perri.mp3';

const AUDIO_SOURCES = [
  THOUSAND_YEARS_LOCAL_URL,
  THOUSAND_YEARS_PRIMARY_URL,
  THOUSAND_YEARS_BACKUP_URL,
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
   * Langsung memutar lagu "A Thousand Years" seketika saat PIN berhasil diverifikasi.
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
