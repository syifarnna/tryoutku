export function getErrorMessage(e: any): string {
  if (!e) return 'Terjadi kesalahan tidak diketahui.';
  
  if (typeof e === 'string') {
    return e === '{}' ? 'Terjadi kesalahan sistem (Objek kosong).' : e;
  }
  
  let msg = e.message || e.error_description || e.msg;
  
  if (msg === '{}' || (typeof msg === 'object' && Object.keys(msg).length === 0)) {
    msg = null;
  }
  
  if (e.name === 'AuthRetryableFetchError' || e.message === 'FetchError' || e.message === '{}') {
    return 'Terjadi masalah koneksi atau error 500 dari server Supabase. Pastikan URL Supabase valid, tidak terblokir (CORS), dan fungsi/trigger di database tidak bermasalah.';
  }
  
  if (!msg) {
    if (e.code) {
      return `Kesalahan sistem (Kode: ${e.code}). Pastikan fungsi/tabel Supabase sudah ada.`;
    }
    return 'Terjadi kesalahan pada server. Coba lagi atau periksa konfigurasi Supabase Anda.';
  }
  
  return msg;
}
