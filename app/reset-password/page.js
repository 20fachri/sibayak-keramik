'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setPesan('');
    if (password !== konfirmasi) {
      setPesan('Password dan konfirmasi tidak sama.');
      return;
    }
    if (password.length < 6) {
      setPesan('Password minimal 6 karakter.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setPesan('Gagal mengubah password: ' + error.message);
      return;
    }
    setPesan('Password berhasil diubah. Mengalihkan ke halaman login...');
    setTimeout(() => router.push('/login'), 1500);
  }

  return (
    <div className="container">
      <header className="site-header">
        <div className="wordmark">Buat Password Baru</div>
        <div className="tagline">Sibayak Keramik</div>
      </header>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="password"
          placeholder="Password baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Ulangi password baru"
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          required
        />
        {pesan && <div className="scaffold-note">{pesan}</div>}
        <button type="submit" className="btn-pesan" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>
    </div>
  );
}