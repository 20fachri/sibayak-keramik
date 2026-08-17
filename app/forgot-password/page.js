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
        <div className="wordmark">Lupa Password</div>
        <div className="tagline">Sibayak Keramik</div>
      </header>

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