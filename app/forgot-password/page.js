'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setPesan('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setPesan('Gagal mengirim email: ' + error.message);
      return;
    }
    setPesan('Link reset password sudah dikirim ke email kamu. Cek inbox (atau folder spam).');
  }

  return (
    <div className="container">
      <header className="site-header">
        <a href="/" className="brand-link">
          <img src="/logo.png" alt="Logo Sibayak Keramik" className="site-logo" />
          <div>
            <div className="wordmark">Sibayak Keramik</div>
            <div className="tagline">Keramik &amp; Ubin Bahan Bangunan</div>
          </div>
        </a>
      </header>
      <h1 className="page-title">Lupa Password</h1>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {pesan && <div className="scaffold-note">{pesan}</div>}
        <button type="submit" className="btn-pesan" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim Link Reset'}
        </button>
      </form>
    </div>
  );
}